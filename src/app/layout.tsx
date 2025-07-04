import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "./Providers";

const inter = Inter({ subsets: ["latin"] });

// Force dynamic rendering to prevent SSR issues with Convex
export const dynamic = "force-dynamic";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-zinc-950 min-h-screen`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
