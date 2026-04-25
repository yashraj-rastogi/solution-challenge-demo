import { useState } from 'react'
import { Link } from 'react-router-dom'
import { routes } from '../../app/router/routes'
import {
  submitGuestSafetyStatus,
  type GuestSafetyStatus,
} from './data/guestCheckInService'
import { loadGuestJoinContext } from './data/guestJoinContext'

type ActionStatus = Exclude<GuestSafetyStatus, 'pending'>

const actions: Array<{
  label: string
  status: ActionStatus
  description: string
}> = [
  {
    label: 'I am safe',
    status: 'safe',
    description: 'No immediate assistance needed.',
  },
  {
    label: 'Need help',
    status: 'need_help',
    description: 'Assistance is needed but movement is possible.',
  },
  {
    label: 'Unable to move',
    status: 'unable_to_move',
    description: 'Immediate rescue required.',
  },
]

export function GuestCheckInPage() {
  const guestContext = loadGuestJoinContext()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  async function submitStatus(nextStatus: ActionStatus) {
    if (!guestContext?.checkInId) {
      setErrorMessage('Guest join context not found. Re-join property first.')
      return
    }

    setIsSubmitting(true)
    setErrorMessage(null)
    setSuccessMessage(null)

    try {
      await submitGuestSafetyStatus({
        checkInId: guestContext.checkInId,
        status: nextStatus,
      })
      setSuccessMessage(`Status submitted: ${nextStatus}`)
    } catch {
      setErrorMessage('Could not submit status. Please retry.')
    }
    setIsSubmitting(false)
  }

  return (
    <main className="page-shell">
      <header className="page-header">
        <p className="page-kicker">Crisis OS</p>
        <h1>Safety check-in</h1>
        <p className="page-description">
          Quickly share your live safety state so responders can prioritize support.
        </p>
      </header>

      {guestContext ? (
        <section className="page-panel">
          <p>
            Property: <strong>{guestContext.propertyName}</strong> | Room:{' '}
            <strong>{guestContext.roomLabel}</strong>
          </p>
          <p>
            Check-in ID: <code>{guestContext.checkInId}</code>
          </p>
        </section>
      ) : (
        <p className="inline-error">
          No guest context found. Join a property before submitting safety status.
        </p>
      )}

      <section className="cards-grid">
        {actions.map((action) => (
          <article key={action.status} className="role-card">
            <h2>{action.label}</h2>
            <p>{action.description}</p>
            <button
              type="button"
              className="primary-button"
              disabled={isSubmitting}
              onClick={() => void submitStatus(action.status)}
            >
              {isSubmitting ? 'Submitting...' : action.label}
            </button>
          </article>
        ))}
      </section>

      {errorMessage ? <p className="inline-error">{errorMessage}</p> : null}
      {successMessage ? <p>{successMessage}</p> : null}

      <section className="page-actions">
        <Link className="ghost-button" to={routes.guest.home}>
          Back to guest home
        </Link>
        <Link className="ghost-button" to={routes.guest.alert.replace(':id', 'active')}>
          View active alert
        </Link>
      </section>
    </main>
  )
}

