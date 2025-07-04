import Link from "next/link";
import {
  Home,
  MessageCircle,
  Users,
  Map,
  Settings,
  User,
  ChevronLeft,
  ChevronRight,
  Newspaper,
  Menu,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { WeatherGreeting } from "./WeatherGreeting";
import { SmartSearch } from "./SmartSearch";
import { useUnitPreference } from "./UnitPreferenceContext";
import { SignOutButton } from "@/app/auth";
import { useClerk } from "@clerk/nextjs";
import { StatusControls } from "./StatusControls";

const navItems = [
  { href: "/profile", icon: User, label: "Profile" },
  { href: "/chats", icon: MessageCircle, label: "Chats" },
  { href: "/people", icon: Users, label: "People" },
  { href: "/map", icon: Map, label: "Map" },
];

// Mobile hamburger menu navigation items (not in bottom nav)
const mobileMenuItems = [{ href: "/blog", icon: Newspaper, label: "Blog" }];

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

export default function Sidebar({ collapsed, setCollapsed }: SidebarProps) {
  // Mobile nav state (for accessibility, not strictly needed for static nav)
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const { isUSUnits } = useUnitPreference();
  const { signOut } = useClerk();

  // Weather state for mobile header
  const [weather, setWeather] = useState<{
    temp: number;
    city: string;
    condition: string;
  } | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(true);
  const [weatherError, setWeatherError] = useState<string | null>(null);

  // Weather effect for mobile
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
    <>
      {/* Desktop Sidebar */}
      <nav
        className={cn(
          "hidden md:flex flex-col items-center bg-zinc-900 text-white h-screen py-4 border-r border-zinc-800 fixed left-0 top-0 z-30 transition-all duration-300",
          collapsed ? "w-16" : "w-48"
        )}
        aria-label="Main navigation"
      >
        {/* Pig logo at the top */}
        <div
          className={cn(
            "mb-8 mt-2 flex items-center justify-center transition-all",
            collapsed ? "w-10" : "w-32"
          )}
          aria-label="Piggies logo"
        >
          <img
            src="/pig-snout.svg"
            alt="Piggies logo"
            width={collapsed ? 32 : 32}
            height={collapsed ? 32 : 32}
          />
          {!collapsed && (
            <span className="ml-3 text-xl font-bold text-white">Piggies</span>
          )}
        </div>
        <div className="flex flex-col gap-2 flex-1 mt-4 items-stretch w-full">
          {navItems.map(({ href, icon: Icon, label }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 w-full px-3 py-2 rounded-lg hover:bg-zinc-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 transition-all",
                collapsed ? "justify-center" : "justify-start"
              )}
              aria-label={label}
            >
              <Icon className="w-6 h-6" aria-hidden="true" />
              {!collapsed && (
                <span className="text-base font-medium">{label}</span>
              )}
            </Link>
          ))}

          {/* Desktop-only navigation items */}
          {mobileMenuItems.map(({ href, icon: Icon, label }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 w-full px-3 py-2 rounded-lg hover:bg-zinc-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 transition-all",
                collapsed ? "justify-center" : "justify-start"
              )}
              aria-label={label}
            >
              <Icon className="w-6 h-6" aria-hidden="true" />
              {!collapsed && (
                <span className="text-base font-medium">{label}</span>
              )}
            </Link>
          ))}
        </div>
        {/* Collapse/Expand button */}
        <button
          className={cn(
            "mb-2 mt-auto flex items-center justify-center w-10 h-10 rounded-lg hover:bg-zinc-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 transition-all",
            collapsed ? "mx-auto" : "ml-2"
          )}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? (
            <ChevronRight className="w-6 h-6" />
          ) : (
            <ChevronLeft className="w-6 h-6" />
          )}
        </button>
        {/* Settings button pinned to bottom */}
        <div className={cn("mb-2", collapsed ? "mx-auto" : "ml-2")}>
          <Link
            href="/settings"
            className={cn(
              "flex items-center justify-center w-10 h-10 rounded-lg hover:bg-zinc-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500"
            )}
            aria-label="Settings"
          >
            <Settings className="w-6 h-6" aria-hidden="true" />
          </Link>
        </div>
      </nav>

      {/* Mobile Topbar with Header Content */}
      <nav className="md:hidden flex flex-col bg-zinc-900 text-white w-full border-b border-zinc-800 fixed top-0 left-0 z-30">
        {/* Top row: Logo left, Weather + Hamburger Menu right */}
        <div className="flex items-center justify-between h-14 px-4">
          {/* Logo - Left */}
          <div className="flex items-center gap-3" aria-label="Piggies logo">
            <img
              src="/pig-snout.svg"
              alt="Piggies logo"
              width={32}
              height={32}
            />
            <span className="text-xl font-bold text-white">Piggies</span>
          </div>

          {/* Weather Greeting + Hamburger Menu - Right */}
          <div className="flex items-center gap-4">
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
                  compact={true}
                />
              )}
            </span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="flex items-center justify-center w-10 h-10 rounded-lg hover:bg-zinc-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500"
                  aria-label="Menu"
                >
                  <Menu className="w-6 h-6" aria-hidden="true" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {/* Mobile hamburger menu navigation items */}
                {mobileMenuItems.map(({ href, icon: Icon, label }) => (
                  <DropdownMenuItem key={href} asChild>
                    <Link
                      href={href}
                      className="flex items-center gap-2 w-full"
                    >
                      <Icon className="w-4 h-4" />
                      <span>{label}</span>
                    </Link>
                  </DropdownMenuItem>
                ))}

                {/* Divider */}
                <div className="h-px bg-zinc-700 my-1" />

                {/* Settings */}
                <DropdownMenuItem asChild>
                  <Link
                    href="/settings"
                    className="flex items-center gap-2 w-full"
                  >
                    <Settings className="w-4 h-4" />
                    <span>Settings</span>
                  </Link>
                </DropdownMenuItem>

                {/* Sign Out */}
                <DropdownMenuItem
                  onClick={() => signOut()}
                  className="flex items-center gap-2 w-full text-left px-2 py-1.5 text-sm rounded-sm outline-none transition-colors focus:bg-zinc-800 focus:text-zinc-50 data-[disabled]:pointer-events-none data-[disabled]:opacity-50 cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Second row: Status Controls */}
        <div className="flex items-center gap-2 px-4 py-2 overflow-x-auto">
          <StatusControls variant="mobile" />
        </div>
      </nav>

      {/* Mobile Bottom Navbar */}
      <nav className="md:hidden flex items-center justify-around bg-zinc-900 text-white w-full h-14 px-2 border-t border-zinc-800 fixed bottom-0 left-0 z-30">
        {navItems.map(({ href, icon: Icon, label }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex flex-col items-center justify-center w-10 h-10 rounded-lg hover:bg-zinc-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500"
            )}
            aria-label={label}
          >
            <Icon className="w-6 h-6" aria-hidden="true" />
            <span className="text-xs mt-1">{label}</span>
          </Link>
        ))}
      </nav>
    </>
  );
}
