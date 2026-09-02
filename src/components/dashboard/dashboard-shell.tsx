"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { DndContext, PointerSensor, useDraggable, useDroppable, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import {
  Activity,
  ArrowDown,
  ArrowLeftRight,
  ArrowUp,
  Bell,
  Building2,
  Brain,
  CalendarClock,
  ChartNoAxesCombined,
  ChevronRight,
  CircleAlert,
  ClipboardList,
  Clock,
  Columns3,
  Command,
  Database,
  Download,
  EyeOff,
  ExternalLink,
  Funnel,
  Gauge,
  GripVertical,
  HeartCrack,
  HeartPulse,
  Hospital,
  Layers,
  ListChecks,
  Loader,
  MapPin,
  MapPinned,
  Menu,
  Percent,
  Pill,
  PieChart as PieChartIcon,
  Repeat2,
  RotateCcw,
  Rows3,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Stethoscope,
  Table2,
  Target,
  TrendingDown,
  TrendingUp,
  UserPlus,
  Users,
  Users2,
  Waves,
  X,
  Zap,
} from "lucide-react";
import { Bar, BarChart, Cell, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { mainNavItems, utilityItems } from "@/lib/dashboard-data";
import {
  amphoeDiagnosisMatrix,
  amphoeList,
  amphoeStats,
  diagnosisBreakdown,
  diagnosisGroupCodes,
  extractedAt,
  getAmphoeDetail,
  getAmphoeFullTable,
  icdCategoryBreakdown,
  indicator1Insights,
  indicator1Name,
  indicator1ProcessedDate,
  indicator1SourceUrl,
  indicator1TableColumns,
  indicator2Insights,
  indicator2Metrics,
  indicator2Name,
  indicator2ProcessedDate,
  indicator2SourceUrl,
  indicator2TableColumns,
  indicator2TableHeaderRows,
  indicator2TableRows,
  indicator2TemplateUrl,
  indicator3AmphoeList,
  indicator3AmphoeStats,
  indicator3ExtractedAt,
  indicator3Insights,
  indicator3Metrics,
  indicator3Name,
  indicator3ProcessedDate,
  indicator3RepeatRate,
  indicator3SourceUrl,
  indicator3TemplateUrl,
  getIndicator3FacilityTable,
  indicator4ExtractedAt,
  indicator4Insights,
  indicator4Metrics,
  indicator4Name,
  indicator4ProcessedDate,
  indicator4RepeatRate,
  indicator4SeverityBreakdown,
  indicator4SourceUrl,
  indicator4TableColumns,
  indicator4TableHeaderRows,
  indicator4TableRows,
  indicator4TemplateUrl,
  indicator5AmphoeList,
  indicator5AmphoeStats,
  indicator5ExtractedAt,
  indicator5FollowRate,
  indicator5Insights,
  indicator5Metrics,
  indicator5Name,
  indicator5NewOldBreakdown,
  indicator5ProcessedDate,
  indicator5SourceUrl,
  getIndicator5FacilityTable,
  indicatorRelate14AmphoeStats,
  indicatorRelate14ExtractedAt,
  indicatorRelate14Insights,
  indicatorRelate14Metrics,
  indicatorRelate14Name,
  indicatorRelate14ProcessedDate,
  indicatorRelate14SourceUrl,
  indicatorRelate14TableColumns,
  indicatorRelate14TableHeaderRows,
  indicatorRelate14TableRows,
  indicatorRelate15AmphoeStats,
  indicatorRelate15ExtractedAt,
  indicatorRelate15Insights,
  indicatorRelate15Metrics,
  indicatorRelate15Name,
  indicatorRelate15ProcessedDate,
  indicatorRelate15SourceUrl,
  indicatorRelate15TableColumns,
  indicatorRelate15TableHeaderRows,
  indicatorRelate15TableRows,
  indicatorRelate16AmphoeStats,
  indicatorRelate16ExtractedAt,
  indicatorRelate16Insights,
  indicatorRelate16Metrics,
  indicatorRelate16Name,
  indicatorRelate16ProcessedDate,
  indicatorRelate16SourceUrl,
  indicatorRelate16TableColumns,
  indicatorRelate16TableHeaderRows,
  indicatorRelate16TableRows,
  indicatorRelate21_2AmphoeStats,
  indicatorRelate21_2ExtractedAt,
  indicatorRelate21_2Insights,
  indicatorRelate21_2Metrics,
  indicatorRelate21_2Name,
  indicatorRelate21_2ProcessedDate,
  indicatorRelate21_2SourceUrl,
  indicatorRelate21_2TableColumns,
  indicatorRelate21_2TableHeaderRows,
  indicatorRelate21_2TableRows,
  indicatorRelate21_6AmphoeStats,
  indicatorRelate21_6ExtractedAt,
  indicatorRelate21_6Insights,
  indicatorRelate21_6Metrics,
  indicatorRelate21_6Name,
  indicatorRelate21_6ProcessedDate,
  indicatorRelate21_6SourceUrl,
  indicatorRelate21_6TableColumns,
  indicatorRelate21_6TableHeaderRows,
  indicatorRelate21_6TableRows,
  getSimpleIndicator,
  getSimpleIndicatorAnalysis,
  getSimpleIndicatorHeadline,
  simpleIndicatorLabels,
  type SimpleIndicatorKey,
  type SimpleAnalysis,
  provinceTotal,
} from "@/lib/hdc-data";

const ease = [0.22, 1, 0.36, 1] as const;

function formatDate(iso?: string) {
  if (!iso) return "-";
  const d = new Date(iso);
  return d.toLocaleDateString("th-TH", { year: "numeric", month: "long", day: "numeric" });
}

/** ข้อความเชื่อมโยงกับตัวชี้วัด SMI-V สำหรับตัวชี้วัดที่เกี่ยวข้อง */
function SmiVNote({ text }: { text: string }) {
  return (
    <div className="smi-v-note">
      <span className="smi-v-note-icon"><Stethoscope size={14} /></span>
      <span><strong>เกี่ยวข้องกับ SMI-V:</strong> {text}</span>
    </div>
  );
}

function Logo() {
  return (
    <div className="brand" aria-label="HDC สตูล">
      <span className="brand-mark"><span /></span>
      <span>HDC สตูล</span>
    </div>
  );
}

function Sidebar({ open, onClose, view }: { open: boolean; onClose: () => void; view: ViewKey }) {
  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.button
            className="sidebar-scrim"
            aria-label="ปิดเมนู"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
        )}
      </AnimatePresence>
      <aside className={`sidebar ${open ? "is-open" : ""}`}>
        <div className="sidebar-top">
          <Logo />
          <button className="icon-button sidebar-close" onClick={onClose} aria-label="ปิดเมนู"><X size={18} /></button>
        </div>
        <nav aria-label="เมนูหลัก">
          <ul className="nav-list">
            {mainNavItems.map((item) => {
              const Icon = item.icon;
              const active = view === item.view || (item.view === "indicators" && (view === "indicator1" || view === "indicator2" || view === "indicator3" || view === "indicator4" || view === "indicator5"));
              return (
                <li key={item.label}>
                  <Link href={item.href} className={`nav-item ${active ? "active" : ""}`}>
                    <Icon size={19} strokeWidth={1.8} />
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
          <p className="nav-label utility-label">ทั่วไป</p>
          <ul className="nav-list">
            {utilityItems.map((item) => {
              const Icon = item.icon;
              return <li key={item.label}><button className="nav-item"><Icon size={19} strokeWidth={1.8} /><span>{item.label}</span></button></li>;
            })}
          </ul>
        </nav>
        <motion.div className="mobile-card" whileHover={{ y: -3 }} transition={{ duration: 0.2 }}>
          <span className="mini-orbit"><Sparkles size={13} /></span>
          <h3>ระบบคลังข้อมูลสุขภาพ</h3>
          <p>สำนักงานสาธารณสุขจังหวัดสตูล</p>
          <button><Download size={14} /> ดาวน์โหลดข้อมูล</button>
        </motion.div>
      </aside>
    </>
  );
}

function Header({ onMenu, onSearch }: { onMenu: () => void; onSearch: () => void }) {
  return (
    <header className="topbar">
      <button className="icon-button menu-button" onClick={onMenu} aria-label="เปิดเมนู"><Menu size={21} /></button>
      <button className="search-trigger" onClick={onSearch} aria-label="ค้นหา">
        <Search size={19} /><span>ค้นหาอำเภอหรือตัวชี้วัด...</span><kbd><Command size={12} /> K</kbd>
      </button>
      <div className="topbar-actions">
        <button className="icon-button notification" aria-label="การแจ้งเตือน"><Bell size={19} /><span /></button>
        <div className="profile">
          <span className="profile-avatar">🏥</span>
          <span className="profile-copy"><strong>สสจ.สตูล</strong><small>เขตสุขภาพที่ 12</small></span>
        </div>
      </div>
    </header>
  );
}

function StatCard({ label, value, note, index, featured = false, icon: Icon, tone = "indigo" }: { label: string; value: string; note: string; index: number; featured?: boolean; icon?: React.ComponentType<{ size?: number; strokeWidth?: number }>; tone?: "blue" | "teal" | "green" | "rose" | "purple" | "indigo" | "amber" }) {
  const valueSizeClass = value.length > 14 ? "is-long" : value.length > 8 ? "is-medium" : "";
  return (
    <motion.article
      className={`stat-card tone-${tone} ${featured ? "featured" : ""}`}
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, delay: index * 0.07, ease }}
      whileHover={{ y: -4 }}
    >
      {Icon && <span className="stat-card-icon" aria-hidden="true"><Icon size={30} strokeWidth={1.6} /></span>}
      <div className={`stat-head ${Icon ? "has-icon" : ""}`}>
        <span className="stat-head-label">{label}</span>
      </div>
      <strong className={`stat-value ${valueSizeClass}`}>{value}</strong>
      <small>{note}</small>
    </motion.article>
  );
}

