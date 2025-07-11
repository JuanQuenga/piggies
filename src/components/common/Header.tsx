"use client";

import { useAuth } from "@workos-inc/authkit-nextjs/components";
import { Button } from "@/components/ui/button";
import { WeatherGreeting } from "./WeatherGreeting";
import { StatusControls } from "./StatusControls";
import { useState } from "react";
import { useUnitPreference } from "./UnitPreferenceContext";
import { useEffect } from "react";

export default function Header() {
  const { user } = useAuth();
  const { isUSUnits } = useUnitPreference();
  const [weather, setWeather] = useState<{
    temp: number;
    condition: string;
  } | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(true);
  const [weatherError, setWeatherError] = useState<string | null>(null);

  useEffect(() => {
    // Don't automatically request geolocation - wait for user interaction
    setWeatherError("Click to enable weather");
    setWeatherLoading(false);
  }, [isUSUnits]);

  const handleSignOut = () => {
    window.location.href = "/api/logout";
  };

  return (
    <header className="hidden md:flex w-full bg-zinc-900 border-b border-zinc-800 items-center px-6 h-20 relative z-[50]">
      {/* Inline Status Controls */}
      <div className="flex items-center gap-3">
        <StatusControls />
      </div>
      {/* Weather */}
      <div className="flex items-center gap-6 ml-auto">
        <span className="text-slate-300 text-md flex items-center gap-2">
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
    </header>
  );
}
