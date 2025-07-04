import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const applicationTables = {
  users: defineTable({
    name: v.string(),
    email: v.string(),
    imageUrl: v.optional(v.string()),
    bio: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    isHosting: v.optional(v.boolean()),
    lastActive: v.optional(v.number()),
    displayName: v.optional(v.string()),
    location: v.array(v.number()),
  })
    .index("by_email", ["email"])
    .searchIndex("search_bio", {
      searchField: "bio",
    }),

  profiles: defineTable({
    userId: v.id("users"),
    displayName: v.optional(v.string()),
    description: v.optional(v.string()),
    latitude: v.optional(v.number()),
    longitude: v.optional(v.number()),
    status: v.optional(v.string()),
    isVisible: v.boolean(),
    lastSeen: v.optional(v.number()),
    avatarUrl: v.optional(v.string()),
    photos: v.optional(v.array(v.string())),
    mainPhotoIndex: v.optional(v.number()),
    homeLocation: v.optional(v.string()),
    // Stats
    age: v.optional(v.number()),
    isAgeVisible: v.optional(v.boolean()),
    heightInInches: v.optional(v.number()), // Stored in inches, converted to cm for metric users
    isHeightVisible: v.optional(v.boolean()),
    weightInLbs: v.optional(v.number()), // Stored in lbs, converted to kg for metric users
    isWeightVisible: v.optional(v.boolean()),
    endowmentLength: v.optional(v.number()), // Stored in inches, converted to cm for metric users
    endowmentCut: v.optional(v.string()), // "Cut" or "Uncut"
    isEndowmentVisible: v.optional(v.boolean()),
    bodyType: v.optional(v.string()),
    isBodyTypeVisible: v.optional(v.boolean()),
    gender: v.optional(v.string()),
    expression: v.optional(v.string()),
    sexuality: v.optional(v.string()),
    position: v.optional(v.string()),
    location: v.optional(v.string()),
    intoPublic: v.optional(v.string()),
    lookingFor: v.optional(v.string()),
    fetishes: v.optional(v.array(v.string())),
    kinks: v.optional(v.array(v.string())),
    into: v.optional(v.array(v.string())),
    interaction: v.optional(v.string()),
    practices: v.optional(v.array(v.string())),
    hivStatus: v.optional(v.string()),
    hivTestedDate: v.optional(v.number()),
    stiTestedDate: v.optional(v.number()),
    safeguards: v.optional(v.array(v.string())),
    comfortLevels: v.optional(v.array(v.string())),
    carrying: v.optional(v.array(v.string())),
    hostingStatus: v.optional(v.string()),
    showStats: v.optional(v.boolean()),
    showIdentity: v.optional(v.boolean()),
    showScene: v.optional(v.boolean()),
    showHealth: v.optional(v.boolean()),
  })
    .index("by_userId", ["userId"])
    .index("by_visibility_and_lastSeen", ["isVisible", "lastSeen"]),

  conversations: defineTable({
    participants: v.array(v.id("users")),
    lastMessageTime: v.optional(v.number()),
    lastMessageId: v.optional(v.id("messages")),
    participantSet: v.optional(v.array(v.id("users"))), // New field for efficient querying
  })
    .index("by_participant_time", ["participantSet", "lastMessageTime"])
    .index("by_lastMessageTime", ["lastMessageTime"])
    .index("by_participant", ["participants"]),

  messages: defineTable({
    conversationId: v.id("conversations"),
    senderId: v.id("users"),
    content: v.string(),
    format: v.union(v.literal("text"), v.literal("image"), v.literal("video")),
    mediaUrl: v.optional(v.string()),
    storageId: v.optional(v.id("_storage")),
  })
    .index("by_conversation", ["conversationId"])
    .searchIndex("search_content", {
      searchField: "content",
      filterFields: ["conversationId"],
    }),

  blogPosts: defineTable({
    title: v.string(),
    content: v.string(),
    authorId: v.id("users"),
    tags: v.array(v.string()),
    published: v.boolean(),
    publishedAt: v.number(),
  })
    .index("by_publishedAt", ["published", "publishedAt"])
    .index("by_author", ["authorId"]),
};

export default defineSchema({
  ...applicationTables,
});
