"use client";

import { useQuery, useMutation } from "convex/react";
import { useAuth } from "@workos-inc/authkit-nextjs/components";
import { api } from "../../../../../convex/_generated/api";
import { ProfilePage } from "../../profile/ProfilePage";
import { Id } from "../../../../../convex/_generated/dataModel";
import { useRouter, useParams } from "next/navigation";
import Providers from "../../../Providers";
import { useEffect, useState } from "react";

// Force dynamic rendering to prevent static generation issues
export const dynamic = "force-dynamic";

// Separate component that uses Convex hooks - will be wrapped in ConvexProvider
function UserProfilePageContent() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const userId = params.userId as Id<"users">;

  // Now useQuery is called within ConvexProvider context
  const currentUserId = useQuery(
    api.users.getMyId,
    user?.email ? { email: user.email } : "skip"
  );
  const currentUserProfile = useQuery(
    api.profiles.getMyProfileWithAvatarUrl,
    currentUserId ? { userId: currentUserId } : "skip"
  );
  const getOrCreateConversationMutation = useMutation(
    api.messages.getOrCreateConversationWithParticipant
  );

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
          <p className="mt-2 text-muted-foreground">Loading profile data...</p>
        </div>
      </div>
    );
  }

  const handleBack = () => {
    router.back();
  };

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

  // Transform the profile data to match the expected interface
  const transformedProfile = currentUserProfile
    ? {
        latitude: undefined, // This should come from status data
        longitude: undefined, // This should come from status data
      }
    : null;

  return (
    <ProfilePage
      userId={userId}
      onBack={handleBack}
      onStartChat={handleStartChat}
      currentUserProfileForMap={transformedProfile}
    />
  );
}

// Main page component that provides the ConvexProvider context
export default function UserProfilePage() {
  return (
    <Providers>
      <UserProfilePageContent />
    </Providers>
  );
}
