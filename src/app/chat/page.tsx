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
          Please sign in to use messaging.
        </p>
      </div>
    );
  }

  // Show loading state while user data is being fetched
  if (currentUserId === undefined) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
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
    <MessagingArea
      currentUserId={currentUserId}
      selectedConversationDetails={selectedConversationDetails}
      onSelectConversation={handleSelectConversation}
      onBackToConversationList={handleBackToConversationList}
    />
  );
}
