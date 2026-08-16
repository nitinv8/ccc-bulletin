"use client";
import { useState, useEffect, useMemo } from "react";
import { Bulletin, Program } from "@/lib/programs";
import { saveOverrideBulletins, loadOverrideBulletins, clearOverrides, slugify } from "@/lib/adminStore";
import bulletinData from "@/data/bulletins.json";

const PASSCODE_KEY = "ccc-admin-passcode";
const TYPE_OPTIONS = [
  "Summer Program",
  "Competition",
  "Workshop",
  "Internship",
  "In-Person Session",
  "Virtual Session",
  "Podcast",
  "Information",
];
const MODE_OPTIONS = ["Online", "In-Person", "Online/In-Person"];
const CATEGORY_OPTIONS = [
  { key: "university-visits", label: "University Visits & CCC Initiatives" },
  { key: "future-ready", label: "Activities to Make You Future Ready" },
];

const BLANK_PROGRAM: Program = {
  id: "",
  title: "",
  type: "Information",
  category: "future-ready",
  campus: "SAR & ML",
  grades: "9-12",
  audience: "",
  overview: "",
  date: "",
  deadline: "",
  venue: "",
  time: "",
  mode: "Online",
  tags: [],
  organisation: "",
  location: "",
  eligibility: "",
  registrationLink: "",
  registrationLinkVerified: false,
  deadlineDate: null,
  dateISO: null,
};

function loadWorkingCopy(): Bulletin[] {
  return loadOverrideBulletins() || JSON.parse(JSON.stringify((bulletinData as { bulletins: Bulletin[] }).bulletins));
}

export default function AdminPage() {
  const [unlocked, setUnlocked] = useState(false);
  const [hasPasscode, setHasPasscode] = useState<boolean | null>(null);
  const [passInput, setPassInput] = useState("");
  const [passError, setPassError] = useState("");

  useEffect(() => {
    setHasPasscode(!!localStorage.getItem(PASSCODE_KEY));
  }, []);

  const handleSetPasscode = () => {
    if (passInput.length < 4) {
      setPassError("Choose at least 4 characters");
      return;
    }
    localStorage.setItem(PASSCODE_KEY, passInput);
    setUnlocked(true);
    setHasPasscode(true);
  };

  const handleLogin = () => {
    if (passInput === localStorage.getItem(PASSCODE_KEY)) {
      setUnlocked(true);
      setPassError("");
    } else {
      setPassError("Incorrect passcode");
    }
  };

  if (hasPasscode === null) return null;

  if (!unlocked) {
    return (
      <div className="max-w-sm mx-auto mt-12">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h1 className="text-lg font-bold text-gray-900 mb-1">CCC Admin</h1>
          <p className="text-sm text-gray-500 mb-4">
            {hasPasscode ? "Enter the admin passcode to continue." : "Set an admin passcode for this device."}
          </p>
          <input
            type="password"
            value={passInput}
            onChange={(e) => setPassInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (hasPasscode ? handleLogin() : handleSetPasscode())}
            placeholder="Passcode"
            className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm mb-2 focus:outline-none focus:ring-2 focus:ring-yellow-400"
            autoFocus
          />
          {passError && <p className="text-xs text-red-500 mb-2">{passError}</p>}
          <button
            onClick={hasPasscode ? handleLogin : handleSetPasscode}
            className="w-full px-4 py-2 bg-yellow-400 text-yellow-900 rounded-lg text-sm font-semibold hover:bg-yellow-500 transition-colors"
          >
            {hasPasscode ? "Log in" : "Set passcode & continue"}
          </button>
          <p className="text-[11px] text-gray-400 mt-3">
            This is a lightweight, device-local lock — not full account security. Don't use it to protect
            sensitive data.
          </p>
        </div>
      </div>
    );
  }

  return <AdminDashboard />;
}

