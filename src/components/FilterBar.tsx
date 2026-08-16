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
  { value: "rolling", label: "No fixed deadline" },
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

const selectClass =
  "px-3 py-2 rounded-lg border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400 w-full";

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
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
      <div className="flex flex-col md:flex-row gap-3">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search opportunities..."
            value={filters.search}
            onChange={(e) => onChange({ search: e.target.value })}
            className="w-full px-4 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
          />
        </div>
        <select
          value={filters.category}
          onChange={(e) => onChange({ category: e.target.value })}
          className={`md:w-56 ${selectClass}`}
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c.key} value={c.key}>
              {c.label}
            </option>
          ))}
        </select>
        <select
          value={filters.type}
          onChange={(e) => onChange({ type: e.target.value })}
          className={`md:w-44 ${selectClass}`}
        >
          <option value="">All Types</option>
          {types.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <button
          onClick={() => setExpanded((v) => !v)}
          className="px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 whitespace-nowrap"
        >
          {expanded ? "Fewer filters" : "More filters"}
          {activeCount > 0 && (
            <span className="ml-1.5 inline-flex items-center justify-center w-5 h-5 rounded-full bg-yellow-400 text-yellow-900 text-[11px] font-semibold">
              {activeCount}
            </span>
          )}
        </button>
      </div>

      {expanded && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 mt-3 pt-3 border-t border-gray-100">
          <select value={filters.grade} onChange={(e) => onChange({ grade: e.target.value })} className={selectClass}>
            <option value="">All Grades</option>
            {grades.map((g) => (
              <option key={g} value={g}>
                Grade {g}
              </option>
            ))}
          </select>
          <select
            value={filters.eligibility}
            onChange={(e) => onChange({ eligibility: e.target.value })}
            className={selectClass}
          >
            <option value="">All Eligibility</option>
            {eligibilities.map((el) => (
              <option key={el} value={el}>
                {el}
              </option>
            ))}
          </select>
          <select value={filters.format} onChange={(e) => onChange({ format: e.target.value })} className={selectClass}>
            <option value="">All Formats</option>
            {formats.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
          <select
            value={filters.location}
            onChange={(e) => onChange({ location: e.target.value })}
            className={selectClass}
          >
            <option value="">All Locations</option>
            {locations.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
          <select
            value={filters.deadline}
            onChange={(e) => onChange({ deadline: e.target.value })}
            className={selectClass}
          >
            {DEADLINE_OPTIONS.map((d) => (
              <option key={d.value} value={d.value}>
                {d.label}
              </option>
            ))}
          </select>
        </div>
      )}

      {activeCount > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <button onClick={onClear} className="text-xs text-yellow-700 hover:underline">
            Clear all filters
          </button>
        </div>
      )}
    </div>
  );
}
