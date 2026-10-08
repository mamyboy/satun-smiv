"use client";

import { Menu, RefreshCw } from "lucide-react";
import { META, type YearRange } from "@/lib/mis/data";
import { YearRangePicker } from "./year-range-picker";
import { thaiDate } from "./sidebar";

export function TopBar({
  range,
  onRangeChange,
  onOpenMobileNav,
}: {
  range?: YearRange;
  onRangeChange?: (r: YearRange) => void;
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

      <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-mis-ink-2">MIS Health · ข้อมูลพื้นฐาน › ประชากร</span>

      <div className="ml-auto flex items-center gap-2">
        <span className="hidden items-center gap-1.5 rounded-full bg-mis-accent-soft px-3 py-1.5 text-[11.5px] font-medium text-mis-accent-strong sm:inline-flex">
          <RefreshCw className="size-3.5" />
          HDC ข้อมูล ณ {thaiDate(META.hdcProcessedDate)}
        </span>
        {range && onRangeChange && <YearRangePicker value={range} onChange={onRangeChange} />}
      </div>
    </div>
  );
}
