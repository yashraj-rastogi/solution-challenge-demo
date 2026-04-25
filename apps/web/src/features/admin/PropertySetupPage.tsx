import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useSession } from '../../app/auth/SessionProvider'
import { routes } from '../../app/router/routes'
import {
  createPropertyForOrganization,
  getOrganizationsByCreatorUid,
  type OrganizationOption,
} from './data/adminPropertyService'

type FormState = {
  organizationId: string
  propertyName: string
  propertyType: 'hotel' | 'hostel'
  city: string
}

const initialFormState: FormState = {
  organizationId: '',
  propertyName: '',
  propertyType: 'hotel',
  city: '',
}

export function PropertySetupPage() {
  const { session } = useSession()
  const [organizations, setOrganizations] = useState<OrganizationOption[]>([])
  const [isLoadingOrganizations, setIsLoadingOrganizations] = useState(true)
  const [form, setForm] = useState<FormState>(initialFormState)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [result, setResult] = useState<{
    propertyId: string
    joinCode: string
  } | null>(null)

  const loadOrganizations = useCallback(async () => {
    setIsLoadingOrganizations(true)
    setErrorMessage(null)

    try {
      if (!session?.firebaseUid) {
        setOrganizations([])
        return
      }

      const items = await getOrganizationsByCreatorUid(session.firebaseUid)
      setOrganizations(items)
      if (items.length > 0) {
        setForm((previous) => ({
          ...previous,
          organizationId: previous.organizationId || items[0].id,
        }))
      }
    } catch {
      setErrorMessage(
        'Could not load organizations. Create an organization first and retry.',
      )
    } finally {
      setIsLoadingOrganizations(false)
    }
  }, [session?.firebaseUid])

  useEffect(() => {
    void loadOrganizations()
  }, [loadOrganizations])

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((previous) => ({ ...previous, [key]: value }))
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrorMessage(null)
    setResult(null)

    if (!form.organizationId || !form.propertyName || !form.city) {
      setErrorMessage('Organization, property name, and city are required.')
      return
    }

    setIsSubmitting(true)
    try {
      const createResult = await createPropertyForOrganization({
        organizationId: form.organizationId,
        propertyName: form.propertyName,
        propertyType: form.propertyType,
        city: form.city,
        createdByUid: session?.firebaseUid,
      })
      setResult(createResult)
      setForm((previous) => ({
        ...previous,
        propertyName: '',
        city: '',
      }))
    } catch {
      setErrorMessage('Could not create property. Check Firestore permissions.')
    }
    setIsSubmitting(false)
  }

  return (
    <main className="page-shell">
      <header className="page-header">
        <p className="page-kicker">Crisis OS</p>
        <h1>Property setup</h1>
        <p className="page-description">
          Add additional hotel or hostel properties under an existing organization.
        </p>
      </header>

      <section className="page-panel">
        <p>
          Organizations: {isLoadingOrganizations ? 'Loading...' : organizations.length}
        </p>
        <div className="page-actions">
          <button
            type="button"
            className="ghost-button"
            disabled={isLoadingOrganizations}
            onClick={() => void loadOrganizations()}
          >
            Refresh
          </button>
          <Link className="ghost-button" to={routes.admin.organization}>
            Create organization
          </Link>
        </div>
      </section>

      <section className="form-panel">
        <form className="form-grid" onSubmit={handleSubmit}>
          <label>
            Organization
            <select
              value={form.organizationId}
              onChange={(event) =>
                updateField('organizationId', event.target.value)
              }
              required
            >
              {organizations.length === 0 ? (
                <option value="">No organizations available</option>
              ) : (
                organizations.map((organization) => (
                  <option key={organization.id} value={organization.id}>
                    {organization.name}
                  </option>
                ))
              )}
            </select>
          </label>

          <label>
            Property name
            <input
              value={form.propertyName}
              onChange={(event) => updateField('propertyName', event.target.value)}
              placeholder="Sunrise Hostel Koramangala"
              required
            />
          </label>

          <label>
            Property type
            <select
              value={form.propertyType}
              onChange={(event) =>
                updateField('propertyType', event.target.value as 'hotel' | 'hostel')
              }
            >
              <option value="hotel">Hotel</option>
              <option value="hostel">Hostel</option>
            </select>
          </label>

          <label>
            City
            <input
              value={form.city}
              onChange={(event) => updateField('city', event.target.value)}
              placeholder="Pune"
              required
            />
          </label>

          <button type="submit" className="primary-button" disabled={isSubmitting}>
            {isSubmitting ? 'Creating property...' : 'Create property'}
          </button>
        </form>

        {errorMessage ? <p className="inline-error">{errorMessage}</p> : null}

        {result ? (
          <div className="result-card">
            <h2>Property created</h2>
            <p>
              Property ID: <code>{result.propertyId}</code>
            </p>
            <p>
              Join code: <code>{result.joinCode}</code>
            </p>
            <div className="page-actions">
              <Link className="ghost-button" to={routes.admin.guestAccess}>
                Open guest access page
              </Link>
            </div>
          </div>
        ) : null}
      </section>
    </main>
  )
}

