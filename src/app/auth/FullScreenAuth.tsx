"use client";

import { useState } from "react";
import { SignIn, SignUp } from "@clerk/nextjs";

export default function FullScreenAuth() {
  const [tab, setTab] = useState<"sign-in" | "sign-up">("sign-in");

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-zinc-950 relative">
      {/* Optional: Add a background image or gradient here if desired */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-zinc-900 to-purple-950 opacity-80 z-0" />
      <div className="relative z-10 flex flex-col items-center w-full max-w-md mx-auto p-8 rounded-xl shadow-2xl bg-zinc-900/90 border border-zinc-800">
        {/* Logo and tagline */}
        <div className="mb-8 flex flex-col items-center">
          <img src="/logo.png" alt="App Logo" className="w-16 h-16 mb-2" />
          <h1 className="text-3xl font-bold text-white mb-1">Piggies</h1>
          <p className="text-zinc-400 text-center text-base">
            Connect with people nearby and start chatting
          </p>
        </div>
        {/* Toggle buttons */}
        <div className="flex gap-4 mb-6 w-full">
          <button
            className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-colors ${tab === "sign-in" ? "bg-purple-600 text-white" : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"}`}
            onClick={() => setTab("sign-in")}
          >
            Sign In
          </button>
          <button
            className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-colors ${tab === "sign-up" ? "bg-purple-600 text-white" : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"}`}
            onClick={() => setTab("sign-up")}
          >
            Sign Up
          </button>
        </div>
        {/* Clerk Auth Forms */}
        <div className="w-full">
          {tab === "sign-in" ? (
            <SignIn
              routing="hash"
              appearance={{
                elements: {
                  card: "bg-zinc-900 border border-zinc-800 shadow-none",
                },
              }}
            />
          ) : (
            <SignUp
              routing="hash"
              appearance={{
                elements: {
                  card: "bg-zinc-900 border border-zinc-800 shadow-none",
                },
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
