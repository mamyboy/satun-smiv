"use client";

import * as React from "react";
import { Bar, CartesianGrid, ComposedChart, Legend as RLegend, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { GitCompareArrows, Map as MapIcon, Users } from "lucide-react";
import { fmtNum } from "@/lib/mis/format";
import { AGE_BANDS, boraByAmp, boraSummary, hdcByTambon, hdcSummary, type Filters, type PopulationData } from "@/lib/mis/population";
import { Panel, PanelHeader } from "../panel";
import { SegmentedTabs } from "../segmented-tabs";
import { CHART_MS } from "../motion";
import { FEMALE, KpiTile, Legend, MALE, PctBar, PopulationPyramid, SortTable, SourceNote } from "./shared";
import type { Sources } from "./sources";

const pct1 = (n: number) => n.toFixed(1);

export function CompareView({ d, f, src }: { d: PopulationData; f: Filters; src: Sources }) {
  const base: Filters = { ...f, hosps: [], hostypes: [], nats: ["099"] }; // ทะเบียนราษฎรเทียบได้เฉพาะสัญชาติไทย
  const h13 = React.useMemo(() => hdcSummary(d, { ...base, typeSet: "13" }), [d, f]); // eslint-disable-line react-hooks/exhaustive-deps
  const h12 = React.useMemo(() => hdcSummary(d, { ...base, typeSet: "12" }), [d, f]); // eslint-disable-line react-hooks/exhaustive-deps
  const b = React.useMemo(() => boraSummary(d, base), [d, f]); // eslint-disable-line react-hooks/exhaustive-deps
  const [set, setSet] = React.useState<"13" | "12">("12");
  const [pct, setPct] = React.useState(true);
  const h = set === "13" ? h13 : h12;

  const pyr = h.pyramid.map((r, i) => ({ ...r, rm: b.pyramid[i].m, rf: b.pyramid[i].f }));
  const ageCov = AGE_BANDS.map((band, i) => {
    const bt = b.pyramid[i].m + b.pyramid[i].f;
    return {
      band,
      "TYPEAREA 1,3": bt ? ((h13.pyramid[i].m + h13.pyramid[i].f) / bt) * 100 : 0,
      "TYPEAREA 1,2": bt ? ((h12.pyramid[i].m + h12.pyramid[i].f) / bt) * 100 : 0,
    };
  });

  const ampRows = React.useMemo(() => {
    const bora = boraByAmp(d);
    const ages = (s: { "1": number[]; "2": number[] }) => {
      let n = 0;
      for (const k of ["1", "2"] as const) {
        if (f.sexes.length && !f.sexes.includes(Number(k) as 1 | 2)) continue;
        for (let a = f.ageMin; a <= f.ageMax; a++) n += s[k][a] ?? 0;
      }
      return n;
    };
    return d.hdc.amp
      .filter((a) => !f.amps.length || f.amps.includes(a.code))
      .map((a) => {
        const one = { ...base, amps: [a.code] };
        const x13 = hdcSummary(d, { ...one, typeSet: "13" }, "amp").total;
        const x12 = hdcSummary(d, { ...one, typeSet: "12" }, "amp").total;
        const bb = ages(bora.find((r) => r.code === a.code)!.single);
        return { name: a.name, bora: bb, h13: x13, h12: x12, c13: bb ? (x13 / bb) * 100 : 0, c12: bb ? (x12 / bb) * 100 : 0, gap12: x12 - bb };
      });
  }, [d, f]); // eslint-disable-line react-hooks/exhaustive-deps

  const tmbRows = React.useMemo(() => {
    const hdcT = hdcByTambon(d, base);
    return Object.entries(d.bora.tambon)
      .filter(([, t]) => !f.amps.length || f.amps.includes(t.amp))
      .map(([code, t]) => {
        let bb = 0;
        for (const k of ["1", "2"] as const) {
          if (f.sexes.length && !f.sexes.includes(Number(k) as 1 | 2)) continue;
          for (let a = f.ageMin; a <= f.ageMax; a++) bb += t[k][a] ?? 0;
        }
        const ht = hdcT.find((x) => x.code === code);
        const hh = ht ? ht.m + ht.f : 0;
        return { name: t.name, amp: d.hdc.amp.find((a) => a.code === t.amp)?.name ?? t.amp, bora: bb, hdc: hh, cov: bb ? (hh / bb) * 100 : 0, gap: hh - bb };
      });
  }, [d, f]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="grid grid-cols-1 gap-4 sm:gap-5 xl:grid-cols-12">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:col-span-12 xl:grid-cols-6">
        <KpiTile index={0} label={`ทะเบียนราษฎร (${src.boraMonth})`} value={b.total} unit="คน" />
        <KpiTile index={1} label="HDC TYPEAREA 1,2" value={h12.total} unit="คน" tone="accent" />
        <KpiTile index={2} label="HDC 1,2 ÷ ทะเบียนราษฎร" value={b.total ? (h12.total / b.total) * 100 : null} format={pct1} unit="%" tone="accent" hint={`ส่วนต่าง ${fmtNum(h12.total - b.total)} คน`} />
        <KpiTile index={3} label="HDC TYPEAREA 1,3" value={h13.total} unit="คน" tone="male" />
        <KpiTile index={4} label="HDC 1,3 ÷ ทะเบียนราษฎร" value={b.total ? (h13.total / b.total) * 100 : null} format={pct1} unit="%" tone="male" hint={`ส่วนต่าง ${fmtNum(h13.total - b.total)} คน`} />
        <KpiTile index={5} label="ผลต่าง HDC 1,2 − 1,3" value={h12.total - h13.total} unit="คน" tone="amber" hint="สุทธิ: มีชื่อในทะเบียนบ้านแต่ไม่อยู่จริง (2) หักคนมาอาศัย (3)" />
      </div>
      <Panel index={1} className="xl:col-span-12">
        <SourceNote
          className="mt-5"
          source={<>{src.hdc()}<br />{src.bora()}</>}
          method={<>ความครอบคลุม (%) = ประชากร HDC ÷ ประชากรทะเบียนราษฎรสัญชาติไทยในทะเบียนบ้าน × 100 · HDC ระดับจังหวัดนับ CID ไม่ซ้ำ, ระดับอำเภอนับ CID ไม่ซ้ำภายในอำเภอ · TYPEAREA 1,2 (มีชื่อตามทะเบียนบ้านในเขต) มีนิยามใกล้กับทะเบียนราษฎรที่สุด จึงเป็นคู่เทียบหลัก; TYPEAREA 1,3 (อยู่จริง) ใช้ดูสัดส่วนคนที่อยู่จริงเทียบทะเบียน · ตัวกรองหน่วยบริการไม่ใช้ในหน้านี้ เพราะทะเบียนราษฎรไม่มีมิติหน่วยบริการ</>}
        />
      </Panel>

      <Panel index={2} className="xl:col-span-7">
        <PanelHeader
          icon={<Users />}
          title="พีระมิดซ้อน: HDC (แท่ง) เทียบทะเบียนราษฎร (เส้น)"
          description="เส้นทึบ = ชาย, เส้นประ = หญิง ของทะเบียนราษฎร"
          actions={
            <div className="flex flex-wrap gap-2">
              <SegmentedTabs id="cmp-set" size="sm" value={set} onChange={setSet} items={[{ value: "12", label: "HDC 1,2" }, { value: "13", label: "HDC 1,3" }]} />
              <SegmentedTabs id="cmp-pct" size="sm" value={pct ? "pct" : "n"} onChange={(v) => setPct(v === "pct")} items={[{ value: "pct", label: "ร้อยละ" }, { value: "n", label: "จำนวน" }]} />
            </div>
          }
        />
        <div className="px-3 pt-3 sm:px-5">
          <Legend items={[{ label: "HDC ชาย", color: MALE }, { label: "HDC หญิง", color: FEMALE }, { label: "ทะเบียนราษฎร ชาย", color: "#061923" }, { label: "ทะเบียนราษฎร หญิง", color: "#061923", dashed: true }]} />
          <PopulationPyramid data={pyr} pct={pct} height={560} barName={["HDC ชาย", "HDC หญิง"]} refName={["ทะเบียนราษฎร ชาย", "ทะเบียนราษฎร หญิง"]} />
        </div>
        <SourceNote
          source={<>{src.hdc()} · {src.bora()}</>}
          method="แบบร้อยละ: แต่ละแหล่งหารด้วยประชากรรวมของตัวเอง (เปรียบเทียบ 'รูปร่าง' โครงสร้างอายุ) · แบบจำนวน: เทียบจำนวนคนตรง ๆ; กลุ่มอายุ 5 ปีเดียวกันทั้งสองแหล่ง"
        />
      </Panel>

      <Panel index={3} className="xl:col-span-5">
        <PanelHeader icon={<GitCompareArrows />} title="ความครอบคลุมรายกลุ่มอายุ" description="HDC ÷ ทะเบียนราษฎร × 100 (เส้น 100% = เท่ากัน)" />
        <div className="h-[560px] px-3 pt-3 sm:px-5">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={[...ageCov].reverse()} layout="vertical" margin={{ left: 4, right: 16 }}>
              <CartesianGrid horizontal={false} stroke="rgba(6,25,35,.07)" />
              <XAxis type="number" domain={[0, (max: number) => Math.max(120, Math.ceil(max / 10) * 10)]} tickFormatter={(v) => `${v}%`} tick={{ fontSize: 11, fill: "#6b7f8a" }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="band" width={52} tick={{ fontSize: 11, fill: "#3d5260" }} axisLine={false} tickLine={false} interval={0} />
              <Tooltip formatter={(v) => `${Number(v).toFixed(1)}%`} />
              <RLegend wrapperStyle={{ fontSize: 11.5 }} />
              <ReferenceLine x={100} stroke="#061923" strokeDasharray="4 3" />
              <Bar dataKey="TYPEAREA 1,2" fill="#02b8c8" radius={[0, 4, 4, 0]} animationDuration={CHART_MS.grow} />
              <Bar dataKey="TYPEAREA 1,3" fill="#7a6ff0" radius={[0, 4, 4, 0]} animationDuration={CHART_MS.grow} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        <SourceNote source={<>{src.hdc()} · {src.bora()}</>} method="ต่อกลุ่มอายุ 5 ปี: จำนวน HDC (CID ไม่ซ้ำ) ÷ จำนวนทะเบียนราษฎร × 100 — ค่าเกิน 100% แปลว่า HDC บันทึกมากกว่าทะเบียน (เช่น ยังไม่จำหน่ายคนที่ย้าย/เสียชีวิต)" />
      </Panel>

      <Panel index={4} className="xl:col-span-6">
        <PanelHeader icon={<MapIcon />} title="เปรียบเทียบรายอำเภอ" description="HDC ตัดซ้ำ CID ภายในอำเภอ vs ทะเบียนราษฎร" />
        <div className="px-5 pt-4 sm:px-6">
          <SortTable
            rows={ampRows}
            initialSort={{ key: "c12", dir: 1 }}
            columns={[
              { key: "name", label: "อำเภอ" },
              { key: "bora", label: "ทะเบียนราษฎร", num: true },
              { key: "h12", label: "HDC 1,2", num: true },
              { key: "c12", label: "% 1,2", num: true, render: (r) => <PctBar pct={r.c12} /> },
              { key: "h13", label: "HDC 1,3", num: true },
              { key: "c13", label: "% 1,3", num: true, render: (r) => <PctBar pct={r.c13} warn={70} /> },
              { key: "gap12", label: "ส่วนต่าง 1,2", num: true, render: (r) => <span className={r.gap12 < 0 ? "text-[#c8414f]" : "text-[#1f8a6e]"}>{r.gap12 > 0 ? "+" : ""}{fmtNum(r.gap12)}</span> },
            ]}
          />
        </div>
        <SourceNote
          source={<>{src.hdc("person, chospital, campur")} · {src.bora("ระดับสำนักทะเบียน")}</>}
          method="HDC: อำเภอจาก chospital ของหน่วยบริการ (HOSPCODE+PID → อำเภอ → CID ไม่ซ้ำในอำเภอ); ทะเบียนราษฎร: รวมสำนักทะเบียนอำเภอ + เทศบาลในอำเภอเดียวกัน · แถบสีแดง = ความครอบคลุมต่ำกว่าเกณฑ์ (1,2 < 90% หรือ > 110%; 1,3 < 70%)"
        />
      </Panel>

      <Panel index={5} className="xl:col-span-6">
        <PanelHeader icon={<MapIcon />} title="เปรียบเทียบรายตำบล (TYPEAREA 1,3 ตามที่อยู่)" description="HDC ตามที่อยู่แฟ้ม home vs ทะเบียนราษฎรรายตำบล" />
        <div className="px-5 pt-4 sm:px-6">
          <SortTable
            rows={tmbRows}
            maxHeight={420}
            initialSort={{ key: "cov", dir: 1 }}
            columns={[
              { key: "name", label: "ตำบล" },
              { key: "amp", label: "อำเภอ" },
              { key: "bora", label: "ทะเบียนราษฎร", num: true },
              { key: "hdc", label: "HDC 1,3", num: true },
              { key: "cov", label: "%", num: true, render: (r) => <PctBar pct={r.cov} warn={70} /> },
            ]}
          />
        </div>
        <SourceNote
          source={<>{src.hdc("person, home, cvillage")} · {src.bora("ระดับตำบล")}</>}
          method="HDC: TYPEAREA 1,3 ตามที่อยู่ในแฟ้ม home นับ CID ไม่ซ้ำภายในตำบล; ทะเบียนราษฎร: รวมตำบลเดียวกันจากทุกสำนักทะเบียน; จับคู่ด้วยรหัสตำบล 6 หลัก (จว.+อ.+ต.)"
        />
      </Panel>
    </div>
  );
}
