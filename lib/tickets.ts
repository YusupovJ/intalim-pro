import type { Question } from "./data";

export const TICKET_COUNT = 62;
export const QUESTIONS_PER_TICKET = 20;

export function shuffleRandom<T>(arr: readonly T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function getTicketQuestions(all: Question[], ticketId: number): Question[] {
  return all
    .filter((q) => q.tickets.includes(ticketId))
    .sort((a, b) => a.id - b.id);
}
