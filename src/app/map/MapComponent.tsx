import React, { useState, useEffect, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L, { LatLngTuple } from "leaflet";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { toast } from "sonner";
import { Button } from "../../components/ui/button";

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

interface MapComponentProps {
  currentUserProfileForMap: UserMarkerDisplayData | null | undefined;
  currentUserId: Id<"users"> | null | undefined;
  onStartChat: (otherParticipantUserId: Id<"users">) => void;
}

const UserMarker: React.FC<{
  user: UserMarkerDisplayData;
  currentUserId?: Id<"users"> | null;
  onStartChat: (userId: Id<"users">) => void;
}> = ({ user, currentUserId, onStartChat }) => {
  if (!user.latitude || !user.longitude) return null;

  const finalAvatarUrl =
    user.avatarUrl ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || user.userName || user.userEmail || "U")}&background=random&size=32`;

  const icon = L.divIcon({
    className: "custom-user-marker",
    html: `<img src="${finalAvatarUrl}" alt="${user.displayName || user.userName || "User"}" style="width: 32px; height: 32px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 5px rgba(0,0,0,0.5);" />`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });

  return (
    <Marker position={[user.latitude, user.longitude]} icon={icon}>
      <Popup>
        <div className="text-sm w-48 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
          <img
            src={finalAvatarUrl}
            alt="Avatar"
            className="w-16 h-16 rounded-full object-cover mx-auto mb-2"
          />
          <p className="font-semibold text-base text-center mb-1">
            {user.displayName || user.userName || "Anonymous User"}
          </p>
          {user.description && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 italic text-center">
              "{user.description}"
            </p>
          )}
          {user.status && (
            <p className="text-gray-600 dark:text-gray-300 text-xs mb-1">
              <span className="font-medium">Status:</span> {user.status}
            </p>
          )}
          {user.lastSeen && (
            <p className="text-xs text-gray-400 dark:text-gray-500">
              Last seen: {new Date(user.lastSeen).toLocaleString()}
            </p>
          )}
          {currentUserId && user.userId !== currentUserId && (
            <Button
              onClick={() => onStartChat(user.userId)}
              className="w-full mt-2"
              size="sm"
            >
              Message
            </Button>
          )}
        </div>
      </Popup>
    </Marker>
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

export const MapComponent: React.FC<MapComponentProps> = ({
  currentUserProfileForMap,
  currentUserId,
  onStartChat,
}) => {
  const visibleUsers = useQuery(api.profiles.listVisibleUsers) || [];
  const updateProfile = useMutation(api.profiles.updateMyProfile);

  const [currentPosition, setCurrentPosition] = useState<LatLngTuple | null>(
    null
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

  const handleShareLocation = () => {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setCurrentPosition([latitude, longitude]);
        try {
          await updateProfile({
            latitude,
            longitude,
            isVisible: true,
          });
          toast.success("Location updated and visible!");
        } catch (error) {
          console.error("Failed to update location:", error);
          toast.error("Failed to update location.");
        }
      },
      (error) => {
        console.error("Error getting location:", error);
        toast.error(
          "Could not get your location. Please ensure location services are enabled."
        );
      },
      { enableHighAccuracy: true }
    );
  };

  return (
    <div className="h-[calc(100vh-200px)] w-full relative md:h-[calc(100vh-120px)]">
      <MapContainer
        center={mapCenter}
        zoom={mapInitialZoom}
        scrollWheelZoom={true}
        style={{ height: "100%", width: "100%" }}
      >
        <DarkTileLayer />
        {allMarkersToDisplay.map((user) => (
          <UserMarker
            key={user.userId}
            user={user}
            currentUserId={currentUserId}
            onStartChat={onStartChat}
          />
        ))}
        <CenterMapToUser position={currentPosition} />
      </MapContainer>
      <div className="absolute bottom-4 right-4 z-[1000] flex space-x-2">
        <Button onClick={handleShareLocation} className="shadow-lg">
          {currentPosition ? "Update My Location" : "Share My Location"}
        </Button>
      </div>
    </div>
  );
};
