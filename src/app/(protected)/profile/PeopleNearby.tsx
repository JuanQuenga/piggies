import React, { useState } from "react";
import { TileView } from "./TileView";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import {
  Filter,
  SlidersHorizontal,
  MapPin,
  ChevronDown,
  Eye,
  Home,
  Users,
  Car,
  Hotel,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../../../components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../../components/ui/dropdown-menu";
import { Switch } from "../../../components/ui/switch";
import { Label } from "../../../components/ui/label";
import { Id } from "../../../../convex/_generated/dataModel";
import { Separator } from "../../../components/ui/separator";
import { cn } from "../../../lib/utils";

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
  const [lookingFilter, setLookingFilter] = useState<
    "all" | "looking" | "not-looking"
  >("all");
  const [hostingFilter, setHostingFilter] = useState<string>("all");

  // Hosting status options for filter
  const hostingOptions = [
    { value: "all", label: "All Hosting Status", icon: Home },
    { value: "not-hosting", label: "Can't Host", icon: Home },
    { value: "hosting", label: "Hosting", icon: Home },
    { value: "hosting-group", label: "Group Host", icon: Users },
    { value: "gloryhole", label: "Gloryhole", icon: Home },
    { value: "hotel", label: "Hotel", icon: Hotel },
    { value: "car", label: "Car", icon: Car },
    { value: "cruising", label: "Cruising", icon: MapPin },
  ];

  const FilterControls = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>Show Online Only</Label>
        <Switch checked={showOnlineOnly} onCheckedChange={setShowOnlineOnly} />
      </div>

      <div className="space-y-2">
        <Label>Looking Status</Label>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-full justify-between">
              <span>
                {lookingFilter === "all" && "All Users"}
                {lookingFilter === "looking" && "Looking Only"}
                {lookingFilter === "not-looking" && "Not Looking"}
              </span>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-full">
            <DropdownMenuItem onClick={() => setLookingFilter("all")}>
              <Eye className="w-4 h-4 mr-2" />
              All Users
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setLookingFilter("looking")}>
              <Eye className="w-4 h-4 mr-2 text-green-400" />
              Looking Only
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setLookingFilter("not-looking")}>
              <Eye className="w-4 h-4 mr-2 text-zinc-400" />
              Not Looking
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="space-y-2">
        <Label>Hosting Status</Label>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-full justify-between">
              <span>
                {hostingOptions.find((option) => option.value === hostingFilter)
                  ?.label || "All Hosting Status"}
              </span>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-full">
            {hostingOptions.map((option) => {
              const IconComponent = option.icon;
              return (
                <DropdownMenuItem
                  key={option.value}
                  onClick={() => setHostingFilter(option.value)}
                >
                  <IconComponent className="w-4 h-4 mr-2" />
                  {option.label}
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
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
              {currentUserProfileForMap?.isLooking ? "Looking" : "Hidden"}
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
          lookingFilter={lookingFilter}
          hostingFilter={hostingFilter}
        />
      </div>
    </div>
  );
};
