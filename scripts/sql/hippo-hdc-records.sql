-- =====================================================================
-- HIPPO HDC — RAW RECORD-LEVEL EXPORT, UNGROUPED CODES
-- =====================================================================
-- One row per (person, code) occurrence, straight from diagnosis_opd /
-- specialpp, with the EXACT ICD-10-TM / PPSPECIAL code kept as-is — NOT
-- rolled up into a disease-group label. The frontend can group codes
-- into categories itself (client-side lookup table) or filter/pivot on
-- the raw code directly. No GROUP BY, no COUNT — every row is a real
-- record that passed the WHERE scope below.
--
-- SCOPE (still limited to the SMI-V-related universe, not all of
-- diagnosis_opd — otherwise this is every OPD visit in the province):
--   DIAGNOSIS_OPD -> diagcode root falls in one of the mental-health /
--                    self-harm / substance-use ICD-10-TM ranges listed
--                    in RELEVANT_ICD_PREFIXES below (same clinical scope
--                    as hippo-hdc-summary.sql, just not re-labeled).
--   SPECIALPP     -> ppspecial IN ('1B030','1B031','1B032','1B033',
--                    '1B036','1B037','1B038') (SMI-V risk screening codes)
--
-- OUTPUT SCHEMA:
--   person_id      -> anonymized per-person integer id (dense_rank over
--                      hospcode||pid). NEVER the real pid/hospcode — this
--                      file is committed to a public git repo and served
--                      as a static asset. Same person keeps the same
--                      person_id across DIAGNOSIS_OPD and SPECIALPP rows,
--                      so the frontend CAN cross-join/dedupe if needed.
--   source         -> 'DIAGNOSIS_OPD' | 'SPECIALPP'
--   ampur          -> อำเภอ (of the service visit)
--   hoscode        -> รหัสหน่วยบริการ
--   hosname        -> ชื่อหน่วยบริการ
--   code           -> EXACT diagcode (DIAGNOSIS_OPD, full code incl.
--                      decimal e.g. 'F32.1') or ppspecial (SPECIALPP,
--                      e.g. '1B030') — raw, ungrouped
--   date_serv      -> วันที่ให้บริการ (YYYY-MM-DD) — เพิ่มเพื่อให้ frontend
--                      กรองตามช่วงวันที่ได้ (date range filter)
--   typearea       -> 1 | 2 | 3 | 4 | 9 (raw person.TYPEAREA code)
--   typearea_label -> Thai label for the above
--   age_band       -> 0-14 / 15-29 / 30-44 / 45-59 / 60-74 / 75+ / ไม่ทราบ
--
-- HOW THE FRONTEND SHOULD USE THIS:
-- To count "patients" for ANY chosen row/col/filter combo, group the
-- filtered rows by that combo and take COUNT(DISTINCT person_id) — never
-- COUNT(*), since one person can have multiple code rows. Disease-group
-- labels (e.g. "โรคซึมเศร้า") are a client-side lookup keyed off the raw
-- `code` prefix — see HIPPO_ICD_CATEGORY_MAP in dashboard-shell.tsx.
--
-- After running, place the CSV at:
--   donezo-dashboard/public/data/hippo-hdc-records.csv
-- =====================================================================

COPY (
WITH dx_base AS (
    SELECT DISTINCT
        ca.ampurname,
        ch.hoscode,
        ch.hosname,
        concat(coalesce(d.hospcode, ''), '|', coalesce(d.pid, '')) AS person_key,
        upper(trim(d.diagcode))                                     AS diagcode_raw,
        replace(upper(trim(d.diagcode)), '.', '')                   AS diagcode_norm,
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

-- Same clinical scope as hippo-hdc-summary.sql's category CASE, just
-- used here as an inclusion filter instead of a re-label.
dx_scoped AS (
    SELECT
        ampurname, hoscode, hosname, person_key, typearea, diagcode_raw, date_serv,
        date_diff('year', birth, date_serv) AS age_years,
        CASE WHEN diagcode_norm LIKE 'F341%' THEN 'F341'
             WHEN diagcode_norm LIKE 'F638%' THEN 'F638'
             WHEN diagcode_norm LIKE 'F988%' THEN 'F988'
             ELSE substr(diagcode_norm, 1, 3) END AS root3
    FROM dx_base
),

dx_records AS (
    SELECT DISTINCT
        'DIAGNOSIS_OPD' AS source,
        ampurname AS ampur, hoscode, hosname,
        diagcode_raw AS code,
        date_serv,
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
        person_key
    FROM dx_scoped
    WHERE
        root3 BETWEEN 'F00' AND 'F03'
        OR root3 IN ('F10', 'F15', 'F20', 'F31', 'F81', 'F84', 'F90', 'F638', 'F988')
        OR root3 IN ('F11','F12','F13','F14','F16','F17','F18','F19')
        OR root3 BETWEEN 'F21' AND 'F29'
        OR root3 IN ('F32','F33','F341','F38','F39')
        OR root3 BETWEEN 'F40' AND 'F48'
        OR root3 BETWEEN 'F70' AND 'F79'
        OR root3 BETWEEN 'X60' AND 'X84'
        OR root3 BETWEEN 'G40' AND 'G41'
        OR root3 IN (
            'F04','F05','F06','F07','F09',
            'F50','F51','F52','F53','F54','F55','F56','F57','F58','F59',
            'F60','F61','F62','F63','F64','F65','F66','F67','F68','F69',
            'F80','F82','F83','F88','F89',
            'F91','F92','F93','F94','F95','F96','F97','F98','F99'
        )
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
        AND upper(trim(s.ppspecial)) IN ('1B030', '1B031', '1B032', '1B033', '1B036', '1B037', '1B038')
),

pp_records AS (
    SELECT DISTINCT
        'SPECIALPP' AS source,
        ampurname AS ampur, hoscode, hosname,
        code,
        date_serv,
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
        person_key
    FROM specialpp_base
),

all_records AS (
    SELECT * FROM dx_records
    UNION ALL
    SELECT * FROM pp_records
),

with_anon_id AS (
    SELECT
        dense_rank() OVER (ORDER BY person_key) AS person_id,
        source, ampur, hoscode, hosname, code, date_serv, typearea, age_band
    FROM all_records
)

SELECT
    person_id,
    source,
    ampur,
    hoscode,
    hosname,
    code,
    date_serv,
    typearea,
    CASE typearea
        WHEN '1' THEN '1: ในเขต มีชื่อ+อยู่จริง'
        WHEN '2' THEN '2: ในเขต มีชื่อ แต่ไม่อยู่จริง'
        WHEN '3' THEN '3: อาศัยในเขต ทะเบียนบ้านอยู่นอกเขต'
        WHEN '4' THEN '4: นอกเขต มารับบริการ/เคยอยู่ในเขต'
        ELSE 'อื่นๆ/ไม่ทราบ'
    END AS typearea_label,
    age_band
FROM with_anon_id
ORDER BY person_id, source, code
) TO 'hippo-hdc-records.csv' (HEADER, DELIMITER ',');

-- After export, move/copy the file into the Next.js project as:
--   donezo-dashboard/public/data/hippo-hdc-records.csv
--
-- This is the single raw data source /hippo-hdc reads from — the
-- frontend derives disease-group labels, pivots, and cross-tabs from
-- this file client-side. Replaces hippo-hdc-summary.csv and
-- hippo-hdc-crosstab.csv.
