import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useSession } from '../../app/auth/SessionProvider'
import { routes } from '../../app/router/routes'
import {
  getIncidentById,
  saveIncidentReviewDraft,
  type IncidentDetail,
} from './data/incidentDetailService'

type ReviewFormState = {
  aiInternalSummary: string
  aiGuestMessage: string
}

const initialReviewForm: ReviewFormState = {
  aiInternalSummary: '',
  aiGuestMessage: '',
}

export function IncidentReviewPage() {
  const { id: incidentIdParam } = useParams<{ id: string }>()
  const { session } = useSession()
  const [incident, setIncident] = useState<IncidentDetail | null>(null)
  const [form, setForm] = useState<ReviewFormState>(initialReviewForm)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const loadIncident = useCallback(async () => {
    if (!incidentIdParam || incidentIdParam === 'active') {
      setIsLoading(false)
      setErrorMessage('Use a concrete incident ID for review.')
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
        setForm({
          aiInternalSummary: detail.aiInternalSummary || detail.summaryText,
          aiGuestMessage:
            detail.aiGuestMessage ||
            `Attention: Please follow staff guidance near ${detail.zoneLabel}.`,
        })
      }
    } catch {
      setErrorMessage('Could not load incident detail.')
    }
    setIsLoading(false)
  }, [incidentIdParam])

  useEffect(() => {
    void loadIncident()
  }, [loadIncident])

  function updateField<K extends keyof ReviewFormState>(
    key: K,
    value: ReviewFormState[K],
  ) {
    setForm((previous) => ({ ...previous, [key]: value }))
  }

  async function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!incident || !incidentIdParam) {
      return
    }
    setIsSaving(true)
    setErrorMessage(null)
    setSuccessMessage(null)

    try {
      await saveIncidentReviewDraft({
        incidentId: incidentIdParam,
        aiInternalSummary: form.aiInternalSummary,
        aiGuestMessage: form.aiGuestMessage,
        updatedByUid: session?.firebaseUid,
      })
      setSuccessMessage('Review draft saved.')
    } catch {
      setErrorMessage('Could not save review fields.')
    }
    setIsSaving(false)
  }

  return (
    <main className="page-shell">
      <header className="page-header">
        <p className="page-kicker">Crisis OS</p>
        <h1>AI review draft</h1>
        <p className="page-description">
          Refine internal and guest-facing messages before broadcast.
        </p>
      </header>

      {isLoading ? <p>Loading incident...</p> : null}
      {errorMessage ? <p className="inline-error">{errorMessage}</p> : null}
      {successMessage ? <p>{successMessage}</p> : null}

      {incident ? (
        <section className="form-panel">
          <article className="result-card">
            <h2>Incident context</h2>
            <p>
              Property: <strong>{incident.propertyName}</strong>
            </p>
            <p>
              Type: <strong>{incident.incidentType}</strong>
            </p>
            <p>
              Zone: <strong>{incident.zoneLabel}</strong>
            </p>
            <p>
              Status: <strong>{incident.status}</strong>
            </p>
            <p>{incident.summaryText}</p>
          </article>

          <form className="form-grid" onSubmit={handleSave}>
            <label>
              Internal summary
              <textarea
                rows={4}
                value={form.aiInternalSummary}
                onChange={(event) =>
                  updateField('aiInternalSummary', event.target.value)
                }
              />
            </label>

            <label>
              Guest-safe alert message
              <textarea
                rows={4}
                value={form.aiGuestMessage}
                onChange={(event) =>
                  updateField('aiGuestMessage', event.target.value)
                }
              />
            </label>

            <button type="submit" className="primary-button" disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save review draft'}
            </button>
          </form>

          <div className="page-actions">
            <Link
              className="ghost-button"
              to={routes.manager.broadcastIncident.replace(':id', incident.id)}
            >
              Go to broadcast
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

