"use client";

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
      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-yellow-400 appearance-none pr-7 whitespace-nowrap shrink-0 ${
        active
          ? "bg-yellow-400 text-yellow-900 border-yellow-400"
          : "bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200"
      }`}
      style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%236b7280'/%3E%3C/svg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 10px center" }}
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
  return (
    <div className="mb-4 space-y-2">
      {/* Search */}
      <div className="relative">
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

      {/* Filters — horizontal scroll on mobile */}
      <div className="flex gap-2 overflow-x-auto pb-1 items-center" style={{ scrollbarWidth: "none" }}>
        {types.length > 0 && (
          <FilterSelect
            value={filters.type}
            onChange={(v) => onChange({ type: v })}
            placeholder="Type"
            options={types.map((t) => ({ value: t, label: t }))}
          />
        )}
        {grades.length > 0 && (
          <FilterSelect
            value={filters.grade}
            onChange={(v) => onChange({ grade: v })}
            placeholder="Grade"
            options={grades.map((g) => ({ value: g, label: `Grade ${g}` }))}
          />
        )}
        <FilterSelect
          value={filters.deadline}
          onChange={(v) => onChange({ deadline: v })}
          placeholder="Deadline"
          options={DEADLINE_OPTIONS.filter((d) => d.value !== "").map((d) => ({ value: d.value, label: d.label }))}
        />
        {locations.length > 0 && (
          <FilterSelect
            value={filters.location}
            onChange={(v) => onChange({ location: v })}
            placeholder="Location"
            options={locations.map((l) => ({ value: l, label: l }))}
          />
        )}
        {formats.length > 1 && (
          <FilterSelect
            value={filters.format}
            onChange={(v) => onChange({ format: v })}
            placeholder="Format"
            options={formats.map((f) => ({ value: f, label: f }))}
          />
        )}
        {activeCount > 0 && (
          <button
            onClick={onClear}
            className="shrink-0 text-xs text-gray-400 hover:text-red-500 transition-colors whitespace-nowrap ml-1"
          >
            Clear ×
          </button>
        )}
      </div>
    </div>
  );
}
