import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { env } from "@/config/env";
import { slugify } from "@/lib/utils";

export const ALLOWED_IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/svg+xml",
] as const;

export type AllowedImageMimeType = (typeof ALLOWED_IMAGE_MIME_TYPES)[number];

export const MAX_UPLOAD_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

const ALLOWED_FOLDERS = new Set([
  "general",
  "branding",
  "hero",
  "church",
  "leadership",
  "services",
  "events",
  "testimonies",
  "messages",
  "blog",
]);

export interface SignedUploadOutput {
  uploadUrl: string;
  publicUrl: string;
  objectKey: string;
  expiresIn: number;
}

export interface StorageProvider {
  createSignedUploadUrl(params: {
    objectKey: string;
    mimeType: string;
    sizeBytes: number;
  }): Promise<SignedUploadOutput>;
  uploadBuffer(params: {
    objectKey: string;
    buffer: Uint8Array;
    mimeType: string;
  }): Promise<{ publicUrl: string; objectKey: string }>;
  deleteObject(objectKey: string): Promise<void>;
  objectExists(objectKey: string): Promise<boolean>;
}

export function validateUploadMetadata(params: {
  mimeType: string;
  sizeBytes: number;
  filename: string;
}): { valid: boolean; error?: string } {
  if (
    !ALLOWED_IMAGE_MIME_TYPES.includes(
      params.mimeType as AllowedImageMimeType
    )
  ) {
    return {
      valid: false,
      error: `Unsupported file type "${params.mimeType}". Allowed types: JPEG, PNG, WebP, SVG.`,
    };
  }

  if (params.sizeBytes <= 0) {
    return { valid: false, error: "File cannot be empty." };
  }

  if (params.sizeBytes > MAX_UPLOAD_SIZE_BYTES) {
    return {
      valid: false,
      error: `File size exceeds maximum limit of ${MAX_UPLOAD_SIZE_BYTES / (1024 * 1024)}MB.`,
    };
  }

  if (!params.filename || params.filename.trim().length === 0) {
    return { valid: false, error: "Filename is required." };
  }

  return { valid: true };
}

export function validateFileSignature(
  bytes: Uint8Array,
  declaredMimeType: string
): { valid: boolean; error?: string } {
  if (bytes.length < 4) {
    return { valid: false, error: "File content is too short or corrupted." };
  }

  if (declaredMimeType === "image/jpeg") {
    const isJpeg =
      bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
    return isJpeg
      ? { valid: true }
      : {
          valid: false,
          error: "File signature does not match declared JPEG format.",
        };
  }

  if (declaredMimeType === "image/png") {
    const isPng =
      bytes.length >= 8 &&
      bytes[0] === 0x89 &&
      bytes[1] === 0x50 &&
      bytes[2] === 0x4e &&
      bytes[3] === 0x47 &&
      bytes[4] === 0x0d &&
      bytes[5] === 0x0a &&
      bytes[6] === 0x1a &&
      bytes[7] === 0x0a;
    return isPng
      ? { valid: true }
      : {
          valid: false,
          error: "File signature does not match declared PNG format.",
        };
  }

  if (declaredMimeType === "image/webp") {
    const isWebp =
      bytes.length >= 12 &&
      bytes[0] === 0x52 && // R
      bytes[1] === 0x49 && // I
      bytes[2] === 0x46 && // F
      bytes[3] === 0x46 && // F
      bytes[8] === 0x57 && // W
      bytes[9] === 0x45 && // E
      bytes[10] === 0x42 && // B
      bytes[11] === 0x50; // P
    return isWebp
      ? { valid: true }
      : {
          valid: false,
          error: "File signature does not match declared WebP format.",
        };
  }

  if (declaredMimeType === "image/svg+xml") {
    const text = Buffer.from(bytes).toString("utf8").trim();
    const hasSvgTag = /<svg[\s>]/i.test(text);
    const hasUnsafeScript = /<script[\s>]|onload=|onerror=|javascript:/i.test(
      text
    );
    if (!hasSvgTag) {
      return {
        valid: false,
        error: "File signature does not contain a valid SVG root element.",
      };
    }
    if (hasUnsafeScript) {
      return {
        valid: false,
        error: "SVG contains potentially unsafe scripts or event handlers.",
      };
    }
    return { valid: true };
  }

  return { valid: false, error: "Unsupported MIME type for signature check." };
}

export function generateUniqueObjectKey(
  folder: string,
  originalFilename: string
): string {
  const safeFolder = ALLOWED_FOLDERS.has(folder) ? folder : "general";
  const ext = path.extname(originalFilename).toLowerCase() || ".jpg";
  const baseName = path.basename(originalFilename, ext);
  const safeBase = slugify(baseName) || "media";
  const uniqueId = crypto.randomUUID().slice(0, 12);
  return `uploads/${safeFolder}/${Date.now()}-${uniqueId}-${safeBase}${ext}`;
}

