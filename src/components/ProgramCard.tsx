"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useInteractions } from "./BookmarkProvider";
import { Program, openCalendar, shareProgram, deadlineUrgency, isExpired, hasRealRegistrationLink } from "@/lib/programs";

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
  expired: "bg-gray-100 text-gray-400 line-through",
  urgent: "bg-red-100 text-red-700",
  soon: "bg-orange-100 text-orange-700",
  normal: "bg-red-50 text-red-600",
  none: "",
};

export default function ProgramCard({
  program,
  showArchiveAction = false,
  clickableCard = false,
}: {
  program: Program;
  showArchiveAction?: boolean;
  clickableCard?: boolean;
}) {
  const router = useRouter();
  const { isBookmarked, toggleBookmark, isArchived, archive, unarchive } = useInteractions();
  const bookmarked = isBookmarked(program.id);
  const archived = isArchived(program.id);
  const [shareMsg, setShareMsg] = useState<string | null>(null);

  const colorClass = typeColors[program.type] || "bg-gray-100 text-gray-700";
  const urgency = deadlineUrgency(program);
  const expired = isExpired(program);
  const hasRealLink = hasRealRegistrationLink(program);

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const result = await shareProgram(program);
    if (result === "copied") setShareMsg("Copied!");
    else if (result === "shared") setShareMsg(null);
    else setShareMsg("Couldn't share");
    if (result === "copied" || result === "failed") {
      setTimeout(() => setShareMsg(null), 2000);
    }
  };

  const handleCardClick = () => {
    if (clickableCard) router.push(`/program/${program.id}`);
  };

  return (
    <div
      onClick={handleCardClick}
      className={`bg-white rounded-xl border p-5 transition-shadow relative group ${
        expired ? "border-gray-200 opacity-70" : "border-gray-200"
      } ${clickableCard ? "cursor-pointer hover:shadow-md" : "hover:shadow-md"}`}
    >
      {/* Star button */}
      <div className="absolute top-4 right-4 flex items-center gap-2">
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleBookmark(program.id);
          }}
          className={`text-xl transition-transform hover:scale-110 ${
            bookmarked ? "text-yellow-500" : "text-gray-300 group-hover:text-gray-400"
          }`}
          title={bookmarked ? "Remove star" : "Star this"}
        >
          {bookmarked ? "★" : "☆"}
        </button>
      </div>

      {/* Badges */}
      <div className="flex flex-wrap gap-2 mb-3 pr-8">
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass}`}>
          {program.type}
        </span>
        <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-50 text-yellow-700">
          Grades {program.grades}
        </span>
        {program.mode && (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-50 text-gray-600">
            {program.mode}
          </span>
        )}
        {expired && (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-200 text-gray-500">
            Expired
          </span>
        )}
      </div>

      {/* Title — clickable link on non-clickable cards, plain text on clickable cards */}
      {clickableCard ? (
        <h3 className="text-lg font-semibold text-gray-900 mb-1 pr-8">{program.title}</h3>
      ) : (
        <Link href={`/program/${program.id}`} onClick={(e) => e.stopPropagation()}>
          <h3 className="text-lg font-semibold text-gray-900 mb-1 hover:text-yellow-700 transition-colors pr-8">
            {program.title}
          </h3>
        </Link>
      )}

      {program.organisation && (
        <p className="text-xs text-gray-500 mb-2">{program.organisation}</p>
      )}

      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{program.overview}</p>

      <div className="flex flex-wrap gap-3 text-xs text-gray-500 mb-2">
        {program.location && (
          <span className="flex items-center gap-1">
            <span>&#128205;</span> {program.location}
          </span>
        )}
        {program.date && (
          <span className="flex items-center gap-1">
            <span>&#128197;</span> {program.date}
          </span>
        )}
      </div>

      {program.deadline && (
        <div className="mb-3">
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${
              deadlineStyles[urgency] || deadlineStyles.normal
            }`}
          >
            <span>&#9200;</span> Deadline: {program.deadline}
          </span>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-gray-100">
        {/* Only show Register if there's a real verified link */}
        {hasRealLink && (
          <a
            href={program.registrationLink}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="px-3 py-1.5 rounded-lg bg-yellow-400 text-yellow-900 text-xs font-semibold hover:bg-yellow-500 transition-colors"
          >
            Register &rarr;
          </a>
        )}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            openCalendar(program);
          }}
          className="px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs text-gray-600 hover:bg-gray-50 transition-colors"
          title="Add to Calendar"
        >
          &#128197; Calendar
        </button>
        <button
          onClick={handleShare}
          className="px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs text-gray-600 hover:bg-gray-50 transition-colors relative"
          title="Share"
        >
          &#128257; Share
          {shareMsg && (
            <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap">
              {shareMsg}
            </span>
          )}
        </button>
        {showArchiveAction && (
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              archived ? unarchive(program.id) : archive(program.id);
            }}
            className="ml-auto px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs text-gray-600 hover:bg-gray-50 transition-colors"
            title={archived ? "Move back to My Page" : "Archive"}
          >
            {archived ? "Unarchive" : "Archive"}
          </button>
        )}
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-gray-100">
        {program.tags.slice(0, 4).map((tag) => (
          <span key={tag} className="px-2 py-0.5 bg-gray-50 text-gray-500 rounded text-[11px]">
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}
