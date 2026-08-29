import type { Metadata } from "next";
import DashboardShell from "@/components/dashboard/dashboard-shell";

export const metadata: Metadata = {
  title: "ตัวชี้วัด 3 — SMI-V ไม่ก่อความรุนแรงซ้ำ | HDC สตูล",
  description: "ร้อยละผู้ป่วยจิตเวชที่มีความเสี่ยงสูงต่อการก่อความรุนแรง (SMI-V) ไม่ก่อความรุนแรงซ้ำ แยกรายอำเภอ จังหวัดสตูล",
};

export default function Indicator3Page() {
  return <DashboardShell view="indicator3" />;
}
