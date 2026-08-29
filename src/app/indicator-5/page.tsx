import type { Metadata } from "next";
import DashboardShell from "@/components/dashboard/dashboard-shell";

export const metadata: Metadata = {
  title: "ตัวชี้วัด 5 — SMI-V ติดตามตามเกณฑ์ | HDC สตูล",
  description: "ร้อยละผู้ป่วยจิตเวช SMI-V ที่มารับบริการในปีงบประมาณได้รับการติดตามตามเกณฑ์ จำแนกรายใหม่/รายเก่า ระดับจังหวัดสตูล",
};

export default function Indicator5Page() {
  return <DashboardShell view="indicator5" />;
}
