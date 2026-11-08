import { z } from "zod";

const serverEnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DATABASE_URL: z.string().optional().default(""),
  PGLITE_DATA_DIR: z.string().default(".local-postgres"),
  AUTH_SECRET: z
    .string()
    .min(16, "AUTH_SECRET must be at least 16 characters")
    .default("agape-communion-church-super-secret-key-change-in-production-32chars"),
  NEXTAUTH_URL: z.string().url().default("http://localhost:3000"),
  INITIAL_SUPER_ADMIN_EMAIL: z
    .string()
    .email()
    .default("superadmin@agapecommunion.org.ng"),
  INITIAL_SUPER_ADMIN_PASSWORD: z
    .string()
    .min(12)
    .default("AgapeSuperAdmin!2026"),
  INITIAL_SUPER_ADMIN_NAME: z.string().min(2).default("Pastor Emmanuel Adeyemi"),
  S3_ENDPOINT: z.string().default("https://s3.us-east-1.amazonaws.com"),
  S3_REGION: z.string().default("us-east-1"),
  S3_BUCKET: z.string().default("agape-communion-media"),
  S3_ACCESS_KEY_ID: z.string().optional().default(""),
  S3_SECRET_ACCESS_KEY: z.string().optional().default(""),
  S3_PUBLIC_URL: z.string().default("http://localhost:3000/uploads"),
});

const publicEnvSchema = z.object({
  NEXT_PUBLIC_SITE_URL: z.string().url().default("http://localhost:3000"),
  NEXT_PUBLIC_SITE_NAME: z.string().default("Agape Communion Church"),
});

export function validateServerEnv(rawEnv: Record<string, string | undefined> = process.env) {
  return serverEnvSchema.parse({
    NODE_ENV: rawEnv.NODE_ENV,
    DATABASE_URL: rawEnv.DATABASE_URL || undefined,
    PGLITE_DATA_DIR: rawEnv.PGLITE_DATA_DIR || undefined,
    AUTH_SECRET: rawEnv.AUTH_SECRET || undefined,
    NEXTAUTH_URL: rawEnv.NEXTAUTH_URL || undefined,
    INITIAL_SUPER_ADMIN_EMAIL: rawEnv.INITIAL_SUPER_ADMIN_EMAIL || undefined,
    INITIAL_SUPER_ADMIN_PASSWORD: rawEnv.INITIAL_SUPER_ADMIN_PASSWORD || undefined,
    INITIAL_SUPER_ADMIN_NAME: rawEnv.INITIAL_SUPER_ADMIN_NAME || undefined,
    S3_ENDPOINT: rawEnv.S3_ENDPOINT || undefined,
    S3_REGION: rawEnv.S3_REGION || undefined,
    S3_BUCKET: rawEnv.S3_BUCKET || undefined,
    S3_ACCESS_KEY_ID: rawEnv.S3_ACCESS_KEY_ID,
    S3_SECRET_ACCESS_KEY: rawEnv.S3_SECRET_ACCESS_KEY,
    S3_PUBLIC_URL: rawEnv.S3_PUBLIC_URL || undefined,
  });
}

export function validatePublicEnv(rawEnv: Record<string, string | undefined> = process.env) {
  return publicEnvSchema.parse({
    NEXT_PUBLIC_SITE_URL: rawEnv.NEXT_PUBLIC_SITE_URL || undefined,
    NEXT_PUBLIC_SITE_NAME: rawEnv.NEXT_PUBLIC_SITE_NAME || undefined,
  });
}

export const env = validateServerEnv();
export const publicEnv = validatePublicEnv();
