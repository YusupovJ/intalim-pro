"use client";

import { useState } from "react";
import type { Question } from "@/lib/data";
import { IMG_BASE } from "@/lib/data";

export interface AnswerRecord {
  questionId: number;
  chosenAnswerId: number | null;
  correct: boolean;
}

interface Props {
  title: string;
  subtitle?: string;
  questions: Question[];
  answers: AnswerRecord[];
  onRestart: () => void;
  onExit: () => void;
  exitLabel?: string;
}

function verdict(pct: number): { label: string; color: string; ring: string } {
  if (pct >= 90)
    return {
      label: "Отличный результат",
      color: "text-emerald-400",
      ring: "from-emerald-500/40 to-emerald-500/0",
    };
  if (pct >= 70)
    return {
      label: "Можно лучше",
      color: "text-amber-400",
      ring: "from-amber-500/40 to-amber-500/0",
    };
  return {
    label: "Ещё подучить",
    color: "text-rose-400",
    ring: "from-rose-500/40 to-rose-500/0",
  };
}

export default function ResultScreen({
  title,
  subtitle,
  questions,
  answers,
  onRestart,
  onExit,
  exitLabel = "К билетам",
}: Props) {
  const correct = answers.filter((a) => a.correct).length;
  const total = questions.length;
  const pct = total > 0 ? Math.round((correct / total) * 100) : 0;
  const v = verdict(pct);
  const [openId, setOpenId] = useState<number | null>(null);

  return (
    <div className="space-y-6">
      <section
        className={`relative overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-b ${v.ring} bg-slate-900 p-6 sm:p-8 text-center`}
      >
        <div className="text-xs uppercase tracking-[0.18em] text-slate-400">
          {title}
        </div>
        {subtitle && (
          <div className="text-sm text-slate-500 mt-1">{subtitle}</div>
        )}
        <div
          className={`mt-4 text-6xl sm:text-7xl font-semibold tabular-nums ${v.color}`}
        >
          {correct}
          <span className="text-slate-500 mx-2 font-normal">/</span>
          {total}
        </div>
        <div className={`mt-1 text-xl font-medium ${v.color}`}>{pct}%</div>
        <div className="mt-2 text-slate-300">{v.label}</div>
      </section>

      <section className="rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-800 text-xs uppercase tracking-wider text-slate-500">
          Разбор ответов
        </div>
        <ul className="divide-y divide-slate-800">
          {questions.map((q, i) => {
            const a = answers[i];
            const isOpen = openId === q.id;
            return (
              <li key={q.id}>
                <button
                  type="button"
                  onClick={() => setOpenId(isOpen ? null : q.id)}
                  className="w-full flex items-center gap-3 px-3 sm:px-4 py-3 text-left hover:bg-slate-800/40 transition-colors"
                >
                  <span
                    className={`shrink-0 inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                      a.correct
                        ? "bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/30"
                        : "bg-rose-500/15 text-rose-400 ring-1 ring-rose-500/30"
                    }`}
                    aria-hidden
                  >
                    {a.correct ? "✓" : "✗"}
                  </span>
                  <span className="text-xs text-slate-500 w-6 shrink-0 tabular-nums">
                    {i + 1}.
                  </span>
                  <span className="flex-1 min-w-0 text-sm text-slate-200 truncate">
                    {q.text}
                  </span>
                  <span className="text-slate-500 text-lg shrink-0 leading-none">
                    {isOpen ? "−" : "+"}
                  </span>
                </button>
                {isOpen && (
                  <div className="px-3 sm:px-4 pb-4 pt-1 space-y-3 bg-slate-950/40">
                    <p className="text-slate-100">{q.text}</p>
                    {q.image && (
                      <img
                        src={IMG_BASE + q.image}
                        alt=""
                        className="max-w-full max-h-64 rounded-lg border border-slate-800"
                      />
                    )}
                    <div className="space-y-1.5">
                      {q.answers.map((ans) => {
                        const chosen = ans.id === a.chosenAnswerId;
                        const correctOne = ans.correct;
                        let cls =
                          "border-slate-800 bg-slate-900/60 text-slate-300";
                        if (correctOne) {
                          cls =
                            "border-emerald-500/60 bg-emerald-500/10 text-emerald-100";
                        }
                        if (chosen && !correctOne) {
                          cls =
                            "border-rose-500/60 bg-rose-500/10 text-rose-100";
                        }
                        return (
                          <div
                            key={ans.id}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm ${cls}`}
                          >
                            <span className="flex-1">{ans.text}</span>
                            {chosen && (
                              <span className="text-[10px] uppercase tracking-wider opacity-80">
                                ваш ответ
                              </span>
                            )}
                            {correctOne && !chosen && (
                              <span className="text-[10px] uppercase tracking-wider opacity-80">
                                верно
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    {q.explanation && (
                      <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-3">
                        <div className="text-xs uppercase tracking-wider text-slate-500 mb-1">
                          Пояснение
                        </div>
                        <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                          {q.explanation}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </section>

      <div className="flex flex-row gap-3">
        <button
          type="button"
          onClick={onRestart}
          className="h-12 flex-1 rounded-lg bg-blue-500 hover:bg-blue-400 active:bg-blue-600 text-white font-medium shadow-lg shadow-blue-500/20 transition-colors"
        >
          Пройти снова
        </button>
        <button
          type="button"
          onClick={onExit}
          className="h-12 flex-1 inline-flex items-center justify-center rounded-lg border border-slate-700 hover:border-slate-500 hover:bg-slate-800/50 text-slate-200 font-medium transition-colors"
        >
          {exitLabel}
        </button>
      </div>
    </div>
  );
}
