"use client";

import "../styles/index.css";
import Link from "next/link";
import { ClerkProvider, useAuth } from "@clerk/nextjs";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ConvexReactClient } from "convex/react";
import { Authenticated, Unauthenticated } from "convex/react";
import { SignOutButton } from "./auth/SignOutButton";
import { ConvexUserBootstrapper } from "./ConvexUserBootstrapper";
import Sidebar from "@/components/common/Sidebar";
import Header from "@/components/common/Header";
import { useState } from "react";

// Use NEXT_PUBLIC_CONVEX_URL for the Convex deployment URL
const convex = new ConvexReactClient(
  process.env.NEXT_PUBLIC_CONVEX_URL || "https://placeholder.convex.cloud"
);

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
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
            <div className="min-h-screen flex flex-row bg-zinc-950">
              <Sidebar
                collapsed={sidebarCollapsed}
                setCollapsed={setSidebarCollapsed}
              />
              <div
                className={
                  `flex-1 flex flex-col min-h-screen transition-all duration-300 bg-zinc-950` +
                  (sidebarCollapsed ? " md:ml-16" : " md:ml-48")
                }
              >
                <Header />
                <main className="flex-1 flex flex-col min-h-0 pt-14 md:pt-0">
                  {children}
                </main>
              </div>
            </div>
          </ConvexProviderWithClerk>
        </ClerkProvider>
      </body>
    </html>
  );
}
