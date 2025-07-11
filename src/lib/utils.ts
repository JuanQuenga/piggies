import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Generate a consistent background color for users based on their ID or name
export function getUserBackgroundColor(
  userId: string | null | undefined,
  userName?: string | null
): string {
  if (!userId && !userName) {
    return "bg-gray-500/20"; // Default fallback
  }

  // Use userId if available, otherwise use userName
  const seed = userId || userName || "";

  // Simple hash function to generate a number from the string
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }

  // Use absolute value and modulo to get a positive number
  const colorIndex = Math.abs(hash) % 18;

  // Array of background colors matching the mock users
  const backgroundColors = [
    "bg-red-500/20",
    "bg-blue-500/20",
    "bg-green-500/20",
    "bg-purple-500/20",
    "bg-pink-500/20",
    "bg-yellow-500/20",
    "bg-indigo-500/20",
    "bg-orange-500/20",
    "bg-teal-500/20",
    "bg-cyan-500/20",
    "bg-emerald-500/20",
    "bg-violet-500/20",
    "bg-red-600/20",
    "bg-blue-600/20",
    "bg-green-600/20",
    "bg-purple-600/20",
    "bg-pink-600/20",
    "bg-yellow-600/20",
  ];

  return backgroundColors[colorIndex];
}
