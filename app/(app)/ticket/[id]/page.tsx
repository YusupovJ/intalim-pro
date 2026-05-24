import Link from "next/link";
import AppHeader from "@/components/AppHeader";
import SolveContainer from "@/components/SolveContainer";
import { getAllQuestionsServer } from "@/lib/data-server";
import { getTicketQuestions, TICKET_COUNT } from "@/lib/tickets";

export default async function TicketSolvePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const ticketId = Number(id);
  const validTicket =
    Number.isInteger(ticketId) && ticketId >= 1 && ticketId <= TICKET_COUNT;

  if (!validTicket) {
    return (
      <>
        <AppHeader />
        <main className="mx-auto w-full max-w-3xl px-4 py-10 flex-1 text-center">
          <h1 className="text-xl text-slate-100 mb-3">Билет не найден</h1>
          <Link href="/" className="text-blue-400 hover:text-blue-300">
            К списку билетов
          </Link>
        </main>
      </>
    );
  }

  const allQuestions = await getAllQuestionsServer();
  const ticketQs = getTicketQuestions(allQuestions, ticketId);

  return (
    <>
      <AppHeader />
      <main className="mx-auto w-full max-w-3xl px-4 py-4 sm:py-6 flex-1">
        <SolveContainer ticketId={ticketId} questions={ticketQs} />
      </main>
    </>
  );
}
