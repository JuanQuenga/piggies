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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

const navItems = [
  { href: "/profile", icon: User, label: "Profile" },
  { href: "/chat", icon: MessageCircle, label: "Chats" },
  { href: "/people", icon: Users, label: "People" },
  { href: "/map", icon: Map, label: "Map" },
];

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

export default function Sidebar({ collapsed, setCollapsed }: SidebarProps) {
  // Mobile nav state (for accessibility, not strictly needed for static nav)
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

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
          aria-label="Snouts logo"
        >
          <img
            src="/pig-snout.svg"
            alt="Snouts logo"
            width={collapsed ? 40 : 48}
            height={collapsed ? 40 : 48}
          />
          {!collapsed && (
            <span className="ml-3 text-3xl font-bold text-white">Piggies</span>
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

      {/* Mobile Topbar (logo + settings) */}
      <nav className="md:hidden flex items-center justify-between bg-zinc-900 text-white w-full h-14 px-4 border-b border-zinc-800 fixed top-0 left-0 z-30">
        <div aria-label="Snouts logo">
          <svg
            width="32"
            height="32"
            viewBox="0 0 72 72"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <ellipse cx="36" cy="44" rx="20" ry="16" fill="#F06277" />
            <ellipse cx="26" cy="44" rx="4" ry="7" fill="#6D2E1B" />
            <ellipse cx="46" cy="44" rx="4" ry="7" fill="#6D2E1B" />
            <ellipse cx="18" cy="28" rx="6" ry="6" fill="#2F3336" />
            <ellipse cx="54" cy="28" rx="6" ry="6" fill="#2F3336" />
            <path d="M12 16 Q24 4 36 12 Q48 4 60 16" fill="#F4A7B9" />
            <path
              d="M12 16 Q24 8 36 16 Q48 8 60 16"
              fill="#F06277"
              opacity="0.2"
            />
            <path
              d="M36 8 C60 8 68 28 68 44 C68 60 60 68 36 68 C12 68 4 60 4 44 C4 28 12 8 36 8 Z"
              fill="#F4A7B9"
            />
            <path d="M4 24 Q12 4 24 16" fill="#F4A7B9" />
            <path d="M68 24 Q60 4 48 16" fill="#F4A7B9" />
            <path d="M4 24 Q12 12 24 24" fill="#F06277" opacity="0.2" />
            <path d="M68 24 Q60 12 48 24" fill="#F06277" opacity="0.2" />
          </svg>
        </div>
        <Link
          href="/settings"
          className={cn(
            "flex items-center justify-center w-10 h-10 rounded-lg hover:bg-zinc-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500"
          )}
          aria-label="Settings"
        >
          <Settings className="w-6 h-6" aria-hidden="true" />
        </Link>
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
