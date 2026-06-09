const BASE = (window as any).__SENTINEL_CONFIG__?.apiBaseUrl
  ?? import.meta.env.VITE_API_BASE_URL
  ?? "/api/sentinel";

async function req(path: string, opts?: RequestInit) {
  const token = localStorage.getItem("sentinel_token") ?? "";
  const res = await fetch(`${BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...opts,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || res.statusText);
  }
  return res.json();
}

export const api = {
  get: (path: string) => req(path),
  post: (path: string, body?: unknown) =>
    req(path, { method: "POST", body: JSON.stringify(body ?? {}) }),
};
