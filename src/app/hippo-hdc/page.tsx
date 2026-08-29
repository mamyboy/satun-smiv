import type { Metadata } from "next";
import DashboardShell from "@/components/dashboard/dashboard-shell";

export const metadata: Metadata = {
  title: "HIPPO HDC | HDC สตูล",
  description: "หน้า HIPPO HDC (เตรียมเปิดใช้งาน)",
};

export default function HippoHdcPage() {
  return <DashboardShell view="hippo-hdc" />;
}
