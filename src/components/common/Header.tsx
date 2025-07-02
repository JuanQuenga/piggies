import { useUser } from "@clerk/nextjs";
import { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import { Button } from "../ui/button";
import { useAuth } from "@clerk/nextjs";
import { SignOutButton } from "../../app/auth/SignOutButton";

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

export default function Header() {
  const { user } = useUser();
  const { isSignedIn, isLoaded } = useAuth();
  // Placeholder XP value (replace with real user XP from backend)
  const [xp] = useState(220); // Example: user has 220 XP
  const { level, nextLevel } = getLevel(xp);
  const progress =
    nextLevel.xp === level.xp ? 1 : (xp - level.xp) / (nextLevel.xp - level.xp);

  // Weather state
  const [weather, setWeather] = useState<{ temp: number; city: string } | null>(
    null
  );
  const [weatherLoading, setWeatherLoading] = useState(true);
  const [weatherError, setWeatherError] = useState<string | null>(null);

  // Notification state (placeholder)
  const [hasNotifications] = useState(true);

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
          const res = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`
          );
          if (!res.ok) throw new Error("Weather fetch failed");
          const data = await res.json();
          setWeather({ temp: Math.round(data.main.temp), city: data.name });
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
  }, []);

  return (
    <header className="w-full bg-zinc-900 border-b border-zinc-800 flex items-center justify-between px-2 md:px-8 py-2 h-20">
      {/* Main content split into three sections */}
      <div className="flex flex-1 items-center justify-between w-full gap-4">
        {/* Left: Weather and greeting */}
        <div className="flex flex-col items-start min-w-[180px]">
          <span className="text-sm text-zinc-400">
            Hi {user?.firstName || "User"},{" "}
            {weatherLoading && "fetching weather..."}
            {weatherError && (
              <span className="text-red-400">weather unavailable</span>
            )}
            {weather && (
              <>
                weather:{" "}
                <span className="text-blue-300 font-semibold">
                  {weather.temp}°C
                </span>
                <span className="ml-1 text-zinc-400">({weather.city})</span>
              </>
            )}
          </span>
        </div>

        {/* Center: Title and subtitle */}
        <div className="flex flex-col items-center flex-1 min-w-0">
          <h1 className="text-lg md:text-xl font-bold text-white text-center truncate">
            Bixbia,{" "}
            <span className="font-extrabold text-purple-400">
              connecting to playstation
            </span>
          </h1>
          <span
            className="w-16 md:w-24 h-1 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 rounded-full mt-1"
            aria-hidden="true"
          />
        </div>

        {/* Right: XP Progress Bar */}
        <div className="flex flex-col gap-1 items-end min-w-[200px] max-w-xs">
          <div className="flex justify-between items-center text-xs text-zinc-400 w-full">
            <span className="truncate">{level.name}</span>
            <span className="text-purple-400 font-medium">{xp} XP</span>
            <span className="truncate">{nextLevel.name}</span>
          </div>
          <div
            className="w-full h-2 md:h-3 bg-zinc-800 rounded-full overflow-hidden"
            aria-label="XP progress bar"
            role="progressbar"
            aria-valuenow={Math.round(progress * 100)}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className="h-full bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 transition-all duration-300"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
        </div>

        {/* Notifications: Far right */}
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
        </div>

        {isLoaded && isSignedIn && <SignOutButton />}
      </div>
    </header>
  );
}
