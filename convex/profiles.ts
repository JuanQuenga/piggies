import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";

// Helper to get the current authenticated user's Convex ID
async function getCurrentUserId(ctx: any): Promise<Id<"users"> | null> {
  console.log("[getCurrentUserId] Starting...");

  // Try to get identity from auth context first
  let identity = await ctx.auth.getUserIdentity();
  console.log(
    "[getCurrentUserId] Auth identity:",
    identity ? "found" : "not found"
  );

  // If no auth identity, try to get from the request context
  if (!identity) {
    console.log(
      "[getCurrentUserId] No auth identity, checking request context"
    );
    // For WorkOS AuthKit, the user info might be passed differently
    // We'll need to handle this case by checking if there's a user in the request
    return null;
  }

  const email = identity.email;
  console.log("[getCurrentUserId] Email:", email);

  if (!email) {
    console.log("[getCurrentUserId] No email in identity");
    return null;
  }

  const user = await ctx.db
    .query("users")
    .withIndex("by_email", (q: any) => q.eq("email", email))
    .unique();

  console.log("[getCurrentUserId] User found:", user ? "yes" : "no");
  if (user) {
    console.log("[getCurrentUserId] User ID:", user._id);
  }

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
        // Handle JSON strings that contain storage IDs
        let storageId = photo;
        try {
          const parsed = JSON.parse(photo);
          if (parsed.storageId) {
            storageId = parsed.storageId;
          }
        } catch {
          // If it's not JSON, use as is
          storageId = photo;
        }

        try {
          const url = await ctx.storage.getUrl(storageId as Id<"_storage">);
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
  args: {
    userId: v.id("users"),
  },
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
    try {
      console.log("[getMyProfile] Starting query...");
      const userId = args.userId;
      if (!userId) {
        console.log("[getMyProfile] No userId provided");
        return null;
      }
      console.log("[getMyProfile] userId:", userId);

      // Let's also check if there are any profiles in the database
      const allProfiles = await ctx.db.query("profiles").collect();
      console.log(
        "[getMyProfile] Total profiles in database:",
        allProfiles.length
      );

      const profile = await ctx.db
        .query("profiles")
        .withIndex("by_userId", (q) => q.eq("userId", userId))
        .unique();
      console.log("[getMyProfile] profile found:", profile);

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
      // Resolve photo storage IDs to URLs
      const photos = await resolvePhotoUrlsWithIds(ctx, profilePhotos);
      const result = {
        _id,
        _creationTime,
        userId: uid,
        displayName,
        headliner,
        hometown,
        profilePhotos,
        photos, // <-- add resolved URLs here
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
  args: {
    userId: v.id("users"),
  },
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
    const { userId } = args;
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

// Get image URL from storage ID
export const getImageUrl = query({
  args: {
    storageId: v.id("_storage"),
  },
  returns: v.union(v.string(), v.null()),
  handler: async (ctx, args) => {
    try {
      const url = await ctx.storage.getUrl(args.storageId);
      return url;
    } catch (error) {
      console.error("Error getting image URL:", error);
      return null;
    }
  },
});

// Generate a short-lived upload URL for profile photos
export const generateProfilePhotoUploadUrl = mutation({
  args: {},
  returns: v.string(),
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
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
    userId: v.id("users"),
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
    try {
      console.log("[updateMyProfile] Starting mutation with args:", args);
      console.log("[updateMyProfile] Args type:", typeof args);
      console.log("[updateMyProfile] Args keys:", Object.keys(args));

      // Use userId from args instead of authentication
      const userId = args.userId;
      if (!userId) {
        console.error("[updateMyProfile] No userId provided");
        throw new Error("userId is required");
      }
      console.log("[updateMyProfile] User ID from args:", userId);

      const existingProfile = await ctx.db
        .query("profiles")
        .withIndex("by_userId", (q) => q.eq("userId", userId))
        .unique();

      console.log(
        "[updateMyProfile] Existing profile:",
        existingProfile ? "found" : "not found"
      );

      if (existingProfile) {
        // Update existing profile
        console.log(
          "[updateMyProfile] Updating existing profile with data:",
          args
        );
        await ctx.db.patch(existingProfile._id, args);
        console.log("[updateMyProfile] Profile updated successfully");
        return existingProfile._id;
      }

      // Create new profile
      const { userId: _, ...profileData } = args; // Remove userId from args to avoid duplication
      const newProfileData = {
        userId,
        ...profileData,
      };
      console.log(
        "[updateMyProfile] Creating new profile with data:",
        newProfileData
      );
      const newProfileId = await ctx.db.insert("profiles", newProfileData);
      console.log(
        "[updateMyProfile] New profile created with ID:",
        newProfileId
      );
      return newProfileId;
    } catch (error) {
      console.error("[updateMyProfile] Error in mutation:", error);
      console.error("[updateMyProfile] Error details:", {
        message: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
        name: error instanceof Error ? error.name : "Unknown",
      });
      console.error(
        "[updateMyProfile] Error constructor:",
        (error as any).constructor?.name || "Unknown"
      );
      console.error(
        "[updateMyProfile] Full error object:",
        JSON.stringify(error, null, 2)
      );
      throw error;
    }
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

        // Only include users who are looking and have location enabled
        if (
          status &&
          status.activityStatus === "looking" &&
          status.isLocationEnabled &&
          status.latitude &&
          status.longitude
        ) {
          // Get the main profile photo (first photo in the array)
          let avatarUrl: string | undefined = undefined;

          if (profile.profilePhotos && profile.profilePhotos.length > 0) {
            const mainPhotoId = profile.profilePhotos[0];
            try {
              // Try to resolve the storage ID to a URL
              if (
                mainPhotoId &&
                !mainPhotoId.startsWith("data:") &&
                !mainPhotoId.startsWith("blob:")
              ) {
                const resolvedUrl = await ctx.storage.getUrl(
                  mainPhotoId as Id<"_storage">
                );
                avatarUrl = resolvedUrl || undefined;
              }
            } catch (error) {
              console.log(
                `[listVisibleUsers] Could not resolve photo URL for ${mainPhotoId}:`,
                error
              );
            }
          }

          // Fallback to AuthKit avatar if no profile photo
          if (!avatarUrl) {
            const user = await ctx.db.get(profile.userId);
            avatarUrl = user?.imageUrl;
          }

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

// List all users for the tile view (regardless of looking status)
export const listAllUsersForTiles = query({
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
      isVisible: v.optional(v.boolean()),
      lastSeen: v.optional(v.number()),
    })
  ),
  handler: async (ctx, args) => {
    try {
      console.log("[listAllUsersForTiles] Starting query...");

      // Get all profiles
      const profiles = await ctx.db.query("profiles").collect();
      console.log("[listAllUsersForTiles] Found profiles:", profiles.length);

      const result = [];

      for (const profile of profiles) {
        // Get the user's status
        const status = await ctx.db
          .query("status")
          .withIndex("by_userId", (q) => q.eq("userId", profile.userId))
          .unique();

        // Include all users, regardless of visibility or location status
        // Get the main profile photo (first photo in the array)
        let avatarUrl: string | undefined = undefined;

        if (profile.profilePhotos && profile.profilePhotos.length > 0) {
          const mainPhotoId = profile.profilePhotos[0];
          try {
            // Try to resolve the storage ID to a URL
            if (
              mainPhotoId &&
              !mainPhotoId.startsWith("data:") &&
              !mainPhotoId.startsWith("blob:")
            ) {
              const resolvedUrl = await ctx.storage.getUrl(
                mainPhotoId as Id<"_storage">
              );
              avatarUrl = resolvedUrl || undefined;
            }
          } catch (error) {
            console.log(
              `[listAllUsersForTiles] Could not resolve photo URL for ${mainPhotoId}:`,
              error
            );
          }
        }

        // Fallback to AuthKit avatar if no profile photo
        if (!avatarUrl) {
          const user = await ctx.db.get(profile.userId);
          avatarUrl = user?.imageUrl;
        }

        result.push({
          _id: profile._id,
          userId: profile.userId,
          displayName: profile.displayName,
          latitude: status?.latitude,
          longitude: status?.longitude,
          avatarUrl,
          distance: undefined, // Will be calculated on client side
          hostingStatus: status?.hostingStatus,
          // Remove isVisible field as it's been replaced by activityStatus
          lastSeen: status?.lastSeen,
        });
      }

      console.log("[listAllUsersForTiles] Returning all users:", result.length);
      return result;
    } catch (error) {
      console.error("[listAllUsersForTiles] Error:", error);
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
        (status) => status.activityStatus === "looking"
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
    userId: v.id("users"),
    latitude: v.number(),
    longitude: v.number(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    try {
      console.log("[setupMapStatus] Starting with args:", args);

      const userId = args.userId;
      console.log("[setupMapStatus] Setting up status for user:", userId);

      // Check if status already exists
      const existingStatus = await ctx.db
        .query("status")
        .withIndex("by_userId", (q) => q.eq("userId", userId))
        .unique();

      if (existingStatus) {
        // Update existing status
        await ctx.db.patch(existingStatus._id, {
          activityStatus: "looking",
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
          activityStatus: "looking",
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

export const getPhotoUrls = query({
  args: { storageIds: v.array(v.string()) },
  returns: v.array(
    v.object({
      id: v.string(),
      url: v.union(v.string(), v.null()),
    })
  ),
  handler: async (ctx, args) => {
    try {
      console.log("[getPhotoUrls] Processing storage IDs:", args.storageIds);

      if (!args.storageIds || args.storageIds.length === 0) {
        console.log(
          "[getPhotoUrls] No storage IDs provided, returning empty array"
        );
        return [];
      }

      const results = await Promise.all(
        args.storageIds.map(async (id) => {
          try {
            // Skip invalid IDs
            if (!id || typeof id !== "string") {
              console.log("[getPhotoUrls] Invalid ID:", id);
              return { id, url: null };
            }

            // Skip if it's already a URL
            if (id.startsWith("http")) {
              console.log("[getPhotoUrls] ID is already a URL:", id);
              return { id, url: id };
            }

            const url = await ctx.storage.getUrl(id as Id<"_storage">);
            console.log("[getPhotoUrls] Resolved URL for ID:", id, "URL:", url);
            return { id, url };
          } catch (error) {
            console.error("[getPhotoUrls] Error processing ID:", id, error);
            return { id, url: null };
          }
        })
      );

      console.log("[getPhotoUrls] Returning results:", results);
      return results;
    } catch (error) {
      console.error("[getPhotoUrls] Error in query:", error);
      return [];
    }
  },
});
