import type { Metadata } from "next";
import { MisDashboard } from "@/components/mis/mis-dashboard";

export const metadata: Metadata = {
  title: "MIS Health — สถานการณ์สุขภาพ จังหวัดสตูล | สสจ.สตูล",
  description: "แดชบอร์ดภาพรวมข้อมูลสุขภาพของหน่วยบริการในจังหวัดสตูล จาก HDC 43 แฟ้ม: โรคไม่ติดต่อ โรคติดต่อ และ 10 อันดับกลุ่มโรค",
};

export default function MisPage() {
  return <MisDashboard />;
}
