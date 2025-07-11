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
import { useState, useEffect, useRef } from "react";
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
    hostingStatus?: string;
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

  // Add mutation for generating upload URLs
  const generateUploadUrl = useMutation(
    api.profiles.generateProfilePhotoUploadUrl
  );

  // Helper function to get image URL for display
  const getImageUrlForDisplay = (storageId: string) => {
    // If it's already a URL (for backward compatibility), return it
    if (storageId.startsWith("http") || storageId.startsWith("blob:")) {
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

  useEffect(() => {
    if (profile) {
      setFormData({
        displayName: profile.displayName || "",
        headliner: profile.headliner || "",
        hometown: profile.hometown || "",
        profilePhotos: profile.profilePhotos || [],
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
      });
    }
  }, [profile]);

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
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
    // If it's a data URL or blob, use as is
    if (photo.startsWith("data:") || photo.startsWith("blob:")) return photo;
    // Try to find a resolved URL from profile.photos
    const resolved = profile.photos?.find((p: any) => p.id === photo)?.url;
    if (resolved) return resolved;
    // Show a default placeholder if not available
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
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="flex items-center gap-2 bg-transparent px-3 py-1.5 text-xs text-zinc-300 border-zinc-600 hover:bg-zinc-800"
              onClick={() => {
                const input = document.createElement("input");
                input.type = "file";
                input.accept = "image/*";
                input.multiple = true;
                input.onchange = (e) => {
                  const files = (e.target as HTMLInputElement).files;
                  if (files) {
                    const newPhotos = [...formData.profilePhotos];
                    const maxPhotos = 5;

                    Array.from(files).forEach((file) => {
                      if (newPhotos.length < maxPhotos) {
                        const reader = new FileReader();
                        reader.onload = (e) => {
                          const photoUrl = e.target?.result as string;
                          newPhotos.push(photoUrl);
                          if (newPhotos.length <= maxPhotos) {
                            handleInputChange("profilePhotos", [...newPhotos]);
                          }
                        };
                        reader.readAsDataURL(file);
                      }
                    });
                  }
                };
                input.click();
              }}
              disabled={formData.profilePhotos.length >= 5}
            >
              <Upload className="w-3 h-3" />
              Add Photos ({formData.profilePhotos.length}/5)
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
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="flex items-center gap-2 bg-transparent px-3 py-1.5 text-xs text-zinc-300 border-zinc-600 hover:bg-zinc-800"
                onClick={async () => {
                  const input = document.createElement("input");
                  input.type = "file";
                  input.accept = "image/*";
                  input.multiple = true;
                  input.onchange = async (e) => {
                    const files = (e.target as HTMLInputElement).files;
                    if (files && !isUploading) {
                      setIsUploading(true);
                      try {
                        const newPhotos = [...formData.profilePhotos];
                        const maxPhotos = 5;

                        for (const file of Array.from(files)) {
                          if (newPhotos.length >= maxPhotos) break;

                          try {
                            // Compress the image
                            const compressedImage = await compressImage(file);

                            // Upload to Convex storage
                            const storageId = await uploadImageToConvex(
                              compressedImage.file,
                              () => generateUploadUrl()
                            );

                            // Add the storage ID to the photos array
                            newPhotos.push(storageId);

                            // Clean up the temporary URL
                            cleanupImageUrl(compressedImage.url);
                          } catch (error) {
                            console.error("Error processing image:", error);
                            // Continue with other images even if one fails
                          }
                        }

                        handleInputChange("profilePhotos", newPhotos);
                      } catch (error) {
                        console.error("Error uploading photos:", error);
                      } finally {
                        setIsUploading(false);
                      }
                    }
                  };
                  input.click();
                }}
                disabled={formData.profilePhotos.length >= 5 || isUploading}
              >
                <Upload className="w-3 h-3" />
                {isUploading
                  ? "Uploading..."
                  : `Add Photos (${formData.profilePhotos.length}/5)`}
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
      await updateProfile(formData);
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full p-4 md:p-8">
      {/* Form Section (2/3 on desktop) */}
      <div className="flex-1 lg:w-2/3">
        <form onSubmit={handleFormSubmit} className="space-y-6">
          {renderBasicInfoSection()}
          {renderStatsSection()}
          {renderIdentitySection()}
          {renderHealthSection()}
          <Separator className="my-8 bg-zinc-700/80 h-px" />
          {renderSceneSection()}
        </form>
      </div>

      {/* Live Profile Preview (1/3, desktop only) */}
      <div className="hidden lg:block lg:w-1/3">
        <div className="h-[80vh] overflow-y-auto  sticky top-8">
          {convexUser?._id && (
            <ProfilePage
              userId={convexUser._id}
              isOwnProfile={true}
              profile={formData}
            />
          )}
        </div>
      </div>

      {/* Floating Sticky Save Button */}
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-4xl px-4">
        <div className="bg-zinc-900/95 backdrop-blur-sm border border-zinc-700 rounded-lg p-4 shadow-xl">
          <Button
            type="submit"
            disabled={isSubmitting}
            onClick={handleFormSubmit}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg shadow-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Profile
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Mobile Preview Button */}
      <div className="lg:hidden fixed bottom-20 right-6 z-50">
        <Button
          onClick={() => setIsPreviewOpen(true)}
          className="bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-full shadow-lg"
          size="icon"
        >
          <Eye className="w-5 h-5" />
        </Button>
      </div>

      {/* Mobile Preview Modal */}
      {isPreviewOpen && (
        <ProfileModal
          isOpen={isPreviewOpen}
          onClose={() => setIsPreviewOpen(false)}
          userId={convexUser?._id}
          isOwnProfile={true}
          profile={formData}
        />
      )}
    </div>
  );
}
