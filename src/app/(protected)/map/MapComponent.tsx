"use client";

import dynamic from "next/dynamic";
import React, { useState, useEffect } from "react";
import { Id } from "../../../convex/_generated/dataModel";

interface UserMarkerDisplayData {
  _id: Id<"profiles">;
  latitude?: number;
  longitude?: number;
  status?: string | null;
  avatarUrl?: string | null;
  displayName?: string | null;
  description?: string | null;
  userName?: string | null;
  userEmail?: string | null;
  lastSeen?: number | null;
  isGhost?: boolean;
  isLooking?: boolean;
  userId: Id<"users">;
}

interface MapComponentProps {
  currentUserProfileForMap: UserMarkerDisplayData | null | undefined;
  currentUserId: Id<"users"> | null | undefined;
  onStartChat: (otherParticipantUserId: Id<"users">) => void;
  onProfileClick: (userId: Id<"users">) => void;
}

// Dynamically import the client component with SSR disabled
const MapComponentClient = dynamic(() => import("./MapComponentClient"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
        <p className="mt-2 text-zinc-400">Loading map...</p>
      </div>
    </div>
  ),
});

export const MapComponent: React.FC<MapComponentProps> = (props) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-2 text-zinc-400">Initializing map...</p>
        </div>
      </div>
    );
  }

  return <MapComponentClient {...props} />;
};
