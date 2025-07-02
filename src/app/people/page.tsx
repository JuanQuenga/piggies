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
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to sign in if not authenticated
  if (!isSignedIn) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-primary mb-2">
            Sign in required
          </h2>
          <p className="text-muted-foreground">
            Please sign in to view people nearby.
          </p>
        </div>
      </div>
    );
  }

  // Show loading state while user data is being fetched
  if (currentUserId === undefined || currentUserProfile === undefined) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading people data...</p>
        </div>
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
    <div className="h-full w-full">
      <PeopleNearby
        currentUserProfileForMap={currentUserProfile}
        currentUserId={currentUserId}
        onStartChat={handleStartChat}
        onProfileClick={handleProfileClick}
      />
    </div>
  );
}
