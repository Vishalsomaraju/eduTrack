import { supabase } from "@/lib/supabase";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

async function getToken() {
  // First try
  const { data } = await supabase.auth.getSession();
  if (data?.session?.access_token) {
    return data.session.access_token;
  }

  // Session might be restoring — wait 500ms
  await new Promise((r) => setTimeout(r, 500));
  const { data: data2 } = await supabase.auth.getSession();
  return data2?.session?.access_token || null;
}

// Core request function
async function request(method, path, body = null, params = null) {
  const token = await getToken();

  if (!token) {
    // Don't throw — return null so callers can handle gracefully
    return null;
  }

  const url = new URL(`${BASE_URL}${path}`);

  // Append query params if provided
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null) {
        url.searchParams.append(k, v);
      }
    });
  }

  const options = {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const res = await fetch(url.toString(), options);

  // Handle non-JSON responses
  if (res.status === 204) return null;

  const data = await res.json();

  if (!res.ok) {
    // FastAPI error shape: { detail: string }
    throw new Error(data?.detail || `HTTP ${res.status}`);
  }

  return data;
}

// Convenience methods
export const api = {
  get: (path, params) => request("GET", path, null, params),
  post: (path, body) => request("POST", path, body),
  put: (path, body) => request("PUT", path, body),
  patch: (path, body) => request("PATCH", path, body), // ← add this
  delete: (path) => request("DELETE", path),
};

export default api;
export async function apiWithToken(path, token) {
  const url = `${BASE_URL}${path}`;
  const res = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data?.detail || `HTTP ${res.status}`);
  }
  return res.json();
}
