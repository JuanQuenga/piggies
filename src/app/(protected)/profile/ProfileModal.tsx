"use client";

import React, { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { Button } from "../../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { Separator } from "../../../components/ui/separator";
import { Input } from "../../../components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/dialog";
import {
  MessageCircle,
  MapPin,
  Users,
  X,
  User,
  Mail,
  Phone,
  Globe,
  Calendar,
  Map,
} from "lucide-react";
import { cn } from "../../../lib/utils";
import { ProfilePage } from "./ProfilePage";

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
  columnMode?: boolean;
  profile?: any; // Optional profile prop for preview
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  open,
  onOpenChange,
  userId,
  onBack,
  onStartChat,
  currentUserProfileForMap,
  columnMode = false,
  profile,
}) => {
  const isMobile = useIsMobile();

  // Swipe-to-close state (must be outside conditional)
  const touchStartX = React.useRef<number | null>(null);
  const touchStartY = React.useRef<number | null>(null);
  const touchDeltaX = React.useRef<number>(0);
  const touchDeltaY = React.useRef<number>(0);
  const [swiped, setSwiped] = React.useState(false);

  if (!open) return null;

  // Column mode - render as a column without backdrop or header
  if (columnMode) {
    return (
      <div className="h-full bg-zinc-900 overflow-y-auto">
        <ProfilePage
          userId={userId}
          onBack={onBack}
          onStartChat={onStartChat}
          currentUserProfileForMap={currentUserProfileForMap}
          modalMode={true}
          profile={profile}
        />
      </div>
    );
  }

  if (isMobile) {
    const handleTouchStart = (e: React.TouchEvent) => {
      touchStartX.current = e.touches[0].clientX;
      touchStartY.current = e.touches[0].clientY;
      touchDeltaX.current = 0;
      touchDeltaY.current = 0;
      setSwiped(false);
    };
    const handleTouchMove = (e: React.TouchEvent) => {
      if (touchStartX.current !== null && touchStartY.current !== null) {
        touchDeltaX.current = e.touches[0].clientX - touchStartX.current;
        touchDeltaY.current = e.touches[0].clientY - touchStartY.current;
      }
    };
    const handleTouchEnd = () => {
      if (
        !swiped &&
        touchDeltaX.current > 40 &&
        Math.abs(touchDeltaX.current) > 2 * Math.abs(touchDeltaY.current)
      ) {
        setSwiped(true);
        onOpenChange(false);
      }
      touchStartX.current = null;
      touchStartY.current = null;
      touchDeltaX.current = 0;
      touchDeltaY.current = 0;
    };

    // Full-page overlay for mobile
    return (
      <div
        className="fixed inset-0 z-[9999] bg-black/90 flex flex-col h-full w-full"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="flex-1 overflow-y-auto">
          <ProfilePage
            userId={userId}
            onBack={() => onOpenChange(false)}
            onStartChat={onStartChat}
            currentUserProfileForMap={currentUserProfileForMap}
            modalMode={true}
            profile={profile}
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
        <div className="flex-1 overflow-y-auto">
          <ProfilePage
            userId={userId}
            onBack={() => onOpenChange(false)}
            onStartChat={onStartChat}
            currentUserProfileForMap={currentUserProfileForMap}
            modalMode={true}
            profile={profile}
          />
        </div>
      </div>
    </div>
  );
};
