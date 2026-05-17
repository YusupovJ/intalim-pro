"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { IMG_BASE, type Answer, type Question } from "@/lib/data";
import { shuffleRandom } from "@/lib/tickets";
import AnswerButton from "./AnswerButton";
import StarButton from "./StarButton";

interface Props {
  question: Question;
  number?: number;
  reveal?: boolean;
  isActive?: boolean;
  initialSelectedId?: number | null;
  onAnswered?: (chosenId: number, isCorrect: boolean) => void;
  onNext?: () => void;
  nextLabel?: string;
  shuffleAnswers?: boolean;
}

export default function QuestionCard({
  question,
  number,
  reveal = false,
  isActive = true,
  initialSelectedId = null,
  onAnswered,
  onNext,
  nextLabel = "Дальше",
  shuffleAnswers = true,
}: Props) {
  const orderedAnswers = useMemo<Answer[]>(() => {
    if (!shuffleAnswers || question.static_order) return [...question.answers];
    return shuffleRandom(question.answers);
  }, [question.id, shuffleAnswers, question.static_order, question.answers]);

  const [selectedId, setSelectedId] = useState<number | null>(initialSelectedId);
  const locked = reveal || selectedId !== null;

  useEffect(() => {
    setSelectedId(initialSelectedId);
  }, [question.id, initialSelectedId]);

  const handleSelect = (a: Answer) => {
    if (locked) return;
    setSelectedId(a.id);
    onAnswered?.(a.id, a.correct);
  };

  const stateRef = useRef({ locked, orderedAnswers, handleSelect, onNext });
  stateRef.current = { locked, orderedAnswers, handleSelect, onNext };

  useEffect(() => {
    if (!isActive) return;
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)
        return;
      const { locked, orderedAnswers, handleSelect, onNext } = stateRef.current;
      const fnMatch = /^F([1-9])$/.exec(e.key);
      if (!locked && fnMatch) {
        const idx = Number(fnMatch[1]);
        if (idx >= 1 && idx <= orderedAnswers.length) {
          e.preventDefault();
          handleSelect(orderedAnswers[idx - 1]);
          return;
        }
      }
      if (locked && onNext && (e.key === "Enter" || e.key === " ")) {
        e.preventDefault();
        onNext();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isActive]);

  return (
    <article className="rounded-2xl border border-slate-800 bg-slate-900 p-4 sm:p-6 shadow-xl shadow-black/20">
      <header className="flex items-start gap-3 mb-4">
        <div className="flex-1 min-w-0">
          {number !== undefined && (
            <div className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.14em] text-slate-500 mb-2">
              <span className="inline-block h-1 w-1 rounded-full bg-blue-500" aria-hidden />
              Вопрос {number}
            </div>
          )}
          <h2 className="text-lg sm:text-xl font-medium text-slate-100 leading-snug">
            {question.text}
          </h2>
        </div>
        <StarButton qId={question.id} />
      </header>

      {question.image && (
        <div className="mb-5 text-center">
          <img
            src={IMG_BASE + question.image}
            alt=""
            loading="lazy"
            decoding="async"
            className="inline-block max-w-full max-h-80 rounded-xl border border-slate-800 bg-slate-950 object-contain"
          />
        </div>
      )}

      <div className="grid gap-2.5">
        {orderedAnswers.map((a, i) => {
          let state: "idle" | "correct" | "wrong" | "missed" = "idle";
          if (locked) {
            if (a.id === selectedId && a.correct) state = "correct";
            else if (a.id === selectedId && !a.correct) state = "wrong";
            else if (a.correct) state = "missed";
          }
          return (
            <AnswerButton
              key={a.id}
              index={i}
              text={a.text}
              state={state}
              disabled={locked}
              onSelect={() => handleSelect(a)}
            />
          );
        })}
      </div>

      {locked && question.explanation && (
        <div className="mt-5 rounded-xl border border-slate-800 bg-slate-950/60 p-4 sm:p-5">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-slate-500 mb-2">
            <span aria-hidden className="text-blue-400">
              ⓘ
            </span>
            Пояснение
          </div>
          <p className="text-sm sm:text-[0.95rem] text-slate-300 leading-relaxed whitespace-pre-line">
            {question.explanation}
          </p>
        </div>
      )}

      {locked && onNext && (
        <div className="mt-5 flex justify-end">
          <button
            type="button"
            onClick={onNext}
            className="h-11 min-w-36 px-5 rounded-lg bg-blue-500 hover:bg-blue-400 active:bg-blue-600 text-white font-medium shadow-lg shadow-blue-500/20 transition-colors"
          >
            {nextLabel}
          </button>
        </div>
      )}
    </article>
  );
}
