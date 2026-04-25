import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useSession } from '../../app/auth/SessionProvider'
import { routes } from '../../app/router/routes'
import {
  getIncidentsByCreatorUid,
  getRecentIncidents,
  type IncidentSummary,
} from './data/incidentQueryService'

export function ManagerDashboardPage() {
  const { session } = useSession()
  const [incidents, setIncidents] = useState<IncidentSummary[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const loadIncidents = useCallback(async () => {
    setIsLoading(true)
    setErrorMessage(null)

    try {
      let results: IncidentSummary[] = []
      if (session?.firebaseUid) {
        results = await getIncidentsByCreatorUid(session.firebaseUid)
      }
      if (results.length === 0) {
        results = await getRecentIncidents()
      }
      setIncidents(results)
    } catch {
      setErrorMessage('Could not load incidents. Check Firestore rules/indexes.')
    }
    setIsLoading(false)
  }, [session?.firebaseUid])

  useEffect(() => {
    void loadIncidents()
  }, [loadIncidents])

  const counts = useMemo(
    () => ({
      total: incidents.length,
      draft: incidents.filter((incident) => incident.status === 'draft').length,
      active: incidents.filter((incident) => incident.status === 'active').length,
      resolved: incidents.filter((incident) => incident.status === 'resolved').length,
    }),
    [incidents],
  )

  return (
    <main className="page-shell">
      <header className="page-header">
        <p className="page-kicker">Crisis OS</p>
        <h1>Manager command dashboard</h1>
        <p className="page-description">
          Review recent incident states and launch new incident flow.
        </p>
      </header>

      <section className="cards-grid">
        <article className="result-card">
          <h2>Total incidents</h2>
          <p>
            <strong>{counts.total}</strong>
          </p>
        </article>
        <article className="result-card">
          <h2>Draft</h2>
          <p>
            <strong>{counts.draft}</strong>
          </p>
        </article>
        <article className="result-card">
          <h2>Active</h2>
          <p>
            <strong>{counts.active}</strong>
          </p>
        </article>
        <article className="result-card">
          <h2>Resolved</h2>
          <p>
            <strong>{counts.resolved}</strong>
          </p>
        </article>
      </section>

      <section className="page-panel">
        <p>{isLoading ? 'Loading incidents...' : 'Incident list ready'}</p>
        <div className="page-actions">
          <button
            type="button"
            className="ghost-button"
            onClick={() => void loadIncidents()}
            disabled={isLoading}
          >
            {isLoading ? 'Loading...' : 'Refresh'}
          </button>
          <Link className="primary-button" to={routes.manager.newIncident}>
            Create incident draft
          </Link>
        </div>
      </section>

      {errorMessage ? <p className="inline-error">{errorMessage}</p> : null}

      <section className="cards-grid">
        {incidents.map((incident) => (
          <article key={incident.id} className="role-card">
            <h2>{incident.incidentType}</h2>
            <p>
              Property: <strong>{incident.propertyName}</strong>
            </p>
            <p>
              Zone: <strong>{incident.zoneLabel || 'Not set'}</strong>
            </p>
            <p>
              Status: <strong>{incident.status}</strong>
            </p>
            <p>{incident.summaryText || 'No summary provided.'}</p>
            <div className="page-actions">
              <Link
                className="ghost-button"
                to={routes.manager.reviewIncident.replace(':id', incident.id)}
              >
                Review draft
              </Link>
              <Link
                className="ghost-button"
                to={routes.manager.liveIncident.replace(':id', incident.id)}
              >
                Live board
              </Link>
            </div>
          </article>
        ))}
      </section>
    </main>
  )
}

