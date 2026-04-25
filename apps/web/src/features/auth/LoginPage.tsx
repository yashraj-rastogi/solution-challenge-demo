import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSession } from '../../app/auth/SessionProvider'
import type { Role } from '../../app/auth/types'
import { roleHomeRoutes } from '../../app/router/routes'
import { getFirebaseBootstrapStatus } from '../../shared/lib/firebaseBootstrap'

type RoleOption = {
  role: Role
  label: string
  description: string
}

const roleOptions: RoleOption[] = [
  {
    role: 'org_admin',
    label: 'Org Admin',
    description: 'Set up organization, property, and guest access.',
  },
  {
    role: 'manager',
    label: 'Manager',
    description: 'Run incident command and broadcast actions.',
  },
  {
    role: 'staff',
    label: 'Staff',
    description: 'Submit field reports and complete checklists.',
  },
  {
    role: 'guest',
    label: 'Guest',
    description: 'Join property flow and submit safety status.',
  },
  {
    role: 'responder',
    label: 'Responder',
    description: 'View read-only incident handoff context.',
  },
]

export function LoginPage() {
  const navigate = useNavigate()
  const { session, login, isAuthenticating, authError } = useSession()
  const firebaseStatus = getFirebaseBootstrapStatus()

  const subtitle = useMemo(() => {
    if (!session) {
      return 'Select a role persona to start building and testing the MVP flows.'
    }

    return `Current role: ${session.displayName} (${session.role})`
  }, [session])

  async function handleRoleLogin(role: Role) {
    await login(role)
    navigate(roleHomeRoutes[role])
  }

  return (
    <main className="page-shell">
      <header className="page-header">
        <p className="page-kicker">Crisis OS</p>
        <h1>Role-based access bootstrap</h1>
        <p className="page-description">{subtitle}</p>
      </header>

      <section className={`status-banner ${firebaseStatus.ready ? 'ok' : 'warn'}`}>
        <p>{firebaseStatus.message}</p>
        {!firebaseStatus.ready && firebaseStatus.missingKeys.length > 0 ? (
          <p>
            Missing keys: <code>{firebaseStatus.missingKeys.join(', ')}</code>
          </p>
        ) : null}
      </section>

      {authError ? (
        <section className="status-banner warn">
          <p>{authError}</p>
        </section>
      ) : null}

      <section className="role-grid">
        {roleOptions.map((option) => (
          <article key={option.role} className="role-card">
            <h2>{option.label}</h2>
            <p>{option.description}</p>
            <button
              type="button"
              className="primary-button"
              disabled={isAuthenticating}
              onClick={() => handleRoleLogin(option.role)}
            >
              {isAuthenticating
                ? 'Connecting...'
                : `Continue as ${option.label}`}
            </button>
          </article>
        ))}
      </section>
    </main>
  )
}
