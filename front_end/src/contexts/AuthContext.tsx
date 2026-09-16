import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { TOKEN_KEY } from '@/api/client'
import { authApi } from '@/api/services'
import type { LoginPayload, RegisterPayload, User, UserRole } from '@/types'

interface AuthContextValue {
  user: User | null
  loading: boolean
  login: (payload: LoginPayload) => Promise<User>
  register: (payload: RegisterPayload) => Promise<User>
  updateUser: (nextUser: User) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

const USER_KEY = 'coco_user'

export function getRoleHomePath(role: UserRole): string {
  if (role === 'officer') return '/officer/reports'
  if (role === 'admin') return '/admin'
  return '/app'
}

function persistSession(token: string, user: User) {
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

function clearSession() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function restoreSession() {
      const token = localStorage.getItem(TOKEN_KEY)
      if (!token) {
        if (!cancelled) setLoading(false)
        return
      }

      // Prefer a live server validation so old tokens (e.g. after JWT_SECRET
      // rotation) never leave the UI in a half-broken fetch state.
      try {
        const me = await authApi.me()
        if (cancelled) return
        persistSession(token, me)
        setUser(me)
      } catch {
        if (cancelled) return
        clearSession()
        setUser(null)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void restoreSession()
    return () => {
      cancelled = true
    }
  }, [])

  const login = useCallback(async (payload: LoginPayload) => {
    const { token, user: loggedIn } = await authApi.login(payload)
    persistSession(token, loggedIn)
    setUser(loggedIn)
    return loggedIn
  }, [])

  const register = useCallback(async (payload: RegisterPayload) => {
    const { token, user: registered } = await authApi.register(payload)
    persistSession(token, registered)
    setUser(registered)
    return registered
  }, [])

  const updateUser = useCallback((nextUser: User) => {
    const token = localStorage.getItem(TOKEN_KEY)
    if (token) persistSession(token, nextUser)
    setUser(nextUser)
  }, [])

  const logout = useCallback(() => {
    clearSession()
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({ user, loading, login, register, updateUser, logout }),
    [user, loading, login, register, updateUser, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
