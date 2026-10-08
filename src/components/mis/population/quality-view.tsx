"use client";

import { ShieldCheck } from "lucide-react";
import { fmtNum } from "@/lib/mis/format";
import type { PopulationData } from "@/lib/mis/population";
import { Panel, PanelHeader } from "../panel";
import { SortTable, SourceNote } from "./shared";
import type { Sources } from "./sources";

export function QualityView({ d, src }: { d: PopulationData; src: Sources }) {
  const q = d.hdc.quality;
  const [rows13, cid13] = q.thai_alive_13_rows;
  const items = [
    { k: "แถว person ทั้งหมดของหน่วยบริการในจังหวัด (ทุก TYPEAREA)", n: q.person_rows, note: "รวม TYPEAREA 4 (นอกเขต) ที่มารับบริการ" },
    { k: "แถว TYPEAREA 1,3 ไทย ยังไม่จำหน่าย (HOSPCODE+PID)", n: rows13, note: "ตัวตั้งของภาพรายหน่วยบริการ" },
    { k: "CID ไม่ซ้ำ TYPEAREA 1,3", n: cid13, note: "ตัวตั้งของภาพจังหวัด" },
    { k: "CID ที่เป็น 1,3 มากกว่า 1 หน่วยบริการ", n: q.cid_multi_unit_13, note: "ทำให้ผลรวมรายหน่วย > ยอดจังหวัด" },
    { k: "CID ที่เป็น 1,3 ในหน่วยบริการต่างอำเภอ", n: q.cid_multi_amp_13, note: "ทำให้ผลรวมรายอำเภอ > ยอดจังหวัด" },
    { k: "BIRTH ว่าง / อนาคต / ก่อนปี ค.ศ. 1906 (1,3)", n: q.bad_birth_13, note: "ไม่อยู่ในพีระมิด (ไม่ทราบอายุ)" },
    { k: "SEX ไม่ใช่ 1/2 (1,3)", n: q.sex_other_13, note: "ไม่อยู่ในชาย/หญิง" },
    { k: "หาบ้านในแฟ้ม home ไม่พบ (1,3)", n: q.no_home_13, note: "ไม่อยู่ในภาพตำบล/หมู่บ้าน" },
    { k: "รหัสหมู่บ้านในแฟ้ม home ไม่ตรง cvillage (1,3)", n: q.home_bad_village_13, note: "ไม่อยู่ในภาพตำบล/หมู่บ้าน" },
    { k: "CID ว่าง (1,3)", n: q.null_cid_13 ?? 0, note: "ตัดออกจากทุกการนับ" },
  ];
  return (
    <div className="grid grid-cols-1 gap-4 sm:gap-5 xl:grid-cols-12">
      <Panel index={0} className="xl:col-span-7">
        <PanelHeader icon={<ShieldCheck />} title="คุณภาพข้อมูลแฟ้ม person (HDC)" description="ตัวเลขที่อธิบายส่วนต่างระหว่างระดับจังหวัด / อำเภอ / หน่วยบริการ" />
        <div className="px-5 pt-4 sm:px-6">
          <SortTable rows={items} initialSort={{ key: "n", dir: -1 }} columns={[{ key: "k", label: "รายการ" }, { key: "n", label: "จำนวน", num: true }, { key: "note", label: "ผลต่อ Dashboard" }]} />
        </div>
        <SourceNote
          source={src.hdc("person, chospital, home, cvillage")}
          method="นับตรงจากตาราง person ด้วยเงื่อนไขเดียวกับ Dashboard (NATION '099', DISCHARGE '9', หน่วยบริการในจังหวัด 91) — ส่งออกพร้อมผล SQL หลัก"
        />
      </Panel>
      <Panel index={1} className="xl:col-span-5">
        <PanelHeader icon={<ShieldCheck />} title="การกระจาย TYPEAREA / สัญชาติ" description="ทุกแถวในแฟ้ม person ของหน่วยบริการในจังหวัด" />
        <div className="grid gap-4 px-5 pt-4 sm:px-6">
          <SortTable
            rows={q.typearea_rows.map(([t, n]) => ({ t: t || "(ว่าง)", n }))}
            initialSort={{ key: "t", dir: 1 }}
            columns={[{ key: "t", label: "TYPEAREA" }, { key: "n", label: "แถว", num: true }]}
          />
          <SortTable
            rows={q.nation_13.map(([c, n]) => ({ c: c || "(ว่าง)", n }))}
            initialSort={{ key: "n", dir: -1 }}
            columns={[{ key: "c", label: "NATION (TYPEAREA 1,3 ยังไม่จำหน่าย)" }, { key: "n", label: "CID", num: true }]}
          />
          <p className="text-[11.5px] text-mis-faint">ทะเบียนราษฎรตรวจกระทบยอดแล้ว: ผลรวมสำนักทะเบียน = ผลรวมตำบล = ยอดจังหวัด ({fmtNum(d.bora.prov["1"].concat(d.bora.prov["2"]).reduce((a, b) => a + b, 0))} คน)</p>
        </div>
        <SourceNote source={src.hdc("person, chospital")} method="GROUP BY TYPEAREA (ทุกแถว) และ GROUP BY NATION นับ CID ไม่ซ้ำ เฉพาะ TYPEAREA 1,3 ที่ยังไม่จำหน่าย" />
      </Panel>
    </div>
  );
}