function AdminDashboard() {
  const [bulletins, setBulletins] = useState<Bulletin[]>(loadWorkingCopy);
  const [bulletinIdx, setBulletinIdx] = useState(0);
  const [editing, setEditing] = useState<Program | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [showNewBulletin, setShowNewBulletin] = useState(false);
  const [savedMsg, setSavedMsg] = useState("");
  const [importMsg, setImportMsg] = useState("");

  const bulletin = bulletins[bulletinIdx];

  const persist = (next: Bulletin[]) => {
    setBulletins(next);
    saveOverrideBulletins(next);
    setSavedMsg("Saved to this device — export to publish site-wide");
    setTimeout(() => setSavedMsg(""), 3000);
  };

  const openNew = () => {
    setEditing({ ...BLANK_PROGRAM });
    setIsNew(true);
  };

  const openEdit = (p: Program) => {
    setEditing({ ...p });
    setIsNew(false);
  };

  const handleDelete = (id: string) => {
    if (!confirm("Move this opportunity out? This removes it from the site (export first if unsure).")) return;
    const next = bulletins.map((b, i) =>
      i === bulletinIdx ? { ...b, programs: b.programs.filter((p) => p.id !== id) } : b
    );
    persist(next);
  };

  const handleSave = (program: Program) => {
    if (!program.title.trim()) {
      alert("Title is required");
      return;
    }
    if (!program.id) program.id = slugify(program.title) || `program-${Date.now()}`;
    const next = bulletins.map((b, i) => {
      if (i !== bulletinIdx) return b;
      const exists = b.programs.some((p) => p.id === program.id);
      const programs = exists
        ? b.programs.map((p) => (p.id === program.id ? program : p))
        : [...b.programs, program];
      return { ...b, programs };
    });
    persist(next);
    setEditing(null);
  };

  const handleAddBulletin = (month: string, title: string) => {
    const id = slugify(month);
    const next = [{ id, title, month, programs: [] }, ...bulletins];
    persist(next);
    setBulletinIdx(0);
    setShowNewBulletin(false);
  };

  const handleExport = () => {
    const blob = new Blob([JSON.stringify({ bulletins }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "bulletins.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result as string);
        const arr = parsed.bulletins || parsed;
        if (!Array.isArray(arr)) throw new Error("bad format");
        persist(arr);
        setImportMsg("Imported successfully");
        setBulletinIdx(0);
      } catch {
        setImportMsg("Could not read that file — expecting the bulletins.json format");
      }
      setTimeout(() => setImportMsg(""), 3000);
    };
    reader.readAsText(file);
  };

  const handleReset = () => {
    if (!confirm("Discard all local admin edits and revert to the last published data?")) return;
    clearOverrides();
    setBulletins(loadWorkingCopy());
  };

  return (
    <div>
      <div className="mb-6 flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">CCC Admin</h1>
          <p className="text-sm text-gray-500">
            Add, edit, and organise opportunities — no code required.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleExport}
            className="px-3 py-2 rounded-lg bg-yellow-400 text-yellow-900 text-sm font-semibold hover:bg-yellow-500 transition-colors"
          >
            Export bulletins.json
          </button>
          <label className="px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer transition-colors">
            Import JSON
            <input
              type="file"
              accept="application/json"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleImport(e.target.files[0])}
            />
          </label>
          <button
            onClick={handleReset}
            className="px-3 py-2 rounded-lg border border-gray-200 text-sm text-red-600 hover:bg-red-50 transition-colors"
          >
            Reset to published
          </button>
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6 text-sm text-yellow-800">
        <strong>How publishing works:</strong> your edits save instantly to this browser so you can preview
        them right away. To make them live for every student and parent, click <strong>Export bulletins.json</strong>{" "}
        and send the file to whoever deploys the site (or paste it into a Claude chat and ask for the site
        to be redeployed with the updated data).
      </div>

      {(savedMsg || importMsg) && (
        <div className="mb-4 text-xs text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2 inline-block">
          {savedMsg || importMsg}
        </div>
      )}

      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <select
          value={bulletinIdx}
          onChange={(e) => setBulletinIdx(Number(e.target.value))}
          className="px-3 py-2 rounded-lg border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
        >
          {bulletins.map((b, i) => (
            <option key={b.id} value={i}>
              {b.month} ({b.programs.length})
            </option>
          ))}
        </select>
        <button
          onClick={() => setShowNewBulletin(true)}
          className="px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
        >
          + New bulletin (month)
        </button>
        <button
          onClick={openNew}
          className="ml-auto px-4 py-2 rounded-lg bg-gray-900 text-white text-sm font-semibold hover:bg-gray-800 transition-colors"
        >
          + Add opportunity
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
        {bulletin.programs.length === 0 && (
          <p className="p-6 text-center text-sm text-gray-400">No opportunities in this bulletin yet.</p>
        )}
        {bulletin.programs.map((p) => (
          <div key={p.id} className="p-4 flex items-center justify-between gap-3 flex-wrap">
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{p.title}</p>
              <p className="text-xs text-gray-500">
                {p.type} · Grades {p.grades} · {p.category === "university-visits" ? "University Visits" : "Future Ready"}
                {p.deadline ? ` · Deadline: ${p.deadline}` : ""}
              </p>
            </div>
            <div className="flex gap-2 shrink-0">
              <button
                onClick={() => openEdit(p)}
                className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(p.id)}
                className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs text-red-600 hover:bg-red-50 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <ProgramEditor
          program={editing}
          isNew={isNew}
          onCancel={() => setEditing(null)}
          onSave={handleSave}
        />
      )}

      {showNewBulletin && (
        <NewBulletinModal onCancel={() => setShowNewBulletin(false)} onCreate={handleAddBulletin} />
      )}
    </div>
  );
}

