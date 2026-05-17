"use client";

interface Props {
  index: number;
  text: string;
  state: "idle" | "correct" | "wrong" | "missed";
  disabled: boolean;
  onSelect: () => void;
}

const STATE_CLASSES: Record<Props["state"], string> = {
  idle: "border-slate-800 bg-slate-950/40 hover:border-slate-600 hover:bg-slate-800/50 text-slate-100",
  correct: "border-emerald-500/70 bg-emerald-500/15 text-emerald-100 ring-1 ring-emerald-500/30",
  wrong: "border-rose-500/70 bg-rose-500/15 text-rose-100 ring-1 ring-rose-500/30",
  missed: "border-emerald-500/40 bg-emerald-500/[0.07] text-emerald-100/90",
};

const BADGE_CLASSES: Record<Props["state"], string> = {
  idle: "bg-slate-800 text-slate-300 group-hover:bg-slate-700",
  correct: "bg-emerald-500 text-emerald-950",
  wrong: "bg-rose-500 text-rose-950",
  missed: "bg-emerald-500/80 text-emerald-950",
};

export default function AnswerButton({ index, text, state, disabled, onSelect }: Props) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onSelect}
      className={`group w-full min-h-[3rem] flex items-start gap-3 px-3 py-3 rounded-lg border text-left transition-colors disabled:cursor-default ${STATE_CLASSES[state]}`}
    >
      <span
        className={`inline-flex h-7 min-w-[2.25rem] px-1.5 shrink-0 items-center justify-center rounded-md text-xs font-semibold transition-colors ${BADGE_CLASSES[state]}`}
        aria-hidden
      >
        F{index + 1}
      </span>
      <span className="flex-1 text-base leading-snug pt-0.5">{text}</span>
    </button>
  );
}
