"use client";
import { useAuth } from "@workos-inc/authkit-nextjs/components";
import { usePathname } from "next/navigation";
import FullScreenAuth from "./auth/FullScreenAuth";
import Sidebar from "@/components/common/Sidebar";
import Header from "@/components/common/Header";
import { BottomNav } from "@/components/common/BottomNav";

export default function AppAuthGate({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const pathname = usePathname();

  // Allow the landing page to be shown when not signed in
  const isLandingPage = pathname === "/";
  const isAuthPage = pathname === "/auth";

  if (loading) {
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

  // Show landing page or auth page without the authenticated layout
  if (!user && (isLandingPage || isAuthPage)) {
    return <>{children}</>;
  }

  // Show auth gate for all other pages when not signed in
  if (!user) {
    return <FullScreenAuth />;
  }

  return (
    <div className="min-h-screen flex flex-row bg-zinc-950">
      <Sidebar collapsed={false} setCollapsed={() => {}} />
      <div className="flex-1 flex flex-col min-h-screen bg-zinc-950 md:ml-48">
        <Header />
        <main className="flex-1 flex flex-col min-h-0 pt-20 pb-16 md:pt-0 md:pb-0">
          {children}
        </main>
        <BottomNav />
      </div>
    </div>
  );
}
