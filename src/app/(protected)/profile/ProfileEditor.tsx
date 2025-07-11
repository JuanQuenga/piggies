"use client";

import { Id } from "../../../../convex/_generated/dataModel";
import { ProfilePage } from "./ProfilePage";
import { useUnitPreference } from "@/components/common/UnitPreferenceContext";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { ProfileModal } from "./ProfileModal";
import {
  Eye,
  Save,
  EyeOff,
  Upload,
  Camera,
  X,
  GripVertical,
  Check,
} from "lucide-react";
import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import {
  compressImage,
  uploadImageToConvex,
  cleanupImageUrl,
} from "@/lib/imageUtils";

// Unit conversion utilities
const inchesToCm = (inches: number) => Math.round(inches * 2.54);
const cmToInches = (cm: number) => Math.round(cm / 2.54);
const lbsToKg = (lbs: number) => Math.round(lbs * 0.45359237);
const kgToLbs = (kg: number) => Math.round(kg / 0.45359237);

// Profile field options
const PROFILE_OPTIONS = {
  age: Array.from({ length: 82 }, (_, i) => i + 18),
  heightInInches: Array.from({ length: 37 }, (_, i) => i + 48),
  weightInLbs: Array.from({ length: 63 }, (_, i) => 90 + i * 5),
  endowmentCut: ["Cut", "Uncut"],
  endowmentLength: Array.from({ length: 23 }, (_, i) => i * 0.5 + 1),
  bodyType: [
    "Slim",
    "Fit",
    "Muscular",
    "Normal",
    "Stocky",
    "Chubby",
    "Large",
    "Husky",
    "Toned",
  ],
  formatHeight: (inches: number, isUSUnits: boolean) => {
    if (isUSUnits) {
      const feet = Math.floor(inches / 12);
      const remainingInches = inches % 12;
      return `${feet}'${remainingInches}"`;
    }
    return `${inchesToCm(inches)} cm`;
  },
  formatWeight: (lbs: number, isUSUnits: boolean) => {
    return isUSUnits ? `${lbs} lbs` : `${lbsToKg(lbs)} kg`;
  },
  formatEndowmentLength: (inches: number, isUSUnits: boolean) => {
    return isUSUnits ? `${inches}"` : `${inchesToCm(inches)} cm`;
  },
};

// Define the HostingStatus type to match Convex
type HostingStatus =
  | "not-hosting"
  | "hosting"
  | "hosting-group"
  | "gloryhole"
  | "hotel"
  | "car"
  | "cruising";

interface ProfileEditorProps {
  profile: any;
  status: any;
  updateProfile: (data: any) => Promise<void>;
  updateStatus: (data: {
    isVisible?: boolean;
    isLocationEnabled?: boolean;
    latitude?: number;
    longitude?: number;
    locationRandomization?: number;
    hostingStatus?: HostingStatus;
  }) => Promise<void>;
  convexUser: any;
}

