import { v } from "convex/values";
import { mutation } from "./_generated/server";
import { ConvexError } from "convex/values";

export const getOrCreateUser = mutation({
  args: {
    email: v.string(),
    name: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // For WorkOS AuthKit, we pass user info directly from the client
    const email = args.email;
    if (!email) {
      throw new ConvexError("Email is required");
    }

    // Check if we've already stored this identity before.
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q: any) => q.eq("email", email))
      .unique();

    if (user !== null) {
      return user._id;
    }

    // If it's a new identity, create a new `User`.
    return await ctx.db.insert("users", {
      name: args.name ?? "Anonymous",
      email: email,
      imageUrl: args.imageUrl,
    });
  },
});

export const createUser = mutation({
  args: {
    name: v.optional(v.string()),
    email: v.string(),
    location: v.array(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("Called storeUser without authentication present");
    }

    // Check if we've already stored this identity before.
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q: any) => q.eq("email", args.email))
      .unique();

    if (user !== null) {
      // If we've seen this identity before but the name has changed, patch the value.
      if (args.name && user.name !== args.name) {
        await ctx.db.patch(user._id, { name: args.name });
      }
      return user._id;
    }

    // If it's a new identity, create a new `User`.
    const defaultName = identity.name ?? "Anonymous";
    return await ctx.db.insert("users", {
      name: args.name ?? defaultName,
      email: args.email,
    });
  },
});

export const updateUser = mutation({
  args: {
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    bio: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    isHosting: v.optional(v.boolean()),
    lastActive: v.optional(v.number()),
    displayName: v.optional(v.string()),
    location: v.optional(v.array(v.number())),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("Called updateUser without authentication present");
    }

    if (!identity.email) {
      throw new ConvexError("User email not found in identity");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q: any) => q.eq("email", identity.email!))
      .unique();

    if (!user) {
      throw new ConvexError("User not found");
    }

    // Only update fields that are provided and not undefined
    const updates: Record<string, any> = {};
    for (const [key, value] of Object.entries(args)) {
      if (value !== undefined) {
        updates[key] = value;
      }
    }

    if (Object.keys(updates).length > 0) {
      await ctx.db.patch(user._id, updates);
    }
  },
});
