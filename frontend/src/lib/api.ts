/**
 * Thin fetch wrapper for the CastLab API.
 * In the browser requests go to same-origin `/api/*` (proxied by Next → Express),
 * so the httpOnly auth cookie travels automatically.
 */
export class ApiError extends Error {
  constructor(public status: number, message: string, public details?: { path: string; message: string }[]) {
    super(message);
  }
}

type Query = Record<string, string | number | boolean | string[] | undefined | null>;

export function toQuery(params: Query = {}) {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null || v === '' || (Array.isArray(v) && !v.length)) continue;
    sp.set(k, Array.isArray(v) ? v.join(',') : String(v));
  }
  const s = sp.toString();
  return s ? `?${s}` : '';
}

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const isForm = typeof FormData !== 'undefined' && body instanceof FormData;
  const res = await fetch(`/api${path}`, {
    method,
    credentials: 'include',
    headers: body && !isForm ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? (isForm ? (body as FormData) : JSON.stringify(body)) : undefined,
  });

  const json = await res.json().catch(() => ({}));
  if (!res.ok || json.success === false) {
    throw new ApiError(res.status, json.message || `Request failed (${res.status})`, json.details);
  }
  return json as T;
}

export const api = {
  get: <T>(path: string, query?: Query) => request<T>('GET', `${path}${toQuery(query)}`),
  post: <T>(path: string, body?: unknown) => request<T>('POST', path, body ?? {}),
  put: <T>(path: string, body?: unknown) => request<T>('PUT', path, body ?? {}),
  patch: <T>(path: string, body?: unknown) => request<T>('PATCH', path, body ?? {}),
  del: <T>(path: string) => request<T>('DELETE', path),
};

/** SWR fetcher — keys are API paths, e.g. `/castings?scope=open`. */
export const fetcher = <T>(path: string) => request<T>('GET', path);

export const errorMessage = (err: unknown) => (err instanceof Error ? err.message : 'Something went wrong');
