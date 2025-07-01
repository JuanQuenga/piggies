import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";
import { ConvexError } from "convex/values";

// Helper to get the current authenticated user's Convex ID
async function getCurrentUserId(ctx: any): Promise<Id<"users"> | null> {
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

// Helper function to resolve avatar URL (handles both full URLs and storage IDs)
async function resolveAvatarUrl(
  ctx: any,
  avatarUrl: string | undefined,
  userId: Id<"users">
): Promise<string | undefined> {
  if (avatarUrl) {
    if (avatarUrl.startsWith("http")) {
      return avatarUrl;
    } else {
      try {
        const url = await ctx.storage.getUrl(avatarUrl as Id<"_storage">);
        if (url) return url;
      } catch (e) {
        console.log("Invalid storage ID for avatar:", avatarUrl);
      }
    }
  }
  const user = await ctx.db.get(userId);
  if (user && "imageUrl" in user && user.imageUrl) return user.imageUrl;
  return undefined;
}

// Helper function to resolve photo URLs (convert storage IDs to URLs)
async function resolvePhotoUrlsWithIds(
  ctx: any,
  photos: string[] | undefined
): Promise<{ id: string; url: string }[]> {
  if (!photos || photos.length === 0) return [];
  const resolvedPhotos: { id: string; url: string }[] = [];
  for (const photo of photos) {
    if (photo.startsWith("http")) {
      resolvedPhotos.push({ id: photo, url: photo });
    } else {
      try {
        const url = await ctx.storage.getUrl(photo as Id<"_storage">);
        if (url) resolvedPhotos.push({ id: photo, url });
      } catch (e) {
        console.log("Invalid storage ID for photo:", photo);
      }
    }
  }
  return resolvedPhotos;
}

// Get the current user's profile, or null if not created
export const getMyProfile = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getCurrentUserId(ctx);
    if (!userId) return null;
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
    return profile ?? null;
  },
});

// Get the current user's profile with avatarUrl resolved to a real URL
export const getMyProfileWithAvatarUrl = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getCurrentUserId(ctx);
    console.log("[DEBUG] getMyProfileWithAvatarUrl userId:", userId);
    if (!userId) return null;
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
    console.log("[DEBUG] getMyProfileWithAvatarUrl profile:", profile);
    if (!profile) return null;
    let avatarUrl: string | undefined = undefined;
    if (profile.avatarUrl) {
      try {
        const url = await ctx.storage.getUrl(
          profile.avatarUrl as Id<"_storage">
        );
        if (url) avatarUrl = url;
      } catch (e) {}
    }
    if (!avatarUrl) {
      const user = await ctx.db.get(userId);
      if (user && "imageUrl" in user && user.imageUrl)
        avatarUrl = user.imageUrl;
    }
    // Always resolve photo storage IDs to URLs, and return both id and url
    const photos = await resolvePhotoUrlsWithIds(ctx, profile.photos);
    const result = { ...profile, avatarUrl, photos };
    console.log("[DEBUG] getMyProfileWithAvatarUrl result:", result);
    return result;
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
    avatarUrl: v.optional(v.string()),
    homeLocation: v.optional(v.string()),
    age: v.optional(v.number()),
    heightInCm: v.optional(v.number()),
    weightInKg: v.optional(v.number()),
    endowment: v.optional(v.string()),
    bodyType: v.optional(v.string()),
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
    photos: v.optional(v.array(v.string())),
    mainPhotoIndex: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    console.log("[DEBUG] updateMyProfile identity:", identity);
    if (!identity) {
      throw new ConvexError("Not authenticated");
    }
    const email = identity.email;
    console.log("[DEBUG] updateMyProfile email:", email);
    if (!email) {
      throw new ConvexError("User email not found");
    }
    const userId = await getCurrentUserId(ctx);
    if (!userId) {
      throw new ConvexError("User not found in users table");
    }

    const user = await ctx.db.get(userId);
    if (!user) {
      throw new ConvexError("User not found in users table");
    }

    const existingProfile = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();

    console.log("[DEBUG] updateMyProfile args:", args);
    console.log("[DEBUG] updateMyProfile latitude:", args.latitude);
    console.log("[DEBUG] updateMyProfile longitude:", args.longitude);

    const profileData = {
      userId,
      displayName: args.displayName,
      description: args.description,
      latitude: args.latitude,
      longitude: args.longitude,
      status: args.status,
      isVisible: args.isVisible === undefined ? true : args.isVisible,
      lastSeen: Date.now(),
      avatarUrl:
        args.avatarUrl ??
        (user && "imageUrl" in user ? user.imageUrl : undefined),
      homeLocation: args.homeLocation,
      age: args.age,
      heightInCm: args.heightInCm,
      weightInKg: args.weightInKg,
      endowment: args.endowment,
      bodyType: args.bodyType,
      gender: args.gender,
      expression: args.expression,
      sexuality: args.sexuality,
      position: args.position,
      location: args.location,
      intoPublic: args.intoPublic,
      lookingFor: args.lookingFor,
      fetishes: args.fetishes,
      kinks: args.kinks,
      into: args.into,
      interaction: args.interaction,
      practices: args.practices,
      hivStatus: args.hivStatus,
      hivTestedDate: args.hivTestedDate,
      stiTestedDate: args.stiTestedDate,
      safeguards: args.safeguards,
      comfortLevels: args.comfortLevels,
      carrying: args.carrying,
      hostingStatus: args.hostingStatus,
      showStats: args.showStats,
      showIdentity: args.showIdentity,
      showScene: args.showScene,
      showHealth: args.showHealth,
      photos: args.photos,
      mainPhotoIndex: args.mainPhotoIndex,
    };

    console.log("[DEBUG] updateMyProfile profileData:", profileData);

    if (existingProfile) {
      await ctx.db.patch(existingProfile._id, profileData);
      return existingProfile._id;
    } else {
      return await ctx.db.insert("profiles", profileData);
    }
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

        // Resolve avatar URL
        const profileAvatarFinalUrl = await resolveAvatarUrl(
          ctx,
          profile.avatarUrl,
          profile.userId
        );

        usersWithProfiles.push({
          ...profile,
          userName: user?.name,
          userEmail: user?.email,
          // Override profile.avatarUrl with the resolved URL
          avatarUrl: profileAvatarFinalUrl ?? undefined,
        });
      }
    }
    return usersWithProfiles;
  },
});

// Get a specific user's profile with avatar URL resolved
export const getProfileWithAvatarUrl = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .unique();

    if (!profile) return null;

    // Resolve avatar URL
    const avatarUrl = await resolveAvatarUrl(
      ctx,
      profile.avatarUrl,
      args.userId
    );

    // Resolve photo URLs and return both id and url
    const photos = await resolvePhotoUrlsWithIds(ctx, profile.photos);

    return { ...profile, avatarUrl, photos };
  },
});

// Get a specific user from the auth table
export const getUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.userId);
  },
});
