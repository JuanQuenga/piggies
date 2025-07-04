import { v } from "convex/values";
import {
  query,
  mutation,
  internalMutation,
  internalQuery,
} from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";
import { internal } from "./_generated/api";
import { paginationOptsValidator } from "convex/server";
import { ConvexError } from "convex/values";
import { DataModel } from "./_generated/dataModel";
import { IndexRangeBuilder, QueryBuilder } from "convex/server";

// Remove duplicate QueryBuilder interface since it's already defined in convex/server
type MessageDoc = Doc<"messages">;
type ConversationDoc = Doc<"conversations">;
type UserDoc = Doc<"users">;
type ProfileDoc = Doc<"profiles">;

// TEMP: Mock userId for development. Replace with Clerk integration in production.
const MOCK_USER_ID = "mock_user_id" as Id<"users">;

// Temporary authentication function - will be replaced with proper Clerk integration
async function getAuthenticatedUserId(ctx: any): Promise<Id<"users"> | null> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    return null;
  }

  const email = identity.email;
  if (!email) {
    return null;
  }

  const user = await ctx.db
    .query("users")
    .withIndex("by_email", (q) => q.eq("email", email))
    .unique();

  return user ? user._id : null;
}

export const getOrCreateConversation = internalMutation({
  args: {
    participantOneId: v.id("users"),
    participantTwoId: v.id("users"),
  },
  handler: async (
    ctx,
    { participantOneId, participantTwoId }
  ): Promise<Id<"conversations">> => {
    if (participantOneId === participantTwoId) {
      throw new Error("Cannot create a conversation with oneself.");
    }
    const sortedParticipantIds = [participantOneId, participantTwoId].sort();
    const existingConversation = await ctx.db
      .query("conversations")
      .withIndex("by_participant_time", (q) =>
        q.eq("participantSet", sortedParticipantIds)
      )
      .unique();
    if (existingConversation) {
      return existingConversation._id;
    }
    const conversationId: Id<"conversations"> = await ctx.db.insert(
      "conversations",
      {
        participants: sortedParticipantIds,
        participantSet: sortedParticipantIds,
        lastMessageTime: Date.now(),
      }
    );
    return conversationId;
  },
});

export const getOrCreateConversationWithParticipant = mutation({
  args: {
    otherParticipantUserId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const currentUserId = await getAuthenticatedUserId(ctx);
    if (!currentUserId) {
      throw new Error("User not authenticated");
    }
    if (currentUserId === args.otherParticipantUserId) {
      throw new Error("Cannot start a conversation with oneself.");
    }

    const conversationId: Id<"conversations"> = await ctx.runMutation(
      internal.messages.getOrCreateConversation,
      {
        participantOneId: currentUserId,
        participantTwoId: args.otherParticipantUserId,
      }
    );

    const otherUserAuth = await ctx.db.get(args.otherParticipantUserId);
    const otherUserProfile = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) =>
        q.eq("userId", args.otherParticipantUserId)
      )
      .unique();

    let otherUserAvatarFinalUrl: string | null = null;
    if (otherUserProfile?.avatarUrl) {
      try {
        otherUserAvatarFinalUrl = await ctx.storage.getUrl(
          otherUserProfile.avatarUrl as Id<"_storage">
        );
      } catch (e) {
        console.error(
          `Failed to get URL for other user avatar storageId ${otherUserProfile.avatarUrl}`,
          e
        );
      }
    } else if (otherUserAuth?.imageUrl) {
      otherUserAvatarFinalUrl = otherUserAuth.imageUrl;
    }

    return {
      conversationId,
      otherParticipant: {
        _id: args.otherParticipantUserId,
        displayName:
          otherUserProfile?.displayName ??
          otherUserAuth?.name ??
          "Unknown User",
        avatarUrl: otherUserAvatarFinalUrl,
      },
    };
  },
});

export const sendMessage = mutation({
  args: {
    receiverId: v.id("users"),
    content: v.string(),
    format: v.union(v.literal("text"), v.literal("image"), v.literal("video")),
  },
  handler: async (ctx, args): Promise<Id<"messages">> => {
    const senderId = await getAuthenticatedUserId(ctx);
    if (!senderId) {
      throw new Error("User not authenticated");
    }
    if (senderId === args.receiverId) {
      throw new Error("Cannot send a message to oneself in this context.");
    }

    const conversationId: Id<"conversations"> = await ctx.runMutation(
      internal.messages.getOrCreateConversation,
      {
        participantOneId: senderId,
        participantTwoId: args.receiverId,
      }
    );

    const messageId: Id<"messages"> = await ctx.db.insert("messages", {
      conversationId,
      senderId,
      content: args.content,
      format: args.format,
    });

    await ctx.db.patch(conversationId, { lastMessageId: messageId });
    return messageId;
  },
});

export const generateMessageAttachmentUploadUrl = mutation({
  args: {},
  handler: async (ctx): Promise<string> => {
    const userId = await getAuthenticatedUserId(ctx);
    if (!userId) {
      throw new Error("User not authenticated");
    }
    return await ctx.storage.generateUploadUrl();
  },
});

