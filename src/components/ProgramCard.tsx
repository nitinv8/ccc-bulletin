"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useInteractions } from "./BookmarkProvider";
import { Program, openCalendar, shareProgram, deadlineUrgency, isExpired, hasRealRegistrationLink } from "@/lib/programs";

const typeAccent: Record<string, string> = {
  "Summer Program": "border-l-orange-400",
  Competition: "border-l-blue-500",
  Workshop: "border-l-purple-500",
  Internship: "border-l-green-500",
  "In-Person Session": "border-l-red-400",
  "Virtual Session": "border-l-teal-500",
  Podcast: "border-l-pink-500",
  Information: "border-l-gray-400",
};

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
  normal: "bg-red-50 text-red-600",
  none: "",
};

// Inline SVG icons — no library needed
function IconStar({ filled }: { filled: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

function IconArchive() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="21 8 21 21 3 21 3 8" />
      <rect x="1" y="3" width="22" height="5" />
      <line x1="10" y1="12" x2="14" y2="12" />
    </svg>
  );
}

export default function ProgramCard({
  program,
  clickableCard = false,
  showArchiveAction = false,
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
  const accentClass = typeAccent[program.type] || "border-l-gray-300";
  const urgency = deadlineUrgency(program);
  const expired = isExpired(program);
  const hasRealLink = hasRealRegistrationLink(program);
  const hasVideo = !!program.videoLink;
  const isVideoOnly = hasVideo && !hasRealLink;
  const showNew = program.isNew && !expired;

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

  return (
    <div
      onClick={clickableCard ? () => router.push(`/program/${program.id}`) : undefined}
      className={`bg-white rounded-xl border border-gray-200 border-l-4 ${accentClass} p-5 transition-all relative group ${
        expired ? "opacity-60" : ""
      } ${clickableCard ? "cursor-pointer hover:shadow-md hover:-translate-y-0.5" : "hover:shadow-md"}`}
    >
      {/* Star + Archive in top-right */}
      <div className="absolute top-3.5 right-3.5 flex items-center gap-1.5">
        {showArchiveAction && (
          <div className="relative group/arc">
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); archived ? unarchive(program.id) : archive(program.id); }}
              className={`p-1 rounded transition-colors ${archived ? "text-blue-400" : "text-gray-300 hover:text-gray-500"}`}
              title={archived ? "Unarchive" : "Archive"}
            >
              <IconArchive />
            </button>
            <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] px-1.5 py-0.5 rounded whitespace-nowrap opacity-0 group-hover/arc:opacity-100 transition-opacity pointer-events-none z-10">
              {archived ? "Unarchive" : "Archive"}
            </span>
          </div>
        )}
        <div className="relative group/star">
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleBookmark(program.id); }}
            className={`p-1 rounded transition-colors ${bookmarked ? "text-yellow-500" : "text-gray-300 hover:text-gray-500"}`}
            title={bookmarked ? "Remove star" : "Star this"}
          >
            <IconStar filled={bookmarked} />
          </button>
          <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] px-1.5 py-0.5 rounded whitespace-nowrap opacity-0 group-hover/star:opacity-100 transition-opacity pointer-events-none z-10">
            {bookmarked ? "Starred" : "Star"}
          </span>
        </div>
      </div>

      {/* Type + grade + mode pills */}
      <div className="flex flex-wrap gap-1.5 mb-3 pr-16">
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass}`}>{program.type}</span>
        <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-50 text-yellow-700">
          Gr {program.grades}
        </span>
        {program.mode && (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-50 text-gray-500">
            {program.mode}
          </span>
        )}
        {showNew && (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-700">
            NEW
          </span>
        )}
        {expired && (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-200 text-gray-400">
            Expired
          </span>
        )}
      </div>

      {/* Title */}
      {clickableCard ? (
        <h3 className="text-base font-semibold text-gray-900 mb-0.5 pr-2 leading-snug">{program.title}</h3>
      ) : (
        <Link href={`/program/${program.id}`} onClick={(e) => e.stopPropagation()}>
          <h3 className="text-base font-semibold text-gray-900 mb-0.5 hover:text-yellow-700 transition-colors pr-2 leading-snug">
            {program.title}
          </h3>
        </Link>
      )}

      {program.organisation && (
        <p className="text-xs text-gray-400 mb-2 font-medium">{program.organisation}</p>
      )}

      <p className="text-sm text-gray-600 mb-3 line-clamp-2 leading-relaxed">{program.overview}</p>

      {/* Date + location metadata */}
      <div className="flex flex-wrap gap-3 text-xs text-gray-400 mb-2">
        {program.location && (
          <span className="flex items-center gap-1">📍 {program.location}</span>
        )}
        {program.date && (
          <span className="flex items-center gap-1">📅 {program.date}</span>
        )}
      </div>

      {/* Deadline badge */}
      {program.deadline && (
        <div className="mb-3">
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium ${deadlineStyles[urgency] || deadlineStyles.normal}`}>
            ⏰ {program.deadline}
          </span>
        </div>
      )}

      {/* Action row */}
      <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-gray-100">
        {/* Register/View: real link, not expired, not video-only */}
        {hasRealLink && !expired && !isVideoOnly && (
          <a
            href={program.registrationLink}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="px-3.5 py-1.5 rounded-lg bg-yellow-400 text-yellow-900 text-xs font-semibold hover:bg-yellow-500 transition-colors shadow-sm"
          >
            {program.type === "Podcast" || program.registrationLink?.includes("youtube") || program.registrationLink?.includes("youtu.be") ? "View →" : "Register →"}
          </a>
        )}
        {/* View (expired registration link) */}
        {hasRealLink && expired && (
          <a
            href={program.registrationLink}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="px-3.5 py-1.5 rounded-lg border border-gray-200 text-gray-500 text-xs font-medium hover:bg-gray-50 transition-colors"
          >
            View →
          </a>
        )}
        {/* View (video-only program, links to video) */}
        {isVideoOnly && !expired && (
          <a
            href={program.videoLink}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="px-3.5 py-1.5 rounded-lg bg-yellow-400 text-yellow-900 text-xs font-semibold hover:bg-yellow-500 transition-colors shadow-sm"
          >
            View →
          </a>
        )}
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); openCalendar(program); }}
          className="px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs text-gray-500 hover:bg-gray-50 transition-colors"
          title="Add to Calendar"
        >
          📅 Calendar
        </button>
        <button
          onClick={handleShare}
          className="px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs text-gray-500 hover:bg-gray-50 transition-colors relative"
        >
          Share
          {shareMsg && (
            <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap">
              {shareMsg}
            </span>
          )}
        </button>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-1 mt-3">
        {program.tags.slice(0, 4).map((tag) => (
          <span key={tag} className="px-2 py-0.5 bg-gray-50 text-gray-400 rounded text-[11px]">
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}
