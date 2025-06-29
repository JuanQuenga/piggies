import React, { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { ChatView } from "./ChatView";
import { ConversationList } from "./ConversationList";

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
    <div className="h-full flex flex-col bg-white shadow-lg">
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
  );
};
