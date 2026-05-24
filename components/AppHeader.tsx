import Link from "next/link";
import UserMenu from "./UserMenu";

export default function AppHeader() {
  return (
    <header className="border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-md sticky top-0 z-10">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 h-14 flex items-center justify-between gap-3">
        <Link href="/" className="flex items-center gap-2 group">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white text-sm font-bold shadow-md shadow-blue-500/20">
            IP
          </span>
          <span className="text-base sm:text-lg font-semibold text-slate-100 group-hover:text-white transition-colors">
            Intalim Pro
          </span>
        </Link>
        <div className="flex items-center gap-1 sm:gap-2">
          <Link
            href="/bookmarks"
            className="h-9 px-3 rounded-lg text-sm text-slate-300 hover:text-amber-300 hover:bg-slate-800/60 transition-colors inline-flex items-center gap-1.5"
          >
            <span aria-hidden className="text-amber-400 text-base leading-none">
              ★
            </span>
            <span className="hidden sm:inline">Закладки</span>
          </Link>
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
