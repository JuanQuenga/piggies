"use client";

import React from "react";
import { ProfilePage } from "./ProfilePage";
import { Id } from "../../../convex/_generated/dataModel";
import { Button } from "../../components/ui/button";
import { X } from "lucide-react";

function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState(false);
  React.useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  return isMobile;
}

interface ProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: Id<"users">;
  onBack: () => void;
  onStartChat: (userId: Id<"users">) => void;
  currentUserProfileForMap?: { latitude?: number; longitude?: number } | null;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  open,
  onOpenChange,
  userId,
  onBack,
  onStartChat,
  currentUserProfileForMap,
}) => {
  const isMobile = useIsMobile();
  if (!open) return null;

  // Shared sticky header
  const Header = (
    <div className="sticky top-0 z-10 flex items-center justify-between bg-zinc-900/95 backdrop-blur px-4 py-3 border-b border-zinc-800">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onOpenChange(false)}
        aria-label="Close"
        className="mr-2"
      >
        <X className="w-6 h-6" />
      </Button>
      <div className="flex-1 flex items-center justify-center">
        {/* Name will be rendered by ProfilePage header */}
      </div>
      <div className="w-8" /> {/* Spacer for symmetry */}
    </div>
  );

  if (isMobile) {
    // Full-page overlay for mobile
    return (
      <div className="fixed inset-0 z-[9999] bg-black/90 flex flex-col h-full w-full">
        {Header}
        <div className="flex-1 overflow-y-auto">
          <ProfilePage
            userId={userId}
            onBack={() => onOpenChange(false)}
            onStartChat={onStartChat}
            currentUserProfileForMap={currentUserProfileForMap}
            modalMode={true}
          />
        </div>
      </div>
    );
  }

  // Desktop dialog - centered modal
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60">
      <div
        className="relative w-full max-w-lg max-h-[90vh] rounded-2xl shadow-2xl bg-zinc-900/95 backdrop-blur border border-zinc-800 flex flex-col"
        style={{ margin: 0 }}
      >
        {Header}
        <div className="flex-1 overflow-y-auto">
          <ProfilePage
            userId={userId}
            onBack={() => onOpenChange(false)}
            onStartChat={onStartChat}
            currentUserProfileForMap={currentUserProfileForMap}
            modalMode={true}
          />
        </div>
      </div>
    </div>
  );
};
