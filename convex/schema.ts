import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // ============================================================================
  // USERS TABLE
  // ============================================================================
  // Purpose: Stores basic user account information (authentication, etc.)
  // This is separate from profile data and status data
  users: defineTable({
    name: v.string(),
    email: v.string(),
    imageUrl: v.optional(v.string()),
    bio: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    lastActive: v.optional(v.number()),
    // Temporary: allow any additional fields during cleanup
    location: v.optional(v.any()),
    isHosting: v.optional(v.any()),
  })
    .index("by_email", ["email"])
    .searchIndex("search_bio", {
      searchField: "bio",
    }),

  // ============================================================================
  // PROFILES TABLE
  // ============================================================================
  // Purpose: Stores all user profile information as managed by ProfileEditor.tsx
  // This includes display name, photos, stats, identity, health, scene preferences, etc.
  // Each user has exactly one profile document
  profiles: defineTable({
    // Reference to user
    userId: v.id("users"),
    version: v.optional(v.number()), // Schema version for migrations

    // Basic Information (from ProfileEditor - Basic Info section)
    displayName: v.optional(v.string()),
    headliner: v.optional(v.string()),
    hometown: v.optional(v.string()),
    profilePhotos: v.optional(v.array(v.string())),

    // Stats (from ProfileEditor - Stats section)
    age: v.optional(v.number()),
    heightInInches: v.optional(v.number()),
    weightInLbs: v.optional(v.number()),
    endowmentLength: v.optional(v.number()),
    endowmentCut: v.optional(v.string()),
    bodyType: v.optional(v.string()),

    // Identity (from ProfileEditor - Identity section)
    gender: v.optional(v.string()),
    expression: v.optional(v.string()),
    position: v.optional(v.string()),

    // Scene (from ProfileEditor - Scene section)
    lookingFor: v.optional(v.array(v.string())), // Choose up to 3
    location: v.optional(v.array(v.string())), // Can select all options
    intoPublic: v.optional(v.array(v.string())), // Can select all options
    fetishes: v.optional(v.array(v.string())), // Choose up to 6
    kinks: v.optional(v.array(v.string())), // Choose up to 6
    into: v.optional(v.array(v.string())), // Choose up to 3
    interaction: v.optional(v.array(v.string())), // Choose up to 3

    // Health (from ProfileEditor - Health section)
    hivStatus: v.optional(v.string()),
    hivTestedDate: v.optional(v.string()),

    // Section Visibility Toggles (from ProfileEditor)
    showBasicInfo: v.optional(v.boolean()),
    showStats: v.optional(v.boolean()),
    showIdentity: v.optional(v.boolean()),
    showHealth: v.optional(v.boolean()),
    showScene: v.optional(v.boolean()),

    // Temporary: allow any additional fields during cleanup
    isVisible: v.optional(v.any()),
    lastSeen: v.optional(v.any()),
    latitude: v.optional(v.any()),
    longitude: v.optional(v.any()),
    avatarUrl: v.optional(v.any()),
    photos: v.optional(v.any()),
    mainPhotoIndex: v.optional(v.any()),
    homeLocation: v.optional(v.any()),
    sexuality: v.optional(v.any()),
    practices: v.optional(v.any()),
    stiTestedDate: v.optional(v.any()),
    safeguards: v.optional(v.any()),
    comfortLevels: v.optional(v.any()),
    carrying: v.optional(v.any()),
    description: v.optional(v.any()),
    status: v.optional(v.any()),
  }).index("by_userId", ["userId"]),

  // ============================================================================
  // STATUS TABLE
  // ============================================================================
  // Purpose: Stores all status-related fields as managed by StatusControls.tsx
  // This is kept separate from profile data so status changes don't affect profile
  // Each user has exactly one status document
  status: defineTable({
    // Reference to user
    userId: v.id("users"),

    // Looking/Visibility Status (from StatusControls)
    isVisible: v.boolean(), // Whether user is "looking now"

    // Hosting Status (from StatusControls)
    hostingStatus: v.union(
      v.literal("not-hosting"),
      v.literal("hosting"),
      v.literal("hosting-group"),
      v.literal("gloryhole"),
      v.literal("hotel"),
      v.literal("car"),
      v.literal("cruising")
    ),

    // Location Settings (from StatusControls)
    isLocationEnabled: v.boolean(), // Whether location is enabled
    latitude: v.optional(v.number()), // User's latitude (if location enabled)
    longitude: v.optional(v.number()), // User's longitude (if location enabled)
    locationRandomization: v.optional(v.number()), // How much to randomize (0-10)

    // Timestamps
    lastSeen: v.number(), // When status was last updated
  })
    .index("by_userId", ["userId"])
    .index("by_visibility_and_lastSeen", ["isVisible", "lastSeen"]),

  // ============================================================================
  // CONVERSATIONS TABLE
  // ============================================================================
  // Purpose: Stores chat conversations between users
  conversations: defineTable({
    participantIds: v.array(v.id("users")),
    lastMessageTime: v.optional(v.number()),
    lastMessageId: v.optional(v.id("messages")),
    participantSet: v.optional(v.array(v.id("users"))), // For efficient querying
  })
    .index("by_participant_time", ["participantSet", "lastMessageTime"])
    .index("by_lastMessageTime", ["lastMessageTime"])
    .index("by_participant", ["participantIds"]),

  // ============================================================================
  // MESSAGES TABLE
  // ============================================================================
  // Purpose: Stores individual messages in conversations
  messages: defineTable({
    conversationId: v.id("conversations"),
    senderId: v.optional(v.id("users")),
    content: v.optional(v.string()),
    format: v.union(v.literal("text"), v.literal("image"), v.literal("video")),
    mediaUrl: v.optional(v.string()),
    storageId: v.optional(v.id("_storage")),
    // Temporary: allow authorId during cleanup
    authorId: v.optional(v.any()),
    readBy: v.optional(v.array(v.id("users"))), // Read receipts
  })
    .index("by_conversation", ["conversationId"])
    .searchIndex("search_content", {
      searchField: "content",
      filterFields: ["conversationId"],
    }),

  // ============================================================================
  // BLOG POSTS TABLE
  // ============================================================================
  // Purpose: Stores blog posts/articles
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
});
