"use client";

import { useState, useEffect } from "react";
import { useQuery } from "convex/react";
import { useAuth } from "@clerk/nextjs";
import { useParams, useRouter } from "next/navigation";
import { api } from "../../../../convex/_generated/api";
import { ChatView } from "../ChatView";
import { Id } from "../../../../convex/_generated/dataModel";

// Force dynamic rendering to prevent static generation issues
export const dynamic = "force-dynamic";

export default function ConversationPage() {
  // Authentication hooks
  const { isSignedIn, isLoaded } = useAuth();
  const params = useParams();
  const router = useRouter();

  // State hooks
  const [mounted, setMounted] = useState(false);

  // Query hooks
  const currentUserId = useQuery(api.users.getMyId);
  const conversationId = params.conversationId as Id<"conversations">;
  const conversationDetails = useQuery(
    api.messages.getConversationDetails,
    conversationId ? { conversationId } : "skip"
  );

  // Effects
  useEffect(() => {
    setMounted(true);
  }, []);

  // Event handlers
  const handleBackToConversationList = () => {
    router.push("/chats");
  };

  // Render loading states and auth gates
  if (!isLoaded || !mounted) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-primary mb-2">
            Sign in required
          </h2>
          <p className="text-muted-foreground">
            Please sign in to use messaging.
          </p>
        </div>
      </div>
    );
  }

  if (currentUserId === undefined || currentUserId === null) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading user data...</p>
        </div>
      </div>
    );
  }

  if (!conversationDetails) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-primary mb-2">
            Conversation not found
          </h2>
          <p className="text-muted-foreground">
            This conversation may have been deleted or you don't have access to
            it.
          </p>
        </div>
      </div>
    );
  }

  // Main render - full page conversation view for mobile
  return (
    <div className="h-full w-full -mt-44 md:mt-0">
      <ChatView
        conversationId={conversationDetails.conversationId}
        otherParticipant={conversationDetails.otherParticipant}
        currentUserId={currentUserId}
        onBack={handleBackToConversationList}
      />
    </div>
  );
}
