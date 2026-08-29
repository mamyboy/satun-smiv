import type { Metadata } from "next";
import DashboardShell from "@/components/dashboard/dashboard-shell";

export const metadata: Metadata = {
  title: "ตัวชี้วัด 2 — SMI-V เข้าถึงบริการต่อเนื่อง | HDC สตูล",
  description: "ผู้ป่วย SMI-V ที่เข้าถึงบริการต่อเนื่องและไม่ก่อความรุนแรงซ้ำ ระดับจังหวัดสตูล",
};

export default function Indicator2Page() {
  return <DashboardShell view="indicator2" />;
}
