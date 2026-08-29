import type { Metadata } from "next";
import DashboardShell from "@/components/dashboard/dashboard-shell";

export const metadata: Metadata = {
  title: "ตัวชี้วัด | HDC สตูล",
  description: "เลือกดูรายละเอียดแต่ละตัวชี้วัด SMI-V จังหวัดสตูล",
};

export default function IndicatorsPage() {
  return <DashboardShell view="indicators" />;
}
