"use client";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useAuth } from "@clerk/nextjs";
import { useEffect } from "react";

export function ConvexUserBootstrapper() {
  const getOrCreateUser = useMutation(api.auth.getOrCreateUser);
  const updateMyProfile = useMutation(api.profiles.updateMyProfile);
  const profile = useQuery(api.profiles.getMyProfile, {});
  const { isSignedIn, isLoaded } = useAuth();

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      getOrCreateUser({});
    }
  }, [isLoaded, isSignedIn, getOrCreateUser]);

  useEffect(() => {
    if (isLoaded && isSignedIn && profile === null) {
      updateMyProfile({});
    }
  }, [isLoaded, isSignedIn, profile, updateMyProfile]);

  return null;
}
