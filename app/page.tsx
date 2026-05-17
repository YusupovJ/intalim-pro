"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import AppHeader from "@/components/AppHeader";
import { useQuestions } from "@/lib/data";
import { TICKET_COUNT } from "@/lib/tickets";
import { getLastResult, useBookmarks, type TicketResult } from "@/lib/storage";

function scoreTone(correct: number, total: number): {
  pctText: string;
  pctBg: string;
  ring: string;
  label: string;
  labelColor: string;
} {
  const pct = total > 0 ? correct / total : 0;
  if (pct >= 0.9)
    return {
      pctText: "text-emerald-300",
      pctBg: "bg-emerald-500/15",
      ring: "ring-emerald-500/40",
      label: "Сдано",
      labelColor: "text-emerald-400",
    };
  if (pct >= 0.7)
    return {
      pctText: "text-amber-300",
      pctBg: "bg-amber-500/15",
      ring: "ring-amber-500/40",
      label: "Почти",
      labelColor: "text-amber-400",
    };
  return {
    pctText: "text-rose-300",
    pctBg: "bg-rose-500/15",
    ring: "ring-rose-500/40",
    label: "Не сдано",
    labelColor: "text-rose-400",
  };
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "short",
    });
  } catch {
    return "";
  }
}

interface StatProps {
  label: string;
  value: React.ReactNode;
  accent?: string;
}

function Stat({ label, value, accent }: StatProps) {
  return (
    <div className="min-w-0 rounded-xl sm:rounded-2xl border border-slate-800 bg-slate-900/60 px-3 py-2.5 sm:px-5 sm:py-4 sm:min-w-32">
      <div className="text-[10px] sm:text-[11px] uppercase tracking-[0.14em] text-slate-500 truncate">
        {label}
      </div>
      <div
        className={`mt-1 text-xl sm:text-2xl font-semibold tabular-nums truncate ${accent ?? "text-slate-100"}`}
      >
        {value}
      </div>
    </div>
  );
}

export default function TicketsListPage() {
  const questions = useQuestions();
  const bookmarkIds = useBookmarks();
  const [results, setResults] = useState<(TicketResult | null)[]>([]);

  useEffect(() => {
    const arr: (TicketResult | null)[] = [];
    for (let i = 1; i <= TICKET_COUNT; i++) arr.push(getLastResult(i));
    setResults(arr);
  }, []);

  const stats = useMemo(() => {
    const passed = results.filter((r) => r !== null && r.total > 0 && r.correct / r.total >= 0.9).length;
    const attempted = results.filter((r) => r !== null).length;
    return { passed, attempted };
  }, [results]);

  return (
    <>
      <AppHeader />
      <main className="mx-auto w-full max-w-7xl px-4 sm:px-6 py-6 sm:py-10 flex-1">
        <section className="mb-8 sm:mb-10">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-3xl sm:text-4xl font-semibold text-slate-100 tracking-tight">
                Билеты ПДД
              </h1>
              <p className="text-slate-400 mt-2 text-sm sm:text-base">
                {questions === null
                  ? "Загрузка вопросов…"
                  : `${TICKET_COUNT} билетов · по 20 вопросов в каждом`}
              </p>
            </div>
            <div className="grid grid-cols-3 gap-2 sm:flex sm:gap-3">
              <Stat
                label="Решено"
                value={
                  <>
                    {stats.attempted}
                    <span className="text-slate-600 text-sm sm:text-base">/{TICKET_COUNT}</span>
                  </>
                }
              />
              <Stat label="Сдано" value={stats.passed} accent="text-emerald-300" />
              <Stat label="Закладок" value={bookmarkIds.length} accent="text-amber-300" />
            </div>
          </div>
        </section>

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
          {Array.from({ length: TICKET_COUNT }, (_, i) => i + 1).map((id) => {
            const r = results[id - 1];
            const tone = r ? scoreTone(r.correct, r.total) : null;
            const pct = r ? Math.round((r.correct / r.total) * 100) : null;
            return (
              <Link
                key={id}
                href={`/ticket/${id}`}
                className="group relative rounded-2xl border border-slate-800 bg-slate-900 hover:border-slate-600 hover:bg-slate-800/40 transition-colors p-5 sm:p-6 flex flex-col gap-4 min-h-44"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500">
                      Билет
                    </div>
                    <div className="text-3xl sm:text-4xl font-semibold text-slate-100 tabular-nums leading-none mt-1">
                      {id}
                    </div>
                  </div>
                  {tone && (
                    <span
                      className={`text-xs font-semibold uppercase tracking-wider px-2 py-1 rounded-full ${tone.labelColor}`}
                    >
                      {tone.label}
                    </span>
                  )}
                </div>

                <div className="mt-auto flex items-center justify-between gap-3">
                  {r && tone && pct !== null ? (
                    <>
                      <div
                        className={`inline-flex items-baseline gap-1 px-3 py-1.5 rounded-xl ring-1 tabular-nums ${tone.pctBg} ${tone.pctText} ${tone.ring}`}
                      >
                        <span className="text-xl font-semibold leading-none">{pct}%</span>
                        <span className="text-xs opacity-80">
                          {r.correct}/{r.total}
                        </span>
                      </div>
                      <span className="text-xs text-slate-500">{formatDate(r.dateIso)}</span>
                    </>
                  ) : (
                    <>
                      <span className="text-sm text-slate-500">Не пройден</span>
                      <span
                        className="text-slate-500 group-hover:text-slate-300 transition-colors text-lg"
                        aria-hidden
                      >
                        →
                      </span>
                    </>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </main>
    </>
  );
}
