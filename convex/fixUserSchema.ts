import { mutation } from "./_generated/server";

export const fixUserSchema = mutation({
  args: {},
  handler: async (ctx) => {
    // Fix users table
    const users = await ctx.db.query("users").collect();
    let fixedUsers = 0;

    for (const user of users) {
      // Create a new user object with only the fields that are in the current schema
      const fixedUser = {
        name: user.name,
        email: user.email,
        imageUrl: user.imageUrl,
        bio: user.bio,
        tags: user.tags,
        lastActive: user.lastActive,
      };

      // Update the user document with only the valid fields
      await ctx.db.patch(user._id, fixedUser);
      fixedUsers++;
    }

    // Fix profiles table
    const profiles = await ctx.db.query("profiles").collect();
    let fixedProfiles = 0;

    for (const profile of profiles) {
      // Create a new profile object with only the fields that are in the current schema
      const fixedProfile = {
        userId: profile.userId,
        version: profile.version,
        displayName: profile.displayName,
        headliner: profile.headliner,
        hometown: profile.hometown,
        profilePhotos: profile.profilePhotos,
        age: profile.age,
        heightInInches: profile.heightInInches,
        weightInLbs: profile.weightInLbs,
        endowmentLength: profile.endowmentLength,
        endowmentCut: profile.endowmentCut,
        bodyType: profile.bodyType,
        gender: profile.gender,
        expression: profile.expression,
        position: profile.position,
        lookingFor: profile.lookingFor,
        location: profile.location,
        intoPublic: profile.intoPublic,
        fetishes: profile.fetishes,
        kinks: profile.kinks,
        into: profile.into,
        interaction: profile.interaction,
        hivStatus: profile.hivStatus,
        hivTestedDate: profile.hivTestedDate,
        showBasicInfo: profile.showBasicInfo,
        showStats: profile.showStats,
        showIdentity: profile.showIdentity,
        showHealth: profile.showHealth,
        showScene: profile.showScene,
      };

      // Update the profile document with only the valid fields
      await ctx.db.patch(profile._id, fixedProfile);
      fixedProfiles++;
    }

    return {
      fixedUsers,
      totalUsers: users.length,
      fixedProfiles,
      totalProfiles: profiles.length,
    };
  },
});
