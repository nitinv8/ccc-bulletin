import { supabase } from "./supabase";
import { Program } from "./programs";

// ——— Auth ———

export async function adminSignIn(email: string, password: string) {
  return supabase.auth.signInWithPassword({ email, password });
}

export async function adminSignUp(email: string, password: string) {
  return supabase.auth.signUp({ email, password, options: { emailRedirectTo: undefined } });
}

export async function adminSignOut() {
  return supabase.auth.signOut();
}

export function listenAuthState(cb: (loggedIn: boolean) => void) {
  const { data } = supabase.auth.onAuthStateChange((_event, session) => cb(!!session));
  return () => data.subscription.unsubscribe();
}

export async function getSession() {
  const { data } = await supabase.auth.getSession();
  return data.session;
}

// ——— Bulletins ———

export async function adminGetBulletins() {
  const { data, error } = await supabase
    .from("bulletins")
    .select("id, title, month, source, contact, school, created_at")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function adminCreateBulletin(id: string, month: string, title: string) {
  const { error } = await supabase.from("bulletins").insert({ id, month, title });
  if (error) throw error;
}

// ——— Programs ———

export async function adminGetPrograms(bulletinId: string) {
  const { data, error } = await supabase
    .from("programs")
    .select("*")
    .eq("bulletin_id", bulletinId)
    .neq("admin_archived", true)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function adminUpsertProgram(program: Program, bulletinId: string) {
  const { error } = await supabase
    .from("programs")
    .upsert(programToRow(program, bulletinId), { onConflict: "id" });
  if (error) throw error;
}

export async function adminArchiveProgram(id: string) {
  const { error } = await supabase
    .from("programs")
    .update({ admin_archived: true })
    .eq("id", id);
  if (error) throw error;
}

export async function adminRestoreProgram(id: string) {
  const { error } = await supabase
    .from("programs")
    .update({ admin_archived: false })
    .eq("id", id);
  if (error) throw error;
}

export async function adminDeleteProgram(id: string) {
  const { error } = await supabase
    .from("programs")
    .delete()
    .eq("id", id);
  if (error) throw error;
}

export async function adminGetArchivedPrograms(bulletinId: string) {
  const { data, error } = await supabase
    .from("programs")
    .select("*")
    .eq("bulletin_id", bulletinId)
    .eq("admin_archived", true)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

// ——— Storage ———

export async function uploadFile(file: File): Promise<string> {
  const ext = file.name.split(".").pop() ?? "bin";
  const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const { error } = await supabase.storage.from("ccc-uploads").upload(path, file);
  if (error) throw error;
  const { data } = supabase.storage.from("ccc-uploads").getPublicUrl(path);
  return data.publicUrl;
}

// ——— Mapper: Program → DB row ———

function programToRow(p: Program, bulletinId: string) {
  return {
    id: p.id,
    bulletin_id: bulletinId,
    title: p.title,
    type: p.type,
    category: p.category,
    campus: p.campus,
    grades: p.grades,
    audience: p.audience || p.eligibility || "",
    overview: p.overview,
    organisation: p.organisation || null,
    location: p.location || null,
    venue: p.venue || null,
    time: p.time || null,
    mode: p.mode,
    tags: p.tags,
    eligibility: p.eligibility || null,
    date: p.date || null,
    date_iso: p.dateISO || null,
    deadline: p.deadline || null,
    deadline_date: p.deadlineDate || null,
    registration_link: p.registrationLink || null,
    registration_link_verified: p.registrationLinkVerified ?? false,
    video_link: p.videoLink || null,
    image_url: p.imageUrl || null,
    qr_code_url: p.qrCodeUrl || null,
    brochure_url: p.brochureUrl || null,
    instructions: p.instructions || null,
    is_new: p.isNew ?? false,
    admin_archived: false,
  };
}
