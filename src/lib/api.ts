// src/lib/api.ts (extended — overwrite previous)
const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("accessToken");
}

export const getImageUrl = (path: string) => {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  // If it starts with /uploads, it's from the backend
  if (path.startsWith("/uploads")) {
    const base = process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "http://localhost:4000";
    return `${base}${path}`;
  }
  // Otherwise assume it's a public asset in the frontend
  return path;
};

export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit & { auth?: boolean } = {}
): Promise<T> {
  const { auth = false, headers = {}, ...rest } = options;

  const isFormData = rest.body instanceof FormData;
  const finalHeaders: Record<string, string> = {
    ...(headers as Record<string, string>),
  };

  if (!isFormData) {
    finalHeaders["Content-Type"] = "application/json";
  }

  if (auth) {
    const token = getToken();
    if (token) finalHeaders.Authorization = `Bearer ${token}`;
  }

  const cleanBaseUrl = BASE_URL.endsWith("/") ? BASE_URL.slice(0, -1) : BASE_URL;
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const url = `${cleanBaseUrl}${cleanEndpoint}`;
  console.log(`[apiFetch] Fetching: ${url}`);
  
  const body = rest.body && !isFormData && typeof rest.body === "object" 
    ? JSON.stringify(rest.body) 
    : rest.body;

  const res = await fetch(url, {
    headers: finalHeaders,
    ...rest,
    body,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    // express-validator returns errors in `data` array
    const details = Array.isArray(error.data)
      ? error.data.map((e: any) => `${e.path}: ${e.msg}`).join(", ")
      : "";
    throw new Error(
      details
        ? `${error.message || "Error"} — ${details}`
        : error.message || `API error: ${res.status}`
    );
  }

  const json = await res.json();
  return json.data ?? json;
}