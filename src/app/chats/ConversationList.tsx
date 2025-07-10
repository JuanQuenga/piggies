"use client";

import React from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { usePaginatedQuery } from "convex/react";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Separator } from "../../components/ui/separator";
import { Pin, Users, Clock, ChevronRight } from "lucide-react";
import { cn } from "../../lib/utils";

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
    currentUserId ? { currentUserId } : "skip",
    { initialNumItems: 15 }
  );

  if (status === "LoadingFirstPage" || currentUserId === undefined) {
    return (
      <div className="flex items-center justify-center h-full bg-zinc-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-2 text-zinc-400">Loading conversations...</p>
        </div>
      </div>
    );
  }

  if (!currentUserId) {
    return (
      <div className="flex items-center justify-center h-full bg-zinc-900">
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
      <div className="flex items-center justify-center h-full bg-zinc-900">
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
      {/* Conversation List */}
      <div className="">
        {conversations.map((conv) => {
          if (!conv.otherParticipant) return null;
          const otherParticipant = conv.otherParticipant;
          const avatar =
            otherParticipant.avatarUrl ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(otherParticipant.displayName || "U")}&background=8b5cf6&color=fff&size=40`;

          return (
            <Card
              key={conv._id}
              className="mb-2 cursor-pointer hover:bg-zinc-800/50 transition-colors bg-zinc-800/30"
              onClick={() => onSelectConversation(conv._id, otherParticipant)}
            >
              <CardContent className="p-3">
                <div className="flex items-center gap-3">
                  <img
                    src={avatar}
                    alt={otherParticipant.displayName || "User"}
                    className="w-10 h-10 rounded-full object-cover border-2 border-zinc-600"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-white truncate">
                        {otherParticipant.displayName}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Users className="w-3 h-3 text-zinc-400" />
                      <p className="text-xs text-zinc-400 truncate">
                        Click to start chatting
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-zinc-400" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Load More Button */}
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
