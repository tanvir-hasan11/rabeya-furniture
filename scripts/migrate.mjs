import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import postgres from "postgres";

// Minimal forward-only SQL migrator: runs every db/migrations/*.sql in order,
// recording applied files in a _migrations table. Requires DATABASE_URL.

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is not set");
  process.exit(1);
}

const sql = postgres(url, { max: 1, prepare: false });
const dir = join(process.cwd(), "db", "migrations");

async function main() {
  await sql`create table if not exists _migrations (
    name text primary key, applied_at timestamptz not null default now()
  )`;
  const files = (await readdir(dir)).filter((f) => f.endsWith(".sql")).sort();
  const applied = new Set(
    (await sql`select name from _migrations`).map((r) => r.name)
  );
  for (const file of files) {
    if (applied.has(file)) {
      console.log(`skip   ${file}`);
      continue;
    }
    const body = await readFile(join(dir, file), "utf8");
    console.log(`apply  ${file}`);
    await sql.begin(async (tx) => {
      await tx.unsafe(body);
      await tx`insert into _migrations (name) values (${file})`;
    });
  }
  console.log("Migrations up to date.");
  await sql.end();
}

main().catch(async (err) => {
  console.error(err);
  await sql.end();
  process.exit(1);
});
