import type { Metadata } from "next";
import DashboardShell from "@/components/dashboard/dashboard-shell";

export const metadata: Metadata = {
  title: "ตัวชี้วัดที่เกี่ยวข้อง 21-2 — ร้อยละของผู้ป่วยที่มีความผิดปกติทางจิตและพฤติกรรมจากสารออกฤทธิ์ต่อจิตประสาท จำแนกตามสถานพยาบาล | HDC สตูล",
  description: "ร้อยละของผู้ป่วยที่มีความผิดปกติทางจิตและพฤติกรรมจากสารออกฤทธิ์ต่อจิตประสาท จำแนกตามสถานพยาบาล ข้อมูลรายอำเภอ จังหวัดสตูล",
};

export default function IndicatorRelate21_2Page() {
  return <DashboardShell view="indicator_relate_21_2" />;
}
