import type { Metadata } from "next";
import DashboardShell from "@/components/dashboard/dashboard-shell";

export const metadata: Metadata = {
  title: "ตัวชี้วัดที่เกี่ยวข้อง 21-7 — สรุปผู้ป่วยความผิดปกติทางจิตและพฤติกรรมจากสารออกฤทธิ์ต่อจิตประสาท | HDC สตูล",
  description: "สรุปผู้ป่วยความผิดปกติทางจิตและพฤติกรรมจากสารออกฤทธิ์ต่อจิตประสาท ข้อมูลระดับจังหวัดสตูล",
};

export default function IndicatorRelate21_7Page() {
  return <DashboardShell view="indicator_relate_21_7" />;
}
