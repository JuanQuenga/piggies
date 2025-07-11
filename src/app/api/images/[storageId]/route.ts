import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ storageId: string }> }
) {
  try {
    const { storageId } = await params;

    // For now, return a placeholder response
    // In a real implementation, you would:
    // 1. Call Convex to get the image URL from the storage ID
    // 2. Fetch the image from Convex storage
    // 3. Return the image with proper headers

    return new NextResponse("Image placeholder", {
      status: 200,
      headers: {
        "Content-Type": "text/plain",
      },
    });
  } catch (error) {
    console.error("Error serving image:", error);
    return new NextResponse("Image not found", { status: 404 });
  }
}
