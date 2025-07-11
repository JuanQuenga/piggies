import imageCompression from "browser-image-compression";

export interface CompressedImage {
  file: File;
  url: string;
  storageId?: string;
}

export async function compressImage(file: File): Promise<CompressedImage> {
  const options = {
    maxSizeMB: 0.8, // Target size (under 1 MiB)
    maxWidthOrHeight: 1024, // Resize if needed
    useWebWorker: true,
    fileType: "image/jpeg", // Convert to JPEG for better compression
    quality: 0.8, // Good quality while keeping size down
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
    // Get upload URL from Convex
    const uploadUrl = await generateUploadUrl();

    // Upload the file
    const response = await fetch(uploadUrl, {
      method: "POST",
      body: file,
      headers: {
        "Content-Type": file.type,
      },
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }

    // The response body contains the storage ID
    const storageId = await response.text();

    // Parse the storage ID if it's returned as JSON
    try {
      const parsed = JSON.parse(storageId);
      return parsed.storageId || storageId;
    } catch {
      // If it's not JSON, return as is
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
