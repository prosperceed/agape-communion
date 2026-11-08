import { NextResponse } from "next/server";
import { uploadAndRegisterMediaFile } from "@/features/media/service";
import { AuthorizationError } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const folder = (formData.get("folder") as string) || "general";
    const altText = (formData.get("altText") as string) || "";

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { success: false, error: "No image file provided." },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);

    const record = await uploadAndRegisterMediaFile({
      filename: file.name,
      mimeType: file.type,
      sizeBytes: file.size,
      folder,
      altText: altText.trim() || file.name,
      bytes,
    });

    return NextResponse.json({
      success: true,
      data: record,
    });
  } catch (err) {
    if (err instanceof AuthorizationError) {
      return NextResponse.json(
        { success: false, error: err.message },
        { status: err.statusCode }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Media upload failed.",
      },
      { status: 400 }
    );
  }
}

