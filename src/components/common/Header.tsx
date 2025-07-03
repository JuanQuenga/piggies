import { useUser } from "@clerk/nextjs";
import { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import { Button } from "../ui/button";
import { useAuth } from "@clerk/nextjs";
import { SignOutButton } from "../../app/auth/SignOutButton";
import { useUnitPreference } from "./UnitPreferenceContext";

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

  // Context-aware greetings
  function pickGreeting(temp: number | null, condition: string) {
    if (temp === null) return "Welcome!";
    // Use Celsius for logic
    const tC = isUSUnits && temp !== null ? ((temp - 32) * 5) / 9 : temp;
    if (condition === "Rain" || condition === "Drizzle") {
      const rainy = [
        "Don't forget your umbrella! ☔️",
        "Rainy days are for piggy puddles!",
        "Stay dry and cozy!",
        "Perfect weather for a nap!",
      ];
      return rainy[Math.floor(Math.random() * rainy.length)];
    }
    if (condition === "Snow") {
      const snowy = [
        "Bundle up, it's snowing! ❄️",
        "Snouts love snowflakes!",
        "Time for a snowball fight!",
      ];
      return snowy[Math.floor(Math.random() * snowy.length)];
    }
    if (condition === "Thunderstorm") {
      const stormy = [
        "Stay safe, it's stormy!",
        "Thunder buddies unite!",
        "Snuggle up, it's wild outside!",
      ];
      return stormy[Math.floor(Math.random() * stormy.length)];
    }
    if (condition === "Wind" || condition === "Squall") {
      const windy = [
        "Hold onto your hat!",
        "It's a blustery day!",
        "Wind in your hair, adventure in the air!",
      ];
      return windy[Math.floor(Math.random() * windy.length)];
    }
    if (tC <= 0) {
      const cold = [
        "Brrr! Stay warm!",
        "Piggy snuggles recommended!",
        "Hot cocoa time!",
      ];
      return cold[Math.floor(Math.random() * cold.length)];
    }
    if (tC >= 30) {
      const hot = [
        "It's a scorcher! Stay cool!",
        "Perfect day for ice cream!",
        "Don't forget sunscreen!",
      ];
      return hot[Math.floor(Math.random() * hot.length)];
    }
    if (condition === "Clear") {
      const clear = [
        "Sunny smiles ahead!",
        "What a beautiful day!",
        "Perfect weather for piggy adventures!",
      ];
      return clear[Math.floor(Math.random() * clear.length)];
    }
    // Default
    const neutral = [
      "Hope you find a friend!",
      "Waddle on!",
      "Keep exploring!",
      "You're a star!",
      "Shine bright!",
      "Let's make today fun!",
    ];
    return neutral[Math.floor(Math.random() * neutral.length)];
  }

  // Humanized weather message
  function getTempColor(temp: number, isFahrenheit: boolean) {
    // Convert to Celsius for consistent coloring if needed
    const tC = isFahrenheit ? ((temp - 32) * 5) / 9 : temp;
    if (tC <= 0) return "text-blue-400"; // freezing or below
    if (tC <= 10) return "text-cyan-400"; // cold
    if (tC <= 20) return "text-green-400"; // mild
    if (tC <= 28) return "text-yellow-400"; // warm
    if (tC <= 35) return "text-orange-400"; // hot
    return "text-red-500"; // very hot
  }

  function getWeatherGreeting(
    name: string | undefined,
    temp: number | null,
    greeting: string,
    isFahrenheit: boolean
  ) {
    if (temp === null) return greeting;
    const namePart = name ? name + ", " : "";
    const unit = isFahrenheit ? "°F" : "°C";
    // Pick a few templates for variety, with styled temp
    const tempSpan = (
      <span className={getTempColor(temp, isFahrenheit) + " font-semibold"}>
        {temp}
        {unit}
      </span>
    );
    const templates = [
      <>
        {namePart}it's a lovely {tempSpan} today! {greeting}
      </>,
      <>
        {namePart}enjoy the {tempSpan} weather! {greeting}
      </>,
      <>
        {namePart}the weather is {tempSpan}. {greeting}
      </>,
      <>
        {namePart}
        {greeting} It's {tempSpan} out!
      </>,
      <>
        {namePart}feeling {tempSpan}? {greeting}
      </>,
      <>
        {namePart}it's {tempSpan} right now. {greeting}
      </>,
    ];
    return templates[Math.floor(Math.random() * templates.length)];
  }

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

  return (
    <header className="w-full bg-zinc-900 border-b border-zinc-800 flex items-center justify-between px-2 md:px-8 py-2 h-20">
      {/* Main content split into three sections */}
      <div className="flex flex-1 items-center justify-between w-full gap-4">
        {/* Left: Weather and greeting */}
        <div className="flex flex-col items-start min-w-[180px]">
          <span className="text-sm text-zinc-400">
            {weatherLoading &&
              (user?.firstName ? user.firstName + ", " : "") +
                "fetching weather..."}
            {weatherError && (
              <span className="text-red-400">weather unavailable</span>
            )}
            {weather &&
              getWeatherGreeting(
                user?.firstName ?? undefined,
                weather.temp,
                pickGreeting(weather.temp, weather.condition),
                isUSUnits
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
