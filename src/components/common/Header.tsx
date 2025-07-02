import { UserButton, useUser } from "@clerk/nextjs";
import { useState } from "react";

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
  // Placeholder XP value (replace with real user XP from backend)
  const [xp] = useState(220); // Example: user has 220 XP
  const { level, nextLevel } = getLevel(xp);
  const progress =
    nextLevel.xp === level.xp ? 1 : (xp - level.xp) / (nextLevel.xp - level.xp);

  // Placeholder for weather, replace with real data as needed
  const weather = "17°C";

  return (
    <header className="flex justify-between items-center w-full px-4 md:px-8 py-4 bg-zinc-900 border-b border-zinc-800">
      <div className="flex flex-col gap-1">
        <h1 className="text-lg md:text-xl font-bold text-white">
          Bixbia,{" "}
          <span className="font-extrabold text-purple-400">
            connecting to playstation
          </span>
        </h1>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-sm text-zinc-400">
            Hi {user?.firstName || "User"}, today's weather is {weather}
          </span>
          <span
            className="ml-2 w-16 md:w-24 h-1 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 rounded-full"
            aria-hidden="true"
          />
        </div>
        {/* XP Progress Bar */}
        <div className="mt-2 flex flex-col gap-1 w-48 md:w-64 max-w-xs">
          <div className="flex justify-between items-center text-xs text-zinc-400">
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
      </div>
      <div className="flex items-center gap-3">
        <UserButton
          afterSignOutUrl="/auth"
          appearance={{
            elements: {
              avatarBox: "w-8 h-8 md:w-10 md:h-10",
            },
          }}
        />
        <span
          className="text-white text-sm hidden lg:inline font-medium"
          aria-label="View profile"
        >
          {user?.firstName}
        </span>
      </div>
    </header>
  );
}
