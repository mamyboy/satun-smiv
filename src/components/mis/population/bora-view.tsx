"use client";

import * as React from "react";
import { Bar, CartesianGrid, ComposedChart, Legend as RLegend, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Activity, Building2, House, Landmark, LineChart, TrendingUp, Users } from "lucide-react";
import { fmtNum } from "@/lib/mis/format";
import { boraByAmp, boraChangeFY, boraSummary, indices, ymLabel, type Filters, type PopulationData } from "@/lib/mis/population";
import { Panel, PanelHeader } from "../panel";
import { SegmentedTabs } from "../segmented-tabs";
import { CHART_MS } from "../motion";
import { FEMALE, KpiTile, Legend, MALE, PopulationPyramid, SortTable, SourceNote } from "./shared";
import type { Sources } from "./sources";

const pct1 = (n: number) => n.toFixed(1);

export function BoraView({ d, f, src }: { d: PopulationData; f: Filters; src: Sources }) {
  const sum = React.useMemo(() => boraSummary(d, f), [d, f]);
  const idx = React.useMemo(() => indices(boraSummary(d, { ...f, ageMin: 0, ageMax: 100 }).single), [d, f]);
  const [pct, setPct] = React.useState(false);
  const allNat = d.bora.provAll["1"].concat(d.bora.provAll["2"]).reduce((a, b) => a + b, 0);
  const central = d.bora.provCentral["1"].concat(d.bora.provCentral["2"]).reduce((a, b) => a + b, 0);
  const moving = d.bora.provMoving["1"].concat(d.bora.provMoving["2"]).reduce((a, b) => a + b, 0);

  const trend = d.bora.popMonth.map((p) => ({ ym: ymLabel(p.ym), ชาย: p.m, หญิง: p.f, รวม: p.m + p.f }));
  const vital = d.bora.vitalMonth.map((v) => ({
    ym: ymLabel(v.ym),
    เกิด: (v.birth?.[0] ?? 0) + (v.birth?.[1] ?? 0),
    ตาย: (v.death?.[0] ?? 0) + (v.death?.[1] ?? 0),
    ย้ายเข้า: (v.movein?.[0] ?? 0) + (v.movein?.[1] ?? 0),
    ย้ายออก: (v.moveout?.[0] ?? 0) + (v.moveout?.[1] ?? 0),
  }));
  const fyRows = boraChangeFY(d);
  const rateChart = fyRows.map((r) => ({ fy: `${r.fy}${r.months < 12 ? "*" : ""}`, CBR: +r.cbr.toFixed(2), CDR: +r.cdr.toFixed(2), "เพิ่มตามธรรมชาติ": +r.rni.toFixed(2), "ย้ายถิ่นสุทธิ": +r.nmr.toFixed(2) }));
  const houseTrend = d.bora.house.month.map((h) => ({ ym: ymLabel(h.ym), บ้าน: h.n }));
  const lastHouse = d.bora.house.month[d.bora.house.month.length - 1].n;
  const firstHouse = d.bora.house.month[0];

  const amp = boraByAmp(d);

  return (
    <div className="grid grid-cols-1 gap-4 sm:gap-5 xl:grid-cols-12">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:col-span-12 xl:grid-cols-8">
        <KpiTile index={0} label="ประชากรทะเบียนราษฎร (ไทย)" value={sum.total} unit="คน" tone="accent" />
        <KpiTile index={1} label="ชาย" value={sum.male} unit="คน" tone="male" />
        <KpiTile index={2} label="หญิง" value={sum.female} unit="คน" tone="female" />
        <KpiTile index={3} label="อัตราส่วนเพศ" value={idx.sexRatio} format={pct1} unit="ชาย:หญิง 100" />
        <KpiTile index={4} label="อายุมัธยฐาน" value={idx.median} unit="ปี" />
        <KpiTile index={5} label="ผู้สูงอายุ 60+" value={idx.oldShare} format={pct1} unit="%" tone="amber" />
        <KpiTile index={6} label="ดัชนีการสูงวัย" value={idx.agingIndex} format={pct1} />
        <KpiTile index={7} label="อัตราส่วนพึ่งพิงรวม" value={idx.dependency} format={pct1} />
      </div>
      <Panel index={1} className="xl:col-span-12">
        <div className="flex flex-wrap gap-x-6 gap-y-1 px-5 pt-4 text-[12px] text-mis-muted sm:px-6">
          <span>ทุกสัญชาติ (รวมทะเบียนบ้านกลาง/ระหว่างย้าย): <b className="text-mis-ink">{fmtNum(allNat)}</b></span>
          <span>สัญชาติไทยในทะเบียนบ้านกลาง: <b className="text-mis-ink">{fmtNum(central)}</b></span>
          <span>สัญชาติไทยระหว่างการย้าย: <b className="text-mis-ink">{fmtNum(moving)}</b></span>
        </div>
        <SourceNote
          className="mt-3"
          source={src.bora("ประชากรรายอายุ แยกตามจำนวนประชากรที่มีชื่ออยู่ในทะเบียนบ้าน · สัญชาติไทย")}
          method={<>ใช้ {d.meta.bora.popDefinition} รายอายุ 0–100+ แยกเพศ; ระดับจังหวัดใช้ยอดจังหวัด, เมื่อเลือกอำเภอรวมสำนักทะเบียนอำเภอ + สำนักทะเบียนท้องถิ่น (เทศบาล) ที่ BORA ระบุว่าอยู่ในอำเภอนั้น. ดัชนีใช้สูตรเดียวกับฝั่ง HDC (ตัวกรองหน่วยบริการ/TYPEAREA ไม่มีผลกับข้อมูลทะเบียนราษฎร)</>}
          formula={"/api/statpophouse/v1/statpop/list?action=23&yymm=<ปปดด>&nat=99&popst=0&cc=91   (จังหวัด)\naction=24&rcode=<สำนักทะเบียน>   (อำเภอ/ท้องถิ่น)\naction=25&rcode=..&tt=<ตำบล>     (ตำบล)\nอายุ lsAge0..lsAge100 + lsAge101 (เกิน 100) → รวมเป็น 100+"}
        />
      </Panel>

      <Panel index={2} className="xl:col-span-6">
        <PanelHeader
          icon={<Users />}
          title={`พีระมิดประชากรทะเบียนราษฎร (${src.boraMonth})`}
          description="ชายซ้าย | หญิงขวา — กลุ่มอายุ 5 ปี"
          actions={<SegmentedTabs id="bora-pyr" size="sm" value={pct ? "pct" : "n"} onChange={(v) => setPct(v === "pct")} items={[{ value: "n", label: "จำนวน" }, { value: "pct", label: "ร้อยละ" }]} />}
        />
        <div className="px-3 pt-3 sm:px-5">
          <Legend items={[{ label: `ชาย ${fmtNum(sum.male)}`, color: MALE }, { label: `หญิง ${fmtNum(sum.female)}`, color: FEMALE }]} />
          <PopulationPyramid data={sum.pyramid} pct={pct} height={560} />
        </div>
        <SourceNote source={src.bora()} method="รวมจำนวนรายอายุเดี่ยวเป็นกลุ่ม 5 ปี; ร้อยละ = จำนวนกลุ่ม ÷ ประชากรทั้งพีระมิด × 100 (อายุตามที่ทะเบียนราษฎรคำนวณ)" />
      </Panel>

      <Panel index={3} className="xl:col-span-6">
        <PanelHeader icon={<LineChart />} title="แนวโน้มประชากรรายเดือน (สัญชาติไทย)" description="ต.ค. 2565 – ล่าสุด · ทั้งจังหวัด" />
        <div className="h-[300px] px-3 pt-3 sm:px-5">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={trend} margin={{ left: 8, right: 12, top: 8 }}>
              <CartesianGrid vertical={false} stroke="rgba(6,25,35,.07)" />
              <XAxis dataKey="ym" tick={{ fontSize: 10.5, fill: "#6b7f8a" }} interval={5} axisLine={false} tickLine={false} />
              <YAxis yAxisId="t" domain={["dataMin - 500", "dataMax + 500"]} tickFormatter={(v) => fmtNum(v)} tick={{ fontSize: 11, fill: "#6b7f8a" }} width={64} axisLine={false} tickLine={false} />
              <Tooltip formatter={(v) => fmtNum(Number(v))} />
              <RLegend wrapperStyle={{ fontSize: 11.5 }} />
              <Line yAxisId="t" dataKey="รวม" stroke="#02b8c8" strokeWidth={2.4} dot={false} animationDuration={CHART_MS.draw} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        <SourceNote source={src.bora("ประชากรรายอายุรายเดือน")} method="ยอดรวมประชากรสัญชาติไทยในทะเบียนบ้าน ณ สิ้นแต่ละเดือน (ผลรวมทุกอายุ ชาย+หญิง)" />
      </Panel>

      <Panel index={4} className="xl:col-span-6">
        <PanelHeader icon={<Activity />} title="เกิด · ตาย · ย้ายเข้า · ย้ายออก รายเดือน" description="ทั้งจังหวัด (ทุกสัญชาติที่แจ้งทะเบียน)" />
        <div className="h-[300px] px-3 pt-3 sm:px-5">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={vital} margin={{ left: 0, right: 12, top: 8 }}>
              <CartesianGrid vertical={false} stroke="rgba(6,25,35,.07)" />
              <XAxis dataKey="ym" tick={{ fontSize: 10.5, fill: "#6b7f8a" }} interval={5} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#6b7f8a" }} width={44} axisLine={false} tickLine={false} />
              <Tooltip formatter={(v) => fmtNum(Number(v))} />
              <RLegend wrapperStyle={{ fontSize: 11.5 }} />
              <Bar dataKey="เกิด" fill="#3fbf9f" radius={[4, 4, 0, 0]} animationDuration={CHART_MS.grow} />
              <Bar dataKey="ตาย" fill="#e5616f" radius={[4, 4, 0, 0]} animationDuration={CHART_MS.grow} />
              <Line dataKey="ย้ายเข้า" stroke="#5b8def" dot={false} strokeWidth={1.8} animationDuration={CHART_MS.draw} />
              <Line dataKey="ย้ายออก" stroke="#f2a541" dot={false} strokeWidth={1.8} animationDuration={CHART_MS.draw} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        <SourceNote source={src.bora("จำนวนการเกิด / การตาย / การย้ายเข้า / การย้ายออก รายเดือน")} method="จำนวนเหตุการณ์ที่แจ้งทะเบียนในแต่ละเดือน ระดับจังหวัด (statbirth / statdeath / statmovein / statmoveout)" formula={"/api/stattranall/v1/<statbirth|statdeath|statmovein|statmoveout>/list?action=13&yymmBegin=..&yymmEnd=..&statType=1&cc=91"} />
      </Panel>

      <Panel index={5} className="xl:col-span-6">
        <PanelHeader icon={<TrendingUp />} title="อัตราการเปลี่ยนแปลงประชากรรายปีงบ" description="ต่อประชากรกลางปี 1,000 คน (* = ปีงบยังไม่ครบ 12 เดือน)" />
        <div className="h-[300px] px-3 pt-3 sm:px-5">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={rateChart} margin={{ left: 0, right: 12, top: 8 }}>
              <CartesianGrid vertical={false} stroke="rgba(6,25,35,.07)" />
              <XAxis dataKey="fy" tick={{ fontSize: 11, fill: "#6b7f8a" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#6b7f8a" }} width={40} axisLine={false} tickLine={false} />
              <Tooltip formatter={(v) => `${Number(v).toFixed(2)} ‰`} />
              <RLegend wrapperStyle={{ fontSize: 11.5 }} />
              <Bar dataKey="CBR" fill="#3fbf9f" radius={[4, 4, 0, 0]} animationDuration={CHART_MS.grow} />
              <Bar dataKey="CDR" fill="#e5616f" radius={[4, 4, 0, 0]} animationDuration={CHART_MS.grow} />
              <Line dataKey="เพิ่มตามธรรมชาติ" stroke="#02b8c8" strokeWidth={2.2} animationDuration={CHART_MS.draw} />
              <Line dataKey="ย้ายถิ่นสุทธิ" stroke="#f2a541" strokeWidth={2.2} animationDuration={CHART_MS.draw} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        <SourceNote
          source={src.bora("การเกิด/การตาย/การย้าย รายเดือน + ประชากรรายอายุ")}
          method="CBR = เกิด ÷ P × 1,000 · CDR = ตาย ÷ P × 1,000 · อัตราเพิ่มตามธรรมชาติ (RNI) = (เกิด − ตาย) ÷ P × 1,000 · อัตราย้ายถิ่นสุทธิ (NMR) = (ย้ายเข้า − ย้ายออก) ÷ P × 1,000 · P = ประชากรกลางปี (สัญชาติไทยในทะเบียนบ้าน ณ สิ้น มี.ค. ของปีงบ)"
        />
      </Panel>

      <Panel index={6} className="xl:col-span-12">
        <PanelHeader icon={<Landmark />} title="สถิติชีพและสมการดุลประชากร รายปีงบประมาณ" description="ปีงบ = ต.ค.–ก.ย. · อัตราต่อ 1,000 · อัตราเพิ่มจากประชากรสิ้นปีงบ" />
        <div className="px-5 pt-4 sm:px-6">
          <SortTable
            rows={fyRows}
            initialSort={{ key: "fy", dir: -1 }}
            columns={[
              { key: "fy", label: "ปีงบ", render: (r) => `${r.fy}${r.months < 12 ? ` (${r.months} ด.)` : ""}` },
              { key: "birth", label: "เกิด", num: true },
              { key: "death", label: "ตาย", num: true },
              { key: "rni", label: "RNI ‰", num: true, render: (r) => r.rni.toFixed(2) },
              { key: "movein", label: "ย้ายเข้า", num: true },
              { key: "moveout", label: "ย้ายออก", num: true },
              { key: "nmr", label: "NMR ‰", num: true, render: (r) => r.nmr.toFixed(2) },
              { key: "net", label: "เกิด−ตาย+ย้ายสุทธิ", num: true, render: (r) => { const n = r.natural + r.netMig; return <span className={n < 0 ? "text-[#c8414f]" : "text-[#1f8a6e]"}>{n > 0 ? "+" : ""}{fmtNum(n)}</span>; } },
              { key: "registryChange", label: "ประชากรเปลี่ยน (ทะเบียน)", num: true, render: (r) => (r.registryChange === null ? "—" : `${r.registryChange > 0 ? "+" : ""}${fmtNum(r.registryChange)}`) },
              { key: "growth", label: "อัตราเพิ่ม %", num: true, render: (r) => (r.growth === null ? "—" : r.growth.toFixed(2)) },
            ]}
          />
        </div>
        <SourceNote
          source={src.bora("การเกิด/การตาย/การย้าย รายเดือน + ประชากรรายอายุรายเดือน")}
          method="เกิด−ตาย+ย้ายสุทธิ = องค์ประกอบการเปลี่ยนแปลงจากเหตุการณ์ที่แจ้งทะเบียน · ประชากรเปลี่ยน (ทะเบียน) = ประชากรสัญชาติไทยในทะเบียนบ้าน สิ้น ก.ย. ปีงบ − สิ้น ก.ย. ปีงบก่อน · อัตราเพิ่ม (%) = ส่วนต่างนั้น ÷ ประชากรต้นปี × 100 · สองคอลัมน์ไม่เท่ากันเพราะเหตุการณ์นับทุกสัญชาติและรวมการย้ายเข้า/ออกทะเบียนบ้านกลาง ขณะที่ยอดประชากรเป็นสัญชาติไทยในทะเบียนบ้าน"
        />
      </Panel>

      <Panel index={7} className="xl:col-span-12">
        <PanelHeader icon={<House />} title="จำนวนบ้านทะเบียนราษฎร" description={`ล่าสุด ${fmtNum(lastHouse)} หลัง · เพิ่มขึ้น ${fmtNum(lastHouse - firstHouse.n)} หลัง จาก ${ymLabel(firstHouse.ym)}`} />
        <div className="h-[240px] px-3 pt-3 sm:px-5">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={houseTrend} margin={{ left: 8, right: 12, top: 8 }}>
              <CartesianGrid vertical={false} stroke="rgba(6,25,35,.07)" />
              <XAxis dataKey="ym" tick={{ fontSize: 10.5, fill: "#6b7f8a" }} interval={7} axisLine={false} tickLine={false} />
              <YAxis domain={["dataMin - 300", "dataMax + 300"]} tickFormatter={(v) => fmtNum(v)} tick={{ fontSize: 11, fill: "#6b7f8a" }} width={60} axisLine={false} tickLine={false} />
              <Tooltip formatter={(v) => `${fmtNum(Number(v))} หลัง`} />
              <Line dataKey="บ้าน" stroke="#7a6ff0" strokeWidth={2.4} dot={false} animationDuration={CHART_MS.draw} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        <SourceNote
          source={src.bora("จำนวนบ้าน (stathouse)")}
          method="จำนวนบ้าน (หลัง) ณ สิ้นเดือน ระดับจังหวัด = ผลรวมทุกสำนักทะเบียน (ค่า lssumnotTermDate ที่เว็บกรมการปกครองแสดงในคอลัมน์ “หลัง”) · ตรวจกระทบยอดแล้ว: ผลรวมสำนักทะเบียน = ผลรวมตำบล = ยอดจังหวัด"
          formula={"/api/statpophouse/v1/stathouse/list?action=33&yymmBegin=<ปปดด>&yymmEnd=<ปปดด>&statType=0&statSubType=999&subType=99&cc=91"}
        />
      </Panel>

      <Panel index={8} className="xl:col-span-12">
        <PanelHeader icon={<Building2 />} title="ประชากรทะเบียนราษฎรรายอำเภอ / ตำบล" description="รวมสำนักทะเบียนอำเภอ + ท้องถิ่น (เทศบาล) ตามอำเภอที่ BORA ระบุ" />
        <div className="grid gap-4 px-5 pt-4 sm:px-6 lg:grid-cols-2">
          <SortTable
            maxHeight={380}
            rows={amp.map((a) => ({ name: a.name, m: a.m, f: a.f, total: a.m + a.f, old: a.single["1"].slice(60).concat(a.single["2"].slice(60)).reduce((x, y) => x + y, 0), house: d.bora.offices.filter((o) => o.amp === a.code).reduce((x, o) => x + (d.bora.house.office[o.rcode] ?? 0), 0) }))}
            initialSort={{ key: "total", dir: -1 }}
            columns={[
              { key: "name", label: "อำเภอ" },
              { key: "m", label: "ชาย", num: true },
              { key: "f", label: "หญิง", num: true },
              { key: "total", label: "รวม", num: true },
              { key: "old", label: "60+", num: true },
              { key: "house", label: "บ้าน", num: true },
            ]}
          />
          <SortTable
            maxHeight={380}
            rows={Object.entries(d.bora.tambon)
              .filter(([, t]) => !f.amps.length || f.amps.includes(t.amp))
              .map(([code, t]) => ({ code, name: t.name, amp: d.hdc.amp.find((a) => a.code === t.amp)?.name ?? t.amp, m: t["1"].reduce((a, b) => a + b, 0), f: t["2"].reduce((a, b) => a + b, 0) }))
              .map((r) => ({ ...r, total: r.m + r.f, house: d.bora.house.tambon[r.code] ?? 0 }))}
            initialSort={{ key: "total", dir: -1 }}
            columns={[
              { key: "name", label: "ตำบล" },
              { key: "amp", label: "อำเภอ" },
              { key: "m", label: "ชาย", num: true },
              { key: "f", label: "หญิง", num: true },
              { key: "total", label: "รวม", num: true },
              { key: "house", label: "บ้าน", num: true },
            ]}
          />
        </div>
        <SourceNote
          source={src.bora("ประชากรรายอายุ และจำนวนบ้าน ระดับสำนักทะเบียน/อำเภอ และตำบล")}
          method="ตำบล = ผลรวมของตำบลเดียวกันจากทุกสำนักทะเบียน (อำเภอ + เทศบาล) ด้วยรหัสตำบล 6 หลัก; ตรวจกระทบยอดแล้ว ผลรวมสำนักทะเบียน = ผลรวมตำบล = ยอดจังหวัด"
        />
      </Panel>
    </div>
  );
}
