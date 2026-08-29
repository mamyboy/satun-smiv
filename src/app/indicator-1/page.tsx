import type { Metadata } from "next";
import DashboardShell from "@/components/dashboard/dashboard-shell";

export const metadata: Metadata = {
  title: "ตัวชี้วัด 1 — SMI-V รายอำเภอ | HDC สตูล",
  description: "SMI-V จำแนกตามการวินิจฉัย รายอำเภอ จังหวัดสตูล",
};

export default function Indicator1Page() {
  return <DashboardShell view="indicator1" />;
}
