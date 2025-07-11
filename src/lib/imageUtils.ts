import imageCompression from "browser-image-compression";

export interface CompressedImage {
  file: File;
  url: string;
  storageId?: string;
}

export async function compressImage(file: File): Promise<CompressedImage> {
  const options = {
    maxSizeMB: 0.5, // Reduced from 0.8 to 0.5 MB
    maxWidthOrHeight: 800, // Reduced from 1024 to 800
    useWebWorker: true,
    fileType: "image/jpeg", // Convert to JPEG for better compression
    quality: 0.7, // Reduced from 0.8 to 0.7 for smaller file size
    alwaysKeepResolution: false, // Allow resolution reduction
  };

  try {
    const compressedFile = await imageCompression(file, options);

    // Create a preview URL for the compressed image
    const url = URL.createObjectURL(compressedFile);

    return {
      file: compressedFile,
      url,
    };
  } catch (error) {
    console.error("Error compressing image:", error);
    throw new Error("Failed to compress image");
  }
}

export async function uploadImageToConvex(
  file: File,
  generateUploadUrl: () => Promise<string>
): Promise<string> {
  try {
    console.log("[uploadImageToConvex] Starting upload for file:", file.name);

    // Get upload URL from Convex
    console.log("[uploadImageToConvex] Getting upload URL...");
    const uploadUrl = await generateUploadUrl();
    console.log(
      "[uploadImageToConvex] Upload URL received:",
      uploadUrl.substring(0, 50) + "..."
    );

    // Upload the file
    console.log("[uploadImageToConvex] Uploading file to Convex...");
    const response = await fetch(uploadUrl, {
      method: "POST",
      body: file,
      headers: {
        "Content-Type": file.type,
      },
    });

    console.log(
      "[uploadImageToConvex] Upload response status:",
      response.status
    );
    console.log("[uploadImageToConvex] Upload response ok:", response.ok);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        "[uploadImageToConvex] Upload failed with response:",
        errorText
      );
      throw new Error(`Upload failed: ${response.statusText}`);
    }

    // The response body contains the storage ID
    const storageId = await response.text();
    console.log("[uploadImageToConvex] Raw storage ID response:", storageId);

    // Parse the storage ID if it's returned as JSON
    try {
      const parsed = JSON.parse(storageId);
      console.log("[uploadImageToConvex] Parsed JSON response:", parsed);
      return parsed.storageId || storageId;
    } catch {
      // If it's not JSON, return as is
      console.log("[uploadImageToConvex] Using raw storage ID:", storageId);
      return storageId;
    }
  } catch (error) {
    console.error("Error uploading image:", error);
    throw new Error("Failed to upload image");
  }
}

export function cleanupImageUrl(url: string) {
  if (url.startsWith("blob:")) {
    URL.revokeObjectURL(url);
  }
}
