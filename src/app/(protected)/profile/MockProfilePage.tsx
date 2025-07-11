"use client";

import React, { useState } from "react";
import { Id } from "../../../../convex/_generated/dataModel";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import {
  ArrowLeft,
  MapPin,
  Clock,
  MessageCircle,
  MoreVertical,
  ShieldCheck,
  X,
  Home,
  Users,
  Hotel,
  Car,
  MapPin as MapPinIcon,
} from "lucide-react";
import { mockUsers } from "./mockUsers";

interface MockProfilePageProps {
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

export const MockProfilePage: React.FC<MockProfilePageProps> = ({
  userId,
  onBack,
  onStartChat,
  currentUserProfileForMap,
  modalMode = false,
}) => {
  // Find the mock user by userId
  const mockUser = mockUsers.find((user) => user.userId === userId);

  if (!mockUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h3 className="text-xl font-semibold text-primary mb-2">
            Mock user not found
          </h3>
          <p className="text-muted-foreground mb-4">
            The mock user you're looking for doesn't exist.
          </p>
          <Button onClick={onBack} variant="outline">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  // Photo gallery state
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  const finalAvatarUrl = mockUser.avatarUrl || "/default-avatar.png";

  const lastSeenText = mockUser.lastSeen
    ? new Date(mockUser.lastSeen).toLocaleString()
    : "Unknown";

  let distanceDisplay = "--";
  if (
    currentUserProfileForMap?.latitude !== undefined &&
    currentUserProfileForMap?.longitude !== undefined &&
    mockUser._distance !== undefined
  ) {
    distanceDisplay = `${mockUser._distance.toFixed(1)} mi`;
  }

  // Hosting status configuration (matching StatusControls.tsx)
  const hostingStatusConfig = {
    "not-hosting": {
      label: "Can't Host",
      icon: Home,
      color: "text-zinc-400",
      bgColor: "bg-zinc-800",
    },
    hosting: {
      label: "Hosting",
      icon: Home,
      color: "text-green-400",
      bgColor: "bg-green-900/20",
    },
    "hosting-group": {
      label: "Group Host",
      icon: Users,
      color: "text-purple-400",
      bgColor: "bg-purple-900/20",
    },
    gloryhole: {
      label: "Gloryhole",
      icon: Home,
      color: "text-pink-400",
      bgColor: "bg-pink-900/20",
    },
    hotel: {
      label: "Hotel",
      icon: Hotel,
      color: "text-blue-400",
      bgColor: "bg-blue-900/20",
    },
    car: {
      label: "Car",
      icon: Car,
      color: "text-yellow-400",
      bgColor: "bg-yellow-900/20",
    },
    cruising: {
      label: "Cruising",
      icon: MapPinIcon,
      color: "text-red-400",
      bgColor: "bg-red-900/20",
    },
  };

  const statusConfig =
    hostingStatusConfig[
      mockUser.hostingStatus as keyof typeof hostingStatusConfig
    ] || hostingStatusConfig["not-hosting"];

  const isOnline =
    mockUser.lastSeen && mockUser.lastSeen > Date.now() - 5 * 60 * 1000;

  // Mock additional photos (just use the same avatar for demo)
  const photos = [finalAvatarUrl, finalAvatarUrl, finalAvatarUrl];
  const mainPhoto = photos[0];
  const additionalPhotos = photos.slice(1, 3);

  const renderField = (
    label: string,
    value: string | number | undefined,
    unit?: string
  ) => {
    if (!value) return null;
    return (
      <div className="flex justify-between items-center py-2">
        <span className="text-zinc-400">{label}</span>
        <span className="font-medium text-white">
          {value}
          {unit && ` ${unit}`}
        </span>
      </div>
    );
  };

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
                {mockUser.displayName || "Mock User"}
              </span>
              {isOnline && (
                <Badge
                  variant="secondary"
                  className="text-xs bg-green-500 text-white"
                >
                  Online
                </Badge>
              )}
            </div>
            <div className="text-white text-sm font-medium drop-shadow">
              {distanceDisplay} away
            </div>
          </div>
          {/* Actions */}
          <div className="flex gap-2 ml-4">
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
        className={`relative w-full aspect-[6/9] overflow-hidden ${mockUser.backgroundColor}`}
      >
        {/* For mock users with SVG, show background color and centered SVG */}
        {mockUser.avatarUrl === "/pig-snout.svg" ? (
          <div className="w-full h-full flex items-center justify-center p-16">
            <img
              src={finalAvatarUrl}
              alt={mockUser.displayName || "Mock User"}
              className="w-32 h-32 opacity-70"
              style={{ filter: "brightness(0) saturate(100%)" }}
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
              <div
                key={idx}
                className={`w-14 h-14 rounded-lg border-2 border-white shadow-lg object-cover cursor-pointer ${mockUser.backgroundColor}`}
                style={{ marginTop: idx === 0 ? 0 : -12 }}
                onClick={() => {
                  setCurrentPhotoIndex(idx + 1);
                  setIsGalleryOpen(true);
                }}
              >
                <div className="w-full h-full flex items-center justify-center">
                  <img
                    src={photo}
                    alt={`Gallery photo ${idx + 1}`}
                    className="w-8 h-8 opacity-70"
                    style={{ filter: "brightness(0) saturate(100%)" }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Bio/description overlay */}
        {mockUser.description && (
          <div className="absolute bottom-24 left-0 w-full px-4 pb-2 z-10">
            <div className="bg-black/60 rounded-lg p-3 text-white text-sm font-normal shadow">
              {mockUser.description}
            </div>
          </div>
        )}

        {/* Hosting status overlay */}
        {mockUser.hostingStatus && mockUser.isVisible && (
          <div className="absolute top-4 left-4 z-10">
            <div
              className={`px-3 py-2 rounded-lg flex items-center gap-2 ${statusConfig.bgColor} border border-white/20`}
            >
              {(() => {
                const IconComponent = statusConfig.icon;
                return (
                  <IconComponent className={`w-4 h-4 ${statusConfig.color}`} />
                );
              })()}
              <span className={`text-sm font-medium ${statusConfig.color}`}>
                {statusConfig.label}
              </span>
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
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-purple-400 flex items-center gap-2">
            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
            Basic Information
          </h3>
          <div className="space-y-2">
            <p className="text-lg font-medium text-white">
              {mockUser.displayName}
            </p>
            <div className="flex items-center gap-2 text-zinc-300">
              <MapPin className="w-4 h-4" />
              <span>Mock Location</span>
            </div>
          </div>
        </div>

        {/* Status Section */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-purple-400 flex items-center gap-2">
            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
            Status
          </h3>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div
                className={`w-3 h-3 rounded-full ${isOnline ? "bg-green-500" : "bg-zinc-500"}`}
              />
              <span className="text-white">
                {isOnline ? "Online" : "Offline"}
              </span>
            </div>
            <div className="flex items-center gap-2 text-zinc-300">
              <Clock className="w-4 h-4" />
              <span>Last seen: {lastSeenText}</span>
            </div>
            {mockUser.hostingStatus && (
              <div className="flex items-center gap-2">
                {(() => {
                  const IconComponent = statusConfig.icon;
                  return (
                    <IconComponent
                      className={`w-4 h-4 ${statusConfig.color}`}
                    />
                  );
                })()}
                <span className={statusConfig.color}>{statusConfig.label}</span>
              </div>
            )}
          </div>
        </div>

        {/* Mock Stats Section */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-purple-400 flex items-center gap-2">
            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
            Mock Stats
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {renderField("Age", "25")}
            {renderField("Height", "175", "cm")}
            {renderField("Weight", "70", "kg")}
            {renderField("Distance", mockUser._distance?.toFixed(1), "mi")}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 pt-4">
          <Button
            onClick={() => onStartChat(userId)}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white"
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            Start Chat
          </Button>
          <div className="text-center text-xs text-zinc-500">
            This is a mock profile for demonstration purposes
          </div>
        </div>
      </div>

      {/* Photo Gallery Modal */}
      {isGalleryOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center">
          <div className="relative w-full h-full flex items-center justify-center">
            <button
              onClick={() => setIsGalleryOpen(false)}
              className="absolute top-4 right-4 z-10 bg-black/60 hover:bg-black/80 text-white rounded-full p-2"
            >
              <X size={24} />
            </button>
            <div
              className={`w-full h-full flex items-center justify-center ${mockUser.backgroundColor}`}
            >
              <img
                src={photos[currentPhotoIndex]}
                alt={`Gallery photo ${currentPhotoIndex + 1}`}
                className="max-w-full max-h-full object-contain"
                style={{
                  filter:
                    mockUser.avatarUrl === "/pig-snout.svg"
                      ? "brightness(0) saturate(100%)"
                      : "none",
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
