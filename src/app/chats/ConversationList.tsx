"use client";

import React from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { usePaginatedQuery } from "convex/react";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Separator } from "../../components/ui/separator";
import { MoreVertical, MessageCircle, ShieldCheck } from "lucide-react";

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
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-2 text-zinc-400">Loading conversations...</p>
        </div>
      </div>
    );
  }

  if (!currentUserId) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h3 className="text-xl font-semibold text-white mb-2">
            Sign in required
          </h3>
          <p className="text-zinc-400">Please log in to view conversations.</p>
        </div>
      </div>
    );
  }

  if (!conversations || conversations.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center p-4">
          <div className="text-6xl mb-4">💬</div>
          <h3 className="text-xl font-semibold text-white mb-2">
            No conversations yet
          </h3>
          <p className="text-zinc-400">
            Start chatting from a user's profile on the map!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-zinc-900">
      <div className="sticky top-0 z-10 bg-zinc-900 border-b border-zinc-800 px-4 py-3">
        <h3 className="text-lg font-semibold text-white">Chats</h3>
      </div>
      <ul className="divide-y divide-zinc-800">
        {conversations.map((conv) => {
          if (!conv.otherParticipant) return null;
          const otherParticipant = conv.otherParticipant;
          const avatar =
            otherParticipant.avatarUrl ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(otherParticipant.displayName || "U")}&background=8b5cf6&color=fff&size=40`;

          return (
            <li
              key={conv._id}
              onClick={() => onSelectConversation(conv._id, otherParticipant)}
              className="px-4 py-3 hover:bg-zinc-800 cursor-pointer flex items-center space-x-3 transition-colors"
            >
              <img
                src={avatar}
                alt={otherParticipant.displayName || "User"}
                className="w-10 h-10 rounded-full object-cover border-2 border-zinc-700"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {otherParticipant.displayName}
                </p>
                <p className="text-xs text-zinc-400 truncate">
                  {conv.lastMessageFormat === "image"
                    ? "📷 Image"
                    : conv.lastMessageFormat === "video"
                      ? "📹 Video"
                      : conv.lastMessageSnippet || "No messages yet"}
                </p>
              </div>
              {conv.lastMessageTimestamp && (
                <span className="text-xs text-zinc-500 self-start pt-1">
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
        <div className="p-4 border-t border-zinc-800">
          <Button
            onClick={() => loadMore(10)}
            disabled={status !== "CanLoadMore"}
            variant="outline"
            className="w-full bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-700"
          >
            Load More
          </Button>
        </div>
      )}
    </div>
  );
};
