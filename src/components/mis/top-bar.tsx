"use client";

import { Menu, RefreshCw, Search } from "lucide-react";
import { META, type YearRange } from "@/lib/mis/data";
import { YearRangePicker } from "./year-range-picker";
import { thaiDate } from "./sidebar";

export function TopBar({
  range,
  onRangeChange,
  onOpenPalette,
  onOpenMobileNav,
}: {
  range: YearRange;
  onRangeChange: (r: YearRange) => void;
  onOpenPalette: () => void;
  onOpenMobileNav: () => void;
}) {
  return (
    <div className="mis-glass sticky top-3 z-30 flex items-center gap-2 rounded-mis-lg px-3 py-2.5 shadow-mis sm:gap-3 sm:px-4">
      <button
        onClick={onOpenMobileNav}
        aria-label="เปิดเมนู"
        className="grid size-10 place-items-center rounded-full text-mis-ink hover:bg-mis-ink/5 lg:hidden"
      >
        <Menu className="size-5" />
      </button>

      <button
        onClick={onOpenPalette}
        className="group flex h-10 min-w-0 flex-1 items-center gap-2.5 rounded-full border border-mis-line/90 bg-white/80 px-4 text-left text-[13px] text-mis-faint transition-[border-color,box-shadow] duration-200 hover:border-mis-accent/40 hover:shadow-[0_0_0_4px_rgba(2,184,200,.08)] md:max-w-[460px]"
      >
        <Search className="size-4 shrink-0 text-mis-muted group-hover:text-mis-accent-strong" />
        <span className="truncate">ค้นหาโรค ตัวชี้วัด หรือคำสั่ง…</span>
        <kbd className="ml-auto hidden rounded-md border border-mis-line bg-white px-1.5 py-0.5 text-[10.5px] font-medium text-mis-muted sm:inline">
          ⌘K
        </kbd>
      </button>

      <div className="ml-auto flex items-center gap-2">
        <span className="hidden items-center gap-1.5 rounded-full bg-mis-accent-soft px-3 py-1.5 text-[11.5px] font-medium text-mis-accent-strong xl:inline-flex">
          <RefreshCw className="size-3.5" />
          HDC ประมวลผล {thaiDate(META.hdcProcessedDate)}
        </span>
        <YearRangePicker value={range} onChange={onRangeChange} />
      </div>
    </div>
  );
}
