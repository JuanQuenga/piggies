"use client";

import { ClerkProvider, useAuth } from "@clerk/nextjs";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ConvexReactClient } from "convex/react";
import { ConvexUserBootstrapper } from "./ConvexUserBootstrapper";
import AppAuthGate from "./AppAuthGate";
import "./globals.css";

// Use NEXT_PUBLIC_CONVEX_URL for the Convex deployment URL
const convex = new ConvexReactClient(
  process.env.NEXT_PUBLIC_CONVEX_URL || "https://placeholder.convex.cloud"
);

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-zinc-950 text-white">
        <ClerkProvider
          publishableKey={
            process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ||
            "pk_test_placeholder"
          }
        >
          <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
            <ConvexUserBootstrapper />
            <AppAuthGate>{children}</AppAuthGate>
          </ConvexProviderWithClerk>
        </ClerkProvider>
      </body>
    </html>
  );
}
