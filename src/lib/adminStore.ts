import { Bulletin } from "./programs";

export const ADMIN_DATA_KEY = "ccc-admin-data-v1";

export function loadOverrideBulletins(): Bulletin[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(ADMIN_DATA_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Bulletin[];
  } catch {
    return null;
  }
}

export function saveOverrideBulletins(bulletins: Bulletin[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(ADMIN_DATA_KEY, JSON.stringify(bulletins));
}

export function clearOverrides() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(ADMIN_DATA_KEY);
}

export function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 60);
}
