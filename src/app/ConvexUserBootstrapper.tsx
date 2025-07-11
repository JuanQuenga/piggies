"use client";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useAuth } from "@workos-inc/authkit-nextjs/components";
import { useEffect } from "react";

export function ConvexUserBootstrapper() {
  const { user, loading } = useAuth();
  const getOrCreateUser = useMutation(api.auth.getOrCreateUser);
  const updateMyProfile = useMutation(api.profiles.updateMyProfile);
  const profile = useQuery(api.profiles.getMyProfile);
  const currentUser = useQuery(
    api.users.currentLoggedInUser,
    user?.email ? { email: user.email } : "skip"
  );

  useEffect(() => {
    if (!loading && user) {
      getOrCreateUser({
        email: user.email,
        name:
          user.firstName && user.lastName
            ? `${user.firstName} ${user.lastName}`
            : user.firstName || "Anonymous",
        imageUrl: user.profilePictureUrl || undefined,
      });
    }
  }, [loading, user, getOrCreateUser]);

  useEffect(() => {
    // Only call updateMyProfile when user is fully loaded, authenticated, and has a Convex user ID
    if (
      !loading &&
      user &&
      user.email &&
      currentUser?._id && // Ensure we have a valid Convex user ID
      profile === null
    ) {
      // Add a longer delay to ensure authentication is fully established
      const timer = setTimeout(async () => {
        try {
          await updateMyProfile({});
          console.log("Profile updated successfully");
        } catch (error) {
          console.error("Error updating profile:", error);
          // Don't retry on authentication errors
          if (
            error instanceof Error &&
            error.message.includes("not authenticated")
          ) {
            console.log("User not authenticated yet, skipping profile update");
          }
        }
      }, 2000); // Increased delay to 2 seconds

      return () => clearTimeout(timer);
    }
  }, [loading, user, currentUser, profile, updateMyProfile]);

  return null;
}
