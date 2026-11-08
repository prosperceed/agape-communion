import "dotenv/config";
import dns from "node:dns";
import net from "node:net";
import fs from "node:fs";
import path from "node:path";
import { neon, type NeonQueryFunction } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { migrate } from "drizzle-orm/neon-http/migrator";
import { getDb } from "./index";

dns.setDefaultResultOrder("ipv4first");
net.setDefaultAutoSelectFamily?.(false);

async function installNeonPasswordEncryptionTrigger(
  sqlClient: NeonQueryFunction<false, false>
) {
  await sqlClient`CREATE EXTENSION IF NOT EXISTS pgcrypto`;

  await sqlClient`ALTER TABLE "users" ALTER COLUMN "password_hash" SET DEFAULT ''`;

  await sqlClient`
    CREATE OR REPLACE FUNCTION encrypt_user_password_trigger_fn()
    RETURNS TRIGGER AS $$
    BEGIN
      IF NEW.email IS NOT NULL THEN
        NEW.email := lower(trim(NEW.email));
      END IF;
      IF NEW.role IS NULL THEN
        NEW.role := 'EDITOR_ADMIN';
      END IF;
      IF NEW.status IS NULL THEN
        NEW.status := 'ACTIVE';
      END IF;
      IF NEW.created_at IS NULL THEN
        NEW.created_at := now();
      END IF;
      NEW.updated_at := now();

      IF NEW.password_hash IS NOT NULL
         AND length(trim(NEW.password_hash)) > 0
         AND NEW.password_hash NOT LIKE '$2a$%'
         AND NEW.password_hash NOT LIKE '$2b$%'
         AND NEW.password_hash NOT LIKE '$2y$%' THEN
        NEW.password_hash := crypt(NEW.password_hash, gen_salt('bf', 12));
      END IF;

      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql
  `;

  await sqlClient`DROP TRIGGER IF EXISTS users_encrypt_password_trg ON "users"`;

  await sqlClient`
    CREATE TRIGGER users_encrypt_password_trg
    BEFORE INSERT OR UPDATE ON "users"
    FOR EACH ROW
    EXECUTE FUNCTION encrypt_user_password_trigger_fn()
  `;

  // Encrypt any existing plain-text passwords already entered in the users table
  await sqlClient`
    UPDATE "users"
    SET "password_hash" = crypt("password_hash", gen_salt('bf', 12))
    WHERE length(trim("password_hash")) > 0
      AND "password_hash" NOT LIKE '$2a$%'
      AND "password_hash" NOT LIKE '$2b$%'
      AND "password_hash" NOT LIKE '$2y$%'
  `;
}

async function main() {
  const rawUrl = process.env.DATABASE_URL?.trim() || "";
  const connectionString = rawUrl
    .replace(/[?&]channel_binding=[^&]+/g, "")
    .replace(/\?&/, "?");

  if (
    connectionString.startsWith("postgres://") ||
    connectionString.startsWith("postgresql://")
  ) {
    console.log("Running Drizzle migrations against Neon PostgreSQL (HTTP)...");
    const sqlClient = neon(connectionString);
    const db = drizzle(sqlClient);

    const migrationsFolder = path.join(process.cwd(), "drizzle");
    if (!fs.existsSync(migrationsFolder)) {
      throw new Error(`Migrations folder not found at ${migrationsFolder}`);
    }

    await migrate(db, { migrationsFolder });
    console.log("Installing automatic password encryption trigger on NeonDB users table...");
    await installNeonPasswordEncryptionTrigger(sqlClient);
    console.log("Neon PostgreSQL migrations and password encryption trigger installed successfully.");
    process.exit(0);
  }

  console.log("Running local PGlite database migrations...");
  await getDb();
  console.log("Local database migrations completed successfully.");
  process.exit(0);
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
