import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const applicationTables = {
  users: defineTable({
    email: v.string(),
    name: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
  }).index("by_email", ["email"]),

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

    // Photo gallery
    photos: v.optional(v.array(v.string())), // Up to 5 Convex storage IDs
    mainPhotoIndex: v.optional(v.number()), // Index in the photos array

    // Home location
    homeLocation: v.optional(v.string()),

    // Stats
    age: v.optional(v.number()),
    heightInCm: v.optional(v.number()),
    weightInKg: v.optional(v.number()),
    endowment: v.optional(v.string()),
    bodyType: v.optional(v.string()),

    // Identity
    gender: v.optional(v.string()),
    expression: v.optional(v.string()),
    sexuality: v.optional(v.string()),
    position: v.optional(v.string()),

    // Scene
    location: v.optional(v.string()),
    intoPublic: v.optional(v.string()),
    lookingFor: v.optional(v.string()),
    fetishes: v.optional(v.array(v.string())),
    kinks: v.optional(v.array(v.string())),
    into: v.optional(v.array(v.string())),
    interaction: v.optional(v.string()),

    // Health & Preferences
    practices: v.optional(v.array(v.string())),
    hivStatus: v.optional(v.string()),
    hivTestedDate: v.optional(v.number()), // timestamp
    stiTestedDate: v.optional(v.number()), // timestamp
    safeguards: v.optional(v.array(v.string())),
    comfortLevels: v.optional(v.array(v.string())),
    carrying: v.optional(v.array(v.string())),

    // Hosting status
    hostingStatus: v.optional(v.string()),

    // Visibility toggles for each section
    showStats: v.optional(v.boolean()),
    showIdentity: v.optional(v.boolean()),
    showScene: v.optional(v.boolean()),
    showHealth: v.optional(v.boolean()),
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
    format: v.union(v.literal("text"), v.literal("image"), v.literal("video")),
  })
    // Corrected index: _creationTime is implicitly handled by Convex
    .index("by_conversationId", ["conversationId"]),
};

export default defineSchema({
  ...applicationTables,
});
