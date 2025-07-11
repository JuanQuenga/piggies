"use client";

import { ProfileEditor } from "./ProfileEditor";
import { useEffect, useState } from "react";
import { useQuery } from "convex/react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useAuth } from "@workos-inc/authkit-nextjs/components";

// Force dynamic rendering to prevent static generation issues
export const dynamic = "force-dynamic";

export default function ProfilePage() {
  const [mounted, setMounted] = useState(false);
  const { user } = useAuth();
  const profile = useQuery(
    api.profiles.getMyProfile,
    user?.email ? {} : "skip"
  );
  const status = useQuery(api.status.getMyStatus, user?.email ? {} : "skip");
  const convexUser = useQuery(
    api.users.currentLoggedInUser,
    user?.email ? { email: user.email } : "skip"
  );
  const updateStatus = useMutation(api.status.updateMyStatus);

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

  const handleUpdateProfile = async (data: any) => {
    // Handle profile update
    console.log("Updating profile:", data);
  };

  const handleUpdateStatus = async (data: {
    isVisible?: boolean;
    isLocationEnabled?: boolean;
    latitude?: number;
    longitude?: number;
    locationRandomization?: number;
    hostingStatus?: string;
  }) => {
    // Handle status update
    await updateStatus(data);
  };

  return (
    <div className="h-full w-full bg-zinc-950">
      <ProfileEditor
        profile={profile}
        status={status}
        updateProfile={handleUpdateProfile}
        updateStatus={handleUpdateStatus}
        convexUser={convexUser}
      />
    </div>
  );
}
