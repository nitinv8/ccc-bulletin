"use client";
import { useState, useEffect, useRef, useMemo } from "react";
import { Program } from "@/lib/programs";
import { slugify } from "@/lib/adminStore";
import {
  adminSignIn, adminSignUp, adminSignOut, listenAuthState, getSession,
  adminGetBulletins, adminCreateBulletin,
  adminGetPrograms, adminUpsertProgram, adminArchiveProgram,
  uploadFile,
} from "@/lib/supabaseAdmin";

// ─── constants ───────────────────────────────────────────────────────────────

const TYPE_OPTIONS = [
  "Summer Program", "Competition", "Workshop", "Internship",
  "In-Person Session", "Virtual Session", "Podcast", "Information",
];
const MODE_OPTIONS = ["Online", "In-Person", "Online/In-Person"];
const CATEGORY_OPTIONS = [
  { key: "university-visits", label: "University Visits & CCC Initiatives" },
  { key: "future-ready", label: "Activities to Make You Future Ready" },
];

// Comma-separated admin emails from env var — undefined means allow any authenticated user
const ALLOWED_EMAILS = process.env.NEXT_PUBLIC_ADMIN_EMAILS
  ? process.env.NEXT_PUBLIC_ADMIN_EMAILS.split(",").map((e) => e.trim().toLowerCase())
  : null;

const BLANK: Program = {
  id: "", title: "", type: "Information", category: "future-ready",
  campus: "SAR & ML", grades: "9-12", audience: "", overview: "",
  date: "", deadline: "", venue: "", time: "", mode: "Online",
  tags: [], organisation: "", location: "", eligibility: "",
  registrationLink: "", registrationLinkVerified: false,
  deadlineDate: null, dateISO: null,
  isNew: true, imageUrl: "", videoLink: "", qrCodeUrl: "", brochureUrl: "", instructions: "",
};

// ─── root ─────────────────────────────────────────────────────────────────────

export default function AdminPage() {
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    getSession().then((s) => setLoggedIn(!!s));
    return listenAuthState(setLoggedIn);
  }, []);

  if (loggedIn === null) return null;
  if (!loggedIn) return <AuthScreen />;
  return <AdminDashboard />;
}

// ─── auth screen ──────────────────────────────────────────────────────────────

