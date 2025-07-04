import { query } from "./_generated/server";
import { v } from "convex/values";
import { mutation } from "./_generated/server";
import { Id } from "./_generated/dataModel";
import { internal } from "./_generated/api";

// Search through people nearby
export const searchPeopleNearby = query({
  args: {
    searchTerm: v.string(),
    latitude: v.number(),
    longitude: v.number(),
    maxDistance: v.optional(v.number()), // in kilometers
  },
  returns: v.array(
    v.object({
      _id: v.id("users"),
      name: v.string(),
      profilePic: v.optional(v.string()),
      distance: v.number(),
      isHosting: v.optional(v.boolean()),
      bio: v.optional(v.string()),
      tags: v.optional(v.array(v.string())),
    })
  ),
  handler: async (ctx, args) => {
    const maxDist = args.maxDistance ?? 50; // Default to 50km

    // Get users within the specified radius who match the search term
    const users = await ctx.db
      .query("users")
      .withSearchIndex("search_bio", (q: any) =>
        q.search("bio", args.searchTerm)
      )
      .collect();

    // Calculate distances and sort results
    return users
      .map((user) => {
        const distance = calculateDistance(
          args.latitude,
          args.longitude,
          user.location[0],
          user.location[1]
        );

        if (distance > maxDist) return null;

        return {
          _id: user._id,
          name: user.name,
          profilePic: user.imageUrl,
          distance,
          isHosting: user.isHosting,
          bio: user.bio,
          tags: user.tags,
        };
      })
      .filter((user): user is NonNullable<typeof user> => user !== null)
      .sort((a, b) => a.distance - b.distance);
  },
});

// Search through conversations
export const searchConversations = query({
  args: {
    searchTerm: v.string(),
    userId: v.id("users"),
  },
  returns: v.array(
    v.object({
      _id: v.id("messages"),
      conversationId: v.id("conversations"),
      content: v.string(),
      timestamp: v.number(),
      sender: v.object({
        _id: v.id("users"),
        name: v.string(),
        profilePic: v.optional(v.string()),
      }),
      preview: v.string(),
    })
  ),
  handler: async (ctx, args) => {
    // Get all conversations the user is part of
    const userConversations = await ctx.db
      .query("conversations")
      .withIndex("by_participant", (q: any) =>
        q.eq("participants", [args.userId])
      )
      .collect();

    // Search for messages in these conversations
    const results = [];
    for (const conversation of userConversations) {
      const messages = await ctx.db
        .query("messages")
        .withSearchIndex("search_content", (q: any) =>
          q.search("content", args.searchTerm)
        )
        .filter((q: any) => q.eq("conversationId", conversation._id))
        .take(5); // Take 5 most recent matches per conversation

      for (const message of messages) {
        const sender = await ctx.db.get(message.senderId);
        if (!sender) continue;

        results.push({
          _id: message._id,
          conversationId: conversation._id,
          content: message.content,
          timestamp: message._creationTime,
          sender: {
            _id: sender._id,
            name: sender.name,
            profilePic: sender.imageUrl,
          },
          preview: generateMessagePreview(message.content, args.searchTerm),
        });
      }
    }

    return results.sort((a, b) => b.timestamp - a.timestamp);
  },
});

// Helper function to calculate distance between two points
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

// Helper function to generate a preview of the message with search term highlighted
function generateMessagePreview(content: string, searchTerm: string): string {
  const lowerContent = content.toLowerCase();
  const lowerSearchTerm = searchTerm.toLowerCase();
  const index = lowerContent.indexOf(lowerSearchTerm);
  if (index === -1) return content.slice(0, 100) + "...";

  const start = Math.max(0, index - 50);
  const end = Math.min(content.length, index + 50);
  return (
    (start > 0 ? "..." : "") +
    content.slice(start, end) +
    (end < content.length ? "..." : "")
  );
}

export const searchUsers = query({
  args: {
    searchTerm: v.string(),
  },
  handler: async (ctx, args) => {
    const users = await ctx.db
      .query("users")
      .withSearchIndex("search_bio", (q: any) =>
        q.search("bio", args.searchTerm)
      )
      .collect();

    return users.map((user) => ({
      _id: user._id,
      name: user.name,
      bio: user.bio,
      imageUrl: user.imageUrl,
    }));
  },
});

export const searchMessages = query({
  args: {
    searchTerm: v.string(),
    conversationId: v.id("conversations"),
  },
  handler: async (ctx, args) => {
    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) {
      throw new Error("Conversation not found");
    }

    const messages = await ctx.db
      .query("messages")
      .withSearchIndex("search_content", (q: any) =>
        q.search("content", args.searchTerm)
      )
      .filter((q: any) => q.eq("conversationId", args.conversationId))
      .collect();

    return messages;
  },
});
