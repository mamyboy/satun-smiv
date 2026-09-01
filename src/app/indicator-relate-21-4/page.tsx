import type { Metadata } from "next";
import DashboardShell from "@/components/dashboard/dashboard-shell";

export const metadata: Metadata = {
  title: "ตัวชี้วัดที่เกี่ยวข้อง 21-4 — ผู้ป่วยความผิดปกติทางจิตและพฤติกรรมจากสารออกฤทธิ์ต่อจิตประสาท จำแนกตามกลุ่มโรค | HDC สตูล",
  description: "ผู้ป่วยความผิดปกติทางจิตและพฤติกรรมจากสารออกฤทธิ์ต่อจิตประสาท จำแนกตามกลุ่มโรค ข้อมูลระดับจังหวัดสตูล",
};

export default function IndicatorRelate21_4Page() {
  return <DashboardShell view="indicator_relate_21_4" />;
}
