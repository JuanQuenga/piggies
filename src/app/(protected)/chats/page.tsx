"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@workos-inc/authkit-nextjs/components";
import { useQuery, usePaginatedQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { ConversationList } from "./ConversationList";
import { MessagingArea } from "./MessagingArea";
import { ProfileModal } from "../profile/ProfileModal";
import { Card, CardContent } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { Separator } from "../../../components/ui/separator";
import { Button } from "../../../components/ui/button";
import { MessageCircle, Users, ArrowLeft, Pin } from "lucide-react";
import { cn } from "../../../lib/utils";
import { useSearchParams, useRouter } from "next/navigation";

interface SelectedConversationDetails {
  conversationId: Id<"conversations">;
  otherParticipant: {
    _id: Id<"users">;
    displayName?: string | null;
    avatarUrl?: string | null;
  };
}

export default function ChatsPage() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [selectedConversationDetails, setSelectedConversationDetails] =
    useState<SelectedConversationDetails | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [profileModalUserId, setProfileModalUserId] =
    useState<Id<"users"> | null>(null);

  // Get current user's Convex ID from AuthKit email
  const currentUser = useQuery(
    api.users.currentLoggedInUser,
    user?.email ? { email: user.email } : "skip"
  );

  // Get conversations to find the one from URL parameter
  const { results: conversations } = usePaginatedQuery(
    api.messages.listConversations,
    currentUser?._id ? { userId: currentUser._id } : "skip", // Only call when user is authenticated
    { initialNumItems: 50 }
  );

  // Check if we're on mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Handle conversation query parameter
  useEffect(() => {
    const conversationId = searchParams.get("conversation");
    if (conversationId && conversations && currentUser?._id) {
      const conversation = conversations.find(
        (conv) => conv._id === conversationId
      );
      if (conversation && conversation.otherParticipant) {
        setSelectedConversationDetails({
          conversationId: conversation._id,
          otherParticipant: conversation.otherParticipant,
        });
      }
    }
  }, [searchParams, conversations, currentUser?._id]);

  const handleSelectConversation = (
    conversationId: Id<"conversations">,
    otherParticipant: SelectedConversationDetails["otherParticipant"]
  ) => {
    setSelectedConversationDetails({
      conversationId,
      otherParticipant,
    });

    // Update the URL to reflect the selected conversation
    const params = new URLSearchParams(searchParams.toString());
    params.set("conversation", conversationId);
    router.push(`/chats?${params.toString()}`);

    // Auto-open profile modal on desktop when conversation is selected
    if (!isMobile) {
      setProfileModalUserId(otherParticipant._id);
      setProfileModalOpen(true);
    }
  };

  const handleBackToConversationList = () => {
    setSelectedConversationDetails(null);
    setProfileModalOpen(false);

    // Clear the conversation parameter from URL
    const params = new URLSearchParams(searchParams.toString());
    params.delete("conversation");
    router.push(`/chats?${params.toString()}`);
  };

  const handleStartChat = (userId: Id<"users">) => {
    // This will be handled by the ProfileModal's onStartChat
    // For now, we'll close the modal and let the user navigate
    setProfileModalOpen(false);
  };

  const handleProfileModalOpenChange = (open: boolean) => {
    setProfileModalOpen(open);
    if (!open) {
      setProfileModalUserId(null);
    }
  };

  if (currentUser === undefined) {
    return (
      <div className="flex items-center justify-center h-full bg-zinc-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-2 text-zinc-400">Loading user...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center h-full bg-zinc-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-2 text-zinc-400">Loading user...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col h-full w-full bg-zinc-900 overflow-hidden">
      {/* Pinned Conversations - Full Width */}
      <div className="px-4 py-2 border-b border-zinc-800 bg-zinc-900 hidden">
        <div className="flex items-center gap-2 mb-1">
          <Pin className="w-3 h-3 text-purple-400" />
          <h3 className="text-xs font-medium text-zinc-400">Pinned</h3>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {/* Pinned conversation items */}
          <div className="flex flex-col items-center gap-0.5 min-w-0 flex-shrink-0">
            <img
              src="/piggies-pinned.png"
              alt="Pinned user"
              className="w-12 h-12 rounded-lg object-cover border-2 border-purple-500 cursor-pointer hover:border-purple-400 transition-colors"
            />
            <span className="text-xs text-zinc-400 truncate max-w-12">
              Alex
            </span>
          </div>
          <div className="flex flex-col items-center gap-0.5 min-w-0 flex-shrink-0">
            <img
              src="/piggies-pinned.png"
              alt="Pinned user"
              className="w-12 h-12 rounded-lg object-cover border-2 border-purple-500 cursor-pointer hover:border-purple-400 transition-colors"
            />
            <span className="text-xs text-zinc-400 truncate max-w-12">Sam</span>
          </div>
          <div className="flex flex-col items-center gap-0.5 min-w-0 flex-shrink-0">
            <img
              src="/piggies-pinned.png"
              alt="Pinned user"
              className="w-12 h-12 rounded-lg object-cover border-2 border-purple-500 cursor-pointer hover:border-purple-400 transition-colors"
            />
            <span className="text-xs text-zinc-400 truncate max-w-12">
              Jordan
            </span>
          </div>
          <div className="flex flex-col items-center gap-0.5 min-w-0 flex-shrink-0">
            <img
              src="/piggies-pinned.png"
              alt="Pinned user"
              className="w-12 h-12 rounded-lg object-cover border-2 border-purple-500 cursor-pointer hover:border-purple-400 transition-colors"
            />
            <span className="text-xs text-zinc-400 truncate max-w-12">
              Casey
            </span>
          </div>
          <div className="flex flex-col items-center gap-0.5 min-w-0 flex-shrink-0">
            <img
              src="/piggies-pinned.png"
              alt="Pinned user"
              className="w-12 h-12 rounded-lg object-cover border-2 border-purple-500 cursor-pointer hover:border-purple-400 transition-colors"
            />
            <span className="text-xs text-zinc-400 truncate max-w-12">
              Taylor
            </span>
          </div>
        </div>
      </div>

      {/* Main Chat Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Conversation List (left column) */}
        <div
          className={cn(
            "h-full bg-zinc-900 border-r border-zinc-800 overflow-y-auto transition-transform duration-300",
            isMobile
              ? selectedConversationDetails
                ? "hidden"
                : "w-full"
              : "flex-1 md:w-1/3"
          )}
        >
          <ConversationList
            onSelectConversation={handleSelectConversation}
            currentUserId={currentUser._id}
          />
        </div>

        {/* Messaging Area (middle column) */}
        <div
          className={cn(
            "h-full bg-zinc-900 transition-transform duration-300",
            isMobile
              ? selectedConversationDetails
                ? "w-full"
                : "hidden"
              : selectedConversationDetails
                ? "flex-1 md:w-1/3"
                : "flex-1 md:w-1/3"
          )}
        >
          {selectedConversationDetails ? (
            <MessagingArea
              conversationId={selectedConversationDetails.conversationId}
              otherParticipant={selectedConversationDetails.otherParticipant}
              currentUserId={currentUser._id}
              onBack={handleBackToConversationList}
              isMobile={isMobile}
              // If you have a handler for profile clicks/photos, pass a callback here to setProfileModalUserId and setProfileModalOpen
            />
          ) : (
            <div className="flex items-center justify-center h-full bg-zinc-900">
              <div className="text-center p-8">
                <MessageCircle className="w-16 h-16 text-zinc-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">
                  Welcome to Chats
                </h3>
                <p className="text-zinc-400 mb-4">
                  Select a conversation from the list to start messaging
                </p>
                <div className="flex items-center justify-center gap-2 text-sm text-zinc-500">
                  <Users className="w-4 h-4" />
                  <span>Find people on the map to start conversations</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Profile Preview (right column) */}
        <div className="h-full bg-zinc-900 border-l border-zinc-800 transition-transform duration-300 flex-1 md:w-1/3 overflow-y-auto">
          {profileModalOpen && profileModalUserId ? (
            <ProfileModal
              open={profileModalOpen}
              onOpenChange={handleProfileModalOpenChange}
              userId={profileModalUserId}
              onBack={() => setProfileModalOpen(false)}
              onStartChat={handleStartChat}
              currentUserProfileForMap={null}
              columnMode={true}
            />
          ) : (
            /* Empty State - Piggies Pro Advertisement */
            <div className="h-full flex flex-col p-6">
              {/* Subscription Advertisement */}
              <div className="bg-gradient-to-br from-purple-500/10 via-pink-500/10 via-orange-500/10 to-yellow-500/10 border border-purple-500/20 rounded-xl p-6 backdrop-blur-sm flex-1 flex flex-col justify-start">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 rounded-xl flex items-center justify-center">
                    <span className="text-white font-bold text-xl">★</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">
                      Upgrade to Piggies Pro
                    </h3>
                    <p className="text-purple-300 text-sm">
                      Unlock unlimited possibilities
                    </p>
                  </div>
                </div>

                <div className="space-y-4 mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full"></div>
                    <span className="text-zinc-200 text-sm">
                      View unlimited profiles
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-gradient-to-r from-pink-400 to-orange-400 rounded-full"></div>
                    <span className="text-zinc-200 text-sm">
                      Advanced search filters
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-gradient-to-r from-orange-400 to-yellow-400 rounded-full"></div>
                    <span className="text-zinc-200 text-sm">
                      Priority messaging
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-gradient-to-r from-yellow-400 to-green-400 rounded-full"></div>
                    <span className="text-zinc-200 text-sm">
                      Enhanced privacy controls
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-gradient-to-r from-green-400 to-blue-400 rounded-full"></div>
                    <span className="text-zinc-200 text-sm">
                      Premium support
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full"></div>
                    <span className="text-zinc-200 text-sm">
                      Early access to new features
                    </span>
                  </div>
                </div>

                <Button className="w-full bg-gradient-to-r from-purple-500 via-pink-500 via-orange-500 to-yellow-500 hover:from-purple-600 hover:via-pink-600 hover:via-orange-600 hover:to-yellow-600 text-white font-semibold py-4 rounded-lg transition-all duration-200 transform hover:scale-105 text-lg">
                  Upgrade Now - $9.99/month
                </Button>

                <p className="text-zinc-400 text-xs text-center mt-4">
                  Cancel anytime • 7-day free trial
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
