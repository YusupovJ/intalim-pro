"use client";

import { useEffect, useRef } from "react";

export type NavState = "idle" | "correct" | "wrong";

interface Props {
  states: NavState[];
  currentIndex: number;
  onSelect: (index: number) => void;
}

const STATE_CLASSES: Record<NavState, string> = {
  idle: "bg-slate-800/80 text-slate-400 hover:bg-slate-700 active:bg-slate-700",
  correct: "bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 active:bg-emerald-500/30",
  wrong: "bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 active:bg-rose-500/30",
};

export default function QuestionNavigator({ states, currentIndex, onSelect }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const itemsRef = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    const container = containerRef.current;
    const btn = itemsRef.current[currentIndex];
    if (!container || !btn) return;
    const cRect = container.getBoundingClientRect();
    const bRect = btn.getBoundingClientRect();
    if (bRect.left >= cRect.left + 16 && bRect.right <= cRect.right - 16) return;
    const btnCenter = bRect.left + bRect.width / 2 - cRect.left;
    const delta = btnCenter - cRect.width / 2;
    container.scrollBy({ left: delta, behavior: "smooth" });
  }, [currentIndex]);

  return (
    <div
      ref={containerRef}
      className="-mx-4 sm:mx-0 flex gap-2 overflow-x-auto scrollbar-hide overscroll-x-contain px-4 sm:px-1 py-1"
    >
      {states.map((s, i) => {
        const active = i === currentIndex;
        return (
          <button
            key={i}
            ref={(el) => {
              itemsRef.current[i] = el;
            }}
            type="button"
            onClick={() => onSelect(i)}
            aria-label={`Вопрос ${i + 1}`}
            aria-current={active ? "step" : undefined}
            className={`h-10 w-10 shrink-0 rounded-lg text-sm font-semibold tabular-nums transition-colors ${STATE_CLASSES[s]} ${
              active ? "ring-2 ring-blue-500 ring-offset-2 ring-offset-slate-950" : ""
            }`}
          >
            {i + 1}
          </button>
        );
      })}
    </div>
  );
}
