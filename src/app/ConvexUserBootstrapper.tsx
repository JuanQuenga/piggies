"use client";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useAuth } from "@workos-inc/authkit-nextjs/components";
import { useEffect, useRef } from "react";

export function ConvexUserBootstrapper() {
  const { user, loading } = useAuth();
  const getOrCreateUser = useMutation(api.auth.getOrCreateUser);
  const updateMyProfile = useMutation(api.profiles.updateMyProfile);
  const currentUser = useQuery(
    api.users.currentLoggedInUser,
    user?.email ? { email: user.email } : "skip"
  );
  const profile = useQuery(
    api.profiles.getMyProfile,
    currentUser ? {} : "skip"
  );
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const retryCountRef = useRef(0);

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
    // Clear any existing retry timeout
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }

    // Only call updateMyProfile when user is fully loaded, authenticated, and has a Convex user ID
    if (
      !loading &&
      user &&
      user.email &&
      currentUser?._id && // Ensure we have a valid Convex user ID
      profile === null &&
      retryCountRef.current < 3 // Limit retries to 3 attempts
    ) {
      // Add a delay to ensure authentication is fully established
      const delay = Math.min(1000 * Math.pow(2, retryCountRef.current), 5000); // Exponential backoff, max 5 seconds

      retryTimeoutRef.current = setTimeout(async () => {
        try {
          await updateMyProfile({
            userId: currentUser._id,
            // Add some default profile data if needed
          });
          console.log("Profile updated successfully");
          retryCountRef.current = 0; // Reset retry count on success
        } catch (error) {
          console.error("Error updating profile:", error);
          // Retry on authentication errors with exponential backoff
          if (
            error instanceof Error &&
            error.message.includes("not authenticated")
          ) {
            console.log(
              `User not authenticated yet, retry ${retryCountRef.current + 1}/3`
            );
            retryCountRef.current++;

            // Retry after a longer delay
            if (retryCountRef.current < 3) {
              const retryDelay = Math.min(
                2000 * Math.pow(2, retryCountRef.current),
                8000
              );
              retryTimeoutRef.current = setTimeout(() => {
                // Trigger the effect again for retry
                retryCountRef.current = retryCountRef.current;
              }, retryDelay);
            } else {
              console.log("Max retries reached, giving up on profile update");
            }
          }
        }
      }, delay);

      return () => {
        if (retryTimeoutRef.current) {
          clearTimeout(retryTimeoutRef.current);
          retryTimeoutRef.current = null;
        }
      };
    }
  }, [loading, user, currentUser, profile, updateMyProfile]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, []);

  return null;
}
