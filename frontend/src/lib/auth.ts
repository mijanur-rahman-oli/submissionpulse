// KNOWN LIMITATION — token in localStorage is vulnerable to XSS. Production should migrate to HttpOnly cookies + CSRF tokens (documented in README).
import { getToken as _get, setToken as _set, clearToken as _clear } from "./api"

export type User = { id: string; name: string; email: string; role: "STUDENT" | "MENTOR" }

const USER_KEY = "sp_user"

export function saveSession(token: string, user: User): void {
  _set(token)
  if (typeof window !== "undefined") localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export function getSession(): { token: string | null; user: User | null } {
  if (typeof window === "undefined") return { token: null, user: null }
  const token = _get()
  const raw = localStorage.getItem(USER_KEY)
  let user: User | null = null
  try { user = raw ? (JSON.parse(raw) as User) : null } catch { user = null }
  // Cross-check: if either is missing, treat session as empty
  if (!token || !user) return { token: null, user: null }
  return { token, user }
}

export function clearSession(): void { _clear() }

export function isMentor(): boolean { const s = getSession(); return s.user?.role === "MENTOR" }
