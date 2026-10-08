"use client";

import * as React from "react";
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Building2, Droplet, Home, PieChart, Target, Users } from "lucide-react";
import { fmtNum } from "@/lib/mis/format";
import {
  TARGET_GROUPS, TYPESET_LABEL, hdcAttr, hdcByAmp, hdcByHosp, hdcByTambon, hdcSummary, indices, targetCount,
  type Filters, type PopulationData,
} from "@/lib/mis/population";
import { Panel, PanelHeader } from "../panel";
import { SegmentedTabs } from "../segmented-tabs";
import { CHART_MS, SERIES_COLORS } from "../motion";
import { FEMALE, KpiTile, Legend, MALE, PopulationPyramid, SortTable, SourceNote } from "./shared";
import type { Sources } from "./sources";

const pct1 = (n: number) => `${n.toFixed(1)}`;

export function HdcView({ d, f, src }: { d: PopulationData; f: Filters; src: Sources }) {
  const sum = React.useMemo(() => hdcSummary(d, f), [d, f]);
  const idx = React.useMemo(() => indices(hdcSummary(d, { ...f, ageMin: 0, ageMax: 100 }).single), [d, f]);
  const byAmp = React.useMemo(() => hdcByAmp(d, f), [d, f]);
  const byHosp = React.useMemo(() => hdcByHosp(d, f), [d, f]);
  const tambons = React.useMemo(() => hdcByTambon(d, f), [d, f]);
  const [pct, setPct] = React.useState(false);
  const [attrKey, setAttrKey] = React.useState("religion");
  const attr = React.useMemo(() => hdcAttr(d, f, attrKey), [d, f, attrKey]);
  const [tmbSel, setTmbSel] = React.useState<string | null>(null);
  const tmb = tambons.find((t) => t.code === tmbSel) ?? null;

  const measureText =
    sum.level === "prov"
      ? `นับ CID ไม่ซ้ำทั้งจังหวัด (COUNT DISTINCT CID) — ${TYPESET_LABEL[f.typeSet]}`
      : sum.level === "amp"
        ? `HOSPCODE+PID → map หน่วยบริการเข้าอำเภอ (chospital → campur) แล้วนับ CID ไม่ซ้ำภายในอำเภอที่เลือก — ${TYPESET_LABEL[f.typeSet]}`
        : `นับ HOSPCODE+PID ของหน่วยบริการที่เลือก (คนเดียวอยู่หลายหน่วยนับทุกหน่วย) — ${TYPESET_LABEL[f.typeSet]}`;
  const sqlFormula = `-- scripts/sql/mis-population-hdc.sql\nWHERE ${src.commonWhere}\n  AND TYPEAREA IN (${f.typeSet === "13" ? "'1','3'" : "'1','2'"})\nINNER JOIN chospital ch ON ch.HOSCODE = p.HOSPCODE\nINNER JOIN campur ca ON ca.AMPURCODEFULL = CONCAT(ch.PROVCODE, ch.DISTCODE)\nจังหวัด : ROW_NUMBER() OVER (PARTITION BY CID ...) = 1\nอำเภอ   : ROW_NUMBER() OVER (PARTITION BY CID, DISTCODE ...) = 1\nหน่วย   : COUNT(*) ต่อ HOSPCODE+PID\n${src.repRule}\n${src.ageRule}`;

  return (
    <div className="grid grid-cols-1 gap-4 sm:gap-5 xl:grid-cols-12">
      {/* KPI */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:col-span-12 xl:grid-cols-8">
        <KpiTile index={0} label="ประชากร HDC" value={sum.total} unit="คน" tone="accent" hint={sum.unknownAge ? `รวมไม่ทราบอายุ ${fmtNum(sum.unknownAge)}` : undefined} />
        <KpiTile index={1} label="ชาย" value={sum.male} unit="คน" tone="male" />
        <KpiTile index={2} label="หญิง" value={sum.female} unit="คน" tone="female" />
        <KpiTile index={3} label="อัตราส่วนเพศ" value={idx.sexRatio} format={pct1} unit="ชาย:หญิง 100" />
        <KpiTile index={4} label="อายุมัธยฐาน" value={idx.median} unit="ปี" />
        <KpiTile index={5} label="ผู้สูงอายุ 60+" value={idx.oldShare} format={pct1} unit="%" tone="amber" />
        <KpiTile index={6} label="ดัชนีการสูงวัย" value={idx.agingIndex} format={pct1} hint="60+ ต่อเด็ก 0–14 ปี 100 คน" />
        <KpiTile index={7} label="อัตราส่วนพึ่งพิงรวม" value={idx.dependency} format={pct1} hint="(0–14 + 60+) ต่อ 15–59 ปี 100 คน" />
      </div>
      <Panel index={1} className="xl:col-span-12">
        <SourceNote
          className="mt-5"
          source={src.hdc()}
          method={<>{measureText}. ดัชนีประชากร: อัตราส่วนเพศ = ชาย/หญิง×100, ดัชนีการสูงวัย = 60+/(0–14)×100, อัตราส่วนพึ่งพิง = (0–14 + 60+)/(15–59)×100 — คำนวณทุกอายุตามตัวกรองพื้นที่/เพศ</>}
          formula={sqlFormula}
        />
      </Panel>

      {/* Pyramid */}
      <Panel index={2} className="xl:col-span-7">
        <PanelHeader
          icon={<Users />}
          title="พีระมิดประชากร HDC (ชาย | หญิง)"
          description="กลุ่มอายุช่วงละ 5 ปี — ชายด้านซ้าย หญิงด้านขวา"
          actions={<SegmentedTabs id="hdc-pyr" size="sm" value={pct ? "pct" : "n"} onChange={(v) => setPct(v === "pct")} items={[{ value: "n", label: "จำนวน" }, { value: "pct", label: "ร้อยละ" }]} />}
        />
        <div className="px-3 pt-3 sm:px-5">
          <Legend items={[{ label: `ชาย ${fmtNum(sum.male)}`, color: MALE }, { label: `หญิง ${fmtNum(sum.female)}`, color: FEMALE }]} />
          <PopulationPyramid data={sum.pyramid} pct={pct} height={560} />
        </div>
        <SourceNote source={src.hdc()} method={<>{measureText}. แบ่งกลุ่มอายุ 5 ปี (100+ รวมเป็นกลุ่มสุดท้าย); ร้อยละ = จำนวนกลุ่ม ÷ ประชากรทั้งพีระมิด × 100. {src.ageRule}</>} formula={sqlFormula} />
      </Panel>

      {/* Target groups */}
      <Panel index={3} className="xl:col-span-5">
        <PanelHeader icon={<Target />} title="กลุ่มเป้าหมายงานส่งเสริมป้องกัน" description="ตามตัวกรองพื้นที่/หน่วยบริการ (ไม่ใช้ตัวกรองช่วงอายุ)" />
        <ul className="space-y-2.5 px-5 pb-3 pt-4 sm:px-6">
          {(() => {
            const all = hdcSummary(d, { ...f, ageMin: 0, ageMax: 100, sexes: [] });
            const max = Math.max(...TARGET_GROUPS.map((g) => targetCount(all.single, g)), 1);
            return TARGET_GROUPS.map((g, i) => {
              const n = targetCount(all.single, g);
              return (
                <li key={g.id}>
                  <div className="flex items-baseline justify-between gap-3 text-[12.5px]">
                    <span className="text-mis-ink-2">{g.label}</span>
                    <span className="font-semibold tabular-nums text-mis-ink">{fmtNum(n)}</span>
                  </div>
                  <div className="mt-1 h-2 overflow-hidden rounded-full bg-mis-ink/[0.06]">
                    <div className="h-full rounded-full transition-[width] duration-300" style={{ width: `${(n / max) * 100}%`, background: SERIES_COLORS[i % SERIES_COLORS.length] }} />
                  </div>
                </li>
              );
            });
          })()}
        </ul>
        <SourceNote
          source={src.hdc()}
          method={<>ใช้ตัววัดระดับเดียวกับ KPI ({sum.level === "prov" ? "CID ทั้งจังหวัด" : sum.level === "amp" ? "CID ภายในอำเภอ" : "HOSPCODE+PID"}) รวมจำนวนตามช่วงอายุเต็มปีของแต่ละกลุ่ม (รวมขอบทั้งสองด้าน) และเพศที่กำหนด</>}
          formula={TARGET_GROUPS.map((g) => `${g.label}: อายุ ${g.min}–${g.max === 100 ? "100+" : g.max}${g.sex ? ` และ SEX='${g.sex}'` : ""}`).join("\n")}
        />
      </Panel>

      {/* Amphoe table */}
      <Panel index={4} className="xl:col-span-5">
        <PanelHeader icon={<Building2 />} title="ประชากรรายอำเภอ" description="ตัดซ้ำ CID ภายในอำเภอ" />
        <div className="px-5 pt-4 sm:px-6">
          <SortTable
            maxHeight={420}
            rows={byAmp.map((a) => ({ ...a, total: a.m + a.f }))}
            initialSort={{ key: "total", dir: -1 }}
            columns={[
              { key: "name", label: "อำเภอ" },
              { key: "m", label: "ชาย", num: true },
              { key: "f", label: "หญิง", num: true },
              { key: "total", label: "รวม", num: true },
            ]}
          />
          <p className="mt-2 text-[11.5px] text-mis-faint">
            ผลรวมรายอำเภอ {fmtNum(byAmp.reduce((a, b) => a + b.m + b.f, 0))} อาจมากกว่ายอดจังหวัด เพราะคนเดียวกันอาจเป็น TYPEAREA 1/3 ในหน่วยบริการต่างอำเภอ
            ({fmtNum(d.hdc.quality.cid_multi_amp_13)} CID ในชุด 1,3)
          </p>
        </div>
        <SourceNote
          source={src.hdc("person, chospital, campur")}
          method="HOSPCODE+PID → chospital.DISTCODE (อำเภอที่ตั้งหน่วยบริการ) → campur; นับ CID ไม่ซ้ำภายในแต่ละอำเภอ ตามตัวกรอง TYPEAREA/เพศ/อายุ"
          formula={"INNER JOIN chospital ch ON ch.hoscode = p.hospcode\nINNER JOIN campur ca ON ca.ampurcodefull = CONCAT(ch.provcode, ch.distcode)\nROW_NUMBER() OVER (PARTITION BY CID, ch.DISTCODE ORDER BY TYPEAREA, D_UPDATE DESC, HOSPCODE) = 1"}
        />
      </Panel>

      {/* Hospital table */}
      <Panel index={5} className="xl:col-span-7">
        <PanelHeader icon={<Building2 />} title="ประชากรรายหน่วยบริการ" description={`${byHosp.length} หน่วย · HOSPCODE+PID ในหน่วยบริการ`} />
        <div className="px-5 pt-4 sm:px-6">
          <SortTable
            maxHeight={420}
            rows={byHosp}
            initialSort={{ key: "total", dir: -1 }}
            columns={[
              { key: "code", label: "รหัส" },
              { key: "name", label: "หน่วยบริการ", render: (r) => <span className="line-clamp-1" title={String(r.name)}>{String(r.name)}</span> },
              { key: "amp", label: "อำเภอ", render: (r) => d.hdc.amp.find((a) => a.code === r.amp)?.name ?? String(r.amp) },
              { key: "total", label: `รวม (${f.typeSet === "13" ? "1,3" : "1,2"})`, num: true },
              { key: "t1", label: "TYPE 1", num: true },
              { key: "t2", label: "TYPE 2", num: true },
              { key: "t3", label: "TYPE 3", num: true },
              { key: "old", label: "60+", num: true },
            ]}
          />
        </div>
        <SourceNote
          source={src.hdc("person, chospital")}
          method="นับแถว HOSPCODE+PID ของแต่ละหน่วยบริการ (ไม่ตัดซ้ำข้ามหน่วย) — คอลัมน์ TYPE 1/2/3 แสดงจำนวนแต่ละ TYPEAREA แยกกัน, คอลัมน์รวมใช้ชุด TYPEAREA ที่เลือก"
          formula={`SELECT HOSPCODE, TYPEAREA, COUNT(*) FROM person WHERE ${src.commonWhere} GROUP BY ALL`}
        />
      </Panel>

      {/* Attributes */}
      <Panel index={6} className="xl:col-span-5">
        <PanelHeader
          icon={attrKey === "abo" || attrKey === "rh" ? <Droplet /> : <PieChart />}
          title="คุณลักษณะประชากร"
          description="TYPEAREA 1,3 เสมอ — ตามตัวกรองอำเภอ/เพศ"
          actions={
            <SegmentedTabs
              id="hdc-attr" size="sm" value={attrKey} onChange={setAttrKey}
              items={[{ value: "religion", label: "ศาสนา" }, { value: "abo", label: "หมู่เลือด" }, { value: "rh", label: "Rh" }, { value: "mstatus", label: "สมรส" }, { value: "education", label: "การศึกษา" }]}
            />
          }
        />
        <div className="h-[300px] px-3 pt-3 sm:px-5">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={attr.slice(0, 10)} layout="vertical" margin={{ left: 8, right: 24 }}>
              <CartesianGrid horizontal={false} stroke="rgba(6,25,35,.07)" />
              <XAxis type="number" tickFormatter={(v) => fmtNum(v)} tick={{ fontSize: 11, fill: "#6b7f8a" }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="label" width={150} tick={{ fontSize: 11, fill: "#3d5260" }} axisLine={false} tickLine={false} interval={0} />
              <Tooltip formatter={(v) => [`${fmtNum(Number(v))} คน`, "จำนวน"]} cursor={{ fill: "rgba(2,184,200,.06)" }} />
              <Bar dataKey="n" radius={[0, 8, 8, 0]} animationDuration={CHART_MS.grow}>
                {attr.slice(0, 10).map((a, i) => <Cell key={a.code} fill={a.code === "" ? "#c3ced4" : SERIES_COLORS[i % SERIES_COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <SourceNote
          source={src.hdc("person, chospital, campur, creligion, cabogroup, crhgroup, cmstatus, ceducation")}
          method={`ค่าจากแถวตัวแทนของ CID — ทั้งจังหวัดนับ CID ไม่ซ้ำ, เมื่อเลือกอำเภอนับ CID ไม่ซ้ำภายในอำเภอ; ชื่อรหัสจากตารางรหัสมาตรฐาน; ค่าว่าง = "ไม่บันทึก"`}
          formula={"-- scripts/sql/mis-population-hdc-attr.sql\nUNPIVOT ranked ON religion, abo, rh, mstatus, education INTO NAME attr VALUE code"}
        />
      </Panel>

      {/* Tambon / village */}
      <Panel index={7} className="xl:col-span-7">
        <PanelHeader icon={<Home />} title="ประชากรรายตำบล / หมู่บ้าน (ตามที่อยู่อาศัย)" description="คลิกตำบลเพื่อดูรายหมู่บ้าน — TYPEAREA 1,3" />
        <div className="grid gap-3 px-5 pt-4 sm:px-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
          <div className="mis-scroll max-h-[380px] overflow-auto rounded-2xl border border-mis-line/70">
            <table className="w-full text-[12.5px]">
              <thead className="sticky top-0 bg-mis-surface-2/95">
                <tr className="text-mis-ink-2">
                  <th className="px-3 py-2 text-left">ตำบล</th><th className="px-3 py-2 text-right">ชาย</th><th className="px-3 py-2 text-right">หญิง</th><th className="px-3 py-2 text-right">รวม</th>
                </tr>
              </thead>
              <tbody>
                {tambons.map((t) => (
                  <tr key={t.code} onClick={() => setTmbSel(t.code)} className={`cursor-pointer border-b border-mis-line/50 hover:bg-mis-accent-soft/40 ${tmbSel === t.code ? "bg-mis-accent-soft/60" : ""}`}>
                    <td className="px-3 py-1.5">{t.name} <span className="text-mis-faint">({d.hdc.amp.find((a) => a.code === t.amp)?.name})</span></td>
                    <td className="px-3 py-1.5 text-right tabular-nums">{fmtNum(t.m)}</td>
                    <td className="px-3 py-1.5 text-right tabular-nums">{fmtNum(t.f)}</td>
                    <td className="px-3 py-1.5 text-right font-semibold tabular-nums">{fmtNum(t.m + t.f)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mis-scroll max-h-[380px] overflow-auto rounded-2xl border border-mis-line/70 p-3">
            {tmb ? (
              <>
                <p className="mb-2 text-[12.5px] font-semibold text-mis-ink">ต.{tmb.name} — {tmb.villages.length} หมู่บ้าน</p>
                <ul className="space-y-1 text-[12px]">
                  {tmb.villages.map((v) => (
                    <li key={v.code} className="flex justify-between gap-2 border-b border-mis-line/40 py-1">
                      <span className="text-mis-ink-2">ม.{v.moo} {v.name}</span>
                      <span className="tabular-nums font-medium">{fmtNum(v.n)}</span>
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <p className="grid h-full place-items-center text-center text-[12px] text-mis-faint">เลือกตำบลจากตารางด้านซ้าย</p>
            )}
          </div>
        </div>
        <SourceNote
          source={src.hdc("person, home, cvillage, ctambon")}
          method={`ที่อยู่ตามแฟ้ม home (HOSPCODE+HID) → CHANGWAT||AMPUR||TAMBON||VILLAGE = cvillage.VILLAGECODEFULL; ตำบล = นับ CID ไม่ซ้ำภายในตำบล, หมู่บ้าน = นับ CID ไม่ซ้ำภายในหมู่บ้าน. ไม่นับคนที่หาบ้านไม่พบ ${fmtNum(d.hdc.quality.no_home_13)} แถว และรหัสหมู่บ้านไม่ตรง cvillage ${fmtNum(d.hdc.quality.home_bad_village_13)} แถว (ดูแท็บคุณภาพข้อมูล)`}
          formula={"-- scripts/sql/mis-population-hdc-village.sql\nINNER JOIN home h ON h.HOSPCODE = p.HOSPCODE AND h.HID = p.HID\nINNER JOIN cvillage cv ON cv.VILLAGECODEFULL = h.CHANGWAT||h.AMPUR||h.TAMBON||h.VILLAGE\nROW_NUMBER() OVER (PARTITION BY CID, village) = 1 / OVER (PARTITION BY CID, tambon) = 1"}
        />
      </Panel>
    </div>
  );
}
