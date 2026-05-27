"use client";
import { useState, useMemo } from "react";
import ProgramCard from "@/components/ProgramCard";
import FilterBar from "@/components/FilterBar";
import bulletinData from "@/data/bulletins.json";

export default function Home() {
  const bulletin = bulletinData.bulletins[0];
  const programs = bulletin.programs;

  const [selectedType, setSelectedType] = useState("");
  const [selectedGrade, setSelectedGrade] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const types = useMemo(
    () => [...new Set(programs.map((p) => p.type))].sort(),
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
      if (selectedType && p.type !== selectedType) return false;
      if (selectedGrade) {
        const parts = p.grades.split("-");
        if (parts.length === 2) {
          const start = parseInt(parts[0]);
          const end = parseInt(parts[1]);
          const grade = parseInt(selectedGrade);
          if (grade < start || grade > end) return false;
        } else if (parts[0] !== selectedGrade) return false;
      }
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          p.title.toLowerCase().includes(q) ||
          p.overview.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [programs, selectedType, selectedGrade, searchQuery]);

  const categories = [
    { key: "university-visits", label: "University Visits & CCC Initiatives" },
    { key: "future-ready", label: "Activities to Make You Future Ready" },
  ];

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <h2 className="text-2xl font-bold text-gray-900">{bulletin.month}</h2>
          <span className="px-2.5 py-0.5 rounded-full bg-yellow-100 text-yellow-800 text-xs font-medium">
            {programs.length} programs
          </span>
        </div>
        <p className="text-sm text-gray-500">{bulletin.title}</p>
      </div>

      <FilterBar
        types={types}
        grades={allGrades}
        selectedType={selectedType}
        selectedGrade={selectedGrade}
        searchQuery={searchQuery}
        onTypeChange={setSelectedType}
        onGradeChange={setSelectedGrade}
        onSearchChange={setSearchQuery}
      />

      {searchQuery || selectedType || selectedGrade ? (
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
                <span className="ml-2 text-sm font-normal text-gray-400">
                  ({catPrograms.length})
                </span>
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
