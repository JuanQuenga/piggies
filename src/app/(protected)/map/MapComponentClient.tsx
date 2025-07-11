"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { Button } from "../../../components/ui/button";
import { Card, CardContent } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { Separator } from "../../../components/ui/separator";
import { Input } from "../../../components/ui/input";
import {
  MapPin,
  Users,
  MessageCircle,
  Settings,
  X,
  Navigation,
} from "lucide-react";
import { cn } from "../../../lib/utils";
import { useAuth } from "@workos-inc/authkit-nextjs/components";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { ProfileModal } from "../profile/ProfileModal";
import { Home, Car, Hotel } from "lucide-react";

// Hosting status configuration (matching StatusControls.tsx)
const hostingStatusConfig = {
  "not-hosting": {
    label: "Not hosting",
    icon: Home,
    color: "border-zinc-400",
    iconColor: "text-zinc-400",
  },
  hosting: {
    label: "I'm hosting",
    icon: Home,
    color: "border-green-400",
    iconColor: "text-green-400",
  },
  "hosting-group": {
    label: "I'm hosting a group",
    icon: Users,
    color: "border-purple-400",
    iconColor: "text-purple-400",
  },
  gloryhole: {
    label: "I have a gloryhole set up",
    icon: Home,
    color: "border-pink-400",
    iconColor: "text-pink-400",
  },
  hotel: {
    label: "I'm hosting in my hotel room",
    icon: Hotel,
    color: "border-blue-400",
    iconColor: "text-blue-400",
  },
  car: {
    label: "I'm hosting in my car",
    icon: Car,
    color: "border-yellow-400",
    iconColor: "text-yellow-400",
  },
  cruising: {
    label: "I'm at a cruising spot.",
    icon: MapPin,
    color: "border-red-400",
    iconColor: "text-red-400",
  },
} as const;

// Helper function to get SVG path for icons
function getIconSVG(IconComponent: any): string {
  // These are the SVG paths for the Lucide icons
  const iconPaths: Record<string, string> = {
    Home: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
    Users:
      "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z",
    Car: "M8 16H5a1 1 0 01-1-1V9a1 1 0 011-1h1m8 0h1a1 1 0 011 1v6a1 1 0 01-1 1h-1m-8 0v-4m0-4v4m0 0h8m-8 0H8",
    Hotel:
      "M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2zM8 5a2 2 0 012-2h2a2 2 0 012 2v2H8V5z",
    MapPin:
      "M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z",
  };

  const iconName = IconComponent.name || IconComponent.displayName;
  return iconPaths[iconName] || iconPaths.Home; // Default to Home icon
}

// Dynamically import Leaflet components to avoid SSR issues
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), {
  ssr: false,
});
import { useMap } from "react-leaflet";
import L from "leaflet";

interface MapComponentClientProps {
  className?: string;
}

// Component to handle map center updates
function MapUpdater({
  userLocation,
}: {
  userLocation: { lat: number; lng: number } | null;
}) {
  const map = useMap();

  useEffect(() => {
    if (userLocation && map) {
      map.setView([userLocation.lat, userLocation.lng], 14);
    }
  }, [userLocation, map]);

  return null;
}

