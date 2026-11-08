import "dotenv/config";
import dns from "node:dns";
import net from "node:net";
import { defineConfig } from "drizzle-kit";

dns.setDefaultResultOrder("ipv4first");
net.setDefaultAutoSelectFamily?.(false);

const rawUrl =
  process.env.DATABASE_URL?.trim() ||
  "postgresql://postgres:postgres@localhost:5432/agape_communion";

// Strip channel_binding=require if present, as @neondatabase/serverless WebSocket driver does not support SCRAM channel binding
const sanitizedUrl = rawUrl
  .replace(/[?&]channel_binding=[^&]+/g, "")
  .replace(/\?&/, "?");

export default defineConfig({
  schema: ["./src/lib/db/schema/index.ts", "./src/lib/db/relations.ts"],
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: sanitizedUrl,
  },
  strict: true,
  verbose: true,
});
