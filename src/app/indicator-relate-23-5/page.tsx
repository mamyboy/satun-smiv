import type { Metadata } from "next";
import DashboardShell from "@/components/dashboard/dashboard-shell";

export const metadata: Metadata = {
  title: "ตัวชี้วัดที่เกี่ยวข้อง 23-5 — อัตราป่วย/ความชุกของโรคหลักในเกณฑ์ SMI-V (23.5) | HDC สตูล",
  description: "อัตราป่วย/ความชุกของโรคหลักในเกณฑ์ SMI-V (23.5) ข้อมูลระดับจังหวัดสตูล",
};

export default function IndicatorRelate23_5Page() {
  return <DashboardShell view="indicator_relate_23_5" />;
}
