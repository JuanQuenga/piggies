"use client";

import React, { useState, useEffect, useRef } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Separator } from "../../components/ui/separator";
import { ChevronLeft, ChevronRight, Trash2, Eye, X } from "lucide-react";
import { ProfileModal } from "./ProfileModal";
import { useSession } from "@clerk/nextjs";
import { Id } from "../../../convex/_generated/dataModel";

// Profile field options
const PROFILE_OPTIONS = {
  // Stats
  age: Array.from({ length: 83 }, (_, i) => i + 18), // 18-100
  heightInCm: Array.from({ length: 83 }, (_, i) => i + 120), // 120-202 cm
  weightInKg: Array.from({ length: 181 }, (_, i) => i + 40), // 40-220 kg
  endowment: ["Small", "Average", "Large", "Huge"],
  bodyType: [
    "Slim",
    "Athletic",
    "Average",
    "Curvy",
    "Plus Size",
    "Bear",
    "Daddy",
    "Twink",
    "Jock",
    "Geek",
    "Goth",
    "Punk",
    "Hipster",
    "Business",
    "Military",
    "Blue Collar",
    "Artist",
    "Musician",
    "Student",
    "Teacher",
    "Doctor",
    "Lawyer",
    "Engineer",
    "Chef",
    "Bartender",
    "Barista",
    "Retail",
    "Service",
    "Unemployed",
    "Retired",
    "Other",
  ],

  // Identity
  gender: [
    "Male",
    "Female",
    "Trans Male",
    "Trans Female",
    "Non-Binary",
    "Gender Fluid",
    "Gender Queer",
    "Agender",
    "Bigender",
    "Two-Spirit",
    "Other",
  ],
  expression: [
    "Masculine",
    "Feminine",
    "Androgynous",
    "Gender Non-Conforming",
    "Other",
  ],
  sexuality: [
    "Gay",
    "Lesbian",
    "Bisexual",
    "Pansexual",
    "Asexual",
    "Demisexual",
    "Graysexual",
    "Queer",
    "Questioning",
    "Other",
  ],
  position: ["Top", "Bottom", "Versatile", "Side", "Other"],

  // Scene
  location: [
    "Home",
    "Hotel",
    "Motel",
    "Car",
    "Park",
    "Beach",
    "Forest",
    "Gym",
    "Sauna",
    "Bathhouse",
    "Club",
    "Bar",
    "Restaurant",
    "Office",
    "School",
    "College",
    "University",
    "Library",
    "Mall",
    "Movie Theater",
    "Concert",
    "Festival",
    "Party",
    "Wedding",
    "Funeral",
    "Church",
    "Temple",
    "Mosque",
    "Synagogue",
    "Other",
  ],
  intoPublic: ["Yes", "No", "Maybe", "Depends"],

  // Health
  hivStatus: [
    "Negative",
    "Positive",
    "Undetectable",
    "Unknown",
    "Prefer not to say",
  ],
  prepStatus: [
    "On PrEP",
    "Not on PrEP",
    "Considering PrEP",
    "Unknown",
    "Prefer not to say",
  ],
  lastTested: [
    "Never",
    "Less than 3 months ago",
    "3-6 months ago",
    "6-12 months ago",
    "More than 1 year ago",
    "Unknown",
  ],

  // Practices
  practices: [
    "Bareback Only",
    "Bareback if PrEP",
    "Condoms Only",
    "Safer Only",
    "Bareback or Condoms",
    "Talk First",
  ],

  // Into (Choose up to 3)
  into: [
    "Ball Play",
    "Cuddling",
    "Fingering",
    "Fisting",
    "Frotting",
    "Fucking",
    "Jerk Off",
    "Rimming",
    "Massage",
    "Make out",
    "Oral",
    "Oral (Give Only)",
    "Oral (Receive Only)",
    "Oral (Swallow)",
  ],

  // Fetishes (Choose up to 6)
  fetishes: {
    body: [
      "Armpits",
      "Ass",
      "Body Hair",
      "Bulges",
      "Hard Cocks",
      "Soft Cocks",
      "Hung Cocks",
      "Cum",
      "Facial Hair",
      "Feet",
      "Hands",
      "Happy Trails",
      "Long Hair",
      "Muscles",
      "Musk",
      "Nipples",
      "Pecs",
      "Piercings",
      "Bush (pubes)",
      "Shaved (pubes)",
      "Trimmed (pubes)",
      "Scars",
      "Spit",
      "Tattoos",
    ],
    clothing: [
      "Baseball Caps",
      "Boots",
      "Denim",
      "Leather",
      "Lingerie",
      "Masks",
      "Onesies",
      "Rubber",
      "Sagging",
      "Singlets",
      "Sneakers",
      "Socks",
      "Spandex/Lycra",
      "Speedos",
      "Sports Uniforms",
    ],
    underwear: [
      "Boxers",
      "Briefs",
      "Boxer Briefs",
      "Jockstraps",
      "Thongs",
      "G-strings",
      "Commando",
      "Other",
    ],
  },
};

