"use client";

import { useAuth } from "@workos-inc/authkit-nextjs/components";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SubscriptionsPage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-zinc-950">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400 mx-auto"></div>
          <p className="mt-2 text-zinc-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-zinc-950">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-white mb-2">
            Sign in required
          </h2>
          <p className="text-zinc-400">
            Please sign in to access subscriptions.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-950 p-6">
      <div className="w-full max-w-lg bg-zinc-900 rounded-xl shadow-lg p-8">
        <h1 className="text-2xl font-bold text-white mb-6 text-center">
          Support Piggies
        </h1>
        <p className="text-zinc-300 mb-8 text-center">
          Become a Piggies Supporter to unlock exclusive features and help us
          build a better community!
        </p>

        {/* Subscription Plans */}
        <div className="space-y-4">
          <Card className="bg-zinc-800 border-zinc-700">
            <CardHeader>
              <CardTitle className="text-white">Basic Plan</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-zinc-400 mb-4">
                Free tier with basic features
              </p>
              <Button className="w-full bg-purple-600 hover:bg-purple-700">
                Current Plan
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-purple-900/20 border-purple-700">
            <CardHeader>
              <CardTitle className="text-purple-400">Premium Plan</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-zinc-400 mb-4">
                Enhanced features and priority support
              </p>
              <Button className="w-full bg-purple-600 hover:bg-purple-700">
                Upgrade to Premium
              </Button>
            </CardContent>
          </Card>
        </div>

        <p className="text-xs text-zinc-500 mt-6 text-center">
          Subscription management coming soon
        </p>
      </div>
    </div>
  );
}
