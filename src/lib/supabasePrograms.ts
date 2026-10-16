import { supabase } from "./supabase";
import { Program, Bulletin } from "./programs";

type SupabaseProgram = {
  id: string;
  bulletin_id: string;
  title: string;
  type: string;
  category: string;
  campus: string;
  grades: string;
  audience: string;
  overview: string;
  organisation: string | null;
  location: string | null;
  venue: string | null;
  time: string | null;
  mode: string;
  tags: string[];
  eligibility: string | null;
  date: string | null;
  date_iso: string | null;
  deadline: string | null;
  deadline_date: string | null;
  registration_link: string | null;
  registration_link_verified: boolean;
  video_link: string | null;
  image_url: string | null;
  qr_code_url: string | null;
  brochure_url: string | null;
  instructions: string | null;
  is_new: boolean;
  admin_archived: boolean;
};

function toProgram(row: SupabaseProgram): Program {
  return {
    id: row.id,
    title: row.title,
    type: row.type,
    category: row.category,
    campus: row.campus,
    grades: row.grades,
    audience: row.audience,
    overview: row.overview,
    date: row.date ?? undefined,
    deadline: row.deadline ?? undefined,
    venue: row.venue ?? undefined,
    time: row.time ?? undefined,
    mode: row.mode,
    tags: row.tags ?? [],
    organisation: row.organisation ?? undefined,
    location: row.location ?? undefined,
    eligibility: row.eligibility ?? undefined,
    registrationLink: row.registration_link ?? undefined,
    registrationLinkVerified: row.registration_link_verified,
    deadlineDate: row.deadline_date,
    dateISO: row.date_iso,
  };
}

export async function getSupabaseBulletins(): Promise<Bulletin[]> {
  const { data: bulletinRows, error: bError } = await supabase
    .from("bulletins")
    .select("id, title, month, source, contact, school")
    .order("created_at", { ascending: false });

  if (bError || !bulletinRows) return [];

  const { data: programRows, error: pError } = await supabase
    .from("programs")
    .select("*")
    .eq("admin_archived", false)
    .order("created_at", { ascending: false });

  if (pError || !programRows) return [];

  const programsByBulletin = new Map<string, Program[]>();
  for (const row of programRows as SupabaseProgram[]) {
    const list = programsByBulletin.get(row.bulletin_id) ?? [];
    list.push(toProgram(row));
    programsByBulletin.set(row.bulletin_id, list);
  }

  return bulletinRows.map((b) => ({
    id: b.id,
    title: b.title,
    month: b.month,
    source: b.source ?? undefined,
    contact: b.contact ?? undefined,
    school: b.school ?? undefined,
    programs: programsByBulletin.get(b.id) ?? [],
  }));
}

export async function getSupabaseAllPrograms(): Promise<Program[]> {
  const { data, error } = await supabase
    .from("programs")
    .select("*")
    .eq("admin_archived", false)
    .order("created_at", { ascending: false });

  if (error || !data) return [];
  return (data as SupabaseProgram[]).map(toProgram);
}

export async function getSupabaseProgram(id: string): Promise<Program | null> {
  const { data, error } = await supabase
    .from("programs")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) return null;
  return toProgram(data as SupabaseProgram);
}
