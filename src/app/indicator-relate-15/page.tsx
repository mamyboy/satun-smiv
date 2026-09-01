import type { Metadata } from "next";
import DashboardShell from "@/components/dashboard/dashboard-shell";

export const metadata: Metadata = {
  title: "ตัวชี้วัดที่เกี่ยวข้อง 15 — ผู้ป่วยจิตเภทเข้าถึงบริการสะสมได้รับการดูแลต่อเนื่อง | HDC สตูล",
  description: "ร้อยละของผู้ป่วยจิตเภทที่เข้าถึงบริการสะสมได้รับการดูแลต่อเนื่อง ระดับจังหวัดสตูล",
};

export default function IndicatorRelate15Page() {
  return <DashboardShell view="indicator_relate_15" />;
}
