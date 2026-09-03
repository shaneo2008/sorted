/** Tiny typed fetch wrapper. All API access goes through this. */

function jwt(): string | null {
  return localStorage.getItem("sorted_jwt");
}

export async function api<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const res = await fetch(`/api${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(jwt() ? { Authorization: `Bearer ${jwt()}` } : {}),
      ...init.headers,
    },
  });
  if (res.status === 401) {
    localStorage.removeItem("sorted_jwt");
    if (window.location.pathname !== "/login") {
      window.location.assign("/login");
    }
  }
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { error?: string }).error ?? `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export const euros = (cents: number) =>
  new Intl.NumberFormat("en-IE", { style: "currency", currency: "EUR" }).format(
    cents / 100,
  );
