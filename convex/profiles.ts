import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { Doc, Id } from "./_generated/dataModel";

// Helper to get the logged-in user's ID or throw an error
async function getAuthenticatedUserId(ctx: any): Promise<Id<"users">> {
  const userId = await getAuthUserId(ctx);
  if (!userId) {
    throw new Error("User not authenticated");
  }
  return userId;
}

// Get the current user's profile, or null if not created
export const getMyProfile = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
    return profile;
  },
});

// Generate a short-lived upload URL for avatar
export const generateAvatarUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

// Create or update the current user's profile
export const updateMyProfile = mutation({
  args: {
    displayName: v.optional(v.string()),
    description: v.optional(v.string()),
    latitude: v.optional(v.number()),
    longitude: v.optional(v.number()),
    status: v.optional(v.string()),
    isVisible: v.optional(v.boolean()),
    avatarUrl: v.optional(v.string()), // This will be a storageId
  },
  handler: async (ctx, args) => {
    const userId = await getAuthenticatedUserId(ctx);
    const user = await ctx.db.get(userId); // For fallback avatar from auth if needed
    if (!user) {
      throw new Error("User not found in auth table");
    }

    const existingProfile = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();

    // Prepare data, ensuring only provided fields are updated or set.
    // Undefined fields from args mean "no change" for patch, or use default for insert.
    const profileData: Partial<Doc<"profiles">> = {
      lastSeen: Date.now(),
    };

    if (args.displayName !== undefined) profileData.displayName = args.displayName;
    if (args.description !== undefined) profileData.description = args.description;
    if (args.latitude !== undefined) profileData.latitude = args.latitude;
    if (args.longitude !== undefined) profileData.longitude = args.longitude;
    if (args.status !== undefined) profileData.status = args.status;
    if (args.isVisible !== undefined) profileData.isVisible = args.isVisible;
    if (args.avatarUrl !== undefined) profileData.avatarUrl = args.avatarUrl;


    if (existingProfile) {
      await ctx.db.patch(existingProfile._id, profileData);
    } else {
      // For new profiles, set defaults for fields not provided in args
      const insertData = {
        userId,
        displayName: args.displayName ?? user.name ?? undefined, // Fallback to auth name
        description: args.description ?? undefined,
        latitude: args.latitude,
        longitude: args.longitude,
        status: args.status ?? undefined,
        isVisible: args.isVisible === undefined ? true : args.isVisible, // Default to true
        lastSeen: Date.now(),
        avatarUrl: args.avatarUrl ?? user.image ?? undefined, // Fallback to auth image
      };
      await ctx.db.insert("profiles", insertData);
    }
    return await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
  },
});

// List all visible users for the map
export const listVisibleUsers = query({
  args: {},
  handler: async (ctx) => {
    const profiles = await ctx.db
      .query("profiles")
      .withIndex("by_visibility_and_lastSeen", (q) => q.eq("isVisible", true))
      .order("desc") // Show most recently active first
      .collect();

    // Attach user information (name, etc.) from the "users" table
    // and avatar URL from storage
    const usersWithProfiles: Array<
      Doc<"profiles"> & {
        userName?: string; // from auth table
        userEmail?: string; // from auth table
        profileAvatarUrl?: string | null; // actual URL for display
      }
    > = [];

    for (const profile of profiles) {
      if (profile.latitude !== undefined && profile.longitude !== undefined) {
        const user = await ctx.db.get(profile.userId);
        let profileAvatarFinalUrl: string | null = null;
        if (profile.avatarUrl) { // avatarUrl is storageId
          profileAvatarFinalUrl = await ctx.storage.getUrl(profile.avatarUrl as Id<"_storage">);
        } else if (user?.image) { // fallback to auth image
          profileAvatarFinalUrl = user.image;
        }

        usersWithProfiles.push({
          ...profile,
          userName: user?.name,
          userEmail: user?.email,
          // The 'avatarUrl' in 'profile' is the storageId.
          // We add 'profileAvatarUrl' for the actual display URL.
          // The UserMarker component will use profile.avatarUrl (which is storageId)
          // and then fetch the URL if needed, or we can pass the fetched URL directly.
          // For simplicity in UserMarker, let's ensure it can handle storageId or direct URL.
          // The current UserMarker expects avatarUrl to be a direct URL.
          // So, we should resolve it here.
          avatarUrl: profileAvatarFinalUrl ?? undefined, // Override profile.avatarUrl with the resolved URL
        });
      }
    }
    return usersWithProfiles;
  },
});
