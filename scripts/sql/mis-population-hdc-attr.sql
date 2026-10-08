-- =====================================================================
-- MIS Health · ประชากร HDC จำแนกตามคุณลักษณะ (ศาสนา / หมู่เลือด ABO / Rh / สถานภาพสมรส / การศึกษา)
-- จังหวัดสตูล provcode '91', TYPEAREA 1,3, NATION '099', DISCHARGE '9'
-- ใช้ค่าจาก "แถวตัวแทน" ของ CID (TYPEAREA น้อยก่อน → D_UPDATE ล่าสุด → HOSPCODE)
--   p13 = ตัดซ้ำ CID ทั้งจังหวัด, a13 = ตัดซ้ำ CID ภายในอำเภอ (อำเภอจาก chospital ของหน่วยบริการ)
-- รหัสว่าง/NULL → '' (หน้าเว็บแสดงเป็น "ไม่บันทึก")
-- =====================================================================
WITH base AS (
  SELECT
    p.CID, p.TYPEAREA, p.SEX, p.D_UPDATE, p.HOSPCODE, ch.DISTCODE AS amp,
    COALESCE(p.RELIGION, '')  AS religion,
    COALESCE(p.ABOGROUP, '')  AS abo,
    COALESCE(p.RHGROUP, '')   AS rh,
    COALESCE(p.MSTATUS, '')   AS mstatus,
    COALESCE(p.EDUCATION, '') AS education
  FROM person p
  INNER JOIN chospital ch ON ch.HOSCODE = p.HOSPCODE AND ch.PROVCODE = '91'
  INNER JOIN campur ca ON ca.AMPURCODEFULL = CONCAT(ch.PROVCODE, ch.DISTCODE)
  WHERE p.CID IS NOT NULL AND p.NATION = '099' AND p.DISCHARGE = '9' AND p.TYPEAREA IN ('1', '3')
),
ranked AS (
  SELECT *,
    ROW_NUMBER() OVER (PARTITION BY CID      ORDER BY TYPEAREA, D_UPDATE DESC NULLS LAST, HOSPCODE) AS rp,
    ROW_NUMBER() OVER (PARTITION BY CID, amp ORDER BY TYPEAREA, D_UPDATE DESC NULLS LAST, HOSPCODE) AS ra
  FROM base
),
long AS (
  UNPIVOT ranked ON religion, abo, rh, mstatus, education INTO NAME attr VALUE code
)
SELECT
  amp AS a, attr AS k, code AS c, SEX AS s,
  SUM(CASE WHEN ra = 1 THEN 1 ELSE 0 END) AS a13,
  SUM(CASE WHEN rp = 1 THEN 1 ELSE 0 END) AS p13
FROM long
GROUP BY ALL
ORDER BY a, k, c, s;
