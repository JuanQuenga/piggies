"use client";
import { ClerkProvider } from "@clerk/nextjs";
import ConvexClientProvider from "./ConvexClientProvider";
import { usePathname } from "next/navigation";

export default function ClientRoot({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Don't render providers for error/not-found pages
  const isErrorPage = pathname === "/_not-found" || pathname === "/_error";

  if (isErrorPage) {
    return <>{children}</>;
  }

  return (
    <ClerkProvider
      publishableKey={
        process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || "pk_test_placeholder"
      }
    >
      <ConvexClientProvider>{children}</ConvexClientProvider>
    </ClerkProvider>
  );
}
