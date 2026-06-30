import postgres from "postgres";

const sql = postgres({
  host: "127.0.0.1",
  port: 5432,
  database: "khalvat",
  user: "postgres",
  password: "postgres",
  max: 1,
  connect_timeout: 5,
});

try {
  const r = await sql`SELECT current_user, current_database()`;
  console.log("✅ Connected:", r[0]);
} catch (e) {
  console.error("❌ Failed:", e.message);
  console.error("  code:", e.code);
} finally {
  await sql.end();
}
