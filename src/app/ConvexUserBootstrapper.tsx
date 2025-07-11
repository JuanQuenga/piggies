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
    // Only call updateMyProfile when user is fully loaded and authenticated
    if (!loading && user && user.email && profile === null) {
      // Add a small delay to ensure authentication is fully established
      const timer = setTimeout(() => {
        updateMyProfile({});
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [loading, user, profile, updateMyProfile]);

  return null;
}
