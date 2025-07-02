"use client";

import "@/styles/index.css";
import { useAuth } from "@clerk/nextjs";
import { SignInButton } from "@clerk/nextjs";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  const { isSignedIn, isLoaded } = useAuth();

  // Redirect authenticated users to map
  useEffect(() => {
    if (isSignedIn && isLoaded) {
      window.location.href = "/map";
    }
  }, [isSignedIn, isLoaded]);

  // Show loading state while authentication is being determined
  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Show sign-in form for unauthenticated users
  if (!isSignedIn) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4 bg-zinc-950">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white mb-2">
              Welcome to Piggies
            </h1>
            <p className="text-zinc-400">
              Connect with people nearby and start chatting
            </p>
          </div>
          <SignInButton>
            <button className="w-full px-4 py-3 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors font-medium">
              Sign In
            </button>
          </SignInButton>
        </div>
      </div>
    );
  }

  // This should not be reached due to the redirect effect, but just in case
  return (
    <section className="relative flex flex-col items-center justify-center h-full w-full bg-zinc-950">
      {/* Controller SVG background */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-10 select-none">
        {/* Inline SVG for PS5 controller outline */}
        <svg
          width="600"
          height="260"
          viewBox="0 0 600 260"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-[80vw] max-w-3xl h-auto"
        >
          <rect x="0" y="0" width="600" height="260" rx="60" fill="#18181b" />
          <g stroke="#fff" strokeWidth="2" opacity="0.25">
            <rect x="120" y="60" width="360" height="140" rx="60" />
            <circle cx="200" cy="130" r="40" />
            <circle cx="400" cy="130" r="40" />
            <rect x="290" y="110" width="20" height="40" rx="10" />
            <rect x="250" y="120" width="20" height="20" rx="6" />
            <rect x="330" y="120" width="20" height="20" rx="6" />
            {/* D-pad */}
            <rect x="170" y="110" width="12" height="40" rx="4" />
            <rect x="154" y="126" width="40" height="12" rx="4" />
            {/* Buttons */}
            <circle cx="430" cy="120" r="6" />
            <circle cx="430" cy="140" r="6" />
            <circle cx="410" cy="120" r="6" />
            <circle cx="410" cy="140" r="6" />
          </g>
        </svg>
      </div>
      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center justify-center gap-8">
        <h2
          className="text-5xl font-extrabold text-white tracking-widest mb-4"
          aria-label="PS5 logo"
        >
          PS5
        </h2>
        <Button
          className="bg-purple-600 hover:bg-purple-700 text-lg px-8 py-4 rounded-full shadow-lg focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 focus:ring-offset-zinc-950 transition-colors"
          aria-label="Press the PS button to use controller"
        >
          Press the PS button to use controller
        </Button>
      </div>
    </section>
  );
}
