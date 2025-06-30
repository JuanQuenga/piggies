import React from "react";
import { TileView } from "./TileView";
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

interface PeopleNearbyProps {
  currentUserProfileForMap: UserMarkerDisplayData | null;
  currentUserId: Id<"users"> | null | undefined;
  onStartChat: (otherParticipantUserId: Id<"users">) => void;
  onProfileClick: (userId: Id<"users">) => void;
}

export const PeopleNearby: React.FC<PeopleNearbyProps> = ({
  currentUserProfileForMap,
  currentUserId,
  onStartChat,
  onProfileClick,
}) => {
  return (
    <div className="flex flex-col w-full h-full">
      <TileView
        currentUserId={currentUserId}
        onStartChat={onStartChat}
        onProfileClick={onProfileClick}
        currentUserProfileForMap={currentUserProfileForMap}
      />
    </div>
  );
};
