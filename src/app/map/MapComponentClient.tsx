"use client";

import React, { useState, useEffect, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L, { LatLngTuple } from "leaflet";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { toast } from "sonner";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { useAuth } from "@clerk/nextjs";

// Fix for default Leaflet marker icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

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

interface MapComponentClientProps {
  currentUserProfileForMap: UserMarkerDisplayData | null | undefined;
  currentUserId: Id<"users"> | null | undefined;
  onStartChat: (otherParticipantUserId: Id<"users">) => void;
  onProfileClick: (userId: Id<"users">) => void;
}

const UserMarker: React.FC<{
  user: UserMarkerDisplayData;
  currentUserId?: Id<"users"> | null;
  onStartChat: (userId: Id<"users">) => void;
  onProfileClick: (userId: Id<"users">) => void;
}> = ({ user, currentUserId, onStartChat, onProfileClick }) => {
  if (!user.latitude || !user.longitude) return null;

  const finalAvatarUrl =
    user.avatarUrl ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || user.userName || user.userEmail || "U")}&background=8b5cf6&color=fff&size=32`;

  const icon = L.divIcon({
    className: "custom-user-marker",
    html: `<img src="${finalAvatarUrl}" alt="${user.displayName || user.userName || "User"}" style="width: 32px; height: 32px; border-radius: 50%; border: 2px solid #8b5cf6; box-shadow: 0 0 5px rgba(0,0,0,0.5);" />`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });

  return (
    <Marker
      position={[user.latitude, user.longitude]}
      icon={icon}
      eventHandlers={{
        click: () => onProfileClick(user.userId),
      }}
    />
  );
};

const CenterMapToUser: React.FC<{ position: LatLngTuple | null }> = ({
  position,
}) => {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.setView(position, map.getZoom() < 13 ? 13 : map.getZoom());
    }
  }, [position, map]);
  return null;
};

const DarkTileLayer = () => {
  const map = useMap();
  useEffect(() => {
    const darkLayer = L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
      {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      }
    );

    const lightLayer = L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
      {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      }
    );

    const updateLayer = () => {
      const isDark = document.documentElement.classList.contains("dark");
      if (isDark) {
        if (!map.hasLayer(darkLayer)) {
          map.addLayer(darkLayer);
        }
        if (map.hasLayer(lightLayer)) {
          map.removeLayer(lightLayer);
        }
      } else {
        if (!map.hasLayer(lightLayer)) {
          map.addLayer(lightLayer);
        }
        if (map.hasLayer(darkLayer)) {
          map.removeLayer(darkLayer);
        }
      }
    };

    updateLayer();

    const observer = new MutationObserver(updateLayer);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => {
      observer.disconnect();
      if (map.hasLayer(darkLayer)) map.removeLayer(darkLayer);
      if (map.hasLayer(lightLayer)) map.removeLayer(lightLayer);
    };
  }, [map]);

  return null;
};

const MapComponentClient: React.FC<MapComponentClientProps> = ({
  currentUserProfileForMap,
  currentUserId,
  onStartChat,
  onProfileClick,
}) => {
  const { isSignedIn, isLoaded } = useAuth();
  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-2 text-zinc-400">Loading map...</p>
        </div>
      </div>
    );
  }
  if (!isSignedIn) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h3 className="text-xl font-semibold text-white mb-2">
            Sign in required
          </h3>
          <p className="text-zinc-400">
            Please sign in to use the map features.
          </p>
        </div>
      </div>
    );
  }

  const visibleUsers = useQuery(api.profiles.listVisibleUsers) || [];
  const updateProfile = useMutation(api.profiles.updateMyProfile);

  // Check location permission status
  const [locationPermission, setLocationPermission] =
    useState<string>("unknown");

  useEffect(() => {
    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions.query({ name: "geolocation" }).then((result) => {
        setLocationPermission(result.state);
      });
    }
  }, []);

  const [currentPosition, setCurrentPosition] = useState<LatLngTuple | null>(
    null
  );
  const [isVisible, setIsVisible] = useState(
    currentUserProfileForMap?.isVisible ?? true
  );

  const mapCenter: LatLngTuple = useMemo(() => {
    if (currentPosition) return currentPosition;
    if (
      currentUserProfileForMap?.latitude &&
      currentUserProfileForMap?.longitude
    ) {
      return [
        currentUserProfileForMap.latitude,
        currentUserProfileForMap.longitude,
      ];
    }
    return [20, 0]; // Default center
  }, [currentPosition, currentUserProfileForMap]);

  const mapInitialZoom =
    currentUserProfileForMap?.latitude && currentUserProfileForMap?.longitude
      ? 13
      : 3;

  const allMarkersToDisplay = useMemo(() => {
    const markerMap = new Map<Id<"users">, UserMarkerDisplayData>();
    visibleUsers.forEach((user) => {
      if (user.latitude && user.longitude) {
        markerMap.set(user.userId, user as UserMarkerDisplayData);
      }
    });
    if (
      currentUserProfileForMap?.latitude &&
      currentUserProfileForMap?.longitude
    ) {
      markerMap.set(currentUserProfileForMap.userId, currentUserProfileForMap);
    }
    return Array.from(markerMap.values());
  }, [visibleUsers, currentUserProfileForMap]);

  useEffect(() => {
    if (
      currentUserProfileForMap?.latitude &&
      currentUserProfileForMap?.longitude
    ) {
      const userPos: LatLngTuple = [
        currentUserProfileForMap.latitude,
        currentUserProfileForMap.longitude,
      ];
      setCurrentPosition(userPos);
    }
  }, [currentUserProfileForMap]);

  useEffect(() => {
    if (currentUserProfileForMap?.isVisible !== undefined) {
      setIsVisible(currentUserProfileForMap.isVisible);
    }
  }, [currentUserProfileForMap?.isVisible]);

  // Get initial location when component mounts
  useEffect(() => {
    const getInitialLocation = () => {
      console.log("Attempting to get initial location...");
      console.log("Geolocation available:", !!navigator.geolocation);

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          console.log("Location received:", {
            latitude,
            longitude,
            accuracy: position.coords.accuracy,
          });
          setCurrentPosition([latitude, longitude]);
          void (async () => {
            try {
              await updateProfile({ latitude, longitude });
              console.log("Initial location saved to profile:", {
                latitude,
                longitude,
              });
              toast.success("Location updated successfully!");
            } catch (error) {
              console.error("Failed to save initial location:", error);
              toast.error("Failed to save your location to profile.");
            }
          })();
        },
        (error) => {
          console.error("Geolocation error:", error);
          console.error("Error code:", error.code);
          console.error("Error message:", error.message);

          let errorMessage = "Could not get your location.";

          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage =
                "Location access denied. Please allow location access in your browser settings.";
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage =
                "Location information unavailable. Please try again.";
              break;
            case error.TIMEOUT:
              errorMessage = "Location request timed out. Please try again.";
              break;
            default:
              errorMessage =
                "Could not get your location. Please check your browser settings.";
          }

          toast.error(errorMessage);
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 }
      );
    };

    // Get location immediately when component mounts
    getInitialLocation();
  }, [updateProfile]);

  // Auto-update location every 60 seconds if visible
  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;
    const updateLocation = () => {
      if (!isVisible) return;
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCurrentPosition([latitude, longitude]);
          void (async () => {
            try {
              await updateProfile({ latitude, longitude });
            } catch (error) {
              toast.error("Failed to auto-update location.");
            }
          })();
        },
        (error) => {
          toast.error("Could not get your location for auto-update.");
        },
        { enableHighAccuracy: true }
      );
    };
    if (isVisible) {
      updateLocation(); // Update immediately on mount/visibility
      intervalId = setInterval(updateLocation, 60000); // 60 seconds
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isVisible, updateProfile]);

  const handleToggleVisibility = async () => {
    try {
      await updateProfile({ isVisible: !isVisible });
      setIsVisible((prev) => !prev);
      toast.success(
        `You are now ${!isVisible ? "visible" : "hidden"} on the map.`
      );
      // If turning on visibility, update location immediately
      if (!isVisible) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            setCurrentPosition([latitude, longitude]);
            void (async () => {
              try {
                await updateProfile({ latitude, longitude });
              } catch (error) {
                toast.error("Failed to update location.");
              }
            })();
          },
          (error) => {
            toast.error("Could not get your location.");
          },
          { enableHighAccuracy: true }
        );
      }
    } catch (error) {
      toast.error("Failed to update visibility.");
    }
  };

  return (
    <div className="flex-1 w-full relative min-h-[400px] overflow-hidden">
      <MapContainer
        key={currentUserId || "default-map-key"}
        center={mapCenter}
        zoom={mapInitialZoom}
        scrollWheelZoom={true}
        className="w-full h-full md:h-[90vh]"
        style={{
          height: "calc(100vh - 96px - 56px)", // Full viewport height minus mobile topbar (96px) and mobile bottom nav (56px)
        }}
      >
        <DarkTileLayer />
        {allMarkersToDisplay.map((user) => (
          <UserMarker
            key={user.userId}
            user={user}
            currentUserId={currentUserId}
            onStartChat={onStartChat}
            onProfileClick={onProfileClick}
          />
        ))}
        <CenterMapToUser position={currentPosition} />
      </MapContainer>
      <div className="absolute bottom-4 right-4 z-[1000] flex flex-col items-end space-y-2">
        <label className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2 shadow-lg cursor-pointer select-none">
          <input
            type="checkbox"
            checked={isVisible}
            onChange={() => {
              void handleToggleVisibility();
            }}
            className="h-4 w-4 text-purple-600 border-zinc-700 rounded focus:ring-purple-500 bg-zinc-800"
            aria-label="Toggle visibility on map"
          />
          <span className="text-sm text-white">
            {isVisible ? "Visible on map" : "Hidden from map"}
          </span>
        </label>

        {/* Debug Panel */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 shadow-lg max-w-xs">
          <h4 className="text-sm font-semibold text-white mb-2">Debug Info</h4>
          <div className="text-xs space-y-1 text-zinc-400">
            <div>Profile exists: {currentUserProfileForMap ? "Yes" : "No"}</div>
            <div>User ID: {currentUserId || "None"}</div>
            <div>
              Latitude: {currentUserProfileForMap?.latitude || "Not set"}
            </div>
            <div>
              Longitude: {currentUserProfileForMap?.longitude || "Not set"}
            </div>
            <div>
              Is Visible: {currentUserProfileForMap?.isVisible ? "Yes" : "No"}
            </div>
            <div>
              Last Seen:{" "}
              {currentUserProfileForMap?.lastSeen
                ? new Date(currentUserProfileForMap.lastSeen).toLocaleString()
                : "Never"}
            </div>
            <div>Total visible users: {visibleUsers.length}</div>
            <div>Markers to display: {allMarkersToDisplay.length}</div>
            <div>Location permission: {locationPermission}</div>
            <div>
              Current position:{" "}
              {currentPosition
                ? `${currentPosition[0].toFixed(4)}, ${currentPosition[1].toFixed(4)}`
                : "None"}
            </div>
            <div>
              Profile updated:{" "}
              {currentUserProfileForMap?.lastSeen ? "Yes" : "No"}
            </div>
          </div>

          {/* Manual location update button */}
          <Button
            variant="outline"
            size="sm"
            className="w-full mt-3 bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-700"
            onClick={() => {
              navigator.geolocation.getCurrentPosition(
                (position) => {
                  const { latitude, longitude } = position.coords;
                  setCurrentPosition([latitude, longitude]);
                  void (async () => {
                    try {
                      await updateProfile({ latitude, longitude });
                      toast.success("Location updated!");
                    } catch (error) {
                      toast.error("Failed to update location.");
                    }
                  })();
                },
                (error) => {
                  console.error("Geolocation error:", error);
                  let errorMessage = "Could not get your location.";

                  switch (error.code) {
                    case error.PERMISSION_DENIED:
                      errorMessage =
                        "Location access denied. Please allow location access in your browser settings.";
                      break;
                    case error.POSITION_UNAVAILABLE:
                      errorMessage =
                        "Location information unavailable. Please try again.";
                      break;
                    case error.TIMEOUT:
                      errorMessage =
                        "Location request timed out. Please try again.";
                      break;
                    default:
                      errorMessage =
                        "Could not get your location. Please check your browser settings.";
                  }

                  toast.error(errorMessage);
                },
                { enableHighAccuracy: true, timeout: 10000 }
              );
            }}
          >
            Get My Location
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MapComponentClient;
