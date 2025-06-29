import React from "react";
import { MapComponent } from "../map/MapComponent";
import { TileView } from "./TileView";
import { Id } from "../../../convex/_generated/dataModel";
import { Button } from "../../components/ui/button";
import { Map, LayoutGrid } from "lucide-react";

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
  viewMode: "map" | "tiles";
  setViewMode: React.Dispatch<React.SetStateAction<"map" | "tiles">>;
  currentUserProfileForMap: UserMarkerDisplayData | null;
  currentUserId: Id<"users"> | null | undefined;
  onStartChat: (otherParticipantUserId: Id<"users">) => void;
}

export const PeopleNearby: React.FC<PeopleNearbyProps> = ({
  viewMode,
  setViewMode,
  currentUserProfileForMap,
  currentUserId,
  onStartChat,
}) => {
  return (
    <div className="flex flex-col w-full h-full">
      {/* Toggle at the top */}
      <div className="flex bg-muted rounded-lg p-1 gap-2 mb-4 w-full max-w-md mx-auto">
        <Button
          onClick={() => setViewMode("map")}
          variant={viewMode === "map" ? "default" : "ghost"}
          size="sm"
          className={`flex-1 rounded-md flex items-center gap-1 sidebar-toggle-btn ${viewMode === "map" ? "active" : ""}`}
        >
          <Map className="w-4 h-4 mr-1" /> Map
        </Button>
        <Button
          onClick={() => setViewMode("tiles")}
          variant={viewMode === "tiles" ? "default" : "ghost"}
          size="sm"
          className={`flex-1 rounded-md flex items-center gap-1 sidebar-toggle-btn ${viewMode === "tiles" ? "active" : ""}`}
        >
          <LayoutGrid className="w-4 h-4 mr-1" /> Tiles
        </Button>
      </div>
      {/* Main content: Map or Tiles */}
      <div className="flex-1 w-full">
        {viewMode === "map" ? (
          <MapComponent
            currentUserProfileForMap={currentUserProfileForMap}
            currentUserId={currentUserId}
            onStartChat={onStartChat}
          />
        ) : (
          <TileView
            currentUserId={currentUserId}
            onStartChat={onStartChat}
            currentUserProfileForMap={currentUserProfileForMap}
          />
        )}
      </div>
    </div>
  );
};
