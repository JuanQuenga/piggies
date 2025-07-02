"use client";

import React from "react";
import { SignOutButton, useAuth } from "@clerk/nextjs";
import Providers from "../Providers";
import { useEffect, useState } from "react";

// Force dynamic rendering to prevent static generation issues
export const dynamic = "force-dynamic";

export default function SettingsPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  const { isSignedIn, isLoaded } = useAuth();
  return (
    <Providers>
      <div className="flex flex-col md:flex-row h-full w-full bg-zinc-950">
        {/* Left column: navigation/summary */}
        <aside className="w-full md:max-w-md md:w-md bg-zinc-900 border-r border-zinc-800 p-6 flex-shrink-0">
          <h2 className="text-2xl font-bold text-white mb-6">Settings</h2>
          <nav className="space-y-4 mb-8">
            <button className="block w-full text-left px-4 py-2 rounded-lg bg-zinc-800 text-white hover:bg-zinc-700 transition">
              Profile
            </button>
            <button className="block w-full text-left px-4 py-2 rounded-lg bg-zinc-800 text-white hover:bg-zinc-700 transition">
              Account
            </button>
            <button className="block w-full text-left px-4 py-2 rounded-lg bg-zinc-800 text-white hover:bg-zinc-700 transition">
              Notifications
            </button>
            <button className="block w-full text-left px-4 py-2 rounded-lg bg-zinc-800 text-white hover:bg-zinc-700 transition">
              Privacy
            </button>
          </nav>
          {isLoaded && isSignedIn && (
            <SignOutButton>
              <button className="w-full px-4 py-3 rounded-lg bg-purple-600 text-white font-semibold hover:bg-purple-700 transition">
                Sign Out
              </button>
            </SignOutButton>
          )}
        </aside>
        {/* Right column: details */}
        <section className="flex-1 p-8 overflow-y-auto">
          <h3 className="text-xl font-semibold text-white mb-4">
            Settings Details
          </h3>
          <div className="bg-zinc-900 rounded-lg p-6 text-zinc-300 shadow">
            <p>This is where the selected settings details will appear.</p>
          </div>
        </section>
      </div>
    </Providers>
  );
}
