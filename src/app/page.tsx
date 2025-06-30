"use client";

import { useAuth } from "@clerk/nextjs";
import { SignInButton } from "@clerk/nextjs";
import { useEffect } from "react";

export default function HomePage() {
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
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  // Show sign-in form for unauthenticated users
  if (!isSignedIn) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-primary mb-2">
              Welcome to Piggies
            </h1>
            <p className="text-muted-foreground">
              Connect with people nearby and start chatting
            </p>
          </div>
          <SignInButton>
            <button className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90">
              Sign In
            </button>
          </SignInButton>
        </div>
      </div>
    );
  }

  // This should not be reached due to the redirect effect, but just in case
  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
    </div>
  );
}
