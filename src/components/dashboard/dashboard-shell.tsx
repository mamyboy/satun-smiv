"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  Activity,
  ArrowUpRight,
  Bell,
  ChevronRight,
  Command,
  Download,
  ExternalLink,
  Layers,
  MapPinned,
  Menu,
  PawPrint,
  Search,
  Sparkles,
  Stethoscope,
  Target,
  TrendingDown,
  TrendingUp,
  Users,
  X,
} from "lucide-react";
import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
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
  indicator2ExtractedAt,
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
  overviewInsights,
  provinceTotal,
} from "@/lib/hdc-data";

const ease = [0.22, 1, 0.36, 1] as const;

function formatDate(iso?: string) {
  if (!iso) return "-";
  const d = new Date(iso);
  return d.toLocaleDateString("th-TH", { year: "numeric", month: "long", day: "numeric" });
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

function StatCard({ label, value, note, index, featured = false }: { label: string; value: string; note: string; index: number; featured?: boolean }) {
  return (
    <motion.article
      className={`stat-card ${featured ? "featured" : ""}`}
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, delay: index * 0.07, ease }}
      whileHover={{ y: -4 }}
    >
      <div className="stat-head"><span>{label}</span><button aria-label={`เปิด ${label}`}><ArrowUpRight size={17} /></button></div>
      <strong className="stat-value">{value}</strong>
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
            <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: "#78827e", fontSize: 11 }} />
            <YAxis dataKey="amphoe" type="category" axisLine={false} tickLine={false} width={78} tick={{ fill: "#3a4440", fontSize: 12 }} />
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
                <Cell key={entry.amphoe} fill={index === 0 ? "#0b5238" : index < 3 ? "#21845c" : "#8da19a"} />
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

const heatmapColors = ["#f4f7f5", "#d9ecdf", "#a9d8bb", "#63b98a", "#21845c", "#0b5238"];
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
              <span className="project-symbol" style={{ "--symbol": "#146948" } as React.CSSProperties}><span /></span>
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

function Indicator2Card() {
  if (!indicator2Metrics) return null;
  return (
    <section className="panel team-card indicator2-card">
      <div className="panel-title-row">
        <div><p className="eyebrow">ตัวชี้วัดที่ 2</p><h2>การเข้าถึงบริการต่อเนื่อง</h2></div>
      </div>
      <p className="indicator2-name">{indicator2Name}</p>
      <div className="team-list indicator2-metrics">
        <div className="team-row">
          <span className="team-avatar"><Stethoscope size={16} /></span>
          <span className="team-copy"><strong>ผู้ป่วย SMI-V ทั้งหมด</strong><small>{indicator2Metrics.area}</small></span>
          <span className="status success">{indicator2Metrics.totalPatients.toLocaleString()} คน</span>
        </div>
        <div className="team-row">
          <span className="team-avatar"><Activity size={16} /></span>
          <span className="team-copy"><strong>อัตราการเข้าถึงบริการ</strong><small>Accessibility Rate</small></span>
          <span className="status warning">{indicator2Metrics.accessRate}%</span>
        </div>
        <div className="team-row">
          <span className="team-avatar"><Users size={16} /></span>
          <span className="team-copy"><strong>ไม่ก่อความรุนแรงซ้ำ</strong><small>ผู้ป่วยสะสม</small></span>
          <span className="status success">{indicator2Metrics.noRepeatViolence.toLocaleString()} คน</span>
        </div>
        <div className="team-row">
          <span className="team-avatar"><MapPinned size={16} /></span>
          <span className="team-copy"><strong>ดูแลต่อเนื่องและไม่ก่อซ้ำ</strong><small>อย่างน้อย 2 ครั้ง</small></span>
          <span className="status success">{indicator2Metrics.continuousCareRate}%</span>
        </div>
      </div>
      <p className="indicator2-updated">อัปเดตล่าสุด {formatDate(indicator2ExtractedAt)}</p>
      {indicator2ProcessedDate && <p className="report-info-processed"><span>วันที่ประมวลผล</span><strong>{indicator2ProcessedDate}</strong></p>}
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
            {results.length ? results.map((item) => <button key={item.amphoe}><span style={{ background: "#146948" }} /><strong>{item.amphoe}</strong><ChevronRight size={16} /></button>) : <div className="empty-result">ไม่พบอำเภอที่ค้นหา</div>}
          </div>
        </motion.div>
      </motion.div>}
    </AnimatePresence>
  );
}

