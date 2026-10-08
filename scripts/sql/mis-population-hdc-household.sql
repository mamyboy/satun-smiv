-- =====================================================================
-- MIS Health · ข้อมูลพื้นฐาน → ประชากร · ครัวเรือน/บ้าน (HDC แฟ้ม person + home)
-- จังหวัดสตูล provcode '91', TYPEAREA 1,3, ทุกสัญชาติ, DISCHARGE '9'
--
-- 1 คน (CID) อยู่ได้ 1 บ้าน: ใช้บ้านของ "แถวตัวแทน" (NATION '099' ก่อน → TYPEAREA น้อยก่อน → D_UPDATE ล่าสุด → HOSPCODE)
-- รหัสบ้าน (hk): HOUSE_ID 11 หลักของกรมการปกครอง ถ้าถูกต้อง (ตัดซ้ำบ้านเดียวกันที่ขึ้นทะเบียนหลายหน่วยบริการ)
--                ถ้าไม่มี/ไม่ถูกต้อง ใช้ HOSPCODE+HID แทน
-- ที่ตั้งบ้าน = home.CHANGWAT||AMPUR||TAMBON||VILLAGE ต้องตรง cvillage (ไม่ตรง = ไม่นับ)
-- ผลลัพธ์ต่อหมู่บ้าน × ขนาดครัวเรือน (1..6, 7 = 7 คนขึ้นไป):
--   houses = จำนวนบ้าน, persons = จำนวนคน, withid = บ้านที่มี HOUSE_ID ถูกต้อง
-- ไม่มี CID/HOUSE_ID ในผลลัพธ์
-- =====================================================================
WITH per AS (
  SELECT
    p.CID, p.TYPEAREA, p.D_UPDATE, p.HOSPCODE, (COALESCE(p.NATION, '') <> '099') AS nth,
    h.CHANGWAT || h.AMPUR || h.TAMBON || h.VILLAGE AS vil,
    CASE WHEN regexp_full_match(COALESCE(h.HOUSE_ID, ''), '[0-9]{11}') AND h.HOUSE_ID <> '00000000000'
         THEN 'H' || h.HOUSE_ID ELSE 'L' || p.HOSPCODE || '-' || p.HID END AS hk
  FROM person p
  INNER JOIN chospital ch ON ch.HOSCODE = p.HOSPCODE AND ch.PROVCODE = '91'
  INNER JOIN home h ON h.HOSPCODE = p.HOSPCODE AND h.HID = p.HID
  INNER JOIN cvillage cv ON cv.VILLAGECODEFULL = h.CHANGWAT || h.AMPUR || h.TAMBON || h.VILLAGE
  WHERE p.CID IS NOT NULL AND p.DISCHARGE = '9' AND p.TYPEAREA IN ('1', '3') AND h.CHANGWAT = '91'
),
rep AS (
  SELECT *, ROW_NUMBER() OVER (PARTITION BY CID ORDER BY nth, TYPEAREA, D_UPDATE DESC NULLS LAST, HOSPCODE) AS rn
  FROM per
),
hh AS (
  SELECT hk, MIN(vil) AS vil, COUNT(*) AS n FROM rep WHERE rn = 1 GROUP BY hk
)
SELECT
  vil AS v, LEAST(n, 7) AS sz,
  COUNT(*) AS houses,
  SUM(n) AS persons,
  SUM(CASE WHEN hk LIKE 'H%' THEN 1 ELSE 0 END) AS withid
FROM hh
GROUP BY ALL
ORDER BY v, sz;