function AmphoeChartCard() {
  const chartData = amphoeStats.map((item) => ({ amphoe: item.amphoe, total: item.total }));
  return (
    <section className="panel analytics-card">
      <div className="panel-heading">
        <div><p className="eyebrow">ตัวชี้วัดที่ 1</p><h2>SMI-V แยกตามอำเภอ</h2></div>
        <span className="live-pill"><i /> ข้อมูลจริงจาก HDC</span>
      </div>
      <div className="chart-wrap chart-wrap-tall" aria-label="กราฟจำนวนผู้ป่วย SMI-V แยกตามอำเภอ">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical" margin={{ top: 4, right: 24, left: 0, bottom: 0 }}>
            <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 11 }} />
            <YAxis dataKey="amphoe" type="category" axisLine={false} tickLine={false} width={78} tick={{ fill: "#475569", fontSize: 12 }} />
            <Tooltip
              cursor={{ fill: "rgba(20, 105, 72, .04)" }}
              content={({ active, payload }) =>
                active && payload?.[0] ? (
                  <div className="chart-tooltip">
                    <b>{payload[0].value} ราย</b>
                    <span>{payload[0].payload.amphoe}</span>
                  </div>
                ) : null
              }
            />
            <Bar dataKey="total" radius={[0, 12, 12, 0]} animationDuration={850}>
              {chartData.map((entry, index) => (
                <Cell key={entry.amphoe} fill={index === 0 ? "#3730a3" : index < 3 ? "#4f46e5" : "#94a3b8"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

function DiagnosisBreakdownCard() {
  return (
    <section className="panel reminder-card diagnosis-card">
      <p className="eyebrow">จำแนกตามการวินิจฉัย</p>
      <h2>สัดส่วนกลุ่มโรค SMI-V<br />ทั้งจังหวัด</h2>
      <div className="diagnosis-list">
        {diagnosisBreakdown.map((d) => {
          const pct = provinceTotal > 0 ? Math.round((d.total / provinceTotal) * 100) : 0;
          return (
            <div className="diagnosis-row" key={d.code}>
              <span className="diagnosis-label"><strong>{d.code}</strong> {d.name}</span>
              <span className="diagnosis-bar-track">
                <motion.span
                  className="diagnosis-bar-fill"
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.8, ease }}
                />
              </span>
              <span className="diagnosis-value">{d.total.toLocaleString()}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function Indicator1InsightsCard() {
  const { top, bottom, top3Share, avgPerAmphoe, dominantIcd, dominantGroup } = indicator1Insights;
  return (
    <section className="panel insight-card">
      <div className="panel-heading">
        <div><p className="eyebrow">วิเคราะห์ภาพรวม</p><h2>Insight ตัวชี้วัดที่ 1</h2></div>
        <span className="live-pill"><i /> วิเคราะห์อัตโนมัติ</span>
      </div>
      <div className="insight-list">
        <div className="insight-row">
          <span className="insight-icon insight-icon-up"><TrendingUp size={15} /></span>
          <span className="insight-copy">
            <strong>{top?.amphoe ?? "-"}</strong> มีผู้ป่วยสูงสุด {top?.total.toLocaleString() ?? 0} ราย
            <small>3 อำเภอสูงสุดรวมกันคิดเป็น {top3Share}% ของทั้งจังหวัด</small>
          </span>
        </div>
        <div className="insight-row">
          <span className="insight-icon insight-icon-down"><TrendingDown size={15} /></span>
          <span className="insight-copy">
            <strong>{bottom?.amphoe ?? "-"}</strong> มีผู้ป่วยต่ำสุด {bottom?.total.toLocaleString() ?? 0} ราย
            <small>เฉลี่ย {avgPerAmphoe.toLocaleString()} ราย/อำเภอทั้งจังหวัด</small>
          </span>
        </div>
        <div className="insight-row">
          <span className="insight-icon insight-icon-layers"><Layers size={15} /></span>
          <span className="insight-copy">
            กลุ่มวินิจฉัยหลักคือ <strong>{dominantGroup?.name ?? "-"}</strong> ({dominantGroup?.code})
            <small>รวม {dominantGroup?.total.toLocaleString() ?? 0} ราย จากทุกอำเภอ</small>
          </span>
        </div>
        <div className="insight-row">
          <span className="insight-icon insight-icon-target"><Target size={15} /></span>
          <span className="insight-copy">
            รหัส ICD ที่พบมากที่สุดคือ <strong>{dominantIcd?.label ?? "-"}</strong>
            <small>รวม {dominantIcd?.total.toLocaleString() ?? 0} ราย ทั้งจังหวัด</small>
          </span>
        </div>
      </div>
    </section>
  );
}

const heatmapColors = ["#f4f7f5", "#d9ecdf", "#a9d8bb", "#63b98a", "#4f46e5", "#3730a3"];
function heatColor(value: number, max: number) {
  if (max <= 0 || value <= 0) return heatmapColors[0];
  const ratio = value / max;
  const idx = Math.min(heatmapColors.length - 1, Math.ceil(ratio * (heatmapColors.length - 1)));
  return heatmapColors[idx];
}

function AmphoeDiagnosisHeatmap() {
  const max = Math.max(1, ...amphoeDiagnosisMatrix.flatMap((row) => diagnosisGroupCodes.map((c) => row.byCode[c] ?? 0)));
  return (
    <section className="panel heatmap-card">
      <div className="panel-heading">
        <div><p className="eyebrow">Cross-analysis</p><h2>อำเภอ × กลุ่มวินิจฉัย</h2></div>
        <span className="live-pill"><i /> ข้อมูลจริงจาก HDC</span>
      </div>
      <div className="heatmap-scroll">
        <table className="heatmap-table">
          <thead>
            <tr>
              <th>อำเภอ</th>
              {diagnosisGroupCodes.map((code) => <th key={code}>{code}</th>)}
              <th>รวม</th>
            </tr>
          </thead>
          <tbody>
            {amphoeDiagnosisMatrix.map((row) => (
              <tr key={row.amphoe}>
                <td className="heatmap-amphoe">{row.amphoe}</td>
                {diagnosisGroupCodes.map((code) => {
                  const v = row.byCode[code] ?? 0;
                  return (
                    <td key={code} className="heatmap-cell" style={{ background: heatColor(v, max) }} title={`${row.amphoe} · ${code}: ${v}`}>
                      {v || ""}
                    </td>
                  );
                })}
                <td className="heatmap-total">{row.total.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function IcdCategoryCard() {
  const maxTotal = icdCategoryBreakdown[0]?.total ?? 1;
  return (
    <section className="panel icd-card">
      <div className="panel-heading">
        <div><p className="eyebrow">จำแนกละเอียด</p><h2>สัดส่วนตามรหัส ICD</h2></div>
        <span className="live-pill"><i /> ทั้งจังหวัด</span>
      </div>
      <div className="icd-list">
        {icdCategoryBreakdown.map((item) => {
          const pct = maxTotal > 0 ? Math.round((item.total / maxTotal) * 100) : 0;
          return (
            <div className="icd-row" key={item.key}>
              <span className="icd-label">{item.label}</span>
              <span className="icd-bar-track">
                <motion.span
                  className="icd-bar-fill"
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.7, ease }}
                />
              </span>
              <span className="icd-value">{item.total.toLocaleString()}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function AmphoeTableCard() {
  return (
    <section className="panel projects-card amphoe-table-card">
      <div className="panel-title-row"><h2>รายชื่ออำเภอ</h2><span className="soft-button" style={{ pointerEvents: "none" }}><MapPinned size={14} /> {amphoeList.length} อำเภอ</span></div>
      <div className="project-list">
        {amphoeStats.map((item) => {
          const detail = getAmphoeDetail(item.amphoe);
          const diagCount = detail?.diagnoses?.length ?? 0;
          return (
            <button className="project-row" key={item.amphoe}>
              <span className="project-symbol" style={{ "--symbol": "#4338ca" } as React.CSSProperties}><span /></span>
              <span><strong>{item.amphoe}</strong><small>{diagCount} กลุ่มวินิจฉัย · รวม {item.total.toLocaleString()} ราย</small></span>
              <ChevronRight size={15} />
            </button>
          );
        })}
      </div>
    </section>
  );
}

type HdcHeaderCell = { text: string; colSpan: number; rowSpan: number };

/** ตารางข้อมูลดิบ ตรงกับที่แสดงบนหน้า HDC ทุกคอลัมน์ — รองรับหัวตารางหลายแถว/merge cell ตรงต้นฉบับ */
function HdcRawTable({ columns, headerRows, rows }: { columns: string[]; headerRows?: HdcHeaderCell[][]; rows: (string | number)[][] }) {
  return (
    <div className="hdc-table-scroll">
      <table className="hdc-table">
        <thead>
          {headerRows && headerRows.length > 0 ? (
            headerRows.map((row, ri) => (
              <tr key={ri}>
                {row.map((cell, ci) => (
                  <th key={ci} colSpan={cell.colSpan} rowSpan={cell.rowSpan} title={cell.text}>
                    {cell.text}
                  </th>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              {columns.map((label, ci) => (
                <th key={ci} title={label}>{label}</th>
              ))}
            </tr>
          )}
        </thead>
        <tbody>
          {rows.map((row, ri) => {
            const isTotalRow = String(row[0]).includes("รวม") || String(row[0]).includes("TOTAL");
            return (
              <tr key={ri} className={isTotalRow ? "hdc-table-total-row" : ""}>
                {row.map((cell, ci) => (
                  <td key={ci} className={ci === 0 ? "hdc-table-sticky-col" : ""}>
                    {typeof cell === "number" ? cell.toLocaleString() : cell}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/** ตารางตัวชี้วัด 1 แบบเต็มทุกคอลัมน์ ตรงกับหน้า HDC — แยกตามอำเภอ (เลือกได้) */
function Indicator1FullTable() {
  const [selected, setSelected] = useState(amphoeStats[0]?.amphoe ?? "");
  const table = getAmphoeFullTable(selected);
  return (
    <section className="panel projects-card hdc-full-table-card">
      <div className="panel-title-row">
        <h2>ตารางข้อมูลตาม HDC (ทุกคอลัมน์)</h2>
        <span className="soft-button" style={{ pointerEvents: "none" }}><MapPinned size={14} /> รายอำเภอ</span>
      </div>
      <div className="amphoe-tabs">
        {amphoeStats.map((item) => (
          <button key={item.amphoe} className={`amphoe-tab ${selected === item.amphoe ? "active" : ""}`} onClick={() => setSelected(item.amphoe)}>
            {item.amphoe}
          </button>
        ))}
      </div>
      {table ? (
        <HdcRawTable
          columns={indicator1TableColumns}
          headerRows={table.headerRows}
          rows={table.rows}
        />
      ) : (
        <p className="hdc-table-empty">ไม่มีข้อมูลสำหรับอำเภอนี้</p>
      )}
    </section>
  );
}

function Indicator2InsightsCard() {
  if (!indicator2Metrics || !indicator2Insights) return null;
  const { newShare, oldShare, followUpGap, populationCoverage, estimateGap, rateDelta } = indicator2Insights;
  return (
    <section className="panel insight-card">
      <div className="panel-heading">
        <div><p className="eyebrow">วิเคราะห์ภาพรวม</p><h2>Insight ตัวชี้วัดที่ 2</h2></div>
        <span className="live-pill"><i /> วิเคราะห์อัตโนมัติ</span>
      </div>
      <div className="insight-list">
        <div className="insight-row">
          <span className="insight-icon insight-icon-up"><TrendingUp size={15} /></span>
          <span className="insight-copy">
            ผู้ป่วยรายใหม่คิดเป็น <strong>{newShare}%</strong> ของทั้งหมด
            <small>รายเก่า {oldShare}% ({indicator2Metrics.oldPatients.toLocaleString()} คน) · รายใหม่ {indicator2Metrics.newPatients.toLocaleString()} คน</small>
          </span>
        </div>
        <div className="insight-row">
          <span className="insight-icon insight-icon-down"><TrendingDown size={15} /></span>
          <span className="insight-copy">
            ติดตามครบ ≥2 ครั้งน้อยกว่าติดตาม 1 ครั้ง <strong>{followUpGap.toLocaleString()} คน</strong>
            <small>อัตราไม่ก่อซ้ำต่างกัน {rateDelta > 0 ? "+" : ""}{rateDelta} จุด (1 ครั้ง {indicator2Metrics.followUp1xRate}% vs ≥2 ครั้ง {indicator2Metrics.followUp2xPlusRate}%)</small>
          </span>
        </div>
        <div className="insight-row">
          <span className="insight-icon insight-icon-layers"><Layers size={15} /></span>
          <span className="insight-copy">
            ครอบคลุมประชากร <strong>{populationCoverage}%</strong>
            <small>ผู้ป่วย {indicator2Metrics.totalPatients.toLocaleString()} คน จากประชากร {indicator2Metrics.population.toLocaleString()} คน (15-60 ปี)</small>
          </span>
        </div>
        <div className="insight-row">
          <span className="insight-icon insight-icon-target"><Target size={15} /></span>
          <span className="insight-copy">
            ต่ำกว่าประมาณการ <strong>{estimateGap.toLocaleString()} คน</strong>
            <small>ประมาณการ {indicator2Metrics.estimate.toLocaleString()} คน เทียบผู้ป่วยจริง {indicator2Metrics.totalPatients.toLocaleString()} คน</small>
          </span>
        </div>
      </div>
    </section>
  );
}

function Indicator2FunnelCard() {
  if (!indicator2Metrics) return null;
  const steps = [
    { label: "ประมาณการผู้ป่วย SMI-V", value: indicator2Metrics.estimate },
    { label: "ผู้ป่วยทั้งหมดถึงปัจจุบัน", value: indicator2Metrics.totalPatients },
    { label: "ติดตามอย่างน้อย 1 ครั้ง", value: indicator2Metrics.followUp1x },
    { label: "ติดตามอย่างน้อย 2 ครั้ง", value: indicator2Metrics.followUp2xPlus },
    { label: "ติดตาม ≥2 ครั้ง ไม่ก่อซ้ำ", value: indicator2Metrics.followUp2xPlusNoRepeat },
  ];
  const max = Math.max(1, ...steps.map((s) => s.value));
  return (
    <section className="panel funnel-card">
      <div className="panel-heading">
        <div><p className="eyebrow">Funnel การดูแล</p><h2>เส้นทางผู้ป่วยจากประมาณการสู่การติดตาม</h2></div>
        <span className="live-pill"><i /> ข้อมูลจริงจาก HDC</span>
      </div>
      <div className="funnel-list">
        {steps.map((step, i) => {
          const pct = max > 0 ? Math.round((step.value / max) * 100) : 0;
          return (
            <div className="funnel-row" key={step.label}>
              <span className="funnel-label">{step.label}</span>
              <span className="funnel-bar-track">
                <motion.span
                  className="funnel-bar-fill"
                  style={{ opacity: 1 - i * 0.12 }}
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.max(pct, 4)}%` }}
                  transition={{ duration: 0.7, delay: i * 0.06, ease }}
                />
              </span>
              <span className="funnel-value">{step.value.toLocaleString()}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function Indicator2RateCompareCard() {
  if (!indicator2Metrics) return null;
  const rates = [
    { label: "เข้าถึงบริการสะสม (E)", value: indicator2Metrics.accessRate },
    { label: "ติดตาม 1 ครั้ง ไม่ก่อซ้ำ (L)", value: indicator2Metrics.followUp1xRate },
    { label: "ติดตาม ≥2 ครั้ง ไม่ก่อซ้ำ (O)", value: indicator2Metrics.continuousCareRate },
  ];
  return (
    <section className="panel rate-compare-card">
      <div className="panel-heading">
        <div><p className="eyebrow">เปรียบเทียบอัตรา</p><h2>อัตราร้อยละตามเกณฑ์ HDC</h2></div>
      </div>
      <div className="rate-compare-list">
        {rates.map((r) => (
          <div className="rate-compare-item" key={r.label}>
            <div className="rate-compare-ring" style={{ "--pct": `${Math.min(r.value, 100)}%` } as React.CSSProperties}>
              <span>{r.value}%</span>
            </div>
            <p>{r.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function ProvinceGaugeCard() {
  const highest = amphoeStats[0];
  const pct = highest && provinceTotal > 0 ? highest.total / provinceTotal : 0;
  return (
    <section className="panel progress-card">
      <p className="eyebrow">สรุปภาพรวมจังหวัด</p><h2>สัดส่วนอำเภอสูงสุด</h2>
      <div className="gauge">
        <svg viewBox="0 0 240 130" role="img" aria-label={`อำเภอ ${highest?.amphoe} สัดส่วนสูงสุด`}>
          <defs><pattern id="gaugeStripe" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="3" height="7" fill="#b4c0bb" /></pattern></defs>
          <path className="gauge-track" d="M 30 110 A 90 90 0 0 1 210 110" />
          <motion.path className="gauge-fill" d="M 30 110 A 90 90 0 0 1 210 110" pathLength="1" initial={{ pathLength: 0 }} animate={{ pathLength: pct }} transition={{ duration: 1.1, delay: 0.25, ease }} />
          <path className="gauge-pending" d="M 30 110 A 90 90 0 0 1 210 110" pathLength="1" />
        </svg>
        <div className="gauge-number"><strong>{Math.round(pct * 100)}%</strong><span>{highest?.amphoe}</span></div>
      </div>
      <div className="legend"><span><i className="done" /> อำเภอสูงสุด</span><span><i className="doing" /> อำเภออื่นๆ</span></div>
    </section>
  );
}

function ReportInfoCard() {
  return (
    <section className="timer-card report-info-card">
      <div><p>ที่มาของข้อมูล</p><span className="pulse-text"><i /> ดึงจากหน้าเว็บ HDC จริง</span></div>
      <strong className="report-info-value">{amphoeList.length} อำเภอ</strong>
      <p className="report-info-note">อัปเดต {formatDate(extractedAt)}</p>
      {indicator1ProcessedDate && <p className="report-info-processed"><span>วันที่ประมวลผล</span><strong>{indicator1ProcessedDate}</strong></p>}
    </section>
  );
}

function SearchDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = useState("");
  const results = useMemo(
    () => amphoeStats.filter((item) => item.amphoe.toLowerCase().includes(query.toLowerCase())),
    [query]
  );
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  return (
    <AnimatePresence>
      {open && <motion.div className="dialog-backdrop" role="presentation" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={onClose}>
        <motion.div className="search-dialog" role="dialog" aria-modal="true" aria-label="ค้นหา" initial={{ opacity: 0, y: -16, scale: .98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -10, scale: .98 }} transition={{ duration: .24, ease }} onMouseDown={(event) => event.stopPropagation()}>
          <div className="dialog-input"><Search size={19} /><input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="ค้นหาอำเภอ..." /><kbd>ESC</kbd></div>
          <div className="dialog-results">
            <p>อำเภอ</p>
            {results.length ? results.map((item) => <button key={item.amphoe}><span style={{ background: "#4338ca" }} /><strong>{item.amphoe}</strong><ChevronRight size={16} /></button>) : <div className="empty-result">ไม่พบอำเภอที่ค้นหา</div>}
          </div>
        </motion.div>
      </motion.div>}
    </AnimatePresence>
  );
}

export type ViewKey =
  | "overview" | "indicators"
  | "indicator1" | "indicator2" | "indicator3" | "indicator4" | "indicator5"
  | "indicator_relate_14" | "indicator_relate_15" | "indicator_relate_16"
  | "indicator_relate_21_1" | "indicator_relate_21_2" | "indicator_relate_21_4"
  | "indicator_relate_21_6" | "indicator_relate_21_7"
  | "indicator_relate_22_1" | "indicator_relate_22_2" | "indicator_relate_22_3" | "indicator_relate_22_4"
  | "indicator_relate_22_5" | "indicator_relate_22_6" | "indicator_relate_22_7"
  | "indicator_relate_23_4" | "indicator_relate_23_5" | "indicator_relate_23_6"
  | "hippo-hdc" | "blank";

type IndicatorRow = {
  code: string;
  sortKey: number;
  group: "main" | "schizo" | "treatment" | "epidemiology" | "violence";
  name: string;
  href: string;
  sourceUrl: string;
  processedDate: string;
  value: number | null;
  unit: string;
  valueLabel: string;
  starred?: boolean;
};

const indicatorGroupMeta: Record<IndicatorRow["group"], { title: string; dot: string }> = {
  main: { title: "ตัวชี้วัดหลัก SMI-V", dot: "main" },
  schizo: { title: "จิตเภท (Schizophrenia)", dot: "schizo" },
  treatment: { title: "อัตรารักษา/เข้าถึงบริการ", dot: "treatment" },
  epidemiology: { title: "อุบัติการณ์/ความชุก", dot: "epidemiology" },
  violence: { title: "ความรุนแรง/ทำร้ายตนเอง", dot: "violence" },
};

function buildIndicatorRows(): IndicatorRow[] {
  return [
    { code: "1", sortKey: 1, group: "main", name: indicator1Name, href: "/indicator-1", sourceUrl: indicator1SourceUrl, processedDate: indicator1ProcessedDate ?? "-", value: provinceTotal, unit: " คน", valueLabel: "ผู้ป่วยทั้งจังหวัด" },
    { code: "2", sortKey: 2, group: "main", name: indicator2Name, href: "/indicator-2", sourceUrl: indicator2SourceUrl, processedDate: indicator2ProcessedDate ?? "-", value: indicator2Metrics?.accessRate ?? null, unit: "%", valueLabel: "อัตราการเข้าถึงบริการ", starred: true },
    { code: "3", sortKey: 3, group: "main", name: indicator3Name, href: "/indicator-3", sourceUrl: indicator3SourceUrl, processedDate: indicator3ProcessedDate ?? "-", value: indicator3RepeatRate ?? null, unit: "%", valueLabel: "ก่อความรุนแรงซ้ำ" },
    { code: "4", sortKey: 4, group: "main", name: indicator4Name, href: "/indicator-4", sourceUrl: indicator4SourceUrl, processedDate: indicator4ProcessedDate ?? "-", value: indicator4RepeatRate ?? null, unit: "%", valueLabel: "ก่อความรุนแรงซ้ำ" },
    { code: "5", sortKey: 5, group: "main", name: indicator5Name, href: "/indicator-5", sourceUrl: indicator5SourceUrl, processedDate: indicator5ProcessedDate ?? "-", value: indicator5FollowRate ?? null, unit: "%", valueLabel: "ติดตามตามเกณฑ์" },
    { code: "14", sortKey: 14, group: "schizo", name: indicatorRelate14Name, href: "/indicator-relate-14", sourceUrl: indicatorRelate14SourceUrl, processedDate: indicatorRelate14ProcessedDate ?? "-", value: indicatorRelate14Metrics?.rateAB ?? null, unit: "%", valueLabel: "อัตรารักษาต่อเนื่อง" },
    { code: "15", sortKey: 15, group: "schizo", name: indicatorRelate15Name, href: "/indicator-relate-15", sourceUrl: indicatorRelate15SourceUrl, processedDate: indicatorRelate15ProcessedDate ?? "-", value: indicatorRelate15Metrics?.rate2x ?? null, unit: "%", valueLabel: "ติดตามครั้งที่ 2" },
    { code: "16", sortKey: 16, group: "schizo", name: indicatorRelate16Name, href: "/indicator-relate-16", sourceUrl: indicatorRelate16SourceUrl, processedDate: indicatorRelate16ProcessedDate ?? "-", value: indicatorRelate16Metrics?.rate ?? null, unit: "%", valueLabel: "อัตรารักษาต่อเนื่อง" },
    { code: "21.1", sortKey: 21.1, group: "treatment", name: getSimpleIndicator("21_1").name, href: "/indicator-relate-21-1", sourceUrl: getSimpleIndicator("21_1").sourceUrl, processedDate: getSimpleIndicator("21_1").processedDate ?? "-", value: getSimpleIndicatorHeadline("21_1")?.value ?? null, unit: getSimpleIndicatorHeadline("21_1")?.unit ?? "", valueLabel: getSimpleIndicatorHeadline("21_1")?.label ?? "" },
    { code: "21.2", sortKey: 21.2, group: "treatment", name: indicatorRelate21_2Name, href: "/indicator-relate-21-2", sourceUrl: indicatorRelate21_2SourceUrl, processedDate: indicatorRelate21_2ProcessedDate ?? "-", value: indicatorRelate21_2Metrics?.opdRate ?? null, unit: "%", valueLabel: "ร้อยละสารเสพติด OPD เฉลี่ย" },
    { code: "21.6", sortKey: 21.6, group: "treatment", name: indicatorRelate21_6Name, href: "/indicator-relate-21-6", sourceUrl: indicatorRelate21_6SourceUrl, processedDate: indicatorRelate21_6ProcessedDate ?? "-", value: indicatorRelate21_6Metrics?.retentionRateOverall ?? null, unit: "%", valueLabel: "Retention Rate เฉลี่ย" },
    { code: "21.7", sortKey: 21.7, group: "treatment", name: getSimpleIndicator("21_7").name, href: "/indicator-relate-21-7", sourceUrl: getSimpleIndicator("21_7").sourceUrl, processedDate: getSimpleIndicator("21_7").processedDate ?? "-", value: getSimpleIndicatorHeadline("21_7")?.value ?? null, unit: getSimpleIndicatorHeadline("21_7")?.unit ?? "", valueLabel: getSimpleIndicatorHeadline("21_7")?.label ?? "" },
    { code: "21.4", sortKey: 21.4, group: "epidemiology", name: getSimpleIndicator("21_4").name, href: "/indicator-relate-21-4", sourceUrl: getSimpleIndicator("21_4").sourceUrl, processedDate: getSimpleIndicator("21_4").processedDate ?? "-", value: getSimpleIndicatorHeadline("21_4")?.value ?? null, unit: getSimpleIndicatorHeadline("21_4")?.unit ?? "", valueLabel: getSimpleIndicatorHeadline("21_4")?.label ?? "" },
    { code: "23.4", sortKey: 23.4, group: "epidemiology", name: getSimpleIndicator("23_4").name, href: "/indicator-relate-23-4", sourceUrl: getSimpleIndicator("23_4").sourceUrl, processedDate: getSimpleIndicator("23_4").processedDate ?? "-", value: getSimpleIndicatorHeadline("23_4")?.value ?? null, unit: getSimpleIndicatorHeadline("23_4")?.unit ?? "", valueLabel: getSimpleIndicatorHeadline("23_4")?.label ?? "" },
    { code: "23.5", sortKey: 23.5, group: "epidemiology", name: getSimpleIndicator("23_5").name, href: "/indicator-relate-23-5", sourceUrl: getSimpleIndicator("23_5").sourceUrl, processedDate: getSimpleIndicator("23_5").processedDate ?? "-", value: getSimpleIndicatorHeadline("23_5")?.value ?? null, unit: getSimpleIndicatorHeadline("23_5")?.unit ?? "", valueLabel: getSimpleIndicatorHeadline("23_5")?.label ?? "" },
    { code: "23.6", sortKey: 23.6, group: "epidemiology", name: getSimpleIndicator("23_6").name, href: "/indicator-relate-23-6", sourceUrl: getSimpleIndicator("23_6").sourceUrl, processedDate: getSimpleIndicator("23_6").processedDate ?? "-", value: getSimpleIndicatorHeadline("23_6")?.value ?? null, unit: getSimpleIndicatorHeadline("23_6")?.unit ?? "", valueLabel: getSimpleIndicatorHeadline("23_6")?.label ?? "" },
    { code: "22.1", sortKey: 22.1, group: "violence", name: getSimpleIndicator("22_1").name, href: "/indicator-relate-22-1", sourceUrl: getSimpleIndicator("22_1").sourceUrl, processedDate: getSimpleIndicator("22_1").processedDate ?? "-", value: getSimpleIndicatorHeadline("22_1")?.value ?? null, unit: getSimpleIndicatorHeadline("22_1")?.unit ?? "", valueLabel: getSimpleIndicatorHeadline("22_1")?.label ?? "" },
    { code: "22.2", sortKey: 22.2, group: "violence", name: getSimpleIndicator("22_2").name, href: "/indicator-relate-22-2", sourceUrl: getSimpleIndicator("22_2").sourceUrl, processedDate: getSimpleIndicator("22_2").processedDate ?? "-", value: getSimpleIndicatorHeadline("22_2")?.value ?? null, unit: getSimpleIndicatorHeadline("22_2")?.unit ?? "", valueLabel: getSimpleIndicatorHeadline("22_2")?.label ?? "" },
    { code: "22.3", sortKey: 22.3, group: "violence", name: getSimpleIndicator("22_3").name, href: "/indicator-relate-22-3", sourceUrl: getSimpleIndicator("22_3").sourceUrl, processedDate: getSimpleIndicator("22_3").processedDate ?? "-", value: getSimpleIndicatorHeadline("22_3")?.value ?? null, unit: getSimpleIndicatorHeadline("22_3")?.unit ?? "", valueLabel: getSimpleIndicatorHeadline("22_3")?.label ?? "" },
    { code: "22.4", sortKey: 22.4, group: "violence", name: getSimpleIndicator("22_4").name, href: "/indicator-relate-22-4", sourceUrl: getSimpleIndicator("22_4").sourceUrl, processedDate: getSimpleIndicator("22_4").processedDate ?? "-", value: getSimpleIndicatorHeadline("22_4")?.value ?? null, unit: getSimpleIndicatorHeadline("22_4")?.unit ?? "", valueLabel: getSimpleIndicatorHeadline("22_4")?.label ?? "" },
    { code: "22.5", sortKey: 22.5, group: "violence", name: getSimpleIndicator("22_5").name, href: "/indicator-relate-22-5", sourceUrl: getSimpleIndicator("22_5").sourceUrl, processedDate: getSimpleIndicator("22_5").processedDate ?? "-", value: getSimpleIndicatorHeadline("22_5")?.value ?? null, unit: getSimpleIndicatorHeadline("22_5")?.unit ?? "", valueLabel: getSimpleIndicatorHeadline("22_5")?.label ?? "" },
    { code: "22.6", sortKey: 22.6, group: "violence", name: getSimpleIndicator("22_6").name, href: "/indicator-relate-22-6", sourceUrl: getSimpleIndicator("22_6").sourceUrl, processedDate: getSimpleIndicator("22_6").processedDate ?? "-", value: getSimpleIndicatorHeadline("22_6")?.value ?? null, unit: getSimpleIndicatorHeadline("22_6")?.unit ?? "", valueLabel: getSimpleIndicatorHeadline("22_6")?.label ?? "" },
    { code: "22.7", sortKey: 22.7, group: "violence", name: getSimpleIndicator("22_7").name, href: "/indicator-relate-22-7", sourceUrl: getSimpleIndicator("22_7").sourceUrl, processedDate: getSimpleIndicator("22_7").processedDate ?? "-", value: getSimpleIndicatorHeadline("22_7")?.value ?? null, unit: getSimpleIndicatorHeadline("22_7")?.unit ?? "", valueLabel: getSimpleIndicatorHeadline("22_7")?.label ?? "" },
  ];
}

function IndicatorsHubSection() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [activeGroup, setActiveGroup] = useState<IndicatorRow["group"] | "all">("all");
  const [sortBy, setSortBy] = useState<"code" | "value">("code");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const rows: IndicatorRow[] = buildIndicatorRows();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = rows.filter((r) => (activeGroup === "all" || r.group === activeGroup) && (q === "" || r.code.toLowerCase().includes(q) || r.name.toLowerCase().includes(q) || indicatorGroupMeta[r.group].title.toLowerCase().includes(q)));
    list = [...list].sort((a, b) => {
      const dir = sortDir === "asc" ? 1 : -1;
      if (sortBy === "code") return (a.sortKey - b.sortKey) * dir;
      const av = a.value ?? -Infinity;
      const bv = b.value ?? -Infinity;
      return (av - bv) * dir;
    });
    return list;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, activeGroup, sortBy, sortDir]);

  const toggleSort = (col: "code" | "value") => {
    if (sortBy === col) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else { setSortBy(col); setSortDir("asc"); }
  };

  const groupCounts = rows.reduce<Record<string, number>>((acc, r) => { acc[r.group] = (acc[r.group] ?? 0) + 1; return acc; }, {});

  return (
    <motion.div className="indicator-group" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .45, ease }}>
      <div className="indicator-group-head">
        <span className="indicator-badge indicator-badge-overview">ตัวชี้วัด</span>
        <h2>เลือกตัวชี้วัดที่ต้องการดู</h2>
        <p>ตัวชี้วัด SMI-V ทั้งหมด {rows.length} รายการ — ค้นหา กรอง และเรียงลำดับได้</p>
      </div>

      <div className="indicator-table-toolbar">
        <div className="indicator-table-search">
          <Search size={15} />
          <input
            type="text"
            placeholder="ค้นหารหัสหรือชื่อตัวชี้วัด เช่น 21.4, จิตเภท, ทำร้ายตนเอง..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query && <button type="button" onClick={() => setQuery("")} aria-label="ล้างคำค้นหา"><X size={14} /></button>}
        </div>
        <div className="indicator-table-filters">
          <button type="button" className={activeGroup === "all" ? "active" : ""} onClick={() => setActiveGroup("all")}>
            ทั้งหมด <b>{rows.length}</b>
          </button>
          {(Object.keys(indicatorGroupMeta) as IndicatorRow["group"][]).map((g) => (
            <button key={g} type="button" className={activeGroup === g ? "active" : ""} onClick={() => setActiveGroup(g)}>
              <span className={`indicator-jumpnav-dot indicator-jumpnav-dot-${indicatorGroupMeta[g].dot}`} />
              {indicatorGroupMeta[g].title} <b>{groupCounts[g] ?? 0}</b>
            </button>
          ))}
        </div>
      </div>

      <div className="indicator-table-wrap">
        <table className="indicator-table">
          <thead>
            <tr>
              <th className="sortable" onClick={() => toggleSort("code")}>
                รหัส {sortBy === "code" && (sortDir === "asc" ? <ArrowUp size={12} /> : <ArrowDown size={12} />)}
              </th>
              <th>ชื่อตัวชี้วัด</th>
              <th>หมวด</th>
              <th className="sortable num" onClick={() => toggleSort("value")}>
                ค่าเด่น {sortBy === "value" && (sortDir === "asc" ? <ArrowUp size={12} /> : <ArrowDown size={12} />)}
              </th>
              <th>วันที่ประมวลผล</th>
              <th aria-label="การกระทำ" />
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.code} onClick={() => router.push(r.href)} tabIndex={0} role="link" onKeyDown={(e) => { if (e.key === "Enter") router.push(r.href); }} className={r.starred ? "indicator-table-starred" : ""}>
                <td className="indicator-table-code">
                  {r.starred && <Star size={13} className="indicator-star-icon" fill="currentColor" />}
                  {r.code}
                </td>
                <td className="indicator-table-name">
                  <span>{r.name}</span>
                  <a href={r.sourceUrl} target="_blank" rel="noopener noreferrer" className="source-link" title="เปิดหน้ารายงานต้นฉบับบน HDC" onClick={(e) => e.stopPropagation()}>
                    <ExternalLink size={12} /> HDC
                  </a>
                </td>
                <td>
                  <span className={`indicator-table-group indicator-table-group-${indicatorGroupMeta[r.group].dot}`}>
                    <span className={`indicator-jumpnav-dot indicator-jumpnav-dot-${indicatorGroupMeta[r.group].dot}`} />
                    {indicatorGroupMeta[r.group].title}
                  </span>
                </td>
                <td className="indicator-table-value num">
                  {r.value !== null ? <><strong>{r.value.toLocaleString("th-TH")}{r.unit}</strong><span>{r.valueLabel}</span></> : <span className="indicator-table-empty">-</span>}
                </td>
                <td className="indicator-table-date">{r.processedDate}</td>
                <td className="indicator-table-cta"><ChevronRight size={15} /></td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr className="indicator-table-noresult">
                <td colSpan={6}>ไม่พบตัวชี้วัดที่ตรงกับคำค้นหา &quot;{query}&quot;</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}

/** จัดกลุ่มอายุ 21+ ช่วงย่อย (0-4, 5-9, ... 100+) ให้เหลือ 6 กลุ่มใหญ่ อ่านง่ายในโดนัท/legend */
function bucketAgeGroups(rows: string[], rowTotals: number[]): { label: string; value: number }[] {
  const buckets = [
    { label: "0-14 ปี", max: 14, value: 0 },
    { label: "15-29 ปี", max: 29, value: 0 },
    { label: "30-44 ปี", max: 44, value: 0 },
    { label: "45-59 ปี", max: 59, value: 0 },
    { label: "60-74 ปี", max: 74, value: 0 },
    { label: "75 ปีขึ้นไป", max: Infinity, value: 0 },
  ];
  rows.forEach((label, i) => {
    const match = label.match(/(\d+)/);
    const startAge = match ? parseInt(match[1], 10) : Infinity;
    const bucket = buckets.find((b) => startAge <= b.max) ?? buckets[buckets.length - 1];
    bucket.value += rowTotals[i] ?? 0;
  });
  return buckets.filter((b) => b.value > 0).map((b) => ({ label: b.label, value: b.value }));
}

function CompositionDonutCard({
  total,
  segments,
}: {
  total: number;
  segments: { name: string; value: number; color: string; glow: string; icon: React.ComponentType<{ size?: number }> }[];
}) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const active = activeIndex !== null ? segments[activeIndex] : null;
  const activePct = active && total ? Math.round((active.value / total) * 1000) / 10 : null;

  return (
    <section className="panel analytics-card donut-card-v2">
      <div className="panel-heading">
        <div><p className="eyebrow"><PieChartIcon size={12} /> องค์ประกอบผู้ป่วย</p><h2>รายเก่า vs รายใหม่</h2></div>
      </div>
      <div className="donut-card-body">
        <div className="chart-wrap chart-wrap-donut" aria-label="กราฟวงกลมสัดส่วนผู้ป่วยรายเก่าเทียบรายใหม่">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <defs>
                {segments.map((s, i) => (
                  <linearGradient id={`donutGrad-${i}`} key={s.name} x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor={s.glow} />
                    <stop offset="100%" stopColor={s.color} />
                  </linearGradient>
                ))}
              </defs>
              <Pie
                data={segments}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius="62%"
                outerRadius="92%"
                paddingAngle={3}
                cornerRadius={7}
                animationDuration={850}
                onMouseEnter={(_, i) => setActiveIndex(i)}
                onMouseLeave={() => setActiveIndex(null)}
              >
                {segments.map((s, i) => (
                  <Cell
                    key={s.name}
                    fill={`url(#donutGrad-${i})`}
                    stroke="var(--card, #fff)"
                    strokeWidth={2}
                    opacity={activeIndex === null || activeIndex === i ? 1 : 0.35}
                    style={{ transition: "opacity .2s ease" }}
                  />
                ))}
              </Pie>
              <Tooltip
                content={({ active: hovering, payload }) =>
                  hovering && payload?.[0] ? (
                    <div className="chart-tooltip">
                      <b>{payload[0].value?.toLocaleString()} คน</b>
                      <span>{payload[0].name}</span>
                    </div>
                  ) : null
                }
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="donut-center-label">
            {active ? (
              <>
                <strong>{active.value.toLocaleString()}</strong>
                <span>{active.name} · {activePct}%</span>
              </>
            ) : (
              <>
                <strong>{total.toLocaleString()}</strong>
                <span>ผู้ป่วยรวม</span>
              </>
            )}
          </div>
        </div>
        <ul className="donut-legend donut-legend-v2">
          {segments.map((d, i) => {
            const pct = total ? Math.round((d.value / total) * 1000) / 10 : 0;
            return (
              <li
                key={d.name}
                className={activeIndex === i ? "is-active" : ""}
                onMouseEnter={() => setActiveIndex(i)}
                onMouseLeave={() => setActiveIndex(null)}
              >
                <div className="donut-legend-v2-top">
                  <span className="donut-legend-label"><d.icon size={13} /> {d.name}</span>
                  <span className="donut-legend-value">{pct}%</span>
                </div>
                <div className="donut-legend-bar-track">
                  <motion.div
                    className="donut-legend-bar-fill"
                    style={{ background: `linear-gradient(90deg, ${d.glow}, ${d.color})` }}
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.7, delay: i * 0.08, ease }}
                  />
                </div>
                <span className="donut-legend-count">{d.value.toLocaleString()} คน</span>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

function OverviewSection() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    gsap.registerPlugin(ScrollTrigger);
    const links = gsap.utils.toArray<HTMLElement>(".indicator-title-link");
    const ctx = gsap.context(() => {
      links.forEach((el) => {
        gsap.fromTo(
          el,
          { opacity: 0, y: 16, scale: 0.97 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.6,
            ease: "power3.out",
            scrollTrigger: { trigger: el, start: "top 92%", once: true },
          }
        );
      });
    });
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const links = gsap.utils.toArray<HTMLElement>(".indicator-title-link");
    const cleanups: Array<() => void> = [];
    links.forEach((el) => {
      const shimmer = el.querySelector<HTMLElement>(".indicator-title-shimmer");
      const icon = el.querySelector<HTMLElement>(".indicator-title-link-icon");
      if (!shimmer) return;
      const onEnter = () => {
        gsap.fromTo(shimmer, { xPercent: -130 }, { xPercent: 130, duration: 0.7, ease: "power2.out" });
        if (icon) gsap.to(icon, { rotate: 12, duration: 0.3, ease: "back.out(3)" });
      };
      const onLeave = () => {
        if (icon) gsap.to(icon, { rotate: 0, duration: 0.3, ease: "power2.out" });
      };
      el.addEventListener("mouseenter", onEnter);
      el.addEventListener("mouseleave", onLeave);
      cleanups.push(() => {
        el.removeEventListener("mouseenter", onEnter);
        el.removeEventListener("mouseleave", onLeave);
      });
    });
    return () => cleanups.forEach((fn) => fn());
  }, []);

  return (
    <motion.div className="indicator-group" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .45, ease }}>
      <div className="indicator-group-head">
        <span className="indicator-badge indicator-badge-2"><ShieldCheck size={13} /> Section 1 · ตัวชี้วัด 2</span>
        <h2><Link href="/indicator-2" className="indicator-title-link"><span className="indicator-title-shimmer" aria-hidden="true" /><span className="indicator-title-link-text">{indicator2Name}</span><ExternalLink size={15} className="indicator-title-link-icon" /></Link></h2>
      </div>

      {/* ===== SECTION: Key Stats ===== */}
      <section className="stats-grid" aria-label="สถิติตัวชี้วัดที่ 2">
        <StatCard icon={Users} tone="blue" label="ผู้ป่วย SMI-V ทั้งหมด" value={`${indicator2Metrics?.totalPatients.toLocaleString() ?? "-"}`} note={indicator2Metrics?.area ?? ""} index={0} featured />
        <StatCard icon={Gauge} tone="teal" label="อัตราการเข้าถึงบริการ" value={`${indicator2Metrics?.accessRate ?? "-"}%`} note="Accessibility Rate (E)" index={1} />
        <StatCard icon={ShieldCheck} tone="green" label="ไม่ก่อความรุนแรงซ้ำ" value={`${indicator2Metrics?.noRepeatViolence.toLocaleString() ?? "-"}`} note="ผู้ป่วยสะสม (F)" index={2} />
        <StatCard icon={Activity} tone="teal" label="ดูแลต่อเนื่อง ≥2 ครั้ง" value={`${indicator2Metrics?.continuousCareRate ?? "-"}%`} note="ไม่ก่อซ้ำในปีงบประมาณ (O)" index={3} />
      </section>

      {/* ===== SECTION: Composition & Follow-up ===== */}
      <div className="overview-two-col">
        {/* Composition Donut */}
        <CompositionDonutCard
          total={indicator2Metrics?.totalPatients ?? 0}
          segments={[
            { name: "รายเก่า", value: indicator2Metrics?.oldPatients ?? 0, color: "#4338ca", glow: "#6366f1", icon: Users },
            { name: "รายใหม่", value: indicator2Metrics?.newPatients ?? 0, color: "#22d3ee", glow: "#67e8f9", icon: UserPlus },
          ]}
        />

        {/* Follow-up Comparison Grouped Bar */}
        <section className="panel analytics-card">
          <div className="panel-heading">
            <div><p className="eyebrow"><ChartNoAxesCombined size={12} /> เปรียบเทียบการติดตาม</p><h2>ติดตาม 1 ครั้ง เทียบ ≥2 ครั้ง</h2></div>
          </div>
          <div className="chart-wrap chart-wrap-tall" aria-label="กราฟแท่งเปรียบเทียบจำนวนผู้ป่วยติดตาม 1 ครั้ง และ 2 ครั้งขึ้นไป">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={[
                  { label: "ติดตาม 1 ครั้ง", ติดตามทั้งหมด: indicator2Metrics?.followUp1x ?? 0, ไม่ก่อซ้ำ: indicator2Metrics?.followUp1xNoRepeat ?? 0 },
                  { label: "ติดตาม ≥2 ครั้ง", ติดตามทั้งหมด: indicator2Metrics?.followUp2xPlus ?? 0, ไม่ก่อซ้ำ: indicator2Metrics?.followUp2xPlusNoRepeat ?? 0 },
                ]}
                margin={{ top: 8, right: 16, left: 0, bottom: 4 }}
              >
                <XAxis dataKey="label" tick={{ fill: "#475569", fontSize: 11.5 }} axisLine={{ stroke: "#e2e8f0" }} tickLine={false} />
                <YAxis tick={{ fill: "#94a3b8", fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip
                  content={({ active, payload, label }) =>
                    active && payload?.length ? (
                      <div className="chart-tooltip">
                        <b>{label}</b>
                        {payload.map((p) => (
                          <span key={p.dataKey as string}>{p.name}: {(p.value as number).toLocaleString()} คน</span>
                        ))}
                      </div>
                    ) : null
                  }
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="ติดตามทั้งหมด" fill="#a5b4fc" radius={[6, 6, 0, 0]} maxBarSize={54} animationDuration={750} />
                <Bar dataKey="ไม่ก่อซ้ำ" fill="#4338ca" radius={[6, 6, 0, 0]} maxBarSize={54} animationDuration={750} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      {/* ===== SECTION: Care Pathway & Rates ===== */}
      <div className="overview-two-col">
        {/* Funnel */}
        <section className="panel funnel-card">
          <div className="panel-heading">
            <div><p className="eyebrow"><Funnel size={12} /> เส้นทางการดูแล</p><h2>จากประมาณการสู่การติดตามต่อเนื่อง</h2></div>
          </div>
          <div className="funnel-list">
            {[
              { label: "ประมาณการผู้ป่วย SMI-V", value: indicator2Metrics?.estimate ?? 0 },
              { label: "ผู้ป่วยทั้งหมดถึงปัจจุบัน", value: indicator2Metrics?.totalPatients ?? 0 },
              { label: "ติดตามอย่างน้อย 1 ครั้ง", value: indicator2Metrics?.followUp1x ?? 0 },
              { label: "ติดตามอย่างน้อย 2 ครั้ง", value: indicator2Metrics?.followUp2xPlus ?? 0 },
              { label: "ติดตาม ≥2 ครั้ง ไม่ก่อซ้ำ", value: indicator2Metrics?.followUp2xPlusNoRepeat ?? 0 },
            ].map((step, i) => {
              const maxVal = Math.max(1, indicator2Metrics?.estimate ?? 1);
              const pct = maxVal > 0 ? Math.round((step.value / maxVal) * 100) : 0;
              return (
                <div className="funnel-row" key={step.label}>
                  <span className="funnel-label">{step.label}</span>
                  <span className="funnel-bar-track">
                    <motion.span
                      className="funnel-bar-fill"
                      style={{ opacity: 1 - i * 0.12 }}
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.max(pct, 4)}%` }}
                      transition={{ duration: 0.7, delay: i * 0.06, ease }}
                    />
                  </span>
                  <span className="funnel-value">{step.value.toLocaleString()}</span>
                </div>
              );
            })}
          </div>
        </section>

        {/* Rate Compare */}
        <section className="panel rate-compare-card">
          <div className="panel-heading">
            <div><p className="eyebrow"><Gauge size={12} /> เปรียบเทียบอัตรา</p><h2>อัตราร้อยละตามเกณฑ์ HDC</h2></div>
          </div>
          <div className="rate-compare-list">
            {[
              { label: "เข้าถึงบริการสะสม (E)", value: indicator2Metrics?.accessRate ?? 0, icon: Activity },
              { label: "ติดตาม 1 ครั้ง ไม่ก่อซ้ำ (L)", value: indicator2Metrics?.followUp1xRate ?? 0, icon: ShieldCheck },
              { label: "ติดตาม ≥2 ครั้ง ไม่ก่อซ้ำ (O)", value: indicator2Metrics?.continuousCareRate ?? 0, icon: ShieldCheck },
            ].map((r) => (
              <div className="rate-compare-item" key={r.label}>
                <div className="rate-compare-ring" style={{ "--pct": `${Math.min(r.value, 100)}%` } as React.CSSProperties}>
                  <span>{r.value}%</span>
                </div>
                <p><r.icon size={13} /> {r.label}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* ===== SECTION 2: ตัวชี้วัดที่ 1 — SMI-V แยกตามอำเภอ ===== */}
      <div className="indicator-group-head indicator-group-head-sub">
        <span className="indicator-badge indicator-badge-1"><MapPinned size={13} /> Section 2 · ตัวชี้วัด 1</span>
        <h2><Link href="/indicator-1" className="indicator-title-link"><span className="indicator-title-shimmer" aria-hidden="true" /><span className="indicator-title-link-text">{indicator1Name}</span><ExternalLink size={15} className="indicator-title-link-icon" /></Link></h2>
      </div>

      <section className="stats-grid" aria-label="สถิติตัวชี้วัดที่ 1">
        <StatCard icon={Users} tone="blue" label="ผู้ป่วยทั้งจังหวัด" value={provinceTotal.toLocaleString()} note="รวมทุกอำเภอ" index={0} featured />
        <StatCard icon={MapPin} tone="blue" label="จำนวนอำเภอ" value={String(amphoeList.length)} note="มีข้อมูลครบทุกอำเภอ" index={1} />
        <StatCard icon={ClipboardList} tone="purple" label="กลุ่มวินิจฉัย" value={String(diagnosisBreakdown.length)} note="1B030 – 1B033" index={2} />
        <StatCard icon={Building2} tone="amber" label="อำเภอสูงสุด" value={amphoeStats[0]?.amphoe ?? "-"} note={`${amphoeStats[0]?.total.toLocaleString() ?? 0} ราย`} index={3} />
      </section>

      <div className="overview-two-col">
        {/* Top Amphoe Bar */}
        <section className="panel analytics-card">
          <div className="panel-heading">
            <div><p className="eyebrow"><ChartNoAxesCombined size={12} /> เปรียบเทียบอำเภอ</p><h2>SMI-V แยกตามอำเภอ</h2></div>
          </div>
          <div className="chart-wrap chart-wrap-tall" aria-label="กราฟจำนวนผู้ป่วย SMI-V แยกตามอำเภอ">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={amphoeStats} layout="vertical" margin={{ top: 4, right: 24, left: 0, bottom: 0 }}>
                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 11 }} />
                <YAxis dataKey="amphoe" type="category" axisLine={false} tickLine={false} width={78} tick={{ fill: "#475569", fontSize: 12 }} />
                <Tooltip
                  cursor={{ fill: "rgba(67,56,202,.05)" }}
                  content={({ active, payload }) =>
                    active && payload?.[0] ? (
                      <div className="chart-tooltip">
                        <b>{payload[0].value?.toLocaleString()} ราย</b>
                        <span>{payload[0].payload.amphoe}</span>
                      </div>
                    ) : null
                  }
                />
                <Bar dataKey="total" radius={[0, 12, 12, 0]} animationDuration={850}>
                  {amphoeStats.map((entry, index) => (
                    <Cell key={entry.amphoe} fill={index === 0 ? "#3730a3" : index < 3 ? "#4f46e5" : "#a5b4fc"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Diagnosis Group Composition Donut */}
        <CompositionDonutCard
          total={diagnosisBreakdown.reduce((sum, d) => sum + d.total, 0)}
          segments={diagnosisBreakdown.map((d, i) => ({
            name: d.name,
            value: d.total,
            color: ["#4338ca", "#6366f1", "#22d3ee", "#a5b4fc"][i % 4],
            glow: ["#818cf8", "#a5b4fc", "#67e8f9", "#e0e7ff"][i % 4],
            icon: ClipboardList,
          }))}
        />
      </div>

      {/* ICD Category Breakdown */}
      <IcdCategoryCard />

      {/* ===== SECTION 3: ตัวชี้วัดที่ 3 — ก่อความรุนแรงซ้ำ ===== */}
      <div className="indicator-group-head indicator-group-head-sub">
        <span className="indicator-badge indicator-badge-3"><Repeat2 size={13} /> Section 3 · ตัวชี้วัด 3</span>
        <h2><Link href="/indicator-3" className="indicator-title-link"><span className="indicator-title-shimmer" aria-hidden="true" /><span className="indicator-title-link-text">{indicator3Name}</span><ExternalLink size={15} className="indicator-title-link-icon" /></Link></h2>
      </div>

      <section className="stats-grid" aria-label="สถิติตัวชี้วัดที่ 3">
        <StatCard icon={Users} tone="blue" label="สะสมทั้งจังหวัด" value={`${indicator3Metrics.cumulative.toLocaleString()}`} note="ปีงบ 2559-2568" index={0} featured />
        <StatCard icon={UserPlus} tone="blue" label="รายใหม่ปีงบปัจจุบัน" value={`${indicator3Metrics.newCases.toLocaleString()}`} note="ปีงบประมาณ 2569" index={1} />
        <StatCard icon={Repeat2} tone="rose" label="ก่อความรุนแรงซ้ำ" value={`${indicator3Metrics.repeatViolence.toLocaleString()}`} note="คนเดิมที่สะสมถึงปัจจุบัน" index={2} />
        <StatCard icon={Percent} tone="rose" label="ร้อยละก่อซ้ำ" value={`${indicator3RepeatRate}%`} note="[3/(1+2)]*100" index={3} />
      </section>

      <div className="overview-two-col">
        {/* Repeat Rate by Amphoe */}
        <section className="panel analytics-card">
          <div className="panel-heading">
            <div><p className="eyebrow"><ChartNoAxesCombined size={12} /> เปรียบเทียบอำเภอ</p><h2>ร้อยละก่อความรุนแรงซ้ำ แยกตามอำเภอ</h2></div>
          </div>
          <div className="chart-wrap chart-wrap-tall" aria-label="กราฟร้อยละก่อความรุนแรงซ้ำแยกตามอำเภอ">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={indicator3AmphoeStats} layout="vertical" margin={{ top: 4, right: 24, left: 0, bottom: 0 }}>
                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 11 }} />
                <YAxis dataKey="amphoe" type="category" axisLine={false} tickLine={false} width={78} tick={{ fill: "#475569", fontSize: 12 }} />
                <Tooltip
                  cursor={{ fill: "rgba(67,56,202,.05)" }}
                  content={({ active, payload }) =>
                    active && payload?.[0] ? (
                      <div className="chart-tooltip">
                        <b>{payload[0].value}%</b>
                        <span>{payload[0].payload.amphoe}</span>
                      </div>
                    ) : null
                  }
                />
                <Bar dataKey="repeatRate" radius={[0, 12, 12, 0]} animationDuration={850}>
                  {indicator3AmphoeStats.map((entry) => (
                    <Cell key={entry.amphoe} fill={entry.repeatRate > indicator3Insights.avgRate ? "#a03d68" : "#4338ca"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Risk Tier Composition Donut */}
        <CompositionDonutCard
          total={indicator3AmphoeStats.length}
          segments={[
            { name: `ความเสี่ยงสูง (>${indicator3Insights.avgRate}%)`, value: indicator3AmphoeStats.filter((a) => a.repeatRate > indicator3Insights.avgRate).length, color: "#a03d68", glow: "#f472b6", icon: TrendingUp },
            { name: `ความเสี่ยงต่ำ (≤${indicator3Insights.avgRate}%)`, value: indicator3AmphoeStats.filter((a) => a.repeatRate <= indicator3Insights.avgRate).length, color: "#4338ca", glow: "#818cf8", icon: TrendingDown },
          ]}
        />
      </div>

      {/* ===== SECTION 4: ตัวชี้วัดที่ 4 — จำแนกตามความรุนแรง SMI-V1–V4 ===== */}
      <div className="indicator-group-head indicator-group-head-sub">
        <span className="indicator-badge indicator-badge-4"><Layers size={13} /> Section 4 · ตัวชี้วัด 4</span>
        <h2><Link href="/indicator-4" className="indicator-title-link"><span className="indicator-title-shimmer" aria-hidden="true" /><span className="indicator-title-link-text">{indicator4Name}</span><ExternalLink size={15} className="indicator-title-link-icon" /></Link></h2>
      </div>

      <section className="stats-grid" aria-label="สถิติตัวชี้วัดที่ 4">
        <StatCard icon={Users} tone="blue" label="ผู้ป่วย SMI-V ทั้งหมดถึงปัจจุบัน" value={`${indicator4Metrics?.totalToDate.toLocaleString() ?? "-"}`} note="สะสมทั้งจังหวัด" index={0} featured />
        <StatCard icon={CalendarClock} tone="teal" label="มารักษาในปีงบประมาณปัจจุบัน" value={`${indicator4Metrics?.treatedCurrentYear.toLocaleString() ?? "-"}`} note="ปีงบประมาณปัจจุบัน" index={1} />
        <StatCard icon={ShieldCheck} tone="green" label="ไม่ก่อความรุนแรงซ้ำ" value={`${indicator4Metrics?.noRepeatViolence.toLocaleString() ?? "-"}`} note="เข้าเกณฑ์ SMI-V Low Risk" index={2} />
        <StatCard icon={Repeat2} tone="rose" label="ก่อความรุนแรงซ้ำ" value={`${indicator4RepeatRate}%`} note={`${indicator4Metrics?.repeatViolenceCurrentYear.toLocaleString() ?? "-"} คน ในปีงบประมาณปัจจุบัน`} index={3} />
      </section>

      <div className="overview-two-col">
        {/* Severity Group Grouped Bar */}
        <section className="panel analytics-card">
          <div className="panel-heading">
            <div><p className="eyebrow"><ChartNoAxesCombined size={12} /> จำแนกตามความรุนแรง</p><h2>SMI-V1–V4: มารักษา / ขาดการรักษา / ก่อซ้ำ</h2></div>
          </div>
          <div className="chart-wrap chart-wrap-tall" aria-label="กราฟแท่งเปรียบเทียบกลุ่มความรุนแรง SMI-V1 ถึง V4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={indicator4SeverityBreakdown.map((g) => ({ group: g.group, มารักษา: g.treated, ขาดการรักษา: g.defaulted, ก่อซ้ำ: g.repeatViolence }))}
                margin={{ top: 8, right: 16, left: 0, bottom: 4 }}
              >
                <XAxis dataKey="group" tick={{ fill: "#475569", fontSize: 11.5 }} axisLine={{ stroke: "#e2e8f0" }} tickLine={false} />
                <YAxis tick={{ fill: "#94a3b8", fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip
                  content={({ active, payload, label }) =>
                    active && payload?.length ? (
                      <div className="chart-tooltip">
                        <b>{label}</b>
                        {payload.map((p) => (
                          <span key={p.dataKey as string}>{p.name}: {(p.value as number).toLocaleString()} คน</span>
                        ))}
                      </div>
                    ) : null
                  }
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="มารักษา" fill="#a5b4fc" radius={[6, 6, 0, 0]} maxBarSize={40} animationDuration={750} />
                <Bar dataKey="ขาดการรักษา" fill="#f59e0b" radius={[6, 6, 0, 0]} maxBarSize={40} animationDuration={750} />
                <Bar dataKey="ก่อซ้ำ" fill="#a03d68" radius={[6, 6, 0, 0]} maxBarSize={40} animationDuration={750} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Residence Composition Donut */}
        <CompositionDonutCard
          total={indicator4SeverityBreakdown.reduce((sum, g) => sum + g.type1.count + g.type3.count + g.other.count, 0)}
          segments={[
            {
              name: "ตัวอยู่ ทะเบียนบ้านอยู่",
              value: indicator4SeverityBreakdown.reduce((sum, g) => sum + g.type1.count, 0),
              color: "#4338ca", glow: "#818cf8", icon: HeartPulse,
            },
            {
              name: "ตัวอยู่ ทะเบียนบ้านไม่อยู่",
              value: indicator4SeverityBreakdown.reduce((sum, g) => sum + g.type3.count, 0),
              color: "#3a6fb0", glow: "#7dd3fc", icon: MapPin,
            },
            {
              name: "อื่นๆ ตาม Last visit",
              value: indicator4SeverityBreakdown.reduce((sum, g) => sum + g.other.count, 0),
              color: "#a03d68", glow: "#f472b6", icon: ClipboardList,
            },
          ]}
        />
      </div>

      {/* ===== SECTION 5: ตัวชี้วัดที่ 5 — ร้อยละติดตามตามเกณฑ์ ===== */}
      <div className="indicator-group-head indicator-group-head-sub">
        <span className="indicator-badge indicator-badge-5"><ListChecks size={13} /> Section 5 · ตัวชี้วัด 5</span>
        <h2><Link href="/indicator-5" className="indicator-title-link"><span className="indicator-title-shimmer" aria-hidden="true" /><span className="indicator-title-link-text">{indicator5Name}</span><ExternalLink size={15} className="indicator-title-link-icon" /></Link></h2>
      </div>

      <section className="stats-grid" aria-label="สถิติตัวชี้วัดที่ 5">
        <StatCard icon={Users} tone="blue" label="ผู้ป่วยทั้งหมด (B)" value={`${indicator5Metrics.total.toLocaleString()}`} note="มารับบริการในปีงบประมาณ" index={0} featured />
        <StatCard icon={ListChecks} tone="teal" label="ได้รับการติดตามตามเกณฑ์ (A)" value={`${indicator5Metrics.followed.toLocaleString()}`} note="ติดตามครบตามเกณฑ์" index={1} />
        <StatCard icon={Percent} tone="teal" label="ร้อยละติดตาม" value={`${indicator5FollowRate}%`} note="[A/B]x100" index={2} />
        <StatCard icon={MapPin} tone="blue" label="จำนวนอำเภอ" value={`${indicator5AmphoeList.length}`} note="ครบทุกอำเภอ" index={3} />
      </section>

      <div className="overview-two-col">
        {/* Follow Rate by Amphoe */}
        <section className="panel analytics-card">
          <div className="panel-heading">
            <div><p className="eyebrow"><ChartNoAxesCombined size={12} /> เปรียบเทียบอำเภอ</p><h2>ร้อยละติดตามตามเกณฑ์ แยกตามอำเภอ</h2></div>
          </div>
          <div className="chart-wrap chart-wrap-tall" aria-label="กราฟร้อยละติดตามตามเกณฑ์แยกตามอำเภอ">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={indicator5AmphoeStats} layout="vertical" margin={{ top: 4, right: 24, left: 0, bottom: 0 }}>
                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 11 }} />
                <YAxis dataKey="amphoe" type="category" axisLine={false} tickLine={false} width={78} tick={{ fill: "#475569", fontSize: 12 }} />
                <Tooltip
                  cursor={{ fill: "rgba(67,56,202,.05)" }}
                  content={({ active, payload }) =>
                    active && payload?.[0] ? (
                      <div className="chart-tooltip">
                        <b>{payload[0].value}%</b>
                        <span>{payload[0].payload.amphoe}</span>
                      </div>
                    ) : null
                  }
                />
                <Bar dataKey="followRate" radius={[0, 12, 12, 0]} animationDuration={850}>
                  {indicator5AmphoeStats.map((entry, i) => (
                    <Cell key={entry.amphoe} fill={i === 0 ? "#3730a3" : i < 3 ? "#4f46e5" : "#a5b4fc"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* New vs Old Patient Composition Donut */}
        <CompositionDonutCard
          total={indicator5NewOldBreakdown.newTotal + indicator5NewOldBreakdown.oldTotal}
          segments={[
            { name: "ผู้ป่วยรายใหม่", value: indicator5NewOldBreakdown.newTotal, color: "#3a6fb0", glow: "#7dd3fc", icon: UserPlus },
            { name: "ผู้ป่วยรายเก่า", value: indicator5NewOldBreakdown.oldTotal, color: "#4338ca", glow: "#818cf8", icon: Users },
          ]}
        />
      </div>

      {/* ===== SECTION 6: ตัวชี้วัดที่เกี่ยวข้อง 14 — อัตรารักษาต่อเนื่อง (F20-F29) ===== */}
      <div className="indicator-group-head indicator-group-head-sub">
        <span className="indicator-badge indicator-badge-14"><HeartPulse size={13} /> Section 6 · ตัวชี้วัดที่เกี่ยวข้อง 14</span>
        <h2><Link href="/indicator-relate-14" className="indicator-title-link"><span className="indicator-title-shimmer" aria-hidden="true" /><span className="indicator-title-link-text">{indicatorRelate14Name}</span><ExternalLink size={15} className="indicator-title-link-icon" /></Link></h2>
      </div>

      <section className="stats-grid" aria-label="สถิติตัวชี้วัดที่เกี่ยวข้อง 14">
        <StatCard icon={Users} tone="blue" label="มารับบริการทั้งหมด (B)" value={`${indicatorRelate14Metrics?.servedOctFeb.toLocaleString() ?? "-"}`} note="ในปีงบประมาณ" index={0} featured />
        <StatCard icon={ListChecks} tone="teal" label="ติดตามต่อเนื่อง (A)" value={`${indicatorRelate14Metrics?.followed1x.toLocaleString() ?? "-"}`} note="อย่างน้อย 1 ครั้งภายใน 6 เดือน" index={1} />
        <StatCard icon={Percent} tone="teal" label="อัตราการรักษาต่อเนื่อง" value={`${indicatorRelate14Metrics?.rateAB ?? "-"}%`} note="(A/B) x 100" index={2} />
        <StatCard icon={HeartPulse} tone="purple" label="รวมทั้งปี (C)" value={`${indicatorRelate14Metrics?.totalCurrentYear.toLocaleString() ?? "-"}`} note="ผู้ป่วยจิตเภทสะสม" index={3} />
      </section>

      <div className="overview-two-col">
        {/* Continuous Treatment Rate by Amphoe */}
        <section className="panel analytics-card">
          <div className="panel-heading">
            <div><p className="eyebrow"><ChartNoAxesCombined size={12} /> เปรียบเทียบอำเภอ</p><h2>อัตรารักษาต่อเนื่องภายใน 6 เดือน แยกตามอำเภอ</h2></div>
          </div>
          <div className="chart-wrap chart-wrap-tall" aria-label="กราฟอัตรารักษาต่อเนื่องแยกตามอำเภอ">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={indicatorRelate14AmphoeStats} layout="vertical" margin={{ top: 4, right: 24, left: 0, bottom: 0 }}>
                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 11 }} />
                <YAxis dataKey="amphoe" type="category" axisLine={false} tickLine={false} width={78} tick={{ fill: "#475569", fontSize: 12 }} />
                <Tooltip
                  cursor={{ fill: "rgba(181,38,95,.05)" }}
                  content={({ active, payload }) =>
                    active && payload?.[0] ? (
                      <div className="chart-tooltip">
                        <b>{payload[0].value}%</b>
                        <span>{payload[0].payload.amphoe}</span>
                      </div>
                    ) : null
                  }
                />
                <Bar dataKey="rateAB" radius={[0, 12, 12, 0]} animationDuration={850}>
                  {indicatorRelate14AmphoeStats.map((entry) => (
                    <Cell key={entry.amphoe} fill={entry.rateAB >= indicatorRelate14Insights.avgRate ? "#4338ca" : "#b5265f"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Compliance Tier Donut */}
        <CompositionDonutCard
          total={indicatorRelate14AmphoeStats.length}
          segments={[
            { name: `ผ่านเกณฑ์ (≥${indicatorRelate14Insights.avgRate}%)`, value: indicatorRelate14AmphoeStats.filter((a) => a.rateAB >= indicatorRelate14Insights.avgRate).length, color: "#4338ca", glow: "#818cf8", icon: ShieldCheck },
            { name: `ต่ำกว่าเกณฑ์ (<${indicatorRelate14Insights.avgRate}%)`, value: indicatorRelate14Insights.belowAvgCount, color: "#b5265f", glow: "#f472b6", icon: TrendingDown },
          ]}
        />
      </div>

      {/* ===== SECTION 15: ตัวชี้วัดที่เกี่ยวข้อง 15 — ติดตามครั้งที่ 1 vs 2 (F20-F29) ===== */}
      <div className="indicator-group-head indicator-group-head-sub">
        <span className="indicator-badge indicator-badge-15"><Repeat2 size={13} /> Section ที่ 7 · ตัวชี้วัดที่เกี่ยวข้อง 15</span>
        <h2><Link href="/indicator-relate-15" className="indicator-title-link"><span className="indicator-title-shimmer" aria-hidden="true" /><span className="indicator-title-link-text">{indicatorRelate15Name}</span><ExternalLink size={15} className="indicator-title-link-icon" /></Link></h2>
      </div>

      <section className="stats-grid" aria-label="สถิติตัวชี้วัดที่เกี่ยวข้อง 15">
        <StatCard icon={HeartPulse} tone="purple" label="สะสมทั้งหมด" value={`${indicatorRelate15Metrics?.cumulativeTotal.toLocaleString() ?? "-"}`} note="ผู้ป่วยจิตเภทสะสม" index={0} featured />
        <StatCard icon={Users} tone="blue" label="เข้าถึงบริการ 5 ปีย้อนหลัง (B)" value={`${indicatorRelate15Metrics?.served5yr.toLocaleString() ?? "-"}`} note="ปีงบ 2565-2569" index={1} />
        <StatCard icon={ListChecks} tone="teal" label="ติดตามครั้งที่ 1 (A1)" value={`${indicatorRelate15Metrics?.followed1x.toLocaleString() ?? "-"}`} note={`${indicatorRelate15Metrics?.rate1x ?? "-"}%`} index={2} />
        <StatCard icon={Repeat2} tone="teal" label="ติดตามครั้งที่ 2 (A2)" value={`${indicatorRelate15Metrics?.followed2x.toLocaleString() ?? "-"}`} note={`${indicatorRelate15Metrics?.rate2x ?? "-"}%`} index={3} />
      </section>

      <div className="overview-two-col">
        {/* Follow-up Rate 1x vs 2x by Amphoe */}
        <section className="panel analytics-card">
          <div className="panel-heading">
            <div><p className="eyebrow"><ChartNoAxesCombined size={12} /> เปรียบเทียบอำเภอ</p><h2>อัตราการดูแลต่อเนื่อง ครั้งที่ 1 vs ครั้งที่ 2</h2></div>
          </div>
          <div className="chart-wrap chart-wrap-tall" aria-label="กราฟอัตราติดตามครั้งที่ 1 และ 2 แยกตามอำเภอ">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={indicatorRelate15AmphoeStats} layout="vertical" margin={{ top: 4, right: 24, left: 0, bottom: 0 }}>
                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 11 }} />
                <YAxis dataKey="amphoe" type="category" axisLine={false} tickLine={false} width={78} tick={{ fill: "#475569", fontSize: 12 }} />
                <Tooltip
                  cursor={{ fill: "rgba(67,56,202,.05)" }}
                  content={({ active, payload }) =>
                    active && payload?.length ? (
                      <div className="chart-tooltip">
                        <b>ครั้งที่ 1: {payload.find((p) => p.dataKey === "rate1x")?.value ?? 0}%</b>
                        <b>ครั้งที่ 2: {payload.find((p) => p.dataKey === "rate2x")?.value ?? 0}%</b>
                        <span>{payload[0].payload.amphoe}</span>
                      </div>
                    ) : null
                  }
                />
                <Bar dataKey="rate1x" radius={[0, 6, 6, 0]} animationDuration={850} fill="#c7d2fe" />
                <Bar dataKey="rate2x" radius={[0, 6, 6, 0]} animationDuration={850} fill="#4338ca" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="facility-compare-legend">
            <span><i className="facility-dot" style={{ background: "#c7d2fe" }} /> ติดตามครั้งที่ 1</span>
            <span><i className="facility-dot" style={{ background: "#4338ca" }} /> ติดตามครั้งที่ 2</span>
          </div>
        </section>

        {/* Follow-up Attrition Donut */}
        <CompositionDonutCard
          total={indicatorRelate15Metrics?.followed1x ?? 0}
          segments={[
            { name: "ติดตามครบครั้งที่ 2", value: indicatorRelate15Metrics?.followed2x ?? 0, color: "#4338ca", glow: "#818cf8", icon: ShieldCheck },
            { name: "หลุดหลังครั้งที่ 1", value: Math.max((indicatorRelate15Metrics?.followed1x ?? 0) - (indicatorRelate15Metrics?.followed2x ?? 0), 0), color: "#f59e0b", glow: "#fcd34d", icon: TrendingDown },
          ]}
        />
      </div>

      {/* ===== SECTION 8: ตัวชี้วัดที่เกี่ยวข้อง 16 — อัตรารักษาต่อเนื่อง ===== */}
      <div className="indicator-group-head indicator-group-head-sub">
        <span className="indicator-badge indicator-badge-16"><Percent size={13} /> Section ที่ 8 · ตัวชี้วัดที่เกี่ยวข้อง 16</span>
        <h2><Link href="/indicator-relate-16" className="indicator-title-link"><span className="indicator-title-shimmer" aria-hidden="true" /><span className="indicator-title-link-text">{indicatorRelate16Name}</span><ExternalLink size={15} className="indicator-title-link-icon" /></Link></h2>
      </div>

      <section className="stats-grid" aria-label="สถิติตัวชี้วัดที่เกี่ยวข้อง 16">
        <StatCard icon={Users} tone="blue" label="ผู้ป่วยทั้งหมด (B)" value={`${indicatorRelate16Metrics?.total.toLocaleString() ?? "-"}`} note="ในปีงบประมาณ" index={0} featured />
        <StatCard icon={ListChecks} tone="teal" label="ติดตามต่อเนื่อง (A)" value={`${indicatorRelate16Metrics?.followed.toLocaleString() ?? "-"}`} note="ภายใน 6 เดือน" index={1} />
        <StatCard icon={Percent} tone="teal" label="อัตราการรักษาต่อเนื่อง" value={`${indicatorRelate16Metrics?.rate ?? "-"}%`} note="(A/B) x 100" index={2} />
      </section>

      <div className="overview-two-col">
        {/* Rate by Amphoe */}
        <section className="panel analytics-card">
          <div className="panel-heading">
            <div><p className="eyebrow"><ChartNoAxesCombined size={12} /> เปรียบเทียบอำเภอ</p><h2>อัตราการรักษาต่อเนื่อง แยกตามอำเภอ</h2></div>
          </div>
          <div className="chart-wrap chart-wrap-tall" aria-label="กราฟอัตรารักษาต่อเนื่องแยกตามอำเภอ">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={indicatorRelate16AmphoeStats} layout="vertical" margin={{ top: 4, right: 24, left: 0, bottom: 0 }}>
                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 11 }} />
                <YAxis dataKey="amphoe" type="category" axisLine={false} tickLine={false} width={78} tick={{ fill: "#475569", fontSize: 12 }} />
                <Tooltip
                  cursor={{ fill: "rgba(67,56,202,.05)" }}
                  content={({ active, payload }) =>
                    active && payload?.[0] ? (
                      <div className="chart-tooltip">
                        <b>{payload[0].value}%</b>
                        <span>{payload[0].payload.amphoe}</span>
                      </div>
                    ) : null
                  }
                />
                <Bar dataKey="rate" radius={[0, 12, 12, 0]} animationDuration={850}>
                  {indicatorRelate16AmphoeStats.map((entry) => (
                    <Cell key={entry.amphoe} fill={entry.rate >= indicatorRelate16Insights.avgRate ? "#4338ca" : "#f59e0b"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Compliance Tier Donut */}
        <CompositionDonutCard
          total={indicatorRelate16AmphoeStats.length}
          segments={[
            { name: `ผ่านเกณฑ์ (≥${indicatorRelate16Insights.avgRate}%)`, value: indicatorRelate16AmphoeStats.filter((a) => a.rate >= indicatorRelate16Insights.avgRate).length, color: "#4338ca", glow: "#818cf8", icon: ShieldCheck },
            { name: `ต่ำกว่าเกณฑ์ (<${indicatorRelate16Insights.avgRate}%)`, value: indicatorRelate16Insights.belowAvgCount, color: "#f59e0b", glow: "#fcd34d", icon: TrendingDown },
          ]}
        />
      </div>

      {/* ===== SECTION 9: ตัวชี้วัดที่เกี่ยวข้อง 21.1 — สารเสพติด (F10-F19) ===== */}
      <div className="indicator-group-head indicator-group-head-sub">
        <span className="indicator-badge indicator-badge-14"><Pill size={13} /> Section ที่ 9 · ตัวชี้วัดที่เกี่ยวข้อง 21.1</span>
        <h2><Link href="/indicator-relate-21-1" className="indicator-title-link"><span className="indicator-title-shimmer" aria-hidden="true" /><span className="indicator-title-link-text">{getSimpleIndicator("21_1").name}</span><ExternalLink size={15} className="indicator-title-link-icon" /></Link></h2>
      </div>

      {(() => {
        const analysis21_1 = getSimpleIndicatorAnalysis("21_1");
        const substanceData = analysis21_1.kind === "donut" ? analysis21_1.data : [];
        const substanceTotal = analysis21_1.kind === "donut" ? analysis21_1.total : 0;
        const top = substanceData[0];
        return (
          <>
            <section className="stats-grid" aria-label="สถิติตัวชี้วัดที่เกี่ยวข้อง 21.1">
              <StatCard
                icon={Pill}
                tone="purple"
                label={getSimpleIndicatorHeadline("21_1")?.label ?? "ผู้ป่วยสารเสพติดรวม"}
                value={`${getSimpleIndicatorHeadline("21_1")?.value?.toLocaleString() ?? "-"}${getSimpleIndicatorHeadline("21_1")?.unit ?? ""}`}
                note="ทั้งจังหวัด"
                index={0}
                featured
              />
              <StatCard icon={ClipboardList} tone="purple" label="รหัสโรคเด่นสุด" value={top?.label ?? "-"} note={`${top?.value.toLocaleString() ?? 0} คน`} index={1} />
              <StatCard icon={Users} tone="purple" label="รวมทุกรหัสโรค" value={substanceTotal.toLocaleString()} note="F10.xx – F19.xx" index={2} />
              <StatCard icon={Percent} tone="purple" label="สัดส่วนรหัสเด่นสุด" value={`${substanceTotal > 0 && top ? Math.round((top.value / substanceTotal) * 100) : 0}%`} note="ของผู้ป่วยสารเสพติดทั้งหมด" index={3} />
            </section>

            <div className="overview-two-col">
              {/* Substance Code Bar */}
              <section className="panel analytics-card">
                <div className="panel-heading">
                  <div><p className="eyebrow"><ChartNoAxesCombined size={12} /> จำแนกตามรหัสโรค</p><h2>สัดส่วนตามรหัสโรคสารเสพติด</h2></div>
                </div>
                <div className="chart-wrap chart-wrap-tall" aria-label="กราฟสัดส่วนผู้ป่วยตามรหัสโรคสารเสพติด">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={substanceData} layout="vertical" margin={{ top: 4, right: 24, left: 0, bottom: 0 }}>
                      <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 11 }} />
                      <YAxis dataKey="label" type="category" axisLine={false} tickLine={false} width={78} tick={{ fill: "#475569", fontSize: 12 }} />
                      <Tooltip
                        cursor={{ fill: "rgba(67,56,202,.05)" }}
                        content={({ active, payload }) =>
                          active && payload?.[0] ? (
                            <div className="chart-tooltip">
                              <b>{payload[0].value?.toLocaleString()} คน</b>
                              <span>{payload[0].payload.label}</span>
                            </div>
                          ) : null
                        }
                      />
                      <Bar dataKey="value" radius={[0, 12, 12, 0]} animationDuration={850}>
                        {substanceData.map((entry, i) => (
                          <Cell key={`${entry.label}-${i}`} fill={i === 0 ? "#3730a3" : i < 3 ? "#4f46e5" : "#a5b4fc"} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </section>

              {/* Substance Code Composition Donut */}
              <CompositionDonutCard
                total={substanceTotal}
                segments={substanceData.slice(0, 4).map((d, i) => ({
                  name: d.label,
                  value: d.value,
                  color: ["#4338ca", "#6366f1", "#22d3ee", "#a5b4fc"][i % 4],
                  glow: ["#818cf8", "#a5b4fc", "#67e8f9", "#e0e7ff"][i % 4],
                  icon: Pill,
                }))}
              />
            </div>
          </>
        );
      })()}

      {/* ===== SECTION 10: ตัวชี้วัดที่เกี่ยวข้อง 21.2 — OPD/IPD สารเสพติด ===== */}
      <div className="indicator-group-head indicator-group-head-sub">
        <span className="indicator-badge indicator-badge-14"><Stethoscope size={13} /> Section ที่ 10 · ตัวชี้วัดที่เกี่ยวข้อง 21.2</span>
        <h2><Link href="/indicator-relate-21-2" className="indicator-title-link"><span className="indicator-title-shimmer" aria-hidden="true" /><span className="indicator-title-link-text">{indicatorRelate21_2Name}</span><ExternalLink size={15} className="indicator-title-link-icon" /></Link></h2>
      </div>

      <section className="stats-grid" aria-label="สถิติตัวชี้วัดที่เกี่ยวข้อง 21.2">
        <StatCard icon={Stethoscope} tone="blue" label="ผู้ป่วยนอกทั้งหมด (B1)" value={`${indicatorRelate21_2Metrics?.opdTotal.toLocaleString() ?? "-"}`} note="F00-F99 ทั้งจังหวัด" index={0} featured />
        <StatCard icon={Pill} tone="purple" label="ผู้ป่วยนอกสารเสพติด (A1)" value={`${indicatorRelate21_2Metrics?.opdF1019.toLocaleString() ?? "-"}`} note={`${indicatorRelate21_2Metrics?.opdRate ?? "-"}% ของผู้ป่วยนอกทั้งหมด`} index={1} />
        <StatCard icon={Hospital} tone="blue" label="ผู้ป่วยในทั้งหมด (B2)" value={`${indicatorRelate21_2Metrics?.ipdTotal.toLocaleString() ?? "-"}`} note="F00-F99 ทั้งจังหวัด" index={2} />
        <StatCard icon={Pill} tone="purple" label="ผู้ป่วยในสารเสพติด (A2)" value={`${indicatorRelate21_2Metrics?.ipdF1019.toLocaleString() ?? "-"}`} note={`${indicatorRelate21_2Metrics?.ipdRate ?? "-"}% ของผู้ป่วยในทั้งหมด`} index={3} />
      </section>

      <div className="overview-two-col">
        {/* OPD Substance Rate by Amphoe */}
        <section className="panel analytics-card">
          <div className="panel-heading">
            <div><p className="eyebrow"><ChartNoAxesCombined size={12} /> เปรียบเทียบอำเภอ</p><h2>ร้อยละผู้ป่วยนอกสารเสพติด แยกตามอำเภอ</h2></div>
          </div>
          <div className="chart-wrap chart-wrap-tall" aria-label="กราฟร้อยละผู้ป่วยนอกสารเสพติดแยกตามอำเภอ">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={indicatorRelate21_2AmphoeStats} layout="vertical" margin={{ top: 4, right: 24, left: 0, bottom: 0 }}>
                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 11 }} />
                <YAxis dataKey="amphoe" type="category" axisLine={false} tickLine={false} width={78} tick={{ fill: "#475569", fontSize: 12 }} />
                <Tooltip
                  cursor={{ fill: "rgba(67,56,202,.05)" }}
                  content={({ active, payload }) =>
                    active && payload?.[0] ? (
                      <div className="chart-tooltip">
                        <b>{payload[0].value}%</b>
                        <span>{payload[0].payload.amphoe}</span>
                      </div>
                    ) : null
                  }
                />
                <Bar dataKey="opdRate" radius={[0, 12, 12, 0]} animationDuration={850}>
                  {indicatorRelate21_2AmphoeStats.map((entry) => (
                    <Cell key={entry.amphoe} fill={entry.opdRate >= indicatorRelate21_2Insights.avgRate ? "#4338ca" : "#f59e0b"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* OPD vs IPD Composition Donut */}
        <CompositionDonutCard
          total={(indicatorRelate21_2Metrics?.opdF1019 ?? 0) + (indicatorRelate21_2Metrics?.ipdF1019 ?? 0)}
          segments={[
            { name: "ผู้ป่วยนอกสารเสพติด (OPD)", value: indicatorRelate21_2Metrics?.opdF1019 ?? 0, color: "#4338ca", glow: "#818cf8", icon: Stethoscope },
            { name: "ผู้ป่วยในสารเสพติด (IPD)", value: indicatorRelate21_2Metrics?.ipdF1019 ?? 0, color: "#a03d68", glow: "#f472b6", icon: Hospital },
          ]}
        />
      </div>

      {/* ===== SECTION 11: ตัวชี้วัดที่เกี่ยวข้อง 21.4 — กลุ่มโรคร่วมทางจิต ===== */}
      <div className="indicator-group-head indicator-group-head-sub">
        <span className="indicator-badge indicator-badge-14"><HeartPulse size={13} /> Section ที่ 11 · ตัวชี้วัดที่เกี่ยวข้อง 21.4</span>
        <h2><Link href="/indicator-relate-21-4" className="indicator-title-link"><span className="indicator-title-shimmer" aria-hidden="true" /><span className="indicator-title-link-text">{getSimpleIndicator("21_4").name}</span><ExternalLink size={15} className="indicator-title-link-icon" /></Link></h2>
      </div>

      {(() => {
        const analysis21_4 = getSimpleIndicatorAnalysis("21_4");
        const comorbidData = analysis21_4.kind === "donut" ? analysis21_4.data : [];
        const comorbidTotal = analysis21_4.kind === "donut" ? analysis21_4.total : 0;
        const top = comorbidData[0];
        return (
          <>
            <section className="stats-grid" aria-label="สถิติตัวชี้วัดที่เกี่ยวข้อง 21.4">
              <StatCard
                icon={HeartPulse}
                tone="purple"
                label={getSimpleIndicatorHeadline("21_4")?.label ?? "ผู้ป่วยโรคร่วมทางจิตรวม"}
                value={`${getSimpleIndicatorHeadline("21_4")?.value?.toLocaleString() ?? "-"}${getSimpleIndicatorHeadline("21_4")?.unit ?? ""}`}
                note="ทั้งจังหวัด"
                index={0}
                featured
              />
              <StatCard icon={ClipboardList} tone="purple" label="กลุ่มโรคเด่นสุด" value={top?.label ?? "-"} note={`${top?.value.toLocaleString() ?? 0} คน`} index={1} />
              <StatCard icon={Users} tone="purple" label="รวมทุกกลุ่มโรค" value={comorbidTotal.toLocaleString()} note="Top 8 กลุ่มโรคร่วม" index={2} />
              <StatCard icon={Percent} tone="purple" label="สัดส่วนกลุ่มเด่นสุด" value={`${comorbidTotal > 0 && top ? Math.round((top.value / comorbidTotal) * 100) : 0}%`} note="ของผู้ป่วยโรคร่วมทั้งหมด" index={3} />
            </section>

            <div className="overview-two-col">
              {/* Comorbid Disease Bar */}
              <section className="panel analytics-card">
                <div className="panel-heading">
                  <div><p className="eyebrow"><ChartNoAxesCombined size={12} /> จำแนกตามกลุ่มโรค</p><h2>สัดส่วนตามกลุ่มโรคร่วมทางจิต (Top 8)</h2></div>
                </div>
                <div className="chart-wrap chart-wrap-tall" aria-label="กราฟสัดส่วนผู้ป่วยตามกลุ่มโรคร่วมทางจิต">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={comorbidData} layout="vertical" margin={{ top: 4, right: 24, left: 0, bottom: 0 }}>
                      <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 11 }} />
                      <YAxis dataKey="label" type="category" axisLine={false} tickLine={false} width={100} tick={{ fill: "#475569", fontSize: 11 }} />
                      <Tooltip
                        cursor={{ fill: "rgba(67,56,202,.05)" }}
                        content={({ active, payload }) =>
                          active && payload?.[0] ? (
                            <div className="chart-tooltip">
                              <b>{payload[0].value?.toLocaleString()} คน</b>
                              <span>{payload[0].payload.label}</span>
                            </div>
                          ) : null
                        }
                      />
                      <Bar dataKey="value" radius={[0, 12, 12, 0]} animationDuration={850}>
                        {comorbidData.map((entry, i) => (
                          <Cell key={`${entry.label}-${i}`} fill={i === 0 ? "#3730a3" : i < 3 ? "#4f46e5" : "#a5b4fc"} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </section>

              {/* Comorbid Disease Composition Donut */}
              <CompositionDonutCard
                total={comorbidTotal}
                segments={comorbidData.slice(0, 4).map((d, i) => ({
                  name: d.label,
                  value: d.value,
                  color: ["#4338ca", "#6366f1", "#22d3ee", "#a5b4fc"][i % 4],
                  glow: ["#818cf8", "#a5b4fc", "#67e8f9", "#e0e7ff"][i % 4],
                  icon: HeartPulse,
                }))}
              />
            </div>
          </>
        );
      })()}

      {/* ===== SECTION 12: ตัวชี้วัดที่เกี่ยวข้อง 21.6 — Retention Rate หลังบำบัดยาเสพติด ===== */}
      <div className="indicator-group-head indicator-group-head-sub">
        <span className="indicator-badge indicator-badge-14"><ShieldCheck size={13} /> Section ที่ 12 · ตัวชี้วัดที่เกี่ยวข้อง 21.6</span>
        <h2><Link href="/indicator-relate-21-6" className="indicator-title-link"><span className="indicator-title-shimmer" aria-hidden="true" /><span className="indicator-title-link-text">{indicatorRelate21_6Name}</span><ExternalLink size={15} className="indicator-title-link-icon" /></Link></h2>
      </div>

      <section className="stats-grid" aria-label="สถิติตัวชี้วัดที่เกี่ยวข้อง 21.6">
        <StatCard icon={HeartPulse} tone="blue" label="ผู้ป่วยจิตเวชจาก บสต. ทั้งหมด" value={`${indicatorRelate21_6Metrics?.totalPsychFromBsot.toLocaleString() ?? "-"}`} note="ทั้งหมดในกลุ่มโรคจิตเวช" index={0} featured />
        <StatCard icon={Percent} tone="teal" label="Retention Rate เฉลี่ยจังหวัด" value={`${indicatorRelate21_6Metrics?.retentionRateOverall ?? "-"}%`} note="ติดตามดูแลหลังบำบัดต่อเนื่อง" index={1} />
      </section>

      <div className="overview-two-col">
        {/* Retention Rate by Amphoe */}
        <section className="panel analytics-card">
          <div className="panel-heading">
            <div><p className="eyebrow"><ChartNoAxesCombined size={12} /> เปรียบเทียบอำเภอ</p><h2>Retention Rate หลังบำบัด แยกตามอำเภอ</h2></div>
          </div>
          <div className="chart-wrap chart-wrap-tall" aria-label="กราฟ Retention Rate แยกตามอำเภอ">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={indicatorRelate21_6AmphoeStats} layout="vertical" margin={{ top: 4, right: 24, left: 0, bottom: 0 }}>
                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 11 }} />
                <YAxis dataKey="amphoe" type="category" axisLine={false} tickLine={false} width={78} tick={{ fill: "#475569", fontSize: 12 }} />
                <Tooltip
                  cursor={{ fill: "rgba(67,56,202,.05)" }}
                  content={({ active, payload }) =>
                    active && payload?.[0] ? (
                      <div className="chart-tooltip">
                        <b>{payload[0].value}%</b>
                        <span>{payload[0].payload.amphoe}</span>
                      </div>
                    ) : null
                  }
                />
                <Bar dataKey="retentionRateOverall" radius={[0, 12, 12, 0]} animationDuration={850}>
                  {indicatorRelate21_6AmphoeStats.map((entry) => (
                    <Cell key={entry.amphoe} fill={entry.retentionRateOverall >= indicatorRelate21_6Insights.avgRate ? "#4338ca" : "#f59e0b"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Compliance Tier Donut */}
        <CompositionDonutCard
          total={indicatorRelate21_6AmphoeStats.length}
          segments={[
            { name: `ผ่านเกณฑ์ (≥${indicatorRelate21_6Insights.avgRate}%)`, value: indicatorRelate21_6AmphoeStats.filter((a) => a.retentionRateOverall >= indicatorRelate21_6Insights.avgRate).length, color: "#4338ca", glow: "#818cf8", icon: ShieldCheck },
            { name: `ต่ำกว่าเกณฑ์ (<${indicatorRelate21_6Insights.avgRate}%)`, value: indicatorRelate21_6Insights.belowAvgCount, color: "#f59e0b", glow: "#fcd34d", icon: TrendingDown },
          ]}
        />
      </div>

      {/* ===== SECTION 13: ตัวชี้วัดที่เกี่ยวข้อง 21.7 — อัตราเข้าถึงบริการ/ความชุกโรค ===== */}
      <div className="indicator-group-head indicator-group-head-sub">
        <span className="indicator-badge indicator-badge-14"><Gauge size={13} /> Section ที่ 13 · ตัวชี้วัดที่เกี่ยวข้อง 21.7</span>
        <h2><Link href="/indicator-relate-21-7" className="indicator-title-link"><span className="indicator-title-shimmer" aria-hidden="true" /><span className="indicator-title-link-text">{getSimpleIndicator("21_7").name}</span><ExternalLink size={15} className="indicator-title-link-icon" /></Link></h2>
      </div>

      {(() => {
        const analysis21_7 = getSimpleIndicatorAnalysis("21_7");
        const items = analysis21_7.kind === "metrics" ? analysis21_7.items : [];
        const icons = [Users, MapPin, ClipboardList];
        return (
          <section className="panel rate-compare-card">
            <div className="panel-heading">
              <div><p className="eyebrow"><Gauge size={12} /> ระดับจังหวัด</p><h2>อัตราเข้าถึงบริการ และร้อยละความชุกของโรค</h2></div>
            </div>
            <div className="rate-compare-list">
              {items.map((r, i) => {
                const Icon = icons[i % icons.length];
                return (
                  <div className="rate-compare-item" key={r.label}>
                    <div className="rate-compare-ring" style={{ "--pct": `${Math.min(r.value, 100)}%` } as React.CSSProperties}>
                      <span>{r.value}%</span>
                    </div>
                    <p><Icon size={13} /> {r.label}</p>
                  </div>
                );
              })}
            </div>
          </section>
        );
      })()}

      {/* ===== SECTION 14: ตัวชี้วัดที่เกี่ยวข้อง 22.1 — จำแนกตามกลุ่มอายุ x กลุ่มโรค ===== */}
      <div className="indicator-group-head indicator-group-head-sub">
        <span className="indicator-badge indicator-badge-14"><Users2 size={13} /> Section ที่ 14 · ตัวชี้วัดที่เกี่ยวข้อง 22.1</span>
        <h2><Link href="/indicator-relate-22-1" className="indicator-title-link"><span className="indicator-title-shimmer" aria-hidden="true" /><span className="indicator-title-link-text">{getSimpleIndicator("22_1").name}</span><ExternalLink size={15} className="indicator-title-link-icon" /></Link></h2>
      </div>

      {(() => {
        const analysis22_1 = getSimpleIndicatorAnalysis("22_1");
        if (analysis22_1.kind !== "heatmap" || analysis22_1.matrix.length === 0) return null;
        const { rows, cols, matrix } = analysis22_1;
        const colTotals = cols.map((_, ci) => matrix.reduce((s, row) => s + (row[ci] ?? 0), 0));
        const rowTotals = rows.map((_, ri) => matrix[ri].reduce((s, v) => s + v, 0));
        const grandTotal = colTotals.reduce((s, v) => s + v, 0);
        const topColIdx = colTotals.reduce((best, v, i) => (v > colTotals[best] ? i : best), 0);
        const topRowIdx = rowTotals.reduce((best, v, i) => (v > rowTotals[best] ? i : best), 0);
        const diseaseBarData = cols.map((label, i) => ({ label, value: colTotals[i] })).sort((a, b) => b.value - a.value);

        return (
          <>
            <section className="stats-grid" aria-label="สถิติตัวชี้วัดที่เกี่ยวข้อง 22.1">
              <StatCard icon={Users2} tone="blue" label="ผู้รับบริการรวมทั้งหมด" value={grandTotal.toLocaleString()} note="กลุ่มโรคจิตเวช/พยายามทำร้ายตนเอง" index={0} featured />
              <StatCard icon={ClipboardList} tone="purple" label="กลุ่มโรคเด่นสุด" value={cols[topColIdx] ?? "-"} note={`${colTotals[topColIdx]?.toLocaleString() ?? 0} คน`} index={1} />
              <StatCard icon={CalendarClock} tone="teal" label="กลุ่มอายุเด่นสุด" value={rows[topRowIdx] ?? "-"} note={`${rowTotals[topRowIdx]?.toLocaleString() ?? 0} คน`} index={2} />
              <StatCard icon={Percent} tone="amber" label="สัดส่วนกลุ่มโรคเด่นสุด" value={`${grandTotal > 0 ? Math.round((colTotals[topColIdx] / grandTotal) * 100) : 0}%`} note="ของผู้รับบริการทั้งหมด" index={3} />
            </section>

            <div className="overview-two-col">
              {/* Disease Group Bar */}
              <section className="panel analytics-card">
                <div className="panel-heading">
                  <div><p className="eyebrow"><ChartNoAxesCombined size={12} /> จำแนกตามกลุ่มโรค</p><h2>จำนวนผู้รับบริการตามกลุ่มโรค (Top 8)</h2></div>
                </div>
                <div className="chart-wrap chart-wrap-tall" aria-label="กราฟจำนวนผู้รับบริการตามกลุ่มโรค">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={diseaseBarData} layout="vertical" margin={{ top: 4, right: 24, left: 0, bottom: 0 }}>
                      <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 11 }} />
                      <YAxis dataKey="label" type="category" axisLine={false} tickLine={false} width={100} tick={{ fill: "#475569", fontSize: 11 }} />
                      <Tooltip
                        cursor={{ fill: "rgba(67,56,202,.05)" }}
                        content={({ active, payload }) =>
                          active && payload?.[0] ? (
                            <div className="chart-tooltip">
                              <b>{payload[0].value?.toLocaleString()} คน</b>
                              <span>{payload[0].payload.label}</span>
                            </div>
                          ) : null
                        }
                      />
                      <Bar dataKey="value" radius={[0, 12, 12, 0]} animationDuration={850}>
                        {diseaseBarData.map((entry, i) => (
                          <Cell key={`${entry.label}-${i}`} fill={i === 0 ? "#3730a3" : i < 3 ? "#4f46e5" : "#a5b4fc"} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </section>

              {/* Age Group Composition Donut (จัดกลุ่มอายุให้เหลือ 6 ช่วง อ่านง่าย) */}
              <CompositionDonutCard
                total={grandTotal}
                segments={bucketAgeGroups(rows, rowTotals).map((b, i) => ({
                  name: b.label,
                  value: b.value,
                  color: ["#4338ca", "#6366f1", "#22d3ee", "#a5b4fc", "#818cf8", "#c7d2fe"][i % 6],
                  glow: ["#818cf8", "#a5b4fc", "#67e8f9", "#e0e7ff", "#c7d2fe", "#eef2ff"][i % 6],
                  icon: CalendarClock,
                }))}
              />
            </div>
          </>
        );
      })()}

      {/* ===== SECTION 15: ตัวชี้วัดที่เกี่ยวข้อง 22.2 — สัดส่วนตามกลุ่มโรค ICD-10 ===== */}
      <div className="indicator-group-head indicator-group-head-sub">
        <span className="indicator-badge indicator-badge-14"><ClipboardList size={13} /> Section ที่ 15 · ตัวชี้วัดที่เกี่ยวข้อง 22.2</span>
        <h2><Link href="/indicator-relate-22-2" className="indicator-title-link"><span className="indicator-title-shimmer" aria-hidden="true" /><span className="indicator-title-link-text">{getSimpleIndicator("22_2").name}</span><ExternalLink size={15} className="indicator-title-link-icon" /></Link></h2>
      </div>

      {(() => {
        const analysis22_2 = getSimpleIndicatorAnalysis("22_2");
        const icdData = analysis22_2.kind === "donut" ? analysis22_2.data : [];
        const icdTotal = analysis22_2.kind === "donut" ? analysis22_2.total : 0;
        const top = icdData[0];
        return (
          <>
            <section className="stats-grid" aria-label="สถิติตัวชี้วัดที่เกี่ยวข้อง 22.2">
              <StatCard
                icon={ClipboardList}
                tone="blue"
                label={getSimpleIndicatorHeadline("22_2")?.label ?? "ร้อยละกลุ่มโรคสูงสุด"}
                value={`${getSimpleIndicatorHeadline("22_2")?.value?.toLocaleString() ?? "-"}${getSimpleIndicatorHeadline("22_2")?.unit ?? ""}`}
                note="ทั้งจังหวัด"
                index={0}
                featured
              />
              <StatCard icon={HeartPulse} tone="purple" label="กลุ่มโรคเด่นสุด" value={top?.label ?? "-"} note={`${top?.value.toLocaleString() ?? 0} คน`} index={1} />
              <StatCard icon={Users} tone="teal" label="รวมทุกกลุ่มโรค" value={icdTotal.toLocaleString()} note="ICD-10 ที่พบทั้งหมด" index={2} />
              <StatCard icon={Percent} tone="amber" label="สัดส่วนกลุ่มเด่นสุด" value={`${icdTotal > 0 && top ? Math.round((top.value / icdTotal) * 100) : 0}%`} note="ของผู้ป่วยทั้งหมด" index={3} />
            </section>

            <div className="overview-two-col">
              {/* ICD-10 Group Bar */}
              <section className="panel analytics-card">
                <div className="panel-heading">
                  <div><p className="eyebrow"><ChartNoAxesCombined size={12} /> จำแนกตามรหัสโรค</p><h2>สัดส่วนตามกลุ่มโรค ICD-10</h2></div>
                </div>
                <div className="chart-wrap chart-wrap-tall" aria-label="กราฟสัดส่วนผู้ป่วยตามกลุ่มโรค ICD-10">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={icdData} layout="vertical" margin={{ top: 4, right: 24, left: 0, bottom: 0 }}>
                      <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 11 }} />
                      <YAxis dataKey="label" type="category" axisLine={false} tickLine={false} width={90} tick={{ fill: "#475569", fontSize: 11 }} />
                      <Tooltip
                        cursor={{ fill: "rgba(67,56,202,.05)" }}
                        content={({ active, payload }) =>
                          active && payload?.[0] ? (
                            <div className="chart-tooltip">
                              <b>{payload[0].value?.toLocaleString()} คน</b>
                              <span>{payload[0].payload.label}</span>
                            </div>
                          ) : null
                        }
                      />
                      <Bar dataKey="value" radius={[0, 12, 12, 0]} animationDuration={850}>
                        {icdData.map((entry, i) => (
                          <Cell key={`${entry.label}-${i}`} fill={i === 0 ? "#3730a3" : i < 3 ? "#4f46e5" : "#a5b4fc"} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </section>

              {/* ICD-10 Composition Donut */}
              <CompositionDonutCard
                total={icdTotal}
                segments={icdData.slice(0, 4).map((d, i) => ({
                  name: d.label,
                  value: d.value,
                  color: ["#4338ca", "#6366f1", "#22d3ee", "#a5b4fc"][i % 4],
                  glow: ["#818cf8", "#a5b4fc", "#67e8f9", "#e0e7ff"][i % 4],
                  icon: HeartPulse,
                }))}
              />
            </div>
          </>
        );
      })()}

      {/* ===== SECTION 16: ตัวชี้วัดที่เกี่ยวข้อง 22.3 — จำแนกตามกลุ่มโรค/รายโรค (Top 10) ===== */}
      <div className="indicator-group-head indicator-group-head-sub">
        <span className="indicator-badge indicator-badge-14"><ListChecks size={13} /> Section ที่ 16 · ตัวชี้วัดที่เกี่ยวข้อง 22.3</span>
        <h2><Link href="/indicator-relate-22-3" className="indicator-title-link"><span className="indicator-title-shimmer" aria-hidden="true" /><span className="indicator-title-link-text">{getSimpleIndicator("22_3").name}</span><ExternalLink size={15} className="indicator-title-link-icon" /></Link></h2>
      </div>

      {(() => {
        const analysis22_3 = getSimpleIndicatorAnalysis("22_3");
        const diseaseData = analysis22_3.kind === "breakdown" ? analysis22_3.data : [];
        const total22_3 = diseaseData.reduce((s, d) => s + d.value, 0);
        const top = diseaseData[0];
        return (
          <>
            <section className="stats-grid" aria-label="สถิติตัวชี้วัดที่เกี่ยวข้อง 22.3">
              <StatCard
                icon={ListChecks}
                tone="blue"
                label={getSimpleIndicatorHeadline("22_3")?.label ?? "รวมผู้รับบริการ"}
                value={`${getSimpleIndicatorHeadline("22_3")?.value?.toLocaleString() ?? "-"}${getSimpleIndicatorHeadline("22_3")?.unit ?? ""}`}
                note="ทั้งจังหวัด"
                index={0}
                featured
              />
              <StatCard icon={HeartPulse} tone="purple" label="รายโรคเด่นสุด" value={top?.label ?? "-"} note={`${top?.value.toLocaleString() ?? 0} คน`} index={1} />
              <StatCard icon={Users} tone="teal" label="รวม Top 10 รายโรค" value={total22_3.toLocaleString()} note="เรียงจากมากไปน้อย" index={2} />
              <StatCard icon={Percent} tone="amber" label="สัดส่วนรายโรคเด่นสุด" value={`${total22_3 > 0 && top ? Math.round((top.value / total22_3) * 100) : 0}%`} note="ของ Top 10 รายโรค" index={3} />
            </section>

            <section className="panel analytics-card">
              <div className="panel-heading">
                <div><p className="eyebrow"><ChartNoAxesCombined size={12} /> จำแนกตามรายโรค</p><h2>จำแนกตามกลุ่มโรค/รายโรค (Top 10)</h2></div>
              </div>
              <div className="chart-wrap chart-wrap-tall" aria-label="กราฟจำแนกตามกลุ่มโรค/รายโรค Top 10">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={diseaseData} layout="vertical" margin={{ top: 4, right: 24, left: 0, bottom: 0 }}>
                    <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 11 }} />
                    <YAxis dataKey="label" type="category" axisLine={false} tickLine={false} width={140} tick={{ fill: "#475569", fontSize: 10.5 }} />
                    <Tooltip
                      cursor={{ fill: "rgba(67,56,202,.05)" }}
                      content={({ active, payload }) =>
                        active && payload?.[0] ? (
                          <div className="chart-tooltip">
                            <b>{payload[0].value?.toLocaleString()} คน</b>
                            <span>{payload[0].payload.label}</span>
                          </div>
                        ) : null
                      }
                    />
                    <Bar dataKey="value" radius={[0, 12, 12, 0]} animationDuration={850}>
                      {diseaseData.map((entry, i) => (
                        <Cell key={`${entry.label}-${i}`} fill={i === 0 ? "#3730a3" : i < 3 ? "#4f46e5" : "#a5b4fc"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </section>
          </>
        );
      })()}

      {/* ===== SECTION 17: ตัวชี้วัดที่เกี่ยวข้อง 22.4 — แนวโน้มรายเดือน (ทำร้ายตนเอง) ===== */}
      <div className="indicator-group-head indicator-group-head-sub">
        <span className="indicator-badge indicator-badge-14"><TrendingUp size={13} /> Section ที่ 17 · ตัวชี้วัดที่เกี่ยวข้อง 22.4</span>
        <h2><Link href="/indicator-relate-22-4" className="indicator-title-link"><span className="indicator-title-shimmer" aria-hidden="true" /><span className="indicator-title-link-text">{getSimpleIndicator("22_4").name}</span><ExternalLink size={15} className="indicator-title-link-icon" /></Link></h2>
      </div>

      {(() => {
        const analysis22_4 = getSimpleIndicatorAnalysis("22_4");
        const monthlyData = analysis22_4.kind === "monthly" ? analysis22_4.data : [];
        const total22_4 = analysis22_4.kind === "monthly" ? analysis22_4.total : 0;
        const peak = monthlyData.reduce((best, m) => (m.value > (best?.value ?? -1) ? m : best), monthlyData[0]);
        const avgMonthly = monthlyData.length > 0 ? Math.round((total22_4 / monthlyData.length) * 10) / 10 : 0;
        return (
          <>
            <section className="stats-grid" aria-label="สถิติตัวชี้วัดที่เกี่ยวข้อง 22.4">
              <StatCard
                icon={TrendingUp}
                tone="rose"
                label={getSimpleIndicatorHeadline("22_4")?.label ?? "จำนวนตั้งใจทำร้ายตนเอง"}
                value={`${getSimpleIndicatorHeadline("22_4")?.value?.toLocaleString() ?? "-"}${getSimpleIndicatorHeadline("22_4")?.unit ?? ""}`}
                note="ทั้งจังหวัด"
                index={0}
                featured
              />
              <StatCard icon={CalendarClock} tone="amber" label="เดือนที่สูงสุด" value={peak?.label ?? "-"} note={`${peak?.value.toLocaleString() ?? 0} ครั้ง`} index={1} />
              <StatCard icon={Users} tone="teal" label="รวมทั้งปี" value={total22_4.toLocaleString()} note="12 เดือนย้อนหลัง" index={2} />
              <StatCard icon={Percent} tone="blue" label="เฉลี่ยต่อเดือน" value={`${avgMonthly}`} note="ครั้ง/เดือน" index={3} />
            </section>

            <section className="panel analytics-card">
              <div className="panel-heading">
                <div><p className="eyebrow"><ChartNoAxesCombined size={12} /> แนวโน้มรายเดือน</p><h2>จำนวนครั้งที่ตั้งใจทำร้ายตนเอง รายเดือน</h2></div>
              </div>
              <div className="chart-wrap chart-wrap-tall" aria-label="กราฟแนวโน้มจำนวนครั้งทำร้ายตนเองรายเดือน">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                    <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 11 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 11 }} />
                    <Tooltip
                      cursor={{ stroke: "rgba(190,18,60,.2)", strokeWidth: 24 }}
                      content={({ active, payload }) =>
                        active && payload?.[0] ? (
                          <div className="chart-tooltip">
                            <b>{payload[0].value?.toLocaleString()} ครั้ง</b>
                            <span>{payload[0].payload.label}</span>
                          </div>
                        ) : null
                      }
                    />
                    <Line type="monotone" dataKey="value" stroke="#be123c" strokeWidth={2.5} dot={{ r: 3, fill: "#be123c" }} activeDot={{ r: 5 }} animationDuration={850} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </section>
          </>
        );
      })()}

      {/* ===== SECTION 18: ตัวชี้วัดที่เกี่ยวข้อง 22.5 — จำแนกตามกลุ่มอายุ x วิธีทำร้ายตนเอง ===== */}
      <div className="indicator-group-head indicator-group-head-sub">
        <span className="indicator-badge indicator-badge-14"><Zap size={13} /> Section ที่ 18 · ตัวชี้วัดที่เกี่ยวข้อง 22.5</span>
        <h2><Link href="/indicator-relate-22-5" className="indicator-title-link"><span className="indicator-title-shimmer" aria-hidden="true" /><span className="indicator-title-link-text">{getSimpleIndicator("22_5").name}</span><ExternalLink size={15} className="indicator-title-link-icon" /></Link></h2>
      </div>

      {(() => {
        const analysis22_5 = getSimpleIndicatorAnalysis("22_5");
        if (analysis22_5.kind !== "heatmap" || analysis22_5.matrix.length === 0) return null;
        const { rows, cols, matrix } = analysis22_5;
        const colTotals = cols.map((_, ci) => matrix.reduce((s, row) => s + (row[ci] ?? 0), 0));
        const rowTotals = rows.map((_, ri) => matrix[ri].reduce((s, v) => s + v, 0));
        const grandTotal = colTotals.reduce((s, v) => s + v, 0);
        const topColIdx = colTotals.reduce((best, v, i) => (v > colTotals[best] ? i : best), 0);
        const topRowIdx = rowTotals.reduce((best, v, i) => (v > rowTotals[best] ? i : best), 0);
        const methodBarData = cols.map((label, i) => ({ label, value: colTotals[i] })).sort((a, b) => b.value - a.value);

        return (
          <>
            <section className="stats-grid" aria-label="สถิติตัวชี้วัดที่เกี่ยวข้อง 22.5">
              <StatCard icon={Zap} tone="rose" label="รวมครั้งทั้งหมด" value={grandTotal.toLocaleString()} note="ทำร้ายตนเอง ทุกวิธี" index={0} featured />
              <StatCard icon={ClipboardList} tone="purple" label="วิธีเด่นสุด" value={cols[topColIdx] ?? "-"} note={`${colTotals[topColIdx]?.toLocaleString() ?? 0} ครั้ง`} index={1} />
              <StatCard icon={CalendarClock} tone="teal" label="กลุ่มอายุเด่นสุด" value={rows[topRowIdx] ?? "-"} note={`${rowTotals[topRowIdx]?.toLocaleString() ?? 0} ครั้ง`} index={2} />
              <StatCard icon={Percent} tone="amber" label="สัดส่วนวิธีเด่นสุด" value={`${grandTotal > 0 ? Math.round((colTotals[topColIdx] / grandTotal) * 100) : 0}%`} note="ของทุกวิธีรวมกัน" index={3} />
            </section>

            <div className="overview-two-col">
              {/* Method Bar */}
              <section className="panel analytics-card">
                <div className="panel-heading">
                  <div><p className="eyebrow"><ChartNoAxesCombined size={12} /> จำแนกตามวิธี</p><h2>จำนวนครั้งตามวิธีทำร้ายตนเอง (Top 9)</h2></div>
                </div>
                <div className="chart-wrap chart-wrap-tall" aria-label="กราฟจำนวนครั้งตามวิธีทำร้ายตนเอง">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={methodBarData} layout="vertical" margin={{ top: 4, right: 24, left: 0, bottom: 0 }}>
                      <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 11 }} />
                      <YAxis dataKey="label" type="category" axisLine={false} tickLine={false} width={100} tick={{ fill: "#475569", fontSize: 11 }} />
                      <Tooltip
                        cursor={{ fill: "rgba(190,18,60,.05)" }}
                        content={({ active, payload }) =>
                          active && payload?.[0] ? (
                            <div className="chart-tooltip">
                              <b>{payload[0].value?.toLocaleString()} ครั้ง</b>
                              <span>{payload[0].payload.label}</span>
                            </div>
                          ) : null
                        }
                      />
                      <Bar dataKey="value" radius={[0, 12, 12, 0]} animationDuration={850}>
                        {methodBarData.map((entry, i) => (
                          <Cell key={`${entry.label}-${i}`} fill={i === 0 ? "#7f1d3a" : i < 3 ? "#be123c" : "#fda4af"} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </section>

              {/* Age Group Composition Donut (จัดกลุ่มอายุให้เหลือ 6 ช่วง อ่านง่าย) */}
              <CompositionDonutCard
                total={grandTotal}
                segments={bucketAgeGroups(rows, rowTotals).map((b, i) => ({
                  name: b.label,
                  value: b.value,
                  color: ["#be123c", "#e11d48", "#fb7185", "#fda4af", "#f43f5e", "#fecdd3"][i % 6],
                  glow: ["#fda4af", "#fecdd3", "#fecaca", "#ffe4e6", "#fca5a5", "#fee2e2"][i % 6],
                  icon: Zap,
                }))}
              />
            </div>
          </>
        );
      })()}

      {/* ===== SECTION 19: ตัวชี้วัดที่เกี่ยวข้อง 22.6 — จำแนกตามกลุ่มอายุ x สถานที่เกิดเหตุ ===== */}
      <div className="indicator-group-head indicator-group-head-sub">
        <span className="indicator-badge indicator-badge-14"><MapPin size={13} /> Section ที่ 19 · ตัวชี้วัดที่เกี่ยวข้อง 22.6</span>
        <h2><Link href="/indicator-relate-22-6" className="indicator-title-link"><span className="indicator-title-shimmer" aria-hidden="true" /><span className="indicator-title-link-text">{getSimpleIndicator("22_6").name}</span><ExternalLink size={15} className="indicator-title-link-icon" /></Link></h2>
      </div>

      {(() => {
        const analysis22_6 = getSimpleIndicatorAnalysis("22_6");
        if (analysis22_6.kind !== "heatmap" || analysis22_6.matrix.length === 0) return null;
        const { rows, cols, matrix } = analysis22_6;
        const colTotals = cols.map((_, ci) => matrix.reduce((s, row) => s + (row[ci] ?? 0), 0));
        const rowTotals = rows.map((_, ri) => matrix[ri].reduce((s, v) => s + v, 0));
        const grandTotal = colTotals.reduce((s, v) => s + v, 0);
        const topColIdx = colTotals.reduce((best, v, i) => (v > colTotals[best] ? i : best), 0);
        const topRowIdx = rowTotals.reduce((best, v, i) => (v > rowTotals[best] ? i : best), 0);
        const placeBarData = cols.map((label, i) => ({ label, value: colTotals[i] })).sort((a, b) => b.value - a.value);

        return (
          <>
            <section className="stats-grid" aria-label="สถิติตัวชี้วัดที่เกี่ยวข้อง 22.6">
              <StatCard icon={MapPin} tone="rose" label="รวมครั้งทั้งหมด" value={grandTotal.toLocaleString()} note="ทำร้ายตนเอง ทุกสถานที่" index={0} featured />
              <StatCard icon={ClipboardList} tone="purple" label="สถานที่เด่นสุด" value={cols[topColIdx] ?? "-"} note={`${colTotals[topColIdx]?.toLocaleString() ?? 0} ครั้ง`} index={1} />
              <StatCard icon={CalendarClock} tone="teal" label="กลุ่มอายุเด่นสุด" value={rows[topRowIdx] ?? "-"} note={`${rowTotals[topRowIdx]?.toLocaleString() ?? 0} ครั้ง`} index={2} />
              <StatCard icon={Percent} tone="amber" label="สัดส่วนสถานที่เด่นสุด" value={`${grandTotal > 0 ? Math.round((colTotals[topColIdx] / grandTotal) * 100) : 0}%`} note="ของทุกสถานที่รวมกัน" index={3} />
            </section>

            <div className="overview-two-col">
              {/* Place Bar */}
              <section className="panel analytics-card">
                <div className="panel-heading">
                  <div><p className="eyebrow"><ChartNoAxesCombined size={12} /> จำแนกตามสถานที่</p><h2>จำนวนครั้งตามสถานที่เกิดเหตุ</h2></div>
                </div>
                <div className="chart-wrap chart-wrap-tall" aria-label="กราฟจำนวนครั้งตามสถานที่เกิดเหตุ">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={placeBarData} layout="vertical" margin={{ top: 4, right: 24, left: 0, bottom: 0 }}>
                      <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 11 }} />
                      <YAxis dataKey="label" type="category" axisLine={false} tickLine={false} width={100} tick={{ fill: "#475569", fontSize: 11 }} />
                      <Tooltip
                        cursor={{ fill: "rgba(217,119,6,.05)" }}
                        content={({ active, payload }) =>
                          active && payload?.[0] ? (
                            <div className="chart-tooltip">
                              <b>{payload[0].value?.toLocaleString()} ครั้ง</b>
                              <span>{payload[0].payload.label}</span>
                            </div>
                          ) : null
                        }
                      />
                      <Bar dataKey="value" radius={[0, 12, 12, 0]} animationDuration={850}>
                        {placeBarData.map((entry, i) => (
                          <Cell key={`${entry.label}-${i}`} fill={i === 0 ? "#92400e" : i < 3 ? "#d97706" : "#fcd34d"} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </section>

              {/* Age Group Composition Donut (จัดกลุ่มอายุให้เหลือ 6 ช่วง อ่านง่าย) */}
              <CompositionDonutCard
                total={grandTotal}
                segments={bucketAgeGroups(rows, rowTotals).map((b, i) => ({
                  name: b.label,
                  value: b.value,
                  color: ["#d97706", "#f59e0b", "#fbbf24", "#fcd34d", "#fde68a", "#fef3c7"][i % 6],
                  glow: ["#fcd34d", "#fde68a", "#fef3c7", "#fffbeb", "#fef9c3", "#fefce8"][i % 6],
                  icon: MapPin,
                }))}
              />
            </div>
          </>
        );
      })()}

      {/* ===== SECTION 20: ตัวชี้วัดที่เกี่ยวข้อง 22.7 — จำแนกตามกลุ่มอายุ x ช่วงเวลาเกิดเหตุ ===== */}
      <div className="indicator-group-head indicator-group-head-sub">
        <span className="indicator-badge indicator-badge-14"><Clock size={13} /> Section ที่ 20 · ตัวชี้วัดที่เกี่ยวข้อง 22.7</span>
        <h2><Link href="/indicator-relate-22-7" className="indicator-title-link"><span className="indicator-title-shimmer" aria-hidden="true" /><span className="indicator-title-link-text">{getSimpleIndicator("22_7").name}</span><ExternalLink size={15} className="indicator-title-link-icon" /></Link></h2>
      </div>

      {(() => {
        const analysis22_7 = getSimpleIndicatorAnalysis("22_7");
        if (analysis22_7.kind !== "heatmap" || analysis22_7.matrix.length === 0) return null;
        const { rows, cols, matrix } = analysis22_7;
        const colTotals = cols.map((_, ci) => matrix.reduce((s, row) => s + (row[ci] ?? 0), 0));
        const rowTotals = rows.map((_, ri) => matrix[ri].reduce((s, v) => s + v, 0));
        const grandTotal = colTotals.reduce((s, v) => s + v, 0);
        const topColIdx = colTotals.reduce((best, v, i) => (v > colTotals[best] ? i : best), 0);
        const topRowIdx = rowTotals.reduce((best, v, i) => (v > rowTotals[best] ? i : best), 0);
        const timeBarData = cols.map((label, i) => ({ label, value: colTotals[i] }));

        return (
          <>
            <section className="stats-grid" aria-label="สถิติตัวชี้วัดที่เกี่ยวข้อง 22.7">
              <StatCard icon={Clock} tone="rose" label="รวมครั้งทั้งหมด" value={grandTotal.toLocaleString()} note="ทำร้ายตนเอง ทุกช่วงเวลา" index={0} featured />
              <StatCard icon={ClipboardList} tone="purple" label="ช่วงเวลาเด่นสุด" value={cols[topColIdx] ?? "-"} note={`${colTotals[topColIdx]?.toLocaleString() ?? 0} ครั้ง`} index={1} />
              <StatCard icon={CalendarClock} tone="teal" label="กลุ่มอายุเด่นสุด" value={rows[topRowIdx] ?? "-"} note={`${rowTotals[topRowIdx]?.toLocaleString() ?? 0} ครั้ง`} index={2} />
              <StatCard icon={Percent} tone="amber" label="สัดส่วนช่วงเวลาเด่นสุด" value={`${grandTotal > 0 ? Math.round((colTotals[topColIdx] / grandTotal) * 100) : 0}%`} note="ของทุกช่วงเวลารวมกัน" index={3} />
            </section>

            <div className="overview-two-col">
              {/* Time-of-day Bar (kept chronological order, not sorted) */}
              <section className="panel analytics-card">
                <div className="panel-heading">
                  <div><p className="eyebrow"><ChartNoAxesCombined size={12} /> จำแนกตามช่วงเวลา</p><h2>จำนวนครั้งตามช่วงเวลาเกิดเหตุ</h2></div>
                </div>
                <div className="chart-wrap chart-wrap-tall" aria-label="กราฟจำนวนครั้งตามช่วงเวลาเกิดเหตุ">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={timeBarData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                      <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 10.5 }} interval={0} angle={-20} textAnchor="end" height={50} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 11 }} />
                      <Tooltip
                        cursor={{ fill: "rgba(67,56,202,.05)" }}
                        content={({ active, payload }) =>
                          active && payload?.[0] ? (
                            <div className="chart-tooltip">
                              <b>{payload[0].value?.toLocaleString()} ครั้ง</b>
                              <span>{payload[0].payload.label}</span>
                            </div>
                          ) : null
                        }
                      />
                      <Bar dataKey="value" radius={[8, 8, 0, 0]} animationDuration={850}>
                        {timeBarData.map((entry, i) => (
                          <Cell key={`${entry.label}-${i}`} fill={i === topColIdx ? "#3730a3" : "#818cf8"} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </section>

              {/* Age Group Composition Donut (จัดกลุ่มอายุให้เหลือ 6 ช่วง อ่านง่าย) */}
              <CompositionDonutCard
                total={grandTotal}
                segments={bucketAgeGroups(rows, rowTotals).map((b, i) => ({
                  name: b.label,
                  value: b.value,
                  color: ["#4338ca", "#6366f1", "#22d3ee", "#a5b4fc", "#818cf8", "#c7d2fe"][i % 6],
                  glow: ["#818cf8", "#a5b4fc", "#67e8f9", "#e0e7ff", "#c7d2fe", "#eef2ff"][i % 6],
                  icon: Clock,
                }))}
              />
            </div>
          </>
        );
      })()}

      {/* ===== SECTION 21: ตัวชี้วัดที่เกี่ยวข้อง 23.4 — แนวโน้มรายเดือน (จิตเภท F20) ===== */}
      <div className="indicator-group-head indicator-group-head-sub">
        <span className="indicator-badge indicator-badge-14"><Brain size={13} /> Section ที่ 21 · ตัวชี้วัดที่เกี่ยวข้อง 23.4</span>
        <h2><Link href="/indicator-relate-23-4" className="indicator-title-link"><span className="indicator-title-shimmer" aria-hidden="true" /><span className="indicator-title-link-text">{getSimpleIndicator("23_4").name}</span><ExternalLink size={15} className="indicator-title-link-icon" /></Link></h2>
      </div>

      {(() => {
        const analysis23_4 = getSimpleIndicatorAnalysis("23_4");
        const monthlyData = analysis23_4.kind === "monthly" ? analysis23_4.data : [];
        const total23_4 = analysis23_4.kind === "monthly" ? analysis23_4.total : 0;
        const peak = monthlyData.reduce((best, m) => (m.value > (best?.value ?? -1) ? m : best), monthlyData[0]);
        const avgMonthly = monthlyData.length > 0 ? Math.round((total23_4 / monthlyData.length) * 10) / 10 : 0;
        return (
          <>
            <section className="stats-grid" aria-label="สถิติตัวชี้วัดที่เกี่ยวข้อง 23.4">
              <StatCard
                icon={Brain}
                tone="purple"
                label={getSimpleIndicatorHeadline("23_4")?.label ?? "ความชุกร้อยละประชากร"}
                value={`${getSimpleIndicatorHeadline("23_4")?.value?.toLocaleString() ?? "-"}${getSimpleIndicatorHeadline("23_4")?.unit ?? ""}`}
                note="ผู้ป่วยจิตเภท (F20.xx) ทั้งจังหวัด"
                index={0}
                featured
              />
              <StatCard icon={CalendarClock} tone="amber" label="เดือนที่สูงสุด" value={peak?.label ?? "-"} note={`${peak?.value.toLocaleString() ?? 0} ราย`} index={1} />
              <StatCard icon={Users} tone="teal" label="รวมทั้งปี" value={total23_4.toLocaleString()} note="ผู้ป่วยรายใหม่ 12 เดือนย้อนหลัง" index={2} />
              <StatCard icon={Percent} tone="blue" label="เฉลี่ยต่อเดือน" value={`${avgMonthly}`} note="ราย/เดือน" index={3} />
            </section>

            <section className="panel analytics-card">
              <div className="panel-heading">
                <div><p className="eyebrow"><ChartNoAxesCombined size={12} /> แนวโน้มรายเดือน</p><h2>ผู้ป่วยจิตเภทรายใหม่ (F20.xx) รายเดือน</h2></div>
              </div>
              <div className="chart-wrap chart-wrap-tall" aria-label="กราฟแนวโน้มผู้ป่วยจิตเภทรายใหม่รายเดือน">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                    <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 11 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 11 }} />
                    <Tooltip
                      cursor={{ stroke: "rgba(147,51,234,.2)", strokeWidth: 24 }}
                      content={({ active, payload }) =>
                        active && payload?.[0] ? (
                          <div className="chart-tooltip">
                            <b>{payload[0].value?.toLocaleString()} ราย</b>
                            <span>{payload[0].payload.label}</span>
                          </div>
                        ) : null
                      }
                    />
                    <Line type="monotone" dataKey="value" stroke="#9333ea" strokeWidth={2.5} dot={{ r: 3, fill: "#9333ea" }} activeDot={{ r: 5 }} animationDuration={850} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </section>
          </>
        );
      })()}

      {/* ===== SECTION 22: ตัวชี้วัดที่เกี่ยวข้อง 23.6 — แนวโน้มรายเดือน (ซึมเศร้า F32-F39) ===== */}
      <div className="indicator-group-head indicator-group-head-sub">
        <span className="indicator-badge indicator-badge-14"><HeartCrack size={13} /> Section ที่ 22 · ตัวชี้วัดที่เกี่ยวข้อง 23.6</span>
        <h2><Link href="/indicator-relate-23-6" className="indicator-title-link"><span className="indicator-title-shimmer" aria-hidden="true" /><span className="indicator-title-link-text">{getSimpleIndicator("23_6").name}</span><ExternalLink size={15} className="indicator-title-link-icon" /></Link></h2>
      </div>

      {(() => {
        const analysis23_6 = getSimpleIndicatorAnalysis("23_6");
        const monthlyData = analysis23_6.kind === "monthly" ? analysis23_6.data : [];
        const total23_6 = analysis23_6.kind === "monthly" ? analysis23_6.total : 0;
        const peak = monthlyData.reduce((best, m) => (m.value > (best?.value ?? -1) ? m : best), monthlyData[0]);
        const avgMonthly = monthlyData.length > 0 ? Math.round((total23_6 / monthlyData.length) * 10) / 10 : 0;
        return (
          <>
            <section className="stats-grid" aria-label="สถิติตัวชี้วัดที่เกี่ยวข้อง 23.6">
              <StatCard
                icon={HeartCrack}
                tone="teal"
                label={getSimpleIndicatorHeadline("23_6")?.label ?? "ความชุกร้อยละประชากร"}
                value={`${getSimpleIndicatorHeadline("23_6")?.value?.toLocaleString() ?? "-"}${getSimpleIndicatorHeadline("23_6")?.unit ?? ""}`}
                note="ผู้ป่วยซึมเศร้า (F32-F39) ทั้งจังหวัด"
                index={0}
                featured
              />
              <StatCard icon={CalendarClock} tone="amber" label="เดือนที่สูงสุด" value={peak?.label ?? "-"} note={`${peak?.value.toLocaleString() ?? 0} ราย`} index={1} />
              <StatCard icon={Users} tone="blue" label="รวมทั้งปี" value={total23_6.toLocaleString()} note="ผู้ป่วยรายใหม่ 12 เดือนย้อนหลัง" index={2} />
              <StatCard icon={Percent} tone="purple" label="เฉลี่ยต่อเดือน" value={`${avgMonthly}`} note="ราย/เดือน" index={3} />
            </section>

            <section className="panel analytics-card">
              <div className="panel-heading">
                <div><p className="eyebrow"><ChartNoAxesCombined size={12} /> แนวโน้มรายเดือน</p><h2>ผู้ป่วยซึมเศร้ารายใหม่ (F32-F39) รายเดือน</h2></div>
              </div>
              <div className="chart-wrap chart-wrap-tall" aria-label="กราฟแนวโน้มผู้ป่วยซึมเศร้ารายใหม่รายเดือน">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                    <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 11 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 11 }} />
                    <Tooltip
                      cursor={{ stroke: "rgba(13,148,136,.2)", strokeWidth: 24 }}
                      content={({ active, payload }) =>
                        active && payload?.[0] ? (
                          <div className="chart-tooltip">
                            <b>{payload[0].value?.toLocaleString()} ราย</b>
                            <span>{payload[0].payload.label}</span>
                          </div>
                        ) : null
                      }
                    />
                    <Line type="monotone" dataKey="value" stroke="#0d9488" strokeWidth={2.5} dot={{ r: 3, fill: "#0d9488" }} activeDot={{ r: 5 }} animationDuration={850} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </section>
          </>
        );
      })()}

      {/* ===== SECTION 23: ตัวชี้วัดที่เกี่ยวข้อง 23.5 — แนวโน้มรายเดือน (อารมณ์สองขั้ว F30-F31) ===== */}
      <div className="indicator-group-head indicator-group-head-sub">
        <span className="indicator-badge indicator-badge-14"><Waves size={13} /> Section ที่ 23 · ตัวชี้วัดที่เกี่ยวข้อง 23.5</span>
        <h2><Link href="/indicator-relate-23-5" className="indicator-title-link"><span className="indicator-title-shimmer" aria-hidden="true" /><span className="indicator-title-link-text">{getSimpleIndicator("23_5").name}</span><ExternalLink size={15} className="indicator-title-link-icon" /></Link></h2>
      </div>

      {(() => {
        const analysis23_5 = getSimpleIndicatorAnalysis("23_5");
        const monthlyData = analysis23_5.kind === "monthly" ? analysis23_5.data : [];
        const total23_5 = analysis23_5.kind === "monthly" ? analysis23_5.total : 0;
        const peak = monthlyData.reduce((best, m) => (m.value > (best?.value ?? -1) ? m : best), monthlyData[0]);
        const avgMonthly = monthlyData.length > 0 ? Math.round((total23_5 / monthlyData.length) * 10) / 10 : 0;
        return (
          <>
            <section className="stats-grid" aria-label="สถิติตัวชี้วัดที่เกี่ยวข้อง 23.5">
              <StatCard
                icon={Waves}
                tone="blue"
                label={getSimpleIndicatorHeadline("23_5")?.label ?? "ความชุกร้อยละประชากร"}
                value={`${getSimpleIndicatorHeadline("23_5")?.value?.toLocaleString() ?? "-"}${getSimpleIndicatorHeadline("23_5")?.unit ?? ""}`}
                note="ผู้ป่วยอารมณ์สองขั้ว (F30-F31) ทั้งจังหวัด"
                index={0}
                featured
              />
              <StatCard icon={CalendarClock} tone="amber" label="เดือนที่สูงสุด" value={peak?.label ?? "-"} note={`${peak?.value.toLocaleString() ?? 0} ราย`} index={1} />
              <StatCard icon={Users} tone="teal" label="รวมทั้งปี" value={total23_5.toLocaleString()} note="ผู้ป่วยรายใหม่ 12 เดือนย้อนหลัง" index={2} />
              <StatCard icon={Percent} tone="purple" label="เฉลี่ยต่อเดือน" value={`${avgMonthly}`} note="ราย/เดือน" index={3} />
            </section>

            <section className="panel analytics-card">
              <div className="panel-heading">
                <div><p className="eyebrow"><ChartNoAxesCombined size={12} /> แนวโน้มรายเดือน</p><h2>ผู้ป่วยอารมณ์สองขั้วรายใหม่ (F30-F31) รายเดือน</h2></div>
              </div>
              <div className="chart-wrap chart-wrap-tall" aria-label="กราฟแนวโน้มผู้ป่วยอารมณ์สองขั้วรายใหม่รายเดือน">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                    <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 11 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 11 }} />
                    <Tooltip
                      cursor={{ stroke: "rgba(37,99,235,.2)", strokeWidth: 24 }}
                      content={({ active, payload }) =>
                        active && payload?.[0] ? (
                          <div className="chart-tooltip">
                            <b>{payload[0].value?.toLocaleString()} ราย</b>
                            <span>{payload[0].payload.label}</span>
                          </div>
                        ) : null
                      }
                    />
                    <Line type="monotone" dataKey="value" stroke="#2563eb" strokeWidth={2.5} dot={{ r: 3, fill: "#2563eb" }} activeDot={{ r: 5 }} animationDuration={850} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </section>
          </>
        );
      })()}
    </motion.div>
  );
}

function Indicator1Section() {
  return (
    <motion.div className="indicator-group" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .45, ease }}>
      <div className="indicator-group-head">
        <span className="indicator-badge indicator-badge-1">ตัวชี้วัด 1</span>
        <h2>{indicator1Name}</h2>
        <p>ข้อมูล 7 อำเภอ ดึงโดย automate ผ่าน dropdown จริงบนหน้าเว็บ HDC</p>
        <a href={indicator1SourceUrl} target="_blank" rel="noopener noreferrer" className="source-link source-link-inline">
          <ExternalLink size={13} /> ดูรายงานต้นฉบับบน HDC
        </a>
      </div>

      <section className="stats-grid" aria-label="สถิติตัวชี้วัดที่ 1">
        <StatCard icon={Users} tone="blue" label="ผู้ป่วยทั้งจังหวัด" value={provinceTotal.toLocaleString()} note="รวมทุกอำเภอ" index={0} featured />
        <StatCard icon={MapPin} tone="blue" label="จำนวนอำเภอ" value={String(amphoeList.length)} note="มีข้อมูลครบทุกอำเภอ" index={1} />
        <StatCard icon={ClipboardList} tone="purple" label="กลุ่มวินิจฉัย" value={String(diagnosisBreakdown.length)} note="1B030 – 1B033" index={2} />
        <StatCard icon={Building2} tone="amber" label="อำเภอสูงสุด" value={amphoeStats[0]?.amphoe ?? "-"} note={`${amphoeStats[0]?.total.toLocaleString() ?? 0} ราย`} index={3} />
      </section>

      <div className="indicator1-layout">
        <Indicator1InsightsCard />

        <div className="indicator1-columns">
          <div className="indicator1-main">
            <p className="section-label">การกระจายตัวรายอำเภอ</p>
            <AmphoeChartCard />

            <p className="section-label">จำแนกตามกลุ่มโรค</p>
            <div className="indicator1-diagnosis-row">
              <DiagnosisBreakdownCard />
              <IcdCategoryCard />
            </div>

            <p className="section-label">Cross-analysis: อำเภอ × กลุ่มวินิจฉัย</p>
            <AmphoeDiagnosisHeatmap />
          </div>

          <div className="indicator1-side">
            <ReportInfoCard />
            <ProvinceGaugeCard />
            <AmphoeTableCard />
          </div>
        </div>
      </div>

      <Indicator1FullTable />
    </motion.div>
  );
}

function Indicator2AnalysisBody() {
  return (
    <>
      {/* ===== SECTION: Key Stats ===== */}
      <section id="indicator2-stats" className="stats-grid" aria-label="สถิติตัวชี้วัดที่ 2">
        <StatCard icon={Users} tone="blue" label="ผู้ป่วย SMI-V ทั้งหมด" value={`${indicator2Metrics?.totalPatients.toLocaleString() ?? "-"}`} note={indicator2Metrics?.area ?? ""} index={0} featured />
        <StatCard icon={Gauge} tone="teal" label="อัตราการเข้าถึงบริการ" value={`${indicator2Metrics?.accessRate ?? "-"}%`} note="Accessibility Rate (E)" index={1} />
        <StatCard icon={ShieldCheck} tone="green" label="ไม่ก่อความรุนแรงซ้ำ" value={`${indicator2Metrics?.noRepeatViolence.toLocaleString() ?? "-"}`} note="ผู้ป่วยสะสม (F)" index={2} />
        <StatCard icon={Activity} tone="teal" label="ดูแลต่อเนื่อง ≥2 ครั้ง" value={`${indicator2Metrics?.continuousCareRate ?? "-"}%`} note="ไม่ก่อซ้ำในปีงบประมาณ (O)" index={3} />
      </section>

      {/* ===== SECTION: Key Insights ===== */}
      <section id="indicator2-insights" className="panel insight-card">
        <div className="panel-heading">
          <div><p className="eyebrow">สรุปสถานการณ์</p><h2>อ่านง่าย: อะไรกำลังเกิดขึ้น</h2></div>
          <span className="live-pill"><i /> วิเคราะห์อัตโนมัติจากข้อมูล HDC</span>
        </div>
        <div className="insight-list">
          <div className="insight-row">
            <span className="insight-icon insight-icon-up"><TrendingUp size={15} /></span>
            <span className="insight-copy">
              ผู้ป่วยรายใหม่คิดเป็น <strong>{indicator2Insights?.newShare ?? "-"}%</strong> ของทั้งหมด
              <small>รายเก่า {indicator2Insights?.oldShare ?? "-"}% ({indicator2Metrics?.oldPatients.toLocaleString() ?? "-"} คน) · รายใหม่ {indicator2Metrics?.newPatients.toLocaleString() ?? "-"} คน</small>
            </span>
          </div>
          <div className="insight-row">
            <span className="insight-icon insight-icon-down"><TrendingDown size={15} /></span>
            <span className="insight-copy">
              ติดตามครบ ≥2 ครั้งน้อยกว่าติดตาม 1 ครั้ง <strong>{indicator2Insights?.followUpGap?.toLocaleString() ?? "-"} คน</strong>
              <small>อัตราไม่ก่อซ้ำต่างกัน {indicator2Insights?.rateDelta != null && indicator2Insights.rateDelta > 0 ? "+" : ""}{indicator2Insights?.rateDelta ?? "-"} จุด (1 ครั้ง {indicator2Metrics?.followUp1xRate ?? "-"}% vs ≥2 ครั้ง {indicator2Metrics?.followUp2xPlusRate ?? "-"}%)</small>
            </span>
          </div>
          <div className="insight-row">
            <span className="insight-icon insight-icon-layers"><Layers size={15} /></span>
            <span className="insight-copy">
              ครอบคลุมประชากร <strong>{indicator2Insights?.populationCoverage ?? "-"}%</strong>
              <small>ผู้ป่วย {indicator2Metrics?.totalPatients.toLocaleString() ?? "-"} คน จากประชากร {indicator2Metrics?.population.toLocaleString() ?? "-"} คน (15-60 ปี)</small>
            </span>
          </div>
          <div className="insight-row">
            <span className="insight-icon insight-icon-target"><Target size={15} /></span>
            <span className="insight-copy">
              ต่ำกว่าประมาณการ <strong>{indicator2Insights?.estimateGap?.toLocaleString() ?? "-"} คน</strong>
              <small>ประมาณการ {indicator2Metrics?.estimate.toLocaleString() ?? "-"} คน เทียบผู้ป่วยจริง {indicator2Metrics?.totalPatients.toLocaleString() ?? "-"} คน</small>
            </span>
          </div>
        </div>
      </section>

      {/* ===== SECTION: Composition & Follow-up ===== */}
      <div id="indicator2-composition-followup" className="overview-two-col">
        {/* Composition Donut */}
        <section id="indicator2-composition" className="panel analytics-card">
          <div className="panel-heading">
            <div><p className="eyebrow">องค์ประกอบผู้ป่วย</p><h2>สัดส่วนผู้ป่วยรายเก่า vs รายใหม่</h2></div>
            <span className="live-pill"><i /> ข้อมูลจริงจาก HDC</span>
          </div>
          <div className="donut-card-body">
            <div className="chart-wrap chart-wrap-donut" aria-label="กราฟวงกลมสัดส่วนผู้ป่วยรายเก่าเทียบรายใหม่">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: "รายเก่า (ก่อนปีงบปัจจุบัน)", value: indicator2Metrics?.oldPatients ?? 0 },
                      { name: "รายใหม่ (ปีงบปัจจุบัน)", value: indicator2Metrics?.newPatients ?? 0 },
                    ]}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius="58%"
                    outerRadius="88%"
                    paddingAngle={2}
                    animationDuration={850}
                  >
                    <Cell fill="#4338ca" />
                    <Cell fill="#818cf8" />
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) =>
                      active && payload?.[0] ? (
                        <div className="chart-tooltip">
                          <b>{payload[0].value?.toLocaleString()} คน</b>
                          <span>{payload[0].name}</span>
                        </div>
                      ) : null
                    }
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="donut-center-label">
                <strong>{indicator2Metrics?.totalPatients.toLocaleString() ?? "-"}</strong>
                <span>ผู้ป่วยรวม</span>
              </div>
            </div>
            <ul className="donut-legend">
              {[
                { name: "รายเก่า (ก่อนปีงบปัจจุบัน)", value: indicator2Metrics?.oldPatients ?? 0, color: "#4338ca" },
                { name: "รายใหม่ (ปีงบปัจจุบัน)", value: indicator2Metrics?.newPatients ?? 0, color: "#818cf8" },
              ].map((d) => (
                <li key={d.name}>
                  <span className="donut-legend-dot" style={{ background: d.color }} />
                  <span className="donut-legend-label">{d.name}</span>
                  <span className="donut-legend-value">
                    {d.value.toLocaleString()} คน · {indicator2Metrics?.totalPatients ? Math.round((d.value / indicator2Metrics.totalPatients) * 1000) / 10 : "-"}%
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Follow-up Comparison Grouped Bar */}
        <section id="indicator2-followup" className="panel analytics-card">
          <div className="panel-heading">
            <div><p className="eyebrow">เปรียบเทียบการติดตาม</p><h2>จำนวนติดตาม 1 ครั้ง เทียบ ≥2 ครั้ง</h2></div>
            <span className="live-pill"><i /> ข้อมูลจริงจาก HDC</span>
          </div>
          <div className="chart-wrap chart-wrap-tall" aria-label="กราฟแท่งเปรียบเทียบจำนวนผู้ป่วยติดตาม 1 ครั้ง และ 2 ครั้งขึ้นไป">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={[
                  { label: "ติดตาม 1 ครั้ง", ติดตามทั้งหมด: indicator2Metrics?.followUp1x ?? 0, ไม่ก่อซ้ำ: indicator2Metrics?.followUp1xNoRepeat ?? 0 },
                  { label: "ติดตาม ≥2 ครั้ง", ติดตามทั้งหมด: indicator2Metrics?.followUp2xPlus ?? 0, ไม่ก่อซ้ำ: indicator2Metrics?.followUp2xPlusNoRepeat ?? 0 },
                ]}
                margin={{ top: 8, right: 16, left: 0, bottom: 4 }}
              >
                <XAxis dataKey="label" tick={{ fill: "#475569", fontSize: 11.5 }} axisLine={{ stroke: "#e2e8f0" }} tickLine={false} />
                <YAxis tick={{ fill: "#94a3b8", fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip
                  content={({ active, payload, label }) =>
                    active && payload?.length ? (
                      <div className="chart-tooltip">
                        <b>{label}</b>
                        {payload.map((p) => (
                          <span key={p.dataKey as string}>{p.name}: {(p.value as number).toLocaleString()} คน</span>
                        ))}
                      </div>
                    ) : null
                  }
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="ติดตามทั้งหมด" fill="#a5b4fc" radius={[6, 6, 0, 0]} maxBarSize={54} animationDuration={750} />
                <Bar dataKey="ไม่ก่อซ้ำ" fill="#4338ca" radius={[6, 6, 0, 0]} maxBarSize={54} animationDuration={750} />
              </BarChart>
            </ResponsiveContainer>
            <div className="chart-footnote">
              <span className="footnote-dot" style={{ background: "#a5b4fc" }} /> ติดตามทั้งหมด &nbsp;
              <span className="footnote-dot" style={{ background: "#4338ca" }} /> ไม่ก่อความรุนแรงซ้ำ
            </div>
          </div>
        </section>
      </div>

      {/* ===== SECTION: Care Pathway & Rates ===== */}
      <div id="indicator2-pathway-rates" className="overview-two-col">
        {/* Funnel */}
        <section id="indicator2-funnel" className="panel funnel-card">
          <div className="panel-heading">
            <div><p className="eyebrow">เส้นทางการดูแล</p><h2>Funnel: จากประมาณการสู่การติดตามต่อเนื่อง</h2></div>
            <span className="live-pill"><i /> ข้อมูลจริงจาก HDC</span>
          </div>
          <div className="funnel-list">
            {[
              { label: "ประมาณการผู้ป่วย SMI-V", value: indicator2Metrics?.estimate ?? 0 },
              { label: "ผู้ป่วยทั้งหมดถึงปัจจุบัน", value: indicator2Metrics?.totalPatients ?? 0 },
              { label: "ติดตามอย่างน้อย 1 ครั้ง", value: indicator2Metrics?.followUp1x ?? 0 },
              { label: "ติดตามอย่างน้อย 2 ครั้ง", value: indicator2Metrics?.followUp2xPlus ?? 0 },
              { label: "ติดตาม ≥2 ครั้ง ไม่ก่อซ้ำ", value: indicator2Metrics?.followUp2xPlusNoRepeat ?? 0 },
            ].map((step, i) => {
              const maxVal = Math.max(1, indicator2Metrics?.estimate ?? 1);
              const pct = maxVal > 0 ? Math.round((step.value / maxVal) * 100) : 0;
              return (
                <div className="funnel-row" key={step.label}>
                  <span className="funnel-label">{step.label}</span>
                  <span className="funnel-bar-track">
                    <motion.span
                      className="funnel-bar-fill"
                      style={{ opacity: 1 - i * 0.12 }}
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.max(pct, 4)}%` }}
                      transition={{ duration: 0.7, delay: i * 0.06, ease }}
                    />
                  </span>
                  <span className="funnel-value">{step.value.toLocaleString()}</span>
                </div>
              );
            })}
          </div>
        </section>

        {/* Rate Compare */}
        <section id="indicator2-rates" className="panel rate-compare-card">
          <div className="panel-heading">
            <div><p className="eyebrow">เปรียบเทียบอัตรา</p><h2>อัตราร้อยละตามเกณฑ์ HDC</h2></div>
          </div>
          <div className="rate-compare-list">
            {[
              { label: "เข้าถึงบริการสะสม (E)", value: indicator2Metrics?.accessRate ?? 0 },
              { label: "ติดตาม 1 ครั้ง ไม่ก่อซ้ำ (L)", value: indicator2Metrics?.followUp1xRate ?? 0 },
              { label: "ติดตาม ≥2 ครั้ง ไม่ก่อซ้ำ (O)", value: indicator2Metrics?.continuousCareRate ?? 0 },
            ].map((r) => (
              <div className="rate-compare-item" key={r.label}>
                <div className="rate-compare-ring" style={{ "--pct": `${Math.min(r.value, 100)}%` } as React.CSSProperties}>
                  <span>{r.value}%</span>
                </div>
                <p>{r.label}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* ===== SECTION: Summary Card ===== */}
      <section id="indicator2-summary" className="panel summary-card">
        <div className="panel-heading">
          <div><p className="eyebrow">ภาพรวมตัวชี้วัด</p><h2>สรุปประสิทธิภาพการดูแล SMI-V</h2></div>
        </div>
        <div className="summary-grid">
          <div className="summary-item">
            <span className="summary-label">เข้าถึงบริการ</span>
            <span className="summary-value">{indicator2Metrics?.accessRate ?? "-"}%</span>
            <span className="summary-note">จากประมาณการ {indicator2Metrics?.estimate?.toLocaleString() ?? "-"} คน</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">ติดตาม 1 ครั้ง</span>
            <span className="summary-value">{(indicator2Metrics?.followUp1xRate ?? 0).toFixed(2)}%</span>
            <span className="summary-note">{indicator2Metrics?.followUp1x?.toLocaleString() ?? "-"} คน / {indicator2Metrics?.followUp1xNoRepeat?.toLocaleString() ?? "-"} ไม่ก่อซ้ำ</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">ติดตาม ≥2 ครั้ง</span>
            <span className="summary-value">{indicator2Metrics?.continuousCareRate ?? "-"}%</span>
            <span className="summary-note">{indicator2Metrics?.followUp2xPlus?.toLocaleString() ?? "-"} คน / {indicator2Metrics?.followUp2xPlusNoRepeat?.toLocaleString() ?? "-"} ไม่ก่อซ้ำ</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">ไม่ก่อซ้ำสะสม</span>
            <span className="summary-value">{indicator2Metrics?.noRepeatViolence?.toLocaleString() ?? "-"} คน</span>
            <span className="summary-note">ผู้ป่วยสะสม (F)</span>
          </div>
        </div>
      </section>
    </>
  );
}

function Indicator2Section() {
  return (
    <motion.div className="indicator-group" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .45, ease }}>
      <div id="indicator2-header" className="indicator-group-head">
        <span className="indicator-badge indicator-badge-2">ตัวชี้วัด 2</span>
        <h2>{indicator2Name}</h2>
        <p>ข้อมูลระดับจังหวัด ไม่ได้กรองรายอำเภอ (province-level report)</p>
        <a href={indicator2SourceUrl} target="_blank" rel="noopener noreferrer" className="source-link source-link-inline">
          <ExternalLink size={13} /> ดูรายงานต้นฉบับบน HDC
        </a>
        <a href={indicator2TemplateUrl} target="_blank" rel="noopener noreferrer" className="source-link source-link-inline">
          <Download size={13} /> ดาวน์โหลด Template (PDF)
        </a>
      </div>

      <Indicator2AnalysisBody />

      <section className="panel projects-card hdc-full-table-card">
        <div className="panel-title-row">
          <h2>ตารางข้อมูลตาม HDC (ทุกคอลัมน์)</h2>
          <span className="soft-button" style={{ pointerEvents: "none" }}><MapPinned size={14} /> ระดับจังหวัด</span>
        </div>
        <HdcRawTable columns={indicator2TableColumns} headerRows={indicator2TableHeaderRows} rows={indicator2TableRows} />
      </section>
    </motion.div>
  );
}

function Indicator4InsightsCard() {
  const { totalTreated, totalDefaulted, dominant, mostDefaulted, mostRepeat, defaultRate } = indicator4Insights;
  return (
    <section className="panel insight-card">
      <div className="panel-heading">
        <div><p className="eyebrow">วิเคราะห์ภาพรวม</p><h2>Insight ตัวชี้วัดที่ 4</h2></div>
        <span className="live-pill"><i /> วิเคราะห์อัตโนมัติ</span>
      </div>
      <div className="insight-list">
        <div className="insight-row">
          <span className="insight-icon insight-icon-up"><TrendingUp size={15} /></span>
          <span className="insight-copy">
            กลุ่ม <strong>{dominant?.group ?? "-"}</strong> มารักษามากที่สุด {dominant?.treated.toLocaleString() ?? 0} คน
            <small>รวมมารักษาทุกกลุ่ม {totalTreated.toLocaleString()} คน</small>
          </span>
        </div>
        <div className="insight-row">
          <span className="insight-icon insight-icon-down"><TrendingDown size={15} /></span>
          <span className="insight-copy">
            กลุ่ม <strong>{mostDefaulted?.group ?? "-"}</strong> ขาดการรักษามากที่สุด {mostDefaulted?.defaulted.toLocaleString() ?? 0} คน
            <small>อัตราขาดการรักษารวม {defaultRate}% ({totalDefaulted.toLocaleString()} คน)</small>
          </span>
        </div>
        <div className="insight-row">
          <span className="insight-icon insight-icon-layers"><Layers size={15} /></span>
          <span className="insight-copy">
            กลุ่ม <strong>{mostRepeat?.group ?? "-"}</strong> ก่อความรุนแรงซ้ำมากที่สุด {mostRepeat?.repeatViolence.toLocaleString() ?? 0} คน
            <small>รวมก่อซ้ำทุกกลุ่ม {indicator4Metrics?.repeatTotal.toLocaleString() ?? 0} คน</small>
          </span>
        </div>
        <div className="insight-row">
          <span className="insight-icon insight-icon-target"><Target size={15} /></span>
          <span className="insight-copy">
            ไม่ก่อความรุนแรงซ้ำ <strong>{indicator4RepeatRate < 100 ? (100 - indicator4RepeatRate).toFixed(2) : 0}%</strong>
            <small>{indicator4Metrics?.noRepeatViolence.toLocaleString() ?? 0} คน เข้าเกณฑ์ SMI-V Low Risk</small>
          </span>
        </div>
      </div>
    </section>
  );
}

function Indicator4SeverityChartCard() {
  const chartData = indicator4SeverityBreakdown.map((g) => ({ group: g.group, treated: g.treated, defaulted: g.defaulted, repeatViolence: g.repeatViolence }));
  const max = Math.max(1, ...chartData.map((d) => d.treated));
  return (
    <section className="panel severity-card">
      <div className="panel-heading">
        <div><p className="eyebrow">จำแนกตามความรุนแรง</p><h2>SMI-V1–V4: มารักษา / ขาดการรักษา / ก่อซ้ำ</h2></div>
        <span className="live-pill"><i /> ข้อมูลจริงจาก HDC</span>
      </div>
      <div className="severity-list">
        {chartData.map((d) => {
          const pctTreated = Math.max((d.treated / max) * 100, 3);
          const pctDefaulted = d.treated > 0 ? Math.min((d.defaulted / d.treated) * 100, 100) : 0;
          const pctRepeat = d.treated > 0 ? Math.min((d.repeatViolence / d.treated) * 100, 100) : 0;
          return (
            <div className="severity-row" key={d.group}>
              <div className="severity-row-head">
                <strong>{d.group}</strong>
                <span>{d.treated.toLocaleString()} คน มารักษา</span>
              </div>
              <span className="severity-bar-track">
                <motion.span className="severity-bar-fill" initial={{ width: 0 }} animate={{ width: `${pctTreated}%` }} transition={{ duration: 0.7, ease }} />
              </span>
              <div className="severity-sub-stats">
                <span className="severity-sub severity-sub-warn">ขาดการรักษา {d.defaulted.toLocaleString()} คน ({pctDefaulted.toFixed(0)}%)</span>
                <span className="severity-sub severity-sub-danger">ก่อซ้ำ {d.repeatViolence.toLocaleString()} คน ({pctRepeat.toFixed(0)}%)</span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function Indicator4ResidenceCard() {
  const totals = indicator4SeverityBreakdown.reduce(
    (acc, g) => ({
      type1: acc.type1 + g.type1.count,
      type3: acc.type3 + g.type3.count,
      other: acc.other + g.other.count,
    }),
    { type1: 0, type3: 0, other: 0 }
  );
  const total = totals.type1 + totals.type3 + totals.other;
  const items = [
    { label: "ตัวอยู่ ทะเบียนบ้านอยู่", value: totals.type1, color: "#4338ca" },
    { label: "ตัวอยู่ ทะเบียนบ้านไม่อยู่", value: totals.type3, color: "#3a6fb0" },
    { label: "อื่นๆ ตาม Last visit", value: totals.other, color: "#a03d68" },
  ];
  return (
    <section className="panel residence-card">
      <div className="panel-heading">
        <div><p className="eyebrow">จำแนกที่อยู่อาศัย</p><h2>สัดส่วนตามลักษณะทะเบียนบ้าน</h2></div>
      </div>
      <div className="residence-list">
        {items.map((item) => {
          const pct = total > 0 ? Math.round((item.value / total) * 100) : 0;
          return (
            <div className="residence-row" key={item.label}>
              <span className="residence-label">{item.label}</span>
              <span className="residence-bar-track">
                <motion.span className="residence-bar-fill" style={{ background: item.color }} initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.7, ease }} />
              </span>
              <span className="residence-value">{item.value.toLocaleString()} ({pct}%)</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function Indicator4Section() {
  return (
    <motion.div className="indicator-group" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .45, ease }}>
      <div className="indicator-group-head">
        <span className="indicator-badge indicator-badge-4">ตัวชี้วัด 4</span>
        <h2>{indicator4Name}</h2>
        <p>ข้อมูลระดับจังหวัด มุมมองรายพื้นที่ (เขตพื้นที่) — ดึงโดย automate จากหน้าเว็บ HDC จริง</p>
        <a href={indicator4SourceUrl} target="_blank" rel="noopener noreferrer" className="source-link source-link-inline">
          <ExternalLink size={13} /> ดูรายงานต้นฉบับบน HDC
        </a>
        <a href={indicator4TemplateUrl} target="_blank" rel="noopener noreferrer" className="source-link source-link-inline">
          <Download size={13} /> ดาวน์โหลด Template Report
        </a>
      </div>

      <section className="stats-grid" aria-label="สถิติตัวชี้วัดที่ 4">
        <StatCard icon={Users} tone="blue" label="ผู้ป่วย SMI-V ทั้งหมดถึงปัจจุบัน" value={`${indicator4Metrics?.totalToDate.toLocaleString() ?? "-"}`} note="สะสมทั้งจังหวัด" index={0} featured />
        <StatCard icon={CalendarClock} tone="teal" label="มารักษาในปีงบประมาณปัจจุบัน" value={`${indicator4Metrics?.treatedCurrentYear.toLocaleString() ?? "-"}`} note="ปีงบประมาณปัจจุบัน" index={1} />
        <StatCard icon={ShieldCheck} tone="green" label="ไม่ก่อความรุนแรงซ้ำ" value={`${indicator4Metrics?.noRepeatViolence.toLocaleString() ?? "-"}`} note="เข้าเกณฑ์ SMI-V Low Risk" index={2} />
        <StatCard icon={Repeat2} tone="rose" label="ก่อความรุนแรงซ้ำ" value={`${indicator4RepeatRate}%`} note={`${indicator4Metrics?.repeatViolenceCurrentYear.toLocaleString() ?? "-"} คน ในปีงบประมาณปัจจุบัน`} index={3} />
      </section>

      <div className="indicator1-layout">
        <Indicator4InsightsCard />

        <div className="indicator1-columns">
          <div className="indicator1-main">
            <p className="section-label">จำแนกตามความรุนแรง SMI-V1–V4</p>
            <Indicator4SeverityChartCard />

            <p className="section-label">จำแนกตามที่อยู่อาศัย</p>
            <Indicator4ResidenceCard />
          </div>

          <div className="indicator1-side">
            <section className="timer-card report-info-card">
              <div><p>ที่มาของข้อมูล</p><span className="pulse-text"><i /> ดึงจากหน้าเว็บ HDC จริง</span></div>
              <strong className="report-info-value">จังหวัดสตูล</strong>
              <p className="report-info-note">อัปเดต {formatDate(indicator4ExtractedAt)}</p>
              {indicator4ProcessedDate && <p className="report-info-processed"><span>วันที่ประมวลผล</span><strong>{indicator4ProcessedDate}</strong></p>}
            </section>
          </div>
        </div>
      </div>

      <section className="panel projects-card hdc-full-table-card">
        <div className="panel-title-row">
          <h2>ตารางข้อมูลตาม HDC (ทุกคอลัมน์)</h2>
          <span className="soft-button" style={{ pointerEvents: "none" }}><MapPinned size={14} /> รายพื้นที่ (เขตพื้นที่)</span>
        </div>
        <HdcRawTable columns={indicator4TableColumns} headerRows={indicator4TableHeaderRows} rows={indicator4TableRows} />
      </section>
    </motion.div>
  );
}

function Indicator3InsightsCard() {
  const { highest, lowest, totalFacilities, avgRate, aboveAvgCount, zeroRepeatCount } = indicator3Insights;
  return (
    <section className="panel insight-card">
      <div className="panel-heading">
        <div><p className="eyebrow">วิเคราะห์ภาพรวม</p><h2>Insight ตัวชี้วัดที่ 3</h2></div>
        <span className="live-pill"><i /> วิเคราะห์อัตโนมัติ</span>
      </div>
      <div className="insight-list">
        <div className="insight-row">
          <span className="insight-icon insight-icon-down"><TrendingUp size={15} /></span>
          <span className="insight-copy">
            <strong>{highest?.amphoe ?? "-"}</strong> ก่อความรุนแรงซ้ำสูงสุด {highest?.repeatRate ?? 0}%
            <small>{highest?.repeatViolence ?? 0} คน จาก {highest?.facilityCount ?? 0} หน่วยบริการ</small>
          </span>
        </div>
        <div className="insight-row">
          <span className="insight-icon insight-icon-up"><TrendingDown size={15} /></span>
          <span className="insight-copy">
            <strong>{lowest?.amphoe ?? "-"}</strong> ก่อความรุนแรงซ้ำต่ำสุด {lowest?.repeatRate ?? 0}%
            <small>เฉลี่ยทั้งจังหวัด {avgRate}%</small>
          </span>
        </div>
        <div className="insight-row">
          <span className="insight-icon insight-icon-layers"><Layers size={15} /></span>
          <span className="insight-copy">
            รวม <strong>{totalFacilities.toLocaleString()} หน่วยบริการ</strong> ทั้งจังหวัด
            <small>{aboveAvgCount} จาก {indicator3AmphoeStats.length} อำเภอ มีอัตราสูงกว่าค่าเฉลี่ย</small>
          </span>
        </div>
        <div className="insight-row">
          <span className="insight-icon insight-icon-target"><Target size={15} /></span>
          <span className="insight-copy">
            <strong>{zeroRepeatCount} อำเภอ</strong> ไม่พบก่อความรุนแรงซ้ำเลย
            <small>จากทั้งหมด {indicator3AmphoeStats.length} อำเภอ</small>
          </span>
        </div>
      </div>
    </section>
  );
}

function Indicator3RiskTierCard() {
  const avg = indicator3Insights.avgRate;
  const tiers = [
    { label: "ความเสี่ยงสูง (>ค่าเฉลี่ย)", items: indicator3AmphoeStats.filter((a) => a.repeatRate > avg), color: "#a03d68" },
    { label: "ความเสี่ยงต่ำ (≤ค่าเฉลี่ย)", items: indicator3AmphoeStats.filter((a) => a.repeatRate <= avg), color: "#4338ca" },
  ];
  return (
    <section className="panel risk-tier-card">
      <div className="panel-heading">
        <div><p className="eyebrow">จัดกลุ่มความเสี่ยง</p><h2>อำเภอเทียบค่าเฉลี่ยจังหวัด ({avg}%)</h2></div>
      </div>
      <div className="risk-tier-list">
        {tiers.map((tier) => (
          <div className="risk-tier-group" key={tier.label}>
            <p className="risk-tier-title" style={{ color: tier.color }}>{tier.label} · {tier.items.length} อำเภอ</p>
            <div className="risk-tier-chips">
              {tier.items.length > 0 ? tier.items.map((item) => (
                <span className="risk-chip" key={item.amphoe} style={{ borderColor: tier.color, color: tier.color }}>
                  {item.amphoe} <b>{item.repeatRate}%</b>
                </span>
              )) : <span className="risk-chip-empty">ไม่มี</span>}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Indicator3FacilityCompareCard() {
  const maxFacility = Math.max(1, ...indicator3AmphoeStats.map((a) => a.facilityCount));
  const maxCumulative = Math.max(1, ...indicator3AmphoeStats.map((a) => a.cumulative));
  return (
    <section className="panel facility-compare-card">
      <div className="panel-heading">
        <div><p className="eyebrow">Cross-analysis</p><h2>หน่วยบริการ vs ผู้ป่วยสะสม รายอำเภอ</h2></div>
        <span className="live-pill"><i /> ข้อมูลจริงจาก HDC</span>
      </div>
      <div className="facility-compare-list">
        {indicator3AmphoeStats.map((item) => (
          <div className="facility-compare-row" key={item.amphoe}>
            <span className="facility-compare-label">{item.amphoe}</span>
            <div className="facility-compare-bars">
              <span className="facility-compare-bar-track">
                <motion.span
                  className="facility-compare-bar-fill facility-compare-bar-facility"
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.max((item.facilityCount / maxFacility) * 100, 4)}%` }}
                  transition={{ duration: 0.6, ease }}
                />
                <em>{item.facilityCount} หน่วยบริการ</em>
              </span>
              <span className="facility-compare-bar-track">
                <motion.span
                  className="facility-compare-bar-fill facility-compare-bar-cumulative"
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.max((item.cumulative / maxCumulative) * 100, 4)}%` }}
                  transition={{ duration: 0.6, ease }}
                />
                <em>{item.cumulative.toLocaleString()} คนสะสม</em>
              </span>
            </div>
          </div>
        ))}
      </div>
      <div className="facility-compare-legend">
        <span><i className="facility-dot facility-dot-a" /> จำนวนหน่วยบริการ</span>
        <span><i className="facility-dot facility-dot-b" /> ผู้ป่วยสะสม</span>
      </div>
    </section>
  );
}

function Indicator3Section() {
  const chartData = indicator3AmphoeStats.map((item) => ({ amphoe: item.amphoe, repeatRate: item.repeatRate }));
  const [selectedAmphoe, setSelectedAmphoe] = useState(indicator3AmphoeList[0] ?? "");
  const facilityTable = getIndicator3FacilityTable(selectedAmphoe);

  return (
    <motion.div className="indicator-group" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .45, ease }}>
      <div className="indicator-group-head">
        <span className="indicator-badge indicator-badge-3">ตัวชี้วัด 3</span>
        <h2>{indicator3Name}</h2>
        <p>มุมมองการแสดงข้อมูล: รายหน่วยบริการ · แยกตามอำเภอ ({indicator3AmphoeList.length} อำเภอ) — ดึงโดย automate ผ่าน dropdown จริงบนหน้าเว็บ HDC</p>
        <a href={indicator3SourceUrl} target="_blank" rel="noopener noreferrer" className="source-link source-link-inline">
          <ExternalLink size={13} /> ดูรายงานต้นฉบับบน HDC
        </a>
        <a href={indicator3TemplateUrl} target="_blank" rel="noopener noreferrer" className="source-link source-link-inline">
          <Download size={13} /> ดาวน์โหลด Template Report
        </a>
      </div>

      <section className="stats-grid" aria-label="สถิติตัวชี้วัดที่ 3">
        <StatCard icon={Users} tone="blue" label="สะสมทั้งจังหวัด" value={`${indicator3Metrics.cumulative.toLocaleString()}`} note="ปีงบ 2559-2568" index={0} featured />
        <StatCard icon={UserPlus} tone="blue" label="รายใหม่ปีงบปัจจุบัน" value={`${indicator3Metrics.newCases.toLocaleString()}`} note="ปีงบประมาณ 2569" index={1} />
        <StatCard icon={Repeat2} tone="rose" label="ก่อความรุนแรงซ้ำ" value={`${indicator3Metrics.repeatViolence.toLocaleString()}`} note="คนเดิมที่สะสมถึงปัจจุบัน" index={2} />
        <StatCard icon={Percent} tone="rose" label="ร้อยละก่อซ้ำ" value={`${indicator3RepeatRate}%`} note="[3/(1+2)]*100" index={3} />
      </section>

      <div className="indicator1-layout">
        <Indicator3InsightsCard />

        <div className="indicator1-columns">
          <div className="indicator1-main">
            <p className="section-label">การกระจายตัวรายอำเภอ</p>
            <section className="panel analytics-card">
              <div className="panel-heading">
                <div><p className="eyebrow">ตัวชี้วัดที่ 3</p><h2>ร้อยละก่อความรุนแรงซ้ำ แยกตามอำเภอ</h2></div>
                <span className="live-pill"><i /> ข้อมูลจริงจาก HDC</span>
              </div>
              <div className="chart-wrap chart-wrap-tall" aria-label="กราฟร้อยละก่อความรุนแรงซ้ำแยกตามอำเภอ">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} layout="vertical" margin={{ top: 4, right: 24, left: 0, bottom: 0 }}>
                    <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 11 }} />
                    <YAxis dataKey="amphoe" type="category" axisLine={false} tickLine={false} width={78} tick={{ fill: "#475569", fontSize: 12 }} />
                    <Tooltip
                      cursor={{ fill: "rgba(20, 105, 72, .04)" }}
                      content={({ active, payload }) =>
                        active && payload?.[0] ? (
                          <div className="chart-tooltip">
                            <b>{payload[0].value}%</b>
                            <span>{payload[0].payload.amphoe}</span>
                          </div>
                        ) : null
                      }
                    />
                    <Bar dataKey="repeatRate" radius={[0, 12, 12, 0]} animationDuration={850}>
                      {chartData.map((entry, index) => (
                        <Cell key={entry.amphoe} fill={index === 0 ? "#3730a3" : index < 3 ? "#4f46e5" : "#94a3b8"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </section>

            <p className="section-label">จัดกลุ่มความเสี่ยง</p>
            <Indicator3RiskTierCard />

            <p className="section-label">Cross-analysis: หน่วยบริการ × ผู้ป่วยสะสม</p>
            <Indicator3FacilityCompareCard />
          </div>

          <div className="indicator1-side">
            <section className="timer-card report-info-card">
              <div><p>ที่มาของข้อมูล</p><span className="pulse-text"><i /> ดึงจากหน้าเว็บ HDC จริง</span></div>
              <strong className="report-info-value">{indicator3AmphoeStats.length} อำเภอ</strong>
              <p className="report-info-note">อัปเดต {formatDate(indicator3ExtractedAt)}</p>
              {indicator3ProcessedDate && <p className="report-info-processed"><span>วันที่ประมวลผล</span><strong>{indicator3ProcessedDate}</strong></p>}
            </section>

            <section className="panel projects-card amphoe-table-card">
              <div className="panel-title-row"><h2>รายชื่ออำเภอ</h2><span className="soft-button" style={{ pointerEvents: "none" }}><MapPinned size={14} /> {indicator3AmphoeStats.length} อำเภอ</span></div>
              <div className="project-list">
                {indicator3AmphoeStats.map((item) => (
                  <div className="project-row" key={item.amphoe}>
                    <span className="project-symbol" style={{ "--symbol": "#4338ca" } as React.CSSProperties}><span /></span>
                    <span><strong>{item.amphoe}</strong><small>{item.facilityCount} หน่วยบริการ · สะสม {item.cumulative.toLocaleString()} · รายใหม่ {item.newCases.toLocaleString()} · ก่อซ้ำ {item.repeatViolence.toLocaleString()} คน</small></span>
                    <span className="status warning">{item.repeatRate}%</span>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>

      <section className="panel projects-card hdc-full-table-card">
        <div className="panel-title-row">
          <h2>ตารางสรุปแยกรายอำเภอ</h2>
          <span className="soft-button" style={{ pointerEvents: "none" }}><MapPinned size={14} /> {indicator3AmphoeStats.length} อำเภอ</span>
        </div>
        <HdcRawTable
          columns={["อำเภอ", "จำนวนหน่วยบริการ", "สะสม (คน) ปีงบ 2559-2568", "รายใหม่ (คน) ปีงบปัจจุบัน", "ก่อความรุนแรงซ้ำ (คน)", "ร้อยละก่อซ้ำ"]}
          rows={indicator3AmphoeStats.map((item) => [
            item.amphoe,
            item.facilityCount,
            item.cumulative,
            item.newCases,
            item.repeatViolence,
            `${item.repeatRate}%`,
          ])}
        />
      </section>

      <section className="panel projects-card hdc-full-table-card">
        <div className="panel-title-row">
          <h2>ตารางข้อมูลตาม HDC (ทุกคอลัมน์) — รายหน่วยบริการ</h2>
          <span className="soft-button" style={{ pointerEvents: "none" }}><MapPinned size={14} /> รายอำเภอ</span>
        </div>
        <div className="amphoe-tabs">
          {indicator3AmphoeList.map((amphoeName) => (
            <button key={amphoeName} className={`amphoe-tab ${selectedAmphoe === amphoeName ? "active" : ""}`} onClick={() => setSelectedAmphoe(amphoeName)}>
              {amphoeName}
            </button>
          ))}
        </div>
        {facilityTable ? (
          <HdcRawTable columns={facilityTable.columns} headerRows={facilityTable.headerRows} rows={facilityTable.rows.map((r) => r.raw)} />
        ) : (
          <p className="hdc-table-empty">ไม่มีข้อมูลสำหรับอำเภอนี้</p>
        )}
      </section>
    </motion.div>
  );
}

function Indicator5InsightsCard() {
  const { highest, lowest, totalFacilities, avgRate, belowAvgCount, fullyFollowedCount } = indicator5Insights;
  return (
    <section className="panel insight-card">
      <div className="panel-heading">
        <div><p className="eyebrow">วิเคราะห์ภาพรวม</p><h2>Insight ตัวชี้วัดที่ 5</h2></div>
        <span className="live-pill"><i /> วิเคราะห์อัตโนมัติ</span>
      </div>
      <div className="insight-list">
        <div className="insight-row">
          <span className="insight-icon insight-icon-up"><TrendingUp size={15} /></span>
          <span className="insight-copy">
            <strong>{highest?.amphoe ?? "-"}</strong> ติดตามได้สูงสุด {highest?.followRate ?? 0}%
            <small>{highest?.followed ?? 0} จาก {highest?.total ?? 0} คน</small>
          </span>
        </div>
        <div className="insight-row">
          <span className="insight-icon insight-icon-down"><TrendingDown size={15} /></span>
          <span className="insight-copy">
            <strong>{lowest?.amphoe ?? "-"}</strong> ติดตามได้ต่ำสุด {lowest?.followRate ?? 0}%
            <small>เฉลี่ยทั้งจังหวัด {avgRate}%</small>
          </span>
        </div>
        <div className="insight-row">
          <span className="insight-icon insight-icon-layers"><Layers size={15} /></span>
          <span className="insight-copy">
            รวม <strong>{totalFacilities.toLocaleString()} หน่วยบริการ</strong> ทั้งจังหวัด
            <small>{belowAvgCount} จาก {indicator5AmphoeStats.length} อำเภอ มีอัตราต่ำกว่าค่าเฉลี่ย</small>
          </span>
        </div>
        <div className="insight-row">
          <span className="insight-icon insight-icon-target"><Target size={15} /></span>
          <span className="insight-copy">
            <strong>{fullyFollowedCount} อำเภอ</strong> ติดตามครบ 100%
            <small>จากทั้งหมด {indicator5AmphoeStats.length} อำเภอ</small>
          </span>
        </div>
      </div>
    </section>
  );
}

function Indicator5NewOldCard() {
  const { newTotal, newFollowed, newRate, oldTotal, oldFollowed, oldRate } = indicator5NewOldBreakdown;
  const groups = [
    { label: "ผู้ป่วยรายใหม่", total: newTotal, followed: newFollowed, rate: newRate, color: "#3a6fb0" },
    { label: "ผู้ป่วยรายเก่า", total: oldTotal, followed: oldFollowed, rate: oldRate, color: "#4338ca" },
  ];
  const maxTotal = Math.max(1, newTotal, oldTotal);
  return (
    <section className="panel newold-card">
      <div className="panel-heading">
        <div><p className="eyebrow">จำแนกรายใหม่ / รายเก่า</p><h2>อัตราติดตามเทียบกลุ่มผู้ป่วย</h2></div>
        <span className="live-pill"><i /> ข้อมูลจริงจาก HDC</span>
      </div>
      <div className="newold-list">
        {groups.map((g) => {
          const widthPct = Math.max((g.total / maxTotal) * 100, 4);
          return (
            <div className="newold-row" key={g.label}>
              <div className="newold-row-head">
                <strong>{g.label}</strong>
                <span>{g.total.toLocaleString()} คน · ติดตามแล้ว {g.followed.toLocaleString()} คน ({g.rate}%)</span>
              </div>
              <span className="newold-bar-track">
                <motion.span
                  className="newold-bar-fill"
                  style={{ background: g.color }}
                  initial={{ width: 0 }}
                  animate={{ width: `${widthPct}%` }}
                  transition={{ duration: 0.7, ease }}
                />
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function Indicator5FacilityCompareCard() {
  const maxFacility = Math.max(1, ...indicator5AmphoeStats.map((a) => a.facilityCount));
  const maxTotal = Math.max(1, ...indicator5AmphoeStats.map((a) => a.total));
  return (
    <section className="panel facility-compare-card">
      <div className="panel-heading">
        <div><p className="eyebrow">Cross-analysis</p><h2>หน่วยบริการ vs ผู้ป่วยทั้งหมด รายอำเภอ</h2></div>
        <span className="live-pill"><i /> ข้อมูลจริงจาก HDC</span>
      </div>
      <div className="facility-compare-list">
        {indicator5AmphoeStats.map((item) => (
          <div className="facility-compare-row" key={item.amphoe}>
            <span className="facility-compare-label">{item.amphoe}</span>
            <div className="facility-compare-bars">
              <span className="facility-compare-bar-track">
                <motion.span
                  className="facility-compare-bar-fill facility-compare-bar-facility"
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.max((item.facilityCount / maxFacility) * 100, 4)}%` }}
                  transition={{ duration: 0.6, ease }}
                />
                <em>{item.facilityCount} หน่วยบริการ</em>
              </span>
              <span className="facility-compare-bar-track">
                <motion.span
                  className="facility-compare-bar-fill facility-compare-bar-cumulative"
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.max((item.total / maxTotal) * 100, 4)}%` }}
                  transition={{ duration: 0.6, ease }}
                />
                <em>{item.total.toLocaleString()} คนทั้งหมด</em>
              </span>
            </div>
          </div>
        ))}
      </div>
      <div className="facility-compare-legend">
        <span><i className="facility-dot facility-dot-a" /> จำนวนหน่วยบริการ</span>
        <span><i className="facility-dot facility-dot-b" /> ผู้ป่วยทั้งหมด</span>
      </div>
    </section>
  );
}

function Indicator5Section() {
  const chartData = indicator5AmphoeStats.map((item) => ({ amphoe: item.amphoe, followRate: item.followRate }));
  const [selectedAmphoe, setSelectedAmphoe] = useState(indicator5AmphoeList[0] ?? "");
  const facilityTable = getIndicator5FacilityTable(selectedAmphoe);

  return (
    <motion.div className="indicator-group" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .45, ease }}>
      <div className="indicator-group-head">
        <span className="indicator-badge indicator-badge-5">ตัวชี้วัด 5</span>
        <h2>{indicator5Name}</h2>
        <p>มุมมองการแสดงข้อมูล: รายหน่วยบริการ · แยกตามอำเภอ ({indicator5AmphoeList.length} อำเภอ) — ดึงโดย automate ผ่าน dropdown จริงบนหน้าเว็บ HDC</p>
        <a href={indicator5SourceUrl} target="_blank" rel="noopener noreferrer" className="source-link source-link-inline">
          <ExternalLink size={13} /> ดูรายงานต้นฉบับบน HDC
        </a>
      </div>

      <section className="stats-grid" aria-label="สถิติตัวชี้วัดที่ 5">
        <StatCard icon={Users} tone="blue" label="ผู้ป่วยทั้งหมด (B)" value={`${indicator5Metrics.total.toLocaleString()}`} note="มารับบริการในปีงบประมาณ" index={0} featured />
        <StatCard icon={ListChecks} tone="teal" label="ได้รับการติดตามตามเกณฑ์ (A)" value={`${indicator5Metrics.followed.toLocaleString()}`} note="ติดตามครบตามเกณฑ์" index={1} />
        <StatCard icon={Percent} tone="teal" label="ร้อยละติดตาม" value={`${indicator5FollowRate}%`} note="[A/B]x100" index={2} />
        <StatCard icon={MapPin} tone="blue" label="จำนวนอำเภอ" value={`${indicator5AmphoeList.length}`} note="ครบทุกอำเภอ" index={3} />
      </section>

      <div className="indicator1-layout">
        <Indicator5InsightsCard />

        <div className="indicator1-columns">
          <div className="indicator1-main">
            <p className="section-label">การกระจายตัวรายอำเภอ</p>
            <section className="panel analytics-card">
              <div className="panel-heading">
                <div><p className="eyebrow">ตัวชี้วัดที่ 5</p><h2>ร้อยละติดตามตามเกณฑ์ แยกตามอำเภอ</h2></div>
                <span className="live-pill"><i /> ข้อมูลจริงจาก HDC</span>
              </div>
              <div className="chart-wrap chart-wrap-tall" aria-label="กราฟร้อยละติดตามตามเกณฑ์แยกตามอำเภอ">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} layout="vertical" margin={{ top: 4, right: 24, left: 0, bottom: 0 }}>
                    <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 11 }} />
                    <YAxis dataKey="amphoe" type="category" axisLine={false} tickLine={false} width={78} tick={{ fill: "#475569", fontSize: 12 }} />
                    <Tooltip
                      cursor={{ fill: "rgba(20, 105, 72, .04)" }}
                      content={({ active, payload }) =>
                        active && payload?.[0] ? (
                          <div className="chart-tooltip">
                            <b>{payload[0].value}%</b>
                            <span>{payload[0].payload.amphoe}</span>
                          </div>
                        ) : null
                      }
                    />
                    <Bar dataKey="followRate" radius={[0, 12, 12, 0]} animationDuration={850}>
                      {chartData.map((entry, index) => (
                        <Cell key={entry.amphoe} fill={index === 0 ? "#3730a3" : index < 3 ? "#4f46e5" : "#94a3b8"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </section>

            <p className="section-label">จำแนกรายใหม่ / รายเก่า</p>
            <Indicator5NewOldCard />

            <p className="section-label">Cross-analysis: หน่วยบริการ × ผู้ป่วยทั้งหมด</p>
            <Indicator5FacilityCompareCard />
          </div>

          <div className="indicator1-side">
            <section className="timer-card report-info-card">
              <div><p>ที่มาของข้อมูล</p><span className="pulse-text"><i /> ดึงจากหน้าเว็บ HDC จริง</span></div>
              <strong className="report-info-value">{indicator5AmphoeStats.length} อำเภอ</strong>
              <p className="report-info-note">อัปเดต {formatDate(indicator5ExtractedAt)}</p>
              {indicator5ProcessedDate && <p className="report-info-processed"><span>วันที่ประมวลผล</span><strong>{indicator5ProcessedDate}</strong></p>}
            </section>

            <section className="panel projects-card amphoe-table-card">
              <div className="panel-title-row"><h2>รายชื่ออำเภอ</h2><span className="soft-button" style={{ pointerEvents: "none" }}><MapPinned size={14} /> {indicator5AmphoeStats.length} อำเภอ</span></div>
              <div className="project-list">
                {indicator5AmphoeStats.map((item) => (
                  <div className="project-row" key={item.amphoe}>
                    <span className="project-symbol" style={{ "--symbol": "#4338ca" } as React.CSSProperties}><span /></span>
                    <span><strong>{item.amphoe}</strong><small>{item.facilityCount} หน่วยบริการ · ทั้งหมด {item.total.toLocaleString()} · ติดตามแล้ว {item.followed.toLocaleString()} คน</small></span>
                    <span className="status warning">{item.followRate}%</span>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>

      <section className="panel projects-card hdc-full-table-card">
        <div className="panel-title-row">
          <h2>ตารางสรุปแยกรายอำเภอ</h2>
          <span className="soft-button" style={{ pointerEvents: "none" }}><MapPinned size={14} /> {indicator5AmphoeStats.length} อำเภอ</span>
        </div>
        <HdcRawTable
          columns={["อำเภอ", "จำนวนหน่วยบริการ", "ผู้ป่วยทั้งหมด (คน)", "ติดตามตามเกณฑ์ (คน)", "ร้อยละติดตาม"]}
          rows={indicator5AmphoeStats.map((item) => [
            item.amphoe,
            item.facilityCount,
            item.total,
            item.followed,
            `${item.followRate}%`,
          ])}
        />
      </section>

      <section className="panel projects-card hdc-full-table-card">
        <div className="panel-title-row">
          <h2>ตารางข้อมูลตาม HDC (ทุกคอลัมน์) — รายหน่วยบริการ</h2>
          <span className="soft-button" style={{ pointerEvents: "none" }}><MapPinned size={14} /> รายอำเภอ</span>
        </div>
        <div className="amphoe-tabs">
          {indicator5AmphoeList.map((amphoeName) => (
            <button key={amphoeName} className={`amphoe-tab ${selectedAmphoe === amphoeName ? "active" : ""}`} onClick={() => setSelectedAmphoe(amphoeName)}>
              {amphoeName}
            </button>
          ))}
        </div>
        {facilityTable ? (
          <HdcRawTable columns={facilityTable.columns} headerRows={facilityTable.headerRows} rows={facilityTable.rows.map((r) => r.raw)} />
        ) : (
          <p className="hdc-table-empty">ไม่มีข้อมูลสำหรับอำเภอนี้</p>
        )}
      </section>
    </motion.div>
  );
}

function IndicatorRelate14InsightsCard() {
  const { highest, lowest, avgRate, belowAvgCount } = indicatorRelate14Insights;
  return (
    <section className="panel insight-card">
      <div className="panel-heading">
        <div><p className="eyebrow">วิเคราะห์ภาพรวม</p><h2>Insight ตัวชี้วัดที่เกี่ยวข้อง 14</h2></div>
        <span className="live-pill"><i /> วิเคราะห์อัตโนมัติ</span>
      </div>
      <div className="insight-list">
        <div className="insight-row">
          <span className="insight-icon insight-icon-up"><TrendingUp size={15} /></span>
          <span className="insight-copy">
            <strong>{highest?.amphoe ?? "-"}</strong> อัตรารักษาต่อเนื่องสูงสุด {highest?.rateAB ?? 0}%
            <small>{highest?.followed1x ?? 0} จาก {highest?.servedOctFeb ?? 0} คน</small>
          </span>
        </div>
        <div className="insight-row">
          <span className="insight-icon insight-icon-down"><TrendingDown size={15} /></span>
          <span className="insight-copy">
            <strong>{lowest?.amphoe ?? "-"}</strong> อัตรารักษาต่อเนื่องต่ำสุด {lowest?.rateAB ?? 0}%
            <small>เฉลี่ยทั้งจังหวัด {avgRate}%</small>
          </span>
        </div>
        <div className="insight-row">
          <span className="insight-icon insight-icon-target"><Target size={15} /></span>
          <span className="insight-copy">
            <strong>{belowAvgCount} อำเภอ</strong> ต่ำกว่าค่าเฉลี่ยจังหวัด
            <small>จากทั้งหมด {indicatorRelate14AmphoeStats.length} อำเภอ</small>
          </span>
        </div>
      </div>
    </section>
  );
}

function IndicatorRelate14Section() {
  const chartData = indicatorRelate14AmphoeStats.map((item) => ({ amphoe: item.amphoe, rateAB: item.rateAB }));

  return (
    <motion.div className="indicator-group" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .45, ease }}>
      <div className="indicator-group-head">
        <span className="indicator-badge indicator-badge-14">ตัวชี้วัดที่เกี่ยวข้อง 14</span>
        <h2>{indicatorRelate14Name}</h2>
        <p>ข้อมูลระดับจังหวัด มุมมองรายพื้นที่ (เขตพื้นที่) — ดึงโดย automate จากหน้าเว็บ HDC จริง</p>
        <a href={indicatorRelate14SourceUrl} target="_blank" rel="noopener noreferrer" className="source-link source-link-inline">
          <ExternalLink size={13} /> ดูรายงานต้นฉบับบน HDC
        </a>
        <SmiVNote text="เป็นโรคเดียวกับ SMI-V กลุ่มจิตเภท (F20-F29) ใช้ติดตามการรักษา" />
      </div>

      <section className="stats-grid" aria-label="สถิติตัวชี้วัดที่เกี่ยวข้อง 14">
        <StatCard icon={Users} tone="blue" label="มารับบริการทั้งหมด (B)" value={`${indicatorRelate14Metrics?.servedOctFeb.toLocaleString() ?? "-"}`} note="ในปีงบประมาณ" index={0} featured />
        <StatCard icon={ListChecks} tone="teal" label="ติดตามต่อเนื่อง (A)" value={`${indicatorRelate14Metrics?.followed1x.toLocaleString() ?? "-"}`} note="อย่างน้อย 1 ครั้งภายใน 6 เดือน" index={1} />
        <StatCard icon={Percent} tone="teal" label="อัตราการรักษาต่อเนื่อง" value={`${indicatorRelate14Metrics?.rateAB ?? "-"}%`} note="(A/B) x 100" index={2} />
        <StatCard icon={HeartPulse} tone="purple" label="รวมทั้งปี (C)" value={`${indicatorRelate14Metrics?.totalCurrentYear.toLocaleString() ?? "-"}`} note="ผู้ป่วยจิตเภทสะสม" index={3} />
      </section>

      <div className="indicator1-layout">
        <IndicatorRelate14InsightsCard />

        <div className="indicator1-columns">
          <div className="indicator1-main">
            <p className="section-label">การกระจายตัวรายอำเภอ</p>
            <section className="panel analytics-card">
              <div className="panel-heading">
                <div><p className="eyebrow">ตัวชี้วัดที่เกี่ยวข้อง 14</p><h2>อัตราการรักษาต่อเนื่องภายใน 6 เดือน แยกตามอำเภอ</h2></div>
                <span className="live-pill"><i /> ข้อมูลจริงจาก HDC</span>
              </div>
              <div className="chart-wrap chart-wrap-tall" aria-label="กราฟอัตราการรักษาต่อเนื่อง แยกตามอำเภอ">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} layout="vertical" margin={{ top: 4, right: 24, left: 0, bottom: 0 }}>
                    <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 11 }} />
                    <YAxis dataKey="amphoe" type="category" axisLine={false} tickLine={false} width={78} tick={{ fill: "#475569", fontSize: 12 }} />
                    <Tooltip
                      cursor={{ fill: "rgba(181, 38, 95, .04)" }}
                      content={({ active, payload }) =>
                        active && payload?.[0] ? (
                          <div className="chart-tooltip">
                            <b>{payload[0].value}%</b>
                            <span>{payload[0].payload.amphoe}</span>
                          </div>
                        ) : null
                      }
                    />
                    <Bar dataKey="rateAB" radius={[0, 12, 12, 0]} animationDuration={850}>
                      {chartData.map((entry, index) => (
                        <Cell key={entry.amphoe} fill={index === 0 ? "#8a1a48" : index < 3 ? "#b5265f" : "#d998b3"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </section>
          </div>

          <div className="indicator1-side">
            <section className="timer-card report-info-card">
              <div><p>ที่มาของข้อมูล</p><span className="pulse-text"><i /> ดึงจากหน้าเว็บ HDC จริง</span></div>
              <strong className="report-info-value">{indicatorRelate14AmphoeStats.length} อำเภอ</strong>
              <p className="report-info-note">อัปเดต {formatDate(indicatorRelate14ExtractedAt)}</p>
              {indicatorRelate14ProcessedDate && <p className="report-info-processed"><span>วันที่ประมวลผล</span><strong>{indicatorRelate14ProcessedDate}</strong></p>}
            </section>

            <section className="panel projects-card amphoe-table-card">
              <div className="panel-title-row"><h2>รายชื่ออำเภอ</h2><span className="soft-button" style={{ pointerEvents: "none" }}><MapPinned size={14} /> {indicatorRelate14AmphoeStats.length} อำเภอ</span></div>
              <div className="project-list">
                {indicatorRelate14AmphoeStats.map((item) => (
                  <div className="project-row" key={item.amphoe}>
                    <span className="project-symbol" style={{ "--symbol": "#b5265f" } as React.CSSProperties}><span /></span>
                    <span><strong>{item.amphoe}</strong><small>มารับบริการ {item.servedOctFeb.toLocaleString()} · ติดตามต่อเนื่อง {item.followed1x.toLocaleString()} คน</small></span>
                    <span className="status warning">{item.rateAB}%</span>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>

      <section className="panel projects-card hdc-full-table-card">
        <div className="panel-title-row">
          <h2>ตารางข้อมูลตาม HDC (ทุกคอลัมน์)</h2>
          <span className="soft-button" style={{ pointerEvents: "none" }}><MapPinned size={14} /> รายพื้นที่ (เขตพื้นที่)</span>
        </div>
        <HdcRawTable columns={indicatorRelate14TableColumns} headerRows={indicatorRelate14TableHeaderRows} rows={indicatorRelate14TableRows} />
      </section>
    </motion.div>
  );
}

function IndicatorRelate15InsightsCard() {
  const { highest, lowest, followUpGap, rateDelta } = indicatorRelate15Insights;
  return (
    <section className="panel insight-card">
      <div className="panel-heading">
        <div><p className="eyebrow">วิเคราะห์ภาพรวม</p><h2>Insight ตัวชี้วัดที่เกี่ยวข้อง 15</h2></div>
        <span className="live-pill"><i /> วิเคราะห์อัตโนมัติ</span>
      </div>
      <div className="insight-list">
        <div className="insight-row">
          <span className="insight-icon insight-icon-up"><TrendingUp size={15} /></span>
          <span className="insight-copy">
            <strong>{highest?.amphoe ?? "-"}</strong> อัตราติดตามครั้งที่ 2 สูงสุด {highest?.rate2x ?? 0}%
            <small>{highest?.followed2x ?? 0} คน</small>
          </span>
        </div>
        <div className="insight-row">
          <span className="insight-icon insight-icon-down"><TrendingDown size={15} /></span>
          <span className="insight-copy">
            <strong>{lowest?.amphoe ?? "-"}</strong> อัตราติดตามครั้งที่ 2 ต่ำสุด {lowest?.rate2x ?? 0}%
          </span>
        </div>
        <div className="insight-row">
          <span className="insight-icon insight-icon-layers"><Layers size={15} /></span>
          <span className="insight-copy">
            ผู้ป่วยหลุดการติดตามระหว่างครั้งที่ 1 ถึง 2 <strong>{followUpGap.toLocaleString()} คน</strong>
          </span>
        </div>
        <div className="insight-row">
          <span className="insight-icon insight-icon-target"><Target size={15} /></span>
          <span className="insight-copy">
            อัตราครั้งที่ 2 เทียบครั้งที่ 1 เปลี่ยนแปลง <strong>{rateDelta > 0 ? "+" : ""}{rateDelta}%</strong>
          </span>
        </div>
      </div>
    </section>
  );
}

function IndicatorRelate15Section() {
  const chartData = indicatorRelate15AmphoeStats.map((item) => ({ amphoe: item.amphoe, rate1x: item.rate1x, rate2x: item.rate2x }));

  return (
    <motion.div className="indicator-group" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .45, ease }}>
      <div className="indicator-group-head">
        <span className="indicator-badge indicator-badge-15">ตัวชี้วัดที่เกี่ยวข้อง 15</span>
        <h2>{indicatorRelate15Name}</h2>
        <p>ข้อมูลระดับจังหวัด มุมมองรายพื้นที่ (เขตพื้นที่) — ดึงโดย automate จากหน้าเว็บ HDC จริง</p>
        <a href={indicatorRelate15SourceUrl} target="_blank" rel="noopener noreferrer" className="source-link source-link-inline">
          <ExternalLink size={13} /> ดูรายงานต้นฉบับบน HDC
        </a>
        <SmiVNote text="เป็นโรคเดียวกับ SMI-V กลุ่มจิตเภท (F20-F29) ใช้ติดตามการรักษา" />
      </div>

      <section className="stats-grid" aria-label="สถิติตัวชี้วัดที่เกี่ยวข้อง 15">
        <StatCard icon={HeartPulse} tone="purple" label="สะสมทั้งหมด" value={`${indicatorRelate15Metrics?.cumulativeTotal.toLocaleString() ?? "-"}`} note="ผู้ป่วยจิตเภทสะสม" index={0} featured />
        <StatCard icon={Users} tone="blue" label="เข้าถึงบริการ 5 ปีย้อนหลัง (B)" value={`${indicatorRelate15Metrics?.served5yr.toLocaleString() ?? "-"}`} note="ปีงบ 2565-2569" index={1} />
        <StatCard icon={ListChecks} tone="teal" label="ติดตามครั้งที่ 1 (A1)" value={`${indicatorRelate15Metrics?.followed1x.toLocaleString() ?? "-"}`} note={`${indicatorRelate15Metrics?.rate1x ?? "-"}%`} index={2} />
        <StatCard icon={Repeat2} tone="teal" label="ติดตามครั้งที่ 2 (A2)" value={`${indicatorRelate15Metrics?.followed2x.toLocaleString() ?? "-"}`} note={`${indicatorRelate15Metrics?.rate2x ?? "-"}%`} index={3} />
      </section>

      <div className="indicator1-layout">
        <IndicatorRelate15InsightsCard />

        <div className="indicator1-columns">
          <div className="indicator1-main">
            <p className="section-label">เปรียบเทียบอัตราติดตามครั้งที่ 1 และครั้งที่ 2 รายอำเภอ</p>
            <section className="panel analytics-card">
              <div className="panel-heading">
                <div><p className="eyebrow">ตัวชี้วัดที่เกี่ยวข้อง 15</p><h2>อัตราการดูแลต่อเนื่อง แยกตามอำเภอ</h2></div>
                <span className="live-pill"><i /> ข้อมูลจริงจาก HDC</span>
              </div>
              <div className="chart-wrap chart-wrap-tall" aria-label="กราฟอัตราติดตามครั้งที่ 1 และ 2 แยกตามอำเภอ">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} layout="vertical" margin={{ top: 4, right: 24, left: 0, bottom: 0 }}>
                    <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 11 }} />
                    <YAxis dataKey="amphoe" type="category" axisLine={false} tickLine={false} width={78} tick={{ fill: "#475569", fontSize: 12 }} />
                    <Tooltip
                      cursor={{ fill: "rgba(14, 138, 82, .04)" }}
                      content={({ active, payload }) =>
                        active && payload?.length ? (
                          <div className="chart-tooltip">
                            <b>ครั้งที่ 1: {payload.find((p) => p.dataKey === "rate1x")?.value ?? 0}%</b>
                            <b>ครั้งที่ 2: {payload.find((p) => p.dataKey === "rate2x")?.value ?? 0}%</b>
                            <span>{payload[0].payload.amphoe}</span>
                          </div>
                        ) : null
                      }
                    />
                    <Bar dataKey="rate1x" radius={[0, 6, 6, 0]} animationDuration={850} fill="#c7d2fe" />
                    <Bar dataKey="rate2x" radius={[0, 6, 6, 0]} animationDuration={850} fill="#4338ca" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="facility-compare-legend">
                <span><i className="facility-dot" style={{ background: "#c7d2fe" }} /> ติดตามครั้งที่ 1</span>
                <span><i className="facility-dot" style={{ background: "#4338ca" }} /> ติดตามครั้งที่ 2</span>
              </div>
            </section>
          </div>

          <div className="indicator1-side">
            <section className="timer-card report-info-card">
              <div><p>ที่มาของข้อมูล</p><span className="pulse-text"><i /> ดึงจากหน้าเว็บ HDC จริง</span></div>
              <strong className="report-info-value">{indicatorRelate15AmphoeStats.length} อำเภอ</strong>
              <p className="report-info-note">อัปเดต {formatDate(indicatorRelate15ExtractedAt)}</p>
              {indicatorRelate15ProcessedDate && <p className="report-info-processed"><span>วันที่ประมวลผล</span><strong>{indicatorRelate15ProcessedDate}</strong></p>}
            </section>

            <section className="panel projects-card amphoe-table-card">
              <div className="panel-title-row"><h2>รายชื่ออำเภอ</h2><span className="soft-button" style={{ pointerEvents: "none" }}><MapPinned size={14} /> {indicatorRelate15AmphoeStats.length} อำเภอ</span></div>
              <div className="project-list">
                {indicatorRelate15AmphoeStats.map((item) => (
                  <div className="project-row" key={item.amphoe}>
                    <span className="project-symbol" style={{ "--symbol": "#4338ca" } as React.CSSProperties}><span /></span>
                    <span><strong>{item.amphoe}</strong><small>ครั้งที่ 1: {item.followed1x.toLocaleString()} ({item.rate1x}%) · ครั้งที่ 2: {item.followed2x.toLocaleString()} ({item.rate2x}%)</small></span>
                    <span className="status warning">{item.rate2x}%</span>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>

      <section className="panel projects-card hdc-full-table-card">
        <div className="panel-title-row">
          <h2>ตารางข้อมูลตาม HDC (ทุกคอลัมน์)</h2>
          <span className="soft-button" style={{ pointerEvents: "none" }}><MapPinned size={14} /> รายพื้นที่ (เขตพื้นที่)</span>
        </div>
        <HdcRawTable columns={indicatorRelate15TableColumns} headerRows={indicatorRelate15TableHeaderRows} rows={indicatorRelate15TableRows} />
      </section>
    </motion.div>
  );
}

function IndicatorRelate16InsightsCard() {
  const { highest, lowest, avgRate, belowAvgCount } = indicatorRelate16Insights;
  return (
    <section className="panel insight-card">
      <div className="panel-heading">
        <div><p className="eyebrow">วิเคราะห์ภาพรวม</p><h2>Insight ตัวชี้วัดที่เกี่ยวข้อง 16</h2></div>
        <span className="live-pill"><i /> วิเคราะห์อัตโนมัติ</span>
      </div>
      <div className="insight-list">
        <div className="insight-row">
          <span className="insight-icon insight-icon-up"><TrendingUp size={15} /></span>
          <span className="insight-copy">
            <strong>{highest?.amphoe ?? "-"}</strong> อัตรารักษาต่อเนื่องสูงสุด {highest?.rate ?? 0}%
            <small>{highest?.followed ?? 0} จาก {highest?.total ?? 0} คน</small>
          </span>
        </div>
        <div className="insight-row">
          <span className="insight-icon insight-icon-down"><TrendingDown size={15} /></span>
          <span className="insight-copy">
            <strong>{lowest?.amphoe ?? "-"}</strong> อัตรารักษาต่อเนื่องต่ำสุด {lowest?.rate ?? 0}%
            <small>เฉลี่ยทั้งจังหวัด {avgRate}%</small>
          </span>
        </div>
        <div className="insight-row">
          <span className="insight-icon insight-icon-target"><Target size={15} /></span>
          <span className="insight-copy">
            <strong>{belowAvgCount} อำเภอ</strong> ต่ำกว่าค่าเฉลี่ยจังหวัด
            <small>จากทั้งหมด {indicatorRelate16AmphoeStats.length} อำเภอ</small>
          </span>
        </div>
      </div>
    </section>
  );
}

function IndicatorRelate16Section() {
  const chartData = indicatorRelate16AmphoeStats.map((item) => ({ amphoe: item.amphoe, rate: item.rate }));

  return (
    <motion.div className="indicator-group" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .45, ease }}>
      <div className="indicator-group-head">
        <span className="indicator-badge indicator-badge-16">ตัวชี้วัดที่เกี่ยวข้อง 16</span>
        <h2>{indicatorRelate16Name}</h2>
        <p>ข้อมูลระดับจังหวัด มุมมองรายพื้นที่ (เขตพื้นที่) — ดึงโดย automate จากหน้าเว็บ HDC จริง</p>
        <a href={indicatorRelate16SourceUrl} target="_blank" rel="noopener noreferrer" className="source-link source-link-inline">
          <ExternalLink size={13} /> ดูรายงานต้นฉบับบน HDC
        </a>
        <SmiVNote text="เป็นโรคเดียวกับ SMI-V กลุ่มจิตเภท (F20-F29) ใช้ติดตามการรักษา" />
      </div>

      <section className="stats-grid" aria-label="สถิติตัวชี้วัดที่เกี่ยวข้อง 16">
        <StatCard icon={Users} tone="blue" label="ผู้ป่วยทั้งหมด (B)" value={`${indicatorRelate16Metrics?.total.toLocaleString() ?? "-"}`} note="ในปีงบประมาณ" index={0} featured />
        <StatCard icon={ListChecks} tone="teal" label="ติดตามต่อเนื่อง (A)" value={`${indicatorRelate16Metrics?.followed.toLocaleString() ?? "-"}`} note="ภายใน 6 เดือน" index={1} />
        <StatCard icon={Percent} tone="teal" label="อัตราการรักษาต่อเนื่อง" value={`${indicatorRelate16Metrics?.rate ?? "-"}%`} note="(A/B) x 100" index={2} />
      </section>

      <div className="indicator1-layout">
        <IndicatorRelate16InsightsCard />

        <div className="indicator1-columns">
          <div className="indicator1-main">
            <p className="section-label">การกระจายตัวรายอำเภอ</p>
            <section className="panel analytics-card">
              <div className="panel-heading">
                <div><p className="eyebrow">ตัวชี้วัดที่เกี่ยวข้อง 16</p><h2>อัตราการรักษาต่อเนื่องภายใน 6 เดือน แยกตามอำเภอ</h2></div>
                <span className="live-pill"><i /> ข้อมูลจริงจาก HDC</span>
              </div>
              <div className="chart-wrap chart-wrap-tall" aria-label="กราฟอัตราการรักษาต่อเนื่อง แยกตามอำเภอ (Reverse)">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} layout="vertical" margin={{ top: 4, right: 24, left: 0, bottom: 0 }}>
                    <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 11 }} />
                    <YAxis dataKey="amphoe" type="category" axisLine={false} tickLine={false} width={78} tick={{ fill: "#475569", fontSize: 12 }} />
                    <Tooltip
                      cursor={{ fill: "rgba(82, 56, 189, .04)" }}
                      content={({ active, payload }) =>
                        active && payload?.[0] ? (
                          <div className="chart-tooltip">
                            <b>{payload[0].value}%</b>
                            <span>{payload[0].payload.amphoe}</span>
                          </div>
                        ) : null
                      }
                    />
                    <Bar dataKey="rate" radius={[0, 12, 12, 0]} animationDuration={850}>
                      {chartData.map((entry, index) => (
                        <Cell key={entry.amphoe} fill={index === 0 ? "#372580" : index < 3 ? "#5238bd" : "#c3b8ea"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </section>
          </div>

          <div className="indicator1-side">
            <section className="timer-card report-info-card">
              <div><p>ที่มาของข้อมูล</p><span className="pulse-text"><i /> ดึงจากหน้าเว็บ HDC จริง</span></div>
              <strong className="report-info-value">{indicatorRelate16AmphoeStats.length} อำเภอ</strong>
              <p className="report-info-note">อัปเดต {formatDate(indicatorRelate16ExtractedAt)}</p>
              {indicatorRelate16ProcessedDate && <p className="report-info-processed"><span>วันที่ประมวลผล</span><strong>{indicatorRelate16ProcessedDate}</strong></p>}
            </section>

            <section className="panel projects-card amphoe-table-card">
              <div className="panel-title-row"><h2>รายชื่ออำเภอ</h2><span className="soft-button" style={{ pointerEvents: "none" }}><MapPinned size={14} /> {indicatorRelate16AmphoeStats.length} อำเภอ</span></div>
              <div className="project-list">
                {indicatorRelate16AmphoeStats.map((item) => (
                  <div className="project-row" key={item.amphoe}>
                    <span className="project-symbol" style={{ "--symbol": "#5238bd" } as React.CSSProperties}><span /></span>
                    <span><strong>{item.amphoe}</strong><small>ผู้ป่วย {item.total.toLocaleString()} · ติดตามต่อเนื่อง {item.followed.toLocaleString()} คน</small></span>
                    <span className="status warning">{item.rate}%</span>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>

      <section className="panel projects-card hdc-full-table-card">
        <div className="panel-title-row">
          <h2>ตารางข้อมูลตาม HDC (ทุกคอลัมน์)</h2>
          <span className="soft-button" style={{ pointerEvents: "none" }}><MapPinned size={14} /> รายพื้นที่ (เขตพื้นที่)</span>
        </div>
        <HdcRawTable columns={indicatorRelate16TableColumns} headerRows={indicatorRelate16TableHeaderRows} rows={indicatorRelate16TableRows} />
      </section>
    </motion.div>
  );
}

function IndicatorRelate21_2InsightsCard() {
  const { highest, lowest, avgRate, belowAvgCount } = indicatorRelate21_2Insights;
  return (
    <section className="panel insight-card">
      <div className="panel-heading">
        <div><p className="eyebrow">วิเคราะห์ภาพรวม</p><h2>Insight ตัวชี้วัดที่เกี่ยวข้อง 21.2</h2></div>
        <span className="live-pill"><i /> วิเคราะห์อัตโนมัติ</span>
      </div>
      <div className="insight-list">
        <div className="insight-row">
          <span className="insight-icon insight-icon-up"><TrendingUp size={15} /></span>
          <span className="insight-copy">
            <strong>{highest?.amphoe ?? "-"}</strong> สัดส่วนผู้ป่วยยาเสพติด (OPD) สูงสุด {highest?.opdRate ?? 0}%
            <small>{highest?.opdF1019 ?? 0} จาก {highest?.opdTotal ?? 0} คน</small>
          </span>
        </div>
        <div className="insight-row">
          <span className="insight-icon insight-icon-down"><TrendingDown size={15} /></span>
          <span className="insight-copy">
            <strong>{lowest?.amphoe ?? "-"}</strong> สัดส่วนผู้ป่วยยาเสพติด (OPD) ต่ำสุด {lowest?.opdRate ?? 0}%
            <small>เฉลี่ยทั้งจังหวัด {avgRate}%</small>
          </span>
        </div>
        <div className="insight-row">
          <span className="insight-icon insight-icon-target"><Target size={15} /></span>
          <span className="insight-copy">
            <strong>{belowAvgCount} อำเภอ</strong> ต่ำกว่าค่าเฉลี่ยจังหวัด
            <small>จากทั้งหมด {indicatorRelate21_2AmphoeStats.length} อำเภอ</small>
          </span>
        </div>
      </div>
    </section>
  );
}

function IndicatorRelate21_2Section() {
  const chartData = indicatorRelate21_2AmphoeStats.map((item) => ({ amphoe: item.amphoe, opdRate: item.opdRate }));

  return (
    <motion.div className="indicator-group" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .45, ease }}>
      <div className="indicator-group-head">
        <span className="indicator-badge indicator-badge-14">ตัวชี้วัดที่เกี่ยวข้อง 21.2</span>
        <h2>{indicatorRelate21_2Name}</h2>
        <p>ข้อมูลระดับจังหวัด แยกตามสถานพยาบาล (workload) — ดึงโดย automate จากหน้าเว็บ HDC จริง</p>
        <a href={indicatorRelate21_2SourceUrl} target="_blank" rel="noopener noreferrer" className="source-link source-link-inline">
          <ExternalLink size={13} /> ดูรายงานต้นฉบับบน HDC
        </a>
        <SmiVNote text="เกี่ยวข้องกับกลุ่ม SMI-V สารเสพติด (F10-F19)" />
      </div>

      <section className="stats-grid" aria-label="สถิติตัวชี้วัดที่เกี่ยวข้อง 21.2">
        <StatCard icon={Stethoscope} tone="blue" label="ผู้ป่วยนอกทั้งหมด (B1)" value={`${indicatorRelate21_2Metrics?.opdTotal.toLocaleString() ?? "-"}`} note="F00-F99 ทั้งจังหวัด" index={0} featured />
        <StatCard icon={Pill} tone="purple" label="ผู้ป่วยนอกสารเสพติด (A1)" value={`${indicatorRelate21_2Metrics?.opdF1019.toLocaleString() ?? "-"}`} note={`${indicatorRelate21_2Metrics?.opdRate ?? "-"}% ของผู้ป่วยนอกทั้งหมด`} index={1} />
        <StatCard icon={Hospital} tone="blue" label="ผู้ป่วยในทั้งหมด (B2)" value={`${indicatorRelate21_2Metrics?.ipdTotal.toLocaleString() ?? "-"}`} note="F00-F99 ทั้งจังหวัด" index={2} />
        <StatCard icon={Pill} tone="purple" label="ผู้ป่วยในสารเสพติด (A2)" value={`${indicatorRelate21_2Metrics?.ipdF1019.toLocaleString() ?? "-"}`} note={`${indicatorRelate21_2Metrics?.ipdRate ?? "-"}% ของผู้ป่วยในทั้งหมด`} index={3} />
      </section>

      <div className="indicator1-layout">
        <IndicatorRelate21_2InsightsCard />

        <div className="indicator1-columns">
          <div className="indicator1-main">
            <p className="section-label">สัดส่วนผู้ป่วยนอกสารเสพติด แยกตามอำเภอ</p>
            <section className="panel analytics-card">
              <div className="panel-heading">
                <div><p className="eyebrow">ตัวชี้วัดที่เกี่ยวข้อง 21.2</p><h2>ร้อยละผู้ป่วยนอกสารเสพติด (F10-F19) แยกตามอำเภอ</h2></div>
                <span className="live-pill"><i /> ข้อมูลจริงจาก HDC</span>
              </div>
              <div className="chart-wrap chart-wrap-tall" aria-label="กราฟร้อยละผู้ป่วยนอกสารเสพติดแยกตามอำเภอ">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} layout="vertical" margin={{ top: 4, right: 24, left: 0, bottom: 0 }}>
                    <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 11 }} />
                    <YAxis dataKey="amphoe" type="category" axisLine={false} tickLine={false} width={78} tick={{ fill: "#475569", fontSize: 12 }} />
                    <Tooltip
                      cursor={{ fill: "rgba(181, 38, 95, .04)" }}
                      content={({ active, payload }) =>
                        active && payload?.[0] ? (
                          <div className="chart-tooltip">
                            <b>{payload[0].value}%</b>
                            <span>{payload[0].payload.amphoe}</span>
                          </div>
                        ) : null
                      }
                    />
                    <Bar dataKey="opdRate" radius={[0, 12, 12, 0]} animationDuration={850}>
                      {chartData.map((entry, index) => (
                        <Cell key={entry.amphoe} fill={index === 0 ? "#8a1a48" : index < 3 ? "#b5265f" : "#d998b3"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </section>
          </div>

          <div className="indicator1-side">
            <section className="timer-card report-info-card">
              <div><p>ที่มาของข้อมูล</p><span className="pulse-text"><i /> ดึงจากหน้าเว็บ HDC จริง</span></div>
              <strong className="report-info-value">{indicatorRelate21_2AmphoeStats.length} อำเภอ</strong>
              <p className="report-info-note">อัปเดต {formatDate(indicatorRelate21_2ExtractedAt)}</p>
              {indicatorRelate21_2ProcessedDate && <p className="report-info-processed"><span>วันที่ประมวลผล</span><strong>{indicatorRelate21_2ProcessedDate}</strong></p>}
            </section>

            <section className="panel projects-card amphoe-table-card">
              <div className="panel-title-row"><h2>รายชื่ออำเภอ</h2><span className="soft-button" style={{ pointerEvents: "none" }}><MapPinned size={14} /> {indicatorRelate21_2AmphoeStats.length} อำเภอ</span></div>
              <div className="project-list">
                {indicatorRelate21_2AmphoeStats.map((item) => (
                  <div className="project-row" key={item.amphoe}>
                    <span className="project-symbol" style={{ "--symbol": "#b5265f" } as React.CSSProperties}><span /></span>
                    <span><strong>{item.amphoe}</strong><small>OPD {item.opdF1019.toLocaleString()}/{item.opdTotal.toLocaleString()} · IPD {item.ipdF1019.toLocaleString()}/{item.ipdTotal.toLocaleString()}</small></span>
                    <span className="status warning">{item.opdRate}%</span>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>

      <section className="panel projects-card hdc-full-table-card">
        <div className="panel-title-row">
          <h2>ตารางข้อมูลตาม HDC (ทุกคอลัมน์)</h2>
          <span className="soft-button" style={{ pointerEvents: "none" }}><MapPinned size={14} /> รายอำเภอ</span>
        </div>
        <HdcRawTable columns={indicatorRelate21_2TableColumns} headerRows={indicatorRelate21_2TableHeaderRows} rows={indicatorRelate21_2TableRows} />
      </section>
    </motion.div>
  );
}

function IndicatorRelate21_6InsightsCard() {
  const { highest, lowest, avgRate, belowAvgCount } = indicatorRelate21_6Insights;
  return (
    <section className="panel insight-card">
      <div className="panel-heading">
        <div><p className="eyebrow">วิเคราะห์ภาพรวม</p><h2>Insight ตัวชี้วัดที่เกี่ยวข้อง 21.6</h2></div>
        <span className="live-pill"><i /> วิเคราะห์อัตโนมัติ</span>
      </div>
      <div className="insight-list">
        <div className="insight-row">
          <span className="insight-icon insight-icon-up"><TrendingUp size={15} /></span>
          <span className="insight-copy">
            <strong>{highest?.amphoe ?? "-"}</strong> Retention Rate สูงสุด {highest?.retentionRateOverall ?? 0}%
          </span>
        </div>
        <div className="insight-row">
          <span className="insight-icon insight-icon-down"><TrendingDown size={15} /></span>
          <span className="insight-copy">
            <strong>{lowest?.amphoe ?? "-"}</strong> Retention Rate ต่ำสุด {lowest?.retentionRateOverall ?? 0}%
            <small>เฉลี่ยทั้งจังหวัด {avgRate}%</small>
          </span>
        </div>
        <div className="insight-row">
          <span className="insight-icon insight-icon-target"><Target size={15} /></span>
          <span className="insight-copy">
            <strong>{belowAvgCount} อำเภอ</strong> ต่ำกว่าค่าเฉลี่ยจังหวัด
            <small>จากทั้งหมด {indicatorRelate21_6AmphoeStats.length} อำเภอ</small>
          </span>
        </div>
      </div>
    </section>
  );
}

function IndicatorRelate21_6Section() {
  const chartData = indicatorRelate21_6AmphoeStats.map((item) => ({ amphoe: item.amphoe, retentionRateOverall: item.retentionRateOverall }));

  return (
    <motion.div className="indicator-group" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .45, ease }}>
      <div className="indicator-group-head">
        <span className="indicator-badge indicator-badge-15">ตัวชี้วัดที่เกี่ยวข้อง 21.6</span>
        <h2>{indicatorRelate21_6Name}</h2>
        <p>ข้อมูลระดับจังหวัด มุมมองรายอำเภอ — ดึงโดย automate จากหน้าเว็บ HDC จริง</p>
        <a href={indicatorRelate21_6SourceUrl} target="_blank" rel="noopener noreferrer" className="source-link source-link-inline">
          <ExternalLink size={13} /> ดูรายงานต้นฉบับบน HDC
        </a>
        <SmiVNote text="เกี่ยวข้องกับกลุ่ม SMI-V สารเสพติด (F10-F19)" />
      </div>

      <section className="stats-grid" aria-label="สถิติตัวชี้วัดที่เกี่ยวข้อง 21.6">
        <StatCard icon={HeartPulse} tone="blue" label="ผู้ป่วยจิตเวชจาก บสต. ทั้งหมด" value={`${indicatorRelate21_6Metrics?.totalPsychFromBsot.toLocaleString() ?? "-"}`} note="ทั้งหมดในกลุ่มโรคจิตเวช" index={0} featured />
        <StatCard icon={Percent} tone="teal" label="Retention Rate เฉลี่ยจังหวัด" value={`${indicatorRelate21_6Metrics?.retentionRateOverall ?? "-"}%`} note="ติดตามดูแลหลังบำบัดต่อเนื่อง" index={1} />
      </section>

      <div className="indicator1-layout">
        <IndicatorRelate21_6InsightsCard />

        <div className="indicator1-columns">
          <div className="indicator1-main">
            <p className="section-label">Retention Rate แยกตามอำเภอ</p>
            <section className="panel analytics-card">
              <div className="panel-heading">
                <div><p className="eyebrow">ตัวชี้วัดที่เกี่ยวข้อง 21.6</p><h2>อัตราการติดตามดูแลหลังบำบัด (Retention Rate) แยกตามอำเภอ</h2></div>
                <span className="live-pill"><i /> ข้อมูลจริงจาก HDC</span>
              </div>
              <div className="chart-wrap chart-wrap-tall" aria-label="กราฟ Retention Rate แยกตามอำเภอ">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} layout="vertical" margin={{ top: 4, right: 24, left: 0, bottom: 0 }}>
                    <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 11 }} />
                    <YAxis dataKey="amphoe" type="category" axisLine={false} tickLine={false} width={78} tick={{ fill: "#475569", fontSize: 12 }} />
                    <Tooltip
                      cursor={{ fill: "rgba(14, 138, 82, .04)" }}
                      content={({ active, payload }) =>
                        active && payload?.[0] ? (
                          <div className="chart-tooltip">
                            <b>{payload[0].value}%</b>
                            <span>{payload[0].payload.amphoe}</span>
                          </div>
                        ) : null
                      }
                    />
                    <Bar dataKey="retentionRateOverall" radius={[0, 12, 12, 0]} animationDuration={850}>
                      {chartData.map((entry, index) => (
                        <Cell key={entry.amphoe} fill={index === 0 ? "#4338ca" : index < 3 ? "#6366f1" : "#c7d2fe"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </section>
          </div>

          <div className="indicator1-side">
            <section className="timer-card report-info-card">
              <div><p>ที่มาของข้อมูล</p><span className="pulse-text"><i /> ดึงจากหน้าเว็บ HDC จริง</span></div>
              <strong className="report-info-value">{indicatorRelate21_6AmphoeStats.length} อำเภอ</strong>
              <p className="report-info-note">อัปเดต {formatDate(indicatorRelate21_6ExtractedAt)}</p>
              {indicatorRelate21_6ProcessedDate && <p className="report-info-processed"><span>วันที่ประมวลผล</span><strong>{indicatorRelate21_6ProcessedDate}</strong></p>}
            </section>

            <section className="panel projects-card amphoe-table-card">
              <div className="panel-title-row"><h2>รายชื่ออำเภอ</h2><span className="soft-button" style={{ pointerEvents: "none" }}><MapPinned size={14} /> {indicatorRelate21_6AmphoeStats.length} อำเภอ</span></div>
              <div className="project-list">
                {indicatorRelate21_6AmphoeStats.map((item) => (
                  <div className="project-row" key={item.amphoe}>
                    <span className="project-symbol" style={{ "--symbol": "#4338ca" } as React.CSSProperties}><span /></span>
                    <span><strong>{item.amphoe}</strong><small>ผู้ป่วยจิตเวชจาก บสต. {item.totalPsychFromBsot.toLocaleString()} คน</small></span>
                    <span className="status warning">{item.retentionRateOverall}%</span>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>

      <section className="panel projects-card hdc-full-table-card">
        <div className="panel-title-row">
          <h2>ตารางข้อมูลตาม HDC (ทุกคอลัมน์)</h2>
          <span className="soft-button" style={{ pointerEvents: "none" }}><MapPinned size={14} /> รายอำเภอ</span>
        </div>
        <HdcRawTable columns={indicatorRelate21_6TableColumns} headerRows={indicatorRelate21_6TableHeaderRows} rows={indicatorRelate21_6TableRows} />
      </section>
    </motion.div>
  );
}

const simpleIndicatorSmiVMessage: Record<SimpleIndicatorKey, string> = {
  "21_1": "เกี่ยวข้องกับกลุ่ม SMI-V สารเสพติด (F10-F19)",
  "21_4": "เกี่ยวข้องกับกลุ่ม SMI-V สารเสพติด (F10-F19)",
  "21_7": "เกี่ยวข้องกับกลุ่ม SMI-V สารเสพติด (F10-F19)",
  "22_1": "บริบทความรุนแรงและจิตเวช สามารถใช้วิเคราะห์ร่วมกับ SMI-V ได้",
  "22_2": "บริบทความรุนแรงและจิตเวช สามารถใช้วิเคราะห์ร่วมกับ SMI-V ได้",
  "22_3": "บริบทความรุนแรงและจิตเวช สามารถใช้วิเคราะห์ร่วมกับ SMI-V ได้",
  "22_4": "บริบทความรุนแรงและจิตเวช สามารถใช้วิเคราะห์ร่วมกับ SMI-V ได้",
  "22_5": "บริบทความรุนแรงและจิตเวช สามารถใช้วิเคราะห์ร่วมกับ SMI-V ได้",
  "22_6": "บริบทความรุนแรงและจิตเวช สามารถใช้วิเคราะห์ร่วมกับ SMI-V ได้",
  "22_7": "บริบทความรุนแรงและจิตเวช สามารถใช้วิเคราะห์ร่วมกับ SMI-V ได้",
  "23_4": "เป็นโรคหลักในเกณฑ์ SMI-V (F20-29, F30-31, F32-39) ใช้เฝ้าระวังเชิงระบาดวิทยา",
  "23_5": "เป็นโรคหลักในเกณฑ์ SMI-V (F20-29, F30-31, F32-39) ใช้เฝ้าระวังเชิงระบาดวิทยา",
  "23_6": "เป็นโรคหลักในเกณฑ์ SMI-V (F20-29, F30-31, F32-39) ใช้เฝ้าระวังเชิงระบาดวิทยา",
};

/** หน้าตัวชี้วัดเพิ่มเติมระดับจังหวัด (ไม่มีมิติอำเภอ) — Dashboard วิเคราะห์ (จากมิติที่มีในตาราง) + ตาราง HDC ตรงต้นฉบับ + ข้อความเชื่อมโยง SMI-V */
const DONUT_COLORS = ["#4338ca", "#6366f1", "#818cf8", "#a5b4fc", "#c7d2fe", "#f59e0b", "#fbbf24", "#fde68a", "#fda4af", "#f472b6", "#94a3b8", "#cbd5e1", "#e2e8f0"];

function DonutAnalysisCard({ analysis }: { analysis: Extract<SimpleAnalysis, { kind: "donut" }> }) {
  return (
    <section className="panel analytics-card">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">วิเคราะห์จากข้อมูลในตาราง</p>
          <h2>{analysis.axisLabel}</h2>
        </div>
        <span className="live-pill"><i /> ข้อมูลจริงจาก HDC</span>
      </div>
      <div className="donut-card-body">
        <div className="chart-wrap chart-wrap-donut" aria-label="กราฟวงกลมสัดส่วนข้อมูล">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={analysis.data} dataKey="value" nameKey="label" cx="50%" cy="50%" innerRadius="58%" outerRadius="88%" paddingAngle={2} animationDuration={850}>
                {analysis.data.map((entry: { label: string; value: number }, i: number) => (
                  <Cell key={entry.label} fill={DONUT_COLORS[i % DONUT_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) =>
                  active && payload?.[0] ? (
                    <div className="chart-tooltip">
                      <b>{(payload[0].value as number)?.toLocaleString()} {analysis.unit}</b>
                      <span>{payload[0].name} ({(((payload[0].value as number) / analysis.total) * 100).toFixed(1)}%)</span>
                    </div>
                  ) : null
                }
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="donut-center-label">
            <strong>{analysis.total.toLocaleString()}</strong>
            <span>{analysis.unit} รวม</span>
          </div>
        </div>
        <ul className="donut-legend">
          {analysis.data.map((d: { label: string; value: number }, i: number) => (
            <li key={d.label}>
              <span className="donut-legend-dot" style={{ background: DONUT_COLORS[i % DONUT_COLORS.length] }} />
              <span className="donut-legend-label">{d.label}</span>
              <span className="donut-legend-value">{d.value.toLocaleString()} ({((d.value / analysis.total) * 100).toFixed(1)}%)</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function heatmapColor(value: number, max: number) {
  if (max <= 0 || value <= 0) return "rgba(148, 163, 184, 0.08)";
  const t = Math.min(1, value / max);
  // ไล่เฉดสีม่วง-คราม จากอ่อนไปเข้มตามสัดส่วนค่า
  const alpha = 0.12 + t * 0.78;
  return `rgba(67, 56, 202, ${alpha.toFixed(3)})`;
}

function HeatmapAnalysisCard({ analysis }: { analysis: Extract<SimpleAnalysis, { kind: "heatmap" }> }) {
  const max = Math.max(1, ...analysis.matrix.flat());
  return (
    <section className="panel analytics-card">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">วิเคราะห์จากข้อมูลในตาราง</p>
          <h2>{analysis.axisLabel}</h2>
        </div>
        <span className="live-pill"><i /> ข้อมูลจริงจาก HDC</span>
      </div>
      <div className="heatmap-scroll">
        <table className="heatmap-table">
          <thead>
            <tr>
              <th className="heatmap-corner">กลุ่มอายุ</th>
              {analysis.cols.map((c: string) => (
                <th key={c} title={c}>{c.length > 14 ? c.slice(0, 12) + "…" : c}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {analysis.rows.map((rowLabel: string, ri: number) => (
              <tr key={rowLabel}>
                <th scope="row">{rowLabel}</th>
                {analysis.matrix[ri].map((v: number, ci: number) => (
                  <td key={ci} style={{ background: heatmapColor(v, max) }} title={`${rowLabel} × ${analysis.cols[ci]}: ${v.toLocaleString()} ${analysis.unit}`}>
                    {v > 0 ? v.toLocaleString() : ""}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="heatmap-legend-note">สีเข้มขึ้น = ค่าสูงขึ้น (สูงสุด {max.toLocaleString()} {analysis.unit})</p>
    </section>
  );
}

function SimpleIndicatorSection({ indicatorKey }: { indicatorKey: SimpleIndicatorKey }) {
  const data = getSimpleIndicator(indicatorKey);
  const analysis = getSimpleIndicatorAnalysis(indicatorKey);
  const label = simpleIndicatorLabels[indicatorKey];
  const message = simpleIndicatorSmiVMessage[indicatorKey];

  return (
    <motion.div className="indicator-group" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .45, ease }}>
      <div className="indicator-group-head">
        <span className="indicator-badge indicator-badge-16">ตัวชี้วัดที่เกี่ยวข้อง {label}</span>
        <h2>{data.name}</h2>
        <p>ข้อมูลระดับจังหวัด (ไม่มีมิติอำเภอ) — ดึงโดย automate จากหน้าเว็บ HDC จริง</p>
        <a href={data.sourceUrl} target="_blank" rel="noopener noreferrer" className="source-link source-link-inline">
          <ExternalLink size={13} /> ดูรายงานต้นฉบับบน HDC
        </a>
        <SmiVNote text={message} />
      </div>

      <section className="timer-card report-info-card" style={{ maxWidth: 420 }}>
        <div><p>ที่มาของข้อมูล</p><span className="pulse-text"><i /> ดึงจากหน้าเว็บ HDC จริง</span></div>
        <strong className="report-info-value">จังหวัดสตูล</strong>
        <p className="report-info-note">อัปเดต {formatDate(data.extractedAt)}</p>
        {data.processedDate && <p className="report-info-processed"><span>วันที่ประมวลผล</span><strong>{data.processedDate}</strong></p>}
      </section>

      {analysis.kind === "metrics" && (
        <section className="stats-grid" aria-label={`สถิติตัวชี้วัดที่เกี่ยวข้อง ${label}`}>
          {analysis.items.map((item, i) => (
            <StatCard key={item.label} icon={Activity} tone={(["blue", "teal", "green", "purple", "rose", "amber"] as const)[i % 6]} label={item.label} value={`${item.value}${item.unit}`} note={item.note ?? ""} index={i} featured={i === 0} />
          ))}
        </section>
      )}

      {(analysis.kind === "breakdown" || analysis.kind === "monthly") && analysis.data.length > 0 && (
        <section className="panel analytics-card">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">วิเคราะห์จากข้อมูลในตาราง</p>
              <h2>{analysis.kind === "monthly" ? `แนวโน้มรายเดือน (รวม ${analysis.total.toLocaleString()} ${analysis.unit})` : analysis.axisLabel}</h2>
            </div>
            <span className="live-pill"><i /> ข้อมูลจริงจาก HDC</span>
          </div>
          <div className="chart-wrap chart-wrap-tall" aria-label="กราฟวิเคราะห์ข้อมูล">
            <ResponsiveContainer width="100%" height="100%">
              {analysis.kind === "monthly" ? (
                <LineChart data={analysis.data} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
                  <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 11 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 11 }} />
                  <Tooltip
                    cursor={{ stroke: "#4338ca", strokeDasharray: "3 3" }}
                    content={({ active, payload }) =>
                      active && payload?.[0] ? (
                        <div className="chart-tooltip">
                          <b>{payload[0].value?.toLocaleString()} {analysis.unit}</b>
                          <span>{payload[0].payload.label}</span>
                        </div>
                      ) : null
                    }
                  />
                  <Line type="monotone" dataKey="value" stroke="#4338ca" strokeWidth={2.5} dot={{ r: 4, fill: "#4338ca" }} activeDot={{ r: 6 }} animationDuration={850} />
                </LineChart>
              ) : (
                <BarChart data={analysis.data} layout="vertical" margin={{ top: 4, right: 24, left: 0, bottom: 0 }}>
                  <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 11 }} />
                  <YAxis dataKey="label" type="category" axisLine={false} tickLine={false} width={140} tick={{ fill: "#475569", fontSize: 11 }} />
                  <Tooltip
                    cursor={{ fill: "rgba(20, 105, 72, .04)" }}
                    content={({ active, payload }) =>
                      active && payload?.[0] ? (
                        <div className="chart-tooltip">
                          <b>{payload[0].value?.toLocaleString()} {analysis.unit}</b>
                          <span>{payload[0].payload.label}</span>
                        </div>
                      ) : null
                    }
                  />
                  <Bar dataKey="value" radius={[0, 8, 8, 0]} animationDuration={850}>
                    {analysis.data.map((entry, index) => (
                      <Cell key={entry.label} fill={index === 0 ? "#8a1a48" : index < 3 ? "#b5265f" : "#d998b3"} />
                    ))}
                  </Bar>
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        </section>
      )}

      {analysis.kind === "donut" && analysis.data.length > 0 && <DonutAnalysisCard analysis={analysis} />}

      {analysis.kind === "heatmap" && analysis.matrix.length > 0 && <HeatmapAnalysisCard analysis={analysis} />}



      {analysis.kind === "zero" && (
        <section className="panel analytics-card">
          <div className="panel-heading">
            <div><p className="eyebrow">วิเคราะห์จากข้อมูลในตาราง</p><h2>ยังไม่มีข้อมูลให้วิเคราะห์ในช่วงเวลานี้</h2></div>
          </div>
          <p className="hdc-table-empty">{analysis.note}</p>
        </section>
      )}

      <section className="panel projects-card hdc-full-table-card">
        <div className="panel-title-row">
          <h2>ตารางข้อมูลตาม HDC (ทุกคอลัมน์)</h2>
          <span className="soft-button" style={{ pointerEvents: "none" }}><MapPinned size={14} /> ระดับจังหวัด</span>
        </div>
        <HdcRawTable columns={data.columns} headerRows={data.headerRows} rows={data.rows} />
      </section>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// HIPPO HDC — raw record-level pivot explorer (person_id, source, ampur,
// hoscode, hosname, code, typearea, age_band). One row per real record —
// no pre-aggregation, so COUNT(DISTINCT person_id) at ANY grouping is
// always correct (no double-counting risk when marginalizing a dimension,
// unlike the old pre-rolled-up summary CSV).
// ---------------------------------------------------------------------------
type HippoRecord = {
  person_id: string;
  source: "DIAGNOSIS_OPD" | "SPECIALPP";
  ampur: string;
  hoscode: string;
  hosname: string;
  code: string;
  category: string;
  date_serv: string; // "YYYY-MM-DD", may be "" if unknown
  typearea: string;
  typearea_label: string;
  age_band: string;
};

const HIPPO_AGE_ORDER = ["0-14 ปี", "15-29 ปี", "30-44 ปี", "45-59 ปี", "60-74 ปี", "75 ปีขึ้นไป", "ไม่ทราบ"];
const HIPPO_TYPEAREA_LABEL: Record<string, string> = {
  "1": "1: ในเขต มีชื่อ+อยู่จริง",
  "2": "2: ในเขต มีชื่อ แต่ไม่อยู่จริง",
  "3": "3: อาศัยในเขต ทะเบียนบ้านอยู่นอกเขต",
  "4": "4: นอกเขต มารับบริการ/เคยอยู่ในเขต",
  "5": "5: อื่นๆ",
  "": "ไม่ทราบ",
  "1+3": "1+3: รวม (อยู่จริงในเขต + อาศัยในเขตทะเบียนนอกเขต)",
};
const HIPPO_SOURCE_LABEL: Record<HippoRecord["source"], string> = {
  DIAGNOSIS_OPD: "จำแนกตามการวินิจฉัย (DIAGNOSIS_OPD)",
  SPECIALPP: "ประเมินความเสี่ยง SMI-V (SPECIALPP)",
};

const HIPPO_SPECIALPP_LABEL: Record<string, string> = {
  "1B030": "ประเมินความเสี่ยง SMI-V: ทำร้ายตนเองรุนแรง (1B030)",
  "1B031": "ประเมินความเสี่ยง SMI-V: ทำร้ายผู้อื่น/ก่อเหตุรุนแรง (1B031)",
  "1B032": "ประเมินความเสี่ยง SMI-V: หลงผิด มุ่งร้ายเฉพาะเจาะจง (1B032)",
  "1B033": "ประเมินความเสี่ยง SMI-V: ก่อคดีอาชญากรรมรุนแรง (1B033)",
  "1B036": "ประเมินความเสี่ยง SMI-V: พบว่าปกติ (1B036)",
  "1B037": "ประเมินความเสี่ยง SMI-V: ก่อเหตุรุนแรงแล้ว ได้รับการติดตาม (1B037)",
};

// Same clinical grouping as scripts/sql/hippo-hdc-records.sql's WHERE scope —
// kept client-side so the raw `code` column stays untouched in the CSV.
function hippoIcdCategory(code: string): string | null {
  const root = code.startsWith("F341") ? "F341" : code.startsWith("F638") ? "F638" : code.startsWith("F988") ? "F988" : code.slice(0, 3);
  if (root >= "F00" && root <= "F03") return "โรคสมองเสื่อม (F00-F03)";
  if (root === "F10") return "ติดแอลกอฮอล์ (F10)";
  if (root === "F15") return "ติดยาบ้า Amphetamine (F15)";
  if (["F11", "F12", "F13", "F14", "F16", "F17", "F18", "F19"].includes(root)) return "ติดสารเสพติดอื่นๆ (F11-F19)";
  if (root === "F20") return "โรคจิตเภท (F20)";
  if (root >= "F21" && root <= "F29") return "โรคจิตอื่นๆ (F21-F29)";
  if (root === "F31") return "โรคอารมณ์สองขั้ว (F31)";
  if (["F32", "F33", "F341", "F38", "F39"].includes(root)) return "โรคซึมเศร้า (F32,F33,F341,F38,F39)";
  if (root >= "F40" && root <= "F48") return "โรควิตกกังวล (F40-F48)";
  if (root >= "F70" && root <= "F79") return "ความบกพร่องทางสติปัญญา (F70-F79)";
  if (root === "F81") return "ความบกพร่องทางการเรียนรู้ (F81)";
  if (root === "F84") return "โรคออทิสติก (F84)";
  if (root === "F90") return "โรคสมาธิสั้น (F90)";
  if (root >= "X60" && root <= "X84") return "พยายามฆ่าตัวตาย/ตั้งใจทำร้ายตนเอง (X60-X84)";
  if (root === "F638") return "ผู้ป่วยติดเกมส์ในผู้ใหญ่ 15 ปีขึ้นไป (F638)";
  if (root === "F988") return "ผู้ป่วยติดเกมส์ในเด็ก ต่ำกว่า 15 ปี (F988)";
  if (root >= "G40" && root <= "G41") return "โรคลมชัก (G40-G41)";
  const OTHER = new Set([
    "F04", "F05", "F06", "F07", "F09",
    "F50", "F51", "F52", "F53", "F54", "F55", "F56", "F57", "F58", "F59",
    "F60", "F61", "F62", "F63", "F64", "F65", "F66", "F67", "F68", "F69",
    "F80", "F82", "F83", "F88", "F89",
    "F91", "F92", "F93", "F94", "F95", "F96", "F97", "F98", "F99",
  ]);
  if (OTHER.has(root)) return "โรคทางจิตเวชอื่นๆ";
  return "อื่นๆ (ยังไม่จัดกลุ่ม)";
}

// Clinical code order, NOT alphabetical Thai sort — SPECIALPP (รหัสส่งเสริมป้องกัน)
// codes first in their own fixed screening order, then ICD-10-TM (รหัสวินิจฉัย)
// groups in the same order hippoIcdCategory() checks them, so rows/columns read
// top-to-bottom the way a clinician expects (1B030→1B037, then F00→F99, X60-X84, G40-G41).
const HIPPO_SPECIALPP_ORDER = ["1B030", "1B031", "1B032", "1B033", "1B036", "1B037"];
const HIPPO_CATEGORY_ORDER = [
  "ประเมินความเสี่ยง SMI-V: ทำร้ายตนเองรุนแรง (1B030)",
  "ประเมินความเสี่ยง SMI-V: ทำร้ายผู้อื่น/ก่อเหตุรุนแรง (1B031)",
  "ประเมินความเสี่ยง SMI-V: หลงผิด มุ่งร้ายเฉพาะเจาะจง (1B032)",
  "ประเมินความเสี่ยง SMI-V: ก่อคดีอาชญากรรมรุนแรง (1B033)",
  "ประเมินความเสี่ยง SMI-V: พบว่าปกติ (1B036)",
  "ประเมินความเสี่ยง SMI-V: ก่อเหตุรุนแรงแล้ว ได้รับการติดตาม (1B037)",
  "โรคสมองเสื่อม (F00-F03)",
  "ติดแอลกอฮอล์ (F10)",
  "ติดยาบ้า Amphetamine (F15)",
  "ติดสารเสพติดอื่นๆ (F11-F19)",
  "โรคจิตเภท (F20)",
  "โรคจิตอื่นๆ (F21-F29)",
  "โรคอารมณ์สองขั้ว (F31)",
  "โรคซึมเศร้า (F32,F33,F341,F38,F39)",
  "โรควิตกกังวล (F40-F48)",
  "ความบกพร่องทางสติปัญญา (F70-F79)",
  "ความบกพร่องทางการเรียนรู้ (F81)",
  "โรคออทิสติก (F84)",
  "โรคสมาธิสั้น (F90)",
  "พยายามฆ่าตัวตาย/ตั้งใจทำร้ายตนเอง (X60-X84)",
  "ผู้ป่วยติดเกมส์ในผู้ใหญ่ 15 ปีขึ้นไป (F638)",
  "ผู้ป่วยติดเกมส์ในเด็ก ต่ำกว่า 15 ปี (F988)",
  "โรคลมชัก (G40-G41)",
  "โรคทางจิตเวชอื่นๆ",
  "อื่นๆ (ยังไม่จัดกลุ่ม)",
];
function hippoCategoryRank(category: string): number {
  const i = HIPPO_CATEGORY_ORDER.indexOf(category);
  return i === -1 ? HIPPO_CATEGORY_ORDER.length : i;
}
// key is the raw code (e.g. "1B030", "F200") — sort SPECIALPP by its fixed
// screening order, then ICD-10-TM codes by clinical category, then by code text.
function hippoCodeSortValue(key: string): [number, number, string] {
  const ppIdx = HIPPO_SPECIALPP_ORDER.indexOf(key);
  if (ppIdx !== -1) return [0, ppIdx, key];
  const category = hippoIcdCategory(key) ?? "อื่นๆ (ยังไม่จัดกลุ่ม)";
  return [1, hippoCategoryRank(category), key];
}
function hippoCompareByClinicalOrder(dim: HippoDim, a: string, b: string): number {
  if (dim === "category") return hippoCategoryRank(a) - hippoCategoryRank(b) || a.localeCompare(b, "th");
  if (dim === "code") {
    const [ta, ra, ka] = hippoCodeSortValue(a);
    const [tb, rb, kb] = hippoCodeSortValue(b);
    return ta - tb || ra - rb || ka.localeCompare(kb, "th");
  }
  return a.localeCompare(b, "th");
}


function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; } else { inQuotes = false; }
      } else field += c;
    } else if (c === '"') inQuotes = true;
    else if (c === ",") { row.push(field); field = ""; }
    else if (c === "\n") { row.push(field); rows.push(row); row = []; field = ""; }
    else if (c === "\r") { /* skip */ }
    else field += c;
  }
  if (field.length > 0 || row.length > 0) { row.push(field); rows.push(row); }
  return rows.filter((r) => r.length > 1 || r[0] !== "");
}

function useHippoRecords() {
  const [rows, setRows] = useState<HippoRecord[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/data/hippo-hdc-records.csv")
      .then((res) => {
        if (!res.ok) throw new Error(`โหลดข้อมูลไม่สำเร็จ (${res.status})`);
        return res.text();
      })
      .then((text) => {
        if (cancelled) return;
        const table = parseCsv(text);
        const header = table[0];
        const idx = (key: string) => header.indexOf(key);
        const iPerson = idx("person_id"), iSource = idx("source"), iAmpur = idx("ampur"),
          iHoscode = idx("HOSCODE"), iHosname = idx("HOSNAME"), iCode = idx("code"),
          iDateServ = idx("date_serv"),
          iTypearea = idx("typearea"), iTypeareaLabel = idx("typearea_label"), iAgeBand = idx("age_band");
        const parsed: HippoRecord[] = table.slice(1)
          .filter((r) => r.length >= header.length && r[iAmpur])
          .map((r) => {
            const source = r[iSource] as HippoRecord["source"];
            const code = r[iCode];
            const category = source === "SPECIALPP" ? (HIPPO_SPECIALPP_LABEL[code] ?? code) : (hippoIcdCategory(code) ?? "อื่นๆ (ยังไม่จัดกลุ่ม)");
            return {
              person_id: r[iPerson],
              source,
              ampur: r[iAmpur],
              hoscode: r[iHoscode] ?? "",
              hosname: r[iHosname] ?? "",
              code,
              category,
              date_serv: iDateServ >= 0 ? (r[iDateServ] ?? "") : "",
              typearea: r[iTypearea],
              typearea_label: r[iTypeareaLabel],
              age_band: r[iAgeBand],
            };
          });
        setRows(parsed);
      })
      .catch((err) => { if (!cancelled) setError(err.message || "เกิดข้อผิดพลาด"); });
    return () => { cancelled = true; };
  }, []);

  return { rows, error };
}

function downloadCsv(filename: string, headers: string[], data: (string | number)[][]) {
  const escape = (v: string | number) => {
    const s = String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const csv = [headers.map(escape).join(","), ...data.map((row) => row.map(escape).join(","))].join("\n");
  const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

type HippoDim = "ampur" | "facility" | "category" | "code" | "typearea" | "age_band" | "source";

const HIPPO_DIM_LABEL: Record<HippoDim, string> = {
  ampur: "อำเภอ",
  facility: "หน่วยบริการ",
  category: "กลุ่มโรค/รหัส SMI-V",
  code: "รหัสละเอียด (ICD-10-TM/PPSPECIAL)",
  typearea: "Typearea",
  age_band: "ช่วงอายุ",
  source: "แหล่งข้อมูล",
};
const HIPPO_DIM_ICON: Record<HippoDim, typeof MapPin> = {
  ampur: MapPin,
  facility: Hospital,
  category: Brain,
  code: Layers,
  typearea: Layers,
  age_band: Users,
  source: Database,
};

function HippoFieldChip({ dim }: { dim: HippoDim }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: `field-${dim}`, data: { dim } });
  const Icon = HIPPO_DIM_ICON[dim];
  const style = transform ? { transform: `translate(${transform.x}px, ${transform.y}px)`, zIndex: 50 } : undefined;
  return (
    <button ref={setNodeRef} style={style} {...listeners} {...attributes} type="button"
      className={`hippo-field-chip${isDragging ? " is-dragging" : ""}`} title="ลากไปวางที่แกนแถวหรือคอลัมน์">
      <GripVertical size={12} className="hippo-field-chip-grip" />
      <Icon size={13} />
      {HIPPO_DIM_LABEL[dim]}
    </button>
  );
}

function HippoShelfZone({ zoneId, label, icon: Icon, activeDim, onClear, placeholder }: {
  zoneId: string; label: string; icon: typeof MapPin; activeDim: HippoDim | "none"; onClear: () => void; placeholder: string;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: zoneId });
  const ActiveIcon = activeDim !== "none" ? HIPPO_DIM_ICON[activeDim] : null;
  return (
    <div ref={setNodeRef} className={`hippo-shelf-zone${isOver ? " is-over" : ""}${activeDim !== "none" ? " has-value" : ""}`}>
      <span className="hippo-shelf-zone-label"><Icon size={13} /> {label}</span>
      {activeDim !== "none" ? (
        <div className="hippo-shelf-zone-value">
          {ActiveIcon && <ActiveIcon size={13} />}
          <span>{HIPPO_DIM_LABEL[activeDim]}</span>
          <button type="button" className="hippo-shelf-zone-clear" onClick={onClear} aria-label="ล้างแกนนี้"><X size={12} /></button>
        </div>
      ) : (
        <div className="hippo-shelf-zone-empty">{placeholder}</div>
      )}
    </div>
  );
}

function HippoHdcSection() {
  const { rows, error } = useHippoRecords();

  const [selSource, setSelSource] = useState<Set<string>>(new Set());
  const [selAmpur, setSelAmpur] = useState<Set<string>>(new Set());
  const [selFacility, setSelFacility] = useState<Set<string>>(new Set());
  const [facilitySearch, setFacilitySearch] = useState("");
  const [selCategory, setSelCategory] = useState<Set<string>>(new Set());
  const [selCode, setSelCode] = useState<Set<string>>(new Set());
  const [codeSearch, setCodeSearch] = useState("");
  const [selTypearea, setSelTypearea] = useState<Set<string>>(new Set());
  const [selAgeBand, setSelAgeBand] = useState<Set<string>>(new Set());
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [combineTypearea13, setCombineTypearea13] = useState(false);
  const [rowDim, setRowDim] = useState<HippoDim>("ampur");
  const [colDim, setColDim] = useState<HippoDim | "none">("category");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [sortColKey, setSortColKey] = useState<string>("__total__");
  const [excludeMode, setExcludeMode] = useState<Record<string, boolean>>({});

  const changeColDim = (dim: HippoDim | "none") => { setColDim(dim); setSortColKey("__total__"); };

  const toggleExclude = (key: string) => setExcludeMode((prev) => ({ ...prev, [key]: !prev[key] }));
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

  const handleShelfDragEnd = (event: DragEndEvent) => {
    const dim = event.active.data.current?.dim as HippoDim | undefined;
    const zone = event.over?.id as string | undefined;
    if (!dim || !zone) return;
    if (zone === "shelf-row") {
      if (colDim === dim) changeColDim(rowDim === dim ? "none" : rowDim);
      setRowDim(dim);
    } else if (zone === "shelf-col") {
      if (rowDim === dim) setRowDim(colDim === dim ? "ampur" : (colDim as HippoDim));
      changeColDim(dim);
    }
  };

  const safeRows = useMemo(() => rows ?? [], [rows]);

  const ampurOptions = useMemo(() => Array.from(new Set(safeRows.map((r) => r.ampur))).sort((a, b) => a.localeCompare(b, "th")), [safeRows]);
  const dateBounds = useMemo(() => {
    let min = "";
    let max = "";
    for (const r of safeRows) {
      if (!r.date_serv) continue;
      if (!min || r.date_serv < min) min = r.date_serv;
      if (!max || r.date_serv > max) max = r.date_serv;
    }
    return { min, max };
  }, [safeRows]);
  const facilityByAmpur = useMemo(() => {
    const relevant = selAmpur.size > 0 ? safeRows.filter((r) => selAmpur.has(r.ampur)) : safeRows;
    const groups = new Map<string, Map<string, { hoscode: string; hosname: string; ampur: string }>>();
    relevant.forEach((r) => {
      if (!r.hoscode) return;
      if (!groups.has(r.ampur)) groups.set(r.ampur, new Map());
      groups.get(r.ampur)!.set(r.hoscode, { hoscode: r.hoscode, hosname: r.hosname, ampur: r.ampur });
    });
    const search = facilitySearch.trim().toLowerCase();
    return Array.from(groups.entries())
      .map(([ampur, m]) => ({
        ampur,
        facilities: Array.from(m.values())
          .filter((f) => !search || f.hosname.toLowerCase().includes(search) || f.hoscode.includes(search))
          .sort((a, b) => a.hosname.localeCompare(b.hosname, "th")),
      }))
      .filter((g) => g.facilities.length > 0)
      .sort((a, b) => a.ampur.localeCompare(b.ampur, "th"));
  }, [safeRows, selAmpur, facilitySearch]);
  const facilityOptions = useMemo(() => facilityByAmpur.flatMap((g) => g.facilities), [facilityByAmpur]);

  const categoryOptions = useMemo(() => Array.from(new Set(safeRows.map((r) => r.category))).sort((a, b) => a.localeCompare(b, "th")), [safeRows]);
  const codeOptions = useMemo(() => {
    const relevant = selCategory.size > 0 ? safeRows.filter((r) => selCategory.has(r.category)) : safeRows;
    const map = new Map<string, string>();
    relevant.forEach((r) => map.set(r.code, `${r.code} — ${r.category}`));
    const search = codeSearch.trim().toLowerCase();
    return Array.from(map.entries())
      .filter(([, label]) => !search || label.toLowerCase().includes(search))
      .sort((a, b) => a[1].localeCompare(b[1], "th"));
  }, [safeRows, selCategory, codeSearch]);
  const typeareaOptions = useMemo(() => {
    const set = new Set(safeRows.map((r) => r.typearea));
    return ["1", "2", "3", "4", "5", ""].filter((t) => set.has(t));
  }, [safeRows]);
  const ageBandOptions = useMemo(() => {
    const set = new Set(safeRows.map((r) => r.age_band));
    return HIPPO_AGE_ORDER.filter((a) => set.has(a));
  }, [safeRows]);

  const toggleSet = (set: Set<string>, setter: (s: Set<string>) => void, value: string) => {
    const next = new Set(set);
    if (next.has(value)) next.delete(value); else next.add(value);
    setter(next);
  };
  const selectAll = (setter: (s: Set<string>) => void, values: string[]) => setter(new Set(values));
  const clearAll = (setter: (s: Set<string>) => void) => setter(new Set());

  const toggleAmpur = (value: string) => { toggleSet(selAmpur, setSelAmpur, value); setSelFacility(new Set()); };
  const toggleCategory = (value: string) => { toggleSet(selCategory, setSelCategory, value); setSelCode(new Set()); };

  const passSet = (excluded: boolean, sel: Set<string>, value: string) => {
    if (sel.size === 0) return true;
    const has = sel.has(value);
    return excluded ? !has : has;
  };

  const filtered = useMemo(() => {
    return safeRows.filter((r) => {
      if (!passSet(!!excludeMode.source, selSource, r.source)) return false;
      if (!passSet(!!excludeMode.ampur, selAmpur, r.ampur)) return false;
      if (!passSet(!!excludeMode.facility, selFacility, r.hoscode)) return false;
      if (!passSet(!!excludeMode.category, selCategory, r.category)) return false;
      if (!passSet(!!excludeMode.code, selCode, r.code)) return false;
      if (!passSet(!!excludeMode.typearea, selTypearea, r.typearea)) return false;
      if (!passSet(!!excludeMode.age_band, selAgeBand, r.age_band)) return false;
      if (dateFrom && (!r.date_serv || r.date_serv < dateFrom)) return false;
      if (dateTo && (!r.date_serv || r.date_serv > dateTo)) return false;
      return true;
    });
  }, [safeRows, selSource, selAmpur, selFacility, selCategory, selCode, selTypearea, selAgeBand, dateFrom, dateTo, excludeMode]);

  const dimKeyOf = (r: HippoRecord, dim: HippoDim): string => {
    if (dim === "ampur") return r.ampur;
    if (dim === "facility") return r.hoscode || "ไม่ทราบหน่วยบริการ";
    if (dim === "category") return r.category;
    if (dim === "code") return r.code;
    if (dim === "age_band") return r.age_band;
    if (dim === "source") return r.source;
    if (combineTypearea13 && (r.typearea === "1" || r.typearea === "3")) return "1+3";
    return r.typearea || "ไม่ทราบ";
  };
  const dimLabelOf = (dim: HippoDim, key: string, r?: HippoRecord): string => {
    if (dim === "typearea") return key === "1+3" ? HIPPO_TYPEAREA_LABEL["1+3"] : (HIPPO_TYPEAREA_LABEL[key] ?? key);
    if (dim === "facility") return r?.hosname || key;
    if (dim === "source") return HIPPO_SOURCE_LABEL[key as HippoRecord["source"]] ?? key;
    if (dim === "code" && r) return `${r.code} — ${r.category}`;
    return key;
  };

  // Raw records + COUNT(DISTINCT person_id) per cell means every grouping is
  // always accurate — no double-counting risk when marginalizing a dimension
  // (unlike a pre-aggregated summary table), so no warning banner is needed.
  const pivot = useMemo(() => {
    const rowKeys = new Map<string, string>();
    const colKeys = new Map<string, string>();
    const cellPeople = new Map<string, Set<string>>();
    const rowPeople = new Map<string, Set<string>>();
    const colPeople = new Map<string, Set<string>>();
    const grandPeople = new Set<string>();

    for (const r of filtered) {
      const rk = dimKeyOf(r, rowDim);
      rowKeys.set(rk, dimLabelOf(rowDim, rk, r));
      const ck = colDim === "none" ? "รวม" : dimKeyOf(r, colDim);
      if (colDim !== "none") colKeys.set(ck, dimLabelOf(colDim, ck, r));
      const cellKey = `${rk}\u0000${ck}`;
      if (!cellPeople.has(cellKey)) cellPeople.set(cellKey, new Set());
      cellPeople.get(cellKey)!.add(r.person_id);
      if (!rowPeople.has(rk)) rowPeople.set(rk, new Set());
      rowPeople.get(rk)!.add(r.person_id);
      if (!colPeople.has(ck)) colPeople.set(ck, new Set());
      colPeople.get(ck)!.add(r.person_id);
      grandPeople.add(r.person_id);
    }

    const cells = new Map<string, number>();
    cellPeople.forEach((set, key) => cells.set(key, set.size));
    const rowTotals = new Map<string, number>();
    rowPeople.forEach((set, key) => rowTotals.set(key, set.size));
    const colTotals = new Map<string, number>();
    colPeople.forEach((set, key) => colTotals.set(key, set.size));

    const orderKeys = (dim: HippoDim | "none", keys: Map<string, string>) => {
      const arr = Array.from(keys.keys());
      if (dim === "age_band") return HIPPO_AGE_ORDER.filter((k) => arr.includes(k));
      if (dim === "typearea") return ["1", "2", "3", "4", "5", "", "1+3"].filter((k) => arr.includes(k));
      if (dim === "category" || dim === "code") return arr.sort((a, b) => hippoCompareByClinicalOrder(dim, a, b));
      return arr.sort((a, b) => a.localeCompare(b, "th"));
    };

    let rowOrder = orderKeys(rowDim, rowKeys);
    const sortValueFor = (rk: string) => {
      if (sortColKey === "__total__" || !colKeys.has(sortColKey)) return rowTotals.get(rk) ?? 0;
      return cells.get(`${rk}\u0000${sortColKey}`) ?? 0;
    };
    rowOrder = rowOrder.sort((a, b) => sortDir === "desc" ? (sortValueFor(b) - sortValueFor(a)) : (sortValueFor(a) - sortValueFor(b)));
    const colOrder = colDim === "none" ? ["รวม"] : orderKeys(colDim, colKeys);

    return { rowOrder, colOrder, rowKeys, colKeys, cells, rowTotals, colTotals, grandTotal: grandPeople.size };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtered, rowDim, colDim, sortDir, sortColKey, combineTypearea13]);

  const chartData = useMemo(
    () => pivot.rowOrder.slice(0, 12).map((k) => ({ label: pivot.rowKeys.get(k) ?? k, total: pivot.rowTotals.get(k) ?? 0 })),
    [pivot]
  );

  const handleExport = () => {
    const headers = [HIPPO_DIM_LABEL[rowDim], ...(colDim === "none" ? ["รวม"] : pivot.colOrder.map((c) => pivot.colKeys.get(c) ?? c)), "รวมทั้งแถว"];
    const data = pivot.rowOrder.map((rk) => {
      const rowLabel = pivot.rowKeys.get(rk) ?? rk;
      const values = pivot.colOrder.map((ck) => pivot.cells.get(`${rk}\u0000${ck}`) ?? 0);
      return [rowLabel, ...values, pivot.rowTotals.get(rk) ?? 0];
    });
    downloadCsv(`hippo-hdc-${rowDim}-x-${colDim}-${Date.now()}.csv`, headers, data);
  };

  const resetFilters = () => {
    setSelSource(new Set()); setSelAmpur(new Set()); setSelFacility(new Set()); setFacilitySearch("");
    setSelCategory(new Set()); setSelCode(new Set()); setCodeSearch("");
    setSelTypearea(new Set()); setSelAgeBand(new Set()); setCombineTypearea13(false);
    setDateFrom(""); setDateTo("");
    setExcludeMode({});
  };

  if (error) {
    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .45, ease }}>
        <section className="panel hippo-placeholder-card">
          <span className="hippo-placeholder-icon"><CircleAlert size={34} strokeWidth={1.6} /></span>
          <h2>โหลดข้อมูลไม่สำเร็จ</h2>
          <p>{error} — ตรวจสอบว่ามีไฟล์ <code>public/data/hippo-hdc-records.csv</code> ในโปรเจกต์</p>
        </section>
      </motion.div>
    );
  }

  if (!rows) {
    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .45, ease }}>
        <section className="panel hippo-placeholder-card">
          <span className="hippo-placeholder-icon"><Loader size={34} strokeWidth={1.6} className="hippo-spin" /></span>
          <h2>กำลังโหลดข้อมูล HIPPO HDC…</h2>
          <p>กำลังอ่านไฟล์ raw record จาก 43 แฟ้ม (diagnosis_opd + specialpp)</p>
        </section>
      </motion.div>
    );
  }

  return (
    <motion.div className="hippo-hdc-page" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .45, ease }}>
      <div className="indicator-group-head">
        <span className="indicator-badge indicator-badge-overview"><Database size={13} /> HIPPO HDC</span>
        <h2>Cross-tab Explorer — ข้อมูลดิบระดับ Record</h2>
        <p>ข้อมูล raw record จาก 43 แฟ้ม ({safeRows.length.toLocaleString("th-TH")} แถว, ไม่ยุบรวมมาก่อน) — หมุนดูได้ทุกมิติ: แหล่งข้อมูล, อำเภอ, หน่วยบริการ, กลุ่มโรค, รหัสละเอียด, Typearea, ช่วงอายุ — ลากมิติวางแกนแถว/คอลัมน์ได้อิสระ นับคนไม่ซ้ำ (COUNT DISTINCT) ทุกมิติเสมอ</p>
      </div>

      <div className="hippo-live-caption">
        <span>กำลังแสดง:</span>
        <strong>{HIPPO_DIM_LABEL[rowDim]} × {colDim === "none" ? "รวม" : HIPPO_DIM_LABEL[colDim]}</strong>
        {(selSource.size > 0 || selAmpur.size > 0 || selFacility.size > 0 || selCategory.size > 0 || selCode.size > 0 || selTypearea.size > 0 || selAgeBand.size > 0 || dateFrom || dateTo) && (
          <span className="hippo-live-caption-filters"><Funnel size={11} /> มีตัวกรองอยู่ {selSource.size + selAmpur.size + selFacility.size + selCategory.size + selCode.size + selTypearea.size + selAgeBand.size + (dateFrom || dateTo ? 1 : 0)} รายการ</span>
        )}
      </div>

      <section className="stats-grid" aria-label="สรุปข้อมูล HIPPO HDC">
        <StatCard icon={Rows3} tone="indigo" label="แถวข้อมูล (record) ที่กรองแล้ว" value={filtered.length.toLocaleString("th-TH")} note={`จากทั้งหมด ${safeRows.length.toLocaleString("th-TH")} แถว`} index={0} featured />
        <StatCard icon={ArrowLeftRight} tone="blue" label="จำนวนคนไม่ซ้ำ" value={pivot.grandTotal.toLocaleString("th-TH")} note="COUNT(DISTINCT person_id)" index={1} />
        <StatCard icon={Hospital} tone="teal" label="หน่วยบริการในผลลัพธ์" value={String(facilityOptions.length)} note={`${ampurOptions.length} อำเภอ`} index={2} />
        <StatCard icon={Layers} tone="purple" label="รหัสละเอียดในผลลัพธ์" value={String(codeOptions.length)} note={`${categoryOptions.length} กลุ่มโรค/SMI-V`} index={3} />
      </section>

      <section className="panel hippo-step-panel hippo-filters-panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow"><span className="hippo-step-badge">1</span> กรองข้อมูล</p>
            <h2>เลือกขอบเขตที่ต้องการ (ไม่เลือก = แสดงทั้งหมด)</h2>
          </div>
          <button type="button" className="soft-button" onClick={resetFilters}><RotateCcw size={13} /> ล้างตัวกรองทั้งหมด</button>
        </div>

        <div className="hippo-filter-section">
          <p className="hippo-filter-section-title"><Database size={12} /> แหล่งข้อมูล</p>
          <div className="hippo-filter-group">
            <span className="hippo-filter-title">
              {selSource.size > 0 && (
                <button type="button" className={`hippo-exclude-toggle${excludeMode.source ? " is-exclude" : ""}`} onClick={() => toggleExclude("source")}>
                  <EyeOff size={11} /> {excludeMode.source ? "กำลังตัดออก" : "ตัดออก"}
                </button>
              )}
            </span>
            <div className="indicator-table-filters">
              <button type="button" className={selSource.has("DIAGNOSIS_OPD") ? "active" : ""} onClick={() => toggleSet(selSource, setSelSource, "DIAGNOSIS_OPD")}><Brain size={13} /> จำแนกตามการวินิจฉัย (DIAGNOSIS_OPD)</button>
              <button type="button" className={selSource.has("SPECIALPP") ? "active" : ""} onClick={() => toggleSet(selSource, setSelSource, "SPECIALPP")}><ShieldCheck size={13} /> ประเมินความเสี่ยง SMI-V (SPECIALPP)</button>
            </div>
          </div>
        </div>

        <div className="hippo-filter-section">
          <p className="hippo-filter-section-title"><CalendarClock size={12} /> ช่วงวันที่ให้บริการ (DATE_SERV)</p>
          <div className="hippo-filter-group">
            <div className="hippo-date-range-row">
              <label className="hippo-date-field">
                <span>ตั้งแต่วันที่</span>
                <input type="date" value={dateFrom} min={dateBounds.min} max={dateBounds.max} onChange={(e) => setDateFrom(e.target.value)} />
              </label>
              <ArrowLeftRight size={14} className="hippo-axis-swap-icon" />
              <label className="hippo-date-field">
                <span>ถึงวันที่</span>
                <input type="date" value={dateTo} min={dateBounds.min} max={dateBounds.max} onChange={(e) => setDateTo(e.target.value)} />
              </label>
              {(dateFrom || dateTo) && (
                <button type="button" className="hippo-select-all-btn" onClick={() => { setDateFrom(""); setDateTo(""); }}>ล้างช่วงวันที่</button>
              )}
            </div>
            {dateBounds.min && dateBounds.max && (
              <p className="hippo-crosstab-note">ข้อมูลมีตั้งแต่ {dateBounds.min} ถึง {dateBounds.max} — เว้นว่างช่องใดช่องหนึ่งเพื่อไม่จำกัดฝั่งนั้น</p>
            )}
          </div>
        </div>

        <div className="hippo-filter-section">
          <p className="hippo-filter-section-title"><MapPin size={12} /> พื้นที่</p>
          <div className="hippo-filter-groups">
            <div className="hippo-filter-group">
              <span className="hippo-filter-title">อำเภอ {selAmpur.size > 0 && <b>({selAmpur.size})</b>}
                {selAmpur.size > 0 && (
                  <button type="button" className={`hippo-exclude-toggle${excludeMode.ampur ? " is-exclude" : ""}`} onClick={() => toggleExclude("ampur")}>
                    <EyeOff size={11} /> {excludeMode.ampur ? "กำลังตัดออก" : "ตัดออก"}
                  </button>
                )}
              </span>
              <div className="hippo-select-all-row">
                <button type="button" className="hippo-select-all-btn" onClick={() => selectAll(setSelAmpur, ampurOptions)}>เลือกทั้งหมด</button>
                <button type="button" className="hippo-select-all-btn" onClick={() => { clearAll(setSelAmpur); setSelFacility(new Set()); }}>ล้าง</button>
              </div>
              <div className="hippo-chip-list">
                {ampurOptions.map((a) => (
                  <button key={a} type="button" className={selAmpur.has(a) ? "active" : ""} onClick={() => toggleAmpur(a)}>{a}</button>
                ))}
              </div>
            </div>

            <div className="hippo-filter-group">
              <span className="hippo-filter-title">หน่วยบริการ {selFacility.size > 0 && <b>({selFacility.size})</b>}
                {selFacility.size > 0 && (
                  <button type="button" className={`hippo-exclude-toggle${excludeMode.facility ? " is-exclude" : ""}`} onClick={() => toggleExclude("facility")}>
                    <EyeOff size={11} /> {excludeMode.facility ? "กำลังตัดออก" : "ตัดออก"}
                  </button>
                )}
              </span>
              <div className="hippo-mini-search">
                <Search size={13} />
                <input type="text" placeholder="ค้นหาชื่อ/รหัสหน่วยบริการ..." value={facilitySearch} onChange={(e) => setFacilitySearch(e.target.value)} />
              </div>
              <div className="hippo-select-all-row">
                <button type="button" className="hippo-select-all-btn" onClick={() => selectAll(setSelFacility, facilityOptions.map((f) => f.hoscode))}>เลือกทั้งหมด</button>
                <button type="button" className="hippo-select-all-btn" onClick={() => clearAll(setSelFacility)}>ล้าง</button>
              </div>
              <div className="hippo-facility-groups hippo-chip-list-scroll">
                {facilityByAmpur.map((g) => (
                  <div key={g.ampur} className="hippo-facility-group">
                    <div className="hippo-facility-group-head">
                      <span>{g.ampur}</span>
                      <button type="button" className="hippo-select-all-btn hippo-select-all-btn-tiny" onClick={() => setSelFacility((prev) => { const next = new Set(prev); g.facilities.forEach((f) => next.add(f.hoscode)); return next; })}>เลือกทั้งอำเภอ</button>
                    </div>
                    <div className="hippo-chip-list">
                      {g.facilities.map((f) => (
                        <button key={f.hoscode} type="button" className={selFacility.has(f.hoscode) ? "active" : ""} onClick={() => toggleSet(selFacility, setSelFacility, f.hoscode)}>
                          {f.hosname}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
                {facilityOptions.length === 0 && <span className="hippo-empty-note">ไม่พบหน่วยบริการ</span>}
              </div>
            </div>
          </div>
        </div>

        <div className="hippo-filter-section">
          <p className="hippo-filter-section-title"><Brain size={12} /> ทางคลินิก</p>
          <div className="hippo-filter-groups">
            <div className="hippo-filter-group hippo-filter-group-wide">
              <span className="hippo-filter-title">กลุ่มโรค/SMI-V {selCategory.size > 0 && <b>({selCategory.size})</b>}
                {selCategory.size > 0 && (
                  <button type="button" className={`hippo-exclude-toggle${excludeMode.category ? " is-exclude" : ""}`} onClick={() => toggleExclude("category")}>
                    <EyeOff size={11} /> {excludeMode.category ? "กำลังตัดออก" : "ตัดออก"}
                  </button>
                )}
              </span>
              <div className="hippo-select-all-row">
                <button type="button" className="hippo-select-all-btn" onClick={() => selectAll(setSelCategory, categoryOptions)}>เลือกทั้งหมด</button>
                <button type="button" className="hippo-select-all-btn" onClick={() => { clearAll(setSelCategory); setSelCode(new Set()); }}>ล้าง</button>
              </div>
              <div className="hippo-chip-list hippo-chip-list-scroll">
                {categoryOptions.map((c) => (
                  <button key={c} type="button" className={selCategory.has(c) ? "active" : ""} onClick={() => toggleCategory(c)}>{c}</button>
                ))}
              </div>
            </div>

            <div className="hippo-filter-group hippo-filter-group-wide">
              <span className="hippo-filter-title">รหัสละเอียด (ICD-10-TM/PPSPECIAL) {selCode.size > 0 && <b>({selCode.size})</b>}
                {selCode.size > 0 && (
                  <button type="button" className={`hippo-exclude-toggle${excludeMode.code ? " is-exclude" : ""}`} onClick={() => toggleExclude("code")}>
                    <EyeOff size={11} /> {excludeMode.code ? "กำลังตัดออก" : "ตัดออก"}
                  </button>
                )}
              </span>
              <div className="hippo-mini-search">
                <Search size={13} />
                <input type="text" placeholder="ค้นหารหัส/ชื่อกลุ่มโรค..." value={codeSearch} onChange={(e) => setCodeSearch(e.target.value)} />
              </div>
              <div className="hippo-select-all-row">
                <button type="button" className="hippo-select-all-btn" onClick={() => selectAll(setSelCode, codeOptions.map(([key]) => key))}>เลือกทั้งหมด</button>
                <button type="button" className="hippo-select-all-btn" onClick={() => clearAll(setSelCode)}>ล้าง</button>
              </div>
              <div className="hippo-chip-list hippo-chip-list-scroll">
                {codeOptions.map(([key, label]) => (
                  <button key={key} type="button" className={selCode.has(key) ? "active" : ""} onClick={() => toggleSet(selCode, setSelCode, key)}>{label}</button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="hippo-filter-section">
          <p className="hippo-filter-section-title"><Users size={12} /> กลุ่มประชากร</p>
          <div className="hippo-filter-groups hippo-filter-group-inline-list">
            <div className="hippo-filter-group">
              <span className="hippo-filter-title">Typearea {selTypearea.size > 0 && <b>({selTypearea.size})</b>}
                {selTypearea.size > 0 && (
                  <button type="button" className={`hippo-exclude-toggle${excludeMode.typearea ? " is-exclude" : ""}`} onClick={() => toggleExclude("typearea")}>
                    <EyeOff size={11} /> {excludeMode.typearea ? "กำลังตัดออก" : "ตัดออก"}
                  </button>
                )}
              </span>
              <div className="hippo-select-all-row">
                <button type="button" className="hippo-select-all-btn" onClick={() => selectAll(setSelTypearea, typeareaOptions)}>เลือกทั้งหมด</button>
                <button type="button" className="hippo-select-all-btn" onClick={() => clearAll(setSelTypearea)}>ล้าง</button>
              </div>
              <div className="hippo-chip-list">
                {typeareaOptions.map((t) => (
                  <button key={t || "unknown"} type="button" className={selTypearea.has(t) ? "active" : ""} onClick={() => toggleSet(selTypearea, setSelTypearea, t)}>
                    {HIPPO_TYPEAREA_LABEL[t] ?? "ไม่ทราบ"}
                  </button>
                ))}
              </div>
              <label className="hippo-toggle-row">
                <input type="checkbox" checked={combineTypearea13} onChange={(e) => setCombineTypearea13(e.target.checked)} />
                รวม Typearea 1+3 เป็นกลุ่มเดียวในตาราง/กราฟ
              </label>
            </div>

            <div className="hippo-filter-group">
              <span className="hippo-filter-title">ช่วงอายุ {selAgeBand.size > 0 && <b>({selAgeBand.size})</b>}
                {selAgeBand.size > 0 && (
                  <button type="button" className={`hippo-exclude-toggle${excludeMode.age_band ? " is-exclude" : ""}`} onClick={() => toggleExclude("age_band")}>
                    <EyeOff size={11} /> {excludeMode.age_band ? "กำลังตัดออก" : "ตัดออก"}
                  </button>
                )}
              </span>
              <div className="hippo-select-all-row">
                <button type="button" className="hippo-select-all-btn" onClick={() => selectAll(setSelAgeBand, ageBandOptions)}>เลือกทั้งหมด</button>
                <button type="button" className="hippo-select-all-btn" onClick={() => clearAll(setSelAgeBand)}>ล้าง</button>
              </div>
              <div className="hippo-chip-list">
                {ageBandOptions.map((a) => (
                  <button key={a} type="button" className={selAgeBand.has(a) ? "active" : ""} onClick={() => toggleSet(selAgeBand, setSelAgeBand, a)}>{a}</button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="panel hippo-step-panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow"><span className="hippo-step-badge">2</span> จัดรูปแบบมุมมอง</p>
            <h2>ลากมิติข้อมูลไปวางที่แกนแถว/คอลัมน์ (หมุนได้ทุกมิติ)</h2>
          </div>
        </div>

        <DndContext sensors={sensors} onDragEnd={handleShelfDragEnd}>
          <div className="hippo-shelf-fields">
            <span className="hippo-control-label">มิติข้อมูลทั้งหมด (ลากไปวาง)</span>
            <div className="hippo-shelf-fields-list">
              <HippoFieldChip dim="ampur" />
              <HippoFieldChip dim="facility" />
              <HippoFieldChip dim="category" />
              <HippoFieldChip dim="code" />
              <HippoFieldChip dim="typearea" />
              <HippoFieldChip dim="age_band" />
              <HippoFieldChip dim="source" />
            </div>
          </div>

          <div className="hippo-shelf-zones">
            <HippoShelfZone zoneId="shelf-row" label="แกนแถว" icon={Rows3} activeDim={rowDim} placeholder="ลากมิติมาวางที่นี่" onClear={() => setRowDim("ampur")} />
            <ArrowLeftRight size={18} className="hippo-axis-swap-icon" />
            <HippoShelfZone zoneId="shelf-col" label="แกนคอลัมน์" icon={Columns3} activeDim={colDim} placeholder="— ไม่แยกคอลัมน์ —" onClear={() => changeColDim("none")} />
          </div>
        </DndContext>
      </section>

      <div className="overview-two-col">
        <section className="panel analytics-card">
          <div className="panel-heading">
            <div><p className="eyebrow">Top 12 · เรียงตาม{HIPPO_DIM_LABEL[rowDim]}</p><h2>ผลรวมตาม{HIPPO_DIM_LABEL[rowDim]}</h2></div>
            <span className="live-pill"><i /> ข้อมูลจริงจาก HDC</span>
          </div>
          <div className="chart-wrap chart-wrap-tall" aria-label={`กราฟผลรวมตาม${HIPPO_DIM_LABEL[rowDim]}`}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" margin={{ top: 4, right: 24, left: 0, bottom: 0 }}>
                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 11 }} />
                <YAxis dataKey="label" type="category" axisLine={false} tickLine={false} width={130} tick={{ fill: "#475569", fontSize: 11 }} />
                <Tooltip
                  cursor={{ fill: "rgba(67,56,202,.05)" }}
                  content={({ active, payload }) =>
                    active && payload?.[0] ? (
                      <div className="chart-tooltip"><b>{Number(payload[0].value).toLocaleString("th-TH")} ราย</b><span>{payload[0].payload.label}</span></div>
                    ) : null
                  }
                />
                <Bar dataKey="total" radius={[0, 12, 12, 0]} animationDuration={700}>
                  {chartData.map((entry, index) => (
                    <Cell key={entry.label} fill={index === 0 ? "#3730a3" : index < 3 ? "#4f46e5" : "#94a3b8"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="panel reminder-card diagnosis-card">
          <p className="eyebrow">สรุปผลลัพธ์</p>
          <h2>Top 5 {HIPPO_DIM_LABEL[rowDim]}<br />ตามจำนวนผู้ป่วย</h2>
          <div className="diagnosis-list">
            {chartData.slice(0, 5).map((d) => {
              const pct = pivot.grandTotal > 0 ? Math.round((d.total / pivot.grandTotal) * 100) : 0;
              return (
                <div key={d.label} className="diagnosis-item">
                  <div className="diagnosis-item-head"><span>{d.label}</span><strong>{d.total.toLocaleString("th-TH")}</strong></div>
                  <div className="diagnosis-bar"><div className="diagnosis-bar-fill" style={{ width: `${pct}%` }} /></div>
                </div>
              );
            })}
            {chartData.length === 0 && <p className="hippo-empty-note">ไม่มีข้อมูลตรงกับตัวกรองที่เลือก</p>}
          </div>
        </section>
      </div>

      <section className="panel">
        <div className="panel-heading">
          <div><p className="eyebrow"><Table2 size={12} /> Pivot Table</p><h2>{HIPPO_DIM_LABEL[rowDim]} × {colDim === "none" ? "รวม" : HIPPO_DIM_LABEL[colDim]}</h2></div>
          <div className="hippo-table-actions">
            <button type="button" className="soft-button" onClick={() => setSortDir(sortDir === "desc" ? "asc" : "desc")}>
              {sortDir === "desc" ? <ArrowDown size={13} /> : <ArrowUp size={13} />} {sortColKey === "__total__" ? "เรียงตามผลรวม" : `เรียงตาม ${pivot.colKeys.get(sortColKey) ?? sortColKey}`}
            </button>
            <button type="button" className="soft-button" onClick={handleExport}><Download size={13} /> ดาวน์โหลด CSV</button>
          </div>
        </div>
        <p className="hippo-crosstab-note">คลิกหัวคอลัมน์ (รวมถึง &quot;รวม&quot;) เพื่อสั่งเรียงแถวตามคอลัมน์นั้น — คลิกซ้ำเพื่อสลับทิศทาง</p>

        <div className="indicator-table-wrap hippo-pivot-wrap">
          <table className="indicator-table hippo-pivot-table">
            <thead>
              <tr>
                <th>{HIPPO_DIM_LABEL[rowDim]}</th>
                {pivot.colOrder.map((ck) => (
                  <th
                    key={ck}
                    className={`num sortable${sortColKey === ck ? " is-active" : ""}`}
                    onClick={() => { if (sortColKey === ck) setSortDir(sortDir === "desc" ? "asc" : "desc"); else { setSortColKey(ck); setSortDir("desc"); } }}
                  >
                    <span className="th-sort-inner">
                      {pivot.colKeys.get(ck) ?? ck}
                      {sortColKey === ck && (sortDir === "desc" ? <ArrowDown size={11} /> : <ArrowUp size={11} />)}
                    </span>
                  </th>
                ))}
                <th
                  className={`num hippo-total-col sortable${sortColKey === "__total__" ? " is-active" : ""}`}
                  onClick={() => { if (sortColKey === "__total__") setSortDir(sortDir === "desc" ? "asc" : "desc"); else { setSortColKey("__total__"); setSortDir("desc"); } }}
                >
                  <span className="th-sort-inner">
                    รวม
                    {sortColKey === "__total__" && (sortDir === "desc" ? <ArrowDown size={11} /> : <ArrowUp size={11} />)}
                  </span>
                </th>
              </tr>
            </thead>
            <tbody>
              {pivot.rowOrder.map((rk) => (
                <tr key={rk}>
                  <td className="indicator-table-name"><span>{pivot.rowKeys.get(rk) ?? rk}</span></td>
                  {pivot.colOrder.map((ck) => {
                    const v = pivot.cells.get(`${rk}\u0000${ck}`) ?? 0;
                    return <td key={ck} className="indicator-table-value num">{v > 0 ? v.toLocaleString("th-TH") : <span className="indicator-table-empty">-</span>}</td>;
                  })}
                  <td className="indicator-table-value num hippo-total-col"><strong>{(pivot.rowTotals.get(rk) ?? 0).toLocaleString("th-TH")}</strong></td>
                </tr>
              ))}
              {pivot.rowOrder.length === 0 && (
                <tr><td colSpan={pivot.colOrder.length + 2} className="hippo-empty-note">ไม่มีข้อมูลตรงกับตัวกรองที่เลือก</td></tr>
              )}
            </tbody>
            {pivot.rowOrder.length > 0 && (
              <tfoot>
                <tr>
                  <td><strong>รวมทั้งหมด</strong></td>
                  {pivot.colOrder.map((ck) => <td key={ck} className="num">{(pivot.colTotals.get(ck) ?? 0).toLocaleString("th-TH")}</td>)}
                  <td className="num hippo-total-col"><strong>{pivot.grandTotal.toLocaleString("th-TH")}</strong></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </section>
    </motion.div>
  );
}


export default function DashboardShell({ view = "overview" }: { view?: ViewKey }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") { event.preventDefault(); setSearchOpen(true); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="app-shell">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} view={view} />
      <div className="main-column">
        <Header onMenu={() => setSidebarOpen(true)} onSearch={() => setSearchOpen(true)} />
        <main className="dashboard-main">
          <motion.div className="page-heading" initial={reduceMotion ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .55, ease }}>
            <div><p className="date-kicker">ระบบคลังข้อมูลสุขภาพ (HDC) · จังหวัดสตูล</p><h1>SMI-V Dashboard</h1><p>ผู้ป่วยจิตเวชที่มีความเสี่ยงต่อการก่อความรุนแรง แยกตามอำเภอและการวินิจฉัย</p></div>
          </motion.div>

          <AnimatePresence mode="wait">
            <motion.div key={view} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: .3, ease }}>
              {view === "overview" && <OverviewSection />}
              {view === "indicators" && <IndicatorsHubSection />}
              {view === "indicator1" && <Indicator1Section />}
              {view === "indicator2" && <Indicator2Section />}
              {view === "indicator3" && <Indicator3Section />}
              {view === "indicator4" && <Indicator4Section />}
              {view === "indicator5" && <Indicator5Section />}
              {view === "indicator_relate_14" && <IndicatorRelate14Section />}
              {view === "indicator_relate_15" && <IndicatorRelate15Section />}
              {view === "indicator_relate_16" && <IndicatorRelate16Section />}
              {view === "indicator_relate_21_2" && <IndicatorRelate21_2Section />}
              {view === "indicator_relate_21_6" && <IndicatorRelate21_6Section />}
              {view === "indicator_relate_21_1" && <SimpleIndicatorSection indicatorKey="21_1" />}
              {view === "indicator_relate_21_4" && <SimpleIndicatorSection indicatorKey="21_4" />}
              {view === "indicator_relate_21_7" && <SimpleIndicatorSection indicatorKey="21_7" />}
              {view === "indicator_relate_22_1" && <SimpleIndicatorSection indicatorKey="22_1" />}
              {view === "indicator_relate_22_2" && <SimpleIndicatorSection indicatorKey="22_2" />}
              {view === "indicator_relate_22_3" && <SimpleIndicatorSection indicatorKey="22_3" />}
              {view === "indicator_relate_22_4" && <SimpleIndicatorSection indicatorKey="22_4" />}
              {view === "indicator_relate_22_5" && <SimpleIndicatorSection indicatorKey="22_5" />}
              {view === "indicator_relate_22_6" && <SimpleIndicatorSection indicatorKey="22_6" />}
              {view === "indicator_relate_22_7" && <SimpleIndicatorSection indicatorKey="22_7" />}
              {view === "indicator_relate_23_4" && <SimpleIndicatorSection indicatorKey="23_4" />}
              {view === "indicator_relate_23_5" && <SimpleIndicatorSection indicatorKey="23_5" />}
              {view === "indicator_relate_23_6" && <SimpleIndicatorSection indicatorKey="23_6" />}
              {view === "hippo-hdc" && <HippoHdcSection />}
              {view === "blank" && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
                  {/* หน้าว่างตามที่ขอ */}
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
      <SearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
}
