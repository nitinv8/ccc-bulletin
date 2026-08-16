"use client";
import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useInteractions } from "@/components/BookmarkProvider";
import { findProgram, openCalendar, shareProgram, deadlineUrgency, isExpired, hasRealRegistrationLink } from "@/lib/programs";

const typeColors: Record<string, string> = {
  "Summer Program": "bg-orange-100 text-orange-700",
  Competition: "bg-blue-100 text-blue-700",
  Workshop: "bg-purple-100 text-purple-700",
  Internship: "bg-green-100 text-green-700",
  "In-Person Session": "bg-red-100 text-red-700",
  "Virtual Session": "bg-teal-100 text-teal-700",
  Podcast: "bg-pink-100 text-pink-700",
  Information: "bg-gray-100 text-gray-700",
};

const deadlineStyles: Record<string, string> = {
  expired: "bg-gray-100 text-gray-400",
  urgent: "bg-red-100 text-red-700",
  soon: "bg-orange-100 text-orange-700",
  normal: "bg-red-50 text-red-700",
  none: "bg-red-50 text-red-700",
};

export default function ProgramPage() {
  const params = useParams();
  const id = params.id as string;
  const program = findProgram(id);
  const { isBookmarked, toggleBookmark, isArchived, archive, unarchive } = useInteractions();
  const [shareMsg, setShareMsg] = useState<string | null>(null);

  if (!program) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-400 text-lg">Program not found</p>
        <Link href="/" className="text-yellow-600 hover:underline mt-2 inline-block">
          Back to all programs
        </Link>
      </div>
    );
  }

  const bookmarked = isBookmarked(program.id);
  const archived = isArchived(program.id);
  const urgency = deadlineUrgency(program);
  const expired = isExpired(program);
  const colorClass = typeColors[program.type] || "bg-gray-100 text-gray-700";
  const hasRealLink = hasRealRegistrationLink(program);

  const handleShare = async () => {
    const result = await shareProgram(program);
    if (result === "copied") setShareMsg("Copied to clipboard!");
    else if (result === "failed") setShareMsg("Couldn't share — copy the URL manually");
    if (result !== "shared") setTimeout(() => setShareMsg(null), 2500);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <Link href="/" className="text-sm text-gray-500 hover:text-yellow-700 mb-4 inline-block">
        &larr; Back to all programs
      </Link>

      <div className="bg-white rounded-xl border border-gray-200 p-6 md:p-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-4 gap-3">
          <div className="flex flex-wrap gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${colorClass}`}>{program.type}</span>
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-50 text-yellow-700">
              Grades {program.grades}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-50 text-gray-600">
              {program.mode}
            </span>
            {expired && (
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-200 text-gray-500">
                Expired
              </span>
            )}
          </div>
          <button
            onClick={() => toggleBookmark(program.id)}
            className={`text-2xl transition-transform hover:scale-110 shrink-0 ${
              bookmarked ? "text-yellow-500" : "text-gray-300 hover:text-gray-400"
            }`}
            title={bookmarked ? "Remove star" : "Star this"}
          >
            {bookmarked ? "★" : "☆"}
          </button>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-1">{program.title}</h1>
        {program.organisation && <p className="text-sm text-gray-500 mb-4">{program.organisation}</p>}

        {/* Info grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          {program.date && (
            <div className="flex items-start gap-2 bg-gray-50 rounded-lg p-3">
              <span className="text-lg">&#128197;</span>
              <div>
                <p className="text-xs text-gray-500 font-medium">Date</p>
                <p className="text-sm text-gray-800">{program.date}</p>
              </div>
            </div>
          )}
          {program.deadline && (
            <div className={`flex items-start gap-2 rounded-lg p-3 ${deadlineStyles[urgency]}`}>
              <span className="text-lg">&#9200;</span>
              <div>
                <p className="text-xs font-medium opacity-80">Deadline</p>
                <p className="text-sm font-medium">{program.deadline}</p>
              </div>
            </div>
          )}
          {(program.venue || program.location) && (
            <div className="flex items-start gap-2 bg-gray-50 rounded-lg p-3">
              <span className="text-lg">&#128205;</span>
              <div>
                <p className="text-xs text-gray-500 font-medium">Location</p>
                <p className="text-sm text-gray-800">{program.venue || program.location}</p>
              </div>
            </div>
          )}
          {program.time && (
            <div className="flex items-start gap-2 bg-gray-50 rounded-lg p-3">
              <span className="text-lg">&#128336;</span>
              <div>
                <p className="text-xs text-gray-500 font-medium">Time</p>
                <p className="text-sm text-gray-800">{program.time}</p>
              </div>
            </div>
          )}
          <div className="flex items-start gap-2 bg-gray-50 rounded-lg p-3">
            <span className="text-lg">&#127979;</span>
            <div>
              <p className="text-xs text-gray-500 font-medium">Campus</p>
              <p className="text-sm text-gray-800">{program.campus}</p>
            </div>
          </div>
          <div className="flex items-start gap-2 bg-gray-50 rounded-lg p-3">
            <span className="text-lg">&#128101;</span>
            <div>
              <p className="text-xs text-gray-500 font-medium">Eligibility</p>
              <p className="text-sm text-gray-800">{program.eligibility || program.audience}</p>
            </div>
          </div>
        </div>

        {/* Overview */}
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">Overview</h2>
          <p className="text-gray-700 leading-relaxed">{program.overview}</p>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-2 mb-6">
          {hasRealLink && (
            <a
              href={program.registrationLink}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 rounded-lg bg-yellow-400 text-yellow-900 text-sm font-semibold hover:bg-yellow-500 transition-colors"
            >
              Register &rarr;
            </a>
          )}
          <button
            onClick={() => openCalendar(program)}
            className="px-4 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
          >
            &#128197; Add to Calendar
          </button>
          <div className="relative">
            <button
              onClick={handleShare}
              className="px-4 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              &#128257; Share
            </button>
            {shareMsg && (
              <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                {shareMsg}
              </span>
            )}
          </div>
          <button
            onClick={() => (archived ? unarchive(program.id) : archive(program.id))}
            className="ml-auto px-4 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
          >
            {archived ? "Unarchive" : "Archive"}
          </button>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 pt-4 border-t border-gray-100">
          {program.tags.map((tag) => (
            <span key={tag} className="px-2.5 py-1 bg-gray-50 text-gray-500 rounded-lg text-xs">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
