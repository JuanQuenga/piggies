"use client";

import { useQuery } from "convex/react";
import { useAuth } from "@clerk/nextjs";
import { api } from "../../../../convex/_generated/api";
import { ProfilePage } from "../../../app/profile/ProfilePage";
import { Id } from "../../../../convex/_generated/dataModel";

export default function UserProfilePage({
  params,
}: {
  params: { userId: string };
}) {
  const { isSignedIn, isLoaded } = useAuth();
  const userId = params?.userId as Id<"users">;
  const currentUserProfile = useQuery(api.profiles.getMyProfileWithAvatarUrl);

  // Show loading state while authentication is being determined
  if (!isLoaded) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  // Redirect to sign in if not authenticated
  if (!isSignedIn) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <h2 className="text-xl font-semibold text-primary">Sign in required</h2>
        <p className="text-muted-foreground">
          Please sign in to view profiles.
        </p>
      </div>
    );
  }

  // Validate userId parameter
  if (!userId) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <h2 className="text-xl font-semibold text-primary">Invalid user</h2>
        <p className="text-muted-foreground">User ID is missing.</p>
      </div>
    );
  }

  const handleBack = () => {
    window.history.back();
  };

  const handleStartChat = (otherUserId: Id<"users">) => {
    window.location.href = "/chat";
  };

  return (
    <ProfilePage
      userId={userId}
      onBack={handleBack}
      onStartChat={handleStartChat}
      currentUserProfileForMap={currentUserProfile}
    />
  );
}
