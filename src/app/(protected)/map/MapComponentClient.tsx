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
  MapPinOff,
  Home,
} from "lucide-react";
import { cn } from "../../../lib/utils";
import { useAuth } from "@workos-inc/authkit-nextjs/components";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { ProfileModal } from "../profile/ProfileModal";
import { Car, Hotel } from "lucide-react";
import { useLocation } from "../../../components/common/LocationContext";

// Hosting status configuration (matching StatusControls.tsx)
const hostingStatusConfig = {
  "not-hosting": {
    label: "Not hosting",
    icon: Home,
    color: "border-zinc-400",
    iconColor: "text-zinc-400",
    bgColor: "bg-zinc-400/20",
  },
  hosting: {
    label: "I'm hosting",
    icon: Home,
    color: "border-green-400",
    iconColor: "text-green-400",
    bgColor: "bg-green-400/20",
  },
  "hosting-group": {
    label: "I'm hosting a group",
    icon: Users,
    color: "border-purple-400",
    iconColor: "text-purple-400",
    bgColor: "bg-purple-400/20",
  },
  gloryhole: {
    label: "I have a gloryhole set up",
    icon: Home,
    color: "border-pink-400",
    iconColor: "text-pink-400",
    bgColor: "bg-pink-400/20",
  },
  hotel: {
    label: "I'm hosting in my hotel room",
    icon: Hotel,
    color: "border-blue-400",
    iconColor: "text-blue-400",
    bgColor: "bg-blue-400/20",
  },
  car: {
    label: "I'm hosting in my car",
    icon: Car,
    color: "border-yellow-400",
    iconColor: "text-yellow-400",
    bgColor: "bg-yellow-400/20",
  },
  cruising: {
    label: "I'm at a cruising spot.",
    icon: MapPin,
    color: "border-red-400",
    iconColor: "text-red-400",
    bgColor: "bg-red-400/20",
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
const Polyline = dynamic(
  () => import("react-leaflet").then((mod) => mod.Polyline),
  { ssr: false }
);
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

// Utility function to apply location randomization offset (copied from TileView)
function applyLocationRandomization(
  latitude: number,
  longitude: number,
  randomizationFeet: number
): { lat: number; lng: number } {
  if (randomizationFeet <= 0) {
    return { lat: latitude, lng: longitude };
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
    lng: longitude + lonOffset,
  };
}

export default function MapComponentClient({
  className,
}: MapComponentClientProps) {
  const { user } = useAuth();
  const router = useRouter();
  const {
    locationState,
    updateCoordinates,
    enableLocation,
    disableLocation,
    requestLocationPermission,
  } = useLocation();
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [mounted, setMounted] = useState(false);
  const [isRequestingLocation, setIsRequestingLocation] = useState(false);
  const [hasRequestedLocation, setHasRequestedLocation] = useState(false);
  const convexUser = useQuery(
    api.users.currentLoggedInUser,
    user?.email ? { email: user.email } : "skip"
  );
  const loading = !convexUser;

  // Get current user's status to access locationRandomization
  const userStatus = useQuery(
    api.status.getCurrentUserStatus,
    convexUser ? { userId: convexUser._id } : "skip"
  );

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

  // Check if geolocation permission is already granted
  const checkGeolocationPermission = useCallback(async (): Promise<boolean> => {
    if (!navigator.permissions || !navigator.permissions.query) {
      return false;
    }

    try {
      const permission = await navigator.permissions.query({
        name: "geolocation",
      });
      return permission.state === "granted";
    } catch (error) {
      console.log("Permission query not supported:", error);
      return false;
    }
  }, []);

  const requestLocation = useCallback(async () => {
    if (!canRequestLocation) {
      alert("Please wait until you are fully signed in.");
      return;
    }
    if (!navigator.geolocation) {
      alert("Geolocation not supported by your browser.");
      return;
    }

    // Prevent multiple simultaneous requests
    if (isRequestingLocation) {
      console.log("Location request already in progress, skipping...");
      return;
    }

    setIsRequestingLocation(true);

    // First ensure the user exists in Convex
    try {
      await ensureConvexUser();
      console.log("User ensured in Convex");
    } catch (error) {
      console.error("Error ensuring user in Convex:", error);
      alert("Could not verify your account. Please try again.");
      setIsRequestingLocation(false);
      return;
    }

    console.log("[DEBUG] Requesting geolocation...");
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        console.log("[DEBUG] Geolocation success:", position);
        const { latitude, longitude } = position.coords;
        updateCoordinates({ lat: latitude, lng: longitude });
        console.log("[DEBUG] Updated coordinates:", {
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
          setHasRequestedLocation(true);
        } catch (error) {
          console.error("Error setting up map status:", error);
          alert("Could not update your map status. Please try again.");
        } finally {
          setIsRequestingLocation(false);
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
        alert(message);
        setIsRequestingLocation(false);
      }
    );
  }, [
    canRequestLocation,
    setupMapStatus,
    ensureConvexUser,
    updateCoordinates,
    convexUser?._id,
    isRequestingLocation,
  ]);

  // Debug: log location state changes
  useEffect(() => {
    console.log("[DEBUG] location state:", locationState);
  }, [locationState]);

  // Debug: log visibleUsers when loaded
  useEffect(() => {
    console.log("[DEBUG] visibleUsers:", visibleUsers);
  }, [visibleUsers]);

  // Automatically request location when component is ready and permission is granted
  useEffect(() => {
    const autoRequestLocation = async () => {
      if (
        canRequestLocation &&
        mounted &&
        locationState.geoPermission === "granted" &&
        !hasRequestedLocation &&
        !isRequestingLocation
      ) {
        console.log("Permission already granted, auto-requesting location");
        requestLocation();
      } else if (!locationState.geoPermission || !mounted) {
        console.log(
          "No geolocation permission or not mounted, waiting for user interaction"
        );
      } else if (hasRequestedLocation) {
        console.log("Location already requested, skipping auto-request");
      } else if (isRequestingLocation) {
        console.log("Location request in progress, skipping auto-request");
      }
    };

    // Add a small delay to prevent rapid successive calls
    const timeoutId = setTimeout(autoRequestLocation, 100);
    return () => clearTimeout(timeoutId);
  }, [
    canRequestLocation,
    mounted,
    locationState.geoPermission,
    hasRequestedLocation,
    isRequestingLocation,
  ]);

  const handleStartChat = (userId: string) => {
    // Navigate to chat with this user
    router.push(`/chats/${userId}`);
  };

  const handleViewProfile = (userId: string) => {
    // Navigate to user profile
    router.push(`/user/${userId}`);
  };

  const handleManualLocationRefresh = useCallback(async () => {
    // Reset the flag to allow a fresh location request
    setHasRequestedLocation(false);
    setIsRequestingLocation(false);
    await requestLocation();
  }, [requestLocation]);

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

  const defaultCenter = locationState.coordinates || {
    lat: 40.7128,
    lng: -74.006,
  }; // Default to NYC or user location

  // Apply randomization to the map center if user has location enabled
  const randomizedCenter =
    locationState.coordinates && userStatus?.locationRandomization
      ? applyLocationRandomization(
          locationState.coordinates.lat,
          locationState.coordinates.lng,
          userStatus.locationRandomization
        )
      : defaultCenter;

  // Create line coordinates for the dotted line between actual and randomized location
  const locationLineCoords =
    locationState.coordinates &&
    userStatus?.locationRandomization &&
    userStatus.locationRandomization > 0
      ? [
          [locationState.coordinates.lat, locationState.coordinates.lng] as [
            number,
            number,
          ], // Actual location
          [randomizedCenter.lat, randomizedCenter.lng] as [number, number], // Randomized location
        ]
      : null;

  // Show disabled state when location is not enabled
  if (!locationState.isLocationEnabled) {
    const isMobile = false; // or detect if you want
    const buttonSize = isMobile ? "sm" : "sm";
    const iconSize = isMobile ? "w-3 h-3" : "w-4 h-4";
    const textSize = isMobile ? "text-xs" : "text-sm";
    const padding = isMobile ? "px-2 py-1" : "px-3 py-1.5";

    return (
      <div
        className={`relative h-full ${className} flex items-center justify-center bg-zinc-900`}
      >
        <div className="text-center p-8 max-w-md">
          <div className="w-20 h-20 bg-gradient-to-br from-red-500/20 to-red-600/20 rounded-full flex items-center justify-center mb-6 mx-auto">
            <MapPin className="w-10 h-10 text-red-400" />
          </div>
          <h3 className="text-xl font-bold text-white mb-3">
            Location Required
          </h3>
          <p className="text-zinc-400 text-sm leading-relaxed mb-6">
            Enable location services to view the map and see people nearby.
          </p>
          {/* Location Enable Button (copied from StatusControls) */}
          <div className="flex justify-center">
            {locationState.geoPermission !== "granted" ? (
              <Button
                variant="outline"
                size={buttonSize}
                className={cn(
                  "flex items-center gap-2 bg-transparent cursor-pointer",
                  padding,
                  "text-blue-400 border-blue-400"
                )}
                onClick={requestLocationPermission}
              >
                <MapPin className={iconSize} />
                <span className={textSize}>Share My Location</span>
              </Button>
            ) : (
              <Button
                variant="outline"
                size={buttonSize}
                className={cn(
                  "flex items-center gap-2 bg-transparent cursor-pointer",
                  padding,
                  locationState.isLocationEnabled
                    ? "text-blue-400 border-blue-400"
                    : "text-zinc-400 border-zinc-600"
                )}
                onClick={enableLocation}
              >
                {locationState.isLocationEnabled ? (
                  <MapPin className={iconSize} />
                ) : (
                  <MapPinOff className={iconSize} />
                )}
                <span className={textSize}>
                  {locationState.isLocationEnabled
                    ? locationState.currentCity
                    : "Enable Location"}
                </span>
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative h-full ${className}`}>
      {/* Map Container */}
      <MapContainer
        center={[randomizedCenter.lat, randomizedCenter.lng]}
        zoom={12}
        className="w-full h-full"
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png"
        />

        {/* Map updater for centering on user location */}
        <MapUpdater userLocation={randomizedCenter} />

        {/* Dotted line showing the relationship between actual and randomized location */}
        {locationLineCoords && (
          <Polyline
            positions={locationLineCoords}
            color="#F11A23"
            weight={2}
            opacity={0.7}
            dashArray="5, 10"
            className="location-randomization-line"
          />
        )}

        {/* Current user marker at randomized location */}
        {randomizedCenter && locationState.coordinates && (
          <Marker
            position={[randomizedCenter.lat, randomizedCenter.lng]}
            icon={L.divIcon({
              className: "current-user-marker",
              html: `
                <div class="relative group cursor-pointer transform transition-all duration-200 hover:scale-110">
                  <!-- Main pin body -->
                  <div class="relative w-20 h-20 bg-white rounded-xl shadow-lg border-3 border-red-500 overflow-hidden">
                    <!-- User photo -->
                    <img 
                      src="${convexUser?.imageUrl || "/default-avatar.png"}" 
                      alt="You"
                      class="w-full h-full object-cover"
                      onerror="this.src='/default-avatar.png'"
                    />
                    
                    <!-- Gradient overlay for better text readability -->
                    <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                    
                    <!-- User name -->
                    <div class="absolute bottom-1 left-1 right-1">
                      <p class="text-white text-xs font-semibold truncate leading-tight">
                        Your Randomized Location
                      </p>
                    </div>
                  </div>
                  
                  <!-- Current user indicator -->
                  <div class="absolute -top-2 -right-2 w-8 h-8 bg-red-500 border-2 border-red-500 rounded-full flex items-center justify-center shadow-lg backdrop-blur-sm">
                    <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
                    </svg>
                  </div>
                  
                  <!-- Pin tail -->
                  <div class="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-red-500"></div>
                  
                  <!-- Online indicator -->
                  <div class="absolute -bottom-1 -left-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white shadow-sm"></div>
                  
                  <!-- Hover tooltip -->
                  <div class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-black/90 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                    Your Randomized Location
                    <div class="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-3 border-r-3 border-t-3 border-l-transparent border-r-transparent border-t-black/90"></div>
                  </div>
                </div>
              `,
              iconSize: [80, 80],
              iconAnchor: [40, 80], // Anchor at the bottom center of the pin
            })}
          />
        )}

        {/* Actual location marker (home icon) */}
        {locationState.coordinates &&
          userStatus?.locationRandomization &&
          userStatus.locationRandomization > 0 && (
            <Marker
              position={[
                locationState.coordinates.lat,
                locationState.coordinates.lng,
              ]}
              icon={L.divIcon({
                className: "actual-location-marker",
                html: `
                <div class="relative group cursor-pointer transform transition-all duration-200 hover:scale-110">
                  <!-- Home icon marker -->
                  <div class="relative w-12 h-12 bg-white rounded-full shadow-lg border-2 border-gray-400 flex items-center justify-center">
                    <svg class="w-6 h-6 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2L2 9v13h20V9l-10-7zM12 20H4v-9l8-5.6 8 5.6v9h-8z"/>
                    </svg>
                  </div>
                  
                  <!-- Hover tooltip -->
                  <div class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-black/90 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                    Your Actual Location
                    <div class="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-3 border-r-3 border-t-3 border-l-transparent border-r-transparent border-t-black/90"></div>
                  </div>
                </div>
              `,
                iconSize: [48, 48],
                iconAnchor: [24, 48], // Anchor at the bottom center of the icon
              })}
            />
          )}

        {/* User markers */}
        {visibleUsers?.map((user) => {
          if (user.latitude && user.longitude) {
            const hostingStatus = user.hostingStatus || "not-hosting";
            const statusConfig =
              hostingStatusConfig[
                hostingStatus as keyof typeof hostingStatusConfig
              ];
            const IconComponent = statusConfig.icon;

            // Apply randomization to other users' positions
            // For now, we'll use a default randomization, but ideally you'd get each user's individual setting
            const userRandomizedCoords = applyLocationRandomization(
              user.latitude,
              user.longitude,
              500 // Default 500 feet randomization for other users
            );

            // Create custom icon for the marker - rounded square map pin design
            const customIcon = L.divIcon({
              className: "custom-marker",
              html: `
                <div class="relative group cursor-pointer transform transition-all duration-200 hover:scale-110">
                  <!-- Main pin body -->
                  <div class="relative w-20 h-20 bg-white rounded-xl shadow-lg border-3 ${statusConfig.color} overflow-hidden">
                    <!-- User photo -->
                    <img 
                      src="${user.avatarUrl || "/default-avatar.png"}" 
                      alt="${user.displayName || "User"}"
                      class="w-full h-full object-cover"
                      onerror="this.src='/default-avatar.png'"
                    />
                    
                    <!-- Gradient overlay for better text readability -->
                    <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                    
                    <!-- User name -->
                    <div class="absolute bottom-1 left-1 right-1">
                      <p class="text-white text-xs font-semibold truncate leading-tight">
                        ${user.displayName || "User"}
                      </p>
                    </div>
                  </div>
                  
                  <!-- Hosting status indicator -->
                  <div class="absolute -top-2 -right-2 w-8 h-8 ${statusConfig.bgColor} ${statusConfig.color} border-2 rounded-full flex items-center justify-center shadow-lg backdrop-blur-sm">
                    <svg class="w-4 h-4 ${statusConfig.iconColor}" fill="currentColor" viewBox="0 0 20 20">
                      ${getIconSVG(IconComponent)}
                    </svg>
                  </div>
                  
                  <!-- Pin tail -->
                  <div class="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent ${statusConfig.color}"></div>
                  
                  <!-- Online indicator -->
                  <div class="absolute -bottom-1 -left-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white shadow-sm"></div>
                  
                  <!-- Hover tooltip -->
                  <div class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-black/90 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                    ${user.displayName || "User"} - ${statusConfig.label}
                    <div class="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-3 border-r-3 border-t-3 border-l-transparent border-r-transparent border-t-black/90"></div>
                  </div>
                </div>
              `,
              iconSize: [80, 80],
              iconAnchor: [40, 80], // Anchor at the bottom center of the pin
            });

            return (
              <Marker
                key={user._id}
                position={[userRandomizedCoords.lat, userRandomizedCoords.lng]}
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
      <div className="absolute top-4 right-4 z-[1000]">
        <Button
          onClick={handleManualLocationRefresh}
          variant="secondary"
          size="sm"
          className="bg-white/90 backdrop-blur-sm"
          disabled={!canRequestLocation || isRequestingLocation}
        >
          {isRequestingLocation ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
          ) : (
            <Navigation className="w-4 h-4 mr-2" />
          )}
          {isRequestingLocation ? "Updating..." : "My Location"}
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
          randomizedCenter
            ? {
                latitude: randomizedCenter.lat,
                longitude: randomizedCenter.lng,
              }
            : null
        }
      />
    </div>
  );
}
