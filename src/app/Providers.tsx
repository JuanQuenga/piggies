"use client";

import { useEffect, useState } from "react";
import { ConvexProvider } from "convex/react";
import { ConvexReactClient } from "convex/react";
import { ConvexUserBootstrapper } from "./ConvexUserBootstrapper";
import AppAuthGate from "./AppAuthGate";
import { UnitPreferenceProvider } from "../components/common/UnitPreferenceContext";
import PrivacyConsentDialog from "@/components/common/PrivacyConsentDialog";

// Use NEXT_PUBLIC_CONVEX_URL for the Convex deployment URL
const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

// Location service component
function LocationService() {
  useEffect(() => {
    const initializeLocation = async () => {
      // Check if geolocation permission is already granted
      if (navigator.permissions && navigator.permissions.query) {
        try {
          const permission = await navigator.permissions.query({
            name: "geolocation",
          });
          if (permission.state === "granted") {
            console.log(
              "Location permission already granted, auto-initializing location"
            );
            // Store in localStorage to indicate location is available
            localStorage.setItem("locationPermissionGranted", "true");
          }
        } catch (error) {
          console.log("Permission query not supported:", error);
        }
      }
    };

    initializeLocation();
  }, []);

  return null;
}

function ConvexWrapper({ children }: { children: React.ReactNode }) {
  return (
    <ConvexProvider client={convex}>
      <ConvexUserBootstrapper />
      <LocationService />
      <AppAuthGate>{children}</AppAuthGate>
    </ConvexProvider>
  );
}

export default function Providers({ children }: { children: React.ReactNode }) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <UnitPreferenceProvider>
      <ConvexWrapper>{children}</ConvexWrapper>
      <PrivacyConsentDialog />
    </UnitPreferenceProvider>
  );
}
