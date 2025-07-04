"use client";

import { useEffect, useState } from "react";
import { ClerkProvider, useAuth } from "@clerk/nextjs";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ConvexReactClient } from "convex/react";
import { ConvexUserBootstrapper } from "./ConvexUserBootstrapper";
import AppAuthGate from "./AppAuthGate";
import { UnitPreferenceProvider } from "../components/common/UnitPreferenceContext";
import PrivacyConsentDialog from "@/components/common/PrivacyConsentDialog";

// Use NEXT_PUBLIC_CONVEX_URL for the Convex deployment URL
const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

function ConvexWrapper({ children }: { children: React.ReactNode }) {
  return (
    <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
      <ConvexUserBootstrapper />
      <AppAuthGate>{children}</AppAuthGate>
    </ConvexProviderWithClerk>
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
    <ClerkProvider
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY!}
    >
      <UnitPreferenceProvider>
        <ConvexWrapper>{children}</ConvexWrapper>
        <PrivacyConsentDialog />
      </UnitPreferenceProvider>
    </ClerkProvider>
  );
}
