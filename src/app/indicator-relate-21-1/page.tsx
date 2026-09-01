import type { Metadata } from "next";
import DashboardShell from "@/components/dashboard/dashboard-shell";

export const metadata: Metadata = {
  title: "ตัวชี้วัดที่เกี่ยวข้อง 21-1 — ร้อยละของผู้ป่วยที่มีความผิดปกติทางจิตและพฤติกรรมที่เกิดจากการใช้สารออกฤทธิ์ต่อจิตประสาท (จำแนกตามเพศ) | HDC สตูล",
  description: "ร้อยละของผู้ป่วยที่มีความผิดปกติทางจิตและพฤติกรรมที่เกิดจากการใช้สารออกฤทธิ์ต่อจิตประสาท (จำแนกตามเพศ) ข้อมูลระดับจังหวัดสตูล",
};

export default function IndicatorRelate21_1Page() {
  return <DashboardShell view="indicator_relate_21_1" />;
}
