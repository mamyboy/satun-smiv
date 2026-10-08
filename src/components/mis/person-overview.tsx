"use client";

import {
  ArrowLeftRight,
  CalendarDays,
  CheckCircle2,
  Circle,
  Clock,
  Droplet,
  Globe2,
  ListChecks,
  MapPin,
  TrendingUp,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ChartSkeleton, Panel, PanelHeader } from "./panel";

/**
 * มิติประชากร (Person) ยังไม่ได้เชื่อมข้อมูลจริง — แผงนี้วาง "โครงหน้าจอ" เต็มพื้นที่
 * ตามแผนจริงที่จะทำ (schema `person`) ด้วย skeleton ล้วน ไม่มีตัวเลขสมมติ
 * เมื่อ query จริงพร้อม ให้แทนที่แต่ละ panel ด้วยคอมโพเนนต์ข้อมูลจริง (รูปแบบเดียวกับ kpi-card.tsx ฯลฯ)
 */

const PERSON_KPIS = [
  { id: "total", label: "ประชากรทั้งหมด", hint: "แฟ้ม person · นับคนไม่ซ้ำด้วย CID", icon: Users },
  { id: "age", label: "อายุเฉลี่ย", hint: "คำนวณจาก BIRTH ณ ปัจจุบัน", icon: CalendarDays },
  { id: "sex", label: "สัดส่วนชาย : หญิง", hint: "SEX = 1 (ชาย) / 2 (หญิง)", icon: ArrowLeftRight },
  { id: "area", label: "ในเขต : นอกเขตพื้นที่", hint: "TYPEAREA = 1,3 (ใน) / 4 (นอก)", icon: MapPin },
];

const ROADMAP = [
  { id: "schema", label: "ออกแบบ schema และ query จากแฟ้ม person", status: "doing" as const },
  { id: "pyramid", label: "พีระมิดประชากร เพศ × อายุ (5 ปี)", status: "queued" as const },
  { id: "nation", label: "สัญชาติ / ศาสนา / ในเขต-นอกเขตพื้นที่", status: "queued" as const },
  { id: "trend", label: "แนวโน้มประชากรรายปี (byear) และหมู่เลือด (ABO/Rh)", status: "queued" as const },
  { id: "wire", label: "เชื่อมข้อมูลจริงจาก DuckDB แทน skeleton ทั้งหมด", status: "queued" as const },
];

const STATUS_META = {
  done: { icon: CheckCircle2, label: "เสร็จแล้ว", tone: "down" as const },
  doing: { icon: Clock, label: "กำลังดำเนินการ", tone: "amber" as const },
  queued: { icon: Circle, label: "รอคิว", tone: "neutral" as const },
};

export function PersonOverviewGrid() {
  return (
    <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 xl:grid-cols-12">
      {PERSON_KPIS.map((kpi, i) => (
        <div key={kpi.id} className="xl:col-span-3">
          <KpiSkeleton {...kpi} index={i} />
        </div>
      ))}

      <Panel index={4} className="xl:col-span-8">
        <PanelHeader
          icon={<Users />}
          title="พีระมิดประชากร (เพศ × อายุ)"
          description="กลุ่มอายุช่วงละ 5 ปี แยกชาย/หญิง จากฟิลด์ SEX และ BIRTH — รอเชื่อมข้อมูลจริง"
        />
        <div className="px-5 pb-6 pt-4 sm:px-6">
          <ChartSkeleton height={360} />
        </div>
      </Panel>

      <Panel index={5} className="xl:col-span-4">
        <PanelHeader icon={<Globe2 />} title="สัญชาติ / ศาสนา" description="NATION, RELIGION" />
        <div className="flex flex-col items-center gap-5 px-5 pb-6 pt-4 sm:px-6">
          <Skeleton className="size-[150px] shrink-0 rounded-full" />
          <div className="w-full space-y-2.5">
            {[100, 72, 48].map((w, i) => (
              <div key={i} className="flex items-center gap-2.5">
                <Skeleton className="size-2.5 shrink-0 rounded-full" />
                <Skeleton className="h-3" style={{ width: `${w}%` }} />
              </div>
            ))}
          </div>
        </div>
      </Panel>

      <Panel index={6} className="xl:col-span-4">
        <PanelHeader icon={<MapPin />} title="ในเขต / นอกเขตพื้นที่" description="TYPEAREA" />
        <div className="px-5 pb-6 pt-4 sm:px-6">
          <ChartSkeleton height={180} />
        </div>
      </Panel>

      <Panel index={7} className="xl:col-span-4">
        <PanelHeader icon={<Droplet />} title="หมู่เลือด (ABO / Rh)" description="ABOGROUP, RHGROUP" />
        <div className="grid grid-cols-2 gap-3 px-5 pb-6 pt-4 sm:px-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-mis-line/70 p-3">
              <Skeleton className="h-3 w-10" />
              <Skeleton className="mt-2 h-5 w-14" />
            </div>
          ))}
        </div>
      </Panel>

      <Panel index={8} className="xl:col-span-4">
        <PanelHeader icon={<TrendingUp />} title="แนวโน้มประชากรรายปี" description="นับตาม byear" />
        <div className="px-5 pb-6 pt-4 sm:px-6">
          <ChartSkeleton height={180} />
        </div>
      </Panel>

      <Panel index={9} className="xl:col-span-12">
        <PanelHeader icon={<ListChecks />} title="แผนพัฒนามิติประชากร" description="ลำดับงานที่จะทำต่อสำหรับแฟ้ม person" />
        <ul className="grid gap-2.5 px-5 pb-6 pt-4 sm:grid-cols-2 sm:px-6 xl:grid-cols-5">
          {ROADMAP.map((r) => {
            const meta = STATUS_META[r.status];
            const Icon = meta.icon;
            return (
              <li key={r.id} className="flex items-start gap-2.5 rounded-xl border border-mis-line/70 bg-mis-surface-2/60 p-3">
                <Icon className="mt-0.5 size-4 shrink-0 text-mis-accent-strong" />
                <div className="min-w-0">
                  <p className="text-[12.5px] leading-snug text-mis-ink-2">{r.label}</p>
                  <Badge tone={meta.tone} className="mt-1.5">
                    {meta.label}
                  </Badge>
                </div>
              </li>
            );
          })}
        </ul>
      </Panel>
    </div>
  );
}

function KpiSkeleton({
  icon: Icon,
  label,
  hint,
  index,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  hint: string;
  index: number;
}) {
  return (
    <Panel index={index} className="overflow-hidden">
      <div className="flex h-full flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <span className="grid size-10 place-items-center rounded-2xl bg-mis-accent-soft text-mis-accent-strong">
            <Icon className="size-[19px]" />
          </span>
          <Badge tone="neutral">รอข้อมูล</Badge>
        </div>
        <p className="mt-5 text-[12.5px] text-mis-muted">{label}</p>
        <Skeleton className="mt-2 h-8 w-28" />
        <p className="mt-auto pt-4 text-[11.5px] leading-snug text-mis-faint">{hint}</p>
      </div>
    </Panel>
  );
}
