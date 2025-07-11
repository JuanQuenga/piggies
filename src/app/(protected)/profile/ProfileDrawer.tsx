import React from "react";
import { Sheet, SheetContent } from "../../components/ui/sheet";
import { ProfilePage } from ".";
import { Id } from "../../../convex/_generated/dataModel";

interface ProfileDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: Id<"users">;
  onBack: () => void;
  onStartChat: (userId: Id<"users">) => void;
  currentUserProfileForMap?: { latitude?: number; longitude?: number } | null;
}

export const ProfileDrawer: React.FC<ProfileDrawerProps> = ({
  open,
  onOpenChange,
  userId,
  onBack,
  onStartChat,
  currentUserProfileForMap,
}) => {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="max-w-lg w-full p-0 bg-card/95 overflow-y-auto z-[9999]"
      >
        <ProfilePage
          userId={userId}
          onBack={onBack}
          onStartChat={onStartChat}
          currentUserProfileForMap={currentUserProfileForMap}
        />
      </SheetContent>
    </Sheet>
  );
};
