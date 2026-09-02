-- =====================================================================
-- HIPPO HDC — SMI-V × ICD-10 Co-occurrence Cross-tab (person-level join)
-- =====================================================================
-- Answers: "of the people flagged with SPECIALPP code X (e.g. 1B030),
-- how many also carry ICD-10-TM diagnosis code Y (e.g. F11)?"
--
-- This is DIFFERENT from hippo-hdc-summary.sql: that file aggregates
-- DIAGNOSIS_OPD and SPECIALPP independently (never joined), so it can
-- never answer "did the same person have both a diagnosis code AND a
-- SMI-V risk code". This query explicitly joins the two on person_key
-- (hospcode||pid) so the count is COUNT(DISTINCT person) who has BOTH.
--
-- OUTPUT SCHEMA (long format, one row per specialpp_code × icd_code
-- combination that actually occurs — zero-count pairs are omitted,
-- the frontend fills them in as "-"):
--
--   ampur          -> อำเภอ (of the service visit where the SPECIALPP code was recorded)
--   specialpp_code -> 1B030 | 1B031 | 1B032 | 1B033 | 1B036 | 1B037
--   specialpp_label-> Thai label for the code above
--   icd_code       -> 3-char ICD-10-TM root (F11, F12, X60, ...)
--   icd_category   -> human-readable disease-group label for icd_code
--   patient_count  -> COUNT(DISTINCT person_key) who has BOTH codes
--
-- After running, place the CSV at:
--   donezo-dashboard/public/data/hippo-hdc-crosstab.csv
-- =====================================================================

COPY (
WITH pp_base AS (
    SELECT DISTINCT
        ca.ampurname,
        concat(coalesce(s.hospcode, ''), '|', coalesce(s.pid, '')) AS person_key,
        upper(trim(s.ppspecial))                                   AS specialpp_code
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

dx_base AS (
    SELECT DISTINCT
        concat(coalesce(d.hospcode, ''), '|', coalesce(d.pid, '')) AS person_key,
        CASE
            WHEN replace(upper(trim(d.diagcode)), '.', '') LIKE 'F341%' THEN 'F341'
            WHEN replace(upper(trim(d.diagcode)), '.', '') LIKE 'F638%' THEN 'F638'
            WHEN replace(upper(trim(d.diagcode)), '.', '') LIKE 'F988%' THEN 'F988'
            ELSE substr(replace(upper(trim(d.diagcode)), '.', ''), 1, 3)
        END AS icd_code
    FROM diagnosis_opd d
    WHERE d.pid IS NOT NULL AND d.diagcode IS NOT NULL
),

dx_categorized AS (
    SELECT
        person_key,
        icd_code,
        CASE
            WHEN icd_code BETWEEN 'F00' AND 'F03' THEN 'โรคสมองเสื่อม (F00-F03)'
            WHEN icd_code = 'F10' THEN 'ติดแอลกอฮอล์ (F10)'
            WHEN icd_code = 'F15' THEN 'ติดยาบ้า Amphetamine (F15)'
            WHEN icd_code IN ('F11','F12','F13','F14','F16','F17','F18','F19')
                THEN 'ติดสารเสพติดอื่นๆ (F11,F12,F13,F14,F16,F17,F18,F19)'
            WHEN icd_code = 'F20' THEN 'โรคจิตเภท (F20)'
            WHEN icd_code BETWEEN 'F21' AND 'F29' THEN 'โรคจิตอื่นๆ (F21-F29)'
            WHEN icd_code = 'F31' THEN 'โรคอารมณ์สองขั้ว (F31)'
            WHEN icd_code IN ('F32','F33','F341','F38','F39')
                THEN 'โรคซึมเศร้า (F32,F33,F341,F38,F39)'
            WHEN icd_code BETWEEN 'F40' AND 'F48' THEN 'โรควิตกกังวล (F40-F48)'
            WHEN icd_code BETWEEN 'F70' AND 'F79' THEN 'ความบกพร่องทางสติปัญญา (F70-F79)'
            WHEN icd_code = 'F81' THEN 'ความบกพร่องทางการเรียนรู้ (F81)'
            WHEN icd_code = 'F84' THEN 'โรคออทิสติก (F84)'
            WHEN icd_code = 'F90' THEN 'โรคสมาธิสั้น (F90)'
            WHEN icd_code BETWEEN 'X60' AND 'X84' THEN 'พยายามฆ่าตัวตาย/ตั้งใจทำร้ายตนเอง (X60-X84)'
            WHEN icd_code = 'F638' THEN 'ผู้ป่วยติดเกมส์ในผู้ใหญ่ 15 ปีขึ้นไป (F638)'
            WHEN icd_code = 'F988' THEN 'ผู้ป่วยติดเกมส์ในเด็ก ต่ำกว่า 15 ปี (F988)'
            WHEN icd_code BETWEEN 'G40' AND 'G41' THEN 'โรคลมชัก (G40-G41)'
            WHEN icd_code IN (
                'F04','F05','F06','F07','F09',
                'F50','F51','F52','F53','F54','F55','F56','F57','F58','F59',
                'F60','F61','F62','F63','F64','F65','F66','F67','F68','F69',
                'F80','F82','F83','F88','F89',
                'F91','F92','F93','F94','F95','F96','F97','F98','F99'
            ) AND icd_code NOT IN ('F638','F988')
                THEN 'โรคทางจิตเวชอื่นๆ (F04-F09,F50-F69,F80,F82-F83,F88-F89,F91-F99 ยกเว้น F638,F988)'
            ELSE NULL
        END AS icd_category
    FROM dx_base
),

dx_qualified AS (
    SELECT person_key, icd_code, icd_category
    FROM dx_categorized
    WHERE icd_category IS NOT NULL
),

joined AS (
    -- INNER JOIN: only people who have BOTH a SPECIALPP risk code and a
    -- qualifying ICD-10-TM diagnosis appear here — this is the co-occurrence.
    SELECT
        pp.ampurname AS ampur,
        pp.specialpp_code,
        pp.person_key,
        dx.icd_code,
        dx.icd_category
    FROM pp_base pp
    INNER JOIN dx_qualified dx
        ON pp.person_key = dx.person_key
)

SELECT
    ampur,
    specialpp_code,
    CASE specialpp_code
        WHEN '1B030' THEN 'ทำร้ายตนเองรุนแรง (1B030)'
        WHEN '1B031' THEN 'ทำร้ายผู้อื่น/ก่อเหตุรุนแรง (1B031)'
        WHEN '1B032' THEN 'หลงผิด มุ่งร้ายเฉพาะเจาะจง (1B032)'
        WHEN '1B033' THEN 'ก่อคดีอาชญากรรมรุนแรง (1B033)'
        WHEN '1B036' THEN 'พบว่าปกติ (1B036)'
        WHEN '1B037' THEN 'ก่อเหตุรุนแรงแล้ว ได้รับการติดตาม (1B037)'
    END AS specialpp_label,
    icd_code,
    icd_category,
    COUNT(DISTINCT person_key) AS patient_count
FROM joined
GROUP BY ampur, specialpp_code, icd_code, icd_category
ORDER BY ampur, specialpp_code, icd_code
) TO 'hippo-hdc-crosstab.csv' (HEADER, DELIMITER ',');

-- After export, move/copy the file into the Next.js project as:
--   donezo-dashboard/public/data/hippo-hdc-crosstab.csv
