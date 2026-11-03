const API_URL = import.meta.env.VITE_API_URL || `${window.location.origin}/api`;
const TOKEN_KEY = "mentorflow_token";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}
export function setToken(token: string | null) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

type Options = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: any;
  headers?: Record<string, string>;
  auth?: boolean;
};

export async function api<T = any>(path: string, opts: Options = {}): Promise<T> {
  const { method = "GET", body, auth = true, headers: customHeaders } = opts;
  const headers: Record<string, string> = { "Content-Type": "application/json", ...customHeaders };
  if (auth) {
    const t = getToken();
    if (t) headers.Authorization = `Bearer ${t}`;
  }
  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (e: any) {
    // Erro de rede (backend fora, proxy /api/ quebrado, CORS, DNS...).
    // O fetch original lança "Failed to fetch" sem detalhes — traduzimos.
    if (e?.name === "AbortError") throw new Error("Tempo esgotado ao falar com o servidor. Tente novamente.");
    throw new Error("Não foi possível conectar ao servidor. Verifique sua internet ou tente novamente em instantes.");
  }
  if (!res.ok) {
    let msg = `Erro ${res.status}`;
    try {
      const data = await res.json();
      msg = data.message || data.error || msg;
      if (Array.isArray(msg)) msg = msg.join(", ");
    } catch {}
    throw new Error(msg);
  }
  if (res.status === 204) return undefined as any;
  return res.json();
}

export const API_BASE = API_URL;
