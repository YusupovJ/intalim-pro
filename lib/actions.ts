"use server";

import type { Question } from "./data";
import { getAllQuestionsServer } from "./data-server";

/**
 * Возвращает вопросы по списку id, в том же порядке. Сервер читает 2МБ JSON
 * один раз (React.cache), фильтрует, отдаёт клиенту только нужные ~50.
 * Клиенту никогда не приходится тянуть полный questions.json.
 */
export async function getQuestionsByIds(ids: number[]): Promise<Question[]> {
  if (!Array.isArray(ids) || ids.length === 0) return [];
  const safe = ids.filter((x): x is number => Number.isInteger(x));
  if (safe.length === 0) return [];

  const all = await getAllQuestionsServer();
  const byId = new Map(all.map((q) => [q.id, q]));
  return safe
    .map((id) => byId.get(id))
    .filter((q): q is Question => q !== undefined);
}
