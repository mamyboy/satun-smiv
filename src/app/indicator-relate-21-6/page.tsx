import type { Metadata } from "next";
import DashboardShell from "@/components/dashboard/dashboard-shell";

export const metadata: Metadata = {
  title: "ตัวชี้วัดที่เกี่ยวข้อง 21-6 — Retention Rate ผู้ป่วยยาเสพติดที่เข้าสู่กระบวนการบำบัดรักษาได้รับการดูแลติดตามต่อเนื่อง | HDC สตูล",
  description: "Retention Rate ผู้ป่วยยาเสพติดที่เข้าสู่กระบวนการบำบัดรักษาได้รับการดูแลติดตามต่อเนื่อง ข้อมูลรายอำเภอ จังหวัดสตูล",
};

export default function IndicatorRelate21_6Page() {
  return <DashboardShell view="indicator_relate_21_6" />;
}
