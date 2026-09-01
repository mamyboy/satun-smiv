import type { Metadata } from "next";
import DashboardShell from "@/components/dashboard/dashboard-shell";

export const metadata: Metadata = {
  title: "ตัวชี้วัดที่เกี่ยวข้อง 23-6 — อัตราป่วย/ความชุกของโรคหลักในเกณฑ์ SMI-V (23.6) | HDC สตูล",
  description: "อัตราป่วย/ความชุกของโรคหลักในเกณฑ์ SMI-V (23.6) ข้อมูลระดับจังหวัดสตูล",
};

export default function IndicatorRelate23_6Page() {
  return <DashboardShell view="indicator_relate_23_6" />;
}
