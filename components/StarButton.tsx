"use client";

import { useIsBookmarked, useToggleBookmark } from "@/lib/storage";

interface Props {
  qId: number;
  size?: "sm" | "md";
}

export default function StarButton({ qId, size = "md" }: Props) {
  const active = useIsBookmarked(qId);
  const toggle = useToggleBookmark();
  const sz = size === "sm" ? "h-9 w-9 text-lg" : "h-11 w-11 text-2xl";

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        toggle(qId);
      }}
      aria-label={active ? "Убрать из закладок" : "В закладки"}
      aria-pressed={active}
      className={`${sz} shrink-0 rounded-lg flex items-center justify-center transition-colors ${
        active
          ? "text-amber-400 hover:text-amber-300"
          : "text-slate-500 hover:text-slate-300"
      }`}
    >
      <span aria-hidden>{active ? "★" : "☆"}</span>
    </button>
  );
}
