import type { Metadata } from "next";
import DashboardShell from "@/components/dashboard/dashboard-shell";

export const metadata: Metadata = {
  title: "ตัวชี้วัดที่เกี่ยวข้อง 22-6 — สถิติผู้ป่วยที่เกี่ยวข้องกับความรุนแรงและจิตเวช (22.6) | HDC สตูล",
  description: "สถิติผู้ป่วยที่เกี่ยวข้องกับความรุนแรงและจิตเวช (22.6) ข้อมูลระดับจังหวัดสตูล",
};

export default function IndicatorRelate22_6Page() {
  return <DashboardShell view="indicator_relate_22_6" />;
}
