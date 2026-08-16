import bulletinData from "@/data/bulletins.json";
import { loadOverrideBulletins } from "./adminStore";

export interface Program {
  id: string;
  title: string;
  type: string;
  category: string;
  campus: string;
  grades: string;
  audience: string;
  overview: string;
  date?: string;
  deadline?: string;
  venue?: string;
  time?: string;
  mode: string;
  tags: string[];
  organisation?: string;
  location?: string;
  eligibility?: string;
  registrationLink?: string;
  registrationLinkVerified?: boolean;
  deadlineDate?: string | null;
  dateISO?: string | null;
}

export interface Bulletin {
  id: string;
  title: string;
  month: string;
  source?: string;
  contact?: string;
  school?: string;
  programs: Program[];
}

export function getBulletins(): Bulletin[] {
  const overrides = loadOverrideBulletins();
  if (overrides) return overrides;
  return (bulletinData as { bulletins: Bulletin[] }).bulletins;
}

export function getLatestBulletin(): Bulletin {
  return getBulletins()[0];
}

export function getAllPrograms(): Program[] {
  return getBulletins().flatMap((b) => b.programs);
}

export function findProgram(id: string): Program | undefined {
  return getAllPrograms().find((p) => p.id === id);
}

const todayISO = () => new Date().toISOString().slice(0, 10);

export function isExpired(program: Program): boolean {
  if (!program.deadlineDate) return false;
  return program.deadlineDate < todayISO();
}

export function daysUntil(dateISO?: string | null): number | null {
  if (!dateISO) return null;
  const diff = new Date(dateISO).getTime() - new Date(todayISO()).getTime();
  return Math.round(diff / (1000 * 60 * 60 * 24));
}

export function eligibilityGroup(program: Program): string {
  const text = (program.eligibility || program.audience || "").toLowerCase();
  if (text.includes("girls")) return "Girls only";
  if (text.includes("parent")) return "Students & Parents";
  return "Students";
}

export function deadlineUrgency(program: Program): "expired" | "urgent" | "soon" | "normal" | "none" {
  if (!program.deadlineDate) return "none";
  const d = daysUntil(program.deadlineDate);
  if (d === null) return "none";
  if (d < 0) return "expired";
  if (d <= 3) return "urgent";
  if (d <= 14) return "soon";
  return "normal";
}

export function matchesDeadlineFilter(program: Program, filter: string): boolean {
  if (!filter) return true;
  if (filter === "rolling") return !program.deadlineDate;
  if (filter === "expired") return isExpired(program);
  const d = daysUntil(program.deadlineDate);
  if (d === null || d < 0) return false;
  if (filter === "week") return d <= 7;
  if (filter === "month") return d <= 30;
  return true;
}

/** Returns true only if the registration link is real/verified (not a Google search fallback) */
export function hasRealRegistrationLink(program: Program): boolean {
  if (!program.registrationLink) return false;
  if (program.registrationLink.includes("google.com/search")) return false;
  return true;
}

/** Rich text share format for WhatsApp/iMessage/email */
export function buildShareText(program: Program): string {
  const lines: string[] = [];
  lines.push(program.title);
  if (program.organisation) lines.push(program.organisation);
  lines.push("");
  if (program.date) lines.push(`Date: ${program.date}`);
  if (program.deadline) lines.push(`Deadline: ${program.deadline}`);
  if (program.venue) lines.push(`Location: ${program.venue}`);
  else if (program.location) lines.push(`Location: ${program.location}`);
  if (program.time) lines.push(`Time: ${program.time}`);
  if (program.campus) lines.push(`Campus: ${program.campus}`);
  if (program.eligibility || program.audience)
    lines.push(`Eligibility: ${program.eligibility || program.audience}`);
  lines.push("");
  lines.push("OVERVIEW");
  lines.push(program.overview);
  if (hasRealRegistrationLink(program)) {
    lines.push("");
    lines.push(`Register: ${program.registrationLink}`);
  }
  return lines.join("\n");
}

/** Opens the device's default calendar app with the event pre-filled */
export function openCalendar(program: Program) {
  // Use the event date (prefer dateISO, fall back to deadlineDate)
  const dateStr = program.dateISO || program.deadlineDate;
  const title = encodeURIComponent(program.title);
  const location = encodeURIComponent(program.venue || program.location || "");
  const details = encodeURIComponent(program.overview || "");

  if (dateStr) {
    const dt = dateStr.replace(/-/g, "");
    const gcalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dt}/${dt}&details=${details}&location=${location}`;
    window.open(gcalUrl, "_blank");
  } else {
    // No date — open Google Calendar blank
    const gcalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}`;
    window.open(gcalUrl, "_blank");
  }
}

export function programUrl(program: Program): string {
  if (typeof window !== "undefined") {
    return `${window.location.origin}/program/${program.id}`;
  }
  return `/program/${program.id}`;
}

export async function shareProgram(program: Program): Promise<"shared" | "copied" | "failed"> {
  const text = buildShareText(program);
  const shareData = {
    title: program.title,
    text,
  };
  if (typeof navigator !== "undefined" && navigator.share) {
    try {
      await navigator.share(shareData);
      return "shared";
    } catch {
      // fall through
    }
  }
  // Fallback: copy the rich text to clipboard
  try {
    await navigator.clipboard.writeText(text);
    return "copied";
  } catch {
    return "failed";
  }
}
