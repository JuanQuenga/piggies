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
    return <div className="p-4 text-center">Loading user...</div>;
  }
  if (!currentUserId) {
    return (
      <div className="p-4 text-center">Please sign in to use messaging.</div>
    );
  }

  // Responsive two-column layout
  return (
    <div className="relative flex h-[80vh] w-full bg-background rounded-xl border border-border shadow-xl overflow-hidden">
      {/* Conversation List (left column) */}
      <div
        className={
          `hidden md:block md:w-1/3 lg:w-1/3 h-full bg-card border-r border-border overflow-y-auto transition-transform duration-300` +
          (!selectedConversationDetails
            ? " md:translate-x-0"
            : " md:translate-x-0")
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
          `flex-1 h-full bg-background transition-transform duration-300` +
          (selectedConversationDetails
            ? " md:translate-x-0"
            : " md:translate-x-0")
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
            <div className="flex items-center justify-center h-full text-muted-foreground text-lg">
              Select a conversation to start chatting
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