function AuthScreen() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [busy, setBusy] = useState(false);

  const emailAllowed = !ALLOWED_EMAILS || ALLOWED_EMAILS.includes(email.toLowerCase().trim());

  const handleSubmit = async () => {
    setError(""); setInfo("");
    if (!email.trim() || password.length < 6) {
      setError("Enter your email and a password of at least 6 characters.");
      return;
    }
    if (mode === "signup" && !emailAllowed) {
      setError("That email is not on the admin allow-list.");
      return;
    }
    setBusy(true);
    try {
      if (mode === "login") {
        const { error: e } = await adminSignIn(email.trim(), password);
        if (e) setError(e.message);
      } else {
        const { error: e, data } = await adminSignUp(email.trim(), password);
        if (e) { setError(e.message); return; }
        if (data.user && !data.session) {
          setInfo("Check your email for a confirmation link, then come back to log in.");
        }
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-sm mx-auto mt-12">
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h1 className="text-lg font-bold text-gray-900 mb-1">CCC Admin</h1>
        <p className="text-sm text-gray-500 mb-4">
          {mode === "login" ? "Sign in to manage the bulletin." : "Create your admin account."}
        </p>

        <input
          type="email" value={email} onChange={(e) => setEmail(e.target.value)}
          placeholder="School email" autoFocus
          className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm mb-2 focus:outline-none focus:ring-2 focus:ring-yellow-400"
        />
        <input
          type="password" value={password} onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          placeholder="Password"
          className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-yellow-400"
        />

        {error && <p className="text-xs text-red-500 mb-2">{error}</p>}
        {info && <p className="text-xs text-green-600 mb-2">{info}</p>}

        <button
          onClick={handleSubmit} disabled={busy}
          className="w-full px-4 py-2 bg-yellow-400 text-yellow-900 rounded-lg text-sm font-semibold hover:bg-yellow-500 transition-colors disabled:opacity-50"
        >
          {busy ? "…" : mode === "login" ? "Sign in" : "Create account"}
        </button>

        <button
          onClick={() => { setMode(mode === "login" ? "signup" : "login"); setError(""); setInfo(""); }}
          className="w-full mt-2 text-xs text-gray-400 hover:text-gray-600"
        >
          {mode === "login" ? "First time? Create an account →" : "← Back to sign in"}
        </button>
      </div>
    </div>
  );
}

// ─── dashboard ────────────────────────────────────────────────────────────────

type BulletinRow = { id: string; title: string; month: string };

function AdminDashboard() {
  const [bulletins, setBulletins] = useState<BulletinRow[]>([]);
  const [bulletinIdx, setBulletinIdx] = useState(0);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Program | null>(null);
  const [isNewProgram, setIsNewProgram] = useState(false);
  const [showNewBulletin, setShowNewBulletin] = useState(false);
  const [toast, setToast] = useState("");

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const loadBulletins = async () => {
    try {
      const rows = await adminGetBulletins();
      setBulletins(rows);
    } catch (e: unknown) {
      showToast("Couldn't load bulletins — " + (e instanceof Error ? e.message : String(e)));
    }
  };

  const loadPrograms = async (bulletinId: string) => {
    setLoading(true);
    try {
      const rows = await adminGetPrograms(bulletinId);
      // map DB rows back to Program interface
      setPrograms(rows.map((r: Record<string, unknown>) => ({
        id: r.id as string,
        title: r.title as string,
        type: r.type as string,
        category: r.category as string,
        campus: r.campus as string,
        grades: r.grades as string,
        audience: (r.audience ?? "") as string,
        overview: r.overview as string,
        date: (r.date ?? "") as string,
        deadline: (r.deadline ?? "") as string,
        venue: (r.venue ?? "") as string,
        time: (r.time ?? "") as string,
        mode: r.mode as string,
        tags: (r.tags ?? []) as string[],
        organisation: (r.organisation ?? "") as string,
        location: (r.location ?? "") as string,
        eligibility: (r.eligibility ?? "") as string,
        registrationLink: (r.registration_link ?? "") as string,
        registrationLinkVerified: r.registration_link_verified as boolean,
        deadlineDate: r.deadline_date as string | null,
        dateISO: r.date_iso as string | null,
        isNew: r.is_new as boolean,
        imageUrl: (r.image_url ?? "") as string,
        videoLink: (r.video_link ?? "") as string,
        qrCodeUrl: (r.qr_code_url ?? "") as string,
        brochureUrl: (r.brochure_url ?? "") as string,
        instructions: (r.instructions ?? "") as string,
      })));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadBulletins(); }, []);

  useEffect(() => {
    if (bulletins[bulletinIdx]) loadPrograms(bulletins[bulletinIdx].id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bulletinIdx, bulletins]);

  const handleSave = async (program: Program) => {
    if (!program.title.trim()) { alert("Title is required"); return; }
    if (!program.id) program.id = slugify(program.title) || `p-${Date.now()}`;
    const bulletinId = bulletins[bulletinIdx]?.id;
    if (!bulletinId) return;
    try {
      await adminUpsertProgram(program, bulletinId);
      showToast("Saved ✓");
      setEditing(null);
      loadPrograms(bulletinId);
    } catch (e: unknown) {
      alert("Save failed: " + (e instanceof Error ? e.message : String(e)));
    }
  };

  const handleArchive = async (id: string) => {
    if (!confirm("Archive this opportunity? It will no longer appear on the site.")) return;
    try {
      await adminArchiveProgram(id);
      showToast("Archived");
      setPrograms((ps) => ps.filter((p) => p.id !== id));
    } catch (e: unknown) {
      alert("Archive failed: " + (e instanceof Error ? e.message : String(e)));
    }
  };

  const handleAddBulletin = async (month: string, title: string) => {
    const id = slugify(month) || `bulletin-${Date.now()}`;
    try {
      await adminCreateBulletin(id, month, title);
      await loadBulletins();
      setBulletinIdx(0);
      setShowNewBulletin(false);
    } catch (e: unknown) {
      alert("Couldn't create bulletin: " + (e instanceof Error ? e.message : String(e)));
    }
  };

  const bulletin = bulletins[bulletinIdx];

  return (
    <div>
      <div className="mb-6 flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">CCC Admin</h1>
          <p className="text-sm text-gray-500">Changes go live immediately — no export needed.</p>
        </div>
        <button
          onClick={() => adminSignOut()}
          className="px-3 py-1.5 text-xs text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50"
        >
          Sign out
        </button>
      </div>

      {toast && (
        <div className="mb-4 text-xs text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2 inline-block">
          {toast}
        </div>
      )}

      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <select
          value={bulletinIdx}
          onChange={(e) => setBulletinIdx(Number(e.target.value))}
          className="px-3 py-2 rounded-lg border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
        >
          {bulletins.map((b, i) => (
            <option key={b.id} value={i}>{b.month} ({b.id})</option>
          ))}
        </select>
        <button
          onClick={() => setShowNewBulletin(true)}
          className="px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-700 hover:bg-gray-50"
        >
          + New bulletin
        </button>
        <button
          onClick={() => { setEditing({ ...BLANK }); setIsNewProgram(true); }}
          className="ml-auto px-4 py-2 rounded-lg bg-gray-900 text-white text-sm font-semibold hover:bg-gray-800"
        >
          + Add opportunity
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
        {loading && <p className="p-6 text-center text-sm text-gray-400">Loading…</p>}
        {!loading && programs.length === 0 && (
          <p className="p-6 text-center text-sm text-gray-400">No opportunities in this bulletin yet.</p>
        )}
        {!loading && programs.map((p) => (
          <div key={p.id} className="p-4 flex items-center justify-between gap-3 flex-wrap">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-gray-900 truncate">{p.title}</p>
                {p.isNew && (
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-green-100 text-green-700">NEW</span>
                )}
              </div>
              <p className="text-xs text-gray-500">
                {p.type} · Grades {p.grades}
                {p.deadline ? ` · Deadline: ${p.deadline}` : ""}
              </p>
            </div>
            <div className="flex gap-2 shrink-0">
              <button
                onClick={() => { setEditing({ ...p }); setIsNewProgram(false); }}
                className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs text-gray-700 hover:bg-gray-50"
              >
                Edit
              </button>
              <button
                onClick={() => handleArchive(p.id)}
                className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs text-orange-600 hover:bg-orange-50"
              >
                Archive
              </button>
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <ProgramEditor
          program={editing}
          bulletinId={bulletin?.id ?? ""}
          isNew={isNewProgram}
          onCancel={() => setEditing(null)}
          onSave={handleSave}
        />
      )}

      {showNewBulletin && (
        <NewBulletinModal
          onCancel={() => setShowNewBulletin(false)}
          onCreate={handleAddBulletin}
        />
      )}
    </div>
  );
}

// ─── new bulletin modal ───────────────────────────────────────────────────────

function NewBulletinModal({ onCancel, onCreate }: {
  onCancel: () => void;
  onCreate: (month: string, title: string) => void;
}) {
  const [month, setMonth] = useState("");
  const [title, setTitle] = useState("Career Counselling Centre Weekly Bulletin");
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-sm">
        <h3 className="font-semibold text-gray-900 mb-3">New bulletin</h3>
        <label className="text-xs text-gray-500">Month label (e.g. "JULY 2026")</label>
        <input
          value={month} onChange={(e) => setMonth(e.target.value.toUpperCase())} autoFocus
          className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm mb-3 mt-1"
        />
        <label className="text-xs text-gray-500">Title</label>
        <input
          value={title} onChange={(e) => setTitle(e.target.value)}
          className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm mb-4 mt-1"
        />
        <div className="flex justify-end gap-2">
          <button onClick={onCancel} className="px-3 py-2 text-sm text-gray-600">Cancel</button>
          <button
            onClick={() => month.trim() && onCreate(month.trim(), title.trim())}
            className="px-4 py-2 bg-yellow-400 text-yellow-900 rounded-lg text-sm font-semibold hover:bg-yellow-500"
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── program editor ───────────────────────────────────────────────────────────

function ProgramEditor({ program, bulletinId, isNew, onCancel, onSave }: {
  program: Program;
  bulletinId: string;
  isNew: boolean;
  onCancel: () => void;
  onSave: (p: Program) => void;
}) {
  const [form, setForm] = useState<Program>(program);
  const [extracting, setExtracting] = useState(false);
  const [extractMsg, setExtractMsg] = useState("");
  const [uploading, setUploading] = useState<string | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const extractInputRef = useRef<HTMLInputElement>(null);

  const set = <K extends keyof Program>(key: K, value: Program[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const tagsStr = useMemo(() => form.tags.join(", "), [form.tags]);

  const handleFileUpload = async (file: File, field: "imageUrl" | "qrCodeUrl" | "brochureUrl") => {
    setUploading(field);
    try {
      const url = await uploadFile(file);
      set(field, url);
    } catch (e: unknown) {
      alert("Upload failed: " + (e instanceof Error ? e.message : String(e)));
    } finally {
      setUploading(null);
    }
  };

  const handleAiExtract = async (file: File) => {
    setExtracting(true);
    setExtractMsg("Extracting details from image…");
    try {
      const fd = new FormData();
      fd.append("image", file);
      const res = await fetch("/api/ai-extract", { method: "POST", body: fd });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setForm((f) => ({
        ...f,
        title: data.title || f.title,
        organisation: data.organisation || f.organisation,
        overview: data.overview || f.overview,
        date: data.date || f.date,
        deadline: data.deadline || f.deadline,
        time: data.time || f.time,
        location: data.location || f.location,
        grades: data.grades || f.grades,
        eligibility: data.eligibility || f.eligibility,
        audience: data.eligibility || f.audience,
        registrationLink: data.registrationLink || f.registrationLink,
        type: data.type || f.type,
        mode: data.mode || f.mode,
        instructions: data.instructions || f.instructions,
        tags: data.tags?.length ? data.tags : f.tags,
      }));
      setExtractMsg("Fields filled from image — review and save.");
    } catch (e: unknown) {
      setExtractMsg("Extraction failed: " + (e instanceof Error ? e.message : String(e)));
    } finally {
      setExtracting(false);
      setTimeout(() => setExtractMsg(""), 5000);
    }
  };

  const f = "w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400";
  const l = "text-xs text-gray-500 font-medium";

  const UploadBtn = ({ field, label }: { field: "imageUrl" | "qrCodeUrl" | "brochureUrl"; label: string }) => (
    <label className="cursor-pointer text-xs text-yellow-700 hover:underline ml-2">
      {uploading === field ? "Uploading…" : label}
      <input
        type="file"
        accept="image/*,application/pdf"
        className="hidden"
        disabled={!!uploading}
        onChange={(e) => { const file = e.target.files?.[0]; if (file) handleFileUpload(file, field); }}
      />
    </label>
  );

  return (
    <div className="fixed inset-0 bg-black/40 flex items-start justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-xl p-6 w-full max-w-2xl my-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">{isNew ? "Add opportunity" : "Edit opportunity"}</h3>
          {/* AI extract */}
          <div className="flex items-center gap-2">
            {extractMsg && <span className="text-xs text-gray-500">{extractMsg}</span>}
            <button
              onClick={() => extractInputRef.current?.click()}
              disabled={extracting}
              className="px-3 py-1.5 rounded-lg bg-purple-50 border border-purple-200 text-xs text-purple-700 font-medium hover:bg-purple-100 disabled:opacity-50"
            >
              {extracting ? "Extracting…" : "✨ Extract from image"}
            </button>
            <input
              ref={extractInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleAiExtract(f); }}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Core fields */}
          <div className="sm:col-span-2">
            <label className={l}>Title *</label>
            <input className={f} value={form.title} onChange={(e) => set("title", e.target.value)} autoFocus />
          </div>

          <div>
            <label className={l}>Type</label>
            <select className={f} value={form.type} onChange={(e) => set("type", e.target.value)}>
              {TYPE_OPTIONS.map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className={l}>Category</label>
            <select className={f} value={form.category} onChange={(e) => set("category", e.target.value)}>
              {CATEGORY_OPTIONS.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}
            </select>
          </div>

          <div>
            <label className={l}>Organisation</label>
            <input className={f} value={form.organisation || ""} onChange={(e) => set("organisation", e.target.value)} />
          </div>
          <div>
            <label className={l}>Grades (e.g. 9-12)</label>
            <input className={f} value={form.grades} onChange={(e) => set("grades", e.target.value)} />
          </div>

          <div className="sm:col-span-2">
            <label className={l}>Eligibility / Audience</label>
            <input
              className={f} value={form.eligibility || form.audience}
              onChange={(e) => { set("eligibility", e.target.value); set("audience", e.target.value); }}
            />
          </div>

          <div className="sm:col-span-2">
            <label className={l}>Description / Overview</label>
            <textarea className={f} rows={3} value={form.overview} onChange={(e) => set("overview", e.target.value)} />
          </div>

          <div>
            <label className={l}>Format</label>
            <select className={f} value={form.mode} onChange={(e) => set("mode", e.target.value)}>
              {MODE_OPTIONS.map((m) => <option key={m}>{m}</option>)}
            </select>
          </div>
          <div>
            <label className={l}>Location</label>
            <input className={f} value={form.location || ""} onChange={(e) => set("location", e.target.value)} />
          </div>

          <div>
            <label className={l}>Venue (if in-person)</label>
            <input className={f} value={form.venue || ""} onChange={(e) => set("venue", e.target.value)} />
          </div>
          <div>
            <label className={l}>Campus</label>
            <input className={f} value={form.campus} onChange={(e) => set("campus", e.target.value)} />
          </div>

          <div>
            <label className={l}>Date (display)</label>
            <input className={f} value={form.date || ""} onChange={(e) => set("date", e.target.value)} />
          </div>
          <div>
            <label className={l}>Date ISO (calendar/sort)</label>
            <input type="date" className={f} value={form.dateISO || ""} onChange={(e) => set("dateISO", e.target.value)} />
          </div>

          <div>
            <label className={l}>Deadline (display)</label>
            <input className={f} value={form.deadline || ""} onChange={(e) => set("deadline", e.target.value)} />
          </div>
          <div>
            <label className={l}>Deadline ISO (expiry)</label>
            <input type="date" className={f} value={form.deadlineDate || ""} onChange={(e) => set("deadlineDate", e.target.value)} />
          </div>

          <div>
            <label className={l}>Time</label>
            <input className={f} value={form.time || ""} onChange={(e) => set("time", e.target.value)} />
          </div>
          <div>
            <label className={l}>Tags (comma separated)</label>
            <input
              className={f} value={tagsStr}
              onChange={(e) => set("tags", e.target.value.split(",").map((t) => t.trim()).filter(Boolean))}
            />
          </div>

          <div className="sm:col-span-2">
            <label className={l}>Registration Link</label>
            <input
              className={f} value={form.registrationLink || ""} placeholder="https://…"
              onChange={(e) => set("registrationLink", e.target.value)}
            />
            <label className="flex items-center gap-2 mt-1.5 text-xs text-gray-500">
              <input
                type="checkbox" checked={!!form.registrationLinkVerified}
                onChange={(e) => set("registrationLinkVerified", e.target.checked)}
              />
              Verified official link
            </label>
          </div>

          {/* Phase 2 fields ─────────────────────────────────── */}
          <div className="sm:col-span-2 pt-3 border-t border-gray-100">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Media & extras</p>
          </div>

          <div className="sm:col-span-2">
            <label className={l}>
              Poster / Image URL
              <UploadBtn field="imageUrl" label="Upload image" />
            </label>
            <input className={f} value={form.imageUrl || ""} placeholder="https://…"
              onChange={(e) => set("imageUrl", e.target.value)} />
            {form.imageUrl && (
              <img src={form.imageUrl} alt="" className="mt-2 h-24 rounded-lg object-cover border border-gray-100" />
            )}
          </div>

          <div className="sm:col-span-2">
            <label className={l}>Video Link (YouTube / Drive)</label>
            <input className={f} value={form.videoLink || ""} placeholder="https://…"
              onChange={(e) => set("videoLink", e.target.value)} />
          </div>

          <div>
            <label className={l}>
              QR Code URL
              <UploadBtn field="qrCodeUrl" label="Upload QR" />
            </label>
            <input className={f} value={form.qrCodeUrl || ""} placeholder="https://…"
              onChange={(e) => set("qrCodeUrl", e.target.value)} />
          </div>
          <div>
            <label className={l}>
              Brochure URL
              <UploadBtn field="brochureUrl" label="Upload PDF" />
            </label>
            <input className={f} value={form.brochureUrl || ""} placeholder="https://…"
              onChange={(e) => set("brochureUrl", e.target.value)} />
          </div>

          <div className="sm:col-span-2">
            <label className={l}>How to Apply / Instructions</label>
            <textarea className={f} rows={3} value={form.instructions || ""}
              onChange={(e) => set("instructions", e.target.value)} />
          </div>

          <div className="sm:col-span-2">
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox" checked={!!form.isNew}
                onChange={(e) => set("isNew", e.target.checked)}
                className="rounded"
              />
              Mark as <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-green-100 text-green-700">NEW</span>
              (badge disappears once the event has passed)
            </label>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-gray-100">
          <button onClick={onCancel} className="px-4 py-2 text-sm text-gray-600">Cancel</button>
          <button
            onClick={() => onSave(form)}
            className="px-5 py-2 bg-yellow-400 text-yellow-900 rounded-lg text-sm font-semibold hover:bg-yellow-500"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
