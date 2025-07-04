"use client";

import { ProfileEditor } from "./ProfileEditor";
import { useEffect, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

// Force dynamic rendering to prevent static generation issues
export const dynamic = "force-dynamic";

export default function ProfilePage() {
  const [mounted, setMounted] = useState(false);
  const profile = useQuery(api.profiles.getMyProfile);
  const convexUser = useQuery(api.users.currentLoggedInUser);

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
    // TODO: Implement profile update
    console.log("Updating profile:", data);
  };

  return (
    <div className="h-full w-full bg-zinc-950">
      <ProfileEditor
        profile={profile}
        updateProfile={handleUpdateProfile}
        convexUser={convexUser}
      />
    </div>
  );
}
