import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// Lazy client. Nothing here runs at import time unless DATABASE_URL exists, so
// the app still builds and runs on the in-memory data layer without a database.
let _db: ReturnType<typeof drizzle<typeof schema>> | null = null;

export function hasDatabase(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

export function db() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set — falling back to the in-memory data layer.");
  }
  if (!_db) {
    const client = postgres(process.env.DATABASE_URL, { max: 1, prepare: false });
    _db = drizzle(client, { schema });
  }
  return _db;
}

export { schema };
