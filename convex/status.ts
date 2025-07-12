import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { ConvexError } from "convex/values";
import { Id } from "./_generated/dataModel";
import { DatabaseReader, DatabaseWriter } from "./_generated/server";

// Helper to get the current authenticated user's Convex ID
async function getCurrentUserId(ctx: {
  auth: any;
  db: DatabaseReader | DatabaseWriter;
}): Promise<Id<"users"> | null> {
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

// Get the current user's status (no userId required)
export const getCurrentUserStatus = query({
  args: {
    userId: v.id("users"),
  },
  returns: v.union(
    v.null(),
    v.object({
      _id: v.id("status"),
      _creationTime: v.number(),
      userId: v.id("users"),
      activityStatus: v.optional(
        v.union(
          v.literal("online"),
          v.literal("looking"),
          v.literal("traveling"),
          v.literal("invisible")
        )
      ),
      isLocationEnabled: v.boolean(),
      hostingStatus: v.union(
        v.literal("not-hosting"),
        v.literal("hosting"),
        v.literal("hosting-group"),
        v.literal("gloryhole"),
        v.literal("hotel"),
        v.literal("car"),
        v.literal("cruising")
      ),
      locationRandomization: v.optional(v.number()),
      latitude: v.optional(v.number()),
      longitude: v.optional(v.number()),
      lastSeen: v.number(),
    }),
    v.object({
      _id: v.null(),
      userId: v.id("users"),
      activityStatus: v.optional(
        v.union(
          v.literal("online"),
          v.literal("looking"),
          v.literal("traveling"),
          v.literal("invisible")
        )
      ),
      isLocationEnabled: v.boolean(),
      hostingStatus: v.union(
        v.literal("not-hosting"),
        v.literal("hosting"),
        v.literal("hosting-group"),
        v.literal("gloryhole"),
        v.literal("hotel"),
        v.literal("car"),
        v.literal("cruising")
      ),
      locationRandomization: v.number(),
      lastSeen: v.number(),
    })
  ),
  handler: async (ctx, args) => {
    const { userId } = args;

    const status = await ctx.db
      .query("status")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();

    if (!status) {
      // Return default status if none exists
      return {
        _id: null,
        userId,
        activityStatus: "online" as const,
        isLocationEnabled: false,
        hostingStatus: "not-hosting" as const,
        locationRandomization: 0,
        lastSeen: Date.now(),
      };
    }

    return status;
  },
});

// Get the current user's status (with userId parameter)
export const getMyStatus = query({
  args: {
    userId: v.id("users"),
  },
  returns: v.union(
    v.null(),
    v.object({
      _id: v.id("status"),
      _creationTime: v.number(),
      userId: v.id("users"),
      activityStatus: v.optional(
        v.union(
          v.literal("online"),
          v.literal("looking"),
          v.literal("traveling"),
          v.literal("invisible")
        )
      ),
      isLocationEnabled: v.boolean(),
      hostingStatus: v.union(
        v.literal("not-hosting"),
        v.literal("hosting"),
        v.literal("hosting-group"),
        v.literal("gloryhole"),
        v.literal("hotel"),
        v.literal("car"),
        v.literal("cruising")
      ),
      locationRandomization: v.optional(v.number()),
      latitude: v.optional(v.number()),
      longitude: v.optional(v.number()),
      lastSeen: v.number(),
    })
  ),
  handler: async (ctx, args) => {
    const { userId } = args;

    const status = await ctx.db
      .query("status")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();

    if (!status) {
      // Return null if no status exists
      return null;
    }

    return status;
  },
});

// Update the current user's status
export const updateMyStatus = mutation({
  args: {
    userId: v.id("users"),
    activityStatus: v.optional(
      v.union(
        v.literal("online"),
        v.literal("looking"),
        v.literal("traveling"),
        v.literal("invisible")
      )
    ),
    isLocationEnabled: v.optional(v.boolean()),
    latitude: v.optional(v.number()),
    longitude: v.optional(v.number()),
    locationRandomization: v.optional(v.number()),
    hostingStatus: v.optional(
      v.union(
        v.literal("not-hosting"),
        v.literal("hosting"),
        v.literal("hosting-group"),
        v.literal("gloryhole"),
        v.literal("hotel"),
        v.literal("car"),
        v.literal("cruising")
      )
    ),
  },
  returns: v.id("status"),
  handler: async (ctx, args) => {
    const { userId, ...statusData } = args;

    // Verify the user exists
    const user = await ctx.db.get(userId);
    if (!user) {
      throw new ConvexError("User not found");
    }

    const status = await ctx.db
      .query("status")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();

    if (!status) {
      // Create new status
      return await ctx.db.insert("status", {
        userId,
        activityStatus: statusData.activityStatus ?? "online",
        isLocationEnabled: statusData.isLocationEnabled ?? false,
        latitude: statusData.latitude,
        longitude: statusData.longitude,
        locationRandomization: statusData.locationRandomization ?? 0,
        hostingStatus: statusData.hostingStatus ?? "not-hosting",
        lastSeen: Date.now(),
      });
    }

    // Update existing status
    await ctx.db.patch(status._id, {
      ...statusData,
      lastSeen: Date.now(),
    });
    return status._id;
  },
});

// Update the current user's status (no userId required)
export const updateCurrentUserStatus = mutation({
  args: {
    userId: v.id("users"),
    activityStatus: v.optional(
      v.union(
        v.literal("online"),
        v.literal("looking"),
        v.literal("traveling"),
        v.literal("invisible")
      )
    ),
    isLocationEnabled: v.optional(v.boolean()),
    latitude: v.optional(v.number()),
    longitude: v.optional(v.number()),
    locationRandomization: v.optional(v.number()),
    hostingStatus: v.optional(
      v.union(
        v.literal("not-hosting"),
        v.literal("hosting"),
        v.literal("hosting-group"),
        v.literal("gloryhole"),
        v.literal("hotel"),
        v.literal("car"),
        v.literal("cruising")
      )
    ),
  },
  returns: v.id("status"),
  handler: async (ctx, args) => {
    const { userId, ...statusData } = args;

    // Verify the user exists
    const user = await ctx.db.get(userId);
    if (!user) {
      throw new ConvexError("User not found");
    }

    const status = await ctx.db
      .query("status")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();

    if (!status) {
      // Create new status
      return await ctx.db.insert("status", {
        userId,
        activityStatus: statusData.activityStatus ?? "online",
        isLocationEnabled: statusData.isLocationEnabled ?? false,
        latitude: statusData.latitude,
        longitude: statusData.longitude,
        locationRandomization: statusData.locationRandomization ?? 0,
        hostingStatus: statusData.hostingStatus ?? "not-hosting",
        lastSeen: Date.now(),
      });
    }

    // Update existing status
    await ctx.db.patch(status._id, {
      ...statusData,
      lastSeen: Date.now(),
    });
    return status._id;
  },
});