class S3CompatibleStorageProvider implements StorageProvider {
  private client: S3Client;
  private bucket: string;
  private publicBaseUrl: string;

  constructor() {
    this.bucket = env.S3_BUCKET;
    this.publicBaseUrl = env.S3_PUBLIC_URL.replace(/\/$/, "");
    this.client = new S3Client({
      region: env.S3_REGION,
      endpoint: env.S3_ENDPOINT,
      credentials: {
        accessKeyId: env.S3_ACCESS_KEY_ID,
        secretAccessKey: env.S3_SECRET_ACCESS_KEY,
      },
      forcePathStyle: true,
    });
  }

  async createSignedUploadUrl(params: {
    objectKey: string;
    mimeType: string;
    sizeBytes: number;
  }): Promise<SignedUploadOutput> {
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: params.objectKey,
      ContentType: params.mimeType,
      ContentLength: params.sizeBytes,
    });
    const expiresIn = 900;
    const uploadUrl = await getSignedUrl(this.client, command, { expiresIn });
    return {
      uploadUrl,
      publicUrl: `${this.publicBaseUrl}/${params.objectKey}`,
      objectKey: params.objectKey,
      expiresIn,
    };
  }

  async uploadBuffer(params: {
    objectKey: string;
    buffer: Uint8Array;
    mimeType: string;
  }): Promise<{ publicUrl: string; objectKey: string }> {
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: params.objectKey,
      Body: params.buffer,
      ContentType: params.mimeType,
    });
    await this.client.send(command);
    return {
      publicUrl: `${this.publicBaseUrl}/${params.objectKey}`,
      objectKey: params.objectKey,
    };
  }

  async deleteObject(objectKey: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: this.bucket,
      Key: objectKey,
    });
    await this.client.send(command);
  }

  async objectExists(objectKey: string): Promise<boolean> {
    try {
      const command = new HeadObjectCommand({
        Bucket: this.bucket,
        Key: objectKey,
      });
      await this.client.send(command);
      return true;
    } catch {
      return false;
    }
  }
}

class LocalPublicStorageProvider implements StorageProvider {
  private rootDir = path.join(process.cwd(), "public");

  async createSignedUploadUrl(params: {
    objectKey: string;
    mimeType: string;
    sizeBytes: number;
  }): Promise<SignedUploadOutput> {
    const token = crypto
      .createHmac("sha256", env.AUTH_SECRET)
      .update(`${params.objectKey}:${params.mimeType}:${params.sizeBytes}`)
      .digest("hex");

    return {
      uploadUrl: `/api/media/upload?key=${encodeURIComponent(params.objectKey)}&token=${token}`,
      publicUrl: `/${params.objectKey.replace(/^\/+/, "")}`,
      objectKey: params.objectKey,
      expiresIn: 900,
    };
  }

  async uploadBuffer(params: {
    objectKey: string;
    buffer: Uint8Array;
    mimeType: string;
  }): Promise<{ publicUrl: string; objectKey: string }> {
    const sanitizedKey = params.objectKey
      .replace(/\.\./g, "")
      .replace(/^\/+/, "");
    const targetPath = path.join(this.rootDir, sanitizedKey);
    await fs.mkdir(path.dirname(targetPath), { recursive: true });
    await fs.writeFile(targetPath, params.buffer);
    return {
      publicUrl: `/${sanitizedKey}`,
      objectKey: sanitizedKey,
    };
  }

  async deleteObject(objectKey: string): Promise<void> {
    // Protect built-in seed assets under assets/ from physical deletion
    if (objectKey.startsWith("assets/") || objectKey.startsWith("/assets/")) {
      return;
    }
    const sanitizedKey = objectKey.replace(/\.\./g, "").replace(/^\/+/, "");
    const targetPath = path.join(this.rootDir, sanitizedKey);
    try {
      await fs.unlink(targetPath);
    } catch {
      // Ignore if file already removed
    }
  }

  async objectExists(objectKey: string): Promise<boolean> {
    const sanitizedKey = objectKey.replace(/\.\./g, "").replace(/^\/+/, "");
    const targetPath = path.join(this.rootDir, sanitizedKey);
    try {
      await fs.access(targetPath);
      return true;
    } catch {
      return false;
    }
  }
}

export function getStorageProvider(): StorageProvider {
  if (env.S3_ACCESS_KEY_ID && env.S3_SECRET_ACCESS_KEY) {
    return new S3CompatibleStorageProvider();
  }
  return new LocalPublicStorageProvider();
}
