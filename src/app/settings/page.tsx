"use client";

import React from "react";
import { useAuth } from "@workos-inc/authkit-nextjs/components";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "../../components/ui/button";
import { useUnitPreference } from "../../components/common/UnitPreferenceContext";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Label } from "../../components/ui/label";
import { Separator } from "../../components/ui/separator";
import {
  User,
  Bell,
  Shield,
  Settings as SettingsIcon,
  LogOut,
  Thermometer,
  Eye,
  EyeOff,
  Lock,
  LockOpen,
  MapPin,
} from "lucide-react";
import { cn } from "../../lib/utils";

// Force dynamic rendering to prevent static generation issues
export const dynamic = "force-dynamic";

export default function SettingsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { isUSUnits, setIsUSUnits } = useUnitPreference();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Show loading state while authentication is being determined
  if (loading || !mounted) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-5rem)] bg-gradient-to-br from-purple-900/20 via-zinc-900/20 to-black/20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400 mx-auto"></div>
          <p className="mt-2 text-zinc-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to sign in if not authenticated
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-5rem)] bg-gradient-to-br from-purple-900/20 via-zinc-900/20 to-black/20">
        <div className="text-center max-w-md mx-auto p-8 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
          <User className="w-12 h-12 text-purple-400 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-white mb-4">
            Sign in required
          </h2>
          <p className="text-zinc-400 mb-6">
            Please sign in to access your settings.
          </p>
          <Button
            onClick={() => (window.location.href = "/login")}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
        <p className="text-zinc-400">
          Manage your account preferences and privacy settings.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Account Settings */}
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <User className="w-5 h-5" />
              Account
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-zinc-300">Email</Label>
              <p className="text-white">{user.email}</p>
            </div>
            <div>
              <Label className="text-zinc-300">Name</Label>
              <p className="text-white">
                {user.firstName} {user.lastName}
              </p>
            </div>
            <Button
              variant="outline"
              className="w-full border-zinc-700 text-zinc-300"
            >
              Edit Profile
            </Button>
          </CardContent>
        </Card>

        {/* Preferences */}
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <SettingsIcon className="w-5 h-5" />
              Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-zinc-300 flex items-center gap-2">
                <Thermometer className="w-4 h-4" />
                Units
              </Label>
              <div className="flex gap-2 mt-2">
                <Button
                  size="sm"
                  variant={!isUSUnits ? "default" : "outline"}
                  onClick={() => setIsUSUnits(false)}
                  className={cn(
                    !isUSUnits && "bg-purple-600 hover:bg-purple-700"
                  )}
                >
                  Metric
                </Button>
                <Button
                  size="sm"
                  variant={isUSUnits ? "default" : "outline"}
                  onClick={() => setIsUSUnits(true)}
                  className={cn(
                    isUSUnits && "bg-purple-600 hover:bg-purple-700"
                  )}
                >
                  Imperial
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Privacy */}
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Shield className="w-5 h-5" />
              Privacy
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-zinc-300">Profile Visibility</Label>
                <p className="text-sm text-zinc-500">
                  Control who can see your profile
                </p>
              </div>
              <Button variant="outline" size="sm" className="border-zinc-700">
                <Eye className="w-4 h-4 mr-2" />
                Public
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-zinc-300">Location Sharing</Label>
                <p className="text-sm text-zinc-500">
                  Share your location with others
                </p>
              </div>
              <Button variant="outline" size="sm" className="border-zinc-700">
                <MapPin className="w-4 h-4 mr-2" />
                Enabled
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Bell className="w-5 h-5" />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-zinc-300">New Messages</Label>
                <p className="text-sm text-zinc-500">
                  Get notified of new messages
                </p>
              </div>
              <Button variant="outline" size="sm" className="border-zinc-700">
                <Bell className="w-4 h-4 mr-2" />
                On
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-zinc-300">Nearby Users</Label>
                <p className="text-sm text-zinc-500">
                  Get notified of new users nearby
                </p>
              </div>
              <Button variant="outline" size="sm" className="border-zinc-700">
                <Bell className="w-4 h-4 mr-2" />
                On
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Separator className="my-8 bg-zinc-800" />

      {/* Danger Zone */}
      <Card className="bg-red-900/20 border-red-800">
        <CardHeader>
          <CardTitle className="text-red-400">Danger Zone</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-red-300">Sign Out</Label>
              <p className="text-sm text-red-400/70">
                Sign out of your account
              </p>
            </div>
            <Button
              variant="destructive"
              className="bg-red-600 hover:bg-red-700"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
