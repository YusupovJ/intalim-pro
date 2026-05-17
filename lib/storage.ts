"use client";

import { useEffect, useState } from "react";

export interface TicketResult {
  correct: number;
  total: number;
  dateIso: string;
}

const LAST_RESULT_PREFIX = "lastResult-";
const BOOKMARKS_KEY = "bookmarks";
const BOOKMARKS_EVENT = "intalim:bookmarks-changed";

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

export function getLastResult(ticketId: number): TicketResult | null {
  if (!isBrowser()) return null;
  try {
    const raw = localStorage.getItem(LAST_RESULT_PREFIX + ticketId);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as TicketResult;
    if (
      typeof parsed.correct !== "number" ||
      typeof parsed.total !== "number" ||
      typeof parsed.dateIso !== "string"
    ) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function saveLastResult(ticketId: number, r: TicketResult): void {
  if (!isBrowser()) return;
  localStorage.setItem(LAST_RESULT_PREFIX + ticketId, JSON.stringify(r));
}

export function getBookmarks(): number[] {
  if (!isBrowser()) return [];
  try {
    const raw = localStorage.getItem(BOOKMARKS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((x): x is number => typeof x === "number");
  } catch {
    return [];
  }
}

function saveBookmarks(ids: number[]): void {
  if (!isBrowser()) return;
  localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(ids));
  window.dispatchEvent(new CustomEvent(BOOKMARKS_EVENT));
}

export function isBookmarked(qId: number): boolean {
  return getBookmarks().includes(qId);
}

export function toggleBookmark(qId: number): boolean {
  const list = getBookmarks();
  const idx = list.indexOf(qId);
  if (idx >= 0) {
    list.splice(idx, 1);
    saveBookmarks(list);
    return false;
  }
  list.push(qId);
  saveBookmarks(list);
  return true;
}

export function useBookmarks(): number[] {
  const [ids, setIds] = useState<number[]>([]);
  useEffect(() => {
    setIds(getBookmarks());
    const onChange = () => setIds(getBookmarks());
    window.addEventListener(BOOKMARKS_EVENT, onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener(BOOKMARKS_EVENT, onChange);
      window.removeEventListener("storage", onChange);
    };
  }, []);
  return ids;
}

export function useIsBookmarked(qId: number): boolean {
  const ids = useBookmarks();
  return ids.includes(qId);
}
