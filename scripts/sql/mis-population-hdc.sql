-- =====================================================================
-- MIS Health · ข้อมูลพื้นฐาน → ประชากร (แหล่งที่ 1: HDC 43 แฟ้ม / hippo DuckDB)
-- จังหวัดสตูล provcode '91'
--
-- ผลลัพธ์ = "cube" ระดับ หน่วยบริการ × TYPEAREA × เพศ × อายุรายปี (ไม่มี CID ออกไป)
-- โดยแต่ละ cell มีตัววัด 5 ตัว ที่บวกต่อกันได้ (additive) จึงคำนวณได้ทุกระดับที่หน้าเว็บ:
--   u    = จำนวนแถว HOSPCODE+PID              → ภาพรายหน่วยบริการ (ไม่ตัดซ้ำข้ามหน่วย)
--   a13  = 1 ต่อ CID ต่ออำเภอ  (TYPEAREA 1,3) → ภาพอำเภอ (ตัดซ้ำ CID ภายในอำเภอ)
--   p13  = 1 ต่อ CID ทั้งจังหวัด (TYPEAREA 1,3) → ภาพจังหวัด (ตัดซ้ำ CID ทั้งจังหวัด)
--   a12 / p12 = เช่นเดียวกัน แต่ใช้ชุด TYPEAREA 1,2 (ตามทะเบียนบ้าน) สำหรับเทียบทะเบียนราษฎร
--   a4 / p4   = เช่นเดียวกัน แต่ใช้ TYPEAREA 4 (มาอาศัยนอกเขต/มารับบริการ) — ตัดซ้ำ CID ในอำเภอ / ทั้งจังหวัด
--   p4x       = CID ที่เป็น TYPEAREA 4 และ "ไม่มี" TYPEAREA 1,2,3 ที่หน่วยใดในจังหวัดเลย (คนนอกจังหวัดจริง)
--
-- กติกาเลือก "แถวตัวแทน" ของ CID (กำหนด เพศ/อายุ/หน่วย ที่ใช้นับ):
--   TYPEAREA น้อยก่อน ('1' ก่อน '2'/'3') → D_UPDATE ล่าสุด → HOSPCODE น้อยสุด
-- อายุ = อายุเต็มปี ณ วันอ้างอิง 2026-09-30 (วันประมวลผล HDC); อายุ <0 หรือ >120 / BIRTH ว่าง = -1 (ไม่ทราบอายุ); 100+ รวมเป็น 100
-- =====================================================================
WITH base AS (
  SELECT
    p.HOSPCODE, p.PID, p.CID, p.TYPEAREA, p.SEX, p.D_UPDATE,
    ch.DISTCODE AS amp,
    CASE WHEN p.BIRTH IS NULL THEN -1
         ELSE (2026 - year(p.BIRTH)) - CASE WHEN strftime(p.BIRTH, '%m%d') > '0930' THEN 1 ELSE 0 END
    END AS age_raw
  FROM person p
  INNER JOIN chospital ch ON ch.HOSCODE = p.HOSPCODE AND ch.PROVCODE = '91'
  INNER JOIN campur ca ON ca.AMPURCODEFULL = CONCAT(ch.PROVCODE, ch.DISTCODE)
  WHERE p.CID IS NOT NULL AND p.NATION = '099' AND p.DISCHARGE = '9' AND p.TYPEAREA IN ('1', '2', '3', '4')
),
ranked AS (
  SELECT *,
    CASE WHEN age_raw BETWEEN 0 AND 120 THEN LEAST(age_raw, 100) ELSE -1 END AS age,
    CASE WHEN TYPEAREA IN ('1','3') THEN ROW_NUMBER() OVER (PARTITION BY CID, TYPEAREA IN ('1','3')      ORDER BY TYPEAREA, D_UPDATE DESC NULLS LAST, HOSPCODE) END AS rp13,
    CASE WHEN TYPEAREA IN ('1','3') THEN ROW_NUMBER() OVER (PARTITION BY CID, amp, TYPEAREA IN ('1','3') ORDER BY TYPEAREA, D_UPDATE DESC NULLS LAST, HOSPCODE) END AS ra13,
    CASE WHEN TYPEAREA IN ('1','2') THEN ROW_NUMBER() OVER (PARTITION BY CID, TYPEAREA IN ('1','2')      ORDER BY TYPEAREA, D_UPDATE DESC NULLS LAST, HOSPCODE) END AS rp12,
    CASE WHEN TYPEAREA IN ('1','2') THEN ROW_NUMBER() OVER (PARTITION BY CID, amp, TYPEAREA IN ('1','2') ORDER BY TYPEAREA, D_UPDATE DESC NULLS LAST, HOSPCODE) END AS ra12,
    CASE WHEN TYPEAREA = '4' THEN ROW_NUMBER() OVER (PARTITION BY CID, TYPEAREA = '4'      ORDER BY D_UPDATE DESC NULLS LAST, HOSPCODE) END AS rp4,
    CASE WHEN TYPEAREA = '4' THEN ROW_NUMBER() OVER (PARTITION BY CID, amp, TYPEAREA = '4' ORDER BY D_UPDATE DESC NULLS LAST, HOSPCODE) END AS ra4,
    MAX(CASE WHEN TYPEAREA IN ('1','2','3') THEN 1 ELSE 0 END) OVER (PARTITION BY CID) AS has123
  FROM base
)
SELECT
  HOSPCODE AS h, TYPEAREA AS t, SEX AS s, age AS g,
  COUNT(*)                                    AS u,
  SUM(CASE WHEN ra13 = 1 THEN 1 ELSE 0 END)   AS a13,
  SUM(CASE WHEN rp13 = 1 THEN 1 ELSE 0 END)   AS p13,
  SUM(CASE WHEN ra12 = 1 THEN 1 ELSE 0 END)   AS a12,
  SUM(CASE WHEN rp12 = 1 THEN 1 ELSE 0 END)   AS p12,
  SUM(CASE WHEN ra4 = 1 THEN 1 ELSE 0 END)    AS a4,
  SUM(CASE WHEN rp4 = 1 THEN 1 ELSE 0 END)    AS p4,
  SUM(CASE WHEN rp4 = 1 AND has123 = 0 THEN 1 ELSE 0 END) AS p4x
FROM ranked
GROUP BY ALL
ORDER BY h, t, s, g;
