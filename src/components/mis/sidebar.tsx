"use client";

import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  ChevronDown,
  ChevronsLeft,
  HeartPulse,
  LayoutGrid,
  Users,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { META } from "@/lib/mis/data";
import { DUR, EASE_OUT, SPRING } from "./motion";

export type NavTarget = "overview" | "trend" | "top10" | "table" | "insights";
export type NavAction =
  | { kind: "section"; target: NavTarget }
  | { kind: "category"; category: "ncd" | "communicable" };

interface NavLeaf {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  action?: NavAction;
  href?: string;
  soon?: boolean;
}

interface NavCategory {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  children: NavLeaf[];
}

/**
 * นำทางแบบ Category → Sub-category เพื่อรองรับการขยายตัวชี้วัดในอนาคต
 * (เช่น ข้อมูลพื้นฐาน → ประชากร, หน่วยบริการ, ... / โรคไม่ติดต่อ → ... ฯลฯ)
 */
const CATEGORIES: NavCategory[] = [
  {
    id: "basic",
    label: "ข้อมูลพื้นฐาน",
    icon: LayoutGrid,
    children: [{ id: "overview", label: "ประชากร", icon: Users, action: { kind: "section", target: "overview" } }],
  },
];

export function Sidebar({
  collapsed,
  onToggle,
  active,
  onNavigate,
  mobileOpen,
  onCloseMobile,
}: {
  collapsed: boolean;
  onToggle: () => void;
  active: string;
  onNavigate: (a: NavAction) => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}) {
  return (
    <>
      {/* Desktop rail */}
      <motion.aside
        animate={{ width: collapsed ? 84 : 272 }}
        transition={{ duration: DUR.slow, ease: EASE_OUT }}
        className="sticky top-3 hidden h-[calc(100vh-24px)] shrink-0 lg:block"
      >
        <SidebarBody collapsed={collapsed} onToggle={onToggle} active={active} onNavigate={onNavigate} />
      </motion.aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              key="scrim"
              className="fixed inset-0 z-40 bg-mis-ink/30 backdrop-blur-[2px] lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: DUR.base }}
              onClick={onCloseMobile}
            />
            <motion.aside
              key="drawer"
              className="fixed inset-y-3 left-3 z-50 w-[280px] lg:hidden"
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ duration: DUR.slow, ease: EASE_OUT }}
            >
              <SidebarBody
                collapsed={false}
                onToggle={onCloseMobile}
                active={active}
                onNavigate={(a) => {
                  onNavigate(a);
                  onCloseMobile();
                }}
                mobile
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

