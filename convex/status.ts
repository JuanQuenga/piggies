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

// Get the current user's status
export const getMyStatus = query({
  args: {
    userId: v.id("users"),
  },
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
    isVisible: v.optional(v.boolean()),
    isLocationEnabled: v.optional(v.boolean()),
    latitude: v.optional(v.number()),
    longitude: v.optional(v.number()),
    locationRandomization: v.optional(v.number()),
    hostingStatus: v.optional(v.string()),
  },
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
      const allowedHostingStatuses = [
        "not-hosting",
        "can-host",
        "cannot-host",
      ] as const;
      const safeHostingStatus = allowedHostingStatuses.includes(
        statusData.hostingStatus as any
      )
        ? (statusData.hostingStatus as (typeof allowedHostingStatuses)[number])
        : "not-hosting";
      // Create new status
      return await ctx.db.insert("status", {
        userId,
        isVisible: statusData.isVisible ?? true,
        isLocationEnabled: statusData.isLocationEnabled ?? false,
        latitude: statusData.latitude,
        longitude: statusData.longitude,
        locationRandomization: statusData.locationRandomization,
        hostingStatus: safeHostingStatus,
        lastSeen: Date.now(),
      });
    }

    const allowedHostingStatuses = [
      "not-hosting",
      "can-host",
      "cannot-host",
    ] as const;
    const safeHostingStatus = allowedHostingStatuses.includes(
      statusData.hostingStatus as any
    )
      ? (statusData.hostingStatus as (typeof allowedHostingStatuses)[number])
      : undefined;
    // Update existing status
    return await ctx.db.patch(status._id, {
      ...statusData,
      hostingStatus: safeHostingStatus,
      lastSeen: Date.now(),
    });
  },
});
