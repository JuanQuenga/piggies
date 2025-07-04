"use client";

import { useEffect, useState } from "react";
import ConvexClientProvider from "./ConvexClientProvider";

export default function ClientRoot({
  children,
}: {
  children: React.ReactNode;
}) {
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

  return <ConvexClientProvider>{children}</ConvexClientProvider>;
}
