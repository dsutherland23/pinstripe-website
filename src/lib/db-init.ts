/**
 * db-init.ts
 * Standalone database initialisation script.
 *
 * Run on the server after deployment to create tables and seed default data:
 *   npx tsx src/lib/db-init.ts
 *
 * This script is idempotent — safe to run multiple times.
 * It uses INSERT IGNORE so existing data is never overwritten.
 */

// Load .env.local variables when running standalone (tsx/ts-node only)
import { config } from "dotenv";
import path from "path";
config({ path: path.resolve(process.cwd(), ".env.local") });
config({ path: path.resolve(process.cwd(), ".env") });

import { initDb } from "./db";

async function main() {
  console.log("🔌 Connecting to MySQL database...");
  console.log(`   Host : ${process.env.DB_HOST ?? "unconfigured"}`);
  console.log(`   DB   : ${process.env.DB_NAME ?? "unconfigured"}`);
  console.log(`   User : ${process.env.DB_USER ?? "unconfigured"}`);

  try {
    await initDb();
    console.log("✅ Database initialised successfully.");
    console.log("   Tables created (if not already present): inventory, bookings, categories, site_content, settings, users");
    console.log("   Default seed data inserted where tables were empty.");
  } catch (err) {
    console.error("❌ Database initialisation failed:", err);
    process.exit(1);
  }

  process.exit(0);
}

main();
