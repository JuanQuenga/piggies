"use client";

import { useAuth } from "@workos-inc/authkit-nextjs/components";
import { Button } from "@/components/ui/button";
import { WeatherGreeting } from "./WeatherGreeting";
import { StatusControls } from "./StatusControls";
import { useLocation } from "./LocationContext";
import { useState, useEffect } from "react";
import { useUnitPreference } from "./UnitPreferenceContext";

export default function Header() {
  const { user } = useAuth();
  const { isUSUnits } = useUnitPreference();
  const { locationState } = useLocation();
  const [weather, setWeather] = useState<{
    temp: number;
    condition: string;
  } | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(true);
  const [weatherError, setWeatherError] = useState<string | null>(null);

  useEffect(() => {
    const getWeather = async () => {
      if (!locationState.isLocationEnabled || !locationState.coordinates) {
        setWeatherError("Enable location to see weather");
        setWeatherLoading(false);
        return;
      }

      try {
        setWeatherLoading(true);
        const apiKey = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;
        if (!apiKey) {
          setWeatherError("Weather API key not configured");
          setWeatherLoading(false);
          return;
        }

        const res = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${locationState.coordinates.lat}&lon=${locationState.coordinates.lng}&units=metric&appid=${apiKey}`
        );
        if (!res.ok) throw new Error("Weather fetch failed");
        const data = await res.json();
        setWeather({
          temp: data.main.temp,
          condition: data.weather[0].main,
        });
        setWeatherLoading(false);
      } catch (e) {
        console.error("Error fetching weather:", e);
        setWeatherError("Failed to load weather");
        setWeatherLoading(false);
      }
    };

    getWeather();
  }, [locationState.isLocationEnabled, locationState.coordinates, isUSUnits]);

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
