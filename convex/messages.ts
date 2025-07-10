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

// TEMP: Mock userId for development. Replace with WorkOS AuthKit integration in production.
const MOCK_USER_ID = "mock_user_id" as Id<"users">;

// Temporary authentication function - will be replaced with proper WorkOS AuthKit integration
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
    .withIndex("by_email", (q: any) => q.eq("email", email))
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
      .withIndex("by_participant_time", (q: any) =>
        q.eq("participantSet", sortedParticipantIds)
      )
      .unique();
    if (existingConversation) {
      return existingConversation._id;
    }
    const conversationId: Id<"conversations"> = await ctx.db.insert(
      "conversations",
      {
        participantIds: sortedParticipantIds,
        participantSet: sortedParticipantIds,
        lastMessageTime: Date.now(),
      }
    );
    return conversationId;
  },
});

export const getOrCreateConversationWithParticipant = mutation({
  args: {
    currentUserId: v.id("users"),
    otherParticipantUserId: v.id("users"),
  },
  handler: async (ctx, args) => {
    if (args.currentUserId === args.otherParticipantUserId) {
      throw new Error("Cannot start a conversation with oneself.");
    }

    const conversationId: Id<"conversations"> = await ctx.runMutation(
      internal.messages.getOrCreateConversation,
      {
        participantOneId: args.currentUserId,
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
    senderId: v.id("users"),
    receiverId: v.id("users"),
    content: v.string(),
    format: v.union(v.literal("text"), v.literal("image"), v.literal("video")),
    storageId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args): Promise<Id<"messages">> => {
    if (args.senderId === args.receiverId) {
      throw new Error("Cannot send a message to oneself in this context.");
    }

    const conversationId: Id<"conversations"> = await ctx.runMutation(
      internal.messages.getOrCreateConversation,
      {
        participantOneId: args.senderId,
        participantTwoId: args.receiverId,
      }
    );

    const messageDoc: any = {
      conversationId,
      senderId: args.senderId,
      content: args.content,
      format: args.format,
    };
    if (args.format === "image" && args.storageId) {
      messageDoc.storageId = args.storageId;
    }

    const messageId: Id<"messages"> = await ctx.db.insert(
      "messages",
      messageDoc
    );

    await ctx.db.patch(conversationId, { lastMessageId: messageId });
    return messageId;
  },
});

export const generateMessageAttachmentUploadUrl = mutation({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args): Promise<string> => {
    return await ctx.storage.generateUploadUrl();
  },
});

export const listMessages = query({
  args: {
    conversationId: v.id("conversations"),
    currentUserId: v.id("users"),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    const result = await ctx.db
      .query("messages")
      .withIndex("by_conversation", (q: any) =>
        q.eq("conversationId", args.conversationId)
      )
      .order("desc")
      .paginate(args.paginationOpts);

    const messagesWithAuthorsAndUrls = await Promise.all(
      result.page.map(async (message) => {
        const authorProfile = await ctx.db
          .query("profiles")
          .withIndex("by_userId", (q: any) => q.eq("userId", message.senderId))
          .unique();

        let authorUser = null;
        if (message.senderId) {
          authorUser = await ctx.db.get(message.senderId);
        }

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
  args: {
    currentUserId: v.id("users"),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    console.log("listConversations called for user:", args.currentUserId);

    try {
      // Get all conversations and filter by participant
      const allConversations = await ctx.db
        .query("conversations")
        .order("desc")
        .collect();

      // Filter conversations where the current user is a participant
      const userConversations = allConversations.filter((conversation) =>
        conversation.participantIds.includes(args.currentUserId)
      );

      // Apply pagination manually
      const startIndex = 0;
      const endIndex = args.paginationOpts.numItems;
      const paginatedConversations = userConversations.slice(
        startIndex,
        endIndex
      );

      // For each conversation, get the other participant's details
      const conversationsWithParticipants = await Promise.all(
        paginatedConversations.map(async (conversation) => {
          // Find the other participant (not the current user)
          const otherParticipantId = conversation.participantIds.find(
            (id) => id !== args.currentUserId
          );

          if (!otherParticipantId) {
            return null;
          }

          // Get the other participant's user details
          const otherUser = await ctx.db.get(otherParticipantId);
          if (!otherUser) {
            return null;
          }

          // Get the other participant's profile
          const otherProfile = await ctx.db
            .query("profiles")
            .withIndex("by_userId", (q) => q.eq("userId", otherParticipantId))
            .unique();

          return {
            _id: conversation._id,
            _creationTime: conversation._creationTime,
            lastMessage: null, // Simplified for now
            otherParticipant: {
              _id: otherParticipantId,
              displayName:
                otherProfile?.displayName ?? otherUser.name ?? "Unknown User",
              avatarUrl: otherProfile?.avatarUrl ?? otherUser.imageUrl ?? null,
            },
          };
        })
      );

      const validConversations = conversationsWithParticipants.filter(
        (conv): conv is NonNullable<typeof conv> => conv !== null
      );

      return {
        isDone: endIndex >= userConversations.length,
        continueCursor:
          endIndex < userConversations.length ? endIndex.toString() : "",
        page: validConversations,
      };
    } catch (error) {
      console.error("Error in listConversations:", error);
      throw error;
    }
  },
});

// Get conversation details
export const getConversationDetails = query({
  args: {
    conversationId: v.id("conversations"),
  },
  handler: async (ctx, { conversationId }) => {
    const conversation = await ctx.db.get(conversationId);
    if (!conversation) {
      return null;
    }

    // Get the last message
    let lastMessage = null;
    if (conversation.lastMessageId) {
      const message = await ctx.db.get(conversation.lastMessageId);
      if (message) {
        // Get the sender ID, preferring senderId over authorId
        let authorName = "Unknown";
        if (message.senderId && typeof message.senderId === "string") {
          const authorUser = await ctx.db.get(message.senderId as Id<"users">);
          if (authorUser) {
            authorName = authorUser.name;
          }
        } else if (message.authorId && typeof message.authorId === "string") {
          const authorUser = await ctx.db.get(message.authorId as Id<"users">);
          if (authorUser) {
            authorName = authorUser.name;
          }
        }

        lastMessage = {
          ...message,
          authorName,
        };
      }
    }

    // Get participant details
    const participants = await Promise.all(
      conversation.participantIds.map(async (participantId) => {
        const user = await ctx.db.get(participantId);
        if (!user) return null;

        const profile = await ctx.db
          .query("profiles")
          .withIndex("by_userId", (q) => q.eq("userId", participantId))
          .unique();

        return {
          userId: participantId,
          name: user.name,
          email: user.email,
          imageUrl: user.imageUrl,
          profile,
        };
      })
    );

    return {
      ...conversation,
      lastMessage,
      participants: participants.filter(
        (p): p is NonNullable<typeof p> => p !== null
      ),
    };
  },
});

export const markMessagesRead = mutation({
  args: {
    conversationId: v.id("conversations"),
    userId: v.id("users"),
  },
  handler: async (ctx, { conversationId, userId }) => {
    // Get all messages in the conversation
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_conversation", (q) =>
        q.eq("conversationId", conversationId)
      )
      .collect();

    let updatedCount = 0;
    for (const message of messages) {
      if (!message.readBy || !message.readBy.includes(userId)) {
        await ctx.db.patch(message._id, {
          readBy: [...(message.readBy || []), userId],
        });
        updatedCount++;
      }
    }
    return { updated: updatedCount };
  },
});
