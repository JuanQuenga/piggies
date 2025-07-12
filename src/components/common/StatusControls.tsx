"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { useAuth } from "@workos-inc/authkit-nextjs/components";
import { api } from "../../../convex/_generated/api";
import { useLocation } from "./LocationContext";
import {
  ChevronDown,
  MapPin,
  MapPinOff,
  Shuffle,
  Home,
  Users,
  Car,
  Hotel,
  Eye,
  Plane,
  EyeOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

type UserStatus = "online" | "looking" | "traveling" | "invisible";

const userStatusConfig = {
  online: {
    label: "Online",
    icon: null, // Custom green circle
    color: "text-green-400",
  },
  looking: {
    label: "Looking",
    icon: Eye,
    color: "text-blue-400",
  },
  traveling: {
    label: "Traveling",
    icon: Plane,
    color: "text-orange-400",
  },
  invisible: {
    label: "Invisible",
    icon: EyeOff,
    color: "text-zinc-400",
  },
} as const;

type HostingStatus =
  | "not-hosting"
  | "hosting"
  | "hosting-group"
  | "gloryhole"
  | "hotel"
  | "car"
  | "cruising";

const hostingStatusConfig = {
  "not-hosting": {
    label: "Not hosting",
    icon: Home,
    color: "text-zinc-400",
  },
  hosting: {
    label: "I'm hosting",
    icon: Home,
    color: "text-green-400",
  },
  "hosting-group": {
    label: "I'm hosting a group",
    icon: Users,
    color: "text-purple-400",
  },
  gloryhole: {
    label: "I have a gloryhole set up",
    icon: Home,
    color: "text-pink-400",
  },
  hotel: {
    label: "I'm hosting in my hotel room",
    icon: Hotel,
    color: "text-blue-400",
  },
  car: {
    label: "I'm hosting in my car",
    icon: Car,
    color: "text-yellow-400",
  },
  cruising: {
    label: "I'm at a cruising spot.",
    icon: MapPin,
    color: "text-red-400",
  },
} as const;

interface StatusControlsProps {
  variant?: "desktop" | "mobile";
}

export function StatusControls({ variant = "desktop" }: StatusControlsProps) {
  const { user } = useAuth();
  const {
    locationState,
    enableLocation,
    disableLocation,
    requestLocationPermission,
  } = useLocation();

  // Get current user's Convex ID using email
  const convexUser = useQuery(
    api.users.currentLoggedInUser,
    user?.email ? { email: user.email } : "skip"
  );

  // Get current user's status from Convex (no userId required)
  const userStatus = useQuery(
    api.status.getCurrentUserStatus,
    convexUser ? { userId: convexUser._id } : "skip"
  );
  const updateStatus = useMutation(api.status.updateCurrentUserStatus);

  // Local state (will be initialized from Convex data)
  const [currentUserStatus, setCurrentUserStatus] =
    useState<UserStatus>("online");
  const [hostingStatus, setHostingStatus] =
    useState<HostingStatus>("not-hosting");
  const [locationRandomization, setLocationRandomization] = useState([0]);

  // Initialize state from Convex data
  useEffect(() => {
    if (userStatus) {
      // Use the new activityStatus field directly
      setCurrentUserStatus(userStatus.activityStatus || "online");
      setHostingStatus(userStatus.hostingStatus as HostingStatus);
      setLocationRandomization([userStatus.locationRandomization || 0]);
    }
  }, [userStatus]);

  // Save status to Convex when it changes
  const saveStatus = async (updates: {
    userStatus?: UserStatus;
    hostingStatus?: HostingStatus;
    locationRandomization?: number;
  }) => {
    try {
      if (!convexUser) {
        console.error("No convex user available");
        return;
      }
      // Convert to new backend format
      const backendUpdates: any = { ...updates };
      if (updates.userStatus) {
        backendUpdates.activityStatus = updates.userStatus;
        // Remove old fields to avoid validation errors
        delete backendUpdates.userStatus;
      }
      await updateStatus({ ...backendUpdates, userId: convexUser._id });
    } catch (error) {
      console.error("Failed to save status:", error);
    }
  };

  // Handle user status change
  const handleUserStatusChange = async (newStatus: UserStatus) => {
    setCurrentUserStatus(newStatus);
    await saveStatus({ userStatus: newStatus });
  };

  // Handle hosting status change
  const handleHostingStatusChange = async (newStatus: HostingStatus) => {
    setHostingStatus(newStatus);
    await saveStatus({ hostingStatus: newStatus });
  };

  // Handle location randomization change
  const handleLocationRandomizationChange = async (newValue: number[]) => {
    setLocationRandomization(newValue);
    await saveStatus({ locationRandomization: newValue[0] });
  };

  // Handle location enabled toggle
  const handleLocationToggle = async () => {
    if (locationState.isLocationEnabled) {
      disableLocation();
    } else {
      await enableLocation();
    }
  };

  const isMobile = variant === "mobile";
  const buttonSize = isMobile ? "sm" : "sm";
  const iconSize = isMobile ? "w-3 h-3" : "w-4 h-4";
  const textSize = isMobile ? "text-xs" : "text-sm";
  const padding = isMobile ? "px-2 py-1" : "px-3 py-1.5";

  return (
    <div className={cn("flex items-center gap-3", isMobile && "gap-2")}>
      {/* User Status Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size={buttonSize}
            className={cn(
              "flex items-center gap-2 bg-transparent cursor-pointer",
              padding,
              userStatusConfig[currentUserStatus].color
            )}
          >
            {(() => {
              const IconComponent = userStatusConfig[currentUserStatus].icon;
              if (currentUserStatus === "online") {
                return (
                  <div
                    className={cn(
                      "w-3 h-3 rounded-full bg-green-400",
                      iconSize
                    )}
                  />
                );
              }
              return IconComponent ? (
                <IconComponent
                  className={cn(
                    iconSize,
                    userStatusConfig[currentUserStatus].color
                  )}
                />
              ) : null;
            })()}
            <span className={textSize}>
              {userStatusConfig[currentUserStatus].label}
            </span>
            <ChevronDown
              className={cn(
                iconSize,
                "ml-1",
                userStatusConfig[currentUserStatus].color
              )}
            />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className={cn("z-[9999]", isMobile ? "w-[180px]" : "w-[200px]")}
        >
          {(
            Object.entries(userStatusConfig) as [
              UserStatus,
              (typeof userStatusConfig)[keyof typeof userStatusConfig],
            ][]
          ).map(([key, config]) => {
            const IconComponent = config.icon;
            return (
              <DropdownMenuItem
                key={key}
                className={cn(
                  "flex items-center gap-2 cursor-pointer",
                  currentUserStatus === key && "bg-zinc-800"
                )}
                onClick={() => handleUserStatusChange(key)}
              >
                {key === "online" ? (
                  <div className="w-4 h-4 rounded-full bg-green-400" />
                ) : IconComponent ? (
                  <IconComponent className={cn("w-4 h-4", config.color)} />
                ) : null}
                <span className={cn(config.color)}>{config.label}</span>
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
      {/* Hosting Status Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size={buttonSize}
            className={cn(
              "flex items-center gap-2 bg-transparent cursor-pointer",
              padding,
              currentUserStatus !== "looking" &&
                "opacity-50 cursor-not-allowed",
              hostingStatusConfig[hostingStatus].color
            )}
            disabled={currentUserStatus !== "looking"}
          >
            {(() => {
              const IconComponent = hostingStatusConfig[hostingStatus].icon;
              return (
                <IconComponent
                  className={cn(
                    iconSize,
                    hostingStatusConfig[hostingStatus].color
                  )}
                />
              );
            })()}
            <span className={textSize}>
              {hostingStatusConfig[hostingStatus].label}
            </span>
            <ChevronDown
              className={cn(
                iconSize,
                "ml-1",
                hostingStatusConfig[hostingStatus].color
              )}
            />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className={cn("z-[9999]", isMobile ? "w-[180px]" : "w-[200px]")}
        >
          {(
            Object.entries(hostingStatusConfig) as [
              HostingStatus,
              (typeof hostingStatusConfig)[keyof typeof hostingStatusConfig],
            ][]
          ).map(([key, config]) => {
            const IconComponent = config.icon;
            return (
              <DropdownMenuItem
                key={key}
                className={cn(
                  "flex items-center gap-2 cursor-pointer",
                  hostingStatus === key && "bg-zinc-800"
                )}
                onClick={() => handleHostingStatusChange(key)}
              >
                <IconComponent className={cn("w-4 h-4", config.color)} />
                <span className={cn(config.color)}>{config.label}</span>
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
      {/* Location Status Control */}
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
          onClick={handleLocationToggle}
        >
          {locationState.isLocationEnabled ? (
            <MapPin className={iconSize} />
          ) : (
            <MapPinOff className={iconSize} />
          )}
          <span className={textSize}>
            {locationState.isLocationEnabled
              ? locationState.currentCity
              : "Location Off"}
          </span>
        </Button>
      )}

      {/* Location Randomizer */}
      <Button
        variant="outline"
        size={buttonSize}
        className={cn(
          "flex items-center gap-2 bg-transparent cursor-pointer",
          padding,
          locationRandomization[0] > 0
            ? "text-purple-400 border-purple-400"
            : "text-zinc-400 border-zinc-600"
        )}
        disabled={!locationState.isLocationEnabled}
      >
        <Shuffle className={iconSize} />
        <span className={textSize}>
          {locationRandomization[0] > 0
            ? `${Math.round(locationRandomization[0] / 100) * 100}ft`
            : "Randomize"}
        </span>
        <div className={cn("ml-2 flex items-center gap-1", isMobile && "ml-1")}>
          <span className="text-xs text-zinc-400">Less</span>
          <Slider
            value={locationRandomization}
            onValueChange={handleLocationRandomizationChange}
            max={10560} // 2 miles in feet
            step={100} // 100 feet increments
            className={isMobile ? "w-12" : "w-16"}
            disabled={!locationState.isLocationEnabled}
          />
          <span className="text-xs text-zinc-400">More</span>
        </div>
      </Button>
    </div>
  );
}
