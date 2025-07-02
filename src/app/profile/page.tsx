"use client";

import Providers from "../Providers";
import ProfileEditor from "../../app/profile/ProfileEditor";
import { useEffect, useState } from "react";

// Force dynamic rendering to prevent static generation issues
export const dynamic = "force-dynamic";

export default function ProfilePage() {
  const [mounted, setMounted] = useState(false);

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

  return (
    <Providers>
      <div className="h-full w-full bg-zinc-950">
        <ProfileEditor />
      </div>
    </Providers>
  );
}