export type ViewKey = "overview" | "indicators" | "indicator1" | "indicator2" | "indicator3" | "indicator4" | "indicator5" | "hippo-hdc";

function IndicatorsHubSection() {
  const router = useRouter();
  return (
    <motion.div className="indicator-group" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .45, ease }}>
      <div className="indicator-group-head">
        <span className="indicator-badge indicator-badge-overview">ตัวชี้วัด</span>
        <h2>เลือกตัวชี้วัดที่ต้องการดู</h2>
        <p>เลือกดูรายละเอียดแต่ละตัวชี้วัด SMI-V แยกทีละหน้า</p>
      </div>

      <div className="indicator-hub-grid">
        <div
          className="indicator-hub-card"
          role="link"
          tabIndex={0}
          onClick={() => router.push("/indicator-1")}
          onKeyDown={(e) => { if (e.key === "Enter") router.push("/indicator-1"); }}
        >
          <div className="indicator-hub-card-top">
            <span className="indicator-badge indicator-badge-1">ตัวชี้วัด 1</span>
            <a href={indicator1SourceUrl} target="_blank" rel="noopener noreferrer" className="source-link" title="เปิดหน้ารายงานต้นฉบับบน HDC" onClick={(e) => e.stopPropagation()}>
              <ExternalLink size={13} /> HDC
            </a>
          </div>
          <h3>{indicator1Name}</h3>
          <p>ข้อมูล 7 อำเภอ ดึงโดย automate ผ่าน dropdown จริงบนหน้าเว็บ HDC</p>
          <div className="indicator-hub-stat"><strong>{provinceTotal.toLocaleString()}</strong><span>ผู้ป่วยทั้งจังหวัด</span></div>
          {indicator1ProcessedDate && <div className="indicator-hub-processed"><span>วันที่ประมวลผล</span><strong>{indicator1ProcessedDate}</strong></div>}
          <span className="indicator-hub-cta">ดูรายละเอียด <ChevronRight size={15} /></span>
        </div>

        <div
          className="indicator-hub-card"
          role="link"
          tabIndex={0}
          onClick={() => router.push("/indicator-2")}
          onKeyDown={(e) => { if (e.key === "Enter") router.push("/indicator-2"); }}
        >
          <div className="indicator-hub-card-top">
            <span className="indicator-badge indicator-badge-2">ตัวชี้วัด 2</span>
            <a href={indicator2SourceUrl} target="_blank" rel="noopener noreferrer" className="source-link" title="เปิดหน้ารายงานต้นฉบับบน HDC" onClick={(e) => e.stopPropagation()}>
              <ExternalLink size={13} /> HDC
            </a>
          </div>
          <h3>{indicator2Name}</h3>
          <p>ข้อมูลระดับจังหวัด ไม่ได้กรองรายอำเภอ (province-level report)</p>
          <div className="indicator-hub-stat"><strong>{indicator2Metrics?.accessRate ?? "-"}%</strong><span>อัตราการเข้าถึงบริการ</span></div>
          {indicator2ProcessedDate && <div className="indicator-hub-processed"><span>วันที่ประมวลผล</span><strong>{indicator2ProcessedDate}</strong></div>}
          <span className="indicator-hub-cta">ดูรายละเอียด <ChevronRight size={15} /></span>
        </div>

        <div
          className="indicator-hub-card"
          role="link"
          tabIndex={0}
          onClick={() => router.push("/indicator-3")}
          onKeyDown={(e) => { if (e.key === "Enter") router.push("/indicator-3"); }}
        >
          <div className="indicator-hub-card-top">
            <span className="indicator-badge indicator-badge-3">ตัวชี้วัด 3</span>
            <a href={indicator3SourceUrl} target="_blank" rel="noopener noreferrer" className="source-link" title="เปิดหน้ารายงานต้นฉบับบน HDC" onClick={(e) => e.stopPropagation()}>
              <ExternalLink size={13} /> HDC
            </a>
          </div>
          <h3>{indicator3Name}</h3>
          <p>ข้อมูลรายหน่วยบริการ แยกตามอำเภอ ดึงโดย automate ผ่าน dropdown จริงบนหน้าเว็บ HDC</p>
          <div className="indicator-hub-stat"><strong>{indicator3RepeatRate ?? "-"}%</strong><span>ก่อความรุนแรงซ้ำ (ทั้งจังหวัด)</span></div>
          {indicator3ProcessedDate && <div className="indicator-hub-processed"><span>วันที่ประมวลผล</span><strong>{indicator3ProcessedDate}</strong></div>}
          <span className="indicator-hub-cta">ดูรายละเอียด <ChevronRight size={15} /></span>
        </div>

        <div
          className="indicator-hub-card"
          role="link"
          tabIndex={0}
          onClick={() => router.push("/indicator-4")}
          onKeyDown={(e) => { if (e.key === "Enter") router.push("/indicator-4"); }}
        >
          <div className="indicator-hub-card-top">
            <span className="indicator-badge indicator-badge-4">ตัวชี้วัด 4</span>
            <a href={indicator4SourceUrl} target="_blank" rel="noopener noreferrer" className="source-link" title="เปิดหน้ารายงานต้นฉบับบน HDC" onClick={(e) => e.stopPropagation()}>
              <ExternalLink size={13} /> HDC
            </a>
          </div>
          <h3>{indicator4Name}</h3>
          <p>ข้อมูลระดับจังหวัด มุมมองรายพื้นที่ (เขตพื้นที่) ดึงโดย automate จากหน้าเว็บ HDC</p>
          <div className="indicator-hub-stat"><strong>{indicator4RepeatRate ?? "-"}%</strong><span>ก่อความรุนแรงซ้ำ (ทั้งจังหวัด)</span></div>
          {indicator4ProcessedDate && <div className="indicator-hub-processed"><span>วันที่ประมวลผล</span><strong>{indicator4ProcessedDate}</strong></div>}
          <span className="indicator-hub-cta">ดูรายละเอียด <ChevronRight size={15} /></span>
        </div>

        <div
          className="indicator-hub-card"
          role="link"
          tabIndex={0}
          onClick={() => router.push("/indicator-5")}
          onKeyDown={(e) => { if (e.key === "Enter") router.push("/indicator-5"); }}
        >
          <div className="indicator-hub-card-top">
            <span className="indicator-badge indicator-badge-5">ตัวชี้วัด 5</span>
            <a href={indicator5SourceUrl} target="_blank" rel="noopener noreferrer" className="source-link" title="เปิดหน้ารายงานต้นฉบับบน HDC" onClick={(e) => e.stopPropagation()}>
              <ExternalLink size={13} /> HDC
            </a>
          </div>
          <h3>{indicator5Name}</h3>
          <p>ข้อมูลรายหน่วยบริการ แยกตามอำเภอ ดึงโดย automate ผ่าน dropdown จริงบนหน้าเว็บ HDC</p>
          <div className="indicator-hub-stat"><strong>{indicator5FollowRate ?? "-"}%</strong><span>ติดตามตามเกณฑ์ (ทั้งจังหวัด)</span></div>
          {indicator5ProcessedDate && <div className="indicator-hub-processed"><span>วันที่ประมวลผล</span><strong>{indicator5ProcessedDate}</strong></div>}
          <span className="indicator-hub-cta">ดูรายละเอียด <ChevronRight size={15} /></span>
        </div>
      </div>
    </motion.div>
  );
}

