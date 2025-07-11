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
  args: {},
  handler: async (ctx, args) => {
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

    if (!user) {
      return null;
    }

    const userId = user._id;

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
    isVisible: v.optional(v.boolean()),
    isLocationEnabled: v.optional(v.boolean()),
    latitude: v.optional(v.number()),
    longitude: v.optional(v.number()),
    locationRandomization: v.optional(v.number()),
    hostingStatus: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("Not authenticated");
    }

    const email = identity.email;
    if (!email) {
      throw new ConvexError("No email in identity");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .unique();

    if (!user) {
      throw new ConvexError("User not found");
    }

    const userId = user._id;

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
        args.hostingStatus as any
      )
        ? (args.hostingStatus as (typeof allowedHostingStatuses)[number])
        : "not-hosting";
      // Create new status
      return await ctx.db.insert("status", {
        userId,
        isVisible: args.isVisible ?? true,
        isLocationEnabled: args.isLocationEnabled ?? false,
        latitude: args.latitude,
        longitude: args.longitude,
        locationRandomization: args.locationRandomization,
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
      args.hostingStatus as any
    )
      ? (args.hostingStatus as (typeof allowedHostingStatuses)[number])
      : undefined;
    // Update existing status
    return await ctx.db.patch(status._id, {
      ...args,
      hostingStatus: safeHostingStatus,
      lastSeen: Date.now(),
    });
  },
});
