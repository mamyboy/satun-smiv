// node --test tests/indicator-history.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  aggregateWeekly,
  formatWeekRange,
  mergeSnapshot,
  parseThaiDate,
  weekStartOf,
  withRunDeltas,
} from "../src/lib/indicator-history.ts";

const snap = (iso, extractedAt, values) => ({ processedDateISO: iso, processedDate: iso, extractedAt, values });

test("parseThaiDate converts Buddhist-era Thai date to ISO", () => {
  assert.equal(parseThaiDate("06 ตุลาคม 2569"), "2026-10-06");
  assert.equal(parseThaiDate("1 มกราคม 2570"), "2027-01-01");
  assert.equal(parseThaiDate("garbage"), null);
  assert.equal(parseThaiDate(null), null);
});

test("weekStartOf returns Monday", () => {
  assert.equal(weekStartOf("2026-10-06"), "2026-10-05"); // Tue -> Mon
  assert.equal(weekStartOf("2026-10-05"), "2026-10-05"); // Mon
  assert.equal(weekStartOf("2026-10-11"), "2026-10-05"); // Sun
  assert.equal(formatWeekRange("2026-10-05", "2026-10-11"), "5 ต.ค. – 11 ต.ค. 69");
});

test("mergeSnapshot dedupes by processed date, latest extraction wins, sorted", () => {
  let s = [];
  s = mergeSnapshot(s, snap("2026-09-20", "2026-09-21T01:00:00Z", [1]));
  s = mergeSnapshot(s, snap("2026-09-14", "2026-09-14T01:00:00Z", [0]));
  s = mergeSnapshot(s, snap("2026-09-20", "2026-09-21T02:00:00Z", [2]));
  s = mergeSnapshot(s, snap("2026-09-20", "2026-09-20T00:00:00Z", [9])); // older extraction ignored
  assert.deepEqual(s.map((x) => [x.processedDateISO, x.values[0]]), [["2026-09-14", 0], ["2026-09-20", 2]]);
});

test("aggregateWeekly keeps last run per week and computes deltas vs previous week", () => {
  const weeks = aggregateWeekly([
    snap("2026-09-27", "a", [308, 8.78]), // Sun -> week of 21 Sep
    snap("2026-09-21", "a", [296, 6.97]),
    snap("2026-09-28", "a", [308, 8.87]), // Mon -> week of 28 Sep
    snap("2026-10-06", "a", [314, 8.96]),
  ]);
  assert.deepEqual(weeks.map((w) => [w.weekStart, w.runs]), [["2026-09-21", 2], ["2026-09-28", 1], ["2026-10-05", 1]]);
  assert.equal(weeks[0].delta, null);
  assert.deepEqual(weeks[0].snapshot.values, [308, 8.78]);
  assert.deepEqual(weeks[1].delta, [0, 0.09]);
  assert.deepEqual(weeks[2].delta, [6, 0.09]);
});

test("withRunDeltas diffs consecutive runs", () => {
  const runs = withRunDeltas([snap("2026-09-02", "a", [5]), snap("2026-09-01", "a", [3])]);
  assert.equal(runs[0].delta, null);
  assert.deepEqual(runs[1].delta, [2]);
});

test("committed indicator2 history is valid and sorted", () => {
  const h = JSON.parse(readFileSync(new URL("../amphoe-data/indicator2/history.json", import.meta.url), "utf8"));
  assert.equal(h.key, "indicator2");
  assert.ok(h.snapshots.length >= 2);
  const dates = h.snapshots.map((s) => s.processedDateISO);
  assert.deepEqual(dates, [...dates].sort());
  assert.equal(new Set(dates).size, dates.length);
  for (const s of h.snapshots) assert.equal(s.values.length, 14);
});
