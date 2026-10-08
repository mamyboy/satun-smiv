#!/usr/bin/env python3
"""
สร้างไฟล์ข้อมูล Dashboard ประชากร (MIS Health · ข้อมูลพื้นฐาน → ประชากร)

อินพุต (ไฟล์ดิบที่ดึงจากแหล่งจริง ไม่มี CID/ข้อมูลรายบุคคล):
  data/mis-raw/hdc-population.json   ← ผล SQL scripts/sql/mis-population-hdc*.sql บน hippo DuckDB (HDC 43 แฟ้ม)
  data/mis-raw/bora-population.json  ← API สถิติทะเบียนราษฎร stat.bora.dopa.go.th (statpophouse / stattranall)
  data/mis-raw/le-hale-bod.json      ← ชีตข้อมูลของ le-hale.bodthai.net (IHPP/BOD)

เอาต์พุต:
  public/data/mis/population.json    ← หน้าเว็บ fetch ไปคำนวณ/กรองเองทุกระดับ

รัน: python3 scripts/mis-build-population.py
"""
import json
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RAW = os.path.join(ROOT, "data", "mis-raw")
OUT = os.path.join(ROOT, "public", "data", "mis", "population.json")


def load(name):
    with open(os.path.join(RAW, name), encoding="utf-8") as f:
        return json.load(f)


hdc = load("hdc-population.json")
bora = load("bora-population.json")
bod = load("le-hale-bod.json")

# ---------------------------------------------------------------- HDC
lk = hdc["lk"]
hostype_name = {r[0]: r[1].strip() for r in lk["chostype"]}
amp_name = {r[0]: r[1] for r in hdc["amp"]}
tmb_name = {r[0]: r[1] for r in hdc["tmb"]}
vil_name = {r[0]: r[1] for r in hdc["vil"]}

hosp_rows = sorted(hdc["hosp"], key=lambda r: (r[3], r[2], r[0]))
hosp = [
    {"code": r[0], "name": r[1].strip(), "type": r[2], "amp": r[3], "tmb": "91" + r[3] + r[4]}
    for r in hosp_rows
]
hosp_ix = {h["code"]: i for i, h in enumerate(hosp)}

# สัญชาติ: เรียงไทยก่อน แล้วตามจำนวนแถว (index ลงใน hdc.nations)
nat_label = {r[0]: r[1] for r in lk["cnation"]}
c = hdc["cube"]
ci = {n: i for i, n in enumerate(c["cols"])}
_nat_n = {}
for r in c["rows"]:
    _nat_n[r[ci["n"]]] = _nat_n.get(r[ci["n"]], 0) + int(r[ci["u"]])
nations = sorted(_nat_n, key=lambda k: (k != "099", -_nat_n[k], k))
for tbl in ("village", "attr"):
    for r in hdc[tbl]["rows"]:
        n = r[hdc[tbl]["cols"].index("n")]
        if n not in nations:
            nations.append(n)
nat_ix = {k: i for i, k in enumerate(nations)}
cube = []
for r in c["rows"]:
    if r[ci["s"]] not in ("1", "2"):
        sex = 9
    else:
        sex = int(r[ci["s"]])
    cube.append([
        hosp_ix[r[ci["h"]]], int(r[ci["t"]]), sex, int(r[ci["g"]]),
        int(r[ci["u"]]), int(r[ci["a13"]]), int(r[ci["p13"]]), int(r[ci["a12"]]), int(r[ci["p12"]]),
        int(r[ci["a4"]]), int(r[ci["p4"]]), int(r[ci["p4x"]]), nat_ix[r[ci["n"]]],
    ])

v = hdc["village"]
vi = {n: i for i, n in enumerate(v["cols"])}
village = []
for r in v["rows"]:
    sex = int(r[vi["s"]]) if r[vi["s"]] in ("1", "2") else 9
    village.append([r[vi["v"]], sex, int(r[vi["g"]]), int(r[vi["v13"]]), int(r[vi["t13"]]), nat_ix[r[vi["n"]]]])

a = hdc["attr"]
ai = {n: i for i, n in enumerate(a["cols"])}
attr = []
for r in a["rows"]:
    sex = int(r[ai["s"]]) if r[ai["s"]] in ("1", "2") else 9
    attr.append([r[ai["a"]], r[ai["k"]], r[ai["c"]] or "", sex, int(r[ai["a13"]]), int(r[ai["p13"]]), nat_ix[r[ai["n"]]]])

hh = hdc["household"]
hi = {n: i for i, n in enumerate(hh["cols"])}
household = [[r[hi["v"]], int(r[hi["sz"]]), int(r[hi["houses"]]), int(r[hi["persons"]])] for r in hh["rows"]]

