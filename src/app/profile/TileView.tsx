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
          <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-2">
            No profiles visible
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
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
          <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-2">
            You're the only one here
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
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
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          People Nearby
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          {filteredUsers.length}{" "}
          {filteredUsers.length === 1 ? "person" : "people"} visible
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {usersWithDistance.map((user) => {
          const finalAvatarUrl =
            user.avatarUrl ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(
              user.displayName || user.userName || user.userEmail || "U"
            )}&background=random&size=128`;

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
              className="hover:shadow-lg transition-shadow duration-200 cursor-pointer group"
            >
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-3">
                  <img
                    src={finalAvatarUrl}
                    alt={user.displayName || user.userName || "User"}
                    className="w-12 h-12 rounded-full object-cover border-2 border-gray-200 dark:border-gray-700"
                  />
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg truncate">
                      {user.displayName || user.userName || "Anonymous User"}
                    </CardTitle>
                    {user.status && (
                      <Badge variant="secondary" className="text-xs mt-1">
                        {user.status}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                {user.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                    "{user.description}"
                  </p>
                )}

                <div className="space-y-2 text-xs text-gray-500 dark:text-gray-400">
                  <div className="flex items-center">
                    <span className="mr-2">📍</span>
                    <span>Distance: {distanceDisplay}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="mr-2">🕒</span>
                    <span>Last seen: {lastSeenText}</span>
                  </div>
                </div>

                <Button
                  onClick={() => onStartChat(user.userId)}
                  className="w-full mt-3 group-hover:bg-primary/90 transition-colors"
                  size="sm"
                >
                  💬 Start Chat
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
