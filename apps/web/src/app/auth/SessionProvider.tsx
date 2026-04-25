import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react'
import type { Role, Session } from './types'
import {
  ensureFirebaseAuthSession,
  signOutFirebaseAuthSession,
} from '../../shared/lib/firebaseAuthSession'
import { upsertSessionProfile } from '../../shared/lib/sessionProfileStore'

const SESSION_STORAGE_KEY = 'crisis_os_session'

type SessionContextValue = {
  session: Session | null
  login: (role: Role, displayName?: string) => Promise<void>
  logout: () => Promise<void>
  isAuthenticating: boolean
  authError: string | null
}

const SessionContext = createContext<SessionContextValue | null>(null)

function parseStoredSession(rawValue: string | null): Session | null {
  if (!rawValue) {
    return null
  }

  try {
    const parsed = JSON.parse(rawValue) as Session
    if (parsed.role && parsed.displayName) {
      return parsed
    }
  } catch {
    return null
  }

  return null
}

export function SessionProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<Session | null>(null)
  const [isAuthenticating, setIsAuthenticating] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)

  useEffect(() => {
    const storedValue = localStorage.getItem(SESSION_STORAGE_KEY)
    const parsedSession = parseStoredSession(storedValue)
    setSession(parsedSession)
  }, [])

  const login = useCallback(async (role: Role, displayName?: string) => {
    setIsAuthenticating(true)
    setAuthError(null)

    let firebaseUid: string | undefined

    try {
      const firebaseUser = await ensureFirebaseAuthSession()
      firebaseUid = firebaseUser.uid
    } catch {
      setAuthError(
        'Firebase auth session could not be created. Continuing in local scaffold mode.',
      )
    }

    const nextSession: Session = {
      role,
      displayName: displayName ?? role.replace('_', ' '),
      firebaseUid,
    }

    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(nextSession))
    setSession(nextSession)

    if (firebaseUid) {
      try {
        await upsertSessionProfile({
          uid: firebaseUid,
          role: nextSession.role,
          displayName: nextSession.displayName,
        })
      } catch {
        setAuthError(
          'Signed in, but profile sync to Firestore failed. Check Firestore rules/permissions.',
        )
      }
    }

    setIsAuthenticating(false)
  }, [])

  const logout = useCallback(async () => {
    try {
      await signOutFirebaseAuthSession()
    } catch {
      // Keep local logout deterministic even if Firebase sign-out fails.
    }
    localStorage.removeItem(SESSION_STORAGE_KEY)
    setSession(null)
    setAuthError(null)
  }, [])

  const contextValue = useMemo(
    () => ({
      session,
      login,
      logout,
      isAuthenticating,
      authError,
    }),
    [session, login, logout, isAuthenticating, authError],
  )

  return (
    <SessionContext.Provider value={contextValue}>
      {children}
    </SessionContext.Provider>
  )
}

export function useSession() {
  const context = useContext(SessionContext)
  if (!context) {
    throw new Error('useSession must be used within SessionProvider')
  }
  return context
}
