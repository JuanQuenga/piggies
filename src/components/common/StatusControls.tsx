"use client";

import { useState, useEffect } from "react";
import {
  Eye,
  EyeOff,
  ChevronDown,
  MapPin,
  MapPinOff,
  Shuffle,
  Home,
  Users,
  Car,
  Hotel,
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
  const [isLookingNow, setIsLookingNow] = useState(false);
  const [hostingStatus, setHostingStatus] =
    useState<HostingStatus>("not-hosting");
  const [isLocationEnabled, setIsLocationEnabled] = useState(true);
  const [locationRandomization, setLocationRandomization] = useState([0]);
  const [currentCity, setCurrentCity] = useState<string>("Unknown");
  const [geoPermission, setGeoPermission] = useState<
    "prompt" | "granted" | "denied"
  >("prompt");

  // Track geolocation permission
  useEffect(() => {
    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions.query({ name: "geolocation" }).then((result) => {
        setGeoPermission(result.state);
        result.onchange = () => setGeoPermission(result.state);
      });
    }
  }, []);

  // Get current city from weather API
  useEffect(() => {
    if (!navigator.geolocation) {
      setCurrentCity("Unknown");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          const apiKey = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;
          if (!apiKey) {
            setCurrentCity("Unknown");
            return;
          }
          const res = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`
          );
          if (!res.ok) throw new Error("Weather fetch failed");
          const data = await res.json();
          setCurrentCity(data.name);
        } catch (e) {
          setCurrentCity("Unknown");
        }
      },
      (err) => {
        setCurrentCity("Unknown");
      }
    );
  }, []);

  const isMobile = variant === "mobile";
  const buttonSize = isMobile ? "sm" : "sm";
  const iconSize = isMobile ? "w-3 h-3" : "w-4 h-4";
  const textSize = isMobile ? "text-xs" : "text-sm";
  const padding = isMobile ? "px-2 py-1" : "px-3 py-1.5";

  return (
    <div className={cn("flex items-center gap-3", isMobile && "gap-2")}>
      {/* Looking Now Toggle */}
      <Button
        variant="outline"
        size={buttonSize}
        className={cn(
          "flex items-center gap-2 bg-transparent cursor-pointer",
          padding,
          isLookingNow
            ? "text-green-400 border-green-400"
            : "text-zinc-400 border-zinc-600"
        )}
        onClick={() => setIsLookingNow(!isLookingNow)}
      >
        {isLookingNow ? (
          <Eye className={iconSize} />
        ) : (
          <EyeOff className={iconSize} />
        )}
        <span className={textSize}>
          {isLookingNow ? "Looking" : "Not Looking"}
        </span>
      </Button>

      {/* Hosting Status Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size={buttonSize}
            className={cn(
              "flex items-center gap-2 bg-transparent cursor-pointer",
              padding,
              !isLookingNow && "opacity-50 cursor-not-allowed",
              hostingStatusConfig[hostingStatus].color
            )}
            disabled={!isLookingNow}
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
                onClick={() => setHostingStatus(key)}
              >
                <IconComponent className={cn("w-4 h-4", config.color)} />
                <span className={cn(config.color)}>{config.label}</span>
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Location Status Control */}
      {geoPermission !== "granted" ? (
        <Button
          variant="outline"
          size={buttonSize}
          className={cn(
            "flex items-center gap-2 bg-transparent cursor-pointer",
            padding,
            "text-blue-400 border-blue-400"
          )}
          onClick={() => {
            navigator.geolocation.getCurrentPosition(
              () => setGeoPermission("granted"),
              () => setGeoPermission("denied")
            );
          }}
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
            isLocationEnabled
              ? "text-blue-400 border-blue-400"
              : "text-zinc-400 border-zinc-600"
          )}
          onClick={() => setIsLocationEnabled(!isLocationEnabled)}
        >
          {isLocationEnabled ? (
            <MapPin className={iconSize} />
          ) : (
            <MapPinOff className={iconSize} />
          )}
          <span className={textSize}>
            {isLocationEnabled ? currentCity : "Location Off"}
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
        disabled={!isLocationEnabled}
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
            onValueChange={setLocationRandomization}
            max={5280} // 1 mile in feet
            step={100} // 100 feet increments
            className={isMobile ? "w-12" : "w-16"}
            disabled={!isLocationEnabled}
          />
          <span className="text-xs text-zinc-400">More</span>
        </div>
      </Button>
    </div>
  );
}
