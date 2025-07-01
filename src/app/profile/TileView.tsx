"use client";

import React from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Separator } from "../../components/ui/separator";
import {
  MapPin,
  Clock,
  MessageCircle,
  MoreVertical,
  ShieldCheck,
} from "lucide-react";

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

interface TileViewProps {
  currentUserId: Id<"users"> | null | undefined;
  onStartChat: (userId: Id<"users">) => void;
  onProfileClick: (userId: Id<"users">) => void;
  currentUserProfileForMap?: UserMarkerDisplayData | null;
}

function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
  unit: "mi" | "km" = "mi"
) {
  const toRad = (x: number) => (x * Math.PI) / 180;
  const R = unit === "mi" ? 3958.8 : 6371; // Radius of Earth in miles or km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export const TileView: React.FC<TileViewProps> = ({
  currentUserId,
  onStartChat,
  onProfileClick,
  currentUserProfileForMap,
}) => {
  const visibleUsers = useQuery(api.profiles.listVisibleUsers) || [];

  const filteredUsers = visibleUsers.filter(
    (user) => user.userId !== currentUserId
  );

  const currentLat = currentUserProfileForMap?.latitude;
  const currentLon = currentUserProfileForMap?.longitude;

  if (visibleUsers.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center">
          <div className="text-6xl mb-4">🌍</div>
          <h3 className="text-xl font-semibold text-primary mb-2">
            No profiles visible
          </h3>
          <p className="text-muted-foreground">
            Be the first to share your location and become visible to others!
          </p>
        </div>
      </div>
    );
  }

  if (filteredUsers.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center">
          <div className="text-6xl mb-4">👋</div>
          <h3 className="text-xl font-semibold text-primary mb-2">
            You're the only one here
          </h3>
          <p className="text-muted-foreground">
            Share your location to connect with others nearby!
          </p>
        </div>
      </div>
    );
  }

  // Attach distance to each user for sorting
  const usersWithDistance = filteredUsers.map((user) => {
    let distance = undefined;
    if (
      currentLat !== undefined &&
      currentLon !== undefined &&
      user.latitude !== undefined &&
      user.longitude !== undefined
    ) {
      distance = haversineDistance(
        currentLat,
        currentLon,
        user.latitude,
        user.longitude,
        "mi"
      );
    }
    return { ...user, _distance: distance };
  });

  // Sort by distance (nearest first), users without distance at the end
  usersWithDistance.sort((a, b) => {
    if (a._distance === undefined && b._distance === undefined) return 0;
    if (a._distance === undefined) return 1;
    if (b._distance === undefined) return -1;
    return a._distance - b._distance;
  });

  return (
    <div className="flex-1 p-4">
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-primary mb-1">People Nearby</h2>
        <p className="text-muted-foreground">
          {filteredUsers.length}{" "}
          {filteredUsers.length === 1 ? "person" : "people"} visible
        </p>
      </div>

      {/* Debug Panel */}
      <div className="mb-4 p-3 bg-card border border-border rounded-lg">
        <h4 className="text-sm font-semibold text-foreground mb-2">
          Debug Info
        </h4>
        <div className="text-xs space-y-1 text-muted-foreground">
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
          <div>Total visible users: {visibleUsers.length}</div>
          <div>Filtered users (excluding you): {filteredUsers.length}</div>
          <div>
            Users with distance:{" "}
            {usersWithDistance.filter((u) => u._distance !== undefined).length}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {usersWithDistance.map((user) => {
          const finalAvatarUrl =
            user.avatarUrl ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(
              user.displayName || user.userName || user.userEmail || "U"
            )}&background=8b5cf6&color=fff&size=128`;

          const lastSeenText = user.lastSeen
            ? new Date(user.lastSeen).toLocaleString()
            : "Unknown";

          let distanceDisplay = "--";
          if (
            currentLat !== undefined &&
            currentLon !== undefined &&
            user.latitude !== undefined &&
            user.longitude !== undefined
          ) {
            const distMi = haversineDistance(
              currentLat,
              currentLon,
              user.latitude,
              user.longitude,
              "mi"
            );
            const distKm = haversineDistance(
              currentLat,
              currentLon,
              user.latitude,
              user.longitude,
              "km"
            );
            distanceDisplay = `${distMi.toFixed(1)} mi / ${distKm.toFixed(1)} km`;
          }

          return (
            <Card
              key={user._id}
              className="hover:shadow-lg transition-shadow duration-200 cursor-pointer group bg-card border border-border rounded-xl"
              tabIndex={0}
              aria-label={`Profile of ${user.displayName || user.userName || "Anonymous User"}`}
              onClick={() => onProfileClick(user.userId)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onProfileClick(user.userId);
                }
              }}
            >
              <CardHeader className="pb-3 flex flex-row items-center gap-3">
                <img
                  src={finalAvatarUrl}
                  alt={user.displayName || user.userName || "User"}
                  className="w-14 h-14 rounded-full object-cover border-2 border-primary shadow"
                />
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-lg truncate text-primary">
                    {user.displayName || user.userName || "Anonymous User"}
                  </CardTitle>
                  {user.status && (
                    <Badge variant="secondary" className="text-xs mt-1">
                      {user.status}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="pt-0 pb-4">
                {user.description && (
                  <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                    {user.description}
                  </p>
                )}
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                  <span>Last seen:</span>
                  <span>{lastSeenText}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                  <span>Distance:</span>
                  <span>{distanceDisplay}</span>
                </div>
                <Button
                  variant="outline"
                  className="w-full mt-2 font-semibold"
                  onClick={() => onStartChat(user.userId)}
                  aria-label={`Start chat with ${user.displayName || user.userName || "Anonymous User"}`}
                >
                  Message
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
