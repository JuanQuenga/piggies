import Link from "next/link";
import { usePathname } from "next/navigation";
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
import { useLocation } from "./LocationContext";
import { SignOutButton } from "@/app/auth";
import { StatusControls } from "./StatusControls";
import { UnreadBadge } from "./UnreadBadge";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useAuth } from "@workos-inc/authkit-nextjs/components";

const navItems = [
  { href: "/profile", icon: User, label: "Profile", color: "text-blue-400" },
  {
    href: "/chats",
    icon: MessageCircle,
    label: "Chats",
    color: "text-green-400",
  },
  { href: "/people", icon: Users, label: "People", color: "text-purple-400" },
  { href: "/map", icon: Map, label: "Map", color: "text-orange-400" },
];

// Mobile hamburger menu navigation items (not in bottom nav)
const mobileMenuItems = [
  { href: "/blog", icon: Newspaper, label: "Blog", color: "text-pink-400" },
];

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

export default function Sidebar({ collapsed, setCollapsed }: SidebarProps) {
  // Mobile nav state (for accessibility, not strictly needed for static nav)
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const { isUSUnits } = useUnitPreference();
  const { locationState } = useLocation();
  const pathname = usePathname();
  const { user } = useAuth();
  // REMOVE: const { signOut } = useClerk();

  // Get current user's Convex ID for unread count
  const currentUser = useQuery(
    api.users.currentLoggedInUser,
    user?.email ? { email: user.email } : "skip"
  );

  // Get unread conversation count
  const unreadCount = useQuery(
    api.messages.getUnreadConversationCount,
    currentUser?._id ? { userId: currentUser._id } : "skip"
  );

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
          city: data.name,
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
          {navItems.map(({ href, icon: Icon, label, color }) => {
            const isActive = pathname === href;
            const showUnreadBadge =
              href === "/chats" && unreadCount && unreadCount > 0;

            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-3 w-full px-3 py-2 rounded-lg hover:bg-zinc-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 transition-all relative",
                  collapsed ? "justify-center" : "justify-start"
                )}
                aria-label={label}
              >
                <div className="relative">
                  <Icon className={cn("w-6 h-6", color)} aria-hidden="true" />
                  {showUnreadBadge && (
                    <UnreadBadge
                      count={unreadCount}
                      size="sm"
                      className="absolute -top-2 -right-2"
                    />
                  )}
                </div>
                {!collapsed && (
                  <span
                    className={cn("text-base font-medium", isActive && color)}
                  >
                    {label}
                  </span>
                )}
              </Link>
            );
          })}

          {/* Desktop-only navigation items */}
          {mobileMenuItems.map(({ href, icon: Icon, label, color }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-3 w-full px-3 py-2 rounded-lg hover:bg-zinc-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 transition-all",
                  collapsed ? "justify-center" : "justify-start"
                )}
                aria-label={label}
              >
                <Icon className={cn("w-6 h-6", color)} aria-hidden="true" />
                {!collapsed && (
                  <span
                    className={cn("text-base font-medium", isActive && color)}
                  >
                    {label}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
        {/* Collapse/Expand button */}
        {/* <button
          className={cn(
            "mb-2 mt-auto flex items-center justify-center w-10 h-10 hover:bg-zinc-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 transition-all border-r-2",
            collapsed ? "mx-auto" : "ml-2",
            "border-r-2 border-[#a78bfa] rounded-none"
          )}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? (
            <ChevronRight className="w-6 h-6" />
          ) : (
            <ChevronLeft className="w-6 h-6" />
          )}
        </button> */}
        {/* Settings button pinned to bottom */}
        <div className={cn("mb-2", collapsed ? "mx-auto" : "ml-2")}>
          <Link
            href="/settings"
            className={cn(
              "flex items-center justify-center w-10 h-10 rounded-lg hover:bg-zinc-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500"
            )}
            aria-label="Settings"
          >
            <Settings className="w-6 h-6 text-yellow-400" aria-hidden="true" />
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
                {mobileMenuItems.map(({ href, icon: Icon, label, color }) => (
                  <DropdownMenuItem key={href} asChild>
                    <Link
                      href={href}
                      className="flex items-center gap-2 w-full"
                    >
                      <Icon className={cn("w-4 h-4", color)} />
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
                    <Settings className="w-4 h-4 text-yellow-400" />
                    <span>Settings</span>
                  </Link>
                </DropdownMenuItem>

                {/* Sign Out */}
                <DropdownMenuItem
                  // REMOVE: onClick={() => signOut()}
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
        {navItems.map(({ href, icon: Icon, label, color }) => {
          const isActive = pathname === href;
          const showUnreadBadge =
            href === "/chats" && unreadCount && unreadCount > 0;

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center justify-center w-10 h-10 rounded-lg hover:bg-zinc-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 relative"
              )}
              aria-label={label}
            >
              <div className="relative">
                <Icon className={cn("w-6 h-6", color)} aria-hidden="true" />
                {showUnreadBadge && (
                  <UnreadBadge
                    count={unreadCount}
                    size="sm"
                    className="absolute -top-1 -right-1"
                  />
                )}
              </div>
              <span className={cn("text-xs mt-1", isActive && color)}>
                {label}
              </span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
