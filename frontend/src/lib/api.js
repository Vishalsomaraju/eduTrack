import { supabase } from "@/lib/supabase";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

// ── TTL Cache ─────────────────────────────────────────────────────────────────
// Caches GET responses in memory for the given TTL (ms).
// Keyed by full URL (path + query string).
// Cache is cleared on signOut (call apiCache.clear()).

const TTL = {
  default: 30_000, // 30s — subjects list, course list, static data
  short: 10_000, // 10s — attendance, marks (can change)
  long: 120_000, // 2 min — syllabus, deadlines
};

// Which path prefixes get which TTL
function getTTL(path) {
  if (path.startsWith("/courses/subjects")) return TTL.long;
  if (path.startsWith("/subjects")) return TTL.default;
  if (path.startsWith("/faculty")) return TTL.default;
  if (path.startsWith("/students")) return TTL.default;
  if (path.startsWith("/attendance")) return TTL.short;
  if (path.startsWith("/marks")) return TTL.short;
  if (path.startsWith("/lab-marks")) return TTL.short;
  return TTL.default;
}

const _cache = new Map(); // url → { data, expiresAt }

export const apiCache = {
  get(key) {
    const entry = _cache.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      _cache.delete(key);
      return null;
    }
    return entry.data;
  },
  set(key, data, ttl) {
    _cache.set(key, { data, expiresAt: Date.now() + ttl });
  },
  invalidate(prefix) {
    // Remove all cache entries whose key starts with the given prefix
    for (const key of _cache.keys()) {
      if (key.includes(prefix)) _cache.delete(key);
    }
  },
  clear() {
    _cache.clear();
  },
};

// ── In-flight request deduplication ──────────────────────────────────────────
// If two callers request the same URL simultaneously, they share one fetch promise
// instead of firing two identical network requests.

const _inflight = new Map(); // url → Promise

// ── Auth token ────────────────────────────────────────────────────────────────

async function getToken() {
  const { data } = await supabase.auth.getSession();
  if (data?.session?.access_token) return data.session.access_token;
  await new Promise((r) => setTimeout(r, 500));
  const { data: data2 } = await supabase.auth.getSession();
  return data2?.session?.access_token || null;
}

// ── Core request ──────────────────────────────────────────────────────────────

async function request(method, path, body = null, params = null) {
  const token = await getToken();
  if (!token) return null;

  const url = new URL(`${BASE_URL}${path}`);
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null) url.searchParams.append(k, v);
    });
  }

  const urlStr = url.toString();
  const isGET = method === "GET";

  // ── Cache check (GET only) ──────────────────────────────────────────────
  if (isGET) {
    const cached = apiCache.get(urlStr);
    if (cached !== null) return cached;

    // Deduplication — if same GET is already in-flight, wait for it
    if (_inflight.has(urlStr)) return _inflight.get(urlStr);
  }

  const fetchPromise = (async () => {
    const options = {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    };
    if (body) options.body = JSON.stringify(body);

    const res = await fetch(urlStr, options);
    if (res.status === 204) return null;

    const data = await res.json();
    if (!res.ok)
      throw Object.assign(new Error(data?.detail || `HTTP ${res.status}`), {
        data,
      });

    // Store in cache for GET requests
    if (isGET) {
      apiCache.set(urlStr, data, getTTL(path));
    }

    return data;
  })();

  if (isGET) {
    _inflight.set(urlStr, fetchPromise);
    fetchPromise.finally(() => _inflight.delete(urlStr));
  }

  return fetchPromise;
}

// ── Public API ────────────────────────────────────────────────────────────────

export const api = {
  get: (path, params) => request("GET", path, null, params),
  post: (path, body) => request("POST", path, body),
  put: (path, body) => request("PUT", path, body),
  patch: (path, body) => request("PATCH", path, body),
  delete: (path, body) => request("DELETE", path, body || null),
};

export default api;

// ── Cache invalidation helpers ────────────────────────────────────────────────
// Call these after mutations so stale data isn't served.

export function invalidateAttendance(subjectId) {
  apiCache.invalidate(`/attendance/${subjectId}`);
  apiCache.invalidate(`/attendance/student`);
}

export function invalidateMarks(subjectId) {
  apiCache.invalidate(`/marks/${subjectId}`);
  apiCache.invalidate(`/marks/student`);
  apiCache.invalidate(`/lab-marks/${subjectId}`);
  apiCache.invalidate(`/lab-marks/student`);
}

export function invalidateSubjects() {
  apiCache.invalidate("/subjects");
  apiCache.invalidate("/courses/subjects");
}

// ── Used by useAuth.js signOut ────────────────────────────────────────────────
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
