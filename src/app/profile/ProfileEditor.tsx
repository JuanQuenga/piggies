import React, { useState, useEffect, useRef } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { toast } from "sonner";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../../components/ui/card";

export const ProfileEditor: React.FC = () => {
  const userProfile = useQuery(api.profiles.getMyProfile);
  const loggedInUser = useQuery(api.auth.loggedInUser);
  const updateProfile = useMutation(api.profiles.updateMyProfile);
  const generateAvatarUploadUrl = useMutation(
    api.profiles.generateAvatarUploadUrl
  );

  const [displayName, setDisplayName] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("");
  const [isVisible, setIsVisible] = useState(true);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (userProfile) {
      setDisplayName(userProfile.displayName || loggedInUser?.name || "");
      setDescription(userProfile.description || "");
      setStatus(userProfile.status || "");
      setIsVisible(userProfile.isVisible);
      if (userProfile.avatarUrl) {
        setAvatarPreview(userProfile.avatarUrl);
      } else if (loggedInUser?.image) {
        setAvatarPreview(loggedInUser.image);
      }
    } else if (userProfile === null) {
      // Profile doesn't exist yet
      setDisplayName(loggedInUser?.name || "");
      setDescription("");
      setStatus("");
      setIsVisible(true);
      if (loggedInUser?.image) {
        setAvatarPreview(loggedInUser.image);
      }
    }
  }, [userProfile, loggedInUser]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    let avatarStorageId: string | undefined = userProfile?.avatarUrl;

    try {
      if (avatarFile) {
        const uploadUrl = await generateAvatarUploadUrl({});
        const uploadResponse = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": avatarFile.type },
          body: avatarFile,
        });
        if (!uploadResponse.ok) {
          const errorBody = await uploadResponse.text();
          throw new Error(
            `Avatar upload failed: ${uploadResponse.status} ${errorBody}`
          );
        }
        const { storageId } = await uploadResponse.json();
        avatarStorageId = storageId;
      }

      await updateProfile({
        displayName: displayName.trim() === "" ? undefined : displayName.trim(),
        description: description.trim() === "" ? undefined : description.trim(),
        status: status.trim() === "" ? undefined : status.trim(),
        isVisible,
        avatarUrl: avatarStorageId,
      });
      toast.success("Profile updated successfully!");
      setAvatarFile(null);
      if (avatarInputRef.current) avatarInputRef.current.value = "";
    } catch (error) {
      console.error("Failed to update profile:", error);
      toast.error(
        `Failed to update profile: ${error instanceof Error ? error.message : String(error)}`
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (userProfile === undefined || loggedInUser === undefined) {
    return <div className="text-center p-4">Loading profile editor...</div>;
  }

  // Mobile sheet version
  return (
    <div className="md:hidden">
      <Card className="bg-card/95 border shadow-xl rounded-t-2xl pt-2 pb-4 px-4 relative">
        {/* Drag handle */}
        <div className="mx-auto mb-2 mt-1 w-12 h-1.5 rounded-full bg-muted-foreground/30" />
        {/* Avatar preview */}
        <div className="flex flex-col items-center mb-4">
          {avatarPreview || userProfile?.avatarUrl || loggedInUser?.image ? (
            <img
              src={
                avatarPreview || userProfile?.avatarUrl || loggedInUser?.image
              }
              alt="Avatar Preview"
              className="w-20 h-20 rounded-full object-cover border-2 border-primary shadow mb-2"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center text-3xl text-muted-foreground mb-2">
              ?
            </div>
          )}
        </div>
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-xl">Edit Profile</CardTitle>
          <CardDescription className="text-sm">
            This information will be visible to others on the map.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={() => {}} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="avatar">Profile Picture</Label>
              <Input
                type="file"
                id="avatar"
                accept="image/*"
                ref={avatarInputRef}
                onChange={() => {}}
                className="w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-muted file:text-primary hover:file:bg-muted-foreground/10"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="displayName">Display Name</Label>
              <Input
                type="text"
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your public name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description / Bio</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Tell us a bit about yourself"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status Message</Label>
              <Input
                type="text"
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                placeholder="e.g., Looking to chat, Around for a bit"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isVisible"
                checked={isVisible}
                onChange={(e) => setIsVisible(e.target.checked)}
                className="h-4 w-4 text-primary border-border rounded focus:ring-primary"
              />
              <Label htmlFor="isVisible" className="font-medium">
                Visible on map
              </Label>
            </div>
          </form>
        </CardContent>
        {/* Sticky Save Button */}
        <div className="sticky bottom-0 left-0 right-0 bg-card shadow-lg border-t border-border pt-3 pb-3 px-4 z-20">
          <Button
            type="submit"
            className="w-full font-bold"
            variant="default"
            disabled={isLoading}
          >
            {isLoading ? "Saving..." : "Save Profile"}
          </Button>
        </div>
      </Card>
    </div>
  );
};
