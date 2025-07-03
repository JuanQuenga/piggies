import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { UnitPreferenceProvider } from "../components/common/UnitPreferenceContext";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <UnitPreferenceProvider>
        <html lang="en">
          <body className="bg-zinc-950 min-h-screen">{children}</body>
        </html>
      </UnitPreferenceProvider>
    </ClerkProvider>
  );
}
