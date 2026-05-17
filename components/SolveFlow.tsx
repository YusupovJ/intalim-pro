"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Question } from "@/lib/data";
import QuestionCard from "./QuestionCard";
import QuestionNavigator, { type NavState } from "./QuestionNavigator";
import ResultScreen, { type AnswerRecord } from "./ResultScreen";

interface Props {
  questions: Question[];
  title: string;
  subtitle?: string;
  resultTitle?: string;
  resultSubtitle?: string;
  exitLabel?: string;
  onExit: () => void;
  onComplete?: (correct: number, total: number) => void;
}

export default function SolveFlow({
  questions,
  title,
  subtitle,
  resultTitle,
  resultSubtitle,
  exitLabel = "К билетам",
  onExit,
  onComplete,
}: Props) {
  const total = questions.length;
  const trackRef = useRef<HTMLDivElement>(null);
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [trackHeight, setTrackHeight] = useState<number | undefined>(undefined);
  const [answers, setAnswers] = useState<(AnswerRecord | undefined)[]>([]);
  const [finished, setFinished] = useState(false);
  const [resultReported, setResultReported] = useState(false);

  useEffect(() => {
    const slide = slideRefs.current[currentIndex];
    if (!slide) return;
    const update = () => setTrackHeight(slide.offsetHeight);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(slide);
    return () => ro.disconnect();
  }, [currentIndex]);

  useEffect(() => {
    setAnswers([]);
    setCurrentIndex(0);
    setFinished(false);
    setResultReported(false);
    if (trackRef.current) trackRef.current.scrollLeft = 0;
  }, [questions]);

  useEffect(() => {
    if (!finished || resultReported || !onComplete) return;
    const correct = answers.filter((a) => a?.correct).length;
    onComplete(correct, total);
    setResultReported(true);
  }, [finished, resultReported, onComplete, answers, total]);

  const goTo = useCallback(
    (i: number) => {
      const el = trackRef.current;
      if (!el || i < 0 || i >= total) return;
      const distance = Math.abs(i - currentIndex);
      el.scrollTo({
        left: i * el.clientWidth,
        behavior: distance <= 1 ? "smooth" : "auto",
      });
    },
    [currentIndex, total],
  );

  const finishTest = useCallback(() => {
    setFinished(true);
    if (typeof window !== "undefined") window.scrollTo({ top: 0 });
  }, []);

  const handleAnswered = useCallback(
    (i: number, chosenId: number, correct: boolean) => {
      setAnswers((prev) => {
        const next = [...prev];
        next[i] = {
          questionId: questions[i].id,
          chosenAnswerId: chosenId,
          correct,
        };
        return next;
      });
    },
    [questions],
  );

  const onScroll = useCallback(() => {
    const el = trackRef.current;
    if (!el || el.clientWidth === 0) return;
    const idx = Math.round(el.scrollLeft / el.clientWidth);
    if (idx >= 0 && idx < total) setCurrentIndex(idx);
  }, [total]);

  const restart = useCallback(() => {
    setAnswers([]);
    setCurrentIndex(0);
    setFinished(false);
    setResultReported(false);
    if (trackRef.current) trackRef.current.scrollLeft = 0;
    if (typeof window !== "undefined") window.scrollTo({ top: 0 });
  }, []);

  if (finished) {
    const fullAnswers: AnswerRecord[] = questions.map(
      (q, i) =>
        answers[i] ?? {
          questionId: q.id,
          chosenAnswerId: null,
          correct: false,
        },
    );
    return (
      <ResultScreen
        title={resultTitle ?? title}
        subtitle={resultSubtitle ?? subtitle}
        questions={questions}
        answers={fullAnswers}
        onRestart={restart}
        onExit={onExit}
        exitLabel={exitLabel}
      />
    );
  }

  const isLast = currentIndex === total - 1;
  const answeredCount = answers.filter((a) => a !== undefined).length;
  const progressPct = total > 0 ? (answeredCount / total) * 100 : 0;

  const navStates: NavState[] = questions.map((_, i) => {
    const a = answers[i];
    if (!a) return "idle";
    return a.correct ? "correct" : "wrong";
  });

  const canGoPrev = currentIndex > 0;
  const canGoNext = currentIndex < total - 1;

  return (
    <div>
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="min-w-0">
          <div className="text-base sm:text-lg font-semibold text-slate-100 truncate">
            {title}
          </div>
          <div className="text-sm text-slate-400 tabular-nums">
            {currentIndex + 1} <span className="text-slate-600">/</span> {total}{" "}
            · <span className="text-slate-500">отвечено {answeredCount}</span>
          </div>
        </div>
        <button
          type="button"
          onClick={onExit}
          className="h-10 px-3 rounded-lg border border-slate-700 hover:border-slate-500 hover:bg-slate-800/50 text-sm text-slate-300 transition-colors"
        >
          Выйти
        </button>
      </div>

      <div className="mb-4 h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-blue-500 to-blue-400 transition-all duration-150"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      <div
        ref={trackRef}
        onScroll={onScroll}
        className="-mx-4 sm:mx-0 flex items-start overflow-x-auto overflow-y-hidden snap-x snap-mandatory scrollbar-hide overscroll-x-contain transition-[height] duration-150"
        style={{
          scrollBehavior: "auto",
          height: trackHeight !== undefined ? `${trackHeight}px` : undefined,
        }}
      >
        {questions.map((q, i) => (
          <div
            key={q.id}
            ref={(el) => {
              slideRefs.current[i] = el;
            }}
            className="w-full min-w-0 shrink-0 snap-center px-4 sm:px-0"
            aria-hidden={i !== currentIndex}
          >
            <QuestionCard
              question={q}
              number={i + 1}
              isActive={i === currentIndex}
              initialSelectedId={answers[i]?.chosenAnswerId ?? null}
              onAnswered={(cid, ok) => handleAnswered(i, cid, ok)}
              onNext={i === total - 1 ? finishTest : () => goTo(i + 1)}
              nextLabel={i === total - 1 ? "Завершить" : "Дальше"}
            />
          </div>
        ))}
      </div>

      <div className="mt-5">
        <QuestionNavigator
          states={navStates}
          currentIndex={currentIndex}
          onSelect={goTo}
        />
      </div>

      <div className="mt-4 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={canGoPrev ? () => goTo(currentIndex - 1) : undefined}
          disabled={!canGoPrev}
          className="h-9 px-3 rounded-md text-sm text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 disabled:text-slate-700 disabled:hover:bg-transparent transition-colors"
        >
          ← Назад
        </button>
        <span className="hidden sm:inline text-xs text-slate-500 text-center">
          Свайп · F1–F9 · Enter/Space
        </span>
        {isLast ? (
          <button
            type="button"
            onClick={finishTest}
            className="h-9 px-3 rounded-md text-sm font-medium text-blue-400 hover:text-blue-300 hover:bg-slate-800/60 transition-colors"
          >
            Завершить →
          </button>
        ) : (
          <button
            type="button"
            onClick={canGoNext ? () => goTo(currentIndex + 1) : undefined}
            disabled={!canGoNext}
            className="h-9 px-3 rounded-md text-sm text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 disabled:text-slate-700 disabled:hover:bg-transparent transition-colors"
          >
            Вперёд →
          </button>
        )}
      </div>
    </div>
  );
}