// Kinks (Choose up to 6)
const KINKS = {
  general: [
    "BDSM",
    "Bondage/Rope",
    "Chastity",
    "CMNM",
    "Cum Play",
    "Edging",
    "Enemas",
    "Exhibitionism",
    "Facials",
    "FFM",
    "Fisting",
    "Freeballing",
    "Fleshlights",
    "Gags/Tape",
    "Gas Masks",
    "Gloryholes",
    "Group Sex",
    "Humiliation",
    "Mirror Play",
    "MMF",
    "Pig Play",
    "Porn",
    "Sex Toys",
    "Sex Dolls",
    "Shaving",
    "Sounding",
    "Spanking",
    "Voyeurism",
    "Watersports",
    "Wedgies",
    "Whipping/Flogging",
  ],
  rolePlay: [
    "Age Play",
    "Classroom",
    "Costume Play",
    "Cucking",
    "Delivery Guy",
    "Doctor/Patient",
    "First Time",
    "Furries",
    "Handy Man",
    "Public Locker Room",
    "School Boy",
    "Teacher/Student",
    "Uniform",
    "Other",
  ],
};

export default function ProfileEditor() {
  const updateProfile = useMutation(api.profiles.updateMyProfile);
  const generateAvatarUploadUrl = useMutation(
    api.profiles.generateAvatarUploadUrl
  );
  const profile = useQuery(api.profiles.getMyProfileWithAvatarUrl);

  const [formData, setFormData] = useState({
    displayName: "",
    description: "",
    homeLocation: "",
    age: undefined as number | undefined,
    heightInCm: undefined as number | undefined,
    weightInKg: undefined as number | undefined,
    endowment: "",
    bodyType: "",
    gender: "",
    expression: "",
    sexuality: "",
    position: "",
    location: "",
    intoPublic: "",
    hivStatus: "",
    practices: [] as string[],
    into: [] as string[],
    fetishes: [] as string[],
    kinks: [] as string[],
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>("");
  const [photos, setPhotos] = useState<{ id: string; url: string }[]>(
    profile?.photos || []
  );
  const [mainPhotoIndex, setMainPhotoIndex] = useState<number>(0);
  const [photoFiles, setPhotoFiles] = useState<(File | null)[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { session } = useSession();
  const userId = session?.user?.id as Id<"users"> | undefined;

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    if (profile) {
      setFormData({
        displayName: profile.displayName || "",
        description: profile.description || "",
        homeLocation: profile.homeLocation || "",
        age: profile.age,
        heightInCm: profile.heightInCm,
        weightInKg: profile.weightInKg,
        endowment: profile.endowment || "",
        bodyType: profile.bodyType || "",
        gender: profile.gender || "",
        expression: profile.expression || "",
        sexuality: profile.sexuality || "",
        position: profile.position || "",
        location: profile.location || "",
        intoPublic: profile.intoPublic || "",
        hivStatus: profile.hivStatus || "",
        practices: profile.practices || [],
        into: profile.into || [],
        fetishes: profile.fetishes || [],
        kinks: profile.kinks || [],
      });
      if (profile.avatarUrl) {
        setAvatarPreview(profile.avatarUrl);
      }
      // Ensure photos is always an array of {id, url}
      if (
        profile.photos &&
        Array.isArray(profile.photos) &&
        profile.photos.length > 0
      ) {
        const firstPhoto = profile.photos[0];
        if (typeof firstPhoto === "string") {
          // Convert string array to {id, url} array
          const photoArray = profile.photos as unknown as string[];
          setPhotos(photoArray.map((p: string) => ({ id: p, url: p })));
        } else if (
          typeof firstPhoto === "object" &&
          firstPhoto !== null &&
          "id" in firstPhoto
        ) {
          // Already in correct format
          setPhotos(profile.photos as { id: string; url: string }[]);
        } else {
          setPhotos([]);
        }
      } else {
        setPhotos([]);
      }
      setMainPhotoIndex(0);
      setPhotoPreviews([]);
      setPhotoFiles([]);
    }
  }, [profile]);

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleMultiSelect = (
    field: string,
    value: string,
    maxSelections: number = 6
  ) => {
    setFormData((prev) => {
      const current = prev[field as keyof typeof prev] as string[];
      if (current.includes(value)) {
        return { ...prev, [field]: current.filter((item) => item !== value) };
      } else if (current.length < maxSelections) {
        return { ...prev, [field]: [...current, value] };
      }
      return prev;
    });
  };

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePhotoUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    // Calculate available slots
    const availableSlots = 5 - (photos.length + photoFiles.length);
    if (availableSlots <= 0) {
      alert("You can only upload up to 5 photos.");
      return;
    }

    // Only add up to available slots
    const filesToAdd = files.slice(0, availableSlots);

    for (const file of filesToAdd) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        alert("Please select an image file.");
        continue;
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("Image file size must be less than 5MB.");
        continue;
      }
      // Preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhotoPreviews((prev) => [...prev, e.target?.result as string]);
        setPhotoFiles((prev) => [...prev, file]);
      };
      reader.readAsDataURL(file);
    }
    // Clear the input
    event.target.value = "";
  };

  const handleRemovePhoto = (idx: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== idx));
    setPhotoPreviews((prev) => prev.filter((_, i) => i !== idx));
    setPhotoFiles((prev) => prev.filter((_, i) => i !== idx));
    if (mainPhotoIndex === idx) {
      setMainPhotoIndex(0);
    } else if (mainPhotoIndex > idx) {
      setMainPhotoIndex(mainPhotoIndex - 1);
    }
  };

  const handleMovePhoto = (idx: number, direction: -1 | 1) => {
    const arr = [...photos];
    const previews = [...photoPreviews];
    const files = [...photoFiles];
    if (idx + direction < 0 || idx + direction >= arr.length) return;
    [arr[idx], arr[idx + direction]] = [arr[idx + direction], arr[idx]];
    [previews[idx], previews[idx + direction]] = [
      previews[idx + direction],
      previews[idx],
    ];
    [files[idx], files[idx + direction]] = [files[idx + direction], files[idx]];
    setPhotos(arr);
    setPhotoPreviews(previews);
    setPhotoFiles(files);
    if (mainPhotoIndex === idx) {
      setMainPhotoIndex(idx + direction);
    } else if (mainPhotoIndex === idx + direction) {
      setMainPhotoIndex(idx);
    }
  };

  const handleSetMainPhoto = (idx: number) => {
    if (idx === 0) {
      setMainPhotoIndex(0);
    } else {
      const arr = [...photos];
      const previews = [...photoPreviews];
      const files = [...photoFiles];
      const selectedPhoto = arr[idx];
      const selectedPreview = previews[idx];
      const selectedFile = files[idx];
      arr.splice(idx, 1);
      previews.splice(idx, 1);
      files.splice(idx, 1);
      arr.unshift(selectedPhoto);
      previews.unshift(selectedPreview);
      files.unshift(selectedFile);
      setPhotos(arr);
      setPhotoPreviews(previews);
      setPhotoFiles(files);
      setMainPhotoIndex(0);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      let avatarUrl = profile?.avatarUrl;
      let uploadedPhotoIds: string[] = [];
      // Add existing photo storage IDs
      for (const photo of photos) {
        if (photo.id && !photo.id.startsWith("http")) {
          uploadedPhotoIds.push(photo.id);
        }
      }
      // Upload new photo files
      for (let i = 0; i < photoFiles.length; i++) {
        const file = photoFiles[i];
        if (file) {
          try {
            const uploadUrl = await generateAvatarUploadUrl();
            const uploadResponse = await fetch(uploadUrl, {
              method: "POST",
              headers: { "Content-Type": file.type },
              body: file,
            });
            if (!uploadResponse.ok) {
              throw new Error(`Photo upload failed: ${uploadResponse.status}`);
            }
            const { storageId } = await uploadResponse.json();
            uploadedPhotoIds.push(storageId);
          } catch (uploadError) {
            console.error("Error uploading photo:", uploadError);
            alert(`Failed to upload photo ${i + 1}. Please try again.`);
            setIsSubmitting(false);
            return;
          }
        }
      }
      uploadedPhotoIds = uploadedPhotoIds.slice(0, 5);
      if (uploadedPhotoIds.length > 0) {
        avatarUrl = uploadedPhotoIds[0];
      }
      await updateProfile({
        ...formData,
        avatarUrl,
        photos: uploadedPhotoIds,
        mainPhotoIndex: 0,
      });
      setIsSubmitting(false);
      setPhotoFiles([]);
      setPhotoPreviews([]);
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile. Please try again.");
      setIsSubmitting(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    void handleSubmit(e);
  };

  const renderMultiSelect = (
    field: string,
    options: string[],
    maxSelections: number,
    title: string
  ) => (
    <div className="space-y-2">
      <Label className="text-sm font-medium">{title}</Label>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const isSelected = (
            formData[field as keyof typeof formData] as string[]
          ).includes(option);
          return (
            <Badge
              key={option}
              variant={isSelected ? "default" : "secondary"}
              className={`cursor-pointer ${isSelected ? "bg-purple-600 hover:bg-purple-700" : "hover:bg-purple-100 dark:hover:bg-purple-900"}`}
              onClick={() => handleMultiSelect(field, option, maxSelections)}
            >
              {option}
            </Badge>
          );
        })}
      </div>
      <p className="text-xs text-muted-foreground">
        Choose up to {maxSelections} options
      </p>
    </div>
  );

  const renderSelect = (
    field: string,
    options: (string | number)[],
    title: string
  ) => (
    <div className="space-y-2">
      <Label htmlFor={field} className="text-sm font-medium">
        {title}
      </Label>
      <select
        id={field}
        value={formData[field as keyof typeof formData] || ""}
        onChange={(e) => handleInputChange(field, e.target.value)}
        className="w-full p-2 border border-gray-300 rounded-md bg-background text-foreground"
      >
        <option value="">Select {title}</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );

  if (profile === undefined) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (profile === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      {/* Preview Button (always visible) */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsPreviewOpen(true)}
        className="mb-4 flex items-center gap-2"
      >
        <Eye size={16} />
        Preview Profile
      </Button>

      {/* Use shared ProfileModal for preview, passing current userId */}
      {userId && (
        <ProfileModal
          open={isPreviewOpen}
          onOpenChange={setIsPreviewOpen}
          userId={userId}
          onBack={() => setIsPreviewOpen(false)}
          onStartChat={() => {}}
        />
      )}

      {profile === null && (
        <div className="mb-4 text-center text-muted-foreground">
          No profile found. Please create your profile below.
        </div>
      )}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-purple-600">
            Edit Your Profile
          </CardTitle>
          <CardDescription>
            Update your profile information and preferences
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleFormSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-purple-600">
                Basic Information
              </h3>

              {/* Photo Gallery Management */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Profile Photos ({photos.length + photoPreviews.length}/5)
                </Label>
                <div className="flex flex-wrap gap-4 items-center">
                  {Array.from({ length: 5 }).map((_, idx) => {
                    // Show existing photo if available
                    if (idx < photos.length) {
                      return (
                        <div
                          key={"existing-" + idx}
                          className={`relative group w-24 h-24 rounded-lg overflow-hidden border-2 ${idx === 0 ? "border-purple-600" : "border-primary"} flex flex-col items-center justify-center focus-within:ring-2 focus-within:ring-purple-500 bg-background`}
                          tabIndex={0}
                          aria-label={`Profile photo ${idx + 1}${idx === 0 ? " (Main)" : ""}`}
                        >
                          <img
                            src={photos[idx].url}
                            alt={`Profile photo ${idx + 1}`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = "";
                              e.currentTarget.outerHTML = `<svg class='w-full h-full text-gray-300' fill='none' stroke='currentColor' viewBox='0 0 24 24'><circle cx='12' cy='8' r='4' stroke-width='2'/><path stroke-width='2' d='M4 20c0-4 4-7 8-7s8 3 8 7'/></svg>`;
                            }}
                          />
                          {/* Main photo indicator - only show on first photo */}
                          {idx === 0 && (
                            <span
                              className="absolute top-1 left-1 bg-purple-600 text-white text-xs px-2 py-0.5 rounded shadow"
                              aria-label="Main photo"
                            >
                              Main
                            </span>
                          )}
                          {/* Controls bar */}
                          <div className="absolute bottom-0 left-0 right-0 flex justify-center gap-1 bg-white/70 dark:bg-black/40 py-0.5 border-t border-border">
                            <button
                              type="button"
                              className="p-1 rounded hover:bg-purple-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500"
                              aria-label="Move photo left"
                              title="Move left"
                              disabled={idx === 0}
                              tabIndex={0}
                              onClick={() => handleMovePhoto(idx, -1)}
                            >
                              <ChevronLeft size={16} aria-hidden="true" />
                            </button>
                            <button
                              type="button"
                              className="p-1 rounded hover:bg-purple-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500"
                              aria-label="Move photo right"
                              title="Move right"
                              disabled={idx === photos.length - 1}
                              tabIndex={0}
                              onClick={() => handleMovePhoto(idx, 1)}
                            >
                              <ChevronRight size={16} aria-hidden="true" />
                            </button>
                            <button
                              type="button"
                              className="p-1 rounded hover:bg-red-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                              aria-label="Remove photo"
                              title="Remove photo"
                              tabIndex={0}
                              onClick={() => handleRemovePhoto(idx)}
                            >
                              <Trash2 size={16} aria-hidden="true" />
                            </button>
                          </div>
                        </div>
                      );
                    }
                    // Show new photo preview if available
                    if (idx - photos.length < photoPreviews.length) {
                      const previewIdx = idx - photos.length;
                      return (
                        <div
                          key={"preview-" + previewIdx}
                          className="relative group w-24 h-24 rounded-lg overflow-hidden border-2 border-primary flex flex-col items-center justify-center focus-within:ring-2 focus-within:ring-purple-500 bg-background"
                          tabIndex={0}
                          aria-label={`New profile photo ${previewIdx + 1}`}
                        >
                          <img
                            src={photoPreviews[previewIdx]}
                            alt={`New profile photo ${previewIdx + 1}`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = "";
                              e.currentTarget.outerHTML = `<svg class='w-full h-full text-gray-300' fill='none' stroke='currentColor' viewBox='0 0 24 24'><circle cx='12' cy='8' r='4' stroke-width='2'/><path stroke-width='2' d='M4 20c0-4 4-7 8-7s8 3 8 7'/></svg>`;
                            }}
                          />
                          {/* Controls bar for new photo (only remove) */}
                          <div className="absolute bottom-0 left-0 right-0 flex justify-center gap-1 bg-white/70 dark:bg-black/40 py-0.5 border-t border-border">
                            <button
                              type="button"
                              className="p-1 rounded hover:bg-red-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                              aria-label="Remove photo"
                              title="Remove photo"
                              tabIndex={0}
                              onClick={() => handleRemovePhoto(idx)}
                            >
                              <Trash2 size={16} aria-hidden="true" />
                            </button>
                          </div>
                        </div>
                      );
                    }
                    // Show add photo button if there is room
                    if (idx === photos.length + photoPreviews.length) {
                      return (
                        <label
                          key="add-photo"
                          className="w-24 h-24 flex items-center justify-center border-2 border-dashed border-gray-400 rounded-lg cursor-pointer hover:border-purple-600 focus-within:ring-2 focus-within:ring-purple-500 bg-background"
                          tabIndex={0}
                          aria-label="Add photo"
                        >
                          <span className="text-2xl text-gray-400">+</span>
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            className="hidden"
                            onChange={(e) => {
                              void handlePhotoUpload(e);
                            }}
                            aria-label="Add photo"
                          />
                        </label>
                      );
                    }
                    // Empty slot
                    return null;
                  })}
                </div>
                <p className="text-xs text-muted-foreground">
                  Drag to reorder, or use the up/down buttons. Click ★ to set as
                  main photo (moves to first position). The first photo is
                  always your main photo and profile picture.
                </p>
              </div>

              {/* Display Name */}
              <div className="space-y-2">
                <Label htmlFor="displayName" className="text-sm font-medium">
                  Display Name
                </Label>
                <Input
                  id="displayName"
                  value={formData.displayName}
                  onChange={(e) =>
                    handleInputChange("displayName", e.target.value)
                  }
                  placeholder="Enter your display name"
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium">
                  About Me
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  placeholder="Tell us about yourself..."
                  rows={4}
                />
              </div>

              {/* Home Location */}
              <div className="space-y-2">
                <Label htmlFor="homeLocation" className="text-sm font-medium">
                  Home Location
                </Label>
                <Input
                  id="homeLocation"
                  value={formData.homeLocation}
                  onChange={(e) =>
                    handleInputChange("homeLocation", e.target.value)
                  }
                  placeholder="Enter your home location"
                />
              </div>
            </div>

            <Separator />

            {/* Stats */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-purple-600">Stats</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {renderSelect("age", PROFILE_OPTIONS.age, "Age")}
                {renderSelect(
                  "heightInCm",
                  PROFILE_OPTIONS.heightInCm,
                  "Height (cm)"
                )}
                {renderSelect(
                  "weightInKg",
                  PROFILE_OPTIONS.weightInKg,
                  "Weight (kg)"
                )}
                {renderSelect(
                  "endowment",
                  PROFILE_OPTIONS.endowment,
                  "Endowment"
                )}
                {renderSelect(
                  "bodyType",
                  PROFILE_OPTIONS.bodyType,
                  "Body Type"
                )}
              </div>
            </div>

            <Separator />

            {/* Identity */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-purple-600">
                Identity
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {renderSelect("gender", PROFILE_OPTIONS.gender, "Gender")}
                {renderSelect(
                  "expression",
                  PROFILE_OPTIONS.expression,
                  "Expression"
                )}
                {renderSelect(
                  "sexuality",
                  PROFILE_OPTIONS.sexuality,
                  "Sexuality"
                )}
                {renderSelect("position", PROFILE_OPTIONS.position, "Position")}
              </div>
            </div>

            <Separator />

            {/* Scene */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-purple-600">Scene</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {renderSelect("location", PROFILE_OPTIONS.location, "Location")}
                {renderSelect(
                  "intoPublic",
                  PROFILE_OPTIONS.intoPublic,
                  "Into Public"
                )}
              </div>
            </div>

            <Separator />

            {/* Health */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-purple-600">Health</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {renderSelect(
                  "hivStatus",
                  PROFILE_OPTIONS.hivStatus,
                  "HIV Status"
                )}
              </div>
            </div>

            <Separator />

            {/* Practices */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-purple-600">
                Practices
              </h3>
              {renderMultiSelect(
                "practices",
                PROFILE_OPTIONS.practices,
                6,
                "Practices"
              )}
            </div>

            <Separator />

            {/* Into */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-purple-600">Into</h3>
              {renderMultiSelect("into", PROFILE_OPTIONS.into, 3, "Into")}
            </div>

            <Separator />

            {/* Fetishes */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-purple-600">
                Fetishes
              </h3>
              <div className="space-y-6">
                <div>
                  <h4 className="text-md font-medium mb-2">Body</h4>
                  {renderMultiSelect(
                    "fetishes",
                    PROFILE_OPTIONS.fetishes.body,
                    6,
                    ""
                  )}
                </div>
                <div>
                  <h4 className="text-md font-medium mb-2">Clothing</h4>
                  {renderMultiSelect(
                    "fetishes",
                    PROFILE_OPTIONS.fetishes.clothing,
                    6,
                    ""
                  )}
                </div>
                <div>
                  <h4 className="text-md font-medium mb-2">Underwear</h4>
                  {renderMultiSelect(
                    "fetishes",
                    PROFILE_OPTIONS.fetishes.underwear,
                    6,
                    ""
                  )}
                </div>
              </div>
            </div>

            <Separator />

            {/* Kinks */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-purple-600">Kinks</h3>
              <div className="space-y-6">
                <div>
                  <h4 className="text-md font-medium mb-2">General</h4>
                  {renderMultiSelect("kinks", KINKS.general, 6, "")}
                </div>
                <div>
                  <h4 className="text-md font-medium mb-2">Role Play</h4>
                  {renderMultiSelect("kinks", KINKS.rolePlay, 6, "")}
                </div>
              </div>
            </div>

            <Separator />

            {/* Submit Button */}
            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-2"
              >
                {isSubmitting ? "Saving..." : "Save Profile"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
