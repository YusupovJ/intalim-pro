"use client";

import {
  apiAddBookmark,
  apiCreateResult,
  type BookmarkRecord,
  type ResultRecord,
} from "./api";

interface MigrationResult {
  pushed: { bookmarks: number; results: number };
  failed: { bookmarks: number; results: number };
  hadAnything: boolean;
}

const BOOKMARKS_KEY = "bookmarks";
const RESULT_PREFIX = "lastResult-";

function readLocalBookmarks(): number[] {
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

interface LocalResult {
  ticketId: number;
  correct: number;
  total: number;
  dateIso: string;
}

function readLocalResults(): LocalResult[] {
  const results: LocalResult[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key || !key.startsWith(RESULT_PREFIX)) continue;
    const ticketId = Number(key.slice(RESULT_PREFIX.length));
    if (!Number.isInteger(ticketId)) continue;
    try {
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      const parsed = JSON.parse(raw) as Partial<LocalResult>;
      if (
        typeof parsed.correct !== "number" ||
        typeof parsed.total !== "number" ||
        typeof parsed.dateIso !== "string"
      )
        continue;
      results.push({
        ticketId,
        correct: parsed.correct,
        total: parsed.total,
        dateIso: parsed.dateIso,
      });
    } catch {
      /* skip */
    }
  }
  return results;
}

function clearLocal(): void {
  localStorage.removeItem(BOOKMARKS_KEY);
  const keysToDelete: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(RESULT_PREFIX)) keysToDelete.push(key);
  }
  for (const k of keysToDelete) localStorage.removeItem(k);
}

export async function migrateLocalToApi(
  token: string,
  userId: number,
): Promise<MigrationResult> {
  const bookmarks = readLocalBookmarks();
  const results = readLocalResults();
  const hadAnything = bookmarks.length > 0 || results.length > 0;

  const bookmarkPromises: Promise<BookmarkRecord>[] = bookmarks.map((qId) =>
    apiAddBookmark(token, userId, qId),
  );
  const resultPromises: Promise<ResultRecord>[] = results.map((r) =>
    apiCreateResult(token, {
      userId,
      ticketId: r.ticketId,
      correct: r.correct,
      total: r.total,
      dateIso: r.dateIso,
    }),
  );

  const [bookmarkOutcomes, resultOutcomes] = await Promise.all([
    Promise.allSettled(bookmarkPromises),
    Promise.allSettled(resultPromises),
  ]);

  const pushed = {
    bookmarks: bookmarkOutcomes.filter((o) => o.status === "fulfilled").length,
    results: resultOutcomes.filter((o) => o.status === "fulfilled").length,
  };
  const failed = {
    bookmarks: bookmarkOutcomes.filter((o) => o.status === "rejected").length,
    results: resultOutcomes.filter((o) => o.status === "rejected").length,
  };

  clearLocal();

  return { pushed, failed, hadAnything };
}
