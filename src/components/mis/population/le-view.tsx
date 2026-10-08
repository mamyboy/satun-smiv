"use client";

import * as React from "react";
import { CartesianGrid, ComposedChart, ErrorBar, LineChart as RLineChart, Legend as RLegend, Line, ResponsiveContainer, Scatter, Tooltip, XAxis, YAxis } from "recharts";
import { Activity, HeartPulse, LineChart, Table2 } from "lucide-react";
import { asdr, computeLe, fyList, type PopulationData } from "@/lib/mis/population";
import { Panel, PanelHeader } from "../panel";
import { SegmentedTabs } from "../segmented-tabs";
import { CHART_MS } from "../motion";
import { FEMALE, KpiTile, MALE, SourceNote } from "./shared";
import type { Sources } from "./sources";

const y2 = (n: number) => n.toFixed(2);
const SEX_LABEL = { 1: "ชาย", 2: "หญิง", 3: "รวมเพศ" } as const;

export function LeView({ d, src }: { d: PopulationData; src: Sources }) {
  const fys = fyList(d);
  const [win, setWin] = React.useState<"3" | "1">("3");
  const [sex, setSex] = React.useState<"3" | "1" | "2">("3");
  const pooled = React.useMemo(() => (win === "3" ? fyList(d).slice(-3) : fyList(d).slice(-1)), [d, win]);
  const res = React.useMemo(
    () => ({ 1: computeLe(d, pooled, 1), 2: computeLe(d, pooled, 2), 3: computeLe(d, pooled, 3) }),
    [d, pooled],
  );
  const cur = res[Number(sex) as 1 | 2 | 3];
  const asdrRows = React.useMemo(() => asdr(d, pooled).map((r) => ({ ...r, ชาย: r.ชาย || null, หญิง: r.หญิง || null, รวม: r.รวม || null })), [d, pooled]);

  // แนวโน้ม: ค่าทางการ BOD (2562–ล่าสุด) + ค่าที่คำนวณรายปีงบจากทะเบียนราษฎร
  const trend = React.useMemo(() => {
    const years = new Set<number>([...d.bod.satun.map((r) => r.year), ...fys.map(Number)]);
    return [...years].sort().map((y) => {
      const bod = (s: number, age: number) => d.bod.satun.find((r) => r.year === y && r.sex === s && r.age === age);
      const row: Record<string, number | number[] | undefined> & { year: number } = { year: y };
      row["BOD ชาย"] = bod(1, 0)?.le;
      row["BOD หญิง"] = bod(2, 0)?.le;
      if (fys.includes(String(y))) {
        const m = computeLe(d, [String(y)], 1), fe = computeLe(d, [String(y)], 2);
        row["คำนวณ ชาย"] = m.lt.e0;
        row["คำนวณ หญิง"] = fe.lt.e0;
        row.errM = [m.lt.e0 - m.lt.ci0[0], m.lt.ci0[1] - m.lt.e0];
        row.errF = [fe.lt.e0 - fe.lt.ci0[0], fe.lt.ci0[1] - fe.lt.e0];
      }
      return row;
    });
  }, [d]); // eslint-disable-line react-hooks/exhaustive-deps

  const fyText = pooled.length > 1 ? `ปีงบ ${pooled[0]}–${pooled[pooled.length - 1]} (รวม ${pooled.length} ปี)` : `ปีงบ ${pooled[0]}`;
  const method = (
    <>
      <b>LE</b>: ตารางชีพย่อแบบ Chiang II กลุ่มอายุ 0, 1–4, 5–9 … 80–84, 85+ · อัตราตายรายกลุ่มอายุ nMx = จำนวนตาย ÷ person-years
      (ผลรวมประชากรกลางปีของทุกปีที่ใช้) · a0, a1–4 แบบ Coale-Demeny · ช่วงความเชื่อมั่น 95% จากความแปรปรวนของ Chiang ·{" "}
      <b>HALE</b>: วิธี Sullivan — HALEx = Σ Li·(1−πi) ÷ lx โดยสัดส่วนปีที่อยู่กับภาวะพร่องสุขภาพ π (อายุ &lt;60 และ ≥60)
      สอบเทียบจากค่าทางการ BOD ปี {cur.ref.year} ของจังหวัดสตูลเพศเดียวกัน (HALE/LE ที่แรกเกิดและที่อายุ 60) เพราะ HDC/ทะเบียนราษฎรไม่มีข้อมูลความชุกภาวะพร่องสุขภาพรายอายุ
    </>
  );
  const formula = `ข้อมูล: ${fyText}\nnqx = n·nMx / (1 + (n − nax)·nMx);  q(85+) = 1\nlx+n = lx·(1 − nqx);  nLx = n·lx+n + nax·ndx;  L(85+) = l85 / M85\nex = Tx / lx\nVar(ex) = Σ li²[(1−fi)·ni + ei+n]²·Var(nqi) / lx²  (+ ช่วงอายุเปิด l85²/M85⁴·Var(M85))\nπ(≥60) = 1 − HALE60/LE60 (BOD) = ${(cur.hale.piOld * 100).toFixed(2)}%\nπ(<60) = 1 − (r0·e0·l0 − T60·(1−π≥60)) / (T0 − T60) = ${(cur.hale.piYoung * 100).toFixed(2)}%   (r0 = HALE0/LE0 ของ BOD)\nประชากรกลางปี = ประชากรสัญชาติไทยในทะเบียนบ้าน ณ สิ้นเดือนมีนาคมของปีงบ\nโค้ด: src/lib/mis/life-table.ts · ทดสอบ: tests/life-table.test.mjs`;

  return (
    <div className="grid grid-cols-1 gap-4 sm:gap-5 xl:grid-cols-12">
      <Panel index={0} glass className="xl:col-span-12">
        <PanelHeader
          icon={<HeartPulse />}
          title={`อายุคาดเฉลี่ย (LE) และอายุคาดเฉลี่ยของการมีสุขภาวะ (HALE) — ${fyText}`}
          description="คำนวณจากการตายและประชากรทะเบียนราษฎร จังหวัดสตูล เทียบค่าทางการ BOD"
          actions={
            <div className="flex flex-wrap gap-2">
              <SegmentedTabs id="le-win" size="sm" value={win} onChange={setWin} items={[{ value: "3", label: "รวม 3 ปี (เสถียรกว่า)" }, { value: "1", label: "ปีล่าสุด" }]} />
              <SegmentedTabs id="le-sex" size="sm" value={sex} onChange={setSex} items={[{ value: "3", label: "รวม" }, { value: "1", label: "ชาย" }, { value: "2", label: "หญิง" }]} />
            </div>
          }
        />
        <div className="grid grid-cols-2 gap-3 px-5 pt-4 sm:px-6 lg:grid-cols-4">
          <KpiTile label={`LE แรกเกิด (${SEX_LABEL[cur.sex]})`} value={cur.lt.e0} format={y2} unit="ปี" tone="accent" hint={`95% CI ${y2(cur.lt.ci0[0])}–${y2(cur.lt.ci0[1])} · BOD ${cur.ref.year}: ${y2(cur.ref.le0)}`} />
          <KpiTile index={1} label={`HALE แรกเกิด (${SEX_LABEL[cur.sex]})`} value={cur.hale.hale0} format={y2} unit="ปี" tone="male" hint={`BOD ${cur.ref.year}: ${y2(cur.ref.hale0)} · ปีที่สูญเสียสุขภาวะ ${y2(cur.lt.e0 - cur.hale.hale0)}`} />
          <KpiTile index={2} label={`LE ที่อายุ 60 (${SEX_LABEL[cur.sex]})`} value={cur.lt.e60} format={y2} unit="ปี" tone="accent" hint={`95% CI ${y2(cur.lt.ci60[0])}–${y2(cur.lt.ci60[1])} · BOD ${cur.ref.year}: ${y2(cur.ref.le60)}`} />
          <KpiTile index={3} label={`HALE ที่อายุ 60 (${SEX_LABEL[cur.sex]})`} value={cur.hale.hale60} format={y2} unit="ปี" tone="male" hint={`BOD ${cur.ref.year}: ${y2(cur.ref.hale60)}`} />
        </div>
        <div className="mx-5 mt-4 rounded-2xl border border-[#f2d49b] bg-[#fff9ec] px-4 py-3 text-[12px] leading-relaxed text-[#7a5a12] sm:mx-6">
          <b>ข้อควรระวังในการแปลผล:</b> LE ที่คำนวณได้สูงกว่าค่าทางการ BOD ราว {y2(res[3].lt.e0 - res[3].ref.le0)} ปี เพราะสถิติการตายของทะเบียนราษฎร
          นับตาม<b>สำนักทะเบียนที่รับแจ้งตาย</b> (ผู้ป่วยสตูลที่เสียชีวิตในโรงพยาบาลต่างจังหวัด เช่น หาดใหญ่ จะไปอยู่ในสถิติจังหวัดอื่น)
          และยังไม่ได้ปรับการแจ้งตายไม่ครบ/การตายทารก ขณะที่ BOD ปรับแก้แล้ว — ใช้ค่าที่คำนวณเพื่อดู<b>แนวโน้มและความแตกต่างระหว่างเพศ</b>
          ส่วนการรายงานทางการให้ใช้ค่า BOD (คอลัมน์ขวาสุด / เส้นในกราฟแนวโน้ม)
        </div>
        <div className="mx-5 mt-4 overflow-x-auto sm:mx-6">
          <table className="w-full min-w-[560px] text-[12.5px]">
            <thead>
              <tr className="border-b border-mis-line text-mis-ink-2">
                <th className="py-2 text-left">เพศ</th><th className="text-right">ตาย (คน)</th><th className="text-right">person-years</th>
                <th className="text-right">LE0</th><th className="text-right">HALE0</th><th className="text-right">LE60</th><th className="text-right">HALE60</th>
                <th className="text-right">BOD LE0 / HALE0 ({cur.ref.year})</th>
              </tr>
            </thead>
            <tbody>
              {([1, 2, 3] as const).map((s) => (
                <tr key={s} className="border-b border-mis-line/50">
                  <td className="py-1.5 font-medium" style={{ color: s === 1 ? MALE : s === 2 ? FEMALE : undefined }}>{SEX_LABEL[s]}</td>
                  <td className="text-right tabular-nums">{res[s].lt.deaths.toLocaleString("th-TH")}</td>
                  <td className="text-right tabular-nums">{res[s].lt.personYears.toLocaleString("th-TH")}</td>
                  <td className="text-right tabular-nums font-semibold">{y2(res[s].lt.e0)}</td>
                  <td className="text-right tabular-nums">{y2(res[s].hale.hale0)}</td>
                  <td className="text-right tabular-nums">{y2(res[s].lt.e60)}</td>
                  <td className="text-right tabular-nums">{y2(res[s].hale.hale60)}</td>
                  <td className="text-right tabular-nums text-mis-muted">{y2(res[s].ref.le0)} / {y2(res[s].ref.hale0)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <SourceNote
          className="mt-4"
          source={<>{src.bora("จำนวนการตายรายอายุ (รายเดือน) + ประชากรรายอายุ")}<br />ค่าอ้างอิง/สอบเทียบ HALE: {src.bod}</>}
          method={method}
          formula={formula}
        />
      </Panel>

      <Panel index={1} className="xl:col-span-6">
        <PanelHeader icon={<LineChart />} title="แนวโน้ม LE แรกเกิด" description="ค่าทางการ BOD (เส้น) และค่าคำนวณรายปีงบจากทะเบียนราษฎร (จุด ± 95% CI)" />
        <div className="h-[340px] px-3 pt-3 sm:px-5">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={trend} margin={{ left: 0, right: 12, top: 8 }}>
              <CartesianGrid vertical={false} stroke="rgba(6,25,35,.07)" />
              <XAxis dataKey="year" tick={{ fontSize: 11, fill: "#6b7f8a" }} axisLine={false} tickLine={false} />
              <YAxis domain={["dataMin - 3", "dataMax + 3"]} tickFormatter={(v) => Number(v).toFixed(0)} tick={{ fontSize: 11, fill: "#6b7f8a" }} width={36} axisLine={false} tickLine={false} />
              <Tooltip formatter={(v) => (typeof v === "number" ? `${v.toFixed(2)} ปี` : String(v))} />
              <RLegend wrapperStyle={{ fontSize: 11.5 }} />
              <Line dataKey="BOD ชาย" stroke={MALE} strokeWidth={2} connectNulls animationDuration={CHART_MS.draw} />
              <Line dataKey="BOD หญิง" stroke={FEMALE} strokeWidth={2} connectNulls animationDuration={CHART_MS.draw} />
              <Scatter dataKey="คำนวณ ชาย" fill={MALE} shape="diamond">
                <ErrorBar dataKey="errM" width={5} stroke={MALE} direction="y" />
              </Scatter>
              <Scatter dataKey="คำนวณ หญิง" fill={FEMALE} shape="diamond">
                <ErrorBar dataKey="errF" width={5} stroke={FEMALE} direction="y" />
              </Scatter>
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        <SourceNote
          source={<>{src.bod} · {src.bora("การตายรายอายุ + ประชากรรายอายุ")}</>}
          method="เส้น = LE ทางการของ BOD จังหวัดสตูล (พ.ศ. ตามที่ BOD เผยแพร่) · จุด = ตารางชีพ Chiang II ของแต่ละปีงบเดี่ยว (ตายรายปีงบ ÷ ประชากรกลางปี) — ปีเดี่ยวมีความไม่แน่นอนสูงเพราะจำนวนตายต่อกลุ่มอายุน้อย จึงแสดง 95% CI"
        />
      </Panel>

      <Panel index={2} className="xl:col-span-6">
        <PanelHeader icon={<Table2 />} title={`ตารางชีพย่อ — ${SEX_LABEL[cur.sex]} · ${fyText}`} description="nMx, nqx, lx, nLx, ex รายกลุ่มอายุ" />
        <div className="mis-scroll mx-5 mt-4 max-h-[340px] overflow-auto rounded-2xl border border-mis-line/70 sm:mx-6">
          <table className="w-full min-w-[620px] text-[12px]">
            <thead className="sticky top-0 bg-mis-surface-2/95">
              <tr className="text-mis-ink-2">
                {["อายุ", "ตาย", "PY", "nMx", "nax", "nqx", "lx", "nLx", "ex", "95% CI"].map((h) => <th key={h} className="px-2 py-2 text-right first:text-left">{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {cur.lt.rows.map((r) => (
                <tr key={r.label} className="border-b border-mis-line/50 odd:bg-white even:bg-mis-surface-2/40">
                  <td className="px-2 py-1.5">{r.label}</td>
                  <td className="px-2 text-right tabular-nums">{r.deaths.toLocaleString("th-TH")}</td>
                  <td className="px-2 text-right tabular-nums">{r.personYears.toLocaleString("th-TH")}</td>
                  <td className="px-2 text-right tabular-nums">{r.mx.toFixed(5)}</td>
                  <td className="px-2 text-right tabular-nums">{r.ax.toFixed(2)}</td>
                  <td className="px-2 text-right tabular-nums">{r.qx.toFixed(5)}</td>
                  <td className="px-2 text-right tabular-nums">{Math.round(r.lx).toLocaleString("th-TH")}</td>
                  <td className="px-2 text-right tabular-nums">{Math.round(r.Lx).toLocaleString("th-TH")}</td>
                  <td className="px-2 text-right font-semibold tabular-nums">{r.ex.toFixed(2)}</td>
                  <td className="px-2 text-right tabular-nums text-mis-muted">{(r.ex - 1.96 * Math.sqrt(r.varEx)).toFixed(1)}–{(r.ex + 1.96 * Math.sqrt(r.varEx)).toFixed(1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <SourceNote
          source={src.bora("การตายรายอายุ + ประชากรรายอายุ")}
          method="ตาย = ผลรวมการตายรายอายุทุกเดือนในปีงบที่เลือก (ทุกสัญชาติที่แจ้งตายในจังหวัด); PY = ผลรวมประชากรกลางปี (สัญชาติไทยในทะเบียนบ้าน ณ สิ้น มี.ค.) — ข้อจำกัด: ตัวตั้งรวมทุกสัญชาติแต่ตัวหารเป็นสัญชาติไทย (ไม่ใช่ไทยราว 0.4%) อาจทำให้ LE ต่ำกว่าจริงเล็กน้อย"
          formula={formula}
        />
      </Panel>
      <Panel index={3} className="xl:col-span-12">
        <PanelHeader icon={<Activity />} title={`อัตราตายรายกลุ่มอายุ (ASDR) — ${fyText}`} description="ต่อประชากร 1,000 คน · แกนตั้งแบบลอการิทึม" />
        <div className="h-[340px] px-3 pt-3 sm:px-5">
          <ResponsiveContainer width="100%" height="100%">
            <RLineChart data={asdrRows} margin={{ left: 0, right: 16, top: 8 }}>
              <CartesianGrid vertical={false} stroke="rgba(6,25,35,.07)" />
              <XAxis dataKey="band" tick={{ fontSize: 11, fill: "#6b7f8a" }} axisLine={false} tickLine={false} interval={0} />
              <YAxis scale="log" domain={[0.05, "auto"]} allowDataOverflow tickFormatter={(v) => (Number(v) < 1 ? Number(v).toFixed(2) : Number(v).toFixed(0))} tick={{ fontSize: 11, fill: "#6b7f8a" }} width={44} axisLine={false} tickLine={false} />
              <Tooltip formatter={(v) => `${Number(v).toFixed(2)} ต่อ 1,000`} />
              <RLegend wrapperStyle={{ fontSize: 11.5 }} />
              <Line dataKey="ชาย" stroke={MALE} strokeWidth={2.2} animationDuration={CHART_MS.draw} />
              <Line dataKey="หญิง" stroke={FEMALE} strokeWidth={2.2} animationDuration={CHART_MS.draw} />
              <Line dataKey="รวม" stroke="#061923" strokeDasharray="4 3" strokeWidth={1.6} dot={false} animationDuration={CHART_MS.draw} />
            </RLineChart>
          </ResponsiveContainer>
        </div>
        <SourceNote
          source={src.bora("จำนวนการตายรายอายุ (รายเดือน) + ประชากรรายอายุ")}
          method="ASDR(กลุ่มอายุ) = จำนวนตายในกลุ่มอายุ (รวมปีงบที่เลือก) ÷ ผลรวมประชากรกลางปีกลุ่มอายุเดียวกัน × 1,000 · ใช้กลุ่มอายุเดียวกับตารางชีพ (0, 1–4, 5–9 … 85+) · ข้อจำกัดเดียวกับ LE: การตายนับตามสำนักทะเบียนที่รับแจ้ง กลุ่มที่มีอัตรา 0 (ไม่มีผู้ตาย) จะไม่แสดงจุดบนแกนลอการิทึม"
          formula={"nMx × 1,000 = Σ ตาย ÷ Σ ประชากรกลางปี × 1,000   (เท่ากับคอลัมน์ nMx ในตารางชีพ × 1,000)"}
        />
      </Panel>
    </div>
  );
}
