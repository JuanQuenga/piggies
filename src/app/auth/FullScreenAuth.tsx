"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function FullScreenAuth() {
  const router = useRouter();

  const handleSignIn = () => {
    window.location.href = "/login";
  };

  const handleSignUp = () => {
    router.push("/login?signup=true");
  };

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
            <img
              src="/pig-snout.svg"
              alt="Piggies logo"
              width={32}
              height={32}
              className="w-8 h-8 sm:w-10 sm:h-10"
            />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1 sm:mb-2">
            Welcome to Piggies
          </h1>
          <p className="text-zinc-400 text-sm sm:text-base">
            Sign in to your account
          </p>
        </div>
        {/* Auth Forms */}
        <div className="w-full max-w-sm mx-auto space-y-4">
          <Button
            onClick={handleSignIn}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
          >
            Sign In
          </Button>
          <Button
            onClick={handleSignUp}
            variant="outline"
            className="w-full border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-800 font-semibold py-3 px-4 rounded-lg transition-colors"
          >
            Sign Up
          </Button>
        </div>
      </div>
    </div>
  );
}
