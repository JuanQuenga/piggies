"use client";

import { ProfileEditor } from "./ProfileEditor";
import { useEffect, useState } from "react";
import { useQuery } from "convex/react";
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useAuth } from "@workos-inc/authkit-nextjs/components";

// Force dynamic rendering to prevent static generation issues
export const dynamic = "force-dynamic";

export default function ProfilePage() {
  const [mounted, setMounted] = useState(false);
  const { user } = useAuth();
  const convexUser = useQuery(
    api.users.currentLoggedInUser,
    user?.email ? { email: user.email } : "skip"
  );
  const profile = useQuery(api.profiles.getMyProfile, convexUser ? {} : "skip");
  const status = useQuery(
    api.status.getMyStatus,
    convexUser ? { userId: convexUser._id } : "skip"
  );
  const updateStatus = useMutation(api.status.updateMyStatus);
  const updateProfile = useMutation(api.profiles.updateMyProfile);

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
      await updateProfile({
        userId: convexUser._id,
        ...data,
      });
      console.log("[ProfilePage] Profile updated successfully");
      // Optionally show a toast or notification here
    } catch (error) {
      console.error("Error updating profile:", error);

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
    hostingStatus?: string;
  }) => {
    // Ensure user is authenticated before proceeding
    if (!user || !convexUser) {
      console.error("User not authenticated or Convex user not loaded");
      throw new Error("User not authenticated");
    }

    try {
      console.log("[ProfilePage] Updating status for user:", convexUser._id);
      await updateStatus({
        userId: convexUser._id,
        ...data,
      });
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
