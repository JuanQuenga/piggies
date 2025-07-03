"use client";

import { useAuth } from "@clerk/nextjs";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { MapPin, MessageCircle, Users, Sparkles } from "lucide-react";

export default function LandingPage() {
  const { isSignedIn, isLoaded } = useAuth();
  const router = useRouter();

  // Redirect authenticated users to map
  useEffect(() => {
    if (isSignedIn && isLoaded) {
      router.push("/map");
    }
  }, [isSignedIn, isLoaded, router]);

  // Show loading state while authentication is being determined
  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-900 via-zinc-900 to-black">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400 mx-auto"></div>
          <p className="mt-2 text-zinc-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Show landing page for unauthenticated users
  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-zinc-900 to-black">
        {/* Navigation */}
        <nav className="flex justify-between items-center p-6">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">🐷</span>
            </div>
            <span className="text-white font-bold text-xl">Piggies</span>
          </div>
          <Button
            onClick={() => router.push("/auth")}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg"
          >
            Sign In
          </Button>
        </nav>

        {/* Hero Section */}
        <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
          <div className="max-w-4xl mx-auto">
            {/* Logo and Title */}
            <div className="mb-8">
              <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
                <span className="text-4xl">🐷</span>
              </div>
              <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
                Welcome to{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                  Piggies
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-zinc-300 mb-8 max-w-2xl mx-auto">
                Connect with people nearby, discover new friends, and start
                meaningful conversations in your area.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Button
                onClick={() => router.push("/auth")}
                className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 text-lg rounded-xl shadow-lg"
                size="lg"
              >
                Get Started
              </Button>
              <Button
                variant="outline"
                className="border-purple-500 text-purple-400 hover:bg-purple-500 hover:text-white px-8 py-4 text-lg rounded-xl"
                size="lg"
              >
                Learn More
              </Button>
            </div>

            {/* Features */}
            <div className="grid md:grid-cols-3 gap-8 mt-20">
              <div className="text-center p-6 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
                <MapPin className="w-12 h-12 text-purple-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">
                  Location-Based
                </h3>
                <p className="text-zinc-400">
                  Find and connect with people in your area
                </p>
              </div>
              <div className="text-center p-6 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
                <MessageCircle className="w-12 h-12 text-purple-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">
                  Real-time Chat
                </h3>
                <p className="text-zinc-400">
                  Instant messaging with people nearby
                </p>
              </div>
              <div className="text-center p-6 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
                <Users className="w-12 h-12 text-purple-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">
                  Community
                </h3>
                <p className="text-zinc-400">
                  Build meaningful connections locally
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center py-8 text-zinc-500">
          <p>&copy; 2025 Piggies. Connect locally, grow globally.</p>
        </footer>
      </div>
    );
  }

  // This should not be reached due to the redirect effect, but just in case
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-900 via-zinc-900 to-black">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400 mx-auto"></div>
        <p className="mt-2 text-zinc-400">Redirecting...</p>
      </div>
    </div>
  );
}
