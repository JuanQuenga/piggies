"use client";

import { useQuery, useMutation } from "convex/react";
import { useAuth } from "@clerk/nextjs";
import { api } from "../../../convex/_generated/api";
import { PeopleNearby } from "../../app/profile/PeopleNearby";
import { Id } from "../../../convex/_generated/dataModel";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { LogIn, Users } from "lucide-react";

// Force dynamic rendering to prevent static generation issues
export const dynamic = "force-dynamic";

export default function PeoplePage() {
  const { isSignedIn, isLoaded } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

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
      <div className="flex items-center justify-center min-h-[calc(100vh-5rem)] bg-gradient-to-br from-purple-900/20 via-zinc-900/20 to-black/20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400 mx-auto"></div>
          <p className="mt-2 text-zinc-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to sign in if not authenticated
  if (!isSignedIn) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-5rem)] bg-gradient-to-br from-purple-900/20 via-zinc-900/20 to-black/20">
        <div className="text-center max-w-md mx-auto p-8 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
          <Users className="w-12 h-12 text-purple-400 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-white mb-4">
            Sign in required
          </h2>
          <p className="text-zinc-400 mb-6">
            Please sign in to discover and connect with people nearby.
          </p>
          <Button
            onClick={() => router.push("/auth")}
            className="bg-purple-600 hover:bg-purple-700 text-white gap-2"
            size="lg"
          >
            <LogIn className="w-4 h-4" />
            Sign In
          </Button>
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
      <div className="flex items-center justify-center min-h-[calc(100vh-5rem)] bg-gradient-to-br from-purple-900/20 via-zinc-900/20 to-black/20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400 mx-auto"></div>
          <p className="mt-2 text-zinc-400">Loading people data...</p>
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
    // Navigate to user profile - this will be handled by the parent component
    router.push(`/user/${userId}`);
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-gradient-to-br from-purple-900/20 via-zinc-900/20 to-black/20 p-4">
      <div className="h-full w-full rounded-xl overflow-hidden border border-white/10">
        <PeopleNearby
          currentUserProfileForMap={currentUserProfile}
          currentUserId={currentUserId}
          onStartChat={handleStartChat}
          onProfileClick={handleProfileClick}
        />
      </div>
    </div>
  );
}
