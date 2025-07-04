"use client";

import { useState, useEffect } from "react";
import {
  Bell,
  Home,
  Users,
  Car,
  Hotel,
  Eye,
  EyeOff,
  ChevronDown,
  MapPin,
  MapPinOff,
  Shuffle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SignOutButton } from "@/app/auth";
import { useConvexAuth } from "convex/react";
import { useUnitPreference } from "./UnitPreferenceContext";
import { api } from "../../../convex/_generated/api";
import { useMutation } from "convex/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { WeatherGreeting } from "./WeatherGreeting";
import { SmartSearch } from "./SmartSearch";
import { Input } from "@/components/ui/input";
import { StatusControls } from "./StatusControls";

// XP/Level system brainstorm
const XP_LEVELS = [
  { name: "Newbie", xp: 0 },
  { name: "Explorer", xp: 100 },
  { name: "Connector", xp: 300 },
  { name: "Socialite", xp: 700 },
  { name: "Influencer", xp: 1500 },
  { name: "Piggy Pro", xp: 3000 },
  { name: "Legend", xp: 6000 },
];

// Example XP actions (to be implemented in backend):
// - Complete profile: 100 XP (one-time)
// - Add profile photo: 50 XP (one-time)
// - Send a message: 5 XP (per unique user per day)
// - Receive a message: 2 XP (per unique user per day)
// - View a profile: 1 XP (up to 10/day)
// - Get a message reply: 10 XP (per unique user per day)
// - Daily login: 10 XP (once per day)

function getLevel(xp: number) {
  let level = XP_LEVELS[0];
  let nextLevel = XP_LEVELS[1];
  for (let i = 0; i < XP_LEVELS.length; i++) {
    if (xp >= XP_LEVELS[i].xp) {
      level = XP_LEVELS[i];
      nextLevel = XP_LEVELS[i + 1] || XP_LEVELS[i];
    }
  }
  return { level, nextLevel };
}

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

export default function Header() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const { isUSUnits } = useUnitPreference();
  // Placeholder XP value (replace with real user XP from backend)
  const [xp] = useState(220); // Example: user has 220 XP
  const { level, nextLevel } = getLevel(xp);
  const progress =
    nextLevel.xp === level.xp ? 1 : (xp - level.xp) / (nextLevel.xp - level.xp);

  // Weather state
  const [weather, setWeather] = useState<{
    temp: number;
    city: string;
    condition: string;
  } | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(true);
  const [weatherError, setWeatherError] = useState<string | null>(null);

  // Notification state (placeholder)
  const [hasNotifications, setHasNotifications] = useState(false);

  useEffect(() => {
    if (!navigator.geolocation) {
      setWeatherError("Geolocation not supported");
      setWeatherLoading(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          const apiKey = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;
          if (!apiKey) {
            setWeatherError("No weather API key");
            setWeatherLoading(false);
            return;
          }
          const units = isUSUnits ? "imperial" : "metric";
          const res = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=${units}&appid=${apiKey}`
          );
          if (!res.ok) throw new Error("Weather fetch failed");
          const data = await res.json();
          setWeather({
            temp: Math.round(data.main.temp),
            city: data.name,
            condition: data.weather?.[0]?.main || "Unknown",
          });
          setCurrentCity(data.name);
        } catch (e) {
          setWeatherError("Could not fetch weather");
        } finally {
          setWeatherLoading(false);
        }
      },
      (err) => {
        setWeatherError("Location permission denied");
        setWeatherLoading(false);
      }
    );
  }, [isUSUnits]);

  const [isLookingNow, setIsLookingNow] = useState(false);
  const [hostingStatus, setHostingStatus] =
    useState<HostingStatus>("not-hosting");
  const [isHostingDialogOpen, setIsHostingDialogOpen] = useState(false);
  const [isLocationEnabled, setIsLocationEnabled] = useState(true);
  const [locationRandomization, setLocationRandomization] = useState([0]);
  const [currentCity, setCurrentCity] = useState<string>("Unknown");

  return (
    <header className="hidden md:flex w-full bg-zinc-900 border-b border-zinc-800 items-center justify-between px-2 md:px-8 py-2 h-20 relative z-[50]">
      {/* Status Controls */}
      <div className="flex items-center gap-4">
        <StatusControls variant="desktop" />
      </div>
      {/* Smart Search */}
      <div className="flex-1 px-4">
        <SmartSearch />
      </div>

      {/* Weather Greeting */}
      <div className="flex flex-1 items-center justify-end w-full gap-4">
        <div className="flex flex-col items-start min-w-[180px]">
          <span className="text-sm text-zinc-400">
            {weatherLoading && "fetching weather..."}
            {weatherError && (
              <span className="text-red-400">weather unavailable</span>
            )}
            {weather && (
              <WeatherGreeting
                temp={weather.temp}
                condition={weather.condition}
                isUSUnits={isUSUnits}
              />
            )}
          </span>
        </div>
        {/* Notifications
        <div className="flex items-center gap-2 min-w-[60px] justify-end ml-2">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Notifications"
            className="relative"
          >
            <Bell className="w-6 h-6 text-zinc-400" />
            {hasNotifications && (
              <span className="absolute top-1 right-1 block w-2 h-2 bg-pink-400 rounded-full animate-pulse" />
            )}
          </Button>
        </div> */}

        {isLoading ? null : isAuthenticated && <SignOutButton />}
      </div>
    </header>
  );
}
