"use client";

import "../styles/index.css";
import Link from "next/link";
import { ClerkProvider, useAuth } from "@clerk/nextjs";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ConvexReactClient } from "convex/react";
import { Authenticated, Unauthenticated } from "convex/react";
import { SignOutButton } from "./auth/SignOutButton";
import { ConvexUserBootstrapper } from "./ConvexUserBootstrapper";

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
      <body>
        <ClerkProvider
          publishableKey={
            process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ||
            "pk_test_placeholder"
          }
        >
          <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
            <ConvexUserBootstrapper />
            <Authenticated>
              <nav className="w-full flex justify-between items-center py-4 px-6 bg-card border-b mb-6">
                <div className="flex gap-6">
                  <Link
                    href="/map"
                    className="font-semibold text-primary hover:underline"
                  >
                    Map
                  </Link>
                  <Link
                    href="/people"
                    className="font-semibold text-primary hover:underline"
                  >
                    People Nearby
                  </Link>
                  <Link
                    href="/profile"
                    className="font-semibold text-primary hover:underline"
                  >
                    My Profile
                  </Link>
                  <Link
                    href="/chat"
                    className="font-semibold text-primary hover:underline"
                  >
                    Chats
                  </Link>
                </div>
                <SignOutButton />
              </nav>
            </Authenticated>
            <main className="max-w-4xl mx-auto px-4">{children}</main>
          </ConvexProviderWithClerk>
        </ClerkProvider>
      </body>
    </html>
  );
}
