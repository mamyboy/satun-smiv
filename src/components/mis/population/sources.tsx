"use client";

import * as React from "react";
import type { PopulationData } from "@/lib/mis/population";

/** ข้อความแหล่งที่มา/เงื่อนไขมาตรฐาน — ใช้ซ้ำในทุก panel ให้ตรงกันทั้งหน้า */
export function useSources(d: PopulationData) {
  return React.useMemo(() => {
    const m = d.meta;
    const thDate = (s: string) => new Date(s).toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric" });
    const boraMonth = (() => {
      const y = Math.floor(m.bora.latest / 100), mo = m.bora.latest % 100;
      return new Date(2000 + y - 43, mo - 1, 1).toLocaleDateString("th-TH", { month: "long", year: "numeric" });
    })();
    return {
      boraMonth,
      hdc: (tables = "person, chospital, campur") => (
        <>
          HDC 43 แฟ้ม ผ่าน hippo.moph.go.th (DuckDB · ไลบรารี hdc 0.6.7) ตาราง <b>{tables}</b> · จังหวัด {m.province} (provcode {m.provcode}) ·
          ข้อมูล ณ {thDate(m.hdc.dataDate)} (HDC ประมวลผล {thDate(m.hdc.hdcDate)})
        </>
      ),
      bora: (what = "จำนวนประชากรรายอายุ") => (
        <>
          {m.bora.source} — {what} ·{" "}
          <a href={m.bora.url} target="_blank" rel="noreferrer" className="text-mis-accent-strong underline-offset-2 hover:underline">stat.bora.dopa.go.th</a> ·
          ข้อมูลเดือน{boraMonth} (ดึงข้อมูล {m.bora.fetched})
        </>
      ),
      bod: (
        <>
          {m.bod.source} ·{" "}
          <a href={m.bod.url} target="_blank" rel="noreferrer" className="text-mis-accent-strong underline-offset-2 hover:underline">le-hale.bodthai.net</a>
        </>
      ),
      commonWhere: "person.NATION = '099' (ไทย) AND person.DISCHARGE = '9' (ยังไม่จำหน่าย) AND chospital.PROVCODE = '91' AND CID IS NOT NULL",
      ageRule: `อายุเต็มปี ณ ${thDate(m.hdc.ageRefDate)} จาก BIRTH (BIRTH ว่าง/อายุ <0 หรือ >120 = ไม่ทราบอายุ ไม่อยู่ในพีระมิด)`,
      repRule: "แถวตัวแทนของ CID: TYPEAREA น้อยก่อน → D_UPDATE ล่าสุด → HOSPCODE น้อยสุด (ใช้กำหนดเพศ/อายุ/หน่วยบริการของคนนั้น)",
    };
  }, [d]);
}

export type Sources = ReturnType<typeof useSources>;
