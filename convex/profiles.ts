import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";

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
    try {
      if (photo.startsWith("http")) {
        resolvedPhotos.push({ id: photo, url: photo });
      } else {
        try {
          const url = await ctx.storage.getUrl(photo as Id<"_storage">);
          if (url) resolvedPhotos.push({ id: photo, url });
        } catch (e) {
          console.log("Invalid storage ID for photo:", photo, e);
        }
      }
    } catch (error) {
      console.error("Error processing photo:", photo, error);
    }
  }
  return resolvedPhotos;
}

// Calculate distance between two points in kilometers
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return Math.round(d * 10) / 10; // Round to 1 decimal place
}

function deg2rad(deg: number): number {
  return deg * (Math.PI / 180);
}

// Get the current user's profile, or null if not created
export const getMyProfile = query({
  args: {},
  returns: v.union(
    v.object({
      _id: v.id("profiles"),
      _creationTime: v.number(),
      userId: v.id("users"),
      displayName: v.optional(v.string()),
      headliner: v.optional(v.string()),
      hometown: v.optional(v.string()),
      profilePhotos: v.optional(v.array(v.string())),
      age: v.optional(v.number()),
      heightInInches: v.optional(v.number()),
      weightInLbs: v.optional(v.number()),
      endowmentLength: v.optional(v.number()),
      endowmentCut: v.optional(v.string()),
      bodyType: v.optional(v.string()),
      gender: v.optional(v.string()),
      expression: v.optional(v.string()),
      position: v.optional(v.string()),
      lookingFor: v.optional(v.array(v.string())),
      location: v.optional(v.array(v.string())),
      intoPublic: v.optional(v.array(v.string())),
      fetishes: v.optional(v.array(v.string())),
      kinks: v.optional(v.array(v.string())),
      into: v.optional(v.array(v.string())),
      interaction: v.optional(v.array(v.string())),
      hivStatus: v.optional(v.string()),
      hivTestedDate: v.optional(v.string()),
      showBasicInfo: v.optional(v.boolean()),
      showStats: v.optional(v.boolean()),
      showIdentity: v.optional(v.boolean()),
      showHealth: v.optional(v.boolean()),
      showScene: v.optional(v.boolean()),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    try {
      const identity = await ctx.auth.getUserIdentity();
      if (!identity) {
        console.log("[getMyProfile] no authenticated user");
        return null;
      }

      const email = identity.email;
      if (!email) {
        console.log("[getMyProfile] no email in identity");
        return null;
      }

      const user = await ctx.db
        .query("users")
        .withIndex("by_email", (q) => q.eq("email", email))
        .unique();

      if (!user) {
        console.log("[getMyProfile] user not found for email:", email);
        return null;
      }

      const userId = user._id;
      console.log("[getMyProfile] userId:", userId);

      const profile = await ctx.db
        .query("profiles")
        .withIndex("by_userId", (q) => q.eq("userId", userId))
        .unique();
      console.log("[getMyProfile] profile:", profile);
      if (
        !profile ||
        typeof profile !== "object" ||
        !("_id" in profile) ||
        !("userId" in profile)
      ) {
        console.log(
          "[getMyProfile] returning null due to missing _id or userId"
        );
        return null;
      }
      // Only return the fields defined in the validator
      const {
        _id,
        _creationTime,
        userId: uid,
        displayName,
        headliner,
        hometown,
        profilePhotos,
        age,
        heightInInches,
        weightInLbs,
        endowmentLength,
        endowmentCut,
        bodyType,
        gender,
        expression,
        position,
        lookingFor,
        location,
        intoPublic,
        fetishes,
        kinks,
        into,
        interaction,
        hivStatus,
        hivTestedDate,
        showBasicInfo,
        showStats,
        showIdentity,
        showHealth,
        showScene,
      } = profile;
      const result = {
        _id,
        _creationTime,
        userId: uid,
        displayName,
        headliner,
        hometown,
        profilePhotos,
        age,
        heightInInches,
        weightInLbs,
        endowmentLength,
        endowmentCut,
        bodyType,
        gender,
        expression,
        position,
        lookingFor,
        location,
        intoPublic,
        fetishes,
        kinks,
        into,
        interaction,
        hivStatus,
        hivTestedDate,
        showBasicInfo,
        showStats,
        showIdentity,
        showHealth,
        showScene,
      };
      console.log("[getMyProfile] returning:", result);
      return result;
    } catch (err) {
      console.error("[getMyProfile] error:", err);
      return null;
    }
  },
});

// Get the current user's profile with avatarUrl resolved to a real URL
export const getMyProfileWithAvatarUrl = query({
  args: {},
  returns: v.union(
    v.object({
      _id: v.id("profiles"),
      _creationTime: v.number(),
      userId: v.id("users"),
      displayName: v.optional(v.string()),
      headliner: v.optional(v.string()),
      hometown: v.optional(v.string()),
      profilePhotos: v.optional(v.array(v.string())),
      age: v.optional(v.number()),
      heightInInches: v.optional(v.number()),
      weightInLbs: v.optional(v.number()),
      endowmentLength: v.optional(v.number()),
      endowmentCut: v.optional(v.string()),
      bodyType: v.optional(v.string()),
      gender: v.optional(v.string()),
      expression: v.optional(v.string()),
      position: v.optional(v.string()),
      lookingFor: v.optional(v.array(v.string())),
      location: v.optional(v.array(v.string())),
      intoPublic: v.optional(v.array(v.string())),
      fetishes: v.optional(v.array(v.string())),
      kinks: v.optional(v.array(v.string())),
      into: v.optional(v.array(v.string())),
      interaction: v.optional(v.array(v.string())),
      hivStatus: v.optional(v.string()),
      hivTestedDate: v.optional(v.string()),
      showBasicInfo: v.optional(v.boolean()),
      showStats: v.optional(v.boolean()),
      showIdentity: v.optional(v.boolean()),
      showHealth: v.optional(v.boolean()),
      showScene: v.optional(v.boolean()),
      avatarUrl: v.optional(v.string()),
      photos: v.optional(
        v.array(
          v.object({
            id: v.string(),
            url: v.string(),
          })
        )
      ),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      console.log("[getMyProfileWithAvatarUrl] no authenticated user");
      return null;
    }

    const email = identity.email;
    if (!email) {
      console.log("[getMyProfileWithAvatarUrl] no email in identity");
      return null;
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .unique();

    if (!user) {
      console.log(
        "[DEBUG] getMyProfileWithAvatarUrl user not found for email:",
        email
      );
      return null;
    }

    const userId = user._id;
    console.log("[DEBUG] getMyProfileWithAvatarUrl userId:", userId);
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
    console.log("[DEBUG] getMyProfileWithAvatarUrl profile:", profile);
    if (!profile) return null;

    // Resolve avatar URL from user's imageUrl
    let avatarUrl: string | undefined = undefined;
    const userDoc = await ctx.db.get(userId);
    if (userDoc && "imageUrl" in userDoc && userDoc.imageUrl) {
      avatarUrl = userDoc.imageUrl;
    }

    // Resolve photo storage IDs to URLs
    const photos = await resolvePhotoUrlsWithIds(ctx, profile.profilePhotos);
    const result = { ...profile, avatarUrl, photos };
    console.log("[DEBUG] getMyProfileWithAvatarUrl result:", result);
    return result;
  },
});

// Generate a short-lived upload URL for avatar
export const generateAvatarUploadUrl = mutation({
  args: {},
  returns: v.string(),
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

// Create or update the current user's profile
export const updateMyProfile = mutation({
  args: {
    // Basic Info
    displayName: v.optional(v.string()),
    headliner: v.optional(v.string()),
    hometown: v.optional(v.string()),
    profilePhotos: v.optional(v.array(v.string())),
    // Stats
    age: v.optional(v.number()),
    heightInInches: v.optional(v.number()),
    weightInLbs: v.optional(v.number()),
    endowmentLength: v.optional(v.number()),
    endowmentCut: v.optional(v.string()),
    bodyType: v.optional(v.string()),
    // Identity
    gender: v.optional(v.string()),
    expression: v.optional(v.string()),
    position: v.optional(v.string()),
    // Scene
    lookingFor: v.optional(v.array(v.string())),
    location: v.optional(v.array(v.string())),
    intoPublic: v.optional(v.array(v.string())),
    fetishes: v.optional(v.array(v.string())),
    kinks: v.optional(v.array(v.string())),
    into: v.optional(v.array(v.string())),
    interaction: v.optional(v.array(v.string())),
    // Health
    hivStatus: v.optional(v.string()),
    hivTestedDate: v.optional(v.string()),
    // Visibility toggles
    showBasicInfo: v.optional(v.boolean()),
    showStats: v.optional(v.boolean()),
    showIdentity: v.optional(v.boolean()),
    showHealth: v.optional(v.boolean()),
    showScene: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const email = identity.email;
    if (!email) {
      throw new Error("No email in identity");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    const userId = user._id;

    const existingProfile = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();

    if (existingProfile) {
      // Update existing profile
      await ctx.db.patch(existingProfile._id, args);
      return existingProfile._id;
    }

    // Create new profile
    const newProfileData = {
      userId,
      ...args,
    };

    return await ctx.db.insert("profiles", newProfileData);
  },
});

// List all visible users for the map
export const listVisibleUsers = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("profiles"),
      userId: v.id("users"),
      displayName: v.optional(v.string()),
      latitude: v.optional(v.number()),
      longitude: v.optional(v.number()),
      avatarUrl: v.optional(v.string()),
      distance: v.optional(v.number()),
      hostingStatus: v.optional(v.string()),
    })
  ),
  handler: async (ctx, args) => {
    try {
      console.log("[listVisibleUsers] Starting query...");

      // Get all profiles with location data
      const profiles = await ctx.db.query("profiles").collect();
      console.log("[listVisibleUsers] Found profiles:", profiles.length);

      const result = [];

      for (const profile of profiles) {
        // Get the user's status to check if they're visible and get location
        const status = await ctx.db
          .query("status")
          .withIndex("by_userId", (q) => q.eq("userId", profile.userId))
          .unique();

        // Only include users who are visible and have location enabled
        if (
          status &&
          status.isVisible &&
          status.isLocationEnabled &&
          status.latitude &&
          status.longitude
        ) {
          // Get user data for avatar
          const user = await ctx.db.get(profile.userId);
          const avatarUrl = user?.imageUrl;

          result.push({
            _id: profile._id,
            userId: profile.userId,
            displayName: profile.displayName,
            latitude: status.latitude,
            longitude: status.longitude,
            avatarUrl,
            distance: undefined, // Will be calculated on client side
            hostingStatus: status.hostingStatus,
          });
        }
      }

      console.log("[listVisibleUsers] Returning visible users:", result.length);
      return result;
    } catch (error) {
      console.error("[listVisibleUsers] Error:", error);
      return [];
    }
  },
});

// Get a specific user's profile with avatar URL resolved
export const getProfileWithAvatarUrl = query({
  args: { userId: v.id("users") },
  returns: v.union(
    v.object({
      _id: v.id("profiles"),
      _creationTime: v.number(),
      userId: v.id("users"),
      displayName: v.optional(v.string()),
      headliner: v.optional(v.string()),
      hometown: v.optional(v.string()),
      profilePhotos: v.optional(v.array(v.string())),
      age: v.optional(v.number()),
      heightInInches: v.optional(v.number()),
      weightInLbs: v.optional(v.number()),
      endowmentLength: v.optional(v.number()),
      endowmentCut: v.optional(v.string()),
      bodyType: v.optional(v.string()),
      gender: v.optional(v.string()),
      expression: v.optional(v.string()),
      position: v.optional(v.string()),
      lookingFor: v.optional(v.array(v.string())),
      location: v.optional(v.array(v.string())),
      intoPublic: v.optional(v.array(v.string())),
      fetishes: v.optional(v.array(v.string())),
      kinks: v.optional(v.array(v.string())),
      into: v.optional(v.array(v.string())),
      interaction: v.optional(v.array(v.string())),
      hivStatus: v.optional(v.string()),
      hivTestedDate: v.optional(v.string()),
      showBasicInfo: v.optional(v.boolean()),
      showStats: v.optional(v.boolean()),
      showIdentity: v.optional(v.boolean()),
      showHealth: v.optional(v.boolean()),
      showScene: v.optional(v.boolean()),
      avatarUrl: v.optional(v.string()),
      photos: v.optional(
        v.array(
          v.object({
            id: v.string(),
            url: v.string(),
          })
        )
      ),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .unique();

    if (!profile) return null;

    // Resolve avatar URL
    const avatarUrl = await resolveAvatarUrl(
      ctx,
      undefined, // No avatarUrl field in profiles table
      args.userId
    );

    // Resolve photo URLs and return both id and url
    const photos = await resolvePhotoUrlsWithIds(ctx, profile.profilePhotos);

    return { ...profile, avatarUrl, photos };
  },
});

// Get a specific user from the auth table
export const getUser = query({
  args: { userId: v.id("users") },
  returns: v.union(
    v.object({
      _id: v.id("users"),
      _creationTime: v.number(),
      name: v.string(),
      email: v.string(),
      imageUrl: v.optional(v.string()),
      bio: v.optional(v.string()),
      tags: v.optional(v.array(v.string())),
      lastActive: v.optional(v.number()),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    return await ctx.db.get(args.userId);
  },
});

// Test query to check status table data
export const testStatusTable = query({
  args: {},
  returns: v.object({
    totalStatuses: v.number(),
    visibleStatuses: v.number(),
    sampleStatus: v.optional(v.any()),
  }),
  handler: async (ctx, args) => {
    try {
      const allStatuses = await ctx.db.query("status").collect();
      const visibleStatuses = allStatuses.filter(
        (status) => status.isVisible === true
      );

      return {
        totalStatuses: allStatuses.length,
        visibleStatuses: visibleStatuses.length,
        sampleStatus: allStatuses.length > 0 ? allStatuses[0] : undefined,
      };
    } catch (error) {
      console.error("[testStatusTable] Error:", error);
      return {
        totalStatuses: 0,
        visibleStatuses: 0,
        sampleStatus: undefined,
      };
    }
  },
});

// Simple test query to check if basic querying works
export const testBasicQuery = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("profiles"),
      userId: v.id("users"),
    })
  ),
  handler: async (ctx, args) => {
    try {
      console.log("[testBasicQuery] Starting...");
      const profiles = await ctx.db.query("profiles").take(5);
      console.log("[testBasicQuery] Found profiles:", profiles.length);
      return profiles.map((p) => ({ _id: p._id, userId: p.userId }));
    } catch (error) {
      console.error("[testBasicQuery] Error:", error);
      return [];
    }
  },
});

// Completely minimal test query
export const minimalTest = query({
  args: {},
  returns: v.array(v.string()),
  handler: async (ctx, args) => {
    console.log("[minimalTest] Starting...");
    return ["test"];
  },
});

// Set up user status for map visibility
export const setupMapStatus = mutation({
  args: {
    latitude: v.number(),
    longitude: v.number(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    try {
      const identity = await ctx.auth.getUserIdentity();
      if (!identity) {
        throw new Error("Not authenticated");
      }

      const email = identity.email;
      if (!email) {
        throw new Error("No email in identity");
      }

      console.log("[setupMapStatus] Setting up status for:", email);

      // Get user by email
      const user = await ctx.db
        .query("users")
        .withIndex("by_email", (q) => q.eq("email", email))
        .unique();

      if (!user) {
        throw new Error("User not found");
      }

      const userId = user._id;

      // Check if status already exists
      const existingStatus = await ctx.db
        .query("status")
        .withIndex("by_userId", (q) => q.eq("userId", userId))
        .unique();

      if (existingStatus) {
        // Update existing status
        await ctx.db.patch(existingStatus._id, {
          isVisible: true,
          isLocationEnabled: true,
          latitude: args.latitude,
          longitude: args.longitude,
          hostingStatus: "not-hosting",
          lastSeen: Date.now(),
        });
        console.log("[setupMapStatus] Updated existing status");
      } else {
        // Create new status
        await ctx.db.insert("status", {
          userId,
          isVisible: true,
          isLocationEnabled: true,
          latitude: args.latitude,
          longitude: args.longitude,
          hostingStatus: "not-hosting",
          lastSeen: Date.now(),
        });
        console.log("[setupMapStatus] Created new status");
      }

      return null;
    } catch (error) {
      console.error("[setupMapStatus] Error:", error);
      throw error;
    }
  },
});
