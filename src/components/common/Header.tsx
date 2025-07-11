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
    // Only request geolocation if the user has already granted permission
    if (!navigator.geolocation || navigator.permissions?.query) {
      navigator.permissions.query({ name: "geolocation" }).then((result) => {
        if (result.state === "granted") {
          // User has already granted permission, safe to request location
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
                  condition: data.weather?.[0]?.main || "Unknown",
                });
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
        } else {
          // User hasn't granted permission yet, don't request location
          setWeatherError("Location permission required");
          setWeatherLoading(false);
        }
      });
    } else {
      // Fallback for browsers that don't support permissions API
      setWeatherError("Geolocation not supported");
      setWeatherLoading(false);
    }
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
