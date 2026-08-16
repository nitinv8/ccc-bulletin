"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface InteractionsContextType {
  starred: string[];
  archived: string[];
  isBookmarked: (id: string) => boolean;
  toggleBookmark: (id: string) => void;
  isArchived: (id: string) => boolean;
  archive: (id: string) => void;
  unarchive: (id: string) => void;
}

const InteractionsContext = createContext<InteractionsContextType>({
  starred: [],
  archived: [],
  isBookmarked: () => false,
  toggleBookmark: () => {},
  isArchived: () => false,
  archive: () => {},
  unarchive: () => {},
});

export function BookmarkProvider({ children }: { children: ReactNode }) {
  const [starred, setStarred] = useState<string[]>([]);
  const [archived, setArchived] = useState<string[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const savedStars = localStorage.getItem("ccc-bookmarks");
      if (savedStars) setStarred(JSON.parse(savedStars));
      const savedArchive = localStorage.getItem("ccc-archived");
      if (savedArchive) setArchived(JSON.parse(savedArchive));
    } catch {}
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) localStorage.setItem("ccc-bookmarks", JSON.stringify(starred));
  }, [starred, loaded]);

  useEffect(() => {
    if (loaded) localStorage.setItem("ccc-archived", JSON.stringify(archived));
  }, [archived, loaded]);

  const isBookmarked = (id: string) => starred.includes(id);
  const toggleBookmark = (id: string) => {
    setStarred((prev) => (prev.includes(id) ? prev.filter((b) => b !== id) : [...prev, id]));
  };

  const isArchived = (id: string) => archived.includes(id);
  const archive = (id: string) => {
    setArchived((prev) => (prev.includes(id) ? prev : [...prev, id]));
  };
  const unarchive = (id: string) => {
    setArchived((prev) => prev.filter((a) => a !== id));
  };

  return (
    <InteractionsContext.Provider
      value={{ starred, archived, isBookmarked, toggleBookmark, isArchived, archive, unarchive }}
    >
      {children}
    </InteractionsContext.Provider>
  );
}

export const useBookmarks = () => useContext(InteractionsContext);
export const useInteractions = () => useContext(InteractionsContext);
