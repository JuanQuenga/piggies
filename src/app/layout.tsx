import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-zinc-950 text-white h-full min-h-screen">
        <ClerkProvider
          publishableKey={
            process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ||
            "pk_test_placeholder"
          }
        >
          {children}
        </ClerkProvider>
      </body>
    </html>
  );
}
