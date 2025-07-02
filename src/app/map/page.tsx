"use client";

import { useQuery } from "convex/react";
import { useAuth } from "@clerk/nextjs";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { Button } from "../../components/ui/button";
import { MapPin, Users, MessageCircle } from "lucide-react";

export default function MapPage() {
  const { isSignedIn, isLoaded } = useAuth();
  const currentUserProfile = useQuery(api.profiles.getMyProfileWithAvatarUrl);
  const currentUserId = useQuery(api.users.getMyId);

  // Show loading state while authentication is being determined
  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-2 text-zinc-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to sign in if not authenticated
  if (!isSignedIn) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-white mb-2">
            Sign in required
          </h2>
          <p className="text-zinc-400">Please sign in to view the map.</p>
          <button
            onClick={() => (window.location.href = "/")}
            className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
          >
            Go to Sign In
          </button>
        </div>
      </div>
    );
  }

  // Show loading state while user data is being fetched
  if (currentUserId === undefined || currentUserProfile === undefined) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-2 text-zinc-400">Loading map data...</p>
        </div>
      </div>
    );
  }

  const handleStartChat = (otherParticipantUserId: Id<"users">) => {
    window.location.href = "/chat";
  };

  const handleProfileClick = (userId: Id<"users">) => {
    window.location.href = `/user/${userId}`;
  };

  return (
    <div className="h-full w-full bg-zinc-950 flex flex-col">
      {/* Map Placeholder */}
      <div className="flex-1 relative bg-zinc-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-8xl mb-6">🗺️</div>
          <h1 className="text-3xl font-bold text-white mb-4">
            Interactive Map
          </h1>
          <p className="text-zinc-400 mb-8 max-w-md mx-auto text-center">
            Connect with people nearby and discover new connections in your
            area.
          </p>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
            <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-4 text-center">
              <MapPin className="w-8 h-8 text-purple-400 mx-auto mb-2" />
              <h3 className="text-white font-semibold mb-1">
                Location Sharing
              </h3>
              <p className="text-zinc-400 text-sm">
                Share your location to connect with nearby users
              </p>
            </div>

            <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-4 text-center">
              <Users className="w-8 h-8 text-purple-400 mx-auto mb-2" />
              <h3 className="text-white font-semibold mb-1">Discover People</h3>
              <p className="text-zinc-400 text-sm">
                Find and connect with people in your area
              </p>
            </div>

            <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-4 text-center">
              <MessageCircle className="w-8 h-8 text-purple-400 mx-auto mb-2" />
              <h3 className="text-white font-semibold mb-1">Start Chatting</h3>
              <p className="text-zinc-400 text-sm">
                Begin conversations with people you discover
              </p>
            </div>
          </div>

          <div className="mt-8 space-y-3">
            <Button
              onClick={() => (window.location.href = "/people")}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3"
            >
              View People Nearby
            </Button>
            <div>
              <Button
                onClick={() => (window.location.href = "/chat")}
                variant="secondary"
                className="border-zinc-700 text-purple-600 bg-zinc-800 hover:bg-zinc-700 px-6 py-3 font-semibold"
              >
                Go to Chats
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <div className="bg-zinc-900 border-t border-zinc-800 px-4 py-3">
        <div className="flex items-center justify-between text-sm">
          <div className="text-zinc-400">
            {currentUserProfile?.isVisible ? (
              <span className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                Visible on map
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                Hidden from map
              </span>
            )}
          </div>
          <div className="text-zinc-400">
            {currentUserProfile?.latitude && currentUserProfile?.longitude ? (
              <span>
                Location: {currentUserProfile.latitude.toFixed(4)},{" "}
                {currentUserProfile.longitude.toFixed(4)}
              </span>
            ) : (
              <span>Location not set</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
