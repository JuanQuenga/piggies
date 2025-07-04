"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { useAuth } from "@clerk/nextjs";
import { useSearchParams } from "next/navigation";
import { api } from "../../../convex/_generated/api";
import { MessagingArea } from "./MessagingArea";
import { Id } from "../../../convex/_generated/dataModel";

// Force dynamic rendering to prevent static generation issues
export const dynamic = "force-dynamic";

interface SelectedConversationDetails {
  conversationId: Id<"conversations">;
  otherParticipant: {
    _id: Id<"users">;
    displayName?: string | null;
    avatarUrl?: string | null;
  };
}

export default function ChatPage() {
  // Authentication hooks
  const { isSignedIn, isLoaded } = useAuth();
  const searchParams = useSearchParams();

  // State hooks
  const [mounted, setMounted] = useState(false);
  const [selectedConversationDetails, setSelectedConversationDetails] =
    useState<SelectedConversationDetails | null>(null);

  // Query hooks - always declare these at the top level
  const currentUserId = useQuery(api.users.getMyId);
  const conversationId = searchParams.get(
    "conversation"
  ) as Id<"conversations"> | null;
  const conversationDetails = useQuery(
    api.messages.getConversationDetails,
    conversationId ? { conversationId } : "skip"
  );

  // Effects
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (conversationDetails) {
      setSelectedConversationDetails(conversationDetails);
    }
  }, [conversationDetails]);

  // Event handlers
  const handleSelectConversation = (
    conversationId: Id<"conversations">,
    otherParticipant: SelectedConversationDetails["otherParticipant"]
  ) => {
    setSelectedConversationDetails({ conversationId, otherParticipant });
  };

  const handleBackToConversationList = () => {
    setSelectedConversationDetails(null);
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

  if (currentUserId === undefined) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading user data...</p>
        </div>
      </div>
    );
  }

  // Main render
  return (
    <div className="h-full w-full">
      <MessagingArea
        currentUserId={currentUserId}
        selectedConversationDetails={selectedConversationDetails}
        onSelectConversation={handleSelectConversation}
        onBackToConversationList={handleBackToConversationList}
      />
    </div>
  );
}
