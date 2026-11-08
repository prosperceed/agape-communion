import "dotenv/config";
import dns from "node:dns";
import net from "node:net";
import { getDb } from "./index";
import { seedDatabaseIfEmpty } from "./seed-data";

dns.setDefaultResultOrder("ipv4first");
net.setDefaultAutoSelectFamily?.(false);

async function main() {
  console.log("Initializing and seeding database...");
  const db = await getDb();
  await seedDatabaseIfEmpty(db);
  console.log("Database seed completed successfully.");
  process.exit(0);
}

main().catch((err) => {
  console.error("Database seed failed:", err);
  process.exit(1);
});
