// Unit tests: ตารางชีพ Chiang II + HALE Sullivan  (รัน: node --test tests/life-table.test.mjs)
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { LT_GROUPS, groupSingleAges, infantAx, lifeTable, sullivanHale } from "../src/lib/mis/life-table.ts";

const K = LT_GROUPS.length;

test("กลุ่มอายุ 19 กลุ่ม และรวมรายอายุเดี่ยวได้ครบไม่ตกหล่น", () => {
  assert.equal(K, 19);
  const single = Array.from({ length: 101 }, (_, i) => i + 1);
  const g = groupSingleAges(single);
  assert.equal(g.reduce((a, b) => a + b, 0), single.reduce((a, b) => a + b, 0));
  assert.equal(g[0], 1); // อายุ 0
  assert.equal(g[1], 2 + 3 + 4 + 5); // 1–4
});

test("อัตราตายคงที่ m → e0 ≈ 1/m (ประชากรแบบ exponential)", () => {
  const m = 0.02;
  const py = Array(K).fill(1e7);
  const d = py.map((p) => p * m);
  const lt = lifeTable(d, py, 2);
  // ช่วงอายุ ax = n/2 ทำให้คลาดจาก 1/m เล็กน้อย — ยอมรับ ±0.5 ปี
  assert.ok(Math.abs(lt.e0 - 1 / m) < 0.5, `e0=${lt.e0}`);
  assert.ok(Math.abs(lt.rows[K - 1].ex - 1 / m) < 1e-9, "ช่วงอายุเปิด e = 1/M");
});

test("โครงสร้างตารางชีพถูกต้อง: l0 = radix, Σdx = l0, qx ∈ [0,1], ex ลดลงตามอายุช่วงผู้ใหญ่", () => {
  const py = [3000, 13000, ...Array(16).fill(20000), 4000];
  const d = [12, 3, ...Array.from({ length: 16 }, (_, i) => Math.round(2 * Math.exp(0.09 * i * 5) )), 600];
  const lt = lifeTable(d, py, 3);
  assert.equal(lt.rows[0].lx, 100000);
  const sumD = lt.rows.reduce((a, r) => a + r.dx, 0);
  assert.ok(Math.abs(sumD - 100000) < 1e-6);
  lt.rows.forEach((r) => assert.ok(r.qx >= 0 && r.qx <= 1));
  assert.ok(lt.e60 < lt.e0);
  assert.ok(lt.ci0[0] < lt.e0 && lt.e0 < lt.ci0[1], "CI ครอบค่า e0");
});

test("a0 Coale-Demeny ตามเพศ", () => {
  assert.equal(infantAx(0.2, 1).a0, 0.33);
  assert.ok(Math.abs(infantAx(0.01, 2).a0 - (0.053 + 0.028)) < 1e-12);
});

test("Sullivan: π=0 → HALE = LE และสอบเทียบแล้วคืนอัตราส่วน HALE/LE ตามค่าอ้างอิงที่แรกเกิด/60 ปี", () => {
  const py = [3000, 13000, ...Array(16).fill(20000), 4000];
  const d = [12, 3, ...Array.from({ length: 16 }, (_, i) => Math.round(2 * Math.exp(0.09 * i * 5))), 600];
  const lt = lifeTable(d, py, 1);
  const same = sullivanHale(lt, { le0: 70, hale0: 70, le60: 20, hale60: 20 });
  assert.ok(Math.abs(same.hale0 - lt.e0) < 1e-9);
  const ref = { le0: 72.7, hale0: 66.6, le60: 20.1, hale60: 16.2 };
  const h = sullivanHale(lt, ref);
  assert.ok(Math.abs(h.hale0 / lt.e0 - ref.hale0 / ref.le0) < 1e-9, "สัดส่วนที่แรกเกิดตรงค่าอ้างอิง");
  assert.ok(Math.abs(h.hale60 / lt.e60 - ref.hale60 / ref.le60) < 1e-9, "สัดส่วนที่ 60 ปีตรงค่าอ้างอิง");
});

test("ข้อมูลจริงทะเบียนราษฎร จ.สตูล: e0 อยู่ในช่วงสมเหตุสมผลใกล้ค่า BOD", () => {
  const data = JSON.parse(readFileSync(new URL("../public/data/mis/population.json", import.meta.url), "utf8"));
  const fys = ["2567", "2568", "2569"];
  for (const sex of ["1", "2"]) {
    const D = Array(K).fill(0), P = Array(K).fill(0);
    for (const fy of fys) {
      groupSingleAges(data.bora.deathsFY[fy][sex]).forEach((v, i) => (D[i] += v));
      groupSingleAges(data.bora.midyearFY[fy][sex]).forEach((v, i) => (P[i] += v));
    }
    const lt = lifeTable(D, P, Number(sex));
    const bod = data.bod.satun.find((r) => r.year === 2567 && r.age === 0 && r.sex === Number(sex));
    assert.ok(lt.e0 > 60 && lt.e0 < 90, `e0=${lt.e0}`);
    assert.ok(Math.abs(lt.e0 - bod.le) < 6, `เพศ ${sex}: e0=${lt.e0.toFixed(2)} vs BOD ${bod.le}`);
  }
});
