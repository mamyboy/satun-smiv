import type { Metadata } from "next";
import DashboardShell from "@/components/dashboard/dashboard-shell";

export const metadata: Metadata = {
  title: "ตัวชี้วัดที่เกี่ยวข้อง 16 — ผู้ป่วยจิตเภทรักษาต่อเนื่องภายใน 6 เดือน (Reverse) | HDC สตูล",
  description: "ร้อยละของผู้ป่วยโรคจิตเภทได้รับการรักษาต่อเนื่องภายใน 6 เดือน (Reverse) ระดับจังหวัดสตูล",
};

export default function IndicatorRelate16Page() {
  return <DashboardShell view="indicator_relate_16" />;
}