function OverviewSection() {
  const chartData = amphoeStats.map((item) => ({ amphoe: item.amphoe, total: item.total }));
  return (
    <motion.div className="indicator-group" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .45, ease }}>
      <div className="indicator-group-head">
        <span className="indicator-badge indicator-badge-overview">ภาพรวม</span>
        <h2>วิเคราะห์ภาพรวมจากทุกตัวชี้วัด</h2>
        <p>ผสานข้อมูลตัวชี้วัด 1 (รายอำเภอ) และตัวชี้วัด 2 (การเข้าถึงบริการต่อเนื่อง) เพื่อดูภาพรวมทั้งจังหวัด</p>
      </div>

      <section className="stats-grid" aria-label="สถิติภาพรวม">
        <StatCard label="ผู้ป่วย SMI-V ทั้งจังหวัด" value={provinceTotal.toLocaleString()} note="ตัวชี้วัด 1 · รวมทุกอำเภอ" index={0} featured />
        <StatCard label="เข้าถึงบริการต่อเนื่อง" value={`${indicator2Metrics?.accessRate ?? "-"}%`} note={`${indicator2Metrics?.totalPatients.toLocaleString() ?? "-"} คน จากตัวชี้วัด 2`} index={1} />
        <StatCard label="สัดส่วนครอบคลุม" value={`${overviewInsights?.coverageRate ?? "-"}%`} note="ตัวชี้วัด 2 เทียบตัวชี้วัด 1" index={2} />
        <StatCard label="อำเภอเสี่ยงสูงสุด" value={amphoeStats[0]?.amphoe ?? "-"} note={`สัดส่วน ${overviewInsights?.topAmphoeShare ?? 0}% ของจังหวัด`} index={3} />
      </section>

      <div className="dashboard-grid indicator1-grid">
        <section className="panel analytics-card">
          <div className="panel-heading">
            <div><p className="eyebrow">วิเคราะห์รวม</p><h2>สัดส่วนผู้ป่วยรายอำเภอ เทียบอัตราเข้าถึงบริการ</h2></div>
            <span className="live-pill"><i /> ข้อมูลจริงจาก HDC</span>
          </div>
          <div className="chart-wrap chart-wrap-tall" aria-label="กราฟจำนวนผู้ป่วย SMI-V แยกตามอำเภอ">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" margin={{ top: 4, right: 24, left: 0, bottom: 0 }}>
                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: "#78827e", fontSize: 11 }} />
                <YAxis dataKey="amphoe" type="category" axisLine={false} tickLine={false} width={78} tick={{ fill: "#3a4440", fontSize: 12 }} />
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
                    <Cell key={entry.amphoe} fill={index === 0 ? "#0b5238" : index < 3 ? "#21845c" : "#8da19a"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="panel reminder-card diagnosis-card">
          <p className="eyebrow">ข้อสังเกตจากการวิเคราะห์</p>
          <h2>สรุปเชิงลึก<br />ระดับจังหวัด</h2>
          <div className="insight-list">
            <div className="insight-row">
              <span className="insight-dot" />
              <p>ผู้ป่วย SMI-V ทั้งจังหวัด <strong>{provinceTotal.toLocaleString()}</strong> ราย โดยกลุ่มวินิจฉัยที่พบมากสุดคือ <strong>{overviewInsights?.dominantDiagnosis?.name}</strong> ({overviewInsights?.dominantDiagnosis?.total.toLocaleString()} ราย)</p>
            </div>
            <div className="insight-row">
              <span className="insight-dot" />
              <p>มีผู้ป่วยที่เข้าถึงบริการต่อเนื่อง (ตัวชี้วัด 2) เพียง <strong>{indicator2Metrics?.totalPatients.toLocaleString()}</strong> คน คิดเป็น <strong>{overviewInsights?.coverageRate}%</strong> ของผู้ป่วยทั้งหมดในตัวชี้วัด 1 — อาจบ่งชี้ช่องว่างการติดตามดูแล</p>
            </div>
            <div className="insight-row">
              <span className="insight-dot" />
              <p>อำเภอ <strong>{amphoeStats[0]?.amphoe}</strong> มีสัดส่วนผู้ป่วยสูงสุดถึง <strong>{overviewInsights?.topAmphoeShare}%</strong> ของทั้งจังหวัด ควรให้ความสำคัญเป็นลำดับแรก</p>
            </div>
          </div>
        </section>

        <section className="panel projects-card amphoe-table-card">
          <div className="panel-title-row"><h2>รายชื่ออำเภอ</h2><span className="soft-button" style={{ pointerEvents: "none" }}><MapPinned size={14} /> {amphoeList.length} อำเภอ</span></div>
          <div className="project-list">
            {amphoeStats.map((item) => {
              const detail = getAmphoeDetail(item.amphoe);
              const diagCount = detail?.diagnoses?.length ?? 0;
              return (
                <button className="project-row" key={item.amphoe}>
                  <span className="project-symbol" style={{ "--symbol": "#146948" } as React.CSSProperties}><span /></span>
                  <span><strong>{item.amphoe}</strong><small>{diagCount} กลุ่มวินิจฉัย · รวม {item.total.toLocaleString()} ราย</small></span>
                  <ChevronRight size={15} />
                </button>
              );
            })}
          </div>
        </section>

        <ProvinceGaugeCard />
        <ReportInfoCard />
      </div>
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
        <StatCard label="ผู้ป่วยทั้งจังหวัด" value={provinceTotal.toLocaleString()} note="รวมทุกอำเภอ" index={0} featured />
        <StatCard label="จำนวนอำเภอ" value={String(amphoeList.length)} note="มีข้อมูลครบทุกอำเภอ" index={1} />
        <StatCard label="กลุ่มวินิจฉัย" value={String(diagnosisBreakdown.length)} note="1B030 – 1B033" index={2} />
        <StatCard label="อำเภอสูงสุด" value={amphoeStats[0]?.amphoe ?? "-"} note={`${amphoeStats[0]?.total.toLocaleString() ?? 0} ราย`} index={3} />
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

function Indicator2Section() {
  return (
    <motion.div className="indicator-group" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .45, ease }}>
      <div className="indicator-group-head">
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

      <section className="stats-grid" aria-label="สถิติตัวชี้วัดที่ 2">
        <StatCard label="ผู้ป่วย SMI-V ทั้งหมด" value={`${indicator2Metrics?.totalPatients.toLocaleString() ?? "-"}`} note={indicator2Metrics?.area ?? ""} index={0} featured />
        <StatCard label="อัตราการเข้าถึงบริการ" value={`${indicator2Metrics?.accessRate ?? "-"}%`} note="Accessibility Rate" index={1} />
        <StatCard label="ไม่ก่อความรุนแรงซ้ำ" value={`${indicator2Metrics?.noRepeatViolence.toLocaleString() ?? "-"}`} note="ผู้ป่วยสะสม" index={2} />
        <StatCard label="ดูแลต่อเนื่อง ≥2 ครั้ง" value={`${indicator2Metrics?.continuousCareRate ?? "-"}%`} note="ไม่ก่อซ้ำในปีงบประมาณ" index={3} />
      </section>

      <div className="indicator1-layout">
        <Indicator2InsightsCard />

        <div className="indicator1-columns">
          <div className="indicator1-main">
            <p className="section-label">Funnel การดูแลผู้ป่วย</p>
            <Indicator2FunnelCard />

            <p className="section-label">เปรียบเทียบอัตราตามเกณฑ์</p>
            <Indicator2RateCompareCard />
          </div>

          <div className="indicator1-side">
            <Indicator2Card />
          </div>
        </div>
      </div>

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
    { label: "ตัวอยู่ ทะเบียนบ้านอยู่", value: totals.type1, color: "#146948" },
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
        <StatCard label="ผู้ป่วย SMI-V ทั้งหมดถึงปัจจุบัน" value={`${indicator4Metrics?.totalToDate.toLocaleString() ?? "-"}`} note="สะสมทั้งจังหวัด" index={0} featured />
        <StatCard label="มารักษาในปีงบประมาณปัจจุบัน" value={`${indicator4Metrics?.treatedCurrentYear.toLocaleString() ?? "-"}`} note="ปีงบประมาณปัจจุบัน" index={1} />
        <StatCard label="ไม่ก่อความรุนแรงซ้ำ" value={`${indicator4Metrics?.noRepeatViolence.toLocaleString() ?? "-"}`} note="เข้าเกณฑ์ SMI-V Low Risk" index={2} />
        <StatCard label="ก่อความรุนแรงซ้ำ" value={`${indicator4RepeatRate}%`} note={`${indicator4Metrics?.repeatViolenceCurrentYear.toLocaleString() ?? "-"} คน ในปีงบประมาณปัจจุบัน`} index={3} />
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
    { label: "ความเสี่ยงต่ำ (≤ค่าเฉลี่ย)", items: indicator3AmphoeStats.filter((a) => a.repeatRate <= avg), color: "#146948" },
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
        <StatCard label="สะสมทั้งจังหวัด" value={`${indicator3Metrics.cumulative.toLocaleString()}`} note="ปีงบ 2559-2568" index={0} featured />
        <StatCard label="รายใหม่ปีงบปัจจุบัน" value={`${indicator3Metrics.newCases.toLocaleString()}`} note="ปีงบประมาณ 2569" index={1} />
        <StatCard label="ก่อความรุนแรงซ้ำ" value={`${indicator3Metrics.repeatViolence.toLocaleString()}`} note="คนเดิมที่สะสมถึงปัจจุบัน" index={2} />
        <StatCard label="ร้อยละก่อซ้ำ" value={`${indicator3RepeatRate}%`} note="[3/(1+2)]*100" index={3} />
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
                    <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: "#78827e", fontSize: 11 }} />
                    <YAxis dataKey="amphoe" type="category" axisLine={false} tickLine={false} width={78} tick={{ fill: "#3a4440", fontSize: 12 }} />
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
                        <Cell key={entry.amphoe} fill={index === 0 ? "#0b5238" : index < 3 ? "#21845c" : "#8da19a"} />
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
                    <span className="project-symbol" style={{ "--symbol": "#146948" } as React.CSSProperties}><span /></span>
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
    { label: "ผู้ป่วยรายเก่า", total: oldTotal, followed: oldFollowed, rate: oldRate, color: "#146948" },
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
        <StatCard label="ผู้ป่วยทั้งหมด (B)" value={`${indicator5Metrics.total.toLocaleString()}`} note="มารับบริการในปีงบประมาณ" index={0} featured />
        <StatCard label="ได้รับการติดตามตามเกณฑ์ (A)" value={`${indicator5Metrics.followed.toLocaleString()}`} note="ติดตามครบตามเกณฑ์" index={1} />
        <StatCard label="ร้อยละติดตาม" value={`${indicator5FollowRate}%`} note="[A/B]x100" index={2} />
        <StatCard label="จำนวนอำเภอ" value={`${indicator5AmphoeList.length}`} note="ครบทุกอำเภอ" index={3} />
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
                    <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: "#78827e", fontSize: 11 }} />
                    <YAxis dataKey="amphoe" type="category" axisLine={false} tickLine={false} width={78} tick={{ fill: "#3a4440", fontSize: 12 }} />
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
                        <Cell key={entry.amphoe} fill={index === 0 ? "#0b5238" : index < 3 ? "#21845c" : "#8da19a"} />
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
                    <span className="project-symbol" style={{ "--symbol": "#146948" } as React.CSSProperties}><span /></span>
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

function HippoHdcSection() {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .45, ease }}>
      <section className="panel hippo-placeholder-card">
        <span className="hippo-placeholder-icon"><PawPrint size={34} strokeWidth={1.6} /></span>
        <h2>HIPPO HDC</h2>
        <p>หน้านี้กำลังอยู่ระหว่างเตรียมข้อมูล — จะเพิ่มเนื้อหา Dashboard วิเคราะห์เร็ว ๆ นี้</p>
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
              {view === "hippo-hdc" && <HippoHdcSection />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
      <SearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
}
