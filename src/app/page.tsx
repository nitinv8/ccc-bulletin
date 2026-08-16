"use client";
import { useState, useMemo } from "react";
import ProgramCard from "@/components/ProgramCard";
import FilterBar, { FilterState } from "@/components/FilterBar";
import { getBulletins, eligibilityGroup, matchesDeadlineFilter } from "@/lib/programs";

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

export default function Home() {
  const bulletinData = useMemo(() => getBulletins(), []);
  const [bulletinIndex, setBulletinIndex] = useState(0);
  const bulletin = bulletinData[bulletinIndex];
  const programs = bulletin.programs;

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

  const categories = [
    { key: "university-visits", label: "University Visits & CCC Initiatives" },
    { key: "future-ready", label: "Activities to Make You Future Ready" },
  ];

  const anyFilterActive = filters.search || activeCount > 0;

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <h2 className="text-2xl font-bold text-gray-900">{bulletin.month}</h2>
          <span className="px-2.5 py-0.5 rounded-full bg-yellow-100 text-yellow-800 text-xs font-medium">
            {programs.length} programs
          </span>
          {bulletinData.length > 1 && (
            <select
              value={bulletinIndex}
              onChange={(e) => setBulletinIndex(Number(e.target.value))}
              className="ml-auto px-3 py-1 rounded-lg border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
            >
              {bulletinData.map((b, i) => (
                <option key={b.id} value={i}>
                  {b.month}
                </option>
              ))}
            </select>
          )}
        </div>
        <p className="text-sm text-gray-500">{bulletin.title}</p>
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
              <ProgramCard key={p.id} program={p} />
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
            <section key={cat.key} className="mb-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
                {cat.label}
                <span className="ml-2 text-sm font-normal text-gray-400">({catPrograms.length})</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {catPrograms.map((p) => (
                  <ProgramCard key={p.id} program={p} />
                ))}
              </div>
            </section>
          );
        })
      )}
    </div>
  );
}
