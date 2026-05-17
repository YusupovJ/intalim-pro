"use client";

import { useEffect, useMemo, useState } from "react";
import type { Question } from "@/lib/data";
import { shuffleRandom } from "@/lib/tickets";
import QuestionCard from "./QuestionCard";
import ResultScreen, { type AnswerRecord } from "./ResultScreen";

interface Props {
  questions: Question[];
  title: string;
  subtitle?: string;
  shuffleQuestions?: boolean;
  resultTitle?: string;
  resultSubtitle?: string;
  exitLabel?: string;
  onExit: () => void;
  onComplete?: (correct: number, total: number) => void;
}

interface SessionState {
  questions: Question[];
  answers: AnswerRecord[];
  currentIndex: number;
  finished: boolean;
}

function makeSession(qs: Question[], shuffle: boolean): SessionState {
  return {
    questions: shuffle ? shuffleRandom(qs) : [...qs],
    answers: [],
    currentIndex: 0,
    finished: false,
  };
}

export default function SolveFlow({
  questions,
  title,
  subtitle,
  shuffleQuestions = true,
  resultTitle,
  resultSubtitle,
  exitLabel = "К билетам",
  onExit,
  onComplete,
}: Props) {
  const initial = useMemo(() => makeSession(questions, shuffleQuestions), [questions, shuffleQuestions]);
  const [session, setSession] = useState<SessionState>(initial);
  const [resultReported, setResultReported] = useState(false);

  useEffect(() => {
    setSession(initial);
    setResultReported(false);
  }, [initial]);

  useEffect(() => {
    if (!session.finished || resultReported || !onComplete) return;
    const correct = session.answers.filter((a) => a.correct).length;
    onComplete(correct, session.questions.length);
    setResultReported(true);
  }, [session, resultReported, onComplete]);

  const restart = () => {
    setSession(makeSession(questions, shuffleQuestions));
    setResultReported(false);
    if (typeof window !== "undefined") window.scrollTo({ top: 0 });
  };

  if (session.finished) {
    return (
      <ResultScreen
        title={resultTitle ?? title}
        subtitle={resultSubtitle ?? subtitle}
        questions={session.questions}
        answers={session.answers}
        onRestart={restart}
        onExit={onExit}
        exitLabel={exitLabel}
      />
    );
  }

  const idx = session.currentIndex;
  const current = session.questions[idx];
  const total = session.questions.length;
  const isLast = idx === total - 1;

  if (!current) return null;

  const handleAnswered = (chosenId: number, isCorrect: boolean) => {
    setSession((s) => {
      const next = [...s.answers];
      next[idx] = { questionId: current.id, chosenAnswerId: chosenId, correct: isCorrect };
      return { ...s, answers: next };
    });
  };

  const handleNext = () => {
    setSession((s) => {
      if (isLast) return { ...s, finished: true };
      return { ...s, currentIndex: s.currentIndex + 1 };
    });
    if (typeof window !== "undefined") window.scrollTo({ top: 0 });
  };

  const progressPct = ((idx + (session.answers[idx] ? 1 : 0)) / total) * 100;

  return (
    <div>
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="min-w-0">
          <div className="text-base sm:text-lg font-semibold text-slate-100 truncate">{title}</div>
          <div className="text-sm text-slate-400 tabular-nums">
            {idx + 1} <span className="text-slate-600">/</span> {total}
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
          className="h-full bg-gradient-to-r from-blue-500 to-blue-400 transition-all"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      <QuestionCard
        key={current.id}
        question={current}
        number={idx + 1}
        initialSelectedId={session.answers[idx]?.chosenAnswerId ?? null}
        onAnswered={handleAnswered}
        onNext={handleNext}
        nextLabel={isLast ? "Завершить" : "Дальше"}
      />

      <div className="mt-3 text-xs text-slate-500 text-center">
        Клавиши: F1–F{current.answers.length} — выбрать ответ, Enter/Space — дальше
      </div>
    </div>
  );
}
