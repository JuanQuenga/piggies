"use client";

import { ProfileEditor } from "./ProfileEditor";
import { useEffect, useState } from "react";
import { useQuery } from "convex/react";
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useAuth } from "@workos-inc/authkit-nextjs/components";

// Import the HostingStatus type
type HostingStatus =
  | "not-hosting"
  | "hosting"
  | "hosting-group"
  | "gloryhole"
  | "hotel"
  | "car"
  | "cruising";

// Force dynamic rendering to prevent static generation issues
export const dynamic = "force-dynamic";

export default function ProfilePage() {
  const [mounted, setMounted] = useState(false);
  const { user } = useAuth();
  const convexUser = useQuery(
    api.users.currentLoggedInUser,
    user?.email ? { email: user.email } : "skip"
  );
  const profile = useQuery(
    api.profiles.getMyProfile,
    convexUser ? { userId: convexUser._id } : "skip"
  );
  const status = useQuery(
    api.status.getCurrentUserStatus,
    convexUser ? { userId: convexUser._id } : "skip"
  );
  const updateStatus = useMutation(api.status.updateCurrentUserStatus);
  const updateProfile = useMutation(api.profiles.updateMyProfile);

  // Debug logging
  useEffect(() => {
    console.log("[ProfilePage] Debug state:", {
      mounted,
      user: user ? "authenticated" : "not authenticated",
      convexUser: convexUser ? `ID: ${convexUser._id}` : "not loaded",
      profile: profile
        ? "loaded"
        : profile === null
          ? "null (no profile)"
          : "loading",
      status: status
        ? "loaded"
        : status === null
          ? "null (no status)"
          : "loading",
    });

    // Log the actual profile data when it's available
    if (profile) {
      console.log("[ProfilePage] Profile data content:", {
        displayName: profile.displayName,
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
        profilePhotos: profile.profilePhotos,
      });
    } else if (profile === null) {
      console.log("[ProfilePage] Profile is null - no profile exists");
    } else if (profile === undefined) {
      console.log("[ProfilePage] Profile is undefined - still loading");
    }
  }, [mounted, user, convexUser, profile, status]);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Check if user is authenticated and Convex user is loaded
  if (!user || !convexUser) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading user data...</p>
        </div>
      </div>
    );
  }

  const handleUpdateProfile = async (data: any) => {
    // Ensure user is authenticated before proceeding
    if (!user || !convexUser) {
      console.error("User not authenticated or Convex user not loaded");
      throw new Error("User not authenticated");
    }

    try {
      console.log("[ProfilePage] Updating profile for user:", convexUser._id);
      console.log("[ProfilePage] Profile data being sent:", data);
      console.log("[ProfilePage] Data keys:", Object.keys(data));
      console.log("[ProfilePage] Data has userId:", "userId" in data);

      // Pass userId from convexUser
      await updateProfile({
        userId: convexUser._id,
        ...data,
      });
      console.log("[ProfilePage] Profile updated successfully");
      // Optionally show a toast or notification here
    } catch (error) {
      console.error("Error updating profile:", error);
      console.error("Error details:", {
        message: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
      });

      // If it's an authentication error, try again after a short delay
      if (
        error instanceof Error &&
        error.message.includes("Not authenticated")
      ) {
        console.log(
          "[ProfilePage] Authentication error, retrying after delay..."
        );
        await new Promise((resolve) => setTimeout(resolve, 1000));
        try {
          await updateProfile({
            userId: convexUser._id,
            ...data,
          });
          console.log("[ProfilePage] Profile updated successfully on retry");
        } catch (retryError) {
          console.error("Error updating profile on retry:", retryError);
          throw retryError;
        }
      } else {
        throw error;
      }
    }
  };

  const handleUpdateStatus = async (data: {
    isVisible?: boolean;
    isLocationEnabled?: boolean;
    latitude?: number;
    longitude?: number;
    locationRandomization?: number;
    hostingStatus?: HostingStatus;
  }) => {
    // Ensure user is authenticated before proceeding
    if (!user || !convexUser) {
      console.error("User not authenticated or Convex user not loaded");
      throw new Error("User not authenticated");
    }

    try {
      console.log("[ProfilePage] Updating status for user:", convexUser._id);
      await updateStatus({ ...data, userId: convexUser._id });
      console.log("[ProfilePage] Status updated successfully");
    } catch (error) {
      console.error("Error updating status:", error);
      throw error;
    }
  };

  return (
    <div className="h-full w-full bg-zinc-950">
      <ProfileEditor
        profile={profile}
        status={status}
        updateProfile={handleUpdateProfile}
        updateStatus={handleUpdateStatus}
        convexUser={convexUser}
      />
    </div>
  );
}
