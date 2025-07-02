"use client";

import dynamic from "next/dynamic";

// Dynamically import ConvexClientProvider with SSR disabled
// This follows the Next.js docs recommendation for components using browser APIs
const ConvexClientProvider = dynamic(() => import("./ConvexClientProvider"), {
  ssr: false,
  loading: () => <div>Loading...</div>,
});

export default function Providers({ children }: { children: React.ReactNode }) {
  return <ConvexClientProvider>{children}</ConvexClientProvider>;
}
