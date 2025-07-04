"use client";
import { useAuth } from "@clerk/nextjs";
import { useState } from "react";
import FullScreenAuth from "./auth/FullScreenAuth";
import Sidebar from "@/components/common/Sidebar";
import Header from "@/components/common/Header";

export default function AppAuthGate({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-lg text-muted-foreground">
            Loading authentication...
          </p>
        </div>
      </div>
    );
  }

  if (!isSignedIn) {
    return <FullScreenAuth />;
  }

  return (
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
        <main className="flex-1 flex flex-col min-h-0 pt-24 md:pt-0">
          {children}
        </main>
      </div>
    </div>
  );
}
