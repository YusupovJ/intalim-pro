"use client";

import Link from "next/link";
import { useState, type FormEvent, type ReactNode } from "react";

interface FieldDef {
  name: string;
  label: string;
  type: "text" | "email" | "password";
  autoComplete?: string;
  minLength?: number;
}

interface Props {
  title: string;
  subtitle?: string;
  fields: FieldDef[];
  submitLabel: string;
  altLink: { href: string; label: string };
  onSubmit: (values: Record<string, string>) => Promise<void>;
  banner?: ReactNode;
}

const EMAIL_RE = /^\S+@\S+\.\S+$/;

export default function AuthForm({
  title,
  subtitle,
  fields,
  submitLabel,
  altLink,
  onSubmit,
  banner,
}: Props) {
  const [values, setValues] = useState<Record<string, string>>(
    Object.fromEntries(fields.map((f) => [f.name, ""])),
  );
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const validate = (): string | null => {
    for (const f of fields) {
      const v = values[f.name]?.trim();
      if (!v) return `Заполни поле «${f.label}»`;
      if (f.type === "email" && !EMAIL_RE.test(v)) return "Неверный email";
      if (f.minLength && v.length < f.minLength)
        return `«${f.label}» — минимум ${f.minLength} символов`;
    }
    return null;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await onSubmit(values);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Ошибка";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 sm:p-7 shadow-xl shadow-black/20">
      <div className="flex items-center gap-2 mb-5">
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white text-sm font-bold shadow-md shadow-blue-500/20">
          IP
        </span>
        <span className="text-lg font-semibold text-slate-100">Intalim Pro</span>
      </div>

      <h1 className="text-2xl font-semibold text-slate-100 mb-1">{title}</h1>
      {subtitle && <p className="text-sm text-slate-400 mb-5">{subtitle}</p>}
      {banner && <div className="mb-5">{banner}</div>}

      <form onSubmit={handleSubmit} className="space-y-3" noValidate>
        {fields.map((f) => (
          <label key={f.name} className="block">
            <span className="text-xs uppercase tracking-wider text-slate-500">
              {f.label}
            </span>
            <input
              type={f.type}
              name={f.name}
              autoComplete={f.autoComplete}
              value={values[f.name]}
              onChange={(e) =>
                setValues((prev) => ({ ...prev, [f.name]: e.target.value }))
              }
              disabled={submitting}
              className="mt-1 w-full h-11 px-3 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-600 focus:border-blue-500 focus:outline-none transition-colors disabled:opacity-60"
            />
          </label>
        ))}

        {error && (
          <div className="text-sm text-rose-400 bg-rose-500/10 border border-rose-500/30 rounded-lg px-3 py-2">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full h-11 rounded-lg bg-blue-500 hover:bg-blue-400 active:bg-blue-600 text-white font-medium shadow-lg shadow-blue-500/20 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {submitting ? "Подожди…" : submitLabel}
        </button>

        <div className="text-sm text-center text-slate-400 pt-2">
          <Link href={altLink.href} className="text-blue-400 hover:text-blue-300">
            {altLink.label}
          </Link>
        </div>
      </form>
    </div>
  );
}
