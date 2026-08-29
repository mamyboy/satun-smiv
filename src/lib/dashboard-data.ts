import {
  Activity,
  Building2,
  LayoutDashboard,
  PawPrint,
  Settings,
} from "lucide-react";

export const mainNavItems = [
  { label: "ภาพรวม", icon: LayoutDashboard, href: "/", view: "overview" },
  { label: "ตัวชี้วัด", icon: Activity, href: "/indicators", view: "indicators" },
  { label: "HIPPO HDC", icon: PawPrint, href: "/hippo-hdc", view: "hippo-hdc" },
] as const;

export const utilityItems = [
  { label: "ตั้งค่า", icon: Settings },
  { label: "หน่วยงาน", icon: Building2 },
];
