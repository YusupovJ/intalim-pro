"use client";

import Link from "next/link";
import { useMemo, use } from "react";
import { useRouter } from "next/navigation";
import AppHeader from "@/components/AppHeader";
import SolveFlow from "@/components/SolveFlow";
import { useQuestions, type Question } from "@/lib/data";
import { getTicketQuestions, TICKET_COUNT } from "@/lib/tickets";
import { saveLastResult } from "@/lib/storage";

export default function TicketSolvePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const ticketId = Number(id);
  const router = useRouter();
  const allQuestions = useQuestions();

  const validTicket = Number.isInteger(ticketId) && ticketId >= 1 && ticketId <= TICKET_COUNT;

  const ticketQs = useMemo<Question[] | null>(() => {
    if (!allQuestions || !validTicket) return null;
    return getTicketQuestions(allQuestions, ticketId);
  }, [allQuestions, ticketId, validTicket]);

  if (!validTicket) {
    return (
      <>
        <AppHeader />
        <main className="mx-auto max-w-3xl px-4 py-10 flex-1 text-center">
          <h1 className="text-xl text-slate-100 mb-3">Билет не найден</h1>
          <Link href="/" className="text-blue-400 hover:text-blue-300">
            К списку билетов
          </Link>
        </main>
      </>
    );
  }

  if (!ticketQs) {
    return (
      <>
        <AppHeader />
        <main className="mx-auto max-w-3xl px-4 py-10 flex-1">
          <div className="text-slate-400 text-sm">Загрузка билета…</div>
        </main>
      </>
    );
  }

  return (
    <>
      <AppHeader />
      <main className="mx-auto max-w-3xl px-4 py-4 sm:py-6 flex-1">
        <SolveFlow
          questions={ticketQs}
          title={`Билет ${ticketId}`}
          shuffleQuestions
          resultTitle={`Билет ${ticketId}`}
          onExit={() => router.push("/")}
          onComplete={(correct, total) =>
            saveLastResult(ticketId, {
              correct,
              total,
              dateIso: new Date().toISOString(),
            })
          }
        />
      </main>
    </>
  );
}
