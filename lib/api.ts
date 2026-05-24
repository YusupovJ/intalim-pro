const API_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_URL) {
  // Will surface at first call. NEXT_PUBLIC_ var should be inlined at build.
  console.warn("NEXT_PUBLIC_API_URL is not set — API calls will fail.");
}

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = "ApiError";
  }
}

export interface ApiUser {
  id: number;
  fullName: string;
  email: string;
}

export interface AuthResponse {
  token: string;
  data: ApiUser;
}

export interface BookmarkRecord {
  id: number;
  userId: number;
  questionId: number;
}

export interface ResultRecord {
  id: number;
  userId: number;
  ticketId: number;
  correct: number;
  total: number;
  dateIso: string;
}

interface RequestInitWithToken extends Omit<RequestInit, "body"> {
  token?: string;
  body?: unknown;
}

async function request<T>(path: string, init: RequestInitWithToken = {}): Promise<T> {
  const { token, body, headers: extraHeaders, ...rest } = init;
  const headers: Record<string, string> = {
    Accept: "application/json",
    ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
    ...(extraHeaders as Record<string, string> | undefined),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, {
    ...rest,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    let message = res.statusText;
    try {
      const payload = (await res.json()) as { message?: string };
      if (payload?.message) message = payload.message;
    } catch {
      /* ignore */
    }
    throw new ApiError(res.status, message);
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

// ---------- Auth ----------

export const apiRegister = (body: {
  fullName: string;
  email: string;
  password: string;
}): Promise<AuthResponse> => request<AuthResponse>("/register", { method: "POST", body });

export const apiLogin = (body: {
  email: string;
  password: string;
}): Promise<AuthResponse> => request<AuthResponse>("/auth", { method: "POST", body });

export const apiMe = (token: string): Promise<ApiUser> =>
  request<ApiUser>("/auth_me", { token });

// ---------- Bookmarks ----------

export const apiGetBookmarks = (
  token: string,
  userId: number,
): Promise<BookmarkRecord[]> =>
  request<BookmarkRecord[]>(`/bookmarks?userId=${userId}`, { token });

export const apiAddBookmark = (
  token: string,
  userId: number,
  questionId: number,
): Promise<BookmarkRecord> =>
  request<BookmarkRecord>("/bookmarks", {
    method: "POST",
    body: { userId, questionId },
    token,
  });

export const apiDeleteBookmark = (token: string, recordId: number): Promise<void> =>
  request<void>(`/bookmarks/${recordId}`, { method: "DELETE", token });

// ---------- Results ----------

export const apiGetResults = (
  token: string,
  userId: number,
): Promise<ResultRecord[]> =>
  request<ResultRecord[]>(`/results?userId=${userId}`, { token });

export const apiCreateResult = (
  token: string,
  payload: Omit<ResultRecord, "id">,
): Promise<ResultRecord> =>
  request<ResultRecord>("/results", { method: "POST", body: payload, token });

export const apiUpdateResult = (
  token: string,
  id: number,
  patch: Partial<Omit<ResultRecord, "id">>,
): Promise<ResultRecord> =>
  request<ResultRecord>(`/results/${id}`, { method: "PATCH", body: patch, token });

/**
 * Find existing result by (userId, ticketId); update if present, else create.
 * Returns the resulting record.
 */
export async function apiUpsertResult(
  token: string,
  payload: Omit<ResultRecord, "id">,
): Promise<ResultRecord> {
  const existing = await request<ResultRecord[]>(
    `/results?userId=${payload.userId}&ticketId=${payload.ticketId}`,
    { token },
  );
  if (existing.length > 0) {
    return apiUpdateResult(token, existing[0].id, payload);
  }
  return apiCreateResult(token, payload);
}
