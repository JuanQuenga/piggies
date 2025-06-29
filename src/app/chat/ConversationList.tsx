import React from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { usePaginatedQuery } from "convex/react";
import { Button } from "../../components/ui/button";

interface ConversationListProps {
  onSelectConversation: (
    conversationId: Id<"conversations">,
    otherParticipant: {
      _id: Id<"users">;
      displayName?: string | null;
      avatarUrl?: string | null;
    }
  ) => void;
  currentUserId: Id<"users"> | null | undefined;
}

export const ConversationList: React.FC<ConversationListProps> = ({
  onSelectConversation,
  currentUserId,
}) => {
  const {
    results: conversations,
    status,
    loadMore,
  } = usePaginatedQuery(
    api.messages.listConversations,
    {},
    { initialNumItems: 15 }
  );

  if (status === "LoadingFirstPage" || currentUserId === undefined) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        Loading conversations...
      </div>
    );
  }

  if (!currentUserId) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        Please log in.
      </div>
    );
  }

  if (!conversations || conversations.length === 0) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        No conversations yet. Start chatting from a user's profile on the map!
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-card rounded-xl shadow-card">
      <h3 className="text-lg font-semibold p-3 border-b border-border text-muted-foreground">
        Chats
      </h3>
      <ul className="divide-y divide-border">
        {conversations.map((conv) => {
          if (!conv.otherParticipant) return null;
          const otherParticipant = conv.otherParticipant;
          const avatar =
            otherParticipant.avatarUrl ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(otherParticipant.displayName || "U")}&background=random&size=40`;

          return (
            <li
              key={conv._id}
              onClick={() => onSelectConversation(conv._id, otherParticipant)}
              className="p-3 hover:bg-muted cursor-pointer flex items-center space-x-3 transition-colors"
            >
              <img
                src={avatar}
                alt={otherParticipant.displayName || "User"}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {otherParticipant.displayName}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {conv.lastMessageFormat === "image"
                    ? "📷 Image"
                    : conv.lastMessageFormat === "video"
                      ? "📹 Video"
                      : conv.lastMessageSnippet || "No messages yet"}
                </p>
              </div>
              {conv.lastMessageTimestamp && (
                <span className="text-xs text-muted-foreground self-start pt-1">
                  {new Date(conv.lastMessageTimestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              )}
            </li>
          );
        })}
      </ul>
      {status === "CanLoadMore" && (
        <Button
          onClick={() => loadMore(10)}
          disabled={status !== "CanLoadMore"}
          variant="link"
          className="w-full p-2 text-sm"
        >
          Load More
        </Button>
      )}
    </div>
  );
};
