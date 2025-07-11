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
  Home,
  Car,
  Hotel,
} from "lucide-react";
import { cn } from "../../../lib/utils";
import { formatDistanceToNow } from "date-fns";
import { ProfileModal } from "./ProfileModal";
import { MockProfileModal } from "./MockProfileModal";
import { mockUsers } from "./mockUsers";

function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState(false);
  React.useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  return isMobile;
}

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
    isLooking?: boolean;
  } | null;
}

interface TileViewProps {
  currentUserId: Id<"users"> | null | undefined;
  onStartChat: (userId: Id<"users">) => void;
  onProfileClick: (userId: Id<"users">) => void;
  currentUserProfileForMap?: UserMarkerDisplayData | null;
  searchQuery: string;
  showOnlineOnly: boolean;
  lookingFilter: "all" | "looking" | "not-looking";
  hostingFilter: string;
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
  lookingFilter,
  hostingFilter,
}) => {
  const [selectedUserId, setSelectedUserId] =
    React.useState<Id<"users"> | null>(null);
  const isMobile = useIsMobile();

  // Check if selected user is a mock user
  const isSelectedUserMock = selectedUserId
    ? mockUsers.some((user) => user.userId === selectedUserId)
    : false;

  const realUsers = useQuery(api.profiles.listAllUsersForTiles) || [];

  // For debugging: show current user too
  let filteredUsers = realUsers;
  // let filteredUsers = realUsers.filter(
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
  let usersWithDistance = filteredUsers.map((user: any) => {
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

  // Apply looking filter
  if (lookingFilter !== "all") {
    usersWithDistance = usersWithDistance.filter((user: any) => {
      if (lookingFilter === "looking") {
        return user.status?.isLooking === true;
      } else if (lookingFilter === "not-looking") {
        return user.status?.isLooking === false;
      }
      return true;
    });
  }

  // Apply hosting filter
  if (hostingFilter !== "all") {
    usersWithDistance = usersWithDistance.filter((user: any) => {
      return user.status?.hostingStatus === hostingFilter;
    });
  }

  // Sort by distance (nearest first), users without distance at the end
  usersWithDistance.sort((a: any, b: any) => {
    if (a._distance === undefined && b._distance === undefined) return 0;
    if (a._distance === undefined) return 1;
    if (b._distance === undefined) return -1;
    return a._distance - b._distance;
  });

  // Combine real users with mock users to fill the screen
  const allUsers = [...usersWithDistance, ...mockUsers];

  if (realUsers.length === 0) {
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
    <>
      <div className="flex h-full">
        {/* Left: Tiles */}
        <div className="flex-1 overflow-hidden m-0.5">
          <div className="grid grid-cols-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {allUsers.map((user: any) => {
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
                  label: "Can't Host",
                  icon: Home,
                  color: "text-zinc-400",
                  borderColor: "border-zinc-400",
                },
                hosting: {
                  label: "Hosting",
                  icon: Home,
                  color: "text-green-400",
                  borderColor: "border-green-400",
                },
                "hosting-group": {
                  label: "Group Host",
                  icon: Users,
                  color: "text-purple-400",
                  borderColor: "border-purple-400",
                },
                gloryhole: {
                  label: "Gloryhole",
                  icon: Home,
                  color: "text-pink-400",
                  borderColor: "border-pink-400",
                },
                hotel: {
                  label: "Hotel",
                  icon: Hotel,
                  color: "text-blue-400",
                  borderColor: "border-blue-400",
                },
                car: {
                  label: "Car",
                  icon: Car,
                  color: "text-yellow-400",
                  borderColor: "border-yellow-400",
                },
                cruising: {
                  label: "Cruising",
                  icon: MapPin,
                  color: "text-red-400",
                  borderColor: "border-red-400",
                },
              };

              const statusConfig =
                hostingStatusConfig[
                  user.status?.hostingStatus as keyof typeof hostingStatusConfig
                ] || hostingStatusConfig["not-hosting"];

              return (
                <div
                  key={user._id}
                  className="group relative cursor-pointer hover:bg-zinc-800/20 transition-all duration-200"
                  onClick={() => setSelectedUserId(user.userId)}
                >
                  {/* Avatar Section - Edge to edge */}
                  <div
                    className={`relative aspect-square ${user.backgroundColor || ""}`}
                  >
                    {/* For mock users with SVG, show background color and centered SVG */}
                    {user.avatarUrl === "/pig-snout.svg" ? (
                      <div className="w-full h-full flex items-center justify-center p-8">
                        <img
                          src={finalAvatarUrl}
                          alt={user.displayName || user.userName || "User"}
                          className="w-26 h-26 opacity-70"
                          style={{ filter: "brightness(0) saturate(100%)" }}
                        />
                      </div>
                    ) : (
                      <img
                        src={finalAvatarUrl}
                        alt={user.displayName || user.userName || "User"}
                        className="w-full h-full object-cover"
                      />
                    )}

                    {/* Overlay gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

                    {/* Hosting status indicator - only show if user is looking */}
                    <div className="absolute top-3 right-3">
                      {user.status?.hostingStatus && user.status?.isLooking && (
                        <div
                          className={`px-2 py-1 bg-black/70 backdrop-blur-sm rounded-md flex items-center gap-1 border ${statusConfig.borderColor}`}
                        >
                          {(() => {
                            const IconComponent = statusConfig.icon;
                            return (
                              <IconComponent
                                className={`w-3 h-3 ${statusConfig.color}`}
                              />
                            );
                          })()}
                          <span
                            className={`text-xs font-medium ${statusConfig.color}`}
                          >
                            {statusConfig.label}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Content Section - Overlaid on image */}
                    <div className="absolute bottom-0 left-0 right-0 p-2">
                      {/* Name and distance/online indicator */}
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-white text-lg truncate flex-1">
                          {user.displayName ||
                            user.userName ||
                            "Anonymous User"}
                        </h3>

                        {/* Online indicator */}
                        <div className="flex items-center gap-2 ml-2">
                          {user.status?.isLooking ? (
                            <Eye className="w-4 h-4 text-green-400" />
                          ) : isOnline ? (
                            <div className="w-3 h-3 bg-green-500 rounded-full ring-2 ring-white/20 animate-pulse" />
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        {/* Right: Profile Panel */}
        <div className="w-full max-w-lg h-full border-l border-zinc-800/50 bg-zinc-900/95 backdrop-blur hidden md:block sticky top-8">
          {selectedUserId && isSelectedUserMock ? (
            <MockProfileModal
              open={true}
              onOpenChange={() => setSelectedUserId(null)}
              userId={selectedUserId as Id<"users">}
              onBack={() => setSelectedUserId(null)}
              onStartChat={onStartChat}
              currentUserProfileForMap={
                currentUserProfileForMap?.status?.latitude !== undefined &&
                currentUserProfileForMap?.status?.longitude !== undefined
                  ? {
                      latitude: currentUserProfileForMap.status!.latitude,
                      longitude: currentUserProfileForMap.status!.longitude,
                    }
                  : null
              }
              columnMode={true}
            />
          ) : selectedUserId ? (
            <ProfileModal
              open={true}
              onOpenChange={() => setSelectedUserId(null)}
              userId={selectedUserId as Id<"users">}
              onBack={() => setSelectedUserId(null)}
              onStartChat={onStartChat}
              currentUserProfileForMap={
                currentUserProfileForMap?.status?.latitude !== undefined &&
                currentUserProfileForMap?.status?.longitude !== undefined
                  ? {
                      latitude: currentUserProfileForMap.status!.latitude,
                      longitude: currentUserProfileForMap.status!.longitude,
                    }
                  : null
              }
              columnMode={true}
            />
          ) : (
            /* Empty State - Piggies Pro Advertisement */
            <div className="h-full flex flex-col p-6">
              {/* Subscription Advertisement */}
              <div className="bg-gradient-to-br from-purple-500/10 via-pink-500/10 via-orange-500/10 to-yellow-500/10 border border-purple-500/20 rounded-xl p-6 backdrop-blur-sm flex-1 flex flex-col justify-start">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 rounded-xl flex items-center justify-center">
                    <span className="text-white font-bold text-xl">★</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">
                      Upgrade to Piggies Pro
                    </h3>
                    <p className="text-purple-300 text-sm">
                      Unlock unlimited possibilities
                    </p>
                  </div>
                </div>

                <div className="space-y-4 mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full"></div>
                    <span className="text-zinc-200 text-sm">
                      View unlimited profiles
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-gradient-to-r from-pink-400 to-orange-400 rounded-full"></div>
                    <span className="text-zinc-200 text-sm">
                      Advanced search filters
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-gradient-to-r from-orange-400 to-yellow-400 rounded-full"></div>
                    <span className="text-zinc-200 text-sm">
                      Priority messaging
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-gradient-to-r from-yellow-400 to-green-400 rounded-full"></div>
                    <span className="text-zinc-200 text-sm">
                      Enhanced privacy controls
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-gradient-to-r from-green-400 to-blue-400 rounded-full"></div>
                    <span className="text-zinc-200 text-sm">
                      Premium support
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full"></div>
                    <span className="text-zinc-200 text-sm">
                      Early access to new features
                    </span>
                  </div>
                </div>

                <Button className="w-full bg-gradient-to-r from-purple-500 via-pink-500 via-orange-500 to-yellow-500 hover:from-purple-600 hover:via-pink-600 hover:via-orange-600 hover:to-yellow-600 text-white font-semibold py-4 rounded-lg transition-all duration-200 transform hover:scale-105 text-lg">
                  Upgrade Now - $9.99/month
                </Button>

                <p className="text-zinc-400 text-xs text-center mt-4">
                  Cancel anytime • 7-day free trial
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Modal Overlay */}
      {isMobile && selectedUserId && (
        <>
          {isSelectedUserMock ? (
            <MockProfileModal
              open={true}
              onOpenChange={() => setSelectedUserId(null)}
              userId={selectedUserId as Id<"users">}
              onBack={() => setSelectedUserId(null)}
              onStartChat={onStartChat}
              currentUserProfileForMap={
                currentUserProfileForMap?.status?.latitude !== undefined &&
                currentUserProfileForMap?.status?.longitude !== undefined
                  ? {
                      latitude: currentUserProfileForMap.status!.latitude,
                      longitude: currentUserProfileForMap.status!.longitude,
                    }
                  : null
              }
              columnMode={false}
            />
          ) : (
            <ProfileModal
              open={true}
              onOpenChange={() => setSelectedUserId(null)}
              userId={selectedUserId as Id<"users">}
              onBack={() => setSelectedUserId(null)}
              onStartChat={onStartChat}
              currentUserProfileForMap={
                currentUserProfileForMap?.status?.latitude !== undefined &&
                currentUserProfileForMap?.status?.longitude !== undefined
                  ? {
                      latitude: currentUserProfileForMap.status!.latitude,
                      longitude: currentUserProfileForMap.status!.longitude,
                    }
                  : null
              }
              columnMode={false}
            />
          )}
        </>
      )}
    </>
  );
};
