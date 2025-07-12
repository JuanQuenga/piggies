"use client";

import React, { useState } from "react";
import { useQuery, usePaginatedQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { Button } from "../../../components/ui/button";
import { Card, CardContent } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { Separator } from "../../../components/ui/separator";
import {
  MessageCircle,
  Users,
  ArrowLeft,
  Pin,
  ChevronRight,
  Search,
  Filter,
  MoreHorizontal,
  Clock,
  Eye,
} from "lucide-react";
import { cn } from "../../../lib/utils";
import { useSearchParams } from "next/navigation";
import { formatDistanceToNow } from "date-fns";

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
  const [searchQuery, setSearchQuery] = useState("");
  const {
    results: conversations,
    status,
    loadMore,
  } = usePaginatedQuery(
    api.messages.listConversations,
    currentUserId ? { userId: currentUserId } : "skip",
    { initialNumItems: 15 }
  );

  // Filter conversations based on search query
  const filteredConversations =
    conversations?.filter((conv) => {
      if (!conv.otherParticipant) return false;
      const searchLower = searchQuery.toLowerCase();
      const displayName = (
        conv.otherParticipant.displayName || ""
      ).toLowerCase();
      return displayName.includes(searchLower);
    }) || [];

  if (status === "LoadingFirstPage" || currentUserId === undefined) {
    return (
      <div className="flex items-center justify-center h-full bg-zinc-900">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center mb-4 mx-auto">
            <img
              src="/pig-snout.svg"
              alt="Piggies"
              className="w-8 h-8 opacity-90"
              style={{ filter: "brightness(0) saturate(100%) invert(1)" }}
            />
          </div>
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-500 mx-auto mb-3"></div>
          <p className="text-zinc-400 text-sm">Loading conversations...</p>
        </div>
      </div>
    );
  }

  if (!currentUserId) {
    return (
      <div className="flex items-center justify-center h-full bg-zinc-900">
        <div className="text-center p-6">
          <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center mb-4 mx-auto">
            <img
              src="/pig-snout.svg"
              alt="Piggies"
              className="w-8 h-8 opacity-90"
              style={{ filter: "brightness(0) saturate(100%) invert(1)" }}
            />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">
            Sign in required
          </h3>
          <p className="text-zinc-400 text-sm">
            Please log in to view conversations.
          </p>
        </div>
      </div>
    );
  }

  if (!conversations || conversations.length === 0) {
    return (
      <div className="flex items-center justify-center h-full bg-zinc-900">
        <div className="text-center p-6">
          <div className="w-20 h-20 bg-gradient-to-br from-red-500/20 to-red-600/20 rounded-full flex items-center justify-center mb-6 mx-auto">
            <MessageCircle className="w-10 h-10 text-red-400" />
          </div>
          <h3 className="text-xl font-bold text-white mb-3">
            No conversations yet
          </h3>
          <p className="text-zinc-400 text-sm leading-relaxed max-w-sm">
            Start chatting from a user's profile on the map or people nearby!
          </p>
          <div className="mt-6 p-4 bg-gradient-to-br from-red-500/10 to-red-600/10 border border-red-500/20 rounded-xl">
            <p className="text-red-300 text-sm font-medium mb-2">💡 Pro Tip</p>
            <p className="text-zinc-300 text-xs">
              Visit the map to discover people nearby and start meaningful
              conversations
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-zinc-900">
      {/* Header */}
      <div className="p-4 border-b border-zinc-800/50 bg-zinc-900/95 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center">
              <MessageCircle className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Messages</h2>
              <p className="text-xs text-zinc-400">
                {filteredConversations.length} conversation
                {filteredConversations.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="w-8 h-8 hover:bg-zinc-800/50"
          >
            <MoreHorizontal className="w-4 h-4 text-zinc-400" />
          </Button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-zinc-800/50 border border-zinc-700/50 rounded-lg text-white placeholder-zinc-400 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all duration-200"
          />
        </div>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-2 space-y-1">
          {filteredConversations.map((conv) => {
            if (!conv.otherParticipant) return null;
            const otherParticipant = conv.otherParticipant;
            const avatar =
              otherParticipant.avatarUrl ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(otherParticipant.displayName || "U")}&background=F11A23&color=fff&size=80`;

            // Mock data for demonstration - replace with real data when available
            const lastMessage = "Click to start chatting";
            const lastMessageTime = Date.now() - Math.random() * 86400000; // Random time within last 24h
            const isOnline = Math.random() > 0.7; // 30% chance of being online
            const unreadCount = Math.floor(Math.random() * 3); // 0-2 unread messages

            return (
              <div
                key={conv._id}
                className="group relative cursor-pointer rounded-xl p-3 hover:bg-zinc-800/30 transition-all duration-200 border border-transparent hover:border-zinc-700/50"
                onClick={() => onSelectConversation(conv._id, otherParticipant)}
              >
                <div className="flex items-center gap-3">
                  {/* Avatar with online indicator */}
                  <div className="relative">
                    <img
                      src={avatar}
                      alt={otherParticipant.displayName || "User"}
                      className="w-12 h-12 rounded-full object-cover border-2 border-zinc-700 group-hover:border-red-500/50 transition-colors duration-200"
                    />
                    {isOnline && (
                      <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 rounded-full border-2 border-zinc-900 flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-sm font-semibold text-white truncate group-hover:text-red-300 transition-colors duration-200">
                        {otherParticipant.displayName || "Anonymous User"}
                      </h3>
                      <div className="flex items-center gap-2">
                        {unreadCount > 0 && (
                          <Badge className="bg-red-500 text-white text-xs px-1.5 py-0.5 min-w-0 h-5">
                            {unreadCount}
                          </Badge>
                        )}
                        <span className="text-xs text-zinc-500">
                          {formatDistanceToNow(lastMessageTime, {
                            addSuffix: true,
                          })}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1.5">
                        {isOnline ? (
                          <Eye className="w-3 h-3 text-green-400" />
                        ) : (
                          <Clock className="w-3 h-3 text-zinc-500" />
                        )}
                        <p className="text-xs text-zinc-400 truncate">
                          {lastMessage}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Arrow indicator */}
                  <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:text-red-400 transition-colors duration-200 flex-shrink-0" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Load More Button */}
        {status === "CanLoadMore" && (
          <div className="p-4 border-t border-zinc-800/50">
            <Button
              onClick={() => loadMore(10)}
              disabled={status !== "CanLoadMore"}
              variant="outline"
              className="w-full bg-zinc-800/50 border-zinc-700/50 text-white hover:bg-zinc-700/50 hover:border-red-500/50 transition-all duration-200"
            >
              Load More Conversations
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
