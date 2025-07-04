"use client";

import { ClerkProvider, useAuth } from "@clerk/nextjs";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ConvexReactClient } from "convex/react";
import { ConvexUserBootstrapper } from "./ConvexUserBootstrapper";
import AppAuthGate from "./AppAuthGate";

// Use NEXT_PUBLIC_CONVEX_URL for the Convex deployment URL
const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export default function ConvexClientProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY!}
      signInFallbackRedirectUrl="/"
    >
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        <ConvexUserBootstrapper />
        <AppAuthGate>{children}</AppAuthGate>
      </ConvexProviderWithClerk>
    </ClerkProvider>
  );
}
