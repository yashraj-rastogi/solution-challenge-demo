import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useSession } from '../../app/auth/SessionProvider'
import { routes } from '../../app/router/routes'
import {
  activateIncidentWithBroadcast,
  getIncidentById,
  type IncidentDetail,
} from './data/incidentDetailService'

type BroadcastScope = 'all' | 'floor' | 'zone' | 'staff-only'

export function BroadcastCenterPage() {
  const { id: incidentIdParam } = useParams<{ id: string }>()
  const { session } = useSession()
  const [incident, setIncident] = useState<IncidentDetail | null>(null)
  const [scope, setScope] = useState<BroadcastScope>('all')
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const loadIncident = useCallback(async () => {
    if (!incidentIdParam || incidentIdParam === 'active') {
      setIsLoading(false)
      setErrorMessage('Use a concrete incident ID for broadcast.')
      return
    }
    setIsLoading(true)
    setErrorMessage(null)
    setSuccessMessage(null)

    try {
      const detail = await getIncidentById(incidentIdParam)
      if (!detail) {
        setErrorMessage('Incident not found.')
      } else {
        setIncident(detail)
        setMessage(
          detail.aiGuestMessage ||
            `Safety alert: follow instructions for ${detail.zoneLabel}.`,
        )
      }
    } catch {
      setErrorMessage('Could not load incident details.')
    }
    setIsLoading(false)
  }, [incidentIdParam])

  useEffect(() => {
    void loadIncident()
  }, [loadIncident])

  async function handleBroadcast(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!incident || !incidentIdParam) {
      return
    }
    if (!message.trim()) {
      setErrorMessage('Broadcast message cannot be empty.')
      return
    }

    setIsSending(true)
    setErrorMessage(null)
    setSuccessMessage(null)

    try {
      await activateIncidentWithBroadcast({
        incidentId: incidentIdParam,
        propertyId: incident.propertyId,
        message,
        targetScope: scope,
        updatedByUid: session?.firebaseUid,
      })
      setSuccessMessage('Broadcast sent and incident marked active.')
    } catch {
      setErrorMessage('Broadcast failed. Check Firestore permissions.')
    }
    setIsSending(false)
  }

  return (
    <main className="page-shell">
      <header className="page-header">
        <p className="page-kicker">Crisis OS</p>
        <h1>Broadcast center</h1>
        <p className="page-description">
          Send approved alert copy and activate incident response mode.
        </p>
      </header>

      {isLoading ? <p>Loading incident...</p> : null}
      {errorMessage ? <p className="inline-error">{errorMessage}</p> : null}
      {successMessage ? <p>{successMessage}</p> : null}

      {incident ? (
        <section className="form-panel">
          <article className="result-card">
            <h2>{incident.propertyName}</h2>
            <p>
              Incident type: <strong>{incident.incidentType}</strong>
            </p>
            <p>
              Zone: <strong>{incident.zoneLabel}</strong>
            </p>
            <p>
              Current status: <strong>{incident.status}</strong>
            </p>
          </article>

          <form className="form-grid" onSubmit={handleBroadcast}>
            <label>
              Target scope
              <select
                value={scope}
                onChange={(event) => setScope(event.target.value as BroadcastScope)}
              >
                <option value="all">All guests</option>
                <option value="floor">Specific floor</option>
                <option value="zone">Specific zone</option>
                <option value="staff-only">Staff only</option>
              </select>
            </label>

            <label>
              Alert message
              <textarea
                rows={4}
                value={message}
                onChange={(event) => setMessage(event.target.value)}
              />
            </label>

            <button type="submit" className="primary-button" disabled={isSending}>
              {isSending ? 'Sending broadcast...' : 'Send broadcast'}
            </button>
          </form>

          <div className="page-actions">
            <Link
              className="ghost-button"
              to={routes.manager.liveIncident.replace(':id', incident.id)}
            >
              Open live board
            </Link>
            <Link className="ghost-button" to={routes.manager.dashboard}>
              Back to dashboard
            </Link>
          </div>
        </section>
      ) : null}
    </main>
  )
}

