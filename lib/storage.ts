"use client";

import { useCallback, useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  apiAddBookmark,
  apiDeleteBookmark,
  apiGetBookmarks,
  apiGetResults,
  apiUpsertResult,
  type BookmarkRecord,
  type ResultRecord,
} from "./api";
import { useAuthStore } from "./auth";

export interface TicketResult {
  correct: number;
  total: number;
  dateIso: string;
}

const bookmarksKey = (userId: number) => ["bookmarks", userId] as const;
const resultsKey = (userId: number) => ["results", userId] as const;

function useAuth() {
  const token = useAuthStore((s) => s.token);
  const userId = useAuthStore((s) => s.user?.id ?? null);
  return { token, userId, ready: !!token && userId !== null };
}

// ---------- Bookmarks ----------

export function useBookmarks(): { ids: number[]; isLoading: boolean } {
  const { token, userId, ready } = useAuth();
  const query = useQuery({
    queryKey: ready ? bookmarksKey(userId!) : ["bookmarks", "anon"],
    queryFn: () => apiGetBookmarks(token!, userId!),
    enabled: ready,
  });
  const ids = useMemo(
    () => (query.data ? query.data.map((b) => b.questionId) : []),
    [query.data],
  );
  return { ids, isLoading: query.isLoading };
}

export function useIsBookmarked(qId: number): boolean {
  const { ids } = useBookmarks();
  return ids.includes(qId);
}

type BookmarkAction =
  | { type: "add"; questionId: number }
  | { type: "remove"; recordId: number; questionId: number };

export function useToggleBookmark() {
  const { token, userId, ready } = useAuth();
  const qc = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (action: BookmarkAction): Promise<void> => {
      if (!ready) throw new Error("Not authenticated");
      if (action.type === "add") {
        await apiAddBookmark(token!, userId!, action.questionId);
      } else {
        await apiDeleteBookmark(token!, action.recordId);
      }
    },
    onMutate: async (action) => {
      if (!ready) return { previous: undefined };
      await qc.cancelQueries({ queryKey: bookmarksKey(userId!) });
      const previous = qc.getQueryData<BookmarkRecord[]>(bookmarksKey(userId!));
      qc.setQueryData<BookmarkRecord[]>(bookmarksKey(userId!), (old = []) => {
        if (action.type === "add") {
          return [
            ...old,
            { id: -Date.now(), userId: userId!, questionId: action.questionId },
          ];
        }
        return old.filter((b) => b.id !== action.recordId);
      });
      return { previous };
    },
    onError: (_err, _action, ctx) => {
      if (!ready || !ctx?.previous) return;
      qc.setQueryData(bookmarksKey(userId!), ctx.previous);
    },
    onSettled: () => {
      if (ready) qc.invalidateQueries({ queryKey: bookmarksKey(userId!) });
    },
  });

  return useCallback(
    (qId: number) => {
      if (!ready) return;
      // Решаем действие СИНХРОННО, до onMutate (который изменит кэш).
      // Если есть запись с положительным id — это серверная, удаляем по ней.
      // Если есть с отрицательным — это in-flight оптимистичная add, игнорируем
      // клик (нельзя удалить ещё несуществующее на сервере).
      const current = qc.getQueryData<BookmarkRecord[]>(bookmarksKey(userId!)) ?? [];
      const existing = current.find((b) => b.questionId === qId);
      if (existing) {
        if (existing.id < 0) return; // pending add, ждём
        mutation.mutate({ type: "remove", recordId: existing.id, questionId: qId });
      } else {
        mutation.mutate({ type: "add", questionId: qId });
      }
    },
    [mutation, ready, userId, qc],
  );
}

// ---------- Results ----------

export function useAllResults(): {
  byTicketId: Map<number, TicketResult>;
  isLoading: boolean;
} {
  const { token, userId, ready } = useAuth();
  const query = useQuery({
    queryKey: ready ? resultsKey(userId!) : ["results", "anon"],
    queryFn: () => apiGetResults(token!, userId!),
    enabled: ready,
  });
  const byTicketId = useMemo(() => {
    const m = new Map<number, TicketResult>();
    for (const r of query.data ?? []) {
      m.set(r.ticketId, {
        correct: r.correct,
        total: r.total,
        dateIso: r.dateIso,
      });
    }
    return m;
  }, [query.data]);
  return { byTicketId, isLoading: query.isLoading };
}

export function useLastResult(ticketId: number): TicketResult | null {
  const { byTicketId } = useAllResults();
  return byTicketId.get(ticketId) ?? null;
}

export function useSaveLastResult() {
  const { token, userId, ready } = useAuth();
  const qc = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (input: { ticketId: number; result: TicketResult }) => {
      if (!ready) throw new Error("Not authenticated");
      return apiUpsertResult(token!, {
        userId: userId!,
        ticketId: input.ticketId,
        correct: input.result.correct,
        total: input.result.total,
        dateIso: input.result.dateIso,
      });
    },
    onMutate: async (input) => {
      if (!ready) return { previous: undefined };
      await qc.cancelQueries({ queryKey: resultsKey(userId!) });
      const previous = qc.getQueryData<ResultRecord[]>(resultsKey(userId!));
      qc.setQueryData<ResultRecord[]>(resultsKey(userId!), (old = []) => {
        const without = old.filter((r) => r.ticketId !== input.ticketId);
        return [
          ...without,
          {
            id: -Date.now(),
            userId: userId!,
            ticketId: input.ticketId,
            ...input.result,
          },
        ];
      });
      return { previous };
    },
    onError: (_err, _input, ctx) => {
      if (!ready || !ctx?.previous) return;
      qc.setQueryData(resultsKey(userId!), ctx.previous);
    },
    onSettled: () => {
      if (ready) qc.invalidateQueries({ queryKey: resultsKey(userId!) });
    },
  });

  return useCallback(
    (ticketId: number, result: TicketResult) => {
      mutation.mutate({ ticketId, result });
    },
    [mutation],
  );
}
