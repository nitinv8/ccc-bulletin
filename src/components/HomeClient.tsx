"use client";
import { useState, useMemo } from "react";
import ProgramCard from "@/components/ProgramCard";
import FilterBar, { FilterState } from "@/components/FilterBar";
import { Bulletin, eligibilityGroup, matchesDeadlineFilter, isExpired } from "@/lib/programs";

const EMPTY_FILTERS: FilterState = {
  search: "",
  category: "",
  type: "",
  grade: "",
  eligibility: "",
  format: "",
  location: "",
  deadline: "",
};

const categories = [
  { key: "university-visits", label: "University Visits & CCC Initiatives" },
  { key: "future-ready", label: "Activities to Make You Future Ready" },
];

export default function HomeClient({ bulletins }: { bulletins: Bulletin[] }) {
  const [bulletinIndex, setBulletinIndex] = useState(0);
  const bulletin = bulletins[bulletinIndex];
  const programs = bulletin?.programs ?? [];

  const [filters, setFilters] = useState<FilterState>(EMPTY_FILTERS);
  const updateFilters = (patch: Partial<FilterState>) => setFilters((f) => ({ ...f, ...patch }));
  const clearFilters = () => setFilters(EMPTY_FILTERS);

  const types = useMemo(() => [...new Set(programs.map((p) => p.type))].sort(), [programs]);
  const formats = useMemo(() => [...new Set(programs.map((p) => p.mode))].sort(), [programs]);
  const locations = useMemo(
    () => [...new Set(programs.map((p) => p.location).filter(Boolean))].sort() as string[],
    [programs]
  );
  const eligibilities = useMemo(
    () => [...new Set(programs.map((p) => eligibilityGroup(p)))].sort(),
    [programs]
  );

  const allGrades = useMemo(() => {
    const gradeSet = new Set<string>();
    programs.forEach((p) => {
      const parts = p.grades.split("-");
      if (parts.length === 2) {
        const start = parseInt(parts[0]);
        const end = parseInt(parts[1]);
        for (let i = start; i <= end; i++) gradeSet.add(String(i));
      } else {
        gradeSet.add(parts[0]);
      }
    });
    return [...gradeSet].sort((a, b) => parseInt(a) - parseInt(b));
  }, [programs]);

  const filtered = useMemo(() => {
    return programs.filter((p) => {
      // hide expired unless the user explicitly filters for them
      if (filters.deadline !== "expired" && isExpired(p)) return false;
      if (filters.category && p.category !== filters.category) return false;
      if (filters.type && p.type !== filters.type) return false;
      if (filters.format && p.mode !== filters.format) return false;
      if (filters.location && p.location !== filters.location) return false;
      if (filters.eligibility && eligibilityGroup(p) !== filters.eligibility) return false;
      if (!matchesDeadlineFilter(p, filters.deadline)) return false;
      if (filters.grade) {
        const parts = p.grades.split("-");
        if (parts.length === 2) {
          const start = parseInt(parts[0]);
          const end = parseInt(parts[1]);
          const grade = parseInt(filters.grade);
          if (grade < start || grade > end) return false;
        } else if (parts[0] !== filters.grade) return false;
      }
      if (filters.search) {
        const q = filters.search.toLowerCase();
        const haystack = [p.title, p.overview, p.organisation, ...(p.tags || [])]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [programs, filters]);

  const activeCount = Object.entries(filters).filter(([k, v]) => k !== "search" && v).length;
  const anyFilterActive = filters.search || activeCount > 0;

  if (!bulletin) return <div className="py-12 text-center text-gray-400">No bulletins found.</div>;

  return (
    <div>
      {/* Bulletin month tabs */}
      {bulletins.length > 1 && (
        <div className="flex gap-1 overflow-x-auto pb-1 mb-5 scrollbar-none">
          {bulletins.map((b, i) => (
            <button
              key={b.id}
              onClick={() => { setBulletinIndex(i); clearFilters(); }}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                i === bulletinIndex
                  ? "bg-yellow-400 text-yellow-900 shadow-sm"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {b.month}
            </button>
          ))}
        </div>
      )}

      <div className="mb-5">
        <div className="flex items-center gap-2.5">
          <h2 className="text-lg font-bold text-gray-900 leading-tight">{bulletin.title || bulletin.month}</h2>
          <span className="px-2.5 py-0.5 rounded-full bg-yellow-100 text-yellow-800 text-xs font-semibold">
            {programs.length}
          </span>
        </div>
      </div>

      <FilterBar
        categories={categories}
        types={types}
        grades={allGrades}
        eligibilities={eligibilities}
        formats={formats}
        locations={locations}
        filters={filters}
        onChange={updateFilters}
        onClear={clearFilters}
        activeCount={activeCount}
      />

      {anyFilterActive ? (
        <div>
          <p className="text-sm text-gray-500 mb-4">
            {filtered.length} program{filtered.length !== 1 ? "s" : ""} found
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map((p) => (
              <ProgramCard key={p.id} program={p} clickableCard={true} />
            ))}
          </div>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <p className="text-lg mb-1">No programs match your filters</p>
              <p className="text-sm">Try adjusting your search or filters</p>
            </div>
          )}
        </div>
      ) : (
        categories.map((cat) => {
          const catPrograms = filtered.filter((p) => p.category === cat.key);
          if (catPrograms.length === 0) return null;
          return (
            <section key={cat.key} className="mb-10">
              <div className="flex items-center gap-3 mb-4">
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">{cat.label}</h3>
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-xs font-medium text-gray-400">{catPrograms.length}</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {catPrograms.map((p) => (
                  <ProgramCard key={p.id} program={p} clickableCard={true} />
                ))}
              </div>
            </section>
          );
        })
      )}
    </div>
  );
}
