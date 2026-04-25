import { Link } from 'react-router-dom'
import { routes } from '../../app/router/routes'
import { loadGuestJoinContext } from './data/guestJoinContext'

export function GuestHomePage() {
  const guestContext = loadGuestJoinContext()

  return (
    <main className="page-shell">
      <header className="page-header">
        <p className="page-kicker">Crisis OS</p>
        <h1>Guest safety home</h1>
        <p className="page-description">
          You are connected to the property safety channel. Alerts and check-in
          actions will appear here during an active incident.
        </p>
      </header>

      <section className="page-panel">
        {guestContext ? (
          <>
            <p>
              Property: <strong>{guestContext.propertyName}</strong>
            </p>
            <p>
              Room/Bed: <strong>{guestContext.roomLabel}</strong>
            </p>
            <p>
              Join code: <code>{guestContext.joinCode}</code>
            </p>
            <p>
              Check-in ID: <code>{guestContext.checkInId}</code>
            </p>
          </>
        ) : (
          <p>
            No guest join context found. Complete join flow before using safety
            home features.
          </p>
        )}
      </section>

      <section className="page-panel">
        <div className="page-actions">
          <Link className="ghost-button" to={routes.guest.join}>
            Re-join property
          </Link>
          <Link className="ghost-button" to={routes.guest.alert.replace(':id', 'active')}>
            View active alert
          </Link>
        </div>
      </section>
    </main>
  )
}

