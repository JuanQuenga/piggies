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

  return (
    <div className="flex flex-col h-full w-full bg-background rounded-xl border border-border shadow-xl">
      <div className="flex items-center justify-between px-4 py-3 border-b bg-card/80 rounded-t-xl">
        <h2 className="text-lg font-bold text-primary">Chats</h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={onBackToConversationList}
          aria-label="Back to conversation list"
        >
          Back
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
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
      <div className="border-t bg-card/80 p-3 rounded-b-xl">
        <form className="flex gap-2">
          <input
            type="text"
            className="flex-1 rounded-md border border-border px-3 py-2 text-base bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Type a message..."
            aria-label="Type a message"
          />
          <Button type="submit" variant="default" aria-label="Send message">
            Send
          </Button>
        </form>
      </div>
    </div>
  );
};
