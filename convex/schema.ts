import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  profiles: defineTable({
    userId: v.id("users"),
    displayName: v.optional(v.string()),
    description: v.optional(v.string()),
    latitude: v.optional(v.number()),
    longitude: v.optional(v.number()),
    status: v.optional(v.string()),
    isVisible: v.boolean(),
    lastSeen: v.optional(v.number()),
    avatarUrl: v.optional(v.string()), // Convex storage ID for the avatar
  })
    .index("by_userId", ["userId"])
    .index("by_visibility_and_lastSeen", ["isVisible", "lastSeen"]),

  conversations: defineTable({
    participantIds: v.array(v.id("users")),
    lastMessageId: v.optional(v.id("messages")),
  }).index("by_participantIds", ["participantIds"]),

  messages: defineTable({
    conversationId: v.id("conversations"),
    authorId: v.id("users"),
    body: v.string(), 
    format: v.union(
      v.literal("text"),
      v.literal("image"),
      v.literal("video")
    ),
  })
    // Corrected index: _creationTime is implicitly handled by Convex
    .index("by_conversationId", ["conversationId"]), 
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
