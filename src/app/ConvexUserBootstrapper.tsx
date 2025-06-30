"use client";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useAuth } from "@clerk/nextjs";
import { useEffect } from "react";

export function ConvexUserBootstrapper() {
  const getOrCreateUser = useMutation(api.auth.getOrCreateUser);
  const { isSignedIn, isLoaded } = useAuth();

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      getOrCreateUser({});
    }
  }, [isLoaded, isSignedIn, getOrCreateUser]);

  return null;
}
