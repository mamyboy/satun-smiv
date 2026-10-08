"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowDownRight, ArrowUpDown, ArrowUpRight, ChevronDown, ChevronUp, Search, Table2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CATEGORY_LABEL, SETTING_LABEL, tableRows, type Category, type Setting, type TableRow, type Year } from "@/lib/mis/data";
import { fmtNum, fmtPct } from "@/lib/mis/format";
import { Loadable, Panel, PanelHeader } from "./panel";
import { SegmentedTabs } from "./segmented-tabs";
import { DUR, EASE_OUT } from "./motion";

type SortKey = "name" | "male" | "female" | "total" | "change";
export type CategoryFilter = "all" | Category;
export type SettingFilter = "all" | Setting;

const PAGE = 12;

export function DiseaseTable({
  year,
  ready,
  index,
  query,
  onQueryChange,
  category,
  onCategoryChange,
  setting,
  onSettingChange,
}: {
  year: Year;
  ready: boolean;
  index: number;
  query: string;
  onQueryChange: (q: string) => void;
  category: CategoryFilter;
  onCategoryChange: (c: CategoryFilter) => void;
  setting: SettingFilter;
  onSettingChange: (s: SettingFilter) => void;
}) {
  const [sort, setSort] = useState<{ key: SortKey; dir: "asc" | "desc" }>({ key: "total", dir: "desc" });
  const [limit, setLimit] = useState(PAGE);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = tableRows(year).filter(
      (r) =>
        (category === "all" || r.category === category) &&
        (setting === "all" || r.setting === setting) &&
        (!q || r.name.toLowerCase().includes(q)),
    );
    const dir = sort.dir === "asc" ? 1 : -1;
    return list.sort((a, b) => {
      if (sort.key === "name") return a.name.localeCompare(b.name, "th") * dir;
      const av = sort.key === "change" ? a.change ?? -Infinity : a[sort.key];
      const bv = sort.key === "change" ? b.change ?? -Infinity : b[sort.key];
      return (av - bv) * dir;
    });
  }, [year, query, category, setting, sort]);

  const max = filtered.reduce((m, r) => Math.max(m, r.total), 0);
  const visible = filtered.slice(0, limit);

  const head = (key: SortKey, label: string, align: "left" | "right" = "right") => {
    const on = sort.key === key;
    const Icon = !on ? ArrowUpDown : sort.dir === "asc" ? ChevronUp : ChevronDown;
    return (
      <th
        scope="col"
        aria-sort={on ? (sort.dir === "asc" ? "ascending" : "descending") : "none"}
        className={cn("px-3 py-3 font-medium", align === "right" ? "text-right" : "text-left")}
      >
        <button
          onClick={() => setSort((s) => ({ key, dir: s.key === key && s.dir === "desc" ? "asc" : "desc" }))}
          className={cn(
            "inline-flex items-center gap-1 rounded-md transition-colors hover:text-mis-ink",
            on ? "text-mis-ink" : "text-mis-muted",
            align === "right" && "flex-row-reverse",
          )}
        >
          {label}
          <Icon className={cn("size-3.5", on ? "text-mis-accent-strong" : "text-mis-faint")} />
        </button>
      </th>
    );
  };

  return (
    <Panel id="table" index={index} className="xl:col-span-8">
      <PanelHeader
        icon={<Table2 />}
        title={`ตารางข้อมูลโรค ปี ${year}`}
        description="แยกเพศ · จำนวนครั้ง · เปลี่ยนแปลงเทียบปีก่อน (โรคติดต่อ = ICD-10 A00–B99, NCD = 8 กลุ่มโรคมาตรฐาน)"
      />

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 px-5 pt-4 sm:px-6">
        <div className="relative min-w-[200px] flex-1 sm:max-w-[280px]">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-mis-faint" />
          <input
            value={query}
            onChange={(e) => {
              onQueryChange(e.target.value);
              setLimit(PAGE);
            }}
            placeholder="ค้นหาชื่อโรค…"
            className="h-9 w-full rounded-full border border-mis-line bg-white pl-10 pr-9 text-[13px] text-mis-ink placeholder:text-mis-faint transition-[border-color,box-shadow] duration-200 focus:border-mis-accent/60 focus:outline-none focus:ring-4 focus:ring-mis-accent/15"
          />
          <AnimatePresence>
            {query && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: DUR.fast }}
                onClick={() => onQueryChange("")}
                aria-label="ล้างคำค้น"
                className="absolute right-2 top-1/2 grid size-6 -translate-y-1/2 place-items-center rounded-full text-mis-faint hover:bg-mis-ink/5 hover:text-mis-ink"
              >
                <X className="size-3.5" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>
        <SegmentedTabs
          id="tbl-cat"
          size="sm"
          items={[
            { value: "all", label: "ทุกหมวด" },
            { value: "ncd", label: "NCD" },
            { value: "communicable", label: "โรคติดต่อ" },
          ]}
          value={category}
          onChange={(v) => {
            onCategoryChange(v);
            setLimit(PAGE);
          }}
        />
        <SegmentedTabs
          id="tbl-set"
          size="sm"
          items={[
            { value: "all", label: "ทั้งหมด" },
            { value: "opd", label: "นอก" },
            { value: "ipd", label: "ใน" },
          ]}
          value={setting}
          onChange={(v) => {
            onSettingChange(v);
            setLimit(PAGE);
          }}
        />
        <span className="ml-auto text-[12px] tabular-nums text-mis-muted">{fmtNum(filtered.length)} รายการ</span>
      </div>

      <div className="px-2 pb-4 pt-3 sm:px-3">
        <Loadable
          ready={ready}
          skeleton={
            <div className="space-y-2 px-3 py-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-10" />
              ))}
            </div>
          }
        >
          <div className="mis-scroll overflow-x-auto">
            <table className="w-full min-w-[760px] border-separate border-spacing-0 text-[13px]">
              <thead className="text-[12px]">
                <tr className="[&>th]:border-b [&>th]:border-mis-line">
                  {head("name", "ชื่อโรค / กลุ่มโรค", "left")}
                  <th scope="col" className="px-3 py-3 text-left font-medium text-mis-muted">หมวด</th>
                  {head("male", "ชาย")}
                  {head("female", "หญิง")}
                  {head("total", "รวม")}
                  {head("change", "เทียบปีก่อน")}
                </tr>
              </thead>
              <tbody>
                <AnimatePresence initial={false} mode="popLayout">
                  {visible.map((r) => (
                    <Row key={r.key} r={r} max={max} />
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
            {filtered.length === 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-12 text-center">
                <p className="text-[14px] font-medium text-mis-ink">ไม่พบข้อมูลที่ตรงกับตัวกรอง</p>
                <p className="mt-1 text-[12.5px] text-mis-muted">ลองล้างคำค้นหรือเปลี่ยนหมวด</p>
              </motion.div>
            )}
          </div>
          {filtered.length > limit && (
            <div className="flex justify-center pt-3">
              <Button variant="soft" size="sm" onClick={() => setLimit((l) => l + PAGE)}>
                แสดงเพิ่มอีก {Math.min(PAGE, filtered.length - limit)} รายการ
              </Button>
            </div>
          )}
        </Loadable>
      </div>
    </Panel>
  );
}

