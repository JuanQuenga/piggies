"use client";

import { useQuery, useMutation } from "convex/react";
import { useAuth } from "@clerk/nextjs";
import { api } from "../../../../convex/_generated/api";
import { ProfilePage } from "../../../app/profile/ProfilePage";
import { Id } from "../../../../convex/_generated/dataModel";
import { useRouter, useParams } from "next/navigation";

export default function UserProfilePage() {
  const { isSignedIn, isLoaded } = useAuth();
  const router = useRouter();
  const params = useParams();
  const userId = params.userId as Id<"users">;
  const currentUserProfile = useQuery(api.profiles.getMyProfileWithAvatarUrl);
  const getOrCreateConversationMutation = useMutation(
    api.messages.getOrCreateConversationWithParticipant
  );

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

  const handleStartChat = async (otherUserId: Id<"users">) => {
    try {
      const result = await getOrCreateConversationMutation({
        otherParticipantUserId: otherUserId,
      });
      // Navigate to chat with the conversation ID as a query parameter
      router.push(`/chat?conversation=${result.conversationId}`);
    } catch (error) {
      console.error("Failed to start chat:", error);
      // Fallback to just navigating to chat
      router.push("/chat");
    }
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
