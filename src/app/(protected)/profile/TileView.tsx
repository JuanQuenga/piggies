"use client";

import React, { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { Button } from "../../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { Separator } from "../../../components/ui/separator";
import { Input } from "../../../components/ui/input";
import {
  MapPin,
  Users,
  MessageCircle,
  Settings,
  X,
  User,
  Mail,
  Phone,
  Globe,
  Calendar,
  Map,
  Search,
  Filter,
  Eye,
} from "lucide-react";
import { cn } from "../../../lib/utils";
import { formatDistanceToNow } from "date-fns";
import { ProfileModal } from "./ProfileModal";

interface UserMarkerDisplayData {
  _id: Id<"profiles">;
  userId: Id<"users">;
  displayName?: string | null;
  description?: string | null;
  userName?: string | null;
  userEmail?: string | null;
  avatarUrl?: string | null;
  // Status fields from status table
  status?: {
    _id: Id<"status">;
    isVisible: boolean;
    isLocationEnabled: boolean;
    latitude?: number;
    longitude?: number;
    locationRandomization?: number;
    hostingStatus?: string;
    lastSeen: number;
  } | null;
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

// Utility function to apply location randomization offset
function applyLocationRandomization(
  latitude: number,
  longitude: number,
  randomizationFeet: number
): { lat: number; lon: number } {
  if (randomizationFeet <= 0) {
    return { lat: latitude, lon: longitude };
  }

  // Convert feet to degrees (approximate)
  // 1 degree of latitude ≈ 69 miles ≈ 364,320 feet
  // 1 degree of longitude ≈ 69 * cos(latitude) miles ≈ 364,320 * cos(latitude) feet
  const feetPerDegreeLat = 364320;
  const feetPerDegreeLon = 364320 * Math.cos((latitude * Math.PI) / 180);

  // Generate random offset within the randomization radius
  const randomAngle = Math.random() * 2 * Math.PI;
  const randomDistance = Math.random() * randomizationFeet;

  const latOffset = (randomDistance * Math.cos(randomAngle)) / feetPerDegreeLat;
  const lonOffset = (randomDistance * Math.sin(randomAngle)) / feetPerDegreeLon;

  return {
    lat: latitude + latOffset,
    lon: longitude + lonOffset,
  };
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

// Update any code that accesses status fields to use the status object
const getMarkerPosition = (user: UserMarkerDisplayData) => {
  if (
    !user.status?.isLocationEnabled ||
    !user.status?.latitude ||
    !user.status?.longitude
  ) {
    return null;
  }

  // Apply location randomization if set
  const randomization = user.status.locationRandomization || 0;
  const lat = user.status.latitude + (Math.random() - 0.5) * randomization;
  const lng = user.status.longitude + (Math.random() - 0.5) * randomization;

  return { lat, lng };
};

const getLastSeen = (user: UserMarkerDisplayData) => {
  return user.status?.lastSeen
    ? formatDistanceToNow(user.status.lastSeen)
    : "Unknown";
};

const isUserVisible = (user: UserMarkerDisplayData) => {
  return user.status?.isVisible ?? false;
};

export const TileView: React.FC<TileViewProps> = ({
  currentUserId,
  onStartChat,
  onProfileClick,
  currentUserProfileForMap,
  searchQuery,
  showOnlineOnly,
  showWithinMiles,
}) => {
  const [selectedUserId, setSelectedUserId] =
    React.useState<Id<"users"> | null>(null);

  const visibleUsers = useQuery(api.profiles.listVisibleUsers) || [];

  // For debugging: show current user too
  let filteredUsers = visibleUsers;
  // let filteredUsers = visibleUsers.filter(
  //   (user) => user.userId !== currentUserId
  // );

  // Apply search filter
  if (searchQuery) {
    const query = searchQuery.toLowerCase();
    filteredUsers = filteredUsers.filter((user: any) => {
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
      (user: any) => user.lastSeen && user.lastSeen > fiveMinutesAgo
    );
  }

  const currentLat = currentUserProfileForMap?.status?.latitude;
  const currentLon = currentUserProfileForMap?.status?.longitude;
  const currentRandomization =
    currentUserProfileForMap?.status?.locationRandomization || 0;

  // Apply randomization to current user's coordinates
  const randomizedCoords =
    currentLat && currentLon
      ? applyLocationRandomization(currentLat, currentLon, currentRandomization)
      : { lat: currentLat, lon: currentLon };

  // Attach distance to each user for sorting and filtering
  const usersWithDistance = filteredUsers.map((user: any) => {
    let distance = undefined;
    if (
      randomizedCoords.lat !== undefined &&
      randomizedCoords.lon !== undefined &&
      user.latitude !== undefined &&
      user.longitude !== undefined
    ) {
      // Apply randomization to other users' coordinates as well
      const userRandomization = user.locationRandomization || 0;
      const userRandomizedCoords = applyLocationRandomization(
        user.latitude,
        user.longitude,
        userRandomization
      );

      distance = haversineDistance(
        randomizedCoords.lat,
        randomizedCoords.lon,
        userRandomizedCoords.lat,
        userRandomizedCoords.lon,
        "mi"
      );
    }
    return { ...user, _distance: distance };
  });

  // Apply distance filter
  if (showWithinMiles !== null) {
    usersWithDistance.filter((user: any) => {
      if (user._distance === undefined) return false;
      return user._distance <= showWithinMiles;
    });
  }

  // Sort by distance (nearest first), users without distance at the end
  usersWithDistance.sort((a: any, b: any) => {
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
    <div className="flex h-full">
      {/* Left: Tiles */}
      <div className="flex-1 overflow-hidden">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {usersWithDistance.map((user: any) => {
            const finalAvatarUrl =
              user.avatarUrl ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(
                user.displayName || user.userName || user.userEmail || "U"
              )}&background=8b5cf6&color=fff&size=512`;

            const isOnline =
              user.lastSeen && user.lastSeen > Date.now() - 5 * 60 * 1000;

            // Hosting status configuration (matching StatusControls.tsx)
            const hostingStatusConfig = {
              "not-hosting": {
                label: "Not hosting",
                color: "text-zinc-400",
              },
              hosting: {
                label: "I'm hosting",
                color: "text-green-400",
              },
              "hosting-group": {
                label: "I'm hosting a group",
                color: "text-purple-400",
              },
              gloryhole: {
                label: "I have a gloryhole set up",
                color: "text-pink-400",
              },
              hotel: {
                label: "I'm hosting in my hotel room",
                color: "text-blue-400",
              },
              car: {
                label: "I'm hosting in my car",
                color: "text-yellow-400",
              },
              cruising: {
                label: "I'm at a cruising spot.",
                color: "text-red-400",
              },
            };

            const statusConfig =
              hostingStatusConfig[
                user.hostingStatus as keyof typeof hostingStatusConfig
              ] || hostingStatusConfig["not-hosting"];

            return (
              <div
                key={user._id}
                className="group relative cursor-pointer hover:bg-zinc-800/20 transition-all duration-200"
                onClick={() => setSelectedUserId(user.userId)}
              >
                {/* Avatar Section - Edge to edge */}
                <div className="relative aspect-square">
                  <img
                    src={finalAvatarUrl}
                    alt={user.displayName || user.userName || "User"}
                    className="w-full h-full object-cover"
                  />

                  {/* Overlay gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

                  {/* Status indicators */}
                  <div className="absolute top-3 right-3 flex items-center gap-2">
                    {/* Online indicator */}
                    {isOnline && (
                      <div className="w-3 h-3 bg-green-500 rounded-full ring-2 ring-white/20 animate-pulse" />
                    )}

                    {/* Distance badge */}
                    {user._distance !== undefined && (
                      <div className="px-2 py-1 bg-black/70 backdrop-blur-sm rounded-md">
                        <span className="text-xs font-medium text-white">
                          {user._distance.toFixed(1)} mi
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Content Section - Overlaid on image */}
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    {/* Name with looking indicator */}
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-white text-lg truncate">
                        {user.displayName || user.userName || "Anonymous User"}
                      </h3>
                      {isOnline && (
                        <Eye className="w-4 h-4 text-green-400 flex-shrink-0" />
                      )}
                    </div>

                    {/* Description */}
                    {user.description && (
                      <p className="text-white/90 text-sm mb-2 line-clamp-2">
                        {user.description}
                      </p>
                    )}

                    {/* Hosting status */}
                    {user.hostingStatus && (
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-sm font-medium ${statusConfig.color}`}
                        >
                          {statusConfig.label}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {/* Right: Profile Panel */}
      <div className="w-full max-w-lg h-full border-l border-zinc-800/50 bg-zinc-900/95 backdrop-blur hidden md:block">
        {selectedUserId && (
          <ProfileModal
            open={true}
            onOpenChange={() => setSelectedUserId(null)}
            userId={selectedUserId}
            onBack={() => setSelectedUserId(null)}
            onStartChat={onStartChat}
            currentUserProfileForMap={
              currentUserProfileForMap?.status
                ? {
                    latitude: currentUserProfileForMap.status.latitude,
                    longitude: currentUserProfileForMap.status.longitude,
                  }
                : null
            }
            columnMode={true}
          />
        )}
      </div>
    </div>
  );
};
