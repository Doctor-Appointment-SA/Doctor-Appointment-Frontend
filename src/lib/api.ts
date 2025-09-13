// api.ts
import axios, { AxiosError, AxiosInstance } from 'axios';

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

// ---- baseURL (use your env; fallback for dev) ----
const baseURL =
  process.env.NEXT_PUBLIC_API_GATEWAY_URL || 'http://localhost:4001/api';
if (!baseURL) throw new Error("Missing NEXT_PUBLIC_API_GATEWAY_URL");

// ---- axios instance ----
export const apiClient: AxiosInstance = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
  // withCredentials: true, // uncomment if your backend uses cookies
});

// (optional) attach Bearer token automatically
apiClient.interceptors.request.use((config: any) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('access_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// unified error (similar to your fetch version’s thrown text)
export class ApiError extends Error {
  status?: number;
  data?: unknown;
  constructor(message: string, status?: number, data?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

// ---- generic request used by helpers below ----
async function request<T>(
  path: string,
  opts: { method?: HttpMethod; body?: unknown; headers?: Record<string, string> } = {}
): Promise<T> {
  try {
    const res = await apiClient.request<T>({
      url: path,
      method: opts.method ?? "GET",
      headers: opts.headers,
      data: opts.body, // axios JSON-serializes objects automatically
      // timeout: 15000, // optional
    });
    return res.data;
  } catch (e) {
    const err = e as AxiosError;
    const status = err.response?.status;
    const statusText = err.response?.statusText ?? '';
    const data = err.response?.data;
    const text = typeof data === 'string' ? data : JSON.stringify(data ?? '');
    throw new ApiError(`API ${status ?? ''} ${statusText}: ${text}`, status, data);
  }
}

// ---- public helpers (same shape as your fetch wrapper) ----
export const api = {
  get:  <T>(path: string, headers?: Record<string,string>) =>
    request<T>(path, { method: "GET", headers }),
  post: <T>(path: string, body?: unknown, headers?: Record<string,string>) =>
    request<T>(path, { method: "POST", body, headers }),
  put:  <T>(path: string, body?: unknown, headers?: Record<string,string>) =>
    request<T>(path, { method: "PUT", body, headers }),
  patch:<T>(path: string, body?: unknown, headers?: Record<string,string>) =>
    request<T>(path, { method: "PATCH", body, headers }),
  del:  <T>(path: string, headers?: Record<string,string>) =>
    request<T>(path, { method: "DELETE", headers }),
};
