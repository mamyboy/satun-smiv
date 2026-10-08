-- =====================================================================
-- MIS Health · ประชากร HDC รายตำบล/หมู่บ้าน "ตามที่อยู่อาศัย" (แฟ้ม home)
-- จังหวัดสตูล provcode '91', TYPEAREA 1,3, NATION '099', DISCHARGE '9'
--
-- ที่อยู่ = person (HOSPCODE+HID) → home.CHANGWAT||AMPUR||TAMBON||VILLAGE → cvillage.VILLAGECODEFULL
--   (chospital บอกได้แค่ที่ตั้งหน่วยบริการ จึงใช้แฟ้ม home สำหรับมิติหมู่บ้าน/ตำบล)
-- ตัววัด:
--   v13 = 1 ต่อ CID ต่อหมู่บ้าน (ตัดซ้ำ CID ภายในหมู่บ้าน)
--   t13 = 1 ต่อ CID ต่อตำบล   (ตัดซ้ำ CID ภายในตำบล)
-- กลุ่มอายุ = ช่วงละ 5 ปี (0=0-4 ... 20=100+), -1 = ไม่ทราบอายุ; วันอ้างอิงอายุ 2026-09-30
-- =====================================================================
WITH base AS (
  SELECT
    p.CID, p.TYPEAREA, p.SEX, p.D_UPDATE, p.HOSPCODE,
    h.CHANGWAT || h.AMPUR || h.TAMBON AS tmb,
    h.CHANGWAT || h.AMPUR || h.TAMBON || h.VILLAGE AS vil,
    CASE WHEN p.BIRTH IS NULL THEN -1
         ELSE (2026 - year(p.BIRTH)) - CASE WHEN strftime(p.BIRTH, '%m%d') > '0930' THEN 1 ELSE 0 END
    END AS age_raw
  FROM person p
  INNER JOIN chospital ch ON ch.HOSCODE = p.HOSPCODE AND ch.PROVCODE = '91'
  INNER JOIN home h ON h.HOSPCODE = p.HOSPCODE AND h.HID = p.HID
  INNER JOIN cvillage cv ON cv.VILLAGECODEFULL = h.CHANGWAT || h.AMPUR || h.TAMBON || h.VILLAGE
  WHERE p.CID IS NOT NULL AND p.NATION = '099' AND p.DISCHARGE = '9' AND p.TYPEAREA IN ('1', '3') AND h.CHANGWAT = '91'
),
ranked AS (
  SELECT *,
    CASE WHEN age_raw BETWEEN 0 AND 120 THEN LEAST(age_raw, 100) // 5 ELSE -1 END AS ag,
    ROW_NUMBER() OVER (PARTITION BY CID, vil ORDER BY TYPEAREA, D_UPDATE DESC NULLS LAST, HOSPCODE) AS rv,
    ROW_NUMBER() OVER (PARTITION BY CID, tmb ORDER BY TYPEAREA, D_UPDATE DESC NULLS LAST, HOSPCODE) AS rt
  FROM base
)
SELECT
  vil AS v, SEX AS s, ag AS g,
  SUM(CASE WHEN rv = 1 THEN 1 ELSE 0 END) AS v13,
  SUM(CASE WHEN rt = 1 THEN 1 ELSE 0 END) AS t13
FROM ranked
GROUP BY ALL
ORDER BY v, s, g;
