"use client";

import React from "react";
import { Dialog, DialogContent } from "../../components/ui/dialog";
import { ProfilePage } from "./ProfilePage";
import { Id } from "../../../convex/_generated/dataModel";
import { Sheet, SheetContent } from "../../components/ui/sheet";
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

  if (isMobile) {
    // Full-page overlay for mobile
    return (
      <div className="fixed inset-0 z-[9999] bg-black/90 flex flex-col h-full">
        <ProfilePage
          userId={userId}
          onBack={onBack}
          onStartChat={onStartChat}
          currentUserProfileForMap={currentUserProfileForMap}
        />
        {/* Click outside to close */}
        <div
          className="fixed inset-0 z-[9998]"
          onClick={() => onOpenChange(false)}
          style={{ pointerEvents: "auto" }}
        />
      </div>
    );
  }

  // Desktop dialog
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="fixed right-6 top-8 max-w-md w-full max-h-[90vh] rounded-2xl shadow-2xl p-0 bg-card/95 border border-border flex flex-col z-[9999]"
        style={{ margin: 0 }}
      >
        <ProfilePage
          userId={userId}
          onBack={onBack}
          onStartChat={onStartChat}
          currentUserProfileForMap={currentUserProfileForMap}
        />
      </DialogContent>
    </Dialog>
  );
};
