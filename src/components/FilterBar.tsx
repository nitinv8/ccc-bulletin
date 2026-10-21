"use client";
import { useState } from "react";

export interface FilterState {
  search: string;
  category: string;
  type: string;
  grade: string;
  eligibility: string;
  format: string;
  location: string;
  deadline: string;
}

export const DEADLINE_OPTIONS = [
  { value: "", label: "Any deadline" },
  { value: "week", label: "Due in 7 days" },
  { value: "month", label: "Due in 30 days" },
  { value: "rolling", label: "No deadline" },
  { value: "expired", label: "Expired" },
];

interface FilterBarProps {
  types: string[];
  grades: string[];
  eligibilities?: string[];
  formats: string[];
  locations: string[];
  filters: FilterState;
  onChange: (patch: Partial<FilterState>) => void;
  onClear: () => void;
  activeCount: number;
}

function FilterSelect({
  value,
  onChange,
  label,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  label: string;
  options: { value: string; label: string }[];
}) {
  const active = !!value;
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full px-3 py-2 rounded-lg text-xs font-medium border transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-yellow-400 appearance-none ${
          active
            ? "bg-yellow-50 text-yellow-900 border-yellow-300"
            : "bg-white text-gray-600 border-gray-200"
        }`}
      >
        <option value="">Any</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}

/* Desktop pill select — for sm+ screens */
function PillSelect({
  value,
  onChange,
  placeholder,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  options: { value: string; label: string }[];
}) {
  const active = !!value;
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-yellow-400 appearance-none pr-7 ${
        active
          ? "bg-yellow-400 text-yellow-900 border-yellow-400"
          : "bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200"
      }`}
      style={{
        backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%236b7280'/%3E%3C/svg%3E\")",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "right 10px center",
      }}
    >
      <option value="">{placeholder}</option>
      {options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  );
}

export default function FilterBar({
  types,
  grades,
  formats,
  locations,
  filters,
  onChange,
  onClear,
  activeCount,
}: FilterBarProps) {
  const [open, setOpen] = useState(false);

  const deadlineOpts = DEADLINE_OPTIONS.filter((d) => d.value !== "");

  return (
    <div className="mb-4">
      {/* Search + mobile filter toggle */}
      <div className="flex gap-2 mb-2">
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
          <input
            type="text"
            placeholder="Search opportunities…"
            value={filters.search}
            onChange={(e) => onChange({ search: e.target.value })}
            className="w-full pl-9 pr-9 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent shadow-sm"
          />
          {filters.search && (
            <button
              onClick={() => onChange({ search: "" })}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-lg leading-none"
            >
              ×
            </button>
          )}
        </div>

        {/* Mobile filter toggle button */}
        <button
          onClick={() => setOpen((o) => !o)}
          className={`sm:hidden flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-medium transition-all shadow-sm ${
            activeCount > 0
              ? "bg-yellow-400 text-yellow-900 border-yellow-400"
              : "bg-white text-gray-600 border-gray-200"
          }`}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="11" y1="18" x2="13" y2="18"/>
          </svg>
          Filters
          {activeCount > 0 && (
            <span className="w-4 h-4 rounded-full bg-yellow-900 text-yellow-100 text-[10px] flex items-center justify-center font-bold">
              {activeCount}
            </span>
          )}
        </button>
      </div>

      {/* Mobile: collapsible filter panel */}
      {open && (
        <div className="sm:hidden bg-white border border-gray-200 rounded-xl p-4 mb-2 shadow-sm space-y-3">
          {types.length > 0 && (
            <FilterSelect value={filters.type} onChange={(v) => onChange({ type: v })} label="Type of Event"
              options={types.map((t) => ({ value: t, label: t }))} />
          )}
          {grades.length > 0 && (
            <FilterSelect value={filters.grade} onChange={(v) => onChange({ grade: v })} label="Grade"
              options={grades.map((g) => ({ value: g, label: `Grade ${g}` }))} />
          )}
          <FilterSelect value={filters.deadline} onChange={(v) => onChange({ deadline: v })} label="Deadline"
            options={deadlineOpts} />
          {locations.length > 0 && (
            <FilterSelect value={filters.location} onChange={(v) => onChange({ location: v })} label="Location"
              options={locations.map((l) => ({ value: l, label: l }))} />
          )}
          {formats.length > 1 && (
            <FilterSelect value={filters.format} onChange={(v) => onChange({ format: v })} label="Format"
              options={formats.map((f) => ({ value: f, label: f }))} />
          )}
          <div className="flex justify-between pt-1">
            {activeCount > 0 && (
              <button onClick={() => { onClear(); setOpen(false); }}
                className="text-xs text-red-500 hover:text-red-600 font-medium">
                Clear all filters
              </button>
            )}
            <button onClick={() => setOpen(false)}
              className="ml-auto text-xs text-gray-500 font-medium px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200">
              Done
            </button>
          </div>
        </div>
      )}

      {/* Desktop: inline pill filters */}
      <div className="hidden sm:flex gap-2 items-center flex-wrap">
        {types.length > 0 && (
          <PillSelect value={filters.type} onChange={(v) => onChange({ type: v })} placeholder="Type"
            options={types.map((t) => ({ value: t, label: t }))} />
        )}
        {grades.length > 0 && (
          <PillSelect value={filters.grade} onChange={(v) => onChange({ grade: v })} placeholder="Grade"
            options={grades.map((g) => ({ value: g, label: `Grade ${g}` }))} />
        )}
        <PillSelect value={filters.deadline} onChange={(v) => onChange({ deadline: v })} placeholder="Deadline"
          options={deadlineOpts} />
        {locations.length > 0 && (
          <PillSelect value={filters.location} onChange={(v) => onChange({ location: v })} placeholder="Location"
            options={locations.map((l) => ({ value: l, label: l }))} />
        )}
        {formats.length > 1 && (
          <PillSelect value={filters.format} onChange={(v) => onChange({ format: v })} placeholder="Format"
            options={formats.map((f) => ({ value: f, label: f }))} />
        )}
        {activeCount > 0 && (
          <button onClick={onClear} className="text-xs text-gray-400 hover:text-red-500 transition-colors ml-1">
            Clear all ×
          </button>
        )}
      </div>
    </div>
  );
}
