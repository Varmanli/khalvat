import assert from "node:assert/strict";
import test from "node:test";
import { resolveStatsRange } from "../lib/statistics-range";

const now = new Date("2026-09-05T09:00:00+03:30");
test("statistics ranges use Tehran date keys, Jalali calendar boundaries, and safe fallbacks", () => {
  assert.deepEqual(resolveStatsRange("week", now).granularity, "day");
  assert.equal(resolveStatsRange("week", now).start, "2026-09-05");
  assert.equal(resolveStatsRange("month", now).start, "2026-08-23");
  assert.equal(resolveStatsRange("3m", now).granularity, "week");
  assert.equal(resolveStatsRange("6m", now).granularity, "week");
  assert.equal(resolveStatsRange("year", now).start, "2026-03-21");
  assert.equal(resolveStatsRange("year", now).granularity, "month");
  assert.equal(resolveStatsRange("all", now).granularity, "month");
  assert.equal(resolveStatsRange("all", now).previous, undefined);
  assert.equal(resolveStatsRange("unknown", now).key, "month");
});
