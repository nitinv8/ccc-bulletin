"use client";

interface FilterBarProps {
  types: string[];
  grades: string[];
  selectedType: string;
  selectedGrade: string;
  searchQuery: string;
  onTypeChange: (type: string) => void;
  onGradeChange: (grade: string) => void;
  onSearchChange: (query: string) => void;
}

export default function FilterBar({
  types,
  grades,
  selectedType,
  selectedGrade,
  searchQuery,
  onTypeChange,
  onGradeChange,
  onSearchChange,
}: FilterBarProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
      <div className="flex flex-col md:flex-row gap-3">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search programs..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
          />
        </div>
        <select
          value={selectedType}
          onChange={(e) => onTypeChange(e.target.value)}
          className="px-3 py-2 rounded-lg border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
        >
          <option value="">All Types</option>
          {types.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <select
          value={selectedGrade}
          onChange={(e) => onGradeChange(e.target.value)}
          className="px-3 py-2 rounded-lg border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
        >
          <option value="">All Grades</option>
          {grades.map((g) => (
            <option key={g} value={g}>
              Grade {g}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
