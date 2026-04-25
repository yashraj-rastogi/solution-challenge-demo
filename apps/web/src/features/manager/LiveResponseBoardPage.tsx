import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { routes } from '../../app/router/routes'
import {
  getGuestCheckInsByProperty,
  type GuestCheckInRecord,
} from '../guest/data/guestCheckInService'
import {
  getIncidentById,
  type IncidentDetail,
} from './data/incidentDetailService'

export function LiveResponseBoardPage() {
  const { id: incidentIdParam } = useParams<{ id: string }>()
  const [incident, setIncident] = useState<IncidentDetail | null>(null)
  const [checkIns, setCheckIns] = useState<GuestCheckInRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const loadBoard = useCallback(async () => {
    if (!incidentIdParam || incidentIdParam === 'active') {
      setIsLoading(false)
      setErrorMessage('Use a concrete incident ID for live board.')
      return
    }

    setIsLoading(true)
    setErrorMessage(null)

    try {
      const detail = await getIncidentById(incidentIdParam)
      if (!detail) {
        setErrorMessage('Incident not found.')
        setIsLoading(false)
        return
      }
      setIncident(detail)

      const guestRows = await getGuestCheckInsByProperty(detail.propertyId)
      setCheckIns(guestRows)
    } catch {
      setErrorMessage('Could not load live board data.')
    }
    setIsLoading(false)
  }, [incidentIdParam])

  useEffect(() => {
    void loadBoard()
  }, [loadBoard])

  const counts = useMemo(
    () => ({
      total: checkIns.length,
      pending: checkIns.filter((row) => row.status === 'pending').length,
      safe: checkIns.filter((row) => row.status === 'safe').length,
      needHelp: checkIns.filter((row) => row.status === 'need_help').length,
      unableToMove: checkIns.filter((row) => row.status === 'unable_to_move').length,
    }),
    [checkIns],
  )

  return (
    <main className="page-shell">
      <header className="page-header">
        <p className="page-kicker">Crisis OS</p>
        <h1>Live response board</h1>
        <p className="page-description">
          Track guest safety states and unresolved critical statuses in real time.
        </p>
      </header>

      {isLoading ? <p>Loading board...</p> : null}
      {errorMessage ? <p className="inline-error">{errorMessage}</p> : null}

      {incident ? (
        <>
          <section className="page-panel">
            <p>
              Incident: <strong>{incident.incidentType}</strong> | Property:{' '}
              <strong>{incident.propertyName}</strong>
            </p>
            <div className="page-actions">
              <button
                type="button"
                className="ghost-button"
                disabled={isLoading}
                onClick={() => void loadBoard()}
              >
                Refresh board
              </button>
              <Link
                className="ghost-button"
                to={routes.manager.handoffIncident.replace(':id', incident.id)}
              >
                Open handoff
              </Link>
            </div>
          </section>

          <section className="cards-grid">
            <article className="result-card">
              <h2>Total</h2>
              <p>
                <strong>{counts.total}</strong>
              </p>
            </article>
            <article className="result-card">
              <h2>Pending</h2>
              <p>
                <strong>{counts.pending}</strong>
              </p>
            </article>
            <article className="result-card">
              <h2>Safe</h2>
              <p>
                <strong>{counts.safe}</strong>
              </p>
            </article>
            <article className="result-card">
              <h2>Need Help</h2>
              <p>
                <strong>{counts.needHelp}</strong>
              </p>
            </article>
            <article className="result-card">
              <h2>Unable to Move</h2>
              <p>
                <strong>{counts.unableToMove}</strong>
              </p>
            </article>
          </section>

          <section className="cards-grid">
            {checkIns.map((row) => (
              <article key={row.id} className="role-card">
                <h2>{row.guestName}</h2>
                <p>
                  Room: <strong>{row.roomLabel}</strong>
                </p>
                <p>
                  Status: <strong>{row.status}</strong>
                </p>
                <p>
                  Check-in ID: <code>{row.id}</code>
                </p>
              </article>
            ))}
          </section>
        </>
      ) : null}
    </main>
  )
}

