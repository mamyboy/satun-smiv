"use client";

import { useCallback, useState, useSyncExternalStore } from "react";
import { motion } from "motion/react";
import { Database, Layers } from "lucide-react";
import { DUR, EASE_OUT, pageStagger, riseIn } from "./motion";
import { PopulationDashboard, type PopTab } from "./population/population-dashboard";
import { Sidebar, type NavAction } from "./sidebar";
import { TopBar } from "./top-bar";

/**
 * โหมดการทำงานปัจจุบัน: โฟกัสเฉพาะมิติ "ประชากร" (Person)
 * ส่วนโรคไม่ติดต่อ/โรคติดต่อ/Top-10 ที่เคยทำไว้ถูกซ่อนไว้ชั่วคราว (โค้ดยังอยู่ครบใน
 * kpi-card.tsx, trend-chart.tsx, top10-chart.tsx, composition-donut.tsx, disease-table.tsx,
 * activity-feed.tsx, insight-panel.tsx) — สลับกลับมาแสดงได้ภายหลังโดยไม่ต้องเขียนใหม่
 */

const SIDEBAR_KEY = "mis:sidebar-collapsed";
const SIDEBAR_EVENT = "mis:sidebar";

/** Persisted sidebar state, SSR-safe (server snapshot = expanded). */
function useSidebarCollapsed() {
  const collapsed = useSyncExternalStore(
    (cb) => {
      window.addEventListener(SIDEBAR_EVENT, cb);
      window.addEventListener("storage", cb);
      return () => {
        window.removeEventListener(SIDEBAR_EVENT, cb);
        window.removeEventListener("storage", cb);
      };
    },
    () => window.localStorage.getItem(SIDEBAR_KEY) === "1",
    () => false,
  );
  const toggle = useCallback(() => {
    window.localStorage.setItem(SIDEBAR_KEY, collapsed ? "0" : "1");
    window.dispatchEvent(new Event(SIDEBAR_EVENT));
  }, [collapsed]);
  return [collapsed, toggle] as const;
}

export function MisDashboard() {
  const [collapsed, toggleSidebar] = useSidebarCollapsed();
  const [mobileNav, setMobileNav] = useState(false);
  const [tab, setTab] = useState<PopTab>("hdc");
  const [activeNav, setActiveNav] = useState("overview");

  const scrollTo = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const onNavigate = useCallback(
    (a: NavAction) => {
      if (a.kind === "section") {
        setActiveNav(a.target);
        scrollTo(a.target);
      }
    },
    [scrollTo],
  );

  return (
    <div className="mis-root min-h-screen">
      <div className="mx-auto flex max-w-[1680px] gap-4 p-3 sm:gap-5">
        <Sidebar
          collapsed={collapsed}
          onToggle={toggleSidebar}
          active={activeNav}
          onNavigate={onNavigate}
          mobileOpen={mobileNav}
          onCloseMobile={() => setMobileNav(false)}
        />

        <div className="min-w-0 flex-1">
          <TopBar onOpenMobileNav={() => setMobileNav(true)} />

          <motion.main variants={pageStagger} initial="hidden" animate="show" className="pb-10 pt-6 sm:px-1">
            {/* Hero */}
            <motion.div variants={riseIn} id="overview" className="flex scroll-mt-24 flex-wrap items-end justify-between gap-4 px-1">
              <div className="min-w-0">
                <p className="text-[12px] font-semibold uppercase tracking-[0.1em] text-mis-accent-strong">MIS Health · ข้อมูลพื้นฐาน › ประชากร</p>
                <h1 className="mt-1.5 text-[26px] font-semibold leading-tight tracking-[-0.025em] text-mis-ink sm:text-[32px]">
                  ข้อมูลประชากร จังหวัดสตูล
                </h1>
                <p className="mt-1.5 max-w-[760px] text-[13.5px] leading-relaxed text-mis-muted">
                  2 แหล่งข้อมูล: HDC 43 แฟ้ม (แฟ้ม person ผ่าน hippo DuckDB) และสถิติประชากรทะเบียนราษฎร กรมการปกครอง — ทุก panel ระบุแหล่งที่มาและวิธีคิด
                </p>
              </div>
              <div className="flex max-w-full items-start gap-2 rounded-2xl border border-mis-line/80 bg-white/70 px-3.5 py-2.5 text-[11.5px] leading-relaxed text-mis-muted">
                <Layers className="mt-0.5 size-3.5 shrink-0 text-mis-accent-strong" />
                <span className="max-w-[520px]">จังหวัด = ตัดซ้ำ CID · อำเภอ = HOSPCODE+PID → ตัดซ้ำ CID ในอำเภอ · หน่วยบริการ = HOSPCODE+PID</span>
              </div>
            </motion.div>

            <PopulationDashboard tab={tab} onTab={setTab} />

            <motion.footer
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: DUR.slow, ease: EASE_OUT }}
              className="mt-8 flex flex-wrap items-center gap-2 px-1 text-[11.5px] text-mis-faint"
            >
              <Database className="size-3.5" />
              HDC 43 แฟ้ม (hippo.moph.go.th) · สถิติทะเบียนราษฎร (stat.bora.dopa.go.th) · LE/HALE อ้างอิง IHPP/BOD (le-hale.bodthai.net) · สำนักงานสาธารณสุขจังหวัดสตูล
            </motion.footer>
          </motion.main>
        </div>
      </div>
    </div>
  );
}
