-- =====================================================================
-- HIPPO HDC — Summary Report (all SMI-V related indicators, long format)
-- =====================================================================
-- Run this in your DuckDB / Jupyter %%sql environment against the raw
-- 43-แฟ้ม tables (person, diagnosis_opd, specialpp, chospital, campur).
--
-- OUTPUT SCHEMA (one long/fact table so /hippo-hdc can pivot + filter
-- across every dimension client-side, no server needed):
--
--   level          -> 'code' | 'category' | 'overall'   (see note below)
--   source         -> 'DIAGNOSIS_OPD' | 'SPECIALPP'
--   category       -> human-readable disease/service group label ('ALL' at level=overall)
--   code           -> exact ICD-10-TM / PPSPECIAL code ('ALL' at level=category/overall)
--   ampur          -> อำเภอ
--   hoscode        -> รหัสหน่วยบริการ (chospital.hoscode / diagnosis_opd.hospcode)
--   hosname        -> ชื่อหน่วยบริการ (chospital.hosname)
--   typearea       -> 1 | 2 | 3 | 4 (person.TYPEAREA raw code)
--   typearea_label -> Thai label for the above (filter/combine "1+3" in the UI)
--   age_band       -> 0-14 / 15-29 / 30-44 / 45-59 / 60-74 / 75+ / ไม่ทราบ
--   patient_count  -> COUNT(DISTINCT hospcode||'|'||pid) for that exact slice
--
-- WHY THREE LEVELS (this matters — read before summing anything):
-- A single person can have MULTIPLE diagnosis codes that roll up into the
-- SAME category (e.g. F14 and F16 both -> "ติดสารเสพติดอื่นๆ"), and can
-- have diagnoses across MULTIPLE categories entirely (e.g. both F20 and
-- F32). If you sum COUNT(DISTINCT person) rows across `code` to get a
-- category total, or across `category` to get a grand total, you will
-- double-count that person. To avoid this, each level is its OWN
-- independent DISTINCT-person rollup at that exact granularity:
--   - level='code'     : finest grain — use when pivoting/filtering by รายรหัส
--   - level='category' : one DISTINCT count per category (code='ALL') —
--                        use when pivoting/filtering by กลุ่มโรค/รายโรค only
--   - level='overall'  : one DISTINCT count across ALL categories combined
--                        (category='ALL', code='ALL') — use for a grand
--                        total per อำเภอ/หน่วยบริการ/typearea/age_band/source
--                        with NO disease breakdown (matches "รวมผู้ป่วยตาม
--                        กลุ่มโรคทั้งหมด" in the original query)
-- Dashboard rule of thumb: pick the level matching the coarsest disease
-- dimension actually shown/filtered. Never sum rows across two different
-- levels, and never sum `code`-level rows to fabricate a category/overall
-- total — read the pre-computed rollup instead.
--
-- NOTE ON ROW COUNT: adding hoscode/hosname multiplies the number of rows
-- roughly by the number of distinct หน่วยบริการ per อำเภอ (previously
-- grouped only by ampur). Expect a noticeably larger CSV than before —
-- check the file size after COPY finishes.
--
-- After running, place the CSV at:
--   donezo-dashboard/public/data/hippo-hdc-summary.csv
-- =====================================================================

COPY (
WITH dx_base AS (
    SELECT DISTINCT
        ca.ampurname,
        ch.hoscode,
        ch.hosname,
        concat(coalesce(d.hospcode, ''), '|', coalesce(d.pid, '')) AS person_key,
        replace(upper(trim(d.diagcode)), '.', '')                   AS dx,
        CAST(d.date_serv AS DATE)                                   AS date_serv,
        CAST(p.birth AS DATE)                                       AS birth,
        coalesce(p.typearea, '9')                                   AS typearea
    FROM diagnosis_opd d
    INNER JOIN person p
        ON d.hospcode = p.hospcode AND d.pid = p.pid
    INNER JOIN chospital ch
        ON d.hospcode = ch.hoscode
    INNER JOIN campur ca
        ON concat(ch.provcode, ch.distcode) = ca.ampurcodefull
    WHERE
        -- CAST(d.date_serv AS DATE) BETWEEN DATE '2025-10-01' AND DATE '2026-09-30'
        d.pid IS NOT NULL
        AND d.diagcode IS NOT NULL
),

dx_coded AS (
    SELECT
        ampurname,
        hoscode,
        hosname,
        person_key,
        typearea,
        date_diff('year', birth, date_serv) AS age_years,
        CASE
            WHEN dx LIKE 'F341%' THEN 'F341'
            WHEN dx LIKE 'F638%' THEN 'F638'
            WHEN dx LIKE 'F988%' THEN 'F988'
            ELSE substr(dx, 1, 3)
        END AS code
    FROM dx_base
),

dx_categorized AS (
    SELECT
        ampurname,
        hoscode,
        hosname,
        person_key,
        typearea,
        age_years,
        code,
        CASE
            WHEN code BETWEEN 'F00' AND 'F03' THEN 'โรคสมองเสื่อม (F00-F03)'
            WHEN code = 'F10' THEN 'ติดแอลกอฮอล์ (F10)'
            WHEN code = 'F15' THEN 'ติดยาบ้า Amphetamine (F15)'
            WHEN code IN ('F11','F12','F13','F14','F16','F17','F18','F19')
                THEN 'ติดสารเสพติดอื่นๆ (F11,F12,F13,F14,F16,F17,F18,F19)'
            WHEN code = 'F20' THEN 'โรคจิตเภท (F20)'
            WHEN code BETWEEN 'F21' AND 'F29' THEN 'โรคจิตอื่นๆ (F21-F29)'
            WHEN code = 'F31' THEN 'โรคอารมณ์สองขั้ว (F31)'
            WHEN code IN ('F32','F33','F341','F38','F39')
                THEN 'โรคซึมเศร้า (F32,F33,F341,F38,F39)'
            WHEN code BETWEEN 'F40' AND 'F48' THEN 'โรควิตกกังวล (F40-F48)'
            WHEN code BETWEEN 'F70' AND 'F79' THEN 'ความบกพร่องทางสติปัญญา (F70-F79)'
            WHEN code = 'F81' THEN 'ความบกพร่องทางการเรียนรู้ (F81)'
            WHEN code = 'F84' THEN 'โรคออทิสติก (F84)'
            WHEN code = 'F90' THEN 'โรคสมาธิสั้น (F90)'
            WHEN code BETWEEN 'X60' AND 'X84' THEN 'พยายามฆ่าตัวตาย/ตั้งใจทำร้ายตนเอง (X60-X84)'
            WHEN code = 'F638' AND age_years >= 15 THEN 'ผู้ป่วยติดเกมส์ในผู้ใหญ่ 15 ปีขึ้นไป (F638)'
            WHEN code = 'F988' AND age_years < 15  THEN 'ผู้ป่วยติดเกมส์ในเด็ก ต่ำกว่า 15 ปี (F988)'
            WHEN code BETWEEN 'G40' AND 'G41' THEN 'โรคลมชัก (G40-G41)'
            WHEN code IN (
                'F04','F05','F06','F07','F09',
                'F50','F51','F52','F53','F54','F55','F56','F57','F58','F59',
                'F60','F61','F62','F63','F64','F65','F66','F67','F68','F69',
                'F80','F82','F83','F88','F89',
                'F91','F92','F93','F94','F95','F96','F97','F98','F99'
            ) AND code NOT IN ('F638','F988')
                THEN 'โรคทางจิตเวชอื่นๆ (F04-F09,F50-F69,F80,F82-F83,F88-F89,F91-F99 ยกเว้น F638,F988)'
            ELSE NULL
        END AS category
    FROM dx_coded
),

dx_qualified AS (
    SELECT
        ampurname,
        hoscode,
        hosname,
        person_key,
        typearea,
        CASE
            WHEN age_years IS NULL THEN 'ไม่ทราบ'
            WHEN age_years < 15 THEN '0-14 ปี'
            WHEN age_years < 30 THEN '15-29 ปี'
            WHEN age_years < 45 THEN '30-44 ปี'
            WHEN age_years < 60 THEN '45-59 ปี'
            WHEN age_years < 75 THEN '60-74 ปี'
            ELSE '75 ปีขึ้นไป'
        END AS age_band,
        category,
        code
    FROM dx_categorized
    WHERE category IS NOT NULL
),

dx_code_level AS (
    SELECT 'code' AS level, 'DIAGNOSIS_OPD' AS source, ampurname, hoscode, hosname, category, code,
           typearea, age_band, COUNT(DISTINCT person_key) AS patient_count
    FROM dx_qualified
    GROUP BY ampurname, hoscode, hosname, category, code, typearea, age_band
),
dx_category_level AS (
    SELECT 'category' AS level, 'DIAGNOSIS_OPD' AS source, ampurname, hoscode, hosname, category, 'ALL' AS code,
           typearea, age_band, COUNT(DISTINCT person_key) AS patient_count
    FROM dx_qualified
    GROUP BY ampurname, hoscode, hosname, category, typearea, age_band
),
dx_overall_level AS (
    SELECT 'overall' AS level, 'DIAGNOSIS_OPD' AS source, ampurname, hoscode, hosname, 'ALL' AS category, 'ALL' AS code,
           typearea, age_band, COUNT(DISTINCT person_key) AS patient_count
    FROM dx_qualified
    GROUP BY ampurname, hoscode, hosname, typearea, age_band
),

specialpp_base AS (
    SELECT DISTINCT
        ca.ampurname,
        ch.hoscode,
        ch.hosname,
        concat(coalesce(s.hospcode, ''), '|', coalesce(s.pid, '')) AS person_key,
        upper(trim(s.ppspecial))                                   AS code,
        CAST(s.date_serv AS DATE)                                  AS date_serv,
        CAST(p.birth AS DATE)                                      AS birth,
        coalesce(p.typearea, '9')                                  AS typearea
    FROM specialpp s
    INNER JOIN person p
        ON s.hospcode = p.hospcode AND s.pid = p.pid
    INNER JOIN chospital ch
        ON s.hospcode = ch.hoscode
    INNER JOIN campur ca
        ON concat(ch.provcode, ch.distcode) = ca.ampurcodefull
    WHERE
        s.pid IS NOT NULL
        AND upper(trim(s.ppspecial)) IN ('1B030', '1B031', '1B032', '1B033', '1B036', '1B037')
),

specialpp_qualified AS (
    SELECT
        ampurname,
        hoscode,
        hosname,
        person_key,
        typearea,
        CASE
            WHEN date_diff('year', birth, date_serv) IS NULL THEN 'ไม่ทราบ'
            WHEN date_diff('year', birth, date_serv) < 15 THEN '0-14 ปี'
            WHEN date_diff('year', birth, date_serv) < 30 THEN '15-29 ปี'
            WHEN date_diff('year', birth, date_serv) < 45 THEN '30-44 ปี'
            WHEN date_diff('year', birth, date_serv) < 60 THEN '45-59 ปี'
            WHEN date_diff('year', birth, date_serv) < 75 THEN '60-74 ปี'
            ELSE '75 ปีขึ้นไป'
        END AS age_band,
        CASE code
            WHEN '1B030' THEN 'ประเมินความเสี่ยง SMI-V: ทำร้ายตนเองรุนแรง (1B030)'
            WHEN '1B031' THEN 'ประเมินความเสี่ยง SMI-V: ทำร้ายผู้อื่น/ก่อเหตุรุนแรง (1B031)'
            WHEN '1B032' THEN 'ประเมินความเสี่ยง SMI-V: หลงผิด มุ่งร้ายเฉพาะเจาะจง (1B032)'
            WHEN '1B033' THEN 'ประเมินความเสี่ยง SMI-V: ก่อคดีอาชญากรรมรุนแรง (1B033)'
            WHEN '1B036' THEN 'ประเมินความเสี่ยง SMI-V: พบว่าปกติ (1B036)'
            WHEN '1B037' THEN 'ประเมินความเสี่ยง SMI-V: ก่อเหตุรุนแรงแล้ว ได้รับการติดตาม (1B037)'
        END AS category,
        code
    FROM specialpp_base
),

pp_code_level AS (
    SELECT 'code' AS level, 'SPECIALPP' AS source, ampurname, hoscode, hosname, category, code,
           typearea, age_band, COUNT(DISTINCT person_key) AS patient_count
    FROM specialpp_qualified
    GROUP BY ampurname, hoscode, hosname, category, code, typearea, age_band
),
pp_category_level AS (
    -- category is already 1:1 with code for SPECIALPP, but emitted for a
    -- uniform schema so the frontend never special-cases the source.
    SELECT 'category' AS level, 'SPECIALPP' AS source, ampurname, hoscode, hosname, category, 'ALL' AS code,
           typearea, age_band, COUNT(DISTINCT person_key) AS patient_count
    FROM specialpp_qualified
    GROUP BY ampurname, hoscode, hosname, category, typearea, age_band
),
pp_overall_level AS (
    SELECT 'overall' AS level, 'SPECIALPP' AS source, ampurname, hoscode, hosname, 'ALL' AS category, 'ALL' AS code,
           typearea, age_band, COUNT(DISTINCT person_key) AS patient_count
    FROM specialpp_qualified
    GROUP BY ampurname, hoscode, hosname, typearea, age_band
),

unioned AS (
    SELECT * FROM dx_code_level
    UNION ALL SELECT * FROM dx_category_level
    UNION ALL SELECT * FROM dx_overall_level
    UNION ALL SELECT * FROM pp_code_level
    UNION ALL SELECT * FROM pp_category_level
    UNION ALL SELECT * FROM pp_overall_level
)

SELECT
    level,
    source,
    ampurname AS ampur,
    hoscode,
    hosname,
    category,
    code,
    typearea,
    CASE typearea
        WHEN '1' THEN '1: ในเขต มีชื่อ+อยู่จริง'
        WHEN '2' THEN '2: ในเขต มีชื่อ แต่ไม่อยู่จริง'
        WHEN '3' THEN '3: อาศัยในเขต ทะเบียนบ้านอยู่นอกเขต'
        WHEN '4' THEN '4: นอกเขต มารับบริการ/เคยอยู่ในเขต'
        ELSE 'อื่นๆ/ไม่ทราบ'
    END AS typearea_label,
    age_band,
    patient_count
FROM unioned
ORDER BY level, source, ampur, hosname, category, code, typearea, age_band
) TO 'hippo-hdc-summary.csv' (HEADER, DELIMITER ',');

-- After export, move/copy the file into the Next.js project as:
--   donezo-dashboard/public/data/hippo-hdc-summary.csv
