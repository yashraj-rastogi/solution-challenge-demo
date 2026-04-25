import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useSession } from '../../app/auth/SessionProvider'
import { routes } from '../../app/router/routes'
import {
  getPropertiesByCreatorUid,
  getRecentProperties,
  type PropertyRecord,
} from '../../shared/lib/propertyRepository'
import {
  createIncidentDraft,
  incidentTypeOptions,
  type IncidentType,
} from './data/incidentService'

type IncidentFormState = {
  propertyId: string
  incidentType: IncidentType
  zoneLabel: string
  summaryText: string
}

const initialFormState: IncidentFormState = {
  propertyId: '',
  incidentType: 'fire',
  zoneLabel: '',
  summaryText: '',
}

export function CreateIncidentPage() {
  const { session } = useSession()
  const [properties, setProperties] = useState<PropertyRecord[]>([])
  const [isLoadingProperties, setIsLoadingProperties] = useState(true)
  const [form, setForm] = useState<IncidentFormState>(initialFormState)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [createdIncidentId, setCreatedIncidentId] = useState<string | null>(null)

  const loadProperties = useCallback(async () => {
    setIsLoadingProperties(true)
    setErrorMessage(null)

    try {
      let results: PropertyRecord[] = []
      if (session?.firebaseUid) {
        results = await getPropertiesByCreatorUid(session.firebaseUid)
      }
      if (results.length === 0) {
        results = await getRecentProperties()
      }
      setProperties(results)

      if (results.length > 0) {
        setForm((previous) => ({
          ...previous,
          propertyId: previous.propertyId || results[0].id,
        }))
      }
    } catch {
      setErrorMessage('Could not load properties. Check Firestore rules/indexes.')
    }

    setIsLoadingProperties(false)
  }, [session?.firebaseUid])

  useEffect(() => {
    void loadProperties()
  }, [loadProperties])

  const selectedProperty = useMemo(
    () => properties.find((property) => property.id === form.propertyId) ?? null,
    [properties, form.propertyId],
  )

  function updateField<K extends keyof IncidentFormState>(
    key: K,
    value: IncidentFormState[K],
  ) {
    setForm((previous) => ({ ...previous, [key]: value }))
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setCreatedIncidentId(null)
    setErrorMessage(null)

    if (!selectedProperty) {
      setErrorMessage('Select a valid property before creating incident draft.')
      return
    }
    if (!form.zoneLabel || !form.summaryText) {
      setErrorMessage('Zone/location and incident summary are required.')
      return
    }

    setIsSubmitting(true)
    try {
      const result = await createIncidentDraft({
        propertyId: selectedProperty.id,
        propertyName: selectedProperty.name,
        incidentType: form.incidentType,
        zoneLabel: form.zoneLabel,
        summaryText: form.summaryText,
        createdByUid: session?.firebaseUid,
      })

      setCreatedIncidentId(result.incidentId)
      setForm((previous) => ({
        ...previous,
        zoneLabel: '',
        summaryText: '',
      }))
    } catch {
      setErrorMessage(
        'Failed to create incident draft. Check Firestore permissions and retry.',
      )
    }
    setIsSubmitting(false)
  }

  return (
    <main className="page-shell">
      <header className="page-header">
        <p className="page-kicker">Crisis OS</p>
        <h1>Create incident draft</h1>
        <p className="page-description">
          Managers can create the first draft before AI review and broadcast.
        </p>
      </header>

      <section className="page-panel">
        <p>
          Available properties: {isLoadingProperties ? 'Loading...' : properties.length}
        </p>
        <div className="page-actions">
          <button
            type="button"
            className="ghost-button"
            disabled={isLoadingProperties}
            onClick={() => void loadProperties()}
          >
            Refresh properties
          </button>
          <Link className="ghost-button" to={routes.admin.organization}>
            Add property
          </Link>
        </div>
      </section>

      <section className="form-panel">
        <form className="form-grid" onSubmit={handleSubmit}>
          <label>
            Property
            <select
              value={form.propertyId}
              onChange={(event) => updateField('propertyId', event.target.value)}
              required
            >
              {properties.length === 0 ? (
                <option value="">No properties available</option>
              ) : (
                properties.map((property) => (
                  <option key={property.id} value={property.id}>
                    {property.name} ({property.city || 'Unknown city'})
                  </option>
                ))
              )}
            </select>
          </label>

          <label>
            Incident type
            <select
              value={form.incidentType}
              onChange={(event) =>
                updateField('incidentType', event.target.value as IncidentType)
              }
            >
              {incidentTypeOptions.map((incidentType) => (
                <option key={incidentType} value={incidentType}>
                  {incidentType}
                </option>
              ))}
            </select>
          </label>

          <label>
            Zone / floor / location label
            <input
              value={form.zoneLabel}
              onChange={(event) => updateField('zoneLabel', event.target.value)}
              placeholder="Floor 2 - Kitchen"
              required
            />
          </label>

          <label>
            Initial incident summary
            <textarea
              value={form.summaryText}
              onChange={(event) => updateField('summaryText', event.target.value)}
              placeholder="Gas smell detected near kitchen and guest corridor."
              rows={5}
              required
            />
          </label>

          <button type="submit" className="primary-button" disabled={isSubmitting}>
            {isSubmitting ? 'Creating draft...' : 'Create incident draft'}
          </button>
        </form>

        {errorMessage ? <p className="inline-error">{errorMessage}</p> : null}

        {createdIncidentId ? (
          <div className="result-card">
            <h2>Draft created</h2>
            <p>
              Incident ID: <code>{createdIncidentId}</code>
            </p>
            <div className="page-actions">
              <Link
                className="ghost-button"
                to={routes.manager.reviewIncident.replace(':id', createdIncidentId)}
              >
                Open AI review route
              </Link>
              <Link className="ghost-button" to={routes.manager.dashboard}>
                Back to manager dashboard
              </Link>
            </div>
          </div>
        ) : null}
      </section>
    </main>
  )
}
