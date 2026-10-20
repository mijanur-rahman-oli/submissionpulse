// 10s timeout via AbortController. Token read from localStorage; do not log tokens anywhere.
export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"

const TOKEN_KEY = "sp_token"
const USER_KEY = "sp_user"

export function getToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(t: string | null): void {
  if (typeof window === "undefined") return
  if (t === null) {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    return
  }
  localStorage.setItem(TOKEN_KEY, t)
}

export function clearToken(): void {
  if (typeof window === "undefined") return
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

export class ApiError extends Error {
  status: number
  code: string
  issues?: unknown

  constructor(status: number, code: string, issues?: unknown) {
    super(code)
    this.name = "ApiError"
    this.status = status
    this.code = code
    this.issues = issues
  }
}

export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers)
  headers.set("Content-Type", "application/json")
  const token = getToken()
  if (token) headers.set("Authorization", `Bearer ${token}`)

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 10_000)
  let res: Response
  try {
    res = await fetch(`${API_URL}${path}`, { ...init, headers, signal: controller.signal })
  } catch (e) {
    clearTimeout(timeout)
    throw new ApiError(0, "NetworkError")
  }
  clearTimeout(timeout)

  const text = await res.text()
  const data = text ? (() => { try { return JSON.parse(text) } catch { return { error: text } } })() : {}

  if (!res.ok) {
    if (res.status === 401) {
      // Token expired / invalid — clear session but DO NOT loop on auth endpoints
      if (!path.startsWith("/auth/login") && !path.startsWith("/auth/signup")) {
        clearToken()
      }
    }
    throw new ApiError(res.status, (data as any).error ?? "RequestFailed", (data as any).issues)
  }
  return data as T
}