function Row({ r, max }: { r: TableRow; max: number }) {
  const width = max ? Math.max(2, (r.total / max) * 100) : 0;
  return (
    <motion.tr
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, transition: { duration: DUR.fast } }}
      transition={{ duration: DUR.base, ease: EASE_OUT }}
      className="group [&>td]:border-b [&>td]:border-mis-line/70 hover:[&>td]:bg-mis-accent-soft/40"
    >
      <td className="max-w-[320px] px-3 py-2.5 transition-colors">
        <p className="truncate font-medium text-mis-ink" title={r.name}>
          {r.name}
        </p>
        <div className="mt-1.5 h-1 w-full max-w-[220px] overflow-hidden rounded-full bg-mis-ink/[0.05]">
          <motion.div
            className={cn("h-full rounded-full", r.category === "ncd" ? "bg-mis-violet" : "bg-mis-accent")}
            initial={{ width: 0 }}
            animate={{ width: `${width}%` }}
            transition={{ duration: 0.6, ease: EASE_OUT }}
          />
        </div>
      </td>
      <td className="px-3 py-2.5 transition-colors">
        <div className="flex flex-wrap gap-1">
          <Badge tone={r.category === "ncd" ? "violet" : "accent"}>{r.category === "ncd" ? "NCD" : CATEGORY_LABEL.communicable}</Badge>
          <Badge tone="neutral">{SETTING_LABEL[r.setting]}</Badge>
        </div>
      </td>
      <td className="px-3 py-2.5 text-right tabular-nums text-mis-ink-2 transition-colors">{fmtNum(r.male)}</td>
      <td className="px-3 py-2.5 text-right tabular-nums text-mis-ink-2 transition-colors">{fmtNum(r.female)}</td>
      <td className="px-3 py-2.5 text-right font-semibold tabular-nums text-mis-ink transition-colors">{fmtNum(r.total)}</td>
      <td className="px-3 py-2.5 text-right transition-colors">
        {r.change === null ? (
          <span className="text-[12px] text-mis-faint">—</span>
        ) : r.prevTotal === 0 ? (
          <Badge tone="amber">ใหม่</Badge>
        ) : (
          <Badge tone={r.change > 0 ? "up" : "down"}>
            {r.change > 0 ? <ArrowUpRight className="size-3" /> : <ArrowDownRight className="size-3" />}
            {fmtPct(r.change)}
          </Badge>
        )}
      </td>
    </motion.tr>
  );
}
