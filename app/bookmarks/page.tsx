"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import AppHeader from "@/components/AppHeader";
import SolveFlow from "@/components/SolveFlow";
import StarButton from "@/components/StarButton";
import { IMG_BASE, useQuestions, type Question } from "@/lib/data";
import { useBookmarks } from "@/lib/storage";

function pluralize(n: number): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return "вопрос";
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return "вопроса";
  return "вопросов";
}

export default function BookmarksPage() {
  const allQuestions = useQuestions();
  const bookmarkIds = useBookmarks();
  const [mode, setMode] = useState<"list" | "solve">("list");

  const bookmarked: Question[] = useMemo(() => {
    if (!allQuestions) return [];
    const byId = new Map(allQuestions.map((q) => [q.id, q]));
    return bookmarkIds.map((id) => byId.get(id)).filter((q): q is Question => q !== undefined);
  }, [allQuestions, bookmarkIds]);

  if (mode === "solve" && bookmarked.length > 0) {
    return (
      <>
        <AppHeader />
        <main className="mx-auto w-full max-w-3xl px-4 py-4 sm:py-6 flex-1">
          <SolveFlow
            questions={bookmarked}
            title="Закладки"
            subtitle={`${bookmarked.length} ${pluralize(bookmarked.length)}`}
            resultTitle="Закладки"
            resultSubtitle={`${bookmarked.length} ${pluralize(bookmarked.length)}`}
            exitLabel="К закладкам"
            onExit={() => setMode("list")}
          />
        </main>
      </>
    );
  }

  return (
    <>
      <AppHeader />
      <main className="mx-auto w-full max-w-3xl px-4 py-5 sm:py-8 flex-1">
        <div className="mb-5 sm:mb-6 flex items-end justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold text-slate-100">Закладки</h1>
            <p className="text-sm text-slate-400 mt-0.5">
              {bookmarked.length > 0
                ? `${bookmarked.length} ${pluralize(bookmarked.length)}`
                : "Пока пусто"}
            </p>
          </div>
          {bookmarked.length > 0 && (
            <button
              type="button"
              onClick={() => setMode("solve")}
              className="h-11 px-4 sm:px-5 rounded-lg bg-blue-500 hover:bg-blue-400 active:bg-blue-600 text-white text-sm sm:text-base font-medium shadow-lg shadow-blue-500/20 transition-colors"
            >
              Пройти тест
            </button>
          )}
        </div>

        {allQuestions === null ? (
          <div className="text-slate-400 text-sm">Загрузка…</div>
        ) : bookmarked.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/40 p-8 sm:p-10 text-center">
            <div className="text-4xl mb-3" aria-hidden>
              ☆
            </div>
            <p className="text-slate-300 mb-1">Закладок пока нет</p>
            <p className="text-sm text-slate-500 max-w-md mx-auto">
              Отмечай звёздочкой важные вопросы во время теста, и они появятся здесь — можно
              будет прорешать их отдельным билетом.
            </p>
            <div className="mt-5">
              <Link
                href="/"
                className="inline-flex h-11 px-5 items-center rounded-lg bg-blue-500 hover:bg-blue-400 text-white text-sm font-medium shadow-lg shadow-blue-500/20 transition-colors"
              >
                К билетам
              </Link>
            </div>
          </div>
        ) : (
          <ul className="rounded-2xl border border-slate-800 bg-slate-900 divide-y divide-slate-800 overflow-hidden">
            {bookmarked.map((q, i) => (
              <li key={q.id} className="flex items-start gap-3 p-3 sm:p-4">
                <span className="shrink-0 inline-flex h-7 w-7 items-center justify-center rounded-full bg-slate-800 text-xs font-semibold text-slate-300 tabular-nums">
                  {i + 1}
                </span>
                {q.image && (
                  <img
                    src={IMG_BASE + q.image}
                    alt=""
                    className="hidden sm:block w-20 h-14 object-cover rounded-md border border-slate-800 shrink-0"
                  />
                )}
                <p className="flex-1 min-w-0 text-sm text-slate-200 leading-snug line-clamp-2">
                  {q.text}
                </p>
                <StarButton qId={q.id} size="sm" />
              </li>
            ))}
          </ul>
        )}
      </main>
    </>
  );
}
