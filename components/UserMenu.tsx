"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/auth";
import { emailToLogin } from "@/lib/login";

export default function UserMenu() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("mousedown", onClick);
    window.addEventListener("keydown", onEsc);
    return () => {
      window.removeEventListener("mousedown", onClick);
      window.removeEventListener("keydown", onEsc);
    };
  }, [open]);

  if (!user) return null;

  const displayName = user.fullName || emailToLogin(user.email);
  const initial = (displayName[0] ?? "?").toUpperCase();

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="h-9 px-2 sm:pr-3 rounded-lg hover:bg-slate-800/60 inline-flex items-center gap-2 transition-colors"
      >
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white text-xs font-bold">
          {initial}
        </span>
        <span className="hidden sm:inline text-sm text-slate-200 max-w-32 truncate">
          {displayName}
        </span>
      </button>
      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full mt-1 w-60 rounded-xl border border-slate-800 bg-slate-900 shadow-xl shadow-black/30 overflow-hidden z-20"
        >
          <div className="px-4 py-3 border-b border-slate-800">
            <div className="text-xs uppercase tracking-wider text-slate-500">
              Логин
            </div>
            <div className="text-sm text-slate-100 truncate mt-0.5">
              {displayName}
            </div>
          </div>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              logout();
              router.replace("/login");
            }}
            className="w-full text-left px-4 py-2.5 text-sm text-rose-300 hover:bg-rose-500/10 transition-colors"
          >
            Выйти
          </button>
        </div>
      )}
    </div>
  );
}
