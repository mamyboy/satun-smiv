#!/usr/bin/env node
/**
 * record-history.mjs — เก็บ snapshot ของตัวชี้วัดทุกครั้งที่ประมวลผล ลง amphoe-data/<key>/history.json
 *
 * Usage:
 *   node scripts/record-history.mjs                 # snapshot data.json ปัจจุบันของทุก key ใน HISTORY_KEYS
 *   node scripts/record-history.mjs indicator2      # เฉพาะ key ที่ระบุ
 *   node scripts/record-history.mjs --backfill      # สร้างย้อนหลังจาก git history ของ data.json
 *
 * 1 วันประมวลผล HDC (processedDate) = 1 snapshot; ถ้าดึงซ้ำวันเดียวกัน ค่าล่าสุดทับของเดิม
 */
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { mergeSnapshot, parseThaiDate } from "../src/lib/indicator-history.ts";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const HISTORY_KEYS = ["indicator2"];

const args = process.argv.slice(2);
const backfill = args.includes("--backfill");
const keys = args.filter((a) => !a.startsWith("--"));

function toSnapshot(data) {
  const row = data.dataRows?.find((r) => r.area !== "รวม") ?? data.dataRows?.[0];
  if (!row || !Array.isArray(row.values) || !data.extractedAt) return null;
  const processedDateISO = parseThaiDate(data.processedDate) ?? data.extractedAt.slice(0, 10);
  return {
    processedDateISO,
    processedDate: data.processedDate ?? processedDateISO,
    extractedAt: data.extractedAt,
    values: row.values,
  };
}

function loadHistory(key, reportCode) {
  const file = join(ROOT, "amphoe-data", key, "history.json");
  if (existsSync(file)) return { file, history: JSON.parse(readFileSync(file, "utf8")) };
  return { file, history: { key, reportCode, snapshots: [] } };
}

function gitVersions(relPath) {
  const shas = execFileSync("git", ["log", "--format=%H", "--", relPath], { cwd: ROOT, encoding: "utf8" })
    .split("\n")
    .filter(Boolean);
  const out = [];
  for (const sha of shas) {
    try {
      out.push(JSON.parse(execFileSync("git", ["show", `${sha}:${relPath}`], { cwd: ROOT, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 })));
    } catch {
      /* ไฟล์เสีย/ไม่มีใน commit นั้น — ข้าม */
    }
  }
  return out;
}

for (const key of keys.length ? keys : HISTORY_KEYS) {
  const rel = join("amphoe-data", key, "data.json");
  const current = JSON.parse(readFileSync(join(ROOT, rel), "utf8"));
  const { file, history } = loadHistory(key, current.reportCode);
  const sources = backfill ? [...gitVersions(rel), current] : [current];

  let snapshots = history.snapshots;
  let skipped = 0;
  for (const data of sources) {
    if (data.reportCode && data.reportCode !== history.reportCode) { skipped++; continue; }
    const s = toSnapshot(data);
    if (s) snapshots = mergeSnapshot(snapshots, s);
    else skipped++;
  }
  history.snapshots = snapshots;
  writeFileSync(file, JSON.stringify(history, null, 2) + "\n");
  const last = snapshots.at(-1);
  console.log(`[history] ${key}: ${snapshots.length} snapshot(s)${skipped ? `, skipped ${skipped}` : ""} · ล่าสุด ${last?.processedDate ?? "-"} -> ${file}`);
}
