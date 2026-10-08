"use client";

import * as React from "react";
import { Bar, CartesianGrid, ComposedChart, Legend as RLegend, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Activity, Building2, Landmark, LineChart, Users } from "lucide-react";
import { fmtNum } from "@/lib/mis/format";
import { boraByAmp, boraSummary, indices, ymLabel, type Filters, type PopulationData } from "@/lib/mis/population";
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
  const fy = (ym: number) => (ym % 100 >= 10 ? Math.floor(ym / 100) + 1 : Math.floor(ym / 100)) + 2500;
  const fyRows = Object.values(
    d.bora.vitalMonth.reduce<Record<number, { fy: number; birth: number; death: number; movein: number; moveout: number; months: number }>>((acc, v) => {
      const k = fy(v.ym);
      const r = (acc[k] ??= { fy: k, birth: 0, death: 0, movein: 0, moveout: 0, months: 0 });
      r.birth += (v.birth?.[0] ?? 0) + (v.birth?.[1] ?? 0);
      r.death += (v.death?.[0] ?? 0) + (v.death?.[1] ?? 0);
      r.movein += (v.movein?.[0] ?? 0) + (v.movein?.[1] ?? 0);
      r.moveout += (v.moveout?.[0] ?? 0) + (v.moveout?.[1] ?? 0);
      r.months += 1;
      return acc;
    }, {}),
  ).map((r) => {
    const mid = d.bora.midyearFY[String(r.fy)];
    const P = mid ? mid["1"].concat(mid["2"]).reduce((a, b) => a + b, 0) : 0;
    return { ...r, P, cbr: P ? (r.birth / P) * 1000 : 0, cdr: P ? (r.death / P) * 1000 : 0, net: r.birth - r.death + r.movein - r.moveout };
  });

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
        <PanelHeader icon={<Landmark />} title="สถิติชีพรายปีงบประมาณ" description="อัตราเกิด/ตายหยาบ ต่อประชากร 1,000 คน" />
        <div className="px-5 pt-4 sm:px-6">
          <SortTable
            rows={fyRows}
            initialSort={{ key: "fy", dir: -1 }}
            columns={[
              { key: "fy", label: "ปีงบ", render: (r) => `${r.fy}${r.months < 12 ? ` (${r.months} ด.)` : ""}` },
              { key: "birth", label: "เกิด", num: true },
              { key: "death", label: "ตาย", num: true },
              { key: "cbr", label: "CBR ‰", num: true, render: (r) => r.cbr.toFixed(2) },
              { key: "cdr", label: "CDR ‰", num: true, render: (r) => r.cdr.toFixed(2) },
              { key: "movein", label: "ย้ายเข้า", num: true },
              { key: "moveout", label: "ย้ายออก", num: true },
              { key: "net", label: "เปลี่ยนแปลงสุทธิ", num: true, render: (r) => <span className={r.net < 0 ? "text-[#c8414f]" : "text-[#1f8a6e]"}>{r.net > 0 ? "+" : ""}{fmtNum(r.net)}</span> },
            ]}
          />
        </div>
        <SourceNote
          source={src.bora("การเกิด/การตาย/การย้าย รายเดือน + ประชากรรายอายุ")}
          method="ปีงบประมาณ = ต.ค.–ก.ย.; CBR = เกิด ÷ ประชากรกลางปี × 1,000; CDR = ตาย ÷ ประชากรกลางปี × 1,000; ประชากรกลางปี = ประชากรสัญชาติไทยในทะเบียนบ้าน ณ สิ้นเดือนมีนาคมของปีงบ; เปลี่ยนแปลงสุทธิ = เกิด − ตาย + ย้ายเข้า − ย้ายออก"
        />
      </Panel>

      <Panel index={6} className="xl:col-span-12">
        <PanelHeader icon={<Building2 />} title="ประชากรทะเบียนราษฎรรายอำเภอ / ตำบล" description="รวมสำนักทะเบียนอำเภอ + ท้องถิ่น (เทศบาล) ตามอำเภอที่ BORA ระบุ" />
        <div className="grid gap-4 px-5 pt-4 sm:px-6 lg:grid-cols-2">
          <SortTable
            maxHeight={380}
            rows={amp.map((a) => ({ name: a.name, m: a.m, f: a.f, total: a.m + a.f, old: a.single["1"].slice(60).concat(a.single["2"].slice(60)).reduce((x, y) => x + y, 0) }))}
            initialSort={{ key: "total", dir: -1 }}
            columns={[
              { key: "name", label: "อำเภอ" },
              { key: "m", label: "ชาย", num: true },
              { key: "f", label: "หญิง", num: true },
              { key: "total", label: "รวม", num: true },
              { key: "old", label: "60+", num: true },
            ]}
          />
          <SortTable
            maxHeight={380}
            rows={Object.entries(d.bora.tambon)
              .filter(([, t]) => !f.amps.length || f.amps.includes(t.amp))
              .map(([code, t]) => ({ code, name: t.name, amp: d.hdc.amp.find((a) => a.code === t.amp)?.name ?? t.amp, m: t["1"].reduce((a, b) => a + b, 0), f: t["2"].reduce((a, b) => a + b, 0) }))
              .map((r) => ({ ...r, total: r.m + r.f }))}
            initialSort={{ key: "total", dir: -1 }}
            columns={[
              { key: "name", label: "ตำบล" },
              { key: "amp", label: "อำเภอ" },
              { key: "m", label: "ชาย", num: true },
              { key: "f", label: "หญิง", num: true },
              { key: "total", label: "รวม", num: true },
            ]}
          />
        </div>
        <SourceNote
          source={src.bora("ประชากรรายอายุ ระดับสำนักทะเบียน/อำเภอ และตำบล")}
          method="ตำบล = ผลรวมของตำบลเดียวกันจากทุกสำนักทะเบียน (อำเภอ + เทศบาล) ด้วยรหัสตำบล 6 หลัก; ตรวจกระทบยอดแล้ว ผลรวมสำนักทะเบียน = ผลรวมตำบล = ยอดจังหวัด"
        />
      </Panel>
    </div>
  );
}