attr_labels = {
    "religion": {x[0]: x[1] for x in lk["creligion"]},
    "abo": {x[0]: x[1] for x in lk["cabogroup"]},
    "rh": {x[0]: ("Rh+" if x[1] == "positive" else "Rh−") for x in lk["crhgroup"]},
    "mstatus": {x[0]: x[1] for x in lk["cmstatus"]},
    "education": {x[0]: x[1] for x in lk["ceducation"]},
    "occupation": {x[0]: x[1] for x in lk["coccupation_new"]},
    "race": {x[0]: x[2] for x in lk["crace"]},
}

villages_used = sorted({r[0] for r in village} | {r[0] for r in household})
tambons_used = sorted({x[:6] for x in villages_used} | {h["tmb"] for h in hosp})

# ---------------------------------------------------------------- BORA
def fold_ages(arr):
    """BORA lsAge0..lsAge101: 0..100 = อายุเต็มปี, 101 = มากกว่า 100 ปี → รวมเป็น 100+ (ดัชนี 100)."""
    out = list(arr[:101])
    out[100] = arr[100] + arr[101]
    return out


def by_sex(d):
    return {"1": fold_ages(d["1"]), "2": fold_ages(d["2"])}


offices = [{"rcode": o["rcode"], "name": o["name"], "amp": str(o["aa"][0]).zfill(2)} for o in bora["offices"]]
tambon_bora = {}
for t in bora["tambon_thai"]:
    code = t["tt"][:6]
    cur = tambon_bora.setdefault(code, {"name": t["name"].replace("ตำบล", "").strip(), "amp": code[2:4], "1": [0] * 101, "2": [0] * 101})
    for s in ("1", "2"):
        for i, n in enumerate(fold_ages(t["ages"][s])):
            cur[s][i] += n

months = sorted(bora["pop_month_thai"].keys(), key=int)
pop_month = [
    {"ym": int(m), "m": sum(bora["pop_month_thai"][m]["1"]), "f": sum(bora["pop_month_thai"][m]["2"])}
    for m in months
]


def fy_of(ym):
    y, m = divmod(int(ym), 100)
    return 2500 + (y + 1 if m >= 10 else y)


deaths_fy = {}
for m, d in bora["death_age_month"].items():
    fy = str(fy_of(m))
    cur = deaths_fy.setdefault(fy, {"1": [0] * 101, "2": [0] * 101, "months": 0})
    cur["months"] += 1
    for s in ("1", "2"):
        for i, n in enumerate(fold_ages(d[s])):
            cur[s][i] += n
deaths_fy = {k: v for k, v in deaths_fy.items() if v["months"] == 12}

# ประชากรกลางปีงบ = ประชากร ณ สิ้นเดือนมีนาคม (เดือนที่ 6 ของปีงบประมาณ)
midyear = {}
for fy in deaths_fy:
    ym = str((int(fy) - 2500) * 100 + 3)
    if ym in bora["pop_month_thai"]:
        midyear[fy] = by_sex(bora["pop_month_thai"][ym])

vital = {}
for key, src in (("birth", "statbirth"), ("death", "statdeath"), ("movein", "statmovein"), ("moveout", "statmoveout")):
    for r in bora["vital_month"][src]:
        row = vital.setdefault(r["lsyymm"], {"ym": r["lsyymm"]})
        if key == "birth":
            row[key] = [r["lssumtotalBoy"], r["lssumtotalGirl"]]
        else:
            row[key] = [r["lssumtotMale"], r["lssumtotFemale"]]
vital_month = [vital[k] for k in sorted(vital)]

# จำนวนบ้าน (stathouse, ค่า "หลัง" = lssumnotTermDate) — สำนักทะเบียน / ตำบล / รายเดือน
office_amp = {o["rcode"]: amp for o, amp in ((o, str(o["aa"][0]).zfill(2)) for o in bora["offices"])}
house_tambon = {}
for rc, rows in bora["house"]["tambon"].items():
    for tt, _desc, n in rows:
        code = "91" + office_amp[rc] + str(tt).zfill(2)
        house_tambon[code] = house_tambon.get(code, 0) + n
house = {
    "office": bora["house"]["office"],
    "tambon": house_tambon,
    "month": [{"ym": ym, "n": n} for ym, n in bora["house"]["month"]],
}

# ---------------------------------------------------------------- LE/HALE (BOD)
def bod_rows(rows, prov=None):
    out = []
    for r in rows:
        if prov is not None and r.get("post_code") != prov:
            continue
        out.append({"year": int(r["year"]), "age": int(r["age_type"]), "sex": int(r["sex"]),
                    "le": round(r["LE"], 2), "hale": round(r["HALE"], 2)})
    return sorted(out, key=lambda x: (x["year"], x["age"], x["sex"]))


