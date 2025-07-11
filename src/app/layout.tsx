import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthKitProvider } from "@workos-inc/authkit-nextjs/components";
import Providers from "./Providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Piggies",
  description: "Connect with people nearby and start chatting",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/pig-snout.svg", type: "image/svg+xml" },
    ],
    shortcut: "/favicon.ico",
    apple: "/pig-snout.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthKitProvider>
          <Providers>{children}</Providers>
        </AuthKitProvider>
      </body>
    </html>
  );
}
