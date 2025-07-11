"use client";

import { ProfileEditor } from "./ProfileEditor";
import { useEffect, useState } from "react";
import { useQuery } from "convex/react";
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useAuth } from "@workos-inc/authkit-nextjs/components";
import { Id } from "../../../../convex/_generated/dataModel";
import { Button } from "../../../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { Separator } from "../../../components/ui/separator";
import {
  ArrowLeft,
  MapPin,
  Clock,
  MessageCircle,
  MoreVertical,
  ShieldCheck,
} from "lucide-react";

interface ProfilePageProps {
  userId: Id<"users">;
  onBack: () => void;
  onStartChat: (userId: Id<"users">) => void;
  currentUserProfileForMap?: {
    latitude?: number;
    longitude?: number;
  } | null;
  modalMode?: boolean;
}

function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
  unit: "mi" | "km" = "mi"
) {
  const toRad = (x: number) => (x * Math.PI) / 180;
  const R = unit === "mi" ? 3958.8 : 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({
  userId,
  onBack,
  onStartChat,
  currentUserProfileForMap,
  modalMode = false,
}) => {
  const profile = useQuery(api.profiles.getProfileWithAvatarUrl, { userId });
  const user = useQuery(api.profiles.getUser, { userId });

  // Show loading state while queries are in progress
  if (profile === undefined || user === undefined) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  // Handle case where user doesn't exist
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h3 className="text-xl font-semibold text-primary mb-2">
            User not found
          </h3>
          <p className="text-muted-foreground mb-4">
            The user you're looking for doesn't exist in our system.
          </p>
          <Button onClick={onBack} variant="outline">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  // Handle case where profile doesn't exist but user does
  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-6xl mb-4">👤</div>
          <h3 className="text-xl font-semibold text-primary mb-2">
            Profile not found
          </h3>
          <p className="text-muted-foreground mb-4">
            This user hasn't created a profile yet.
          </p>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              User: {user.name || user.email || "Unknown"}
            </p>
            <Button onClick={onBack} variant="outline">
              Go Back
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const finalAvatarUrl = profile.avatarUrl || "/default-avatar.png";

  const lastSeenText = profile.lastSeen
    ? new Date(profile.lastSeen).toLocaleString()
    : "Unknown";

  let distanceDisplay = "--";
  if (
    currentUserProfileForMap?.latitude !== undefined &&
    currentUserProfileForMap?.longitude !== undefined &&
    profile.latitude !== undefined &&
    profile.longitude !== undefined
  ) {
    const distMi = haversineDistance(
      currentUserProfileForMap.latitude,
      currentUserProfileForMap.longitude,
      profile.latitude,
      profile.longitude,
      "mi"
    );
    const distKm = haversineDistance(
      currentUserProfileForMap.latitude,
      currentUserProfileForMap.longitude,
      profile.latitude,
      profile.longitude,
      "km"
    );
    distanceDisplay = `${distMi.toFixed(1)} mi / ${distKm.toFixed(1)} km`;
  }

  // For display, convert to metric if needed (assume US units for now, can add a prop for user preference)
  const heightInCm = profile.heightInInches
    ? Math.round(profile.heightInInches * 2.54)
    : undefined;
  const weightInKg = profile.weightInLbs
    ? Math.round(profile.weightInLbs * 0.453592)
    : undefined;
  const endowmentCm = profile.endowmentLength
    ? Math.round(profile.endowmentLength * 2.54)
    : undefined;

  const renderSection = (title: string, content: React.ReactNode) => (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-purple-600">{title}</h3>
      {content}
    </div>
  );

  const renderField = (
    label: string,
    value: string | number | undefined,
    unit?: string
  ) => {
    if (!value) return null;
    return (
      <div className="flex justify-between items-center py-2">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">
          {value}
          {unit && ` ${unit}`}
        </span>
      </div>
    );
  };

  const renderMultiField = (label: string, values: string[] | undefined) => {
    if (!values || values.length === 0) return null;
    return (
      <div className="space-y-2">
        <span className="text-muted-foreground">{label}</span>
        <div className="flex flex-wrap gap-2">
          {values.map((value, index) => (
            <Badge
              key={index}
              variant="secondary"
              className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
            >
              {value}
            </Badge>
          ))}
        </div>
      </div>
    );
  };

  // Determine main and additional photos
  let photos: string[] = [];
  if (
    profile.photos &&
    Array.isArray(profile.photos) &&
    profile.photos.length > 0
  ) {
    const firstPhoto = profile.photos[0];
    if (typeof firstPhoto === "string") {
      photos = profile.photos as unknown as string[];
    } else if (
      typeof firstPhoto === "object" &&
      firstPhoto !== null &&
      "url" in firstPhoto
    ) {
      photos = (profile.photos as unknown as Array<{ id: string; url: string }>)
        .map((p) =>
          typeof p === "object" && p !== null && "url" in p ? p.url : ""
        )
        .filter(Boolean);
    }
  } else if (profile.avatarUrl) {
    photos = [profile.avatarUrl];
  }
  const mainPhotoIdx = profile.mainPhotoIndex ?? 0;
  const mainPhoto = photos[mainPhotoIdx] || finalAvatarUrl;
  const additionalPhotos = photos
    .filter((_, idx) => idx !== mainPhotoIdx)
    .slice(0, 4);

  return (
    <div
      className={
        modalMode
          ? "h-full flex flex-col min-h-0 max-w-lg w-full mx-auto bg-zinc-900"
          : "h-full flex flex-col min-h-0 max-w-md w-full mx-auto border-purple-500 border-2 rounded-lg overflow-hidden"
      }
    >
      {/* Top Bar (above photo) */}
      <div
        className={
          modalMode
            ? "sticky top-0 z-20 w-full bg-zinc-900/95 border-b border-zinc-800 px-4 py-2 flex flex-col gap-0 shadow-lg"
            : "sticky top-0 z-20 w-full bg-black/95 border-b border-zinc-800 px-4 py-2 flex flex-col gap-0 shadow-lg"
        }
      >
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-white drop-shadow flex items-center">
            {/* Verified badge example, adjust as needed */}
            <span className="mr-1">
              {profile.displayName || user.name || "Anonymous User"}
            </span>
            {profile.status && (
              <Badge
                variant="secondary"
                className="text-xs bg-white/80 text-black ml-2"
              >
                {profile.status}
              </Badge>
            )}
          </span>
          {/* Actions */}
          <div className="ml-auto flex gap-2">
            <button className="bg-black/60 hover:bg-black/80 text-white rounded-full p-2 shadow-lg">
              <ShieldCheck size={20} />
            </button>
            <button className="bg-black/60 hover:bg-black/80 text-white rounded-full p-2 shadow-lg">
              <MoreVertical size={20} />
            </button>
          </div>
        </div>
        <div className="text-white text-sm font-medium drop-shadow mt-0.5">
          {[
            profile.age && `${profile.age}`,
            heightInCm && `${heightInCm}cm`,
            weightInKg && `${weightInKg}kg`,
            endowmentCm && `${endowmentCm}cm`,
            profile.bodyType,
            profile.gender,
            profile.sexuality,
            profile.position,
          ]
            .filter(Boolean)
            .join(", ")}
        </div>
      </div>
      {/* Profile Photo with overlays */}
      <div className="relative w-full aspect-[4/5] bg-black overflow-hidden flex items-center justify-center">
        <img
          src={mainPhoto}
          alt="Profile cover"
          className="w-48 h-48 rounded-full object-cover object-center border-4 border-white shadow-xl mx-auto mt-6 mb-4 bg-zinc-200"
        />
        {/* Overlay additional photos */}
        {additionalPhotos.length > 0 && (
          <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
            {additionalPhotos.map((photo, idx) => (
              <img
                key={idx}
                src={photo}
                alt={`Gallery photo ${idx + 1}`}
                className="w-14 h-14 rounded-full border-2 border-white shadow-lg object-cover bg-gray-200"
                style={{ marginTop: idx === 0 ? 0 : -12 }}
              />
            ))}
          </div>
        )}
        {/* Bio/description overlay */}
        {profile.description && (
          <div className="absolute bottom-24 left-0 w-full px-4 pb-2 z-10">
            <div className="bg-black/60 rounded-lg p-3 text-white text-sm font-normal shadow">
              {profile.description}
            </div>
          </div>
        )}
        {/* Floating Back Button (only if not modalMode) */}
        {!modalMode && (
          <button
            onClick={onBack}
            className="absolute top-4 left-4 z-20 bg-black/60 hover:bg-black/80 text-white rounded-full p-2 shadow-lg"
          >
            <ArrowLeft size={24} />
          </button>
        )}
      </div>
      {/* Sticky Bottom Bar */}
      <div className="w-full bg-black/90 text-white flex items-center justify-between px-4 py-3 border-t border-black/40 sticky bottom-0 z-30">
        <div className="flex items-center gap-2 text-xs">
          <Clock size={16} className="opacity-70" />
          <span className="opacity-80">
            {profile.lastSeen
              ? `${Math.round((Date.now() - new Date(profile.lastSeen).getTime()) / 60000)} minutes ago`
              : "Unknown"}
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <MapPin size={16} className="opacity-70" />
          <span className="opacity-80">{distanceDisplay}</span>
        </div>
        <button
          onClick={() => onStartChat(userId)}
          className="bg-purple-600 hover:bg-purple-700 text-white rounded-full p-2 shadow-lg flex items-center justify-center"
        >
          <MessageCircle size={18} />
        </button>
      </div>
    </div>
  );
};
