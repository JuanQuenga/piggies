"use client";

import React from "react";
import { Id } from "../../../../convex/_generated/dataModel";
import { ProfilePage } from "./ProfilePage";
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
          <button
            onClick={onBack}
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Convert mock user data to the format expected by ProfilePage
  const mockProfile = {
    _id: mockUser._id,
    userId: mockUser.userId,
    displayName: mockUser.displayName,
    description: mockUser.description,
    avatarUrl: mockUser.avatarUrl,
    photos: [mockUser.avatarUrl], // Use avatar as photo
    latitude: currentUserProfileForMap?.latitude
      ? currentUserProfileForMap.latitude + (Math.random() - 0.5) * 0.01
      : undefined,
    longitude: currentUserProfileForMap?.longitude
      ? currentUserProfileForMap.longitude + (Math.random() - 0.5) * 0.01
      : undefined,
    lastSeen: mockUser.lastSeen,
    hostingStatus: mockUser.hostingStatus,
    isVisible: mockUser.isVisible,
    // Mock additional profile fields
    age: 25,
    heightInInches: 70,
    weightInLbs: 160,
    endowmentLength: 6,
    endowmentCut: "cut",
    bodyType: "athletic",
    gender: "male",
    expression: "masculine",
    position: "versatile",
    lookingFor: ["casual", "friends"],
    location: "Mock City",
    intoPublic: true,
    fetishes: ["roleplay", "bondage"],
    kinks: ["bdsm", "rough"],
    into: ["men", "women"],
    interaction: "in-person",
    hivStatus: "negative",
    hivTestedDate: new Date(
      Date.now() - 30 * 24 * 60 * 60 * 1000
    ).toISOString(), // 30 days ago
    showBasicInfo: true,
    showStats: true,
    showIdentity: true,
    showHealth: true,
    showScene: true,
    profilePhotos: [mockUser.avatarUrl],
  };

  const mockUserData = {
    _id: mockUser.userId,
    name: mockUser.displayName,
    email: `${mockUser.displayName?.toLowerCase()}@mock.com`,
  };

  return (
    <ProfilePage
      userId={userId}
      onBack={onBack}
      onStartChat={onStartChat}
      currentUserProfileForMap={currentUserProfileForMap}
      modalMode={modalMode}
      profile={mockProfile}
      user={mockUserData}
    />
  );
};
