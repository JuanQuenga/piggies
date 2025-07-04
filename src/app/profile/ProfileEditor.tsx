"use client";

import { Id } from "../../../convex/_generated/dataModel";
import { ProfilePage } from "./ProfilePage";
import { useUnitPreference } from "@/components/common/UnitPreferenceContext";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { ProfileModal } from "./ProfileModal";
import { Eye } from "lucide-react";
import { useState, useEffect } from "react";

// Unit conversion utilities
const inchesToCm = (inches: number) => Math.round(inches * 2.54);
const cmToInches = (cm: number) => Math.round(cm / 2.54);
const lbsToKg = (lbs: number) => Math.round(lbs * 0.45359237);
const kgToLbs = (kg: number) => Math.round(kg / 0.45359237);

// Profile field options
const PROFILE_OPTIONS = {
  age: Array.from({ length: 82 }, (_, i) => i + 18).concat([99]),
  heightInInches: Array.from({ length: 37 }, (_, i) => i + 48),
  weightInLbs: Array.from({ length: 63 }, (_, i) => 90 + i * 5).concat([400]),
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
  updateProfile: (data: any) => Promise<void>;
  convexUser: any;
}

export function ProfileEditor({
  profile,
  updateProfile,
  convexUser,
}: ProfileEditorProps) {
  const { isUSUnits } = useUnitPreference();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const [formData, setFormData] = useState({
    displayName: "",
    description: "",
    homeLocation: "",
    age: undefined as number | undefined,
    isAgeVisible: true,
    heightInInches: undefined as number | undefined,
    isHeightVisible: true,
    weightInLbs: undefined as number | undefined,
    isWeightVisible: true,
    endowmentLength: undefined as number | undefined,
    endowmentCut: "",
    isEndowmentVisible: true,
    bodyType: "",
    isBodyTypeVisible: true,
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        displayName: profile.displayName || "",
        description: profile.description || "",
        homeLocation: profile.homeLocation || "",
        age: profile.age,
        isAgeVisible: profile.isAgeVisible ?? true,
        heightInInches: profile.heightInInches,
        isHeightVisible: profile.isHeightVisible ?? true,
        weightInLbs: profile.weightInLbs,
        isWeightVisible: profile.isWeightVisible ?? true,
        endowmentLength: profile.endowmentLength,
        endowmentCut: profile.endowmentCut || "",
        isEndowmentVisible: profile.isEndowmentVisible ?? true,
        bodyType: profile.bodyType || "",
        isBodyTypeVisible: profile.isBodyTypeVisible ?? true,
      });
    }
  }, [profile]);

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const renderStatField = (
    label: string,
    field: string,
    visibilityField: string,
    children: React.ReactNode
  ) => (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <Label className="text-sm font-medium text-zinc-200">{label}</Label>
        <div className="flex items-center gap-2">
          <Label htmlFor={visibilityField} className="text-xs text-zinc-400">
            {formData[visibilityField as keyof typeof formData]
              ? "Visible"
              : "Hidden"}
          </Label>
          <Switch
            checked={
              formData[visibilityField as keyof typeof formData] as boolean
            }
            onCheckedChange={(checked) =>
              handleInputChange(visibilityField, checked)
            }
            className="data-[state=checked]:bg-purple-600"
          />
        </div>
      </div>
      {children}
    </div>
  );

  const renderStatsSection = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-purple-400">Stats</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {renderStatField(
          "Age",
          "age",
          "isAgeVisible",
          <select
            value={formData.age || ""}
            onChange={(e) => handleInputChange("age", Number(e.target.value))}
            className="w-full p-2 border border-gray-300 rounded-md bg-background text-foreground"
          >
            <option value="">Select Age</option>
            {PROFILE_OPTIONS.age.map((age) => (
              <option key={age} value={age}>
                {age === 99 ? "99+" : age}
              </option>
            ))}
          </select>
        )}

        {renderStatField(
          "Height",
          "heightInInches",
          "isHeightVisible",
          <select
            value={formData.heightInInches || ""}
            onChange={(e) =>
              handleInputChange("heightInInches", Number(e.target.value))
            }
            className="w-full p-2 border border-gray-300 rounded-md bg-background text-foreground"
          >
            <option value="">Select Height</option>
            {PROFILE_OPTIONS.heightInInches.map((inches) => (
              <option key={inches} value={inches}>
                {PROFILE_OPTIONS.formatHeight(inches, isUSUnits)}
              </option>
            ))}
          </select>
        )}

        {renderStatField(
          "Weight",
          "weightInLbs",
          "isWeightVisible",
          <select
            value={formData.weightInLbs || ""}
            onChange={(e) =>
              handleInputChange("weightInLbs", Number(e.target.value))
            }
            className="w-full p-2 border border-gray-300 rounded-md bg-background text-foreground"
          >
            <option value="">Select Weight</option>
            {PROFILE_OPTIONS.weightInLbs.map((lbs) => (
              <option key={lbs} value={lbs}>
                {PROFILE_OPTIONS.formatWeight(lbs, isUSUnits)}
              </option>
            ))}
          </select>
        )}

        {renderStatField(
          "Endowment",
          "endowmentLength",
          "isEndowmentVisible",
          <div className="grid grid-cols-2 gap-2">
            <select
              value={formData.endowmentCut || ""}
              onChange={(e) =>
                handleInputChange("endowmentCut", e.target.value)
              }
              className="w-full p-2 border border-gray-300 rounded-md bg-background text-foreground"
            >
              <option value="">Cut/Uncut</option>
              {PROFILE_OPTIONS.endowmentCut.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <select
              value={formData.endowmentLength || ""}
              onChange={(e) =>
                handleInputChange("endowmentLength", Number(e.target.value))
              }
              className="w-full p-2 border border-gray-300 rounded-md bg-background text-foreground"
            >
              <option value="">Length</option>
              {PROFILE_OPTIONS.endowmentLength.map((inches) => (
                <option key={inches} value={inches}>
                  {PROFILE_OPTIONS.formatEndowmentLength(inches, isUSUnits)}
                </option>
              ))}
            </select>
          </div>
        )}

        {renderStatField(
          "Body Type",
          "bodyType",
          "isBodyTypeVisible",
          <select
            value={formData.bodyType || ""}
            onChange={(e) => handleInputChange("bodyType", e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md bg-background text-foreground"
          >
            <option value="">Select Body Type</option>
            {PROFILE_OPTIONS.bodyType.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        )}
      </div>
    </div>
  );

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await updateProfile({
        id: profile._id,
        ...formData,
      });
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!profile) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen w-full bg-zinc-950 py-8 px-2 md:px-8">
      <div className="max-w-screen-xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="lg:hidden mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsPreviewOpen(true)}
              className="flex items-center gap-2 border-purple-500 text-purple-400 hover:bg-purple-500 hover:text-white px-4 py-2 rounded-lg"
            >
              <Eye size={16} />
              Preview Profile
            </Button>
          </div>
          <form onSubmit={handleFormSubmit} className="space-y-8">
            <div className="space-y-4">{/* Basic Information */}</div>
            <Separator className="bg-zinc-800" />
            {renderStatsSection()}
            <Separator className="bg-zinc-800" />
            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-2 rounded-lg shadow-lg font-semibold"
              >
                {isSubmitting ? "Saving..." : "Save Profile"}
              </Button>
            </div>
          </form>
        </div>
        <div className="hidden lg:block h-[80vh] overflow-y-auto rounded-xl shadow-lg bg-zinc-900 border border-zinc-800 sticky top-8">
          {convexUser?._id && (
            <ProfilePage
              userId={convexUser._id}
              onBack={() => {}}
              onStartChat={() => {}}
            />
          )}
        </div>
      </div>
      <div className="lg:hidden">
        {convexUser?._id && (
          <ProfileModal
            open={isPreviewOpen}
            onOpenChange={setIsPreviewOpen}
            userId={convexUser._id}
            onBack={() => setIsPreviewOpen(false)}
            onStartChat={() => {}}
          />
        )}
      </div>
    </div>
  );
}
