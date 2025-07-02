"use client";

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
  isVisible?: boolean;
  userId: Id<"users">;
}

interface MapComponentProps {
  currentUserProfileForMap: UserMarkerDisplayData | null | undefined;
  currentUserId: Id<"users"> | null | undefined;
  onStartChat: (otherParticipantUserId: Id<"users">) => void;
  onProfileClick: (userId: Id<"users">) => void;
}

export const MapComponent: React.FC<MapComponentProps> = (props) => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-2 text-zinc-400">Initializing map...</p>
        </div>
      </div>
    );
  }

  // Dynamically import the client component
  const MapComponentClient = React.lazy(() => import("./MapComponentClient"));

  return (
    <React.Suspense
      fallback={
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-2 text-zinc-400">Loading map...</p>
          </div>
        </div>
      }
    >
      <MapComponentClient {...props} />
    </React.Suspense>
  );
};
