"use client";

import { useState, useEffect } from "react";
import { useQuery } from "convex/react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { api } from "../../../convex/_generated/api";
import { ConversationList } from "./ConversationList";
import { ChatView } from "./ChatView";
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
  const router = useRouter();

  // State hooks
  const [mounted, setMounted] = useState(false);
  const [selectedConversationDetails, setSelectedConversationDetails] =
    useState<SelectedConversationDetails | null>(null);

  // Query hooks
  const currentUserId = useQuery(api.users.getMyId);

  // Effects
  useEffect(() => {
    setMounted(true);
  }, []);

  // Event handlers
  const handleSelectConversation = (
    conversationId: Id<"conversations">,
    otherParticipant: SelectedConversationDetails["otherParticipant"]
  ) => {
    // On mobile, navigate to the conversation page
    if (window.innerWidth < 768) {
      router.push(`/chats/${conversationId}`);
    } else {
      // On desktop, show in the side panel
      setSelectedConversationDetails({ conversationId, otherParticipant });
    }
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

  // Main render - responsive layout
  return (
    <div className="h-full w-full bg-zinc-950 -mt-44 md:mt-0">
      {/* Mobile: Full width conversation list */}
      <div className="block md:hidden h-full w-full">
        <ConversationList
          onSelectConversation={handleSelectConversation}
          currentUserId={currentUserId}
        />
      </div>

      {/* Desktop: Two-column layout */}
      <div className="hidden md:flex relative h-full w-full overflow-hidden">
        {/* Conversation List (left column) */}
        <div className="w-1/3 lg:w-1/3 h-full bg-zinc-900 border-r border-zinc-800 overflow-y-auto">
          <ConversationList
            onSelectConversation={handleSelectConversation}
            currentUserId={currentUserId}
          />
        </div>

        {/* ChatView (right column) */}
        <div className="flex-1 h-full bg-zinc-950">
          {selectedConversationDetails ? (
            <ChatView
              conversationId={selectedConversationDetails.conversationId}
              otherParticipant={selectedConversationDetails.otherParticipant}
              currentUserId={currentUserId}
              onBack={handleBackToConversationList}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-zinc-400 text-lg">
              Select a conversation to start chatting
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