export const listMessages = query({
  args: {
    conversationId: v.id("conversations"),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    const userId = await getAuthenticatedUserId(ctx);
    if (!userId) {
      throw new Error("User not authenticated");
    }

    const result = await ctx.db
      .query("messages")
      .withIndex("by_conversation", (q) =>
        q.eq("conversationId", args.conversationId)
      )
      .order("desc")
      .paginate(args.paginationOpts);

    const messagesWithAuthorsAndUrls = await Promise.all(
      result.page.map(async (message) => {
        const authorProfile = await ctx.db
          .query("profiles")
          .withIndex("by_userId", (q) => q.eq("userId", message.senderId))
          .unique();

        const authorUser = await ctx.db.get(message.senderId);

        let attachmentUrl: string | null = null;
        if (message.format === "image" || message.format === "video") {
          if (message.storageId) {
            try {
              attachmentUrl = await ctx.storage.getUrl(message.storageId);
            } catch (e) {
              console.error(
                `Failed to get URL for storageId ${message.storageId}`,
                e
              );
              attachmentUrl = null;
            }
          }
        }

        let authorAvatarFinalUrl: string | null = null;
        if (authorProfile?.avatarUrl) {
          authorAvatarFinalUrl = authorProfile.avatarUrl;
        } else if (authorUser?.imageUrl) {
          authorAvatarFinalUrl = authorUser.imageUrl;
        }

        const messageAuthor = {
          _id: message.senderId,
          name:
            authorProfile?.displayName ?? authorUser?.name ?? "Unknown User",
          avatarUrl: authorAvatarFinalUrl,
        };

        return {
          ...message,
          author: messageAuthor,
          attachmentUrl,
        };
      })
    );

    return {
      ...result,
      page: messagesWithAuthorsAndUrls,
    };
  },
});

export const listConversations = query({
  args: { paginationOpts: paginationOptsValidator },
  handler: async (ctx, args) => {
    const userId = await getAuthenticatedUserId(ctx);
    if (!userId) {
      throw new Error("User not authenticated");
    }
    console.log("Fetching conversations for user:", userId);

    // Query conversations using the new index
    const result = await ctx.db
      .query("conversations")
      .withIndex(
        "by_participant_time",
        (q: QueryBuilder<"conversations", "by_participant_time">) =>
          q.eq("participantSet", [userId])
      )
      .order("desc")
      .paginate(args.paginationOpts);

    const conversationsWithDetails = await Promise.all(
      result.page.map(async (conv) => {
        const otherParticipantId = conv.participants.find(
          (id) => id !== userId
        )!;
        console.log("Processing conversation with:", otherParticipantId);

        // Get other participant's profile and auth info
        const otherUserProfile = await ctx.db
          .query("profiles")
          .withIndex("by_userId", (q) => q.eq("userId", otherParticipantId))
          .unique();
        const otherUserAuth = await ctx.db.get(otherParticipantId);

        let lastMessage = null;
        if (conv.lastMessageId) {
          lastMessage = await ctx.db.get(conv.lastMessageId);
        }

        let avatarUrl = null;
        if (otherUserProfile?.avatarUrl) {
          try {
            avatarUrl = await ctx.storage.getUrl(
              otherUserProfile.avatarUrl as Id<"_storage">
            );
          } catch (e) {
            console.error(
              `Failed to get URL for avatar storageId ${otherUserProfile.avatarUrl}`,
              e
            );
          }
        } else if (otherUserAuth?.imageUrl) {
          avatarUrl = otherUserAuth.imageUrl;
        }

        return {
          _id: conv._id,
          participants: conv.participants,
          otherParticipant: {
            _id: otherParticipantId,
            displayName:
              otherUserProfile?.displayName ??
              otherUserAuth?.name ??
              "Unknown User",
            avatarUrl,
          },
          lastMessageSnippet: lastMessage?.content ?? null,
          lastMessageFormat: lastMessage?.format ?? "text",
          lastMessageTimestamp: conv.lastMessageTime,
        };
      })
    );

    console.log(
      "Returning conversations with details:",
      conversationsWithDetails.length
    );
    return {
      isDone: result.isDone,
      continueCursor: result.continueCursor,
      page: conversationsWithDetails,
    };
  },
});

export const getConversationDetails = query({
  args: {
    conversationId: v.id("conversations"),
  },
  handler: async (ctx, args) => {
    const currentUserId = await getAuthenticatedUserId(ctx);
    if (!currentUserId) {
      throw new Error("User not authenticated");
    }

    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) {
      throw new Error("Conversation not found");
    }

    // Make sure the current user is a participant
    if (!conversation.participants.includes(currentUserId)) {
      throw new Error("User is not a participant in this conversation");
    }

    // Get the other participant's ID
    const otherParticipantId = conversation.participants.find(
      (id: Id<"users">) => id !== currentUserId
    );
    if (!otherParticipantId) {
      throw new Error("Other participant not found");
    }

    // Get the other participant's profile and auth info
    const otherUserProfile = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", otherParticipantId))
      .unique();
    const otherUserAuth = await ctx.db.get(otherParticipantId);

    let otherUserAvatarFinalUrl: string | null = null;
    if (otherUserProfile?.avatarUrl) {
      otherUserAvatarFinalUrl = otherUserProfile.avatarUrl;
    } else if (otherUserAuth?.imageUrl) {
      otherUserAvatarFinalUrl = otherUserAuth.imageUrl;
    }

    return {
      conversationId: args.conversationId,
      otherParticipant: {
        _id: otherParticipantId,
        displayName:
          otherUserProfile?.displayName ??
          otherUserAuth?.name ??
          "Unknown User",
        avatarUrl: otherUserAvatarFinalUrl,
      },
    };
  },
});
