import Link from "next/link";
import { Home, MessageCircle, Users, Map, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { UserButton } from "@clerk/nextjs";

const navItems = [
  { href: "/people", icon: Users, label: "People Nearby" },
  { href: "/map", icon: Map, label: "Map" },
  { href: "/chat", icon: MessageCircle, label: "Chats" },
];

export default function Sidebar() {
  // Mobile nav state (for accessibility, not strictly needed for static nav)
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <>
      {/* Desktop Sidebar */}
      <nav
        className="hidden md:flex flex-col items-center bg-zinc-900 text-white h-screen w-16 py-4 border-r border-zinc-800 fixed left-0 top-0 z-30"
        aria-label="Main navigation"
      >
        {/* Pig logo at the top */}
        <div className="mb-8 mt-2" aria-label="Piggies logo">
          <svg
            width="40"
            height="40"
            viewBox="0 0 72 72"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <ellipse cx="36" cy="36" rx="36" ry="32" fill="#F4A7B9" />
            {/* Ears */}
            <path d="M4 24 Q12 4 24 16 Q20 28 12 24 Z" fill="#F4A7B9" />
            <path d="M68 24 Q60 4 48 16 Q52 28 60 24 Z" fill="#F4A7B9" />
            {/* Inner ears */}
            <path d="M8 20 Q16 8 24 20 Q18 22 12 20 Z" fill="#F06277" />
            <path d="M64 20 Q56 8 48 20 Q54 22 60 20 Z" fill="#F06277" />
            {/* Eyes */}
            <ellipse cx="22" cy="36" rx="5" ry="5" fill="#2F3336" />
            <ellipse cx="50" cy="36" rx="5" ry="5" fill="#2F3336" />
            {/* Nose */}
            <ellipse cx="36" cy="52" rx="16" ry="12" fill="#F06277" />
            {/* Nostrils */}
            <ellipse cx="30" cy="52" rx="3" ry="5" fill="#6D2E1B" />
            <ellipse cx="42" cy="52" rx="3" ry="5" fill="#6D2E1B" />
          </svg>
        </div>
        <div className="flex flex-col gap-6 flex-1 mt-4 items-center">
          {/* User avatar as first nav item */}
          <div className="mb-2">
            <UserButton
              afterSignOutUrl="/auth"
              appearance={{ elements: { avatarBox: "w-10 h-10" } }}
            />
          </div>
          {navItems.map(({ href, icon: Icon, label }) => (
            <Link key={href} href={href} passHref legacyBehavior>
              <a
                className={cn(
                  "flex items-center justify-center w-10 h-10 rounded-lg hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                )}
                aria-label={label}
              >
                <Icon className="w-6 h-6" aria-hidden="true" />
              </a>
            </Link>
          ))}
        </div>
        {/* Settings button pinned to bottom */}
        <div className="mb-2 mt-auto">
          <Link href="/settings" passHref legacyBehavior>
            <a
              className={cn(
                "flex items-center justify-center w-10 h-10 rounded-lg hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              )}
              aria-label="Settings"
            >
              <Settings className="w-6 h-6" aria-hidden="true" />
            </a>
          </Link>
        </div>
      </nav>

      {/* Mobile Topbar (logo + settings) */}
      <nav className="md:hidden flex items-center justify-between bg-zinc-900 text-white w-full h-14 px-4 border-b border-zinc-800 fixed top-0 left-0 z-30">
        <div aria-label="Piggies logo">
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
        <Link href="/settings" passHref legacyBehavior>
          <a
            className={cn(
              "flex items-center justify-center w-10 h-10 rounded-lg hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            )}
            aria-label="Settings"
          >
            <Settings className="w-6 h-6" aria-hidden="true" />
          </a>
        </Link>
      </nav>

      {/* Mobile Bottom Navbar */}
      <nav className="md:hidden flex items-center justify-around bg-zinc-900 text-white w-full h-14 px-2 border-t border-zinc-800 fixed bottom-0 left-0 z-30">
        {navItems.map(({ href, icon: Icon, label }) => (
          <Link key={href} href={href} passHref legacyBehavior>
            <a
              className={cn(
                "flex flex-col items-center justify-center w-10 h-10 rounded-lg hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              )}
              aria-label={label}
            >
              <Icon className="w-6 h-6" aria-hidden="true" />
              <span className="text-xs mt-1">{label}</span>
            </a>
          </Link>
        ))}
      </nav>
    </>
  );
}
