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
  categories: { key: string; label: string }[];
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

function Chip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
        active
          ? "bg-yellow-400 text-yellow-900 shadow-sm"
          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
      }`}
    >
      {label}
    </button>
  );
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
      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-yellow-400 appearance-none pr-7 ${
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
  categories,
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
    <div className="mb-6 space-y-3">
      {/* Search */}
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
        <input
          type="text"
          placeholder="Search opportunities…"
          value={filters.search}
          onChange={(e) => onChange({ search: e.target.value })}
          className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent shadow-sm"
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

      {/* Category chips */}
      <div className="flex flex-wrap gap-2">
        <Chip label="All" active={!filters.category} onClick={() => onChange({ category: "" })} />
        {categories.map((c) => (
          <Chip
            key={c.key}
            label={c.key === "university-visits" ? "University Visits" : "Future Ready"}
            active={filters.category === c.key}
            onClick={() => onChange({ category: filters.category === c.key ? "" : c.key })}
          />
        ))}
      </div>

      {/* Dropdown filters row */}
      <div className="flex flex-wrap gap-2 items-center">
        {/* Type of Event */}
        {types.length > 0 && (
          <FilterSelect
            value={filters.type}
            onChange={(v) => onChange({ type: v })}
            placeholder="Type of Event"
            options={types.map((t) => ({ value: t, label: t }))}
          />
        )}

        {/* Applicable Grades */}
        {grades.length > 0 && (
          <FilterSelect
            value={filters.grade}
            onChange={(v) => onChange({ grade: v })}
            placeholder="Applicable Grades"
            options={grades.map((g) => ({ value: g, label: `Grade ${g}` }))}
          />
        )}

        {/* Deadline */}
        <FilterSelect
          value={filters.deadline}
          onChange={(v) => onChange({ deadline: v })}
          placeholder="Deadline"
          options={DEADLINE_OPTIONS.filter((d) => d.value !== "").map((d) => ({ value: d.value, label: d.label }))}
        />

        {/* Location */}
        {locations.length > 0 && (
          <FilterSelect
            value={filters.location}
            onChange={(v) => onChange({ location: v })}
            placeholder="Location"
            options={locations.map((l) => ({ value: l, label: l }))}
          />
        )}

        {/* Format */}
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
            className="ml-auto text-xs text-gray-400 hover:text-red-500 transition-colors"
          >
            Clear all ×
          </button>
        )}
      </div>
    </div>
  );
}