function NewBulletinModal({
  onCancel,
  onCreate,
}: {
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
          value={month}
          onChange={(e) => setMonth(e.target.value.toUpperCase())}
          className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm mb-3 mt-1"
          autoFocus
        />
        <label className="text-xs text-gray-500">Title</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm mb-4 mt-1"
        />
        <div className="flex justify-end gap-2">
          <button onClick={onCancel} className="px-3 py-2 text-sm text-gray-600">
            Cancel
          </button>
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

function ProgramEditor({
  program,
  isNew,
  onCancel,
  onSave,
}: {
  program: Program;
  isNew: boolean;
  onCancel: () => void;
  onSave: (p: Program) => void;
}) {
  const [form, setForm] = useState<Program>(program);
  const set = <K extends keyof Program>(key: K, value: Program[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const tagsStr = useMemo(() => form.tags.join(", "), [form.tags]);

  const field = "w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400";
  const label = "text-xs text-gray-500 font-medium";

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-xl p-6 w-full max-w-2xl my-8 max-h-[90vh] overflow-y-auto">
        <h3 className="font-semibold text-gray-900 mb-4">{isNew ? "Add opportunity" : "Edit opportunity"}</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className={label}>Title *</label>
            <input className={field} value={form.title} onChange={(e) => set("title", e.target.value)} />
          </div>

          <div>
            <label className={label}>Type</label>
            <select className={field} value={form.type} onChange={(e) => set("type", e.target.value)}>
              {TYPE_OPTIONS.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={label}>Category</label>
            <select className={field} value={form.category} onChange={(e) => set("category", e.target.value)}>
              {CATEGORY_OPTIONS.map((c) => (
                <option key={c.key} value={c.key}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={label}>Organisation</label>
            <input
              className={field}
              value={form.organisation || ""}
              onChange={(e) => set("organisation", e.target.value)}
            />
          </div>
          <div>
            <label className={label}>Grades (e.g. 9-12)</label>
            <input className={field} value={form.grades} onChange={(e) => set("grades", e.target.value)} />
          </div>

          <div className="sm:col-span-2">
            <label className={label}>Eligibility / Audience</label>
            <input
              className={field}
              value={form.eligibility || form.audience}
              onChange={(e) => {
                set("eligibility", e.target.value);
                set("audience", e.target.value);
              }}
            />
          </div>

          <div className="sm:col-span-2">
            <label className={label}>Description / Overview</label>
            <textarea
              className={field}
              rows={3}
              value={form.overview}
              onChange={(e) => set("overview", e.target.value)}
            />
          </div>

          <div>
            <label className={label}>Format</label>
            <select className={field} value={form.mode} onChange={(e) => set("mode", e.target.value)}>
              {MODE_OPTIONS.map((m) => (
                <option key={m}>{m}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={label}>Location</label>
            <input className={field} value={form.location || ""} onChange={(e) => set("location", e.target.value)} />
          </div>

          <div>
            <label className={label}>Venue (if in-person)</label>
            <input className={field} value={form.venue || ""} onChange={(e) => set("venue", e.target.value)} />
          </div>
          <div>
            <label className={label}>Campus</label>
            <input className={field} value={form.campus} onChange={(e) => set("campus", e.target.value)} />
          </div>

          <div>
            <label className={label}>Date (display text)</label>
            <input className={field} value={form.date || ""} onChange={(e) => set("date", e.target.value)} />
          </div>
          <div>
            <label className={label}>Date (ISO, for calendar/sorting)</label>
            <input
              type="date"
              className={field}
              value={form.dateISO || ""}
              onChange={(e) => set("dateISO", e.target.value)}
            />
          </div>

          <div>
            <label className={label}>Deadline (display text)</label>
            <input className={field} value={form.deadline || ""} onChange={(e) => set("deadline", e.target.value)} />
          </div>
          <div>
            <label className={label}>Deadline (ISO, for expiry/sorting)</label>
            <input
              type="date"
              className={field}
              value={form.deadlineDate || ""}
              onChange={(e) => set("deadlineDate", e.target.value)}
            />
          </div>

          <div>
            <label className={label}>Time</label>
            <input className={field} value={form.time || ""} onChange={(e) => set("time", e.target.value)} />
          </div>
          <div>
            <label className={label}>Tags (comma separated)</label>
            <input
              className={field}
              value={tagsStr}
              onChange={(e) =>
                set(
                  "tags",
                  e.target.value.split(",").map((t) => t.trim()).filter(Boolean)
                )
              }
            />
          </div>

          <div className="sm:col-span-2">
            <label className={label}>Official Registration Link</label>
            <input
              className={field}
              value={form.registrationLink || ""}
              onChange={(e) => set("registrationLink", e.target.value)}
              placeholder="https://..."
            />
            <label className="flex items-center gap-2 mt-1.5 text-xs text-gray-500">
              <input
                type="checkbox"
                checked={!!form.registrationLinkVerified}
                onChange={(e) => set("registrationLinkVerified", e.target.checked)}
              />
              This is the verified official registration link
            </label>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-gray-100">
          <button onClick={onCancel} className="px-4 py-2 text-sm text-gray-600">
            Cancel
          </button>
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
