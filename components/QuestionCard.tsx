"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { IMG_BASE, type Answer, type Question } from "@/lib/data";
import { shuffleRandom } from "@/lib/tickets";
import AnswerButton from "./AnswerButton";

interface Props {
  question: Question;
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
    <article className="space-y-3">
      <div className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-3">
        <h2 className="text-base sm:text-lg font-medium text-slate-100 leading-snug">
          {question.text}
        </h2>
      </div>

      {question.image && (
        <div className="rounded-xl border border-slate-800 bg-slate-900 overflow-hidden">
          <img
            src={IMG_BASE + question.image}
            alt=""
            loading="lazy"
            decoding="async"
            className="block w-full h-auto"
          />
        </div>
      )}

      <div className="grid gap-2">
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
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-3">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-slate-500 mb-1.5">
            <span aria-hidden className="text-blue-400">
              ⓘ
            </span>
            Пояснение
          </div>
          <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
            {question.explanation}
          </p>
        </div>
      )}

      {locked && onNext && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onNext}
            className="h-10 min-w-32 px-4 rounded-lg bg-blue-500 hover:bg-blue-400 active:bg-blue-600 text-white font-medium shadow-lg shadow-blue-500/20 transition-colors"
          >
            {nextLabel}
          </button>
        </div>
      )}
    </article>
  );
}
