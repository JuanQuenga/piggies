"use client";

import { useAuth } from "@workos-inc/authkit-nextjs/components";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { MapPin, MessageCircle, Users, Sparkles } from "lucide-react";

export default function LandingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Redirect authenticated users to map
  useEffect(() => {
    if (user && !loading) {
      router.push("/map");
    }
  }, [user, loading, router]);

  // Show loading state while authentication is being determined
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-900 via-zinc-900 to-black">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400 mx-auto"></div>
          <p className="mt-2 text-zinc-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-zinc-900 to-black">
      {/* Navigation */}
      <nav className="flex items-center justify-between p-6 md:p-8">
        <div className="flex items-center space-x-2 md:space-x-3">
          <img
            src="/pig-snout.svg"
            alt="Piggies logo"
            width={20}
            height={20}
            className="w-5 h-5 md:w-7 md:h-7"
          />
          <span className="text-xl md:text-3xl font-bold text-white">
            Piggies
          </span>
        </div>
        <div className="flex space-x-4 md:space-x-6">
          <Button
            variant="ghost"
            onClick={() => (window.location.href = "/login")}
            className="bg-transparent border-2 border-zinc-600 text-zinc-300 hover:text-white hover:bg-zinc-800/50 hover:border-zinc-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 transition-all text-base md:text-lg rounded-lg px-4 md:px-6 py-2 md:py-3 cursor-pointer"
          >
            Sign In
          </Button>
          <Button
            onClick={() => (window.location.href = "/login")}
            className="bg-transparent border-2 border-purple-500 text-purple-400 hover:text-white hover:bg-purple-600/20 hover:border-purple-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 transition-all text-base md:text-lg rounded-lg px-4 md:px-6 py-2 md:py-3 cursor-pointer"
          >
            Get Started
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-120px)] px-6 text-center">
        <div className="max-w-4xl mx-auto">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <img
              src="/pig-snout.svg"
              alt="Piggies logo"
              width={80}
              height={80}
              className="w-20 h-20"
            />
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
            Welcome To{" "}
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Piggies
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-zinc-300 mb-8 max-w-2xl mx-auto">
            Discover and chat with people in your area. Build meaningful
            connections through our secure, location-based platform.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button
              onClick={() => (window.location.href = "/login")}
              size="lg"
              className="bg-transparent border-2 border-purple-500 text-purple-400 hover:text-white hover:bg-purple-600/20 hover:border-purple-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 transition-all text-lg px-8 py-3 rounded-lg cursor-pointer"
            >
              Start Exploring
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => router.push("/about")}
              className="bg-transparent border-2 border-zinc-600 text-zinc-300 hover:text-white hover:bg-zinc-800/50 hover:border-zinc-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 transition-all text-lg px-8 py-3 rounded-lg cursor-pointer"
            >
              Learn More
            </Button>
          </div>

          {/* Feature Grid */}
          <div className="grid md:grid-cols-3 gap-8 mt-16">
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-600/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Location-Based
              </h3>
              <p className="text-zinc-400">
                Find people in your area and discover new connections nearby.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-600/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-8 h-8 text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Real-time Chat
              </h3>
              <p className="text-zinc-400">
                Start conversations instantly with secure, private messaging.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-600/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Community
              </h3>
              <p className="text-zinc-400">
                Join a vibrant community of people looking to connect and chat.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
