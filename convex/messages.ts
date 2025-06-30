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

// TEMP: Mock userId for development. Replace with Clerk integration in production.
const MOCK_USER_ID = "mock_user_id" as Id<"users">;

// Temporary authentication function - will be replaced with proper Clerk integration
async function getAuthenticatedUserId(
  ctx:
    | { db: any; auth: any; storage: any }
    | { db: any; auth: any; storage?: any }
): Promise<Id<"users"> | null> {
  // For now, return null until we set up proper Clerk integration
  // This will be replaced with proper user authentication
  return null;
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
      .withIndex("by_participantIds", (q) =>
        q.eq("participantIds", sortedParticipantIds)
      )
      .unique();
    if (existingConversation) {
      return existingConversation._id;
    }
    const conversationId: Id<"conversations"> = await ctx.db.insert(
      "conversations",
      {
        participantIds: sortedParticipantIds,
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
    body: v.string(),
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
      authorId: senderId,
      body: args.body,
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
      .withIndex("by_conversationId", (q) =>
        q.eq("conversationId", args.conversationId)
      )
      .order("desc")
      .paginate(args.paginationOpts);

    const messagesWithAuthorsAndUrls = await Promise.all(
      result.page.map(async (message) => {
        const authorProfile = await ctx.db
          .query("profiles")
          .withIndex("by_userId", (q) => q.eq("userId", message.authorId))
          .unique();

        const authorUser = await ctx.db.get(message.authorId);

        let attachmentUrl: string | null = null;
        if (message.format === "image" || message.format === "video") {
          if (message.body) {
            try {
              attachmentUrl = await ctx.storage.getUrl(
                message.body as Id<"_storage">
              );
            } catch (e) {
              console.error(
                `Failed to get URL for storageId ${message.body}`,
                e
              );
              attachmentUrl = null;
            }
          }
        }

        let authorAvatarFinalUrl: string | null = null;
        if (authorProfile?.avatarUrl) {
          try {
            authorAvatarFinalUrl = await ctx.storage.getUrl(
              authorProfile.avatarUrl as Id<"_storage">
            );
          } catch (e) {
            console.error(
              `Failed to get URL for avatar storageId ${authorProfile.avatarUrl}`,
              e
            );
          }
        } else if (authorUser?.imageUrl) {
          authorAvatarFinalUrl = authorUser.imageUrl;
        }

        return {
          ...message,
          author: {
            _id: message.authorId,
            displayName:
              authorProfile?.displayName ?? authorUser?.name ?? "Unknown User",
            avatarUrl: authorAvatarFinalUrl,
          },
          attachmentUrl: attachmentUrl,
        };
      })
    );
    return {
      page: messagesWithAuthorsAndUrls,
      isDone: result.isDone,
      continueCursor: result.continueCursor,
    };
  },
});

export const listConversations = query({
  args: { paginationOpts: paginationOptsValidator },
  handler: async (ctx, args) => {
    const userId = MOCK_USER_ID;

    const allConversations = await ctx.db.query("conversations").collect();
    const userConversations = allConversations.filter((conv) =>
      conv.participantIds.includes(userId)
    );

    const conversationsWithDetails = await Promise.all(
      userConversations.map(async (conv) => {
        const otherParticipantId = conv.participantIds.find(
          (id) => id !== userId
        )!;
        const otherUserProfile = await ctx.db
          .query("profiles")
          .withIndex("by_userId", (q) => q.eq("userId", otherParticipantId))
          .unique();
        const otherUserAuth = await ctx.db.get(otherParticipantId);

        let lastMessageSnippet: string | null = null;
        let lastMessageTimestamp: number | null = null;
        let lastMessageFormat: string | null = null;

        if (conv.lastMessageId) {
          const lastMessage = await ctx.db.get(conv.lastMessageId);
          if (lastMessage) {
            lastMessageTimestamp = lastMessage._creationTime;
            lastMessageFormat = lastMessage.format;
            if (lastMessage.format === "text") {
              lastMessageSnippet =
                lastMessage.body.substring(0, 30) +
                (lastMessage.body.length > 30 ? "..." : "");
            } else if (lastMessage.format === "image") {
              lastMessageSnippet = "📷 Image";
            } else if (lastMessage.format === "video") {
              lastMessageSnippet = "📹 Video";
            }
          }
        }

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
          _id: conv._id,
          participantIds: conv.participantIds,
          otherParticipant: {
            _id: otherParticipantId,
            displayName:
              otherUserProfile?.displayName ??
              otherUserAuth?.name ??
              "Unknown User",
            avatarUrl: otherUserAvatarFinalUrl,
          },
          lastMessageSnippet,
          lastMessageTimestamp,
          lastMessageFormat,
        };
      })
    );

    conversationsWithDetails.sort((a, b) => {
      if (b.lastMessageTimestamp === null) return -1;
      if (a.lastMessageTimestamp === null) return 1;
      return b.lastMessageTimestamp - a.lastMessageTimestamp;
    });

    const { numItems, cursor: startCursorStr } = args.paginationOpts;
    const startIndex = startCursorStr ? parseInt(startCursorStr) : 0;

    const page = conversationsWithDetails.slice(
      startIndex,
      startIndex + numItems
    );
    const newCursor =
      startIndex + page.length < conversationsWithDetails.length
        ? (startIndex + page.length).toString()
        : null;

    return {
      page,
      isDone: newCursor === null,
      continueCursor: newCursor ?? "",
    };
  },
});
