import type { Metadata } from "next";
import DashboardShell from "@/components/dashboard/dashboard-shell";

export const metadata: Metadata = {
  title: "ตัวชี้วัด 4 — SMI-V ขาดการรักษาก่อความรุนแรงซ้ำ | HDC สตูล",
  description: "ผู้ป่วยจิตเวชยาเสพติดก่อความรุนแรง (SMI-V) ที่ขาดการรักษาก่อความรุนแรงซ้ำ จำแนกตามประเภทความรุนแรง ระดับจังหวัดสตูล",
};

export default function Indicator4Page() {
  return <DashboardShell view="indicator4" />;
}
