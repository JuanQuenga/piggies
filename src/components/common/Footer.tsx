"use client";

import Link from "next/link";
import { Separator } from "@/components/ui/separator";

export function Footer() {
  return (
    <footer className="bg-zinc-950 border-t border-zinc-900 py-8 mt-auto">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="text-zinc-400 text-sm">
            © {new Date().getFullYear()} Your Company Name. All rights
            reserved.
          </div>

          <nav className="flex items-center space-x-6">
            <Link
              href="/legal/terms"
              className="text-sm text-zinc-400 hover:text-purple-400 transition-colors"
            >
              Terms of Service
            </Link>
            <Separator orientation="vertical" className="h-4 bg-zinc-800" />
            <Link
              href="/legal/privacy"
              className="text-sm text-zinc-400 hover:text-purple-400 transition-colors"
            >
              Privacy Policy
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
