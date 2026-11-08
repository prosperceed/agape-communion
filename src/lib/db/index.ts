import dns from "node:dns";
import net from "node:net";
import fs from "node:fs";
import path from "node:path";
import { neon } from "@neondatabase/serverless";
import { drizzle as drizzleNeonHttp } from "drizzle-orm/neon-http";
import { PGlite } from "@electric-sql/pglite";
import { drizzle as drizzlePglite, type PgliteDatabase } from "drizzle-orm/pglite";
import * as schemaModule from "./schema";
import * as relationsModule from "./relations";
import { env } from "@/config/env";
import { seedDatabaseIfEmpty } from "./seed-data";

dns.setDefaultResultOrder("ipv4first");
net.setDefaultAutoSelectFamily?.(false);

export const fullSchema = {
  ...schemaModule,
  ...relationsModule,
};

export type AppDatabase = PgliteDatabase<typeof fullSchema>;

const globalForDb = globalThis as unknown as {
  dbInstance?: AppDatabase;
  dbInitPromise?: Promise<AppDatabase>;
  pgliteClient?: PGlite;
};

async function applyMigrationsAndSeed(client: PGlite, db: AppDatabase) {
  const checkResult = await client.query<{ exists: boolean }>(
    `SELECT EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'users'
    ) as exists;`
  );

  const tablesExist = checkResult.rows[0]?.exists === true;

  if (!tablesExist) {
    const drizzleDir = path.join(process.cwd(), "drizzle");
    if (fs.existsSync(drizzleDir)) {
      const sqlFiles = fs
        .readdirSync(drizzleDir)
        .filter((f) => f.endsWith(".sql"))
        .sort();
      for (const file of sqlFiles) {
        const sqlContent = fs.readFileSync(path.join(drizzleDir, file), "utf8");
        const statements = sqlContent
          .split("--> statement-breakpoint")
          .map((s) => s.trim())
          .filter(Boolean);
        for (const statement of statements) {
          await client.exec(statement);
        }
      }
    }
  }

  await seedDatabaseIfEmpty(db);
}

async function initDatabase(): Promise<AppDatabase> {
  if (globalForDb.dbInstance) {
    return globalForDb.dbInstance;
  }

  const isTest =
    process.env.NODE_ENV === "test" ||
    process.env.VITEST === "true" ||
    process.env.PGLITE_MEMORY === "true";

  const rawConnectionString =
    process.env.DATABASE_URL?.trim() || env.DATABASE_URL;
  const connectionString = rawConnectionString
    .replace(/[?&]channel_binding=[^&]+/g, "")
    .replace(/\?&/, "?");

  if (
    !isTest &&
    connectionString &&
    (connectionString.startsWith("postgres://") ||
      connectionString.startsWith("postgresql://"))
  ) {
    const sqlClient = neon(connectionString);
    const neonDb = drizzleNeonHttp(sqlClient, {
      schema: fullSchema,
    }) as unknown as AppDatabase;

    // Provide compatible transaction wrapper over Neon HTTP driver
    neonDb.transaction = (async (
      callback: (tx: AppDatabase) => Promise<unknown>
    ) => {
      return callback(neonDb);
    }) as AppDatabase["transaction"];

    globalForDb.dbInstance = neonDb;
    return neonDb;
  }

  let client: PGlite;
  if (isTest) {
    client = new PGlite();
  } else {
    const dataDir = path.join(process.cwd(), ".local-postgres");
    try {
      client = await PGlite.create(dataDir);
    } catch {
      // Fallback to in-memory PGlite if another build worker holds the directory lock
      client = await PGlite.create();
    }
  }

  globalForDb.pgliteClient = client;
  const db = drizzlePglite(client, { schema: fullSchema });
  await applyMigrationsAndSeed(client, db);
  globalForDb.dbInstance = db;
  return db;
}

export async function getDb(): Promise<AppDatabase> {
  if (globalForDb.dbInstance) {
    return globalForDb.dbInstance;
  }
  if (!globalForDb.dbInitPromise) {
    globalForDb.dbInitPromise = initDatabase();
  }
  return globalForDb.dbInitPromise;
}

export async function resetTestDb(): Promise<AppDatabase> {
  globalForDb.dbInstance = undefined;
  globalForDb.dbInitPromise = undefined;
  if (globalForDb.pgliteClient) {
    try {
      await globalForDb.pgliteClient.close();
    } catch {
      // ignore close errors
    }
    globalForDb.pgliteClient = undefined;
  }
  return getDb();
}

export * from "./schema";
