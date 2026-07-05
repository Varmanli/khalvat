import { config } from "dotenv";
import { createHash } from "node:crypto";
import postgres from "postgres";

config({ path: ".env.local" });
config();

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set.");
}

const GANJOOR_BASE_URL = "https://api.ganjoor.net";
const DEFAULT_IMPORT_POET_IDS = [2, 3, 5, 7, 22, 25, 26, 28, 29, 31, 32, 33, 34, 35, 40, 41];
const sql = postgres(process.env.DATABASE_URL);

function normalizeText(text) {
  return String(text ?? "")
    .replace(/\r/g, "")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function buildTextHash(text) {
  return createHash("sha256").update(normalizeText(text)).digest("hex");
}

function buildExcerpt(text) {
  const normalized = normalizeText(text);
  const lines = normalized.split("\n").filter(Boolean).slice(0, 2);
  return lines.join("\n").trim() || normalized.slice(0, 220);
}

function inferPoetName(fullTitle) {
  if (!fullTitle) return "بی‌نام";
  const [poet] = String(fullTitle)
    .split("»")
    .map((part) => part.trim())
    .filter(Boolean);
  return poet || "بی‌نام";
}

function inferPoetSlug(fullUrl) {
  if (!fullUrl) return null;
  const parts = String(fullUrl).split("/").filter(Boolean);
  return parts[0] || null;
}

async function getJson(path) {
  try {
    const res = await fetch(`${GANJOOR_BASE_URL}${path}`, { cache: "no-store" });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

async function fetchPoetRootCat(poetId) {
  const data = await getJson(`/api/ganjoor/poet/${poetId}`);
  return data?.cat ?? null;
}

async function fetchCat(catId) {
  const data = await getJson(`/api/ganjoor/cat/${catId}?poems=true`);
  return data?.cat ?? null;
}

async function collectPoemIds(catId, set = new Set(), visited = new Set()) {
  if (visited.has(catId)) return set;
  visited.add(catId);

  const cat = await fetchCat(catId);
  if (!cat) return set;

  for (const poem of cat.poems ?? []) {
    if (typeof poem?.id === "number") set.add(poem.id);
  }
  for (const child of cat.children ?? []) {
    if (typeof child?.id === "number") {
      await collectPoemIds(child.id, set, visited);
    }
  }
  return set;
}

async function buildPoemIdPool() {
  const poetIds = [...DEFAULT_IMPORT_POET_IDS];

  const poemIds = new Set();
  const perPoetPoemIds = {};
  for (const poetId of poetIds) {
    const rootCat = await fetchPoetRootCat(poetId);
    if (typeof rootCat?.id === "number") {
      const ids = [...(await collectPoemIds(rootCat.id))];
      perPoetPoemIds[poetId] = ids;
      for (const id of ids) poemIds.add(id);
    }
  }

  const interleavedPoemIds = [];
  const maxLength = Math.max(...Object.values(perPoetPoemIds).map((ids) => ids.length), 0);
  for (let index = 0; index < maxLength; index++) {
    for (const poetId of poetIds) {
      const poemId = perPoetPoemIds[poetId]?.[index];
      if (typeof poemId === "number") interleavedPoemIds.push(poemId);
    }
  }

  return {
    poetIds,
    poemIds: interleavedPoemIds.filter((id, index, arr) => arr.indexOf(id) === index),
  };
}

async function fetchPoemById(poemId) {
  const data = await getJson(`/api/ganjoor/poem/${poemId}`);
  const plainText = normalizeText(data?.plainText);
  if (!plainText) return null;

  return {
    ganjoorPoemId: typeof data?.id === "number" ? data.id : poemId,
    textHash: buildTextHash(plainText),
    poetName: inferPoetName(data?.fullTitle),
    poetSlug: inferPoetSlug(data?.fullUrl),
    title: data?.title ?? null,
    plainText,
    excerpt: buildExcerpt(plainText),
    sourceUrl: data?.fullUrl ? `https://ganjoor.net${data.fullUrl}` : null,
  };
}

async function getStats() {
  const [total] = await sql`select count(*)::int as count from poems`;
  const [active] = await sql`select count(*)::int as count from poems where is_active = true`;
  const [uniqueGanjoor] = await sql`select count(distinct ganjoor_poem_id)::int as count from poems where ganjoor_poem_id is not null`;
  const [uniqueHash] = await sql`select count(distinct text_hash)::int as count from poems`;
  return {
    totalPoems: total?.count ?? 0,
    activePoems: active?.count ?? 0,
    uniqueGanjoorPoemIds: uniqueGanjoor?.count ?? 0,
    uniqueTextHashes: uniqueHash?.count ?? 0,
  };
}

async function main() {
  const targetUniqueCount = Math.max(1, parseInt(process.argv[2] ?? "50", 10));
  const maxAttempts = Math.max(
    targetUniqueCount * 20,
    parseInt(process.argv[3] ?? String(targetUniqueCount * 20), 10),
  );

  const pool = await buildPoemIdPool();
  if (pool.poemIds.length === 0) {
    throw new Error("No Ganjoor poem IDs could be discovered for import.");
  }

  let successfulInserts = 0;
  let duplicateSkips = 0;
  let failedFetches = 0;
  let attempts = 0;
  let cursor = 0;

  while (
    successfulInserts < targetUniqueCount &&
    attempts < maxAttempts &&
    pool.poemIds.length > 0
  ) {
    attempts++;
    const poemId = pool.poemIds[cursor % pool.poemIds.length];
    cursor++;

    const poem = await fetchPoemById(poemId);
    if (!poem) {
      failedFetches++;
      continue;
    }

    const inserted = await sql`
      insert into poems (
        ganjoor_poem_id,
        text_hash,
        poet_name,
        poet_slug,
        title,
        plain_text,
        excerpt,
        source_url,
        tags,
        mood,
        is_active
      ) values (
        ${poem.ganjoorPoemId},
        ${poem.textHash},
        ${poem.poetName},
        ${poem.poetSlug},
        ${poem.title},
        ${poem.plainText},
        ${poem.excerpt},
        ${poem.sourceUrl},
        ${null},
        ${null},
        true
      )
      on conflict do nothing
      returning id
    `;

    if (inserted.length > 0) {
      successfulInserts++;
      console.log(
        `Imported ${successfulInserts}/${targetUniqueCount}: ${poem.poetName}${poem.title ? ` — ${poem.title}` : ""}`,
      );
    } else {
      duplicateSkips++;
    }
  }

  const stats = await getStats();
  console.log(
    JSON.stringify(
      {
        targetUniqueCount,
        maxAttempts,
        sourcePoetCount: pool.poetIds.length,
        sourcePoemIdPoolSize: pool.poemIds.length,
        attempts,
        successfulInserts,
        duplicateSkips,
        failedFetches,
        ...stats,
      },
      null,
      2,
    ),
  );

  if (successfulInserts < targetUniqueCount) {
    console.warn(
      `Target not fully reached. Imported ${successfulInserts} unique poems out of requested ${targetUniqueCount}.`,
    );
  }

  await sql.end();
}

main().catch(async (error) => {
  console.error(error);
  await sql.end({ timeout: 1 }).catch(() => {});
  process.exit(1);
});