export default function MapComponentClient({
  className,
}: MapComponentClientProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [isLocationEnabled, setIsLocationEnabled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const convexUser = useQuery(
    api.users.currentLoggedInUser,
    user?.email ? { email: user.email } : "skip"
  );
  const loading = !convexUser;

  // Fetch visible users from Convex
  const visibleUsers = useQuery(
    api.profiles.listVisibleUsers,
    user?.email ? {} : "skip"
  );
  const setupMapStatus = useMutation(api.profiles.setupMapStatus);
  const getOrCreateUser = useMutation(api.auth.getOrCreateUser); // or whatever your function is called

  const ensureConvexUser = useCallback(async () => {
    if (!user?.email) return;
    await getOrCreateUser({
      email: user.email,
      name: user.firstName || user.email,
    });
  }, [user, getOrCreateUser]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const canRequestLocation = user && convexUser && !loading;

  const requestLocation = useCallback(async () => {
    if (!canRequestLocation) {
      alert("Please wait until you are fully signed in.");
      return;
    }
    if (!navigator.geolocation) {
      alert("Geolocation not supported by your browser.");
      return;
    }

    // First ensure the user exists in Convex
    try {
      await ensureConvexUser();
      console.log("User ensured in Convex");
    } catch (error) {
      console.error("Error ensuring user in Convex:", error);
      alert("Could not verify your account. Please try again.");
      return;
    }

    console.log("[DEBUG] Requesting geolocation...");
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        console.log("[DEBUG] Geolocation success:", position);
        const { latitude, longitude } = position.coords;
        setUserLocation({ lat: latitude, lng: longitude });
        setIsLocationEnabled(true);
        console.log("[DEBUG] setUserLocation:", {
          lat: latitude,
          lng: longitude,
        });
        try {
          if (!convexUser?._id) {
            throw new Error("No Convex user ID available");
          }
          await setupMapStatus({
            userId: convexUser._id,
            latitude,
            longitude,
          });
          console.log("Status set up for map visibility");
        } catch (error) {
          console.error("Error setting up map status:", error);
          alert("Could not update your map status. Please try again.");
        }
      },
      (error) => {
        // Improved error handling
        console.error(
          "[DEBUG] Error getting location:",
          error,
          error?.code,
          error?.message,
          JSON.stringify(error)
        );
        // Log known properties of GeolocationPositionError
        if (error) {
          console.log(`[DEBUG] error.code =`, error.code);
          console.log(`[DEBUG] error.message =`, error.message);
          console.log(
            `[DEBUG] error.PERMISSION_DENIED =`,
            error.PERMISSION_DENIED
          );
          console.log(
            `[DEBUG] error.POSITION_UNAVAILABLE =`,
            error.POSITION_UNAVAILABLE
          );
          console.log(`[DEBUG] error.TIMEOUT =`, error.TIMEOUT);
        }
        let message =
          "Could not get your location. Please check your browser permissions.";
        if (error && typeof error === "object") {
          switch (error.code) {
            case 1:
              message =
                "Location permission denied. Please allow location access in your browser settings.";
              break;
            case 2:
              message =
                "Location unavailable. This can happen if you're on a desktop without WiFi, using a VPN, or your device can't determine your location. Try on a phone with GPS, enable WiFi, or enter your location manually if possible.";
              break;
            case 3:
              message = "Location request timed out. Please try again.";
              break;
            default:
              if (error.message) message = error.message;
          }
        }
        setIsLocationEnabled(false);
        alert(message);
      }
    );
  }, [canRequestLocation, setupMapStatus, ensureConvexUser]);

  // Debug: log userLocation state changes
  useEffect(() => {
    console.log("[DEBUG] userLocation state:", userLocation);
  }, [userLocation]);

  // Debug: log visibleUsers when loaded
  useEffect(() => {
    console.log("[DEBUG] visibleUsers:", visibleUsers);
  }, [visibleUsers]);

  // Automatically request location when component is ready
  useEffect(() => {
    if (canRequestLocation && mounted) {
      console.log("Auto-requesting location on mount");
      requestLocation();
    }
  }, [canRequestLocation, mounted, requestLocation]);

  const handleStartChat = (userId: string) => {
    // Navigate to chat with this user
    router.push(`/chats/${userId}`);
  };

  const handleViewProfile = (userId: string) => {
    // Navigate to user profile
    router.push(`/user/${userId}`);
  };

  if (!user) {
    // Redirect to sign in page
    router.push("/auth");
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-2 text-muted-foreground">
            Redirecting to sign in...
          </p>
        </div>
      </div>
    );
  }

  if (!mounted) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-2 text-zinc-400">Loading map...</p>
        </div>
      </div>
    );
  }

  const defaultCenter = userLocation || { lat: 40.7128, lng: -74.006 }; // Default to NYC or user location

  return (
    <div className={`relative h-full ${className}`}>
      {/* Map Container */}
      <MapContainer
        center={[defaultCenter.lat, defaultCenter.lng]}
        zoom={12}
        className="w-full h-full"
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png"
        />

        {/* Map updater for centering on user location */}
        <MapUpdater userLocation={userLocation} />

        {/* User markers */}
        {visibleUsers?.map((user) => {
          if (user.latitude && user.longitude) {
            const hostingStatus = user.hostingStatus || "not-hosting";
            const statusConfig =
              hostingStatusConfig[
                hostingStatus as keyof typeof hostingStatusConfig
              ];
            const IconComponent = statusConfig.icon;

            // Create custom icon for the marker
            const customIcon = L.divIcon({
              className: "custom-marker",
              html: `
                <div class="relative">
                  <img 
                    src="${user.avatarUrl || "/default-avatar.png"}" 
                    alt="${user.displayName || "User"}"
                    class="w-16 h-16 rounded-lg object-cover border-2 ${statusConfig.color} shadow-lg"
                    onerror="this.src='/default-avatar.png'"
                  />
                  <div class="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white"></div>
                  <div class="absolute -bottom-1 -left-1 w-5 h-5 ${statusConfig.iconColor} bg-black/80 rounded-full flex items-center justify-center">
                    <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      ${getIconSVG(IconComponent)}
                    </svg>
                  </div>
                </div>
              `,
              iconSize: [64, 64],
              iconAnchor: [32, 32],
            });

            return (
              <Marker
                key={user._id}
                position={[user.latitude, user.longitude]}
                icon={customIcon}
                eventHandlers={{
                  click: () => setSelectedUser(user),
                }}
              />
            );
          }
          return null;
        })}
      </MapContainer>

      {/* Location Controls */}
      <div className="absolute top-4 left-4 z-[1000]">
        <Button
          onClick={requestLocation}
          variant="secondary"
          size="sm"
          className="bg-white/90 backdrop-blur-sm"
          disabled={!canRequestLocation}
        >
          <Navigation className="w-4 h-4 mr-2" />
          My Location
        </Button>
      </div>

      {/* Profile Modal */}
      <ProfileModal
        open={!!selectedUser}
        onOpenChange={(open) => !open && setSelectedUser(null)}
        userId={selectedUser?.userId as Id<"users">}
        onBack={() => setSelectedUser(null)}
        onStartChat={(userId) => {
          setSelectedUser(null);
          handleStartChat(userId);
        }}
        currentUserProfileForMap={
          userLocation
            ? { latitude: userLocation.lat, longitude: userLocation.lng }
            : null
        }
      />
    </div>
  );
}