export function ProfileEditor({
  profile,
  status,
  updateProfile,
  updateStatus,
  convexUser,
}: ProfileEditorProps) {
  const { isUSUnits } = useUnitPreference();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // File input ref and handler for photo uploads
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log("[ProfileEditor] File select triggered");
    const files = e.target.files;
    console.log("[ProfileEditor] Files selected:", files?.length || 0);

    if (!files || files.length === 0) {
      console.log("[ProfileEditor] No files selected");
      return;
    }

    // Convert to array and capture files before clearing input
    const filesArray = Array.from(files);
    console.log(
      "[ProfileEditor] Files array created with",
      filesArray.length,
      "files"
    );

    // Reset the input after capturing files
    e.target.value = "";

    // Process files in a separate async function to avoid blocking
    console.log("[ProfileEditor] Starting to process files...");
    processFiles(filesArray);
  };

  const processFiles = async (files: File[]) => {
    console.log(
      "[ProfileEditor] processFiles called with",
      files.length,
      "files"
    );
    setIsUploading(true);

    try {
      const newPhotos = [...formData.profilePhotos];
      const maxPhotos = 5;
      const remainingSlots = maxPhotos - newPhotos.length;

      console.log("[ProfileEditor] Current photos:", newPhotos.length);
      console.log("[ProfileEditor] Remaining slots:", remainingSlots);

      if (remainingSlots <= 0) {
        console.log("Maximum photos reached");
        return;
      }

      // Process files one by one
      for (let i = 0; i < Math.min(files.length, remainingSlots); i++) {
        const file = files[i];

        // Basic validation
        if (!file.type.startsWith("image/")) {
          console.warn(`Skipping non-image file: ${file.name}`);
          continue;
        }

        try {
          console.log(
            `[ProfileEditor] Processing file: ${file.name} (${file.size} bytes)`
          );

          // Compress the image using browser-image-compression
          console.log(`[ProfileEditor] Compressing image...`);
          const compressedFile = await compressImage(file);
          console.log(
            `[ProfileEditor] Image compressed to ${compressedFile.file.size} bytes`
          );

          // Upload to Convex storage
          console.log(`[ProfileEditor] Uploading to Convex storage...`);
          console.log(`[ProfileEditor] Calling generateUploadUrl...`);
          const storageId = await uploadImageToConvex(
            compressedFile.file,
            async () => {
              console.log(`[ProfileEditor] generateUploadUrl called`);
              const url = await generateUploadUrl();
              console.log(`[ProfileEditor] generateUploadUrl returned:`, url);
              return url;
            }
          );
          console.log(
            `[ProfileEditor] Upload successful, storage ID:`,
            storageId
          );

          // Add to photos array
          newPhotos.push(storageId);
          console.log(
            `[ProfileEditor] Added to photos array, total:`,
            newPhotos.length
          );

          // Clean up the temporary URL
          cleanupImageUrl(compressedFile.url);

          // Update form data
          handleInputChange("profilePhotos", [...newPhotos]);
          console.log(`[ProfileEditor] Form data updated`);
        } catch (error) {
          console.error(`Error processing file ${file.name}:`, error);
          // Show user-friendly error message
          alert(`Failed to upload ${file.name}. Please try again.`);
        }
      }
    } catch (error) {
      console.error("Error in file processing:", error);
      alert("Failed to process files. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  // Add mutation for generating upload URLs
  const generateUploadUrl = useMutation(
    api.profiles.generateProfilePhotoUploadUrl
  );

  // Helper function to get image URL for display
  const getImageUrlForDisplay = (storageId: string) => {
    // If it's already a URL (for backward compatibility), return it
    if (
      storageId.startsWith("http") ||
      storageId.startsWith("blob:") ||
      storageId.startsWith("data:")
    ) {
      return storageId;
    }
    // For storage IDs, use the Convex function to get the URL
    // For now, return a placeholder until we implement proper URL fetching
    return `/api/images/${storageId}`;
  };

  // Component to display an image from storage ID
  // Remove StorageImage component and per-photo useQuery

  const [formData, setFormData] = useState({
    displayName: "",
    headliner: "",
    hometown: "",
    profilePhotos: [] as string[],
    photos: [] as { id: string; url: string | null }[],
    age: undefined as number | undefined,
    heightInInches: undefined as number | undefined,
    weightInLbs: undefined as number | undefined,
    endowmentLength: undefined as number | undefined,
    endowmentCut: "",
    bodyType: "",
    // Added fields for all profile options:
    gender: "",
    expression: "",
    position: "",
    lookingFor: [] as string[],
    location: [] as string[],
    intoPublic: [] as string[],
    hivStatus: "",
    hivTestedDate: "",
    kinks: [] as string[],
    fetishes: [] as string[],
    // Section visibility toggles
    showBasicInfo: true,
    showStats: true,
    showIdentity: true,
    showHealth: true,
    showScene: true,
    // Scene section additional fields
    into: [] as string[], // Choose up to 3
    interaction: [] as string[], // Choose up to 3
  });

  // Filter out base64 data URLs from profilePhotos before querying
  // Use formData.profilePhotos as the primary source since it includes newly uploaded photos
  const validStorageIds =
    formData.profilePhotos?.filter(
      (photo: string) =>
        !photo.startsWith("data:") && !photo.startsWith("blob:")
    ) || [];

  const photoUrls = useQuery(
    api.profiles.getPhotoUrls,
    validStorageIds.length > 0 ? { storageIds: validStorageIds } : "skip"
  );

  useEffect(() => {
    console.log("[ProfileEditor] Profile data received:", profile);
    console.log("[ProfileEditor] Current formData:", formData);
    console.log("[ProfileEditor] isInitialized:", isInitialized);

    // Only update form data if profile is loaded and form is not already initialized
    if (profile && !isInitialized) {
      console.log("[ProfileEditor] Setting form data with profile:", {
        displayName: profile.displayName,
        age: profile.age,
        heightInInches: profile.heightInInches,
        weightInLbs: profile.weightInLbs,
        gender: profile.gender,
        expression: profile.expression,
        position: profile.position,
        lookingFor: profile.lookingFor,
        location: profile.location,
        intoPublic: profile.intoPublic,
        fetishes: profile.fetishes,
        kinks: profile.kinks,
        into: profile.into,
        interaction: profile.interaction,
        hivStatus: profile.hivStatus,
        hivTestedDate: profile.hivTestedDate,
        showBasicInfo: profile.showBasicInfo,
        showStats: profile.showStats,
        showIdentity: profile.showIdentity,
        showHealth: profile.showHealth,
        showScene: profile.showScene,
        profilePhotos: profile.profilePhotos,
        photos: profile.photos,
      });

      const newFormData = {
        displayName: profile.displayName || "",
        headliner: profile.headliner || "",
        hometown: profile.hometown || "",
        profilePhotos: profile.profilePhotos || [],
        photos: profile.photos || [], // Assuming photos is the same as profilePhotos for now
        age: profile.age,
        heightInInches: profile.heightInInches,
        weightInLbs: profile.weightInLbs,
        endowmentLength: profile.endowmentLength,
        endowmentCut: profile.endowmentCut || "",
        bodyType: profile.bodyType || "",
        // Added fields for all profile options:
        gender: profile.gender || "",
        expression: profile.expression || "",
        position: profile.position || "",
        lookingFor: Array.isArray(profile.lookingFor) ? profile.lookingFor : [],
        location: Array.isArray(profile.location) ? profile.location : [],
        intoPublic: Array.isArray(profile.intoPublic) ? profile.intoPublic : [],
        into: Array.isArray(profile.into) ? profile.into : [],
        interaction: Array.isArray(profile.interaction)
          ? profile.interaction
          : [],
        hivStatus: profile.hivStatus || "",
        hivTestedDate: profile.hivTestedDate || "",
        kinks: profile.kinks || [],
        fetishes: profile.fetishes || [],
        // Section visibility toggles
        showBasicInfo: profile.showBasicInfo ?? true,
        showStats: profile.showStats ?? true,
        showIdentity: profile.showIdentity ?? true,
        showHealth: profile.showHealth ?? true,
        showScene: profile.showScene ?? true,
      };

      console.log("[ProfileEditor] New form data to be set:", newFormData);
      setFormData(newFormData);
      setIsInitialized(true);
      setHasUnsavedChanges(false);
    } else if (profile === null && !isInitialized) {
      console.log(
        "[ProfileEditor] No profile exists yet, initializing with empty form"
      );
      // Initialize with empty form when no profile exists
      const emptyFormData = {
        displayName: "",
        headliner: "",
        hometown: "",
        profilePhotos: [],
        photos: [],
        age: undefined,
        heightInInches: undefined,
        weightInLbs: undefined,
        endowmentLength: undefined,
        endowmentCut: "",
        bodyType: "",
        gender: "",
        expression: "",
        position: "",
        lookingFor: [],
        location: [],
        intoPublic: [],
        into: [],
        interaction: [],
        hivStatus: "",
        hivTestedDate: "",
        kinks: [],
        fetishes: [],
        showBasicInfo: true,
        showStats: true,
        showIdentity: true,
        showHealth: true,
        showScene: true,
      };
      console.log("[ProfileEditor] Empty form data to be set:", emptyFormData);
      setFormData(emptyFormData);
      setIsInitialized(true);
      setHasUnsavedChanges(false);
    } else if (profile === undefined) {
      console.log("[ProfileEditor] Profile data still loading...");
    }
  }, [profile]);

  useEffect(() => {
    if (photoUrls && isInitialized) {
      console.log("[ProfileEditor] photoUrls received:", photoUrls);
      setFormData((prev) => ({
        ...prev,
        photos: photoUrls, // [{id, url}, ...]
      }));
    }
  }, [photoUrls, isInitialized]);

  // Clean up any base64 data URLs from profilePhotos array
  useEffect(() => {
    if (
      isInitialized &&
      formData.profilePhotos &&
      formData.profilePhotos.length > 0
    ) {
      const hasBase64Data = formData.profilePhotos.some(
        (photo: string) =>
          photo.startsWith("data:") || photo.startsWith("blob:")
      );

      if (hasBase64Data) {
        console.warn("Found base64 data URLs in profilePhotos, cleaning up...");
        const cleanPhotos = formData.profilePhotos.filter(
          (photo: string) =>
            !photo.startsWith("data:") && !photo.startsWith("blob:")
        );
        setFormData((prev) => ({
          ...prev,
          profilePhotos: cleanPhotos,
        }));
      }
    }
  }, [formData.profilePhotos, isInitialized]);

  // Debug: Log when form data changes
  useEffect(() => {
    if (isInitialized) {
      console.log("[ProfileEditor] Form data updated:", {
        displayName: formData.displayName,
        age: formData.age,
        gender: formData.gender,
        expression: formData.expression,
        position: formData.position,
        lookingFor: formData.lookingFor,
        location: formData.location,
        intoPublic: formData.intoPublic,
        fetishes: formData.fetishes,
        kinks: formData.kinks,
        into: formData.into,
        interaction: formData.interaction,
        hivStatus: formData.hivStatus,
        hivTestedDate: formData.hivTestedDate,
        showBasicInfo: formData.showBasicInfo,
        showStats: formData.showStats,
        showIdentity: formData.showIdentity,
        showHealth: formData.showHealth,
        showScene: formData.showScene,
      });
    }
  }, [formData, isInitialized]);

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    setHasUnsavedChanges(true);
  };

  // Drag and drop handlers for photo reordering
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDragEnd = () => {
    if (
      draggedIndex !== null &&
      dragOverIndex !== null &&
      draggedIndex !== dragOverIndex
    ) {
      const newPhotos = [...formData.profilePhotos];
      const [draggedPhoto] = newPhotos.splice(draggedIndex, 1);
      newPhotos.splice(dragOverIndex, 0, draggedPhoto);
      handleInputChange("profilePhotos", newPhotos);
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const renderStatField = (
    label: string,
    field: string,
    visibilityField: string,
    children: React.ReactNode
  ) => (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <Label className="text-sm font-medium text-zinc-200">{label}</Label>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className={cn(
              "flex items-center gap-2 bg-transparent px-3 py-1.5 text-xs",
              (formData[visibilityField as keyof typeof formData] as boolean)
                ? "text-purple-400 border-purple-600"
                : "text-zinc-400 border-zinc-600"
            )}
            onClick={() =>
              handleInputChange(
                visibilityField,
                !formData[visibilityField as keyof typeof formData] as boolean
              )
            }
          >
            {(formData[visibilityField as keyof typeof formData] as boolean) ? (
              <Eye className="w-3 h-3" />
            ) : (
              <EyeOff className="w-3 h-3" />
            )}
            {(formData[visibilityField as keyof typeof formData] as boolean)
              ? "Visible"
              : "Hidden"}
          </Button>
        </div>
      </div>
      {children}
    </div>
  );

  // --- Section: Stats ---
  const renderStatsSection = () => (
    <div className="mb-8">
      <div className="pb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
          Stats
        </h3>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "flex items-center gap-2 px-3 py-1.5 text-xs border bg-transparent",
            formData.showStats
              ? "text-purple-400 border-purple-600"
              : "text-zinc-400 border-zinc-600"
          )}
          onClick={() => handleInputChange("showStats", !formData.showStats)}
        >
          {formData.showStats ? (
            <Eye className="w-3 h-3" />
          ) : (
            <EyeOff className="w-3 h-3" />
          )}
          {formData.showStats ? "Visible" : "Hidden"}
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Age */}
        <div className="space-y-3">
          <Label className="text-sm font-medium text-zinc-200">Age</Label>
          <Select
            value={formData.age?.toString() || ""}
            onValueChange={(value) =>
              handleInputChange("age", value ? parseInt(value) : undefined)
            }
          >
            <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-750 focus:ring-purple-500">
              <SelectValue placeholder="Select age" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-800 border-zinc-700">
              {PROFILE_OPTIONS.age.map((age) => (
                <SelectItem
                  key={age}
                  value={age.toString()}
                  className="text-white hover:bg-zinc-700 focus:bg-zinc-700"
                >
                  {age}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {formData.age && (
            <div className="flex flex-wrap gap-2 mt-2">
              <div className="flex items-center gap-2 bg-purple-600/10 border border-purple-600 text-purple-400 px-3 py-1.5 rounded-lg text-sm">
                <span>{formData.age}</span>
                <button
                  type="button"
                  onClick={() => handleInputChange("age", undefined)}
                  className="hover:text-white transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}
        </div>
        {/* Height */}
        <div className="space-y-3">
          <Label className="text-sm font-medium text-zinc-200">Height</Label>
          <Select
            value={formData.heightInInches?.toString() || ""}
            onValueChange={(value) =>
              handleInputChange(
                "heightInInches",
                value ? parseInt(value) : undefined
              )
            }
          >
            <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-750 focus:ring-purple-500">
              <SelectValue placeholder="Select height" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-800 border-zinc-700">
              {PROFILE_OPTIONS.heightInInches.map((inches) => (
                <SelectItem
                  key={inches}
                  value={inches.toString()}
                  className="text-white hover:bg-zinc-700 focus:bg-zinc-700"
                >
                  {PROFILE_OPTIONS.formatHeight(inches, isUSUnits)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {formData.heightInInches && (
            <div className="flex flex-wrap gap-2 mt-2">
              <div className="flex items-center gap-2 bg-purple-600/10 border border-purple-600 text-purple-400 px-3 py-1.5 rounded-lg text-sm">
                <span>
                  {PROFILE_OPTIONS.formatHeight(
                    formData.heightInInches,
                    isUSUnits
                  )}
                </span>
                <button
                  type="button"
                  onClick={() => handleInputChange("heightInInches", undefined)}
                  className="hover:text-white transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}
        </div>
        {/* Weight */}
        <div className="space-y-3">
          <Label className="text-sm font-medium text-zinc-200">Weight</Label>
          <Select
            value={formData.weightInLbs?.toString() || ""}
            onValueChange={(value) =>
              handleInputChange(
                "weightInLbs",
                value ? parseInt(value) : undefined
              )
            }
          >
            <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-750 focus:ring-purple-500">
              <SelectValue placeholder="Select weight" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-800 border-zinc-700">
              {PROFILE_OPTIONS.weightInLbs.map((lbs) => (
                <SelectItem
                  key={lbs}
                  value={lbs.toString()}
                  className="text-white hover:bg-zinc-700 focus:bg-zinc-700"
                >
                  {PROFILE_OPTIONS.formatWeight(lbs, isUSUnits)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {formData.weightInLbs && (
            <div className="flex flex-wrap gap-2 mt-2">
              <div className="flex items-center gap-2 bg-purple-600/10 border border-purple-600 text-purple-400 px-3 py-1.5 rounded-lg text-sm">
                <span>
                  {PROFILE_OPTIONS.formatWeight(
                    formData.weightInLbs,
                    isUSUnits
                  )}
                </span>
                <button
                  type="button"
                  onClick={() => handleInputChange("weightInLbs", undefined)}
                  className="hover:text-white transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}
        </div>
        {/* Body Type */}
        <div className="space-y-3">
          <Label className="text-sm font-medium text-zinc-200">Body Type</Label>
          <Select
            value={formData.bodyType}
            onValueChange={(value) => handleInputChange("bodyType", value)}
          >
            <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-750 focus:ring-purple-500">
              <SelectValue placeholder="Select body type" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-800 border-zinc-700">
              {PROFILE_OPTIONS.bodyType.map((type) => (
                <SelectItem
                  key={type}
                  value={type}
                  className="text-white hover:bg-zinc-700 focus:bg-zinc-700"
                >
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {formData.bodyType && (
            <div className="flex flex-wrap gap-2 mt-2">
              <div className="flex items-center gap-2 bg-purple-600/10 border border-purple-600 text-purple-400 px-3 py-1.5 rounded-lg text-sm">
                <span>{formData.bodyType}</span>
                <button
                  type="button"
                  onClick={() => handleInputChange("bodyType", "")}
                  className="hover:text-white transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}
        </div>
        {/* Endowment Length */}
        <div className="space-y-3">
          <Label className="text-sm font-medium text-zinc-200">
            Endowment Length
          </Label>
          <Select
            value={formData.endowmentLength?.toString() || ""}
            onValueChange={(value) =>
              handleInputChange(
                "endowmentLength",
                value ? parseFloat(value) : undefined
              )
            }
          >
            <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-750 focus:ring-purple-500">
              <SelectValue placeholder="Select length" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-800 border-zinc-700">
              {PROFILE_OPTIONS.endowmentLength.map((inches) => (
                <SelectItem
                  key={inches}
                  value={inches.toString()}
                  className="text-white hover:bg-zinc-700 focus:bg-zinc-700"
                >
                  {PROFILE_OPTIONS.formatEndowmentLength(inches, isUSUnits)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {formData.endowmentLength && (
            <div className="flex flex-wrap gap-2 mt-2">
              <div className="flex items-center gap-2 bg-purple-600/10 border border-purple-600 text-purple-400 px-3 py-1.5 rounded-lg text-sm">
                <span>
                  {PROFILE_OPTIONS.formatEndowmentLength(
                    formData.endowmentLength,
                    isUSUnits
                  )}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    handleInputChange("endowmentLength", undefined)
                  }
                  className="hover:text-white transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}
        </div>
        {/* Endowment Cut */}
        <div className="space-y-3">
          <Label className="text-sm font-medium text-zinc-200">
            Endowment Cut
          </Label>
          <Select
            value={formData.endowmentCut}
            onValueChange={(value) => handleInputChange("endowmentCut", value)}
          >
            <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-750 focus:ring-purple-500">
              <SelectValue placeholder="Select cut" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-800 border-zinc-700">
              {PROFILE_OPTIONS.endowmentCut.map((cut) => (
                <SelectItem
                  key={cut}
                  value={cut}
                  className="text-white hover:bg-zinc-700 focus:bg-zinc-700"
                >
                  {cut}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {formData.endowmentCut && (
            <div className="flex flex-wrap gap-2 mt-2">
              <div className="flex items-center gap-2 bg-purple-600/10 border border-purple-600 text-purple-400 px-3 py-1.5 rounded-lg text-sm">
                <span>{formData.endowmentCut}</span>
                <button
                  type="button"
                  onClick={() => handleInputChange("endowmentCut", "")}
                  className="hover:text-white transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      <Separator className="mt-8 bg-zinc-700/80 h-px" />
    </div>
  );

  // --- Section: Identity ---
  const renderIdentitySection = () => (
    <div className="mb-8">
      <div className="pb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
          Identity
        </h3>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "flex items-center gap-2 px-3 py-1.5 text-xs border bg-transparent",
            formData.showIdentity
              ? "text-purple-400 border-purple-600"
              : "text-zinc-400 border-zinc-600"
          )}
          onClick={() =>
            handleInputChange("showIdentity", !formData.showIdentity)
          }
        >
          {formData.showIdentity ? (
            <Eye className="w-3 h-3" />
          ) : (
            <EyeOff className="w-3 h-3" />
          )}
          {formData.showIdentity ? "Visible" : "Hidden"}
        </Button>
      </div>
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium text-zinc-200">Gender</Label>
            <Select
              value={formData.gender}
              onValueChange={(value) => handleInputChange("gender", value)}
            >
              <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-750 focus:ring-purple-500">
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-800 border-zinc-700">
                {["Male", "Female", "Non-binary", "Other"].map((gender) => (
                  <SelectItem
                    key={gender}
                    value={gender}
                    className="text-white hover:bg-zinc-700 focus:bg-zinc-700"
                  >
                    {gender}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {formData.gender && (
              <div className="flex flex-wrap gap-2 mt-2">
                <div className="flex items-center gap-2 bg-purple-600/10 border border-purple-600 text-purple-400 px-3 py-1.5 rounded-lg text-sm">
                  <span>{formData.gender}</span>
                  <button
                    type="button"
                    onClick={() => handleInputChange("gender", "")}
                    className="hover:text-white transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-zinc-200">
              Expression
            </Label>
            <Select
              value={formData.expression}
              onValueChange={(value) => handleInputChange("expression", value)}
            >
              <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-750 focus:ring-purple-500">
                <SelectValue placeholder="Select expression" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-800 border-zinc-700">
                {["Masculine", "Feminine", "Androgynous", "Other"].map(
                  (expr) => (
                    <SelectItem
                      key={expr}
                      value={expr}
                      className="text-white hover:bg-zinc-700 focus:bg-zinc-700"
                    >
                      {expr}
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>
            {formData.expression && (
              <div className="flex flex-wrap gap-2 mt-2">
                <div className="flex items-center gap-2 bg-purple-600/10 border border-purple-600 text-purple-400 px-3 py-1.5 rounded-lg text-sm">
                  <span>{formData.expression}</span>
                  <button
                    type="button"
                    onClick={() => handleInputChange("expression", "")}
                    className="hover:text-white transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <Separator className="mt-8 bg-zinc-700/80 h-px" />
    </div>
  );

  // --- Section: Scene ---
  const renderSceneSection = () => (
    <div className="mb-8">
      <div className="pb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          Scene
        </h3>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "flex items-center gap-2 px-3 py-1.5 text-xs border bg-transparent",
            formData.showScene
              ? "text-purple-400 border-purple-600"
              : "text-zinc-400 border-zinc-600"
          )}
          onClick={() => handleInputChange("showScene", !formData.showScene)}
        >
          {formData.showScene ? (
            <Eye className="w-3 h-3" />
          ) : (
            <EyeOff className="w-3 h-3" />
          )}
          {formData.showScene ? "Visible" : "Hidden"}
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Location - Can select all options */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <Label className="text-sm font-medium text-zinc-200">
              Location
            </Label>
            <span className="text-xs text-zinc-400">Select all that apply</span>
          </div>
          <Select
            value=""
            onValueChange={(value) => {
              if (value && !formData.location.includes(value)) {
                setFormData((prev) => ({
                  ...prev,
                  location: [...prev.location, value],
                }));
              }
            }}
          >
            <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-750 focus:ring-purple-500">
              <SelectValue placeholder="Add location preferences..." />
            </SelectTrigger>
            <SelectContent className="bg-zinc-800 border-zinc-700">
              {["Can host", "Can travel"]
                .filter((option) => !formData.location.includes(option))
                .map((option) => (
                  <SelectItem
                    key={option}
                    value={option}
                    className="text-white hover:bg-zinc-700 focus:bg-zinc-700"
                  >
                    {option}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>

          {/* Selected items */}
          {formData.location.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {formData.location.map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-2 bg-purple-600/10 border border-purple-600 text-purple-400 px-3 py-1.5 rounded-lg text-sm"
                >
                  <span>{item}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setFormData((prev) => ({
                        ...prev,
                        location: prev.location.filter((i) => i !== item),
                      }));
                    }}
                    className="hover:text-white transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Into Public - Can select as many as they want */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <Label className="text-sm font-medium text-zinc-200">
              Into Public
            </Label>
            <span className="text-xs text-zinc-400">Select all that apply</span>
          </div>
          <Select
            value=""
            onValueChange={(value) => {
              if (value && !formData.intoPublic.includes(value)) {
                setFormData((prev) => ({
                  ...prev,
                  intoPublic: [...prev.intoPublic, value],
                }));
              }
            }}
          >
            <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-750 focus:ring-purple-500">
              <SelectValue placeholder="Add public preferences..." />
            </SelectTrigger>
            <SelectContent className="bg-zinc-800 border-zinc-700">
              {[
                "Arcades",
                "Bars/Clubs",
                "Bathhouses",
                "Beaches",
                "Cars",
                "Parties/Events",
                "Gyms",
                "Outdoors",
                "Parks",
                "Restrooms",
                "Saunas",
                "Truckstops",
              ]
                .filter((option) => !formData.intoPublic.includes(option))
                .map((option) => (
                  <SelectItem
                    key={option}
                    value={option}
                    className="text-white hover:bg-zinc-700 focus:bg-zinc-700"
                  >
                    {option}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>

          {/* Selected items */}
          {formData.intoPublic.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {formData.intoPublic.map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-2 bg-purple-600/10 border border-purple-600 text-purple-400 px-3 py-1.5 rounded-lg text-sm"
                >
                  <span>{item}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setFormData((prev) => ({
                        ...prev,
                        intoPublic: prev.intoPublic.filter((i) => i !== item),
                      }));
                    }}
                    className="hover:text-white transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Looking For - Can only pick up to 3 */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <Label className="text-sm font-medium text-zinc-200">
              Looking For
            </Label>
            <span className="text-xs text-zinc-400">
              {formData.lookingFor.length}/3 selected
            </span>
          </div>
          <Select
            value=""
            onValueChange={(value) => {
              if (
                value &&
                !formData.lookingFor.includes(value) &&
                formData.lookingFor.length < 3
              ) {
                setFormData((prev) => ({
                  ...prev,
                  lookingFor: [...prev.lookingFor, value],
                }));
              }
            }}
          >
            <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-750 focus:ring-purple-500">
              <SelectValue placeholder="Add what you're looking for..." />
            </SelectTrigger>
            <SelectContent className="bg-zinc-800 border-zinc-700">
              {[
                "Bears",
                "Bikers",
                "Bros",
                "Clean Cut",
                "Corporate",
                "Curious",
                "Daddies",
                "Discreet",
                "Femme",
                "FTMs",
                "Gaymers",
                "Geeks",
                "Goths",
                "Guys Next Door",
                "Jocks",
                "Leather",
                "Masc",
                "MTFs",
                "Nudists",
                "Otters",
                "Poz",
                "Punks",
                "Pups",
                "Ruggeds",
                "Skaters",
                "Sons",
                "Sporty",
                "Surfers",
                "Swingers",
                "Trans",
                "Trendy",
                "Truckers",
                "Twinks",
                "U+",
              ]
                .filter((option) => !formData.lookingFor.includes(option))
                .map((option) => (
                  <SelectItem
                    key={option}
                    value={option}
                    className="text-white hover:bg-zinc-700 focus:bg-zinc-700"
                  >
                    {option}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>

          {/* Selected items */}
          {formData.lookingFor.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {formData.lookingFor.map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-2 bg-purple-600/10 border border-purple-600 text-purple-400 px-3 py-1.5 rounded-lg text-sm"
                >
                  <span>{item}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setFormData((prev) => ({
                        ...prev,
                        lookingFor: prev.lookingFor.filter((i) => i !== item),
                      }));
                    }}
                    className="hover:text-white transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Fetishes - Choose up to six between all 3 categories */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <Label className="text-sm font-medium text-zinc-200">
              Fetishes
            </Label>
            <span className="text-xs text-zinc-400">
              {formData.fetishes.length}/6 selected
            </span>
          </div>
          <Select
            value=""
            onValueChange={(value) => {
              if (
                value &&
                !formData.fetishes.includes(value) &&
                formData.fetishes.length < 6
              ) {
                setFormData((prev) => ({
                  ...prev,
                  fetishes: [...prev.fetishes, value],
                }));
              }
            }}
          >
            <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-750 focus:ring-purple-500">
              <SelectValue placeholder="Add fetishes..." />
            </SelectTrigger>
            <SelectContent className="bg-zinc-800 border-zinc-700">
              {[
                // Body Category
                "Armpits",
                "Ass",
                "Body Hair",
                "Bulges",
                "Hard Cocks",
                "Soft Cocks",
                "Chest",
                "Feet",
                "Hands",
                "Legs",
                "Muscles",
                "Nipples",
                "Shoulders",
                "Stomach",
                "Thighs",
                // Clothing Category
                "Boots",
                "Glasses",
                "Hats",
                "Jeans",
                "Jockstraps",
                "Leather",
                "Shirts",
                "Shoes",
                "Shorts",
                "Socks",
                "Suits",
                "Sweatpants",
                "Tank Tops",
                "Ties",
                "Underwear",
                "Vests",
                "Work Boots",
                "Work Clothes",
                // Underwear Category
                "Briefs",
                "Boxers",
                "Thongs",
                "Trunks",
              ]
                .filter((option) => !formData.fetishes.includes(option))
                .map((option) => (
                  <SelectItem
                    key={option}
                    value={option}
                    className="text-white hover:bg-zinc-700 focus:bg-zinc-700"
                  >
                    {option}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>

          {/* Selected items */}
          {formData.fetishes.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {formData.fetishes.map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-2 bg-purple-600/10 border border-purple-600 text-purple-400 px-3 py-1.5 rounded-lg text-sm"
                >
                  <span>{item}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setFormData((prev) => ({
                        ...prev,
                        fetishes: prev.fetishes.filter((i) => i !== item),
                      }));
                    }}
                    className="hover:text-white transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Kinks - Pick up to 6 between both categories */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <Label className="text-sm font-medium text-zinc-200">Kinks</Label>
            <span className="text-xs text-zinc-400">
              {formData.kinks.length}/6 selected
            </span>
          </div>
          <Select
            value=""
            onValueChange={(value) => {
              if (
                value &&
                !formData.kinks.includes(value) &&
                formData.kinks.length < 6
              ) {
                setFormData((prev) => ({
                  ...prev,
                  kinks: [...prev.kinks, value],
                }));
              }
            }}
          >
            <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-750 focus:ring-purple-500">
              <SelectValue placeholder="Add kinks..." />
            </SelectTrigger>
            <SelectContent className="bg-zinc-800 border-zinc-700">
              {[
                // Category 1
                "BDSM",
                "Bondage",
                "Domination",
                "Submission",
                "Role Play",
                "Spanking",
                "Choking",
                "Rough Sex",
                "Anal",
                "Oral",
                "Rimming",
                "Fisting",
                "Toys",
                "Cum Play",
                "Watersports",
                "Scat",
                "Blood Play",
                "Knife Play",
                // Category 2
                "Group Sex",
                "Gang Bang",
                "Orgy",
                "Swapping",
                "Cuckolding",
                "Hot Wife",
                "Voyeurism",
                "Exhibitionism",
                "Public Sex",
                "Outdoor Sex",
                "Car Sex",
                "Office Sex",
                "Uniforms",
                "Cosplay",
                "Age Play",
                "Daddy/Son",
                "Master/Slave",
              ]
                .filter((option) => !formData.kinks.includes(option))
                .map((option) => (
                  <SelectItem
                    key={option}
                    value={option}
                    className="text-white hover:bg-zinc-700 focus:bg-zinc-700"
                  >
                    {option}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>

          {/* Selected items */}
          {formData.kinks.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {formData.kinks.map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-2 bg-purple-600/10 border border-purple-600 text-purple-400 px-3 py-1.5 rounded-lg text-sm"
                >
                  <span>{item}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setFormData((prev) => ({
                        ...prev,
                        kinks: prev.kinks.filter((i) => i !== item),
                      }));
                    }}
                    className="hover:text-white transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Into - Choose up to 3 */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <Label className="text-sm font-medium text-zinc-200">Into</Label>
            <span className="text-xs text-zinc-400">
              {formData.into.length}/3 selected
            </span>
          </div>
          <Select
            value=""
            onValueChange={(value) => {
              if (
                value &&
                !formData.into.includes(value) &&
                formData.into.length < 3
              ) {
                setFormData((prev) => ({
                  ...prev,
                  into: [...prev.into, value],
                }));
              }
            }}
          >
            <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-750 focus:ring-purple-500">
              <SelectValue placeholder="Add what you're into..." />
            </SelectTrigger>
            <SelectContent className="bg-zinc-800 border-zinc-700">
              {[
                "Casual",
                "Friends",
                "Relationship",
                "Hookups",
                "All",
                "Dating",
                "Long Term",
                "Short Term",
                "Friends with Benefits",
                "Open Relationship",
                "Polyamory",
                "Monogamy",
                "Discrete",
                "Public",
                "Private",
              ]
                .filter((option) => !formData.into.includes(option))
                .map((option) => (
                  <SelectItem
                    key={option}
                    value={option}
                    className="text-white hover:bg-zinc-700 focus:bg-zinc-700"
                  >
                    {option}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>

          {/* Selected items */}
          {formData.into.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {formData.into.map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-2 bg-purple-600/10 border border-purple-600 text-purple-400 px-3 py-1.5 rounded-lg text-sm"
                >
                  <span>{item}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setFormData((prev) => ({
                        ...prev,
                        into: prev.into.filter((i) => i !== item),
                      }));
                    }}
                    className="hover:text-white transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Interaction - Choose up to 3 */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <Label className="text-sm font-medium text-zinc-200">
              Interaction
            </Label>
            <span className="text-xs text-zinc-400">
              {formData.interaction.length}/3 selected
            </span>
          </div>
          <Select
            value=""
            onValueChange={(value) => {
              if (
                value &&
                !formData.interaction.includes(value) &&
                formData.interaction.length < 3
              ) {
                setFormData((prev) => ({
                  ...prev,
                  interaction: [...prev.interaction, value],
                }));
              }
            }}
          >
            <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-750 focus:ring-purple-500">
              <SelectValue placeholder="Add interaction preferences..." />
            </SelectTrigger>
            <SelectContent className="bg-zinc-800 border-zinc-700">
              {[
                "Chat",
                "Meet",
                "Hook Up",
                "Date",
                "Friends",
                "Business",
                "Networking",
                "Social",
                "Professional",
                "Casual",
                "Serious",
                "Discrete",
                "Public",
                "Private",
                "Online",
                "Offline",
              ]
                .filter((option) => !formData.interaction.includes(option))
                .map((option) => (
                  <SelectItem
                    key={option}
                    value={option}
                    className="text-white hover:bg-zinc-700 focus:bg-zinc-700"
                  >
                    {option}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>

          {/* Selected items */}
          {formData.interaction.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {formData.interaction.map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-2 bg-purple-600/10 border border-purple-600 text-purple-400 px-3 py-1.5 rounded-lg text-sm"
                >
                  <span>{item}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setFormData((prev) => ({
                        ...prev,
                        interaction: prev.interaction.filter((i) => i !== item),
                      }));
                    }}
                    className="hover:text-white transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <Separator className="mt-8 bg-zinc-700/80 h-px" />
    </div>
  );

  // --- Section: Health ---
  const renderHealthSection = () => (
    <div className="mb-8">
      <div className="pb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
          Health
        </h3>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "flex items-center gap-2 px-3 py-1.5 text-xs border bg-transparent",
            formData.showHealth
              ? "text-purple-400 border-purple-600"
              : "text-zinc-400 border-zinc-600"
          )}
          onClick={() => handleInputChange("showHealth", !formData.showHealth)}
        >
          {formData.showHealth ? (
            <Eye className="w-3 h-3" />
          ) : (
            <EyeOff className="w-3 h-3" />
          )}
          {formData.showHealth ? "Visible" : "Hidden"}
        </Button>
      </div>
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium text-zinc-200">
              HIV Status
            </Label>
            <Select
              value={formData.hivStatus}
              onValueChange={(value) => handleInputChange("hivStatus", value)}
            >
              <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-750 focus:ring-purple-500">
                <SelectValue placeholder="Select HIV status" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-800 border-zinc-700">
                {[
                  "Negative",
                  "Positive",
                  "Undetectable",
                  "Unknown",
                  "Prefer not to say",
                ].map((status) => (
                  <SelectItem
                    key={status}
                    value={status}
                    className="text-white hover:bg-zinc-700 focus:bg-zinc-700"
                  >
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {formData.hivStatus && (
              <div className="flex flex-wrap gap-2 mt-2">
                <div className="flex items-center gap-2 bg-purple-600/10 border border-purple-600 text-purple-400 px-3 py-1.5 rounded-lg text-sm">
                  <span>{formData.hivStatus}</span>
                  <button
                    type="button"
                    onClick={() => handleInputChange("hivStatus", "")}
                    className="hover:text-white transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-zinc-200">
              Last Tested
            </Label>
            <Input
              type="date"
              value={formData.hivTestedDate}
              onChange={(e) =>
                handleInputChange("hivTestedDate", e.target.value)
              }
              className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-400 focus:ring-purple-500"
              placeholder="Select date"
            />
            {formData.hivTestedDate && (
              <div className="flex flex-wrap gap-2 mt-2">
                <div className="flex items-center gap-2 bg-purple-600/10 border border-purple-600 text-purple-400 px-3 py-1.5 rounded-lg text-sm">
                  <span>
                    {new Date(formData.hivTestedDate).toLocaleDateString()}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleInputChange("hivTestedDate", "")}
                    className="hover:text-white transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <Separator className="mt-8 bg-zinc-800/50" />
    </div>
  );

  // --- Section: Photos ---
  // Helper to robustly resolve photo URLs
  const getPhotoUrl = (photo: string) => {
    if (!photo) return undefined;

    // Skip base64 data URLs - they shouldn't be in the array anymore
    if (photo.startsWith("data:") || photo.startsWith("blob:")) {
      console.warn(
        "Found base64 data URL in profilePhotos array:",
        photo.substring(0, 50) + "..."
      );
      return "/default-avatar.png";
    }

    // Try to find a resolved URL from the photoUrls query
    const resolved = formData.photos?.find((p: any) => p.id === photo)?.url;
    if (resolved) return resolved;

    // If no resolved URL found, show a default placeholder
    return "/default-avatar.png";
  };

  const renderPhotosSection = () => (
    <div className="mb-8">
      <div className="pb-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
          Profile Photos
        </h3>
      </div>
      <div className="space-y-4">
        <div className="space-y-3">
          {/* Photo Grid */}
          <div className="grid grid-cols-5 gap-3">
            {Array.from({ length: 5 }, (_, index) => {
              const photo = formData.profilePhotos[index];
              const isMainPhoto = index === 0;
              const isDragging = draggedIndex === index;
              const isDragOver = dragOverIndex === index;

              const resolvedUrl = getPhotoUrl(photo);

              return (
                <div
                  key={index}
                  draggable={!!photo}
                  onDragStart={(e) => photo && handleDragStart(e, index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragEnd={handleDragEnd}
                  className={cn(
                    "relative aspect-square rounded-lg overflow-hidden border-2 transition-all duration-200 cursor-pointer",
                    isMainPhoto
                      ? "border-purple-500 bg-purple-500/10"
                      : "border-zinc-700 bg-zinc-800",
                    photo ? "hover:border-zinc-500" : "border-dashed",
                    isDragging && "opacity-50 scale-95",
                    isDragOver && "border-blue-400 bg-blue-400/20"
                  )}
                >
                  {photo ? (
                    <>
                      <img
                        src={resolvedUrl}
                        alt={`Profile photo ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      {/* Main Photo Badge */}
                      {isMainPhoto && (
                        <div className="absolute top-1 left-1 bg-purple-600 text-white text-xs px-1.5 py-0.5 rounded">
                          Main
                        </div>
                      )}
                      {/* Remove Button */}
                      <button
                        type="button"
                        onClick={() => {
                          const newPhotos = [...formData.profilePhotos];
                          newPhotos.splice(index, 1);
                          handleInputChange("profilePhotos", newPhotos);
                        }}
                        className="absolute top-1 right-1 w-5 h-5 bg-red-600 text-white rounded-full flex items-center justify-center hover:bg-red-700 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                      {/* Drag Handle */}
                      <div className="absolute bottom-1 left-1 w-5 h-5 bg-black/50 text-white rounded flex items-center justify-center">
                        <GripVertical className="w-3 h-3" />
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-zinc-400">
                      <Camera className="w-6 h-6 mb-1" />
                      <span className="text-xs">
                        {isMainPhoto ? "Main" : `${index + 1}`}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Upload Button */}
          <div className="flex items-center gap-2">
            <input
              type="file"
              accept="image/*"
              multiple
              ref={fileInputRef}
              onChange={handleFileSelect}
              style={{ display: "none" }}
            />
            <Button
              type="button"
              onClick={() => {
                if (fileInputRef.current) {
                  fileInputRef.current.click();
                }
              }}
              disabled={isUploading || formData.profilePhotos.length >= 5}
              className="flex items-center gap-2 bg-transparent px-3 py-1.5 text-xs text-zinc-300 border-zinc-600 hover:bg-zinc-800"
            >
              {isUploading ? (
                <>
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current" />
                  <span>Uploading...</span>
                </>
              ) : (
                <>
                  <Upload className="w-3 h-3" />
                  <span>Upload Photos</span>
                </>
              )}
            </Button>

            {formData.profilePhotos.length > 0 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="flex items-center gap-2 bg-transparent px-3 py-1.5 text-xs text-red-400 border-red-400 hover:bg-red-400/10"
                onClick={() => handleInputChange("profilePhotos", [])}
              >
                Clear All
              </Button>
            )}
          </div>
        </div>
        <p className="text-xs text-zinc-400">
          Upload up to 5 photos. The first photo will be your main profile
          photo. Drag to reorder.
        </p>
      </div>
      <Separator className="mt-8 bg-zinc-700/80 h-px" />
    </div>
  );

  // --- Section: Basic Info ---
  const renderBasicInfoSection = () => (
    <div className="mb-8">
      <div className="pb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
          Basic Information
        </h3>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "flex items-center gap-2 px-3 py-1.5 text-xs border bg-transparent",
            formData.showBasicInfo
              ? "text-purple-400 border-purple-600"
              : "text-zinc-400 border-zinc-600"
          )}
          onClick={() =>
            handleInputChange("showBasicInfo", !formData.showBasicInfo)
          }
        >
          {formData.showBasicInfo ? (
            <Eye className="w-3 h-3" />
          ) : (
            <EyeOff className="w-3 h-3" />
          )}
          {formData.showBasicInfo ? "Visible" : "Hidden"}
        </Button>
      </div>
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium text-zinc-200">
              Display Name
            </Label>
            <Input
              value={formData.displayName}
              onChange={(e) => handleInputChange("displayName", e.target.value)}
              className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-400 focus:ring-purple-500"
              placeholder="Enter your display name"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-zinc-200">
              Headliner
            </Label>
            <Input
              value={formData.headliner}
              onChange={(e) => handleInputChange("headliner", e.target.value)}
              className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-400 focus:ring-purple-500"
              placeholder="Enter your headliner"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-zinc-200">
              Hometown
            </Label>
            <Input
              value={formData.hometown}
              onChange={(e) => handleInputChange("hometown", e.target.value)}
              className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-400 focus:ring-purple-500"
              placeholder="Enter your hometown"
            />
          </div>
        </div>

        {/* Profile Photos */}
        <div className="space-y-4">
          <div className="space-y-3">
            {/* Photo Grid */}
            <div className="grid grid-cols-5 gap-3">
              {Array.from({ length: 5 }, (_, index) => {
                const photo = formData.profilePhotos[index];
                const isMainPhoto = index === 0;
                const isDragging = draggedIndex === index;
                const isDragOver = dragOverIndex === index;

                const resolvedUrl = getPhotoUrl(photo);

                return (
                  <div
                    key={index}
                    draggable={!!photo}
                    onDragStart={(e) => photo && handleDragStart(e, index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragEnd={handleDragEnd}
                    className={cn(
                      "relative aspect-square rounded-lg overflow-hidden border-2 transition-all duration-200 cursor-pointer",
                      isMainPhoto
                        ? "border-purple-500 bg-purple-500/10"
                        : "border-zinc-700 bg-zinc-800",
                      photo ? "hover:border-zinc-500" : "border-dashed",
                      isDragging && "opacity-50 scale-95",
                      isDragOver && "border-blue-400 bg-blue-400/20"
                    )}
                  >
                    {photo ? (
                      <>
                        <img
                          src={resolvedUrl}
                          alt={`Profile photo ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        {/* Main Photo Badge */}
                        {isMainPhoto && (
                          <div className="absolute top-1 left-1 bg-purple-600 text-white text-xs px-1.5 py-0.5 rounded">
                            Main
                          </div>
                        )}
                        {/* Remove Button */}
                        <button
                          type="button"
                          onClick={() => {
                            const newPhotos = [...formData.profilePhotos];
                            newPhotos.splice(index, 1);
                            handleInputChange("profilePhotos", newPhotos);
                          }}
                          className="absolute top-1 right-1 w-5 h-5 bg-red-600 text-white rounded-full flex items-center justify-center hover:bg-red-700 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                        {/* Drag Handle */}
                        <div className="absolute bottom-1 left-1 w-5 h-5 bg-black/50 text-white rounded flex items-center justify-center">
                          <GripVertical className="w-3 h-3" />
                        </div>
                      </>
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-zinc-400">
                        <Camera className="w-6 h-6 mb-1" />
                        <span className="text-xs">
                          {isMainPhoto ? "Main" : `${index + 1}`}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Upload Button */}
            <div className="flex items-center gap-2">
              <input
                type="file"
                accept="image/*"
                multiple
                ref={fileInputRef}
                onChange={handleFileSelect}
                style={{ display: "none" }}
              />
              <Button
                type="button"
                onClick={() => {
                  console.log("[ProfileEditor] Upload button clicked");
                  console.log(
                    "[ProfileEditor] fileInputRef.current:",
                    fileInputRef.current
                  );
                  if (fileInputRef.current) {
                    console.log("[ProfileEditor] Triggering file input click");
                    fileInputRef.current.click();
                  } else {
                    console.error(
                      "[ProfileEditor] fileInputRef.current is null"
                    );
                  }
                }}
                disabled={isUploading || formData.profilePhotos.length >= 5}
                className="flex items-center gap-2 bg-transparent px-3 py-1.5 text-xs text-zinc-300 border-zinc-600 hover:bg-zinc-800"
              >
                {isUploading ? (
                  <>
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current" />
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-3 h-3" />
                    <span>Upload Photos</span>
                  </>
                )}
              </Button>

              {formData.profilePhotos.length > 0 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2 bg-transparent px-3 py-1.5 text-xs text-red-400 border-red-400 hover:bg-red-400/10"
                  onClick={() => handleInputChange("profilePhotos", [])}
                >
                  Clear All
                </Button>
              )}
            </div>
          </div>
          <p className="text-xs text-zinc-400">
            Upload up to 5 photos. The first photo will be your main profile
            photo. Drag to reorder.
          </p>
        </div>
      </div>
      <Separator className="mt-8 bg-zinc-700/80 h-px" />
    </div>
  );

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // Filter out fields that shouldn't be sent to the server
      const {
        photos, // Remove this field as it's only for display
        ...profileDataToSave
      } = formData;

      // Clean profilePhotos array to remove any base64 data URLs (they should be storage IDs only)
      const cleanProfilePhotos =
        profileDataToSave.profilePhotos?.filter(
          (photo: string) =>
            !photo.startsWith("data:") && !photo.startsWith("blob:")
        ) || [];

      // Only include fields that are expected by the updateMyProfile mutation
      // Filter out undefined values to avoid validation issues
      const cleanProfileData = Object.fromEntries(
        Object.entries({
          displayName: profileDataToSave.displayName,
          headliner: profileDataToSave.headliner,
          hometown: profileDataToSave.hometown,
          profilePhotos: cleanProfilePhotos,
          age: profileDataToSave.age,
          heightInInches: profileDataToSave.heightInInches,
          weightInLbs: profileDataToSave.weightInLbs,
          endowmentLength: profileDataToSave.endowmentLength,
          endowmentCut: profileDataToSave.endowmentCut,
          bodyType: profileDataToSave.bodyType,
          gender: profileDataToSave.gender,
          expression: profileDataToSave.expression,
          position: profileDataToSave.position,
          lookingFor: profileDataToSave.lookingFor,
          location: profileDataToSave.location,
          intoPublic: profileDataToSave.intoPublic,
          fetishes: profileDataToSave.fetishes,
          kinks: profileDataToSave.kinks,
          into: profileDataToSave.into,
          interaction: profileDataToSave.interaction,
          hivStatus: profileDataToSave.hivStatus,
          hivTestedDate: profileDataToSave.hivTestedDate,
          showBasicInfo: profileDataToSave.showBasicInfo,
          showStats: profileDataToSave.showStats,
          showIdentity: profileDataToSave.showIdentity,
          showHealth: profileDataToSave.showHealth,
          showScene: profileDataToSave.showScene,
        }).filter(([_, value]) => value !== undefined && value !== null)
      );

      console.log("[ProfileEditor] Saving profile data:", cleanProfileData);
      console.log(
        "[ProfileEditor] Clean data keys:",
        Object.keys(cleanProfileData)
      );
      console.log(
        "[ProfileEditor] Clean data has userId:",
        "userId" in cleanProfileData
      );
      await updateProfile(cleanProfileData);
      setSaveSuccess(true);
      setHasUnsavedChanges(false);
      setTimeout(() => setSaveSuccess(false), 3000); // Hide success message after 3 seconds
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full p-4 md:p-8">
      {/* Loading State */}
      {profile === undefined && (
        <div className="flex items-center justify-center h-full w-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-2 text-zinc-400">Loading profile data...</p>
          </div>
        </div>
      )}

      {/* Form Initializing State */}
      {profile !== undefined && !isInitialized && (
        <div className="flex items-center justify-center h-full w-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-2 text-zinc-400">Initializing form...</p>
          </div>
        </div>
      )}

      {/* Debug Info - Remove this after testing */}
      {profile && (
        <div className="fixed top-4 right-4 bg-black/80 text-white p-2 rounded text-xs z-50 max-w-xs">
          <div className="font-bold mb-1">Debug Info:</div>
          <div>Profile loaded: {profile.displayName || "No name"}</div>
          <div>Age: {profile.age || "Not set"}</div>
          <div>Form initialized: {isInitialized ? "Yes" : "No"}</div>
          <div>Form age: {formData.age || "Not set"}</div>
          <div>Form displayName: {formData.displayName || "Not set"}</div>
          <div>
            Profile === formData.age:{" "}
            {profile.age === formData.age ? "Yes" : "No"}
          </div>
        </div>
      )}

      {profile === null && (
        <div className="fixed top-4 right-4 bg-orange-800 text-white p-2 rounded text-xs z-50">
          <div className="font-bold mb-1">Debug Info:</div>
          <div>Profile: null (no profile exists)</div>
          <div>Form initialized: {isInitialized ? "Yes" : "No"}</div>
        </div>
      )}

      {profile === undefined && (
        <div className="fixed top-4 right-4 bg-blue-800 text-white p-2 rounded text-xs z-50">
          <div className="font-bold mb-1">Debug Info:</div>
          <div>Profile: undefined (still loading)</div>
        </div>
      )}

      {/* Form Section (2/3 on desktop) */}
      {profile !== undefined && isInitialized && (
        <div className="flex-1 lg:w-2/3">
          <form
            onSubmit={handleFormSubmit}
            className="space-y-6"
            key={`form-${isInitialized}-${formData.displayName}`}
          >
            {renderBasicInfoSection()}
            {renderStatsSection()}
            {renderIdentitySection()}
            {renderHealthSection()}
            <Separator className="my-8 bg-zinc-700/80 h-px" />
            {renderSceneSection()}
          </form>
        </div>
      )}

      {/* Live Profile Preview (1/3, desktop only) */}
      {profile !== undefined && isInitialized && convexUser?._id && (
        <div className="hidden lg:block lg:w-1/3">
          <div className="h-[80vh] overflow-y-auto sticky top-8">
            <ProfileModal
              open={true}
              onOpenChange={() => {}}
              userId={convexUser._id}
              onBack={() => {}}
              onStartChat={() => {}}
              currentUserProfileForMap={null}
              columnMode={true}
              profile={{
                ...formData,
                photos: formData.profilePhotos.map(getImageUrlForDisplay),
              }}
            />
          </div>
        </div>
      )}

      {/* Floating Sticky Save Button */}
      {profile !== undefined && isInitialized && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-4xl px-4">
          <div className="bg-zinc-900/95 backdrop-blur-sm border border-zinc-700 rounded-lg p-4 shadow-xl">
            <Button
              type="submit"
              disabled={isSubmitting}
              onClick={handleFormSubmit}
              className={cn(
                "w-full py-3 rounded-lg shadow-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2",
                saveSuccess
                  ? "bg-green-600 hover:bg-green-700 text-white"
                  : hasUnsavedChanges
                    ? "bg-orange-600 hover:bg-orange-700 text-white"
                    : "bg-purple-600 hover:bg-purple-700 text-white"
              )}
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Saving...
                </>
              ) : saveSuccess ? (
                <>
                  <Check className="w-4 h-4" />
                  Profile Saved!
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  {hasUnsavedChanges ? "Save Changes" : "Save Profile"}
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Mobile Preview Button */}
      {profile !== undefined && isInitialized && (
        <div className="lg:hidden fixed bottom-20 right-6 z-50">
          <Button
            onClick={() => setIsPreviewOpen(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-full shadow-lg"
            size="icon"
          >
            <Eye className="w-5 h-5" />
          </Button>
        </div>
      )}

      {/* Mobile Preview Modal */}
      {isPreviewOpen && (
        <ProfileModal
          open={isPreviewOpen}
          onOpenChange={setIsPreviewOpen}
          userId={convexUser?._id}
          onBack={() => setIsPreviewOpen(false)}
          onStartChat={() => {}}
          currentUserProfileForMap={null}
          profile={formData}
        />
      )}
    </div>
  );
}
