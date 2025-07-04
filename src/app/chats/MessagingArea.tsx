"use client";

import React, { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { ChatView } from "./ChatView";
import { ConversationList } from "./ConversationList";
import { Button } from "@/components/ui/button";

interface SelectedConversationDetails {
  conversationId: Id<"conversations">;
  otherParticipant: {
    _id: Id<"users">;
    displayName?: string | null;
    avatarUrl?: string | null;
  };
}

interface MessagingAreaProps {
  currentUserId: Id<"users"> | null | undefined;
  selectedConversationDetails: SelectedConversationDetails | null;
  onSelectConversation: (
    conversationId: Id<"conversations">,
    otherParticipant: SelectedConversationDetails["otherParticipant"]
  ) => void;
  onBackToConversationList: () => void;
}

export const MessagingArea: React.FC<MessagingAreaProps> = ({
  currentUserId,
  selectedConversationDetails,
  onSelectConversation,
  onBackToConversationList,
}) => {
  if (currentUserId === undefined) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading user...</p>
        </div>
      </div>
    );
  }
  if (!currentUserId) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h3 className="text-xl font-semibold text-primary mb-2">
            Sign in required
          </h3>
          <p className="text-muted-foreground">
            Please sign in to use messaging.
          </p>
        </div>
      </div>
    );
  }

  // Responsive two-column layout
  return (
    <div className="relative flex h-full w-full bg-zinc-950 overflow-hidden">
      {/* Conversation List (left column) */}
      <div
        className={
          `md:block md:w-1/3 lg:w-1/3 h-full bg-zinc-900 border-r border-zinc-800 overflow-y-auto transition-transform duration-300` +
          (!selectedConversationDetails
            ? " translate-x-0"
            : " -translate-x-full md:translate-x-0")
        }
      >
        <ConversationList
          onSelectConversation={onSelectConversation}
          currentUserId={currentUserId}
        />
      </div>
      {/* ChatView (right column) */}
      <div
        className={
          `flex-1 h-full bg-zinc-950 transition-transform duration-300` +
          (selectedConversationDetails
            ? " translate-x-0"
            : " translate-x-full md:translate-x-0")
        }
      >
        {/* Mobile: show ConversationList or ChatView */}
        <div className="block md:hidden h-full w-full">
          {!selectedConversationDetails ? (
            <ConversationList
              onSelectConversation={onSelectConversation}
              currentUserId={currentUserId}
            />
          ) : (
            <ChatView
              conversationId={selectedConversationDetails.conversationId}
              otherParticipant={selectedConversationDetails.otherParticipant}
              currentUserId={currentUserId}
              onBack={onBackToConversationList}
            />
          )}
        </div>
        {/* Desktop: show ChatView if selected */}
        <div className="hidden md:block h-full w-full">
          {selectedConversationDetails ? (
            <ChatView
              conversationId={selectedConversationDetails.conversationId}
              otherParticipant={selectedConversationDetails.otherParticipant}
              currentUserId={currentUserId}
              onBack={onBackToConversationList}
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
};
