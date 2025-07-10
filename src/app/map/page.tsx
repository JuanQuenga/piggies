"use client";

import { useAuth } from "@workos-inc/authkit-nextjs/components";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { MapComponent } from "./MapComponent";

export default function MapPage() {
  const { user, loading } = useAuth();
  console.log("MapPage user:", user, "loading:", loading);
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<Id<"users"> | null>(
    null
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  // Now useQuery is called within ConvexProvider context
  const currentUserProfile = useQuery(api.profiles.getMyProfileWithAvatarUrl, {
    email: user?.email || "",
  });
  const currentUserId = useQuery(api.users.getMyId, {
    email: user?.email || "",
  });
  const getOrCreateConversationMutation = useMutation(
    api.messages.getOrCreateConversationWithParticipant
  );

  // Show loading state while authentication is being determined
  if (loading) {
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
  if (!user) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-primary mb-2">
            Sign in required
          </h2>
          <p className="text-muted-foreground">
            Please sign in to use the map.
          </p>
        </div>
      </div>
    );
  }

  // Show loading state while user data is being fetched
  if (
    !mounted ||
    currentUserId === undefined ||
    currentUserProfile === undefined
  ) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading map data...</p>
        </div>
      </div>
    );
  }

  const handleStartChat = async (otherParticipantUserId: Id<"users">) => {
    try {
      if (!currentUserId) {
        console.error("Current user ID not found");
        router.push("/chats");
        return;
      }

      const result = await getOrCreateConversationMutation({
        currentUserId,
        otherParticipantUserId,
      });
      // Navigate to chat with the conversation ID as a query parameter
      router.push(`/chats?conversation=${result.conversationId}`);
    } catch (error) {
      console.error("Failed to start chat:", error);
      // Fallback to just navigating to chat
      router.push("/chats");
    }
  };

  const handleProfileClick = (userId: Id<"users">) => {
    // Open the ProfileModal instead of navigating
    setSelectedUserId(userId);
  };

  // Transform the profile data to match the expected interface
  const transformedProfile = currentUserProfile
    ? {
        _id: currentUserProfile._id,
        latitude: undefined, // This should come from status data
        longitude: undefined, // This should come from status data
        status: undefined, // This should come from status data
        avatarUrl: currentUserProfile.avatarUrl,
        displayName: currentUserProfile.displayName,
        description: undefined, // This should come from profile data
        userName: undefined, // This should come from user data
        userEmail: undefined, // This should come from user data
        lastSeen: undefined, // This should come from status data
        isVisible: undefined, // This should come from status data
        userId: currentUserProfile.userId,
      }
    : null;

  return (
    <div className="h-full w-full flex-1 relative overflow-hidden">
      <MapComponent
        currentUserProfileForMap={transformedProfile}
        currentUserId={currentUserId}
        onStartChat={handleStartChat}
        onProfileClick={handleProfileClick}
      />
    </div>
  );
}
