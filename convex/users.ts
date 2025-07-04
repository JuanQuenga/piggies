// This file might exist from the auth template or needs to be created
// to provide `api.users.currentLoggedInUser`.
// If `convex/auth.ts` already provides `api.auth.loggedInUser` which returns
// the user document from the "users" table, this file might be redundant
// or could be used for other user-related queries/mutations.

import { query, mutation } from "./_generated/server";
import { Id } from "./_generated/dataModel";
import { v } from "convex/values";
import { ConvexError } from "convex/values";

// Query to get the currently logged-in user's full document from the "users" table.
export const currentLoggedInUser = query({
  handler: async (ctx) => {
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

    return user;
  },
});

export const getMyId = query({
  handler: async (ctx) => {
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

    return user?._id || null;
  },
});

// Mutation to create or get user from Clerk identity
export const createOrGetUser = mutation({
  args: {},
  returns: v.id("users"),
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("Not authenticated");
    }

    const email = identity.email;
    if (!email) {
      throw new ConvexError("User email not found");
    }

    // Check if user already exists
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .unique();

    if (existingUser) {
      return existingUser._id;
    }

    // Create new user from Clerk data
    return await ctx.db.insert("users", {
      email: email,
      name: identity.name ?? "Anonymous",
      imageUrl: identity.pictureUrl,
      location: [0, 0], // Default location
    });
  },
});

// Mutation to update user profile
export const updateUser = mutation({
  args: {
    name: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("Not authenticated");
    }

    const email = identity.email;
    if (!email) {
      throw new ConvexError("User email not found");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .unique();

    if (!user) {
      throw new ConvexError("User not found");
    }

    await ctx.db.patch(user._id, {
      ...(args.name !== undefined && { name: args.name }),
      ...(args.imageUrl !== undefined && { imageUrl: args.imageUrl }),
    });

    return null;
  },
});

// Mutation to delete all users without an email field (cleanup for schema migration)
export const deleteAnonymousUsers = mutation({
  args: {},
  handler: async (ctx) => {
    const allUsers = await ctx.db.query("users").collect();
    let deleted = 0;
    for (const user of allUsers) {
      if (!("email" in user) || typeof user.email !== "string") {
        await ctx.db.delete(user._id);
        deleted++;
      }
    }
    return { deleted };
  },
});

// Query to get a user by Clerk user ID (string)
export const getUserByClerkId = query({
  args: { clerkUserId: v.string() },
  handler: async (ctx, { clerkUserId }) => {
    // For now, use email as the mapping since users table only has email
    // In the future, if you add a clerkId field, use that instead
    // Try to find by email (assuming clerkUserId is an email for now)
    // If not, you must add clerkId to users table and index it
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", clerkUserId))
      .unique();
    return user ?? null;
  },
});
