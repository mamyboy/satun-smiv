"use client";

import { RotateCcw, SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { AGE_PRESETS, DEFAULT_FILTERS, LEVEL_LABEL, levelOf, type Filters, type PopulationData, type TypeSet } from "@/lib/mis/population";
import { SegmentedTabs } from "../segmented-tabs";

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "h-7 shrink-0 rounded-full border px-3 text-[11.5px] font-medium transition-colors duration-200",
        active ? "border-mis-accent bg-mis-accent-soft text-mis-accent-strong" : "border-mis-line bg-white/80 text-mis-muted hover:text-mis-ink",
      )}
    >
      {children}
    </button>
  );
}

const toggle = <T,>(arr: T[], v: T) => (arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

/** ตัวกรองมิติประชากร: อำเภอ / ประเภทหน่วยบริการ / หน่วยบริการ / TYPEAREA / เพศ / ช่วงอายุ */
export function FilterBar({
  data,
  value,
  onChange,
  showTypeSet = true,
  showHosp = true,
}: {
  data: PopulationData;
  value: Filters;
  onChange: (f: Filters) => void;
  showTypeSet?: boolean;
  showHosp?: boolean;
}) {
  const set = (p: Partial<Filters>) => onChange({ ...value, ...p });
  const agePreset = AGE_PRESETS.find((p) => p.min === value.ageMin && p.max === value.ageMax)?.id ?? "custom";
  const hospOptions = data.hdc.hosp.filter(
    (h) => (!value.amps.length || value.amps.includes(h.amp)) && (!value.hostypes.length || value.hostypes.includes(h.type)),
  );
  const level = levelOf(value);
  const dirty = JSON.stringify(value) !== JSON.stringify(DEFAULT_FILTERS);

  return (
    <div className="mis-glass rounded-mis-lg p-3 shadow-mis sm:p-4">
      <div className="flex flex-wrap items-center gap-2">
        <SlidersHorizontal className="size-4 text-mis-accent-strong" />
        <span className="text-[12.5px] font-semibold text-mis-ink">ตัวกรอง</span>
        <span className="rounded-full bg-mis-ink/[0.05] px-2.5 py-1 text-[11px] text-mis-muted">ระดับการประมวลผล: {LEVEL_LABEL[level]}</span>
        {dirty && (
          <button onClick={() => onChange(DEFAULT_FILTERS)} className="ml-auto inline-flex items-center gap-1 text-[11.5px] text-mis-accent-strong hover:underline">
            <RotateCcw className="size-3.5" /> ล้างตัวกรอง
          </button>
        )}
      </div>

      <div className="mt-3 grid gap-3 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <div className="min-w-0">
          <p className="mb-1.5 text-[11px] font-medium text-mis-faint">อำเภอ</p>
          <div className="mis-scroll flex gap-1.5 overflow-x-auto pb-1">
            <Chip active={!value.amps.length} onClick={() => set({ amps: [], hosps: [] })}>ทั้งจังหวัด</Chip>
            {data.hdc.amp.map((a) => (
              <Chip key={a.code} active={value.amps.includes(a.code)} onClick={() => set({ amps: toggle(value.amps, a.code), hosps: [] })}>
                {a.name}
              </Chip>
            ))}
          </div>
        </div>
        <div className="flex min-w-0 flex-wrap items-end gap-3">
          {showTypeSet && (
            <div>
              <p className="mb-1.5 text-[11px] font-medium text-mis-faint">TYPEAREA</p>
              <SegmentedTabs<TypeSet>
                id="pop-typeset"
                size="sm"
                value={value.typeSet}
                onChange={(t) => set({ typeSet: t })}
                items={[{ value: "13", label: "1,3 อยู่จริง" }, { value: "12", label: "1,2 ตามทะเบียนบ้าน" }]}
              />
            </div>
          )}
          <div>
            <p className="mb-1.5 text-[11px] font-medium text-mis-faint">เพศ</p>
            <SegmentedTabs
              id="pop-sex"
              size="sm"
              value={value.sexes.length === 1 ? String(value.sexes[0]) : "all"}
              onChange={(s) => set({ sexes: s === "all" ? [] : [Number(s) as 1 | 2] })}
              items={[{ value: "all", label: "ทั้งหมด" }, { value: "1", label: "ชาย" }, { value: "2", label: "หญิง" }]}
            />
          </div>
        </div>
      </div>

      <div className="mt-3 grid gap-3 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <div className="min-w-0">
          <p className="mb-1.5 text-[11px] font-medium text-mis-faint">ช่วงอายุ (อายุเต็มปี)</p>
          <div className="flex flex-wrap items-center gap-1.5">
            {AGE_PRESETS.map((p) => (
              <Chip key={p.id} active={agePreset === p.id} onClick={() => set({ ageMin: p.min, ageMax: p.max })}>{p.label}</Chip>
            ))}
            <span className="ml-1 inline-flex items-center gap-1 text-[11.5px] text-mis-muted">
              <input
                aria-label="อายุต่ำสุด"
                type="number" min={0} max={100} value={value.ageMin}
                onChange={(e) => set({ ageMin: Math.max(0, Math.min(Number(e.target.value) || 0, value.ageMax)) })}
                className="h-7 w-14 rounded-lg border border-mis-line bg-white px-2 text-right tabular-nums"
              />
              –
              <input
                aria-label="อายุสูงสุด"
                type="number" min={0} max={100} value={value.ageMax}
                onChange={(e) => set({ ageMax: Math.min(100, Math.max(Number(e.target.value) || 0, value.ageMin)) })}
                className="h-7 w-14 rounded-lg border border-mis-line bg-white px-2 text-right tabular-nums"
              />
              ปี
            </span>
          </div>
        </div>
        {showHosp && (
          <div className="flex min-w-0 flex-wrap items-end gap-2">
            <label className="min-w-0 flex-1">
              <span className="mb-1.5 block text-[11px] font-medium text-mis-faint">ประเภทหน่วยบริการ</span>
              <select
                value={value.hostypes[0] ?? ""}
                onChange={(e) => set({ hostypes: e.target.value ? [e.target.value] : [], hosps: [] })}
                className="h-8 w-full rounded-xl border border-mis-line bg-white px-2 text-[12px]"
              >
                <option value="">ทุกประเภท</option>
                {Object.entries(data.hdc.hostype).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </label>
            <label className="min-w-0 flex-[1.4]">
              <span className="mb-1.5 block text-[11px] font-medium text-mis-faint">หน่วยบริการ</span>
              <select
                value={value.hosps[0] ?? ""}
                onChange={(e) => set({ hosps: e.target.value ? [e.target.value] : [] })}
                className="h-8 w-full rounded-xl border border-mis-line bg-white px-2 text-[12px]"
              >
                <option value="">ทุกหน่วยบริการ ({hospOptions.length})</option>
                {data.hdc.amp.map((a) => {
                  const hs = hospOptions.filter((h) => h.amp === a.code);
                  return hs.length ? (
                    <optgroup key={a.code} label={`อ.${a.name}`}>
                      {hs.map((h) => <option key={h.code} value={h.code}>{h.code} {h.name}</option>)}
                    </optgroup>
                  ) : null;
                })}
              </select>
            </label>
          </div>
        )}
      </div>
    </div>
  );
}
