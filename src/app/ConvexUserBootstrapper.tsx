"use client";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useAuth } from "@workos-inc/authkit-nextjs/components";
import { useEffect } from "react";

export function ConvexUserBootstrapper() {
  const { user, loading } = useAuth();
  const getOrCreateUser = useMutation(api.auth.getOrCreateUser);

  useEffect(() => {
    if (!loading && user) {
      console.log("[ConvexUserBootstrapper] Creating/updating user in Convex");
      getOrCreateUser({
        email: user.email,
        name:
          user.firstName && user.lastName
            ? `${user.firstName} ${user.lastName}`
            : user.firstName || "Anonymous",
        imageUrl: user.profilePictureUrl || undefined,
      })
        .then(() => {
          console.log(
            "[ConvexUserBootstrapper] User created/updated successfully"
          );
        })
        .catch((error) => {
          console.error(
            "[ConvexUserBootstrapper] Error creating/updating user:",
            error
          );
        });
    }
  }, [loading, user, getOrCreateUser]);

  return null;
}
