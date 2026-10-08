"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { AlertTriangle } from "lucide-react";
import { DEFAULT_FILTERS, type Filters, type PopulationData } from "@/lib/mis/population";
import { ChartSkeleton } from "../panel";
import { SegmentedTabs } from "../segmented-tabs";
import { DUR, EASE_OUT } from "../motion";
import { Skeleton } from "@/components/ui/skeleton";
import { FilterBar } from "./filter-bar";
import { useSources } from "./sources";
import { HdcView } from "./hdc-view";
import { BoraView } from "./bora-view";
import { CompareView } from "./compare-view";
import { LeView } from "./le-view";
import { QualityView } from "./quality-view";

export type PopTab = "hdc" | "bora" | "compare" | "le" | "quality";
export const POP_TABS: { value: PopTab; label: string }[] = [
  { value: "hdc", label: "ประชากร HDC" },
  { value: "bora", label: "ทะเบียนราษฎร" },
  { value: "compare", label: "เปรียบเทียบ HDC × ทะเบียนราษฎร" },
  { value: "le", label: "LE / HALE" },
  { value: "quality", label: "คุณภาพข้อมูล" },
];

function usePopulationData() {
  const [state, setState] = React.useState<{ data: PopulationData | null; error: string | null }>({ data: null, error: null });
  React.useEffect(() => {
    let alive = true;
    fetch("/data/mis/population.json")
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json() as Promise<PopulationData>;
      })
      .then((data) => alive && setState({ data, error: null }))
      .catch((e: unknown) => alive && setState({ data: null, error: String(e) }));
    return () => {
      alive = false;
    };
  }, []);
  return state;
}

function Loaded({ d, tab, onTab }: { d: PopulationData; tab: PopTab; onTab: (t: PopTab) => void }) {
  const [filters, setFilters] = React.useState<Filters>(DEFAULT_FILTERS);
  const src = useSources(d);
  return (
    <>
      <div className="sticky top-[76px] z-20 mt-5">
        <SegmentedTabs id="pop-tab" items={POP_TABS} value={tab} onChange={onTab} className="mis-glass shadow-mis" />
      </div>
      {tab !== "le" && tab !== "quality" && (
        <div className="mt-3">
          <FilterBar data={d} value={filters} onChange={setFilters} showTypeSet={tab === "hdc"} showHosp={tab === "hdc"} />
        </div>
      )}
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0, transition: { duration: DUR.slow, ease: EASE_OUT } }}
          exit={{ opacity: 0, y: -4, transition: { duration: DUR.fast } }}
          className="mt-5"
          data-testid={`pop-view-${tab}`}
        >
          {tab === "hdc" && <HdcView d={d} f={filters} src={src} />}
          {tab === "bora" && <BoraView d={d} f={filters} src={src} />}
          {tab === "compare" && <CompareView d={d} f={filters} src={src} />}
          {tab === "le" && <LeView d={d} src={src} />}
          {tab === "quality" && <QualityView d={d} src={src} />}
        </motion.div>
      </AnimatePresence>
    </>
  );
}

export function PopulationDashboard({ tab, onTab }: { tab: PopTab; onTab: (t: PopTab) => void }) {
  const { data, error } = usePopulationData();
  if (error)
    return (
      <div className="mt-6 flex items-start gap-3 rounded-mis-lg border border-[#f3b1b8] bg-[#fff5f6] p-5 text-[13px] text-[#9b2c3a]">
        <AlertTriangle className="size-5 shrink-0" />
        โหลดข้อมูลประชากรไม่สำเร็จ ({error}) — ตรวจว่ามีไฟล์ public/data/mis/population.json (สร้างด้วย python3 scripts/mis-build-population.py)
      </div>
    );
  if (!data)
    return (
      <div className="mt-6 grid gap-4 xl:grid-cols-12" aria-busy="true">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:col-span-12 xl:grid-cols-8">
          {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-[92px] rounded-2xl" />)}
        </div>
        <div className="rounded-mis-lg border border-mis-line/70 bg-white p-6 xl:col-span-7"><ChartSkeleton height={460} /></div>
        <div className="rounded-mis-lg border border-mis-line/70 bg-white p-6 xl:col-span-5"><ChartSkeleton height={460} /></div>
      </div>
    );
  return <Loaded d={data} tab={tab} onTab={onTab} />;
}
