"use client";

import { useAuth } from "@workos-inc/authkit-nextjs/components";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Users, LogIn, Search, Filter } from "lucide-react";
import { TileView } from "../profile/TileView";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export default function PeoplePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);
  const [showWithinMiles, setShowWithinMiles] = useState<number | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Now useQuery is called within ConvexProvider context
  const currentUserId = useQuery(
    api.users.getMyId,
    user?.email ? { email: user.email } : "skip"
  );
  const currentUserProfile = useQuery(
    api.profiles.getMyProfileWithAvatarUrl,
    currentUserId ? { userId: currentUserId } : "skip"
  );
  const getOrCreateConversationMutation = useMutation(
    api.messages.getOrCreateConversationWithParticipant
  );

  // Show loading state while user data is being fetched
  if (
    !mounted ||
    currentUserId === undefined ||
    currentUserProfile === undefined
  ) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-5rem)] bg-gradient-to-br from-purple-900/20 via-zinc-900/20 to-black/20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400 mx-auto"></div>
          <p className="mt-2 text-zinc-400">Loading people data...</p>
        </div>
      </div>
    );
  }

  const handleStartChat = async (userId: Id<"users">) => {
    try {
      if (!currentUserId) {
        console.error("Current user ID not found");
        return;
      }

      const result = await getOrCreateConversationMutation({
        currentUserId,
        otherParticipantUserId: userId,
      });
      router.push(`/chats?conversation=${result.conversationId}`);
    } catch (error) {
      console.error("Error starting chat:", error);
    }
  };

  const handleProfileClick = (userId: Id<"users">) => {
    router.push(`/user/${userId}`);
  };

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Header */}
      <div className="p-2 pt-10 md:p-6 border-b border-zinc-800">
        <div className="mb-6 hidden md:block">
          <h1 className="text-3xl font-bold text-white mb-2">People Nearby</h1>
          <p className="text-zinc-400">
            Discover and connect with people in your area.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-2 md:gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 w-4 h-4" />
            <Input
              placeholder="Search people..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-zinc-900 border-zinc-700 text-white placeholder-zinc-400"
            />
          </div>

          <div className="flex gap-2">
            <Button
              variant={showOnlineOnly ? "default" : "outline"}
              size="sm"
              onClick={() => setShowOnlineOnly(!showOnlineOnly)}
              className="bg-zinc-900 border-zinc-700 text-white hover:bg-zinc-800"
            >
              <Filter className="w-4 h-4 mr-2" />
              Online Only
            </Button>

            <div className="flex gap-1">
              {[5, 10, 25, 50].map((miles) => (
                <Button
                  key={miles}
                  variant={showWithinMiles === miles ? "default" : "outline"}
                  size="sm"
                  onClick={() =>
                    setShowWithinMiles(showWithinMiles === miles ? null : miles)
                  }
                  className="bg-zinc-900 border-zinc-700 text-white hover:bg-zinc-800"
                >
                  {miles}mi
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* TileView */}
      <div className="flex-1 overflow-auto">
        <TileView
          currentUserId={currentUserId}
          onStartChat={handleStartChat}
          onProfileClick={handleProfileClick}
          currentUserProfileForMap={currentUserProfile}
          searchQuery={searchQuery}
          showOnlineOnly={showOnlineOnly}
          showWithinMiles={showWithinMiles}
        />
      </div>
    </div>
  );
}
