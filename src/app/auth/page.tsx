"use client";

import { SignIn, SignUp } from "@clerk/nextjs";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function AuthPage() {
  const [tab, setTab] = useState<"sign-in" | "sign-up">("sign-in");
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-zinc-900 to-black flex flex-col">
      {/* Navigation */}
      <nav className="flex items-center p-4 sm:p-6">
        <Button
          variant="ghost"
          onClick={() => router.push("/")}
          className="text-zinc-400 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Button>
      </nav>
      {/* Centered Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-2 sm:px-6">
        {/* Logo and Title */}
        <div className="text-center mb-6 sm:mb-8 w-full">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-lg">
            <span className="text-xl sm:text-2xl">🐷</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1 sm:mb-2">
            Welcome to Snouts
          </h1>
          <p className="text-zinc-400 text-sm sm:text-base">
            {tab === "sign-in"
              ? "Sign in to your account"
              : "Create your account"}
          </p>
        </div>
        {/* Tab + Clerk Card Group */}
        <div className="relative flex flex-col items-center max-w-fit mx-auto min-w-[320px]">
          {/* Tab Switcher */}
          <div className="flex gap-2 mb-4">
            <button
              className={`px-2 py-2 sm:px-4 rounded-md text-xs sm:text-sm font-medium transition-colors ${
                tab === "sign-in"
                  ? "bg-purple-600 text-white shadow-sm"
                  : "text-zinc-400 hover:text-white bg-white/10"
              }`}
              style={{ width: 140 }}
              onClick={() => setTab("sign-in")}
            >
              Sign In
            </button>
            <button
              className={`px-2 py-2 sm:px-4 rounded-md text-xs sm:text-sm font-medium transition-colors ${
                tab === "sign-up"
                  ? "bg-purple-600 text-white shadow-sm"
                  : "text-zinc-400 hover:text-white bg-white/10"
              }`}
              style={{ width: 140 }}
              onClick={() => setTab("sign-up")}
            >
              Sign Up
            </button>
          </div>
          {/* Clerk Components */}
          <div>
            {tab === "sign-in" ? (
              <SignIn routing="hash" />
            ) : (
              <SignUp routing="hash" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