q = hdc["quality"]
data = {
    "meta": {
        "province": "สตูล",
        "provcode": "91",
        "hdc": {
            "source": "HDC 43 แฟ้ม — hippo.moph.go.th (DuckDB, ไลบรารี hdc 0.6.7)",
            "tables": ["person", "chospital", "campur", "ctambon", "cvillage", "home"],
            "dataDate": "2026-09-30",
            "hdcDate": q["hdc_date"][:10],
            "ageRefDate": "2026-09-30",
            "sql": [
                "scripts/sql/mis-population-hdc.sql",
                "scripts/sql/mis-population-hdc-village.sql",
                "scripts/sql/mis-population-hdc-attr.sql",
                "scripts/sql/mis-population-hdc-household.sql",
            ],
        },
        "bora": {
            "source": "สถิติประชากรทางการทะเบียนราษฎร (รายเดือน) — สำนักบริหารการทะเบียน กรมการปกครอง",
            "url": "https://stat.bora.dopa.go.th/stat/statnew/statMONTH/statmonth/#/mainpage",
            "latest": bora["latest"],
            "fetched": bora["fetched"],
            "popDefinition": "ประชากรสัญชาติไทยที่มีชื่ออยู่ในทะเบียนบ้าน (ไม่รวมทะเบียนบ้านกลาง / ระหว่างการย้าย)",
        },
        "bod": {
            "source": "อายุคาดเฉลี่ย (LE) และอายุคาดเฉลี่ยของการมีสุขภาวะ (HALE) — สำนักงานพัฒนานโยบายสุขภาพระหว่างประเทศ (IHPP) กลุ่มงานพัฒนาดัชนีภาระโรค (BOD)",
            "url": "https://le-hale.bodthai.net/",
            "sheetId": bod["sheetId"],
        },
    },
    "hdc": {
        "amp": [{"code": k, "name": amp_name[k]} for k in sorted(amp_name)],
        "tmb": {k: tmb_name[k] for k in tambons_used if k in tmb_name},
        "vil": {k: vil_name.get(k, k) for k in villages_used},
        "hostype": {h["type"]: hostype_name.get(h["type"], h["type"]) for h in hosp},
        "hosp": hosp,
        "cube": cube,
        "village": village,
        "household": household,
        "householdMeta": hdc["household_meta"],
        "nations": [{"code": k, "name": nat_label.get(k, "ไม่บันทึก" if k == "" else f"รหัส {k}")} for k in nations],
        "attr": attr,
        "attrLabels": attr_labels,
        "quality": q,
    },
    "bora": {
        "offices": offices,
        "prov": by_sex(bora["prov_thai"]),
        "provAll": by_sex(bora["prov_all"]),
        "provCentral": by_sex(bora["prov_central_thai"]),
        "provMoving": by_sex(bora["prov_moving_thai"]),
        "office": {k: by_sex(v) for k, v in bora["office_thai"].items()},
        "tambon": tambon_bora,
        "popMonth": pop_month,
        "vitalMonth": vital_month,
        "deathsFY": {k: {"1": v["1"], "2": v["2"]} for k, v in sorted(deaths_fy.items())},
        "midyearFY": dict(sorted(midyear.items())),
        "house": house,
    },
    "bod": {
        "satun": bod_rows(bod["province"], 91.0),
        "thailand": bod_rows(bod["country"]),
    },
}

os.makedirs(os.path.dirname(OUT), exist_ok=True)
with open(OUT, "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False, separators=(",", ":"))

# ---------------------------------------------------------------- self-checks (ตรวจกระทบยอดกับแหล่ง)
TH = nat_ix["099"]
p13 = sum(r[6] for r in cube if r[12] == TH)
p12 = sum(r[8] for r in cube if r[12] == TH)
assert p13 == q["thai_alive_13_rows"][1], (p13, q["thai_alive_13_rows"])
assert p12 == q["thai_alive_12_rows"][1], (p12, q["thai_alive_12_rows"])
p4 = sum(r[10] for r in cube)
p4x = sum(r[11] for r in cube)
assert p4x <= p4 and sum(r[9] for r in cube) >= p4
prov_total = sum(map(sum, data["bora"]["prov"].values()))
assert prov_total == sum(sum(map(sum, (o["1"], o["2"]))) for o in data["bora"]["office"].values())
assert prov_total == sum(sum(t["1"]) + sum(t["2"]) for t in tambon_bora.values())
assert sum(house["office"].values()) == sum(house_tambon.values()) == house["month"][-1]["n"]
assert set(house_tambon) <= set(tambon_bora), set(house_tambon) - set(tambon_bora)
print(f"wrote {OUT} ({os.path.getsize(OUT)/1024:.0f} KB)")
print(f"nations={len(nations)} households={sum(r[2] for r in household):,} BORA houses={sum(house['office'].values()):,}")
print(f"HDC(ไทย) p13={p13:,} p12={p12:,} | all p4={p4:,} p4x={p4x:,} | BORA Thai {bora['latest']}={prov_total:,} | FY deaths={list(deaths_fy)} midyear={list(midyear)}")
