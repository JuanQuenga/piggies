"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { useAuth } from "@clerk/nextjs";
import { api } from "../../../convex/_generated/api";
import { MessagingArea } from "../../app/chat/MessagingArea";
import { Id } from "../../../convex/_generated/dataModel";

interface SelectedConversationDetails {
  conversationId: Id<"conversations">;
  otherParticipant: {
    _id: Id<"users">;
    displayName?: string | null;
    avatarUrl?: string | null;
  };
}

export default function ChatPage() {
  const { isSignedIn, isLoaded } = useAuth();
  const currentUserId = useQuery(api.users.getMyId);
  const [selectedConversationDetails, setSelectedConversationDetails] =
    useState<SelectedConversationDetails | null>(null);

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
            Please sign in to use messaging.
          </p>
        </div>
      </div>
    );
  }

  // Show loading state while user data is being fetched
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

  const handleSelectConversation = (
    conversationId: Id<"conversations">,
    otherParticipant: SelectedConversationDetails["otherParticipant"]
  ) => {
    setSelectedConversationDetails({ conversationId, otherParticipant });
  };

  const handleBackToConversationList = () => {
    setSelectedConversationDetails(null);
  };

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
