"use client";

import { useQuery } from "convex/react";
import { useAuth } from "@clerk/nextjs";
import { api } from "../../../convex/_generated/api";
import { PeopleNearby } from "../../app/profile/PeopleNearby";
import { Id } from "../../../convex/_generated/dataModel";

export default function PeoplePage() {
  const { isSignedIn, isLoaded } = useAuth();
  const currentUserProfile = useQuery(api.profiles.getMyProfileWithAvatarUrl);
  const currentUserId = useQuery(api.users.getMyId);

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
          Please sign in to view people nearby.
        </p>
      </div>
    );
  }

  // Show loading state while user data is being fetched
  if (currentUserId === undefined || currentUserProfile === undefined) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  const handleStartChat = (otherParticipantUserId: Id<"users">) => {
    // Navigate to chat - this will be handled by the parent component
    window.location.href = "/chat";
  };

  const handleProfileClick = (userId: Id<"users">) => {
    // Navigate to user profile - this will be handled by the parent component
    window.location.href = `/user/${userId}`;
  };

  return (
    <PeopleNearby
      currentUserProfileForMap={currentUserProfile}
      currentUserId={currentUserId}
      onStartChat={handleStartChat}
      onProfileClick={handleProfileClick}
    />
  );
}
