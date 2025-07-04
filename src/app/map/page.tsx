"use client";

import { useQuery, useMutation } from "convex/react";
import { useAuth } from "@clerk/nextjs";
import { api } from "../../../convex/_generated/api";
import { MapComponent } from "../../app/map/MapComponent";
import { Id } from "../../../convex/_generated/dataModel";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ProfileModal } from "../profile/ProfileModal";

// Force dynamic rendering to prevent static generation issues
export const dynamic = "force-dynamic";

export default function MapPage() {
  const { isSignedIn, isLoaded } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<Id<"users"> | null>(
    null
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  // Now useQuery is called within ConvexProvider context
  const currentUserProfile = useQuery(api.profiles.getMyProfileWithAvatarUrl);
  const currentUserId = useQuery(api.users.getMyId);
  const getOrCreateConversationMutation = useMutation(
    api.messages.getOrCreateConversationWithParticipant
  );

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
      const result = await getOrCreateConversationMutation({
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

  return (
    <div className="h-full w-full flex-1 relative overflow-hidden">
      <MapComponent
        currentUserProfileForMap={currentUserProfile}
        currentUserId={currentUserId}
        onStartChat={handleStartChat}
        onProfileClick={handleProfileClick}
      />

      {/* Profile Modal */}
      {selectedUserId && (
        <ProfileModal
          open={!!selectedUserId}
          onOpenChange={(open) => {
            if (!open) setSelectedUserId(null);
          }}
          userId={selectedUserId}
          onBack={() => setSelectedUserId(null)}
          onStartChat={handleStartChat}
          currentUserProfileForMap={currentUserProfile}
        />
      )}
    </div>
  );
}
