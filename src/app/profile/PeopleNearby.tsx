import React, { useState } from "react";
import { TileView } from "./TileView";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Filter, SlidersHorizontal, MapPin } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../../components/ui/sheet";
import { Switch } from "../../components/ui/switch";
import { Label } from "../../components/ui/label";
import { Id } from "../../../convex/_generated/dataModel";
import { Separator } from "../../components/ui/separator";

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
  locationRandomization?: number;
}

interface PeopleNearbyProps {
  currentUserProfileForMap: UserMarkerDisplayData | null;
  currentUserId: Id<"users"> | null | undefined;
  onStartChat: (userId: Id<"users">) => void;
  onProfileClick: (userId: Id<"users">) => void;
}

export const PeopleNearby: React.FC<PeopleNearbyProps> = ({
  currentUserProfileForMap,
  currentUserId,
  onStartChat,
  onProfileClick,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);
  const [showWithinMiles, setShowWithinMiles] = useState<number | null>(null);

  const FilterControls = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>Show Online Only</Label>
        <Switch checked={showOnlineOnly} onCheckedChange={setShowOnlineOnly} />
      </div>
      <div className="space-y-2">
        <Label>Distance Filter</Label>
        <div className="flex gap-2">
          {[5, 10, 25, 50].map((miles) => (
            <Button
              key={miles}
              variant={showWithinMiles === miles ? "default" : "outline"}
              size="sm"
              onClick={() =>
                setShowWithinMiles(showWithinMiles === miles ? null : miles)
              }
            >
              {miles}mi
            </Button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="relative flex flex-col w-full h-full bg-transparent">
      {/* Mobile Filter Bar */}
      <div className="md:hidden sticky top-0 z-10 p-4 bg-zinc-950/80 backdrop-blur-sm border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <Input
            type="text"
            placeholder="Search people..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1"
          />
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <SlidersHorizontal className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Filter Options</SheetTitle>
              </SheetHeader>
              <div className="py-4">
                <FilterControls />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Debug Panel - Always Floating */}
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="fixed bottom-20 right-4 z-20 bg-zinc-900/80 backdrop-blur-sm"
          >
            <MapPin className="h-4 w-4 mr-2" />
            Debug Info
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom" className="h-[40vh]">
          <SheetHeader>
            <SheetTitle>Location Debug Info</SheetTitle>
          </SheetHeader>
          <div className="space-y-2 mt-4 text-sm">
            <div>
              Your profile exists: {currentUserProfileForMap ? "Yes" : "No"}
            </div>
            <div>Your User ID: {currentUserId || "None"}</div>
            <div>
              Your Latitude: {currentUserProfileForMap?.latitude || "Not set"}
            </div>
            <div>
              Your Longitude: {currentUserProfileForMap?.longitude || "Not set"}
            </div>
            <div>
              Your visibility:{" "}
              {currentUserProfileForMap?.isVisible ? "Visible" : "Hidden"}
            </div>
            <div>
              Location Randomization:{" "}
              {currentUserProfileForMap?.locationRandomization || 0} feet
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <TileView
          currentUserId={currentUserId}
          onStartChat={onStartChat}
          onProfileClick={onProfileClick}
          currentUserProfileForMap={currentUserProfileForMap}
          searchQuery={searchQuery}
          showOnlineOnly={showOnlineOnly}
          showWithinMiles={showWithinMiles}
        />
      </div>
    </div>
  );
};
