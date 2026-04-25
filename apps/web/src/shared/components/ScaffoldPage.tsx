import { Link } from 'react-router-dom'
import { useSession } from '../../app/auth/SessionProvider'
import { routes } from '../../app/router/routes'

type ScaffoldPageProps = {
  title: string
  description: string
}

export function ScaffoldPage({ title, description }: ScaffoldPageProps) {
  const { session, logout } = useSession()

  return (
    <main className="page-shell">
      <header className="page-header">
        <p className="page-kicker">Crisis OS</p>
        <h1>{title}</h1>
        <p className="page-description">{description}</p>
      </header>

      <section className="page-panel">
        <p>
          Signed in as <strong>{session?.displayName ?? 'Unknown user'}</strong>
          {' '}({session?.role ?? 'no role'})
        </p>
        {session?.firebaseUid ? (
          <p>
            Firebase UID: <code>{session.firebaseUid}</code>
          </p>
        ) : null}

        <div className="page-actions">
          <Link className="ghost-button" to={routes.login}>
            Switch role
          </Link>
          <button
            type="button"
            className="ghost-button"
            onClick={() => void logout()}
          >
            Logout
          </button>
        </div>
      </section>
    </main>
  )
}
