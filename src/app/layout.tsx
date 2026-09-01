import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Noto_Sans_Thai } from "next/font/google";
import "./globals.css";

const inter = Inter({ variable: "--font-geist-sans", subsets: ["latin"] });
const mono = JetBrains_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
const notoSansThai = Noto_Sans_Thai({
  variable: "--font-noto-sans-thai",
  subsets: ["thai"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "SMI-V Dashboard — สสจ.สตูล",
  description: "แดชบอร์ดเฝ้าระวังผู้ป่วยจิตเวชที่มีความเสี่ยงสูงต่อการก่อความรุนแรง (SMI-V) จังหวัดสตูล",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="th"
      className={`${inter.variable} ${mono.variable} ${notoSansThai.variable} h-full antialiased`}
    >
      <body>{children}</body>
    </html>
  );
}
