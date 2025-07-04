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
  searchQuery: string;
  showOnlineOnly: boolean;
  showWithinMiles: number | null;
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
  searchQuery,
  showOnlineOnly,
  showWithinMiles,
}) => {
  const visibleUsers = useQuery(api.profiles.listVisibleUsers) || [];

  let filteredUsers = visibleUsers.filter(
    (user) => user.userId !== currentUserId
  );

  // Apply search filter
  if (searchQuery) {
    const query = searchQuery.toLowerCase();
    filteredUsers = filteredUsers.filter((user) => {
      const displayName = (user.displayName || "").toLowerCase();
      const userName = (user.userName || "").toLowerCase();
      const description = (user.description || "").toLowerCase();
      return (
        displayName.includes(query) ||
        userName.includes(query) ||
        description.includes(query)
      );
    });
  }

  // Apply online filter
  if (showOnlineOnly) {
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
    filteredUsers = filteredUsers.filter(
      (user) => user.lastSeen && user.lastSeen > fiveMinutesAgo
    );
  }

  const currentLat = currentUserProfileForMap?.latitude;
  const currentLon = currentUserProfileForMap?.longitude;

  // Attach distance to each user for sorting and filtering
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

  // Apply distance filter
  if (showWithinMiles !== null) {
    usersWithDistance.filter((user) => {
      if (user._distance === undefined) return false;
      return user._distance <= showWithinMiles;
    });
  }

  // Sort by distance (nearest first), users without distance at the end
  usersWithDistance.sort((a, b) => {
    if (a._distance === undefined && b._distance === undefined) return 0;
    if (a._distance === undefined) return 1;
    if (b._distance === undefined) return -1;
    return a._distance - b._distance;
  });

  if (visibleUsers.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center">
          <div className="text-6xl mb-4">🌍</div>
          <h3 className="text-xl font-semibold text-white mb-2">
            No profiles visible
          </h3>
          <p className="text-zinc-400">
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
          <h3 className="text-xl font-semibold text-white mb-2">
            No matches found
          </h3>
          <p className="text-zinc-400">
            Try adjusting your filters or search criteria
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
        {usersWithDistance.map((user) => {
          const finalAvatarUrl =
            user.avatarUrl ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(
              user.displayName || user.userName || user.userEmail || "U"
            )}&background=8b5cf6&color=fff&size=128`;

          const isOnline =
            user.lastSeen && user.lastSeen > Date.now() - 5 * 60 * 1000;

          return (
            <Card
              key={user._id}
              className="hover:shadow-lg transition-shadow duration-200 cursor-pointer group bg-card border border-border rounded-xl overflow-hidden"
              onClick={() => onProfileClick(user.userId)}
            >
              <div className="aspect-square relative">
                <img
                  src={finalAvatarUrl}
                  alt={user.displayName || user.userName || "User"}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-2">
                  <h3 className="text-white font-semibold truncate">
                    {user.displayName || user.userName || "Anonymous User"}
                  </h3>
                  {user._distance !== undefined && (
                    <p className="text-xs text-white/80">
                      {user._distance.toFixed(1)} miles away
                    </p>
                  )}
                </div>
                {isOnline && (
                  <div className="absolute top-2 right-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full ring-2 ring-white" />
                  </div>
                )}
              </div>
              <CardContent className="p-2">
                <div className="flex items-center justify-between">
                  {user.status && (
                    <Badge variant="secondary" className="text-xs">
                      {user.status}
                    </Badge>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={(e) => {
                      e.stopPropagation();
                      onStartChat(user.userId);
                    }}
                  >
                    <MessageCircle className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
