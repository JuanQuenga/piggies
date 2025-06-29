// This file might exist from the auth template or needs to be created
// to provide `api.users.currentLoggedInUser`.
// If `convex/auth.ts` already provides `api.auth.loggedInUser` which returns
// the user document from the "users" table, this file might be redundant
// or could be used for other user-related queries/mutations.

import { query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// Query to get the currently logged-in user's full document from the "users" table.
// This is often provided by the auth setup (e.g., in convex/auth.ts as loggedInUser).
// If it's not, or you need a specific version, you can define it here.
export const currentLoggedInUser = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null; // No user is logged in
    }
    const user = await ctx.db.get(userId); // Fetches from the "users" table
    if (!user) {
      // This case should ideally not happen if userId is valid
      // and refers to an entry in the "users" table.
      console.warn(`User with ID ${userId} not found in 'users' table.`);
      return null;
    }
    return user; // Returns the document from the "users" table (name, email, image, etc.)
  },
});

export const getMyId = query({
  handler: async (ctx) => {
    return await getAuthUserId(ctx);
  },
});
