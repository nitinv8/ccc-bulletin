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
  eligibilities: string[];
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
  color,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  color?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
        active
          ? color ?? "bg-yellow-400 text-yellow-900 shadow-sm"
          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
      }`}
    >
      {label}
    </button>
  );
}

const TYPE_COLORS: Record<string, string> = {
  "Summer Program": "bg-orange-400 text-white",
  Competition: "bg-blue-500 text-white",
  Workshop: "bg-purple-500 text-white",
  Internship: "bg-green-500 text-white",
  "In-Person Session": "bg-red-500 text-white",
  "Virtual Session": "bg-teal-500 text-white",
  Podcast: "bg-pink-500 text-white",
  Information: "bg-gray-500 text-white",
};

export default function FilterBar({
  categories,
  types,
  grades,
  eligibilities,
  formats,
  locations,
  filters,
  onChange,
  onClear,
  activeCount,
}: FilterBarProps) {
  const secondaryActive =
    filters.grade || filters.eligibility || filters.format || filters.location || filters.deadline;

  return (
    <div className="mb-6 space-y-3">
      {/* Search */}
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
          🔍
        </span>
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

      {/* Category pills */}
      <div className="flex flex-wrap gap-2">
        <Chip
          label="All"
          active={!filters.category}
          onClick={() => onChange({ category: "" })}
        />
        {categories.map((c) => (
          <Chip
            key={c.key}
            label={c.key === "university-visits" ? "University Visits" : "Future Ready"}
            active={filters.category === c.key}
            onClick={() => onChange({ category: filters.category === c.key ? "" : c.key })}
          />
        ))}
      </div>

      {/* Type pills — horizontal scroll on mobile */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        <Chip
          label="All types"
          active={!filters.type}
          onClick={() => onChange({ type: "" })}
        />
        {types.map((t) => (
          <Chip
            key={t}
            label={t}
            active={filters.type === t}
            color={TYPE_COLORS[t]}
            onClick={() => onChange({ type: filters.type === t ? "" : t })}
          />
        ))}
      </div>

      {/* Secondary filters row */}
      <div className="flex flex-wrap gap-2 items-center">
        {/* Grade */}
        {grades.length > 0 && (
          <select
            value={filters.grade}
            onChange={(e) => onChange({ grade: e.target.value })}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-yellow-400 ${
              filters.grade
                ? "bg-yellow-400 text-yellow-900 border-yellow-400"
                : "bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200"
            }`}
          >
            <option value="">Grade</option>
            {grades.map((g) => (
              <option key={g} value={g}>
                Grade {g}
              </option>
            ))}
          </select>
        )}

        {/* Format */}
        {formats.length > 1 && (
          <select
            value={filters.format}
            onChange={(e) => onChange({ format: e.target.value })}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-yellow-400 ${
              filters.format
                ? "bg-yellow-400 text-yellow-900 border-yellow-400"
                : "bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200"
            }`}
          >
            <option value="">Format</option>
            {formats.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        )}

        {/* Deadline */}
        <select
          value={filters.deadline}
          onChange={(e) => onChange({ deadline: e.target.value })}
          className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-yellow-400 ${
            filters.deadline
              ? "bg-yellow-400 text-yellow-900 border-yellow-400"
              : "bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200"
          }`}
        >
          {DEADLINE_OPTIONS.map((d) => (
            <option key={d.value} value={d.value}>
              {d.label}
            </option>
          ))}
        </select>

        {/* Location */}
        {locations.length > 0 && (
          <select
            value={filters.location}
            onChange={(e) => onChange({ location: e.target.value })}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-yellow-400 ${
              filters.location
                ? "bg-yellow-400 text-yellow-900 border-yellow-400"
                : "bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200"
            }`}
          >
            <option value="">Location</option>
            {locations.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
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