function SidebarBody({
  collapsed,
  onToggle,
  active,
  onNavigate,
  mobile = false,
}: {
  collapsed: boolean;
  onToggle: () => void;
  active: string;
  onNavigate: (a: NavAction) => void;
  mobile?: boolean;
}) {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-mis-lg bg-mis-ink text-white shadow-mis-hover">
      {/* Brand */}
      <div className={cn("flex items-center gap-3 px-5 pb-6 pt-6", collapsed && "justify-center px-0")}>
        <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-[linear-gradient(135deg,#02b8c8,#65e6d3)] shadow-[0_8px_24px_-8px_rgba(2,184,200,.7)]">
          <HeartPulse className="size-5 text-mis-ink" strokeWidth={2.4} />
        </span>
        <AnimatePresence initial={false}>
          {!collapsed && (
            <motion.div
              key="brand"
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -6 }}
              transition={{ duration: DUR.fast }}
              className="min-w-0 flex-1"
            >
              <p className="text-[15px] font-semibold leading-tight tracking-[-0.01em]">MIS Health</p>
              <p className="truncate text-[11.5px] text-white/55">สำนักงานสาธารณสุขจังหวัด{META.province}</p>
            </motion.div>
          )}
        </AnimatePresence>
        {mobile && (
          <button onClick={onToggle} aria-label="ปิดเมนู" className="grid size-8 place-items-center rounded-full text-white/70 hover:bg-white/10">
            <X className="size-4" />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="mis-scroll flex-1 space-y-1.5 overflow-y-auto overflow-x-hidden px-3 pb-4">
        {CATEGORIES.map((cat) => (
          <CategoryBlock key={cat.id} category={cat} collapsed={collapsed} active={active} onNavigate={onNavigate} />
        ))}
      </nav>

      {/* Footer: data provenance + collapse */}
      <div className="border-t border-white/10 p-3">
        {!collapsed && (
          <div className="mb-2 rounded-2xl bg-white/[0.06] p-3">
            <p className="text-[11px] text-white/50">แหล่งข้อมูล</p>
            <p className="mt-0.5 text-[12px] font-medium leading-snug text-white/90">{META.source}</p>
            <p className="mt-1 text-[11px] text-white/50">HDC ประมวลผล {thaiDate(META.hdcProcessedDate)}</p>
          </div>
        )}
        {!mobile && (
          <button
            onClick={onToggle}
            aria-label={collapsed ? "ขยายเมนู" : "ย่อเมนู"}
            className={cn(
              "flex h-10 w-full items-center gap-2 rounded-xl px-3 text-[12.5px] text-white/60 transition-colors hover:bg-white/10 hover:text-white",
              collapsed && "justify-center px-0",
            )}
          >
            <motion.span animate={{ rotate: collapsed ? 180 : 0 }} transition={{ duration: DUR.slow, ease: EASE_OUT }}>
              <ChevronsLeft className="size-4" />
            </motion.span>
            {!collapsed && <span>ย่อเมนู</span>}
          </button>
        )}
      </div>
    </div>
  );
}

function CategoryBlock({
  category,
  collapsed,
  active,
  onNavigate,
}: {
  category: NavCategory;
  collapsed: boolean;
  active: string;
  onNavigate: (a: NavAction) => void;
}) {
  const [open, setOpen] = useState(true);
  const CatIcon = category.icon;

  if (collapsed) {
    // Rail mode: no room for a category header — show children as flat icon buttons.
    return (
      <ul className="space-y-0.5">
        {category.children.map((child) => (
          <li key={child.id}>
            <NavRow item={child} collapsed active={active === child.id} onNavigate={onNavigate} />
          </li>
        ))}
      </ul>
    );
  }

  return (
    <div>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex h-9 w-full items-center gap-2 rounded-lg px-3 text-left transition-colors hover:bg-white/[0.04]"
      >
        <CatIcon className="size-[15px] shrink-0 text-white/40" />
        <span className="flex-1 truncate text-[10.5px] font-semibold uppercase tracking-[0.08em] text-white/40">
          {category.label}
        </span>
        <motion.span animate={{ rotate: open ? 0 : -90 }} transition={{ duration: DUR.base, ease: EASE_OUT }}>
          <ChevronDown className="size-3.5 text-white/35" />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.ul
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: DUR.base, ease: EASE_OUT }}
            className="space-y-0.5 overflow-hidden pt-0.5"
          >
            {category.children.map((child) => (
              <li key={child.id}>
                <NavRow item={child} collapsed={false} active={active === child.id} onNavigate={onNavigate} indent />
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}

function NavRow({
  item,
  collapsed,
  active,
  onNavigate,
  indent = false,
}: {
  item: NavLeaf;
  collapsed: boolean;
  active: boolean;
  onNavigate: (a: NavAction) => void;
  indent?: boolean;
}) {
  const Icon = item.icon;
  const inner = (
    <>
      {active && (
        <motion.span
          layoutId="mis-nav-active"
          transition={SPRING}
          className="absolute inset-0 rounded-xl bg-white/[0.09] ring-1 ring-inset ring-white/10"
        />
      )}
      <Icon className={cn("relative size-[18px] shrink-0", active ? "text-mis-reef" : "text-white/55 group-hover:text-white/85")} />
      <AnimatePresence initial={false}>
        {!collapsed && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: DUR.fast }}
            className="relative flex min-w-0 flex-1 items-center justify-between gap-2"
          >
            <span className="truncate">{item.label}</span>
            {item.soon && (
              <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-medium text-white/60">เร็วๆ นี้</span>
            )}
          </motion.span>
        )}
      </AnimatePresence>
    </>
  );
  const cls = cn(
    "group relative flex h-10 w-full items-center gap-3 rounded-xl px-3 text-left text-[13px] font-medium transition-colors duration-200",
    active ? "text-white" : "text-white/70 hover:bg-white/[0.05] hover:text-white",
    collapsed && "justify-center px-0",
    indent && !collapsed && "ml-2 w-[calc(100%-8px)]",
    item.soon && "cursor-not-allowed opacity-60 hover:bg-transparent",
  );

  if (item.href) {
    return (
      <Link href={item.href} className={cls} style={{ color: "inherit", textDecoration: "none" }} title={collapsed ? item.label : undefined}>
        {inner}
      </Link>
    );
  }
  return (
    <button
      className={cls}
      disabled={item.soon}
      title={collapsed ? item.label : item.soon ? "อยู่ระหว่างพัฒนา" : undefined}
      onClick={() => item.action && onNavigate(item.action)}
      aria-current={active ? "page" : undefined}
    >
      {inner}
    </button>
  );
}

export function thaiDate(iso: string) {
  return new Date(`${iso}T00:00:00`).toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric" });
}
