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
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import { PigAvatar } from "../../../components/ui/pig-avatar";
import { getUserBackgroundColor } from "../../../lib/utils";

interface ProfilePageProps {
  userId: Id<"users">;
  onBack: () => void;
  onStartChat: (userId: Id<"users">) => void;
  currentUserProfileForMap?: {
    latitude?: number;
    longitude?: number;
  } | null;
  modalMode?: boolean;
  profile?: any; // Optional profile prop for preview
  user?: any; // Optional user prop for mock users
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
  profile: profileProp,
  user: userProp,
}) => {
  const profile =
    profileProp ?? useQuery(api.profiles.getProfileWithAvatarUrl, { userId });
  const user = userProp ?? useQuery(api.profiles.getUser, { userId });

  // Photo gallery state
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

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

  // Check if user has any photos
  const hasPhotos =
    profile.photos &&
    Array.isArray(profile.photos) &&
    profile.photos.length > 0;
  const hasAvatarUrl =
    profile.avatarUrl && profile.avatarUrl !== "/default-avatar.png";

  // Generate background color for pig avatar
  const backgroundColor = getUserBackgroundColor(
    userId,
    profile.displayName || user?.name
  );

  const finalAvatarUrl = hasAvatarUrl
    ? profile.avatarUrl
    : "/default-avatar.png";

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
  if (hasPhotos) {
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
  } else if (
    profile.profilePhotos &&
    Array.isArray(profile.profilePhotos) &&
    profile.profilePhotos.length > 0
  ) {
    // Use profilePhotos from formData if present and photos is empty
    photos = profile.profilePhotos;
  } else if (hasAvatarUrl) {
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
      {/* Unified Top Bar */}
      <div
        className={
          modalMode
            ? "sticky top-0 z-20 w-full bg-zinc-900/95 border-b border-zinc-800 px-4 py-3 shadow-lg"
            : "sticky top-0 z-20 w-full bg-black/95 border-b border-zinc-800 px-4 py-3 shadow-lg"
        }
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg font-bold text-white drop-shadow">
                {profile.displayName || user.name || "Anonymous User"}
              </span>
              {profile.status && (
                <Badge
                  variant="secondary"
                  className="text-xs bg-white/80 text-black"
                >
                  {profile.status}
                </Badge>
              )}
            </div>
            <div className="text-white text-sm font-medium drop-shadow">
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
          {/* Actions */}
          <div className="flex gap-2 ml-4">
            {modalMode && (
              <button
                onClick={onBack}
                className="bg-black/60 hover:bg-black/80 text-white rounded-full p-2 shadow-lg"
              >
                <X size={20} />
              </button>
            )}
            <button className="bg-black/60 hover:bg-black/80 text-white rounded-full p-2 shadow-lg">
              <ShieldCheck size={20} />
            </button>
            <button className="bg-black/60 hover:bg-black/80 text-white rounded-full p-2 shadow-lg">
              <MoreVertical size={20} />
            </button>
          </div>
        </div>
      </div>
      {/* Profile Photo with overlays */}
      <div
        className={`relative w-full aspect-[6/9] overflow-hidden ${!hasPhotos && !hasAvatarUrl ? backgroundColor : "bg-black"}`}
      >
        {!hasPhotos && !hasAvatarUrl ? (
          // Show pig avatar when no photos
          <div className="w-full h-full flex items-center justify-center p-16">
            <PigAvatar
              size="xl"
              backgroundColor={backgroundColor}
              className="w-48 h-48"
            />
          </div>
        ) : (
          <img
            src={mainPhoto}
            alt="Profile cover"
            className="w-full h-full object-cover object-center cursor-pointer"
            onClick={() => {
              setCurrentPhotoIndex(0);
              setIsGalleryOpen(true);
            }}
          />
        )}
        {/* Overlay additional photos */}
        {additionalPhotos.length > 0 && (
          <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
            {additionalPhotos.map((photo, idx) => (
              <img
                key={idx}
                src={photo}
                alt={`Gallery photo ${idx + 1}`}
                className="w-14 h-14 rounded-lg border-2 border-white shadow-lg object-cover bg-gray-200 cursor-pointer"
                style={{ marginTop: idx === 0 ? 0 : -12 }}
                onClick={() => {
                  setCurrentPhotoIndex(idx + 1);
                  setIsGalleryOpen(true);
                }}
              />
            ))}
          </div>
        )}
        {/* Show pig avatar thumbnails when no additional photos */}
        {!hasPhotos && !hasAvatarUrl && (
          <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
            {[1, 2, 3].map((idx) => (
              <div
                key={idx}
                className="w-14 h-14 rounded-lg border-2 border-white shadow-lg cursor-pointer"
                style={{ marginTop: idx === 1 ? 0 : -12 }}
                onClick={() => {
                  setCurrentPhotoIndex(idx);
                  setIsGalleryOpen(true);
                }}
              >
                <PigAvatar
                  size="lg"
                  backgroundColor={backgroundColor}
                  className="w-full h-full rounded-lg"
                />
              </div>
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

      {/* Profile Content Sections */}
      <div className="bg-zinc-900 text-white px-4 py-6 space-y-6">
        {/* Basic Info Section */}
        {(profile.displayName || profile.headliner || profile.hometown) && (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-purple-400 flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              Basic Information
            </h3>
            <div className="space-y-2">
              {profile.headliner && (
                <p className="text-lg font-medium text-white">
                  {profile.headliner}
                </p>
              )}
              {profile.hometown && (
                <div className="flex items-center gap-2 text-zinc-300">
                  <MapPin className="w-4 h-4" />
                  <span>{profile.hometown}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Stats Section */}
        {(profile.age ||
          profile.heightInInches ||
          profile.weightInLbs ||
          profile.endowmentLength ||
          profile.endowmentCut ||
          profile.bodyType) && (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-purple-400 flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              Stats
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {renderField("Age", profile.age)}
              {renderField("Height", heightInCm, "cm")}
              {renderField("Weight", weightInKg, "kg")}
              {renderField("Endowment", endowmentCm, "cm")}
              {renderField("Cut", profile.endowmentCut)}
              {renderField("Body Type", profile.bodyType)}
            </div>
          </div>
        )}

        {/* Identity Section */}
        {(profile.gender || profile.expression || profile.position) && (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-purple-400 flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              Identity
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {renderField("Gender", profile.gender)}
              {renderField("Expression", profile.expression)}
              {renderField("Position", profile.position)}
            </div>
          </div>
        )}

        {/* Looking For Section */}
        {profile.lookingFor && profile.lookingFor.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-purple-400 flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              Looking For
            </h3>
            {renderMultiField("", profile.lookingFor)}
          </div>
        )}

        {/* Location Section */}
        {profile.location && profile.location.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-purple-400 flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              Location
            </h3>
            {renderMultiField("", profile.location)}
          </div>
        )}

        {/* Scene Section */}
        {(profile.into ||
          profile.interaction ||
          profile.fetishes ||
          profile.kinks) && (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-purple-400 flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              Scene
            </h3>
            <div className="space-y-4">
              {profile.into &&
                profile.into.length > 0 &&
                renderMultiField("Into", profile.into)}
              {profile.interaction &&
                profile.interaction.length > 0 &&
                renderMultiField("Interaction", profile.interaction)}
              {profile.fetishes &&
                profile.fetishes.length > 0 &&
                renderMultiField("Fetishes", profile.fetishes)}
              {profile.kinks &&
                profile.kinks.length > 0 &&
                renderMultiField("Kinks", profile.kinks)}
            </div>
          </div>
        )}

        {/* Health Section */}
        {(profile.hivStatus || profile.hivTestedDate) && (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-purple-400 flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              Health
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {renderField("HIV Status", profile.hivStatus)}
              {renderField("Tested Date", profile.hivTestedDate)}
            </div>
          </div>
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

      {/* Photo Gallery Modal */}
      {isGalleryOpen && (
        <div
          className="fixed inset-0 z-[9999] bg-black/90 flex items-center justify-center"
          onClick={() => setIsGalleryOpen(false)}
        >
          <div className="relative w-full h-full flex items-center justify-center">
            {/* Close button */}
            <button
              onClick={() => setIsGalleryOpen(false)}
              className="absolute top-4 right-4 z-10 bg-black/60 hover:bg-black/80 text-white rounded-full p-2"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Photo counter */}
            <div className="absolute top-4 left-4 z-10 bg-black/60 text-white px-3 py-1 rounded-full text-sm">
              {currentPhotoIndex + 1} / {photos.length}
            </div>

            {/* Main photo */}
            <img
              src={photos[currentPhotoIndex] || finalAvatarUrl}
              alt={`Photo ${currentPhotoIndex + 1}`}
              className="max-w-full max-h-full object-contain"
              onClick={(e) => e.stopPropagation()}
            />

            {/* Navigation arrows */}
            {photos.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentPhotoIndex((prev) =>
                      prev === 0 ? photos.length - 1 : prev - 1
                    );
                  }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-black/60 hover:bg-black/80 text-white rounded-full p-3"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentPhotoIndex((prev) =>
                      prev === photos.length - 1 ? 0 : prev + 1
                    );
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-black/60 hover:bg-black/80 text-white rounded-full p-3"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
