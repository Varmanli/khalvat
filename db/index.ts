import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL is not set. Please add it to your .env.local file."
  );
}

// Keep one bounded pool across development reloads of planner/schema modules.
const globalDb = globalThis as unknown as { khalvatSql?: ReturnType<typeof postgres> };
const sql = globalDb.khalvatSql ?? postgres(process.env.DATABASE_URL, {
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
});
if (process.env.NODE_ENV !== "production") globalDb.khalvatSql = sql;
export const db = drizzle(sql, { schema });
export { sql };
