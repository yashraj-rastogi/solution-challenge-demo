import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useSession } from '../../app/auth/SessionProvider'
import { routes } from '../../app/router/routes'
import {
  createOrganizationSetup,
  type CreateOrganizationSetupResult,
} from './data/adminSetupService'

type FormState = {
  organizationName: string
  contactEmail: string
  emergencyPhone: string
  propertyName: string
  propertyType: 'hotel' | 'hostel'
  city: string
}

const initialFormState: FormState = {
  organizationName: '',
  contactEmail: '',
  emergencyPhone: '',
  propertyName: '',
  propertyType: 'hotel',
  city: '',
}

export function OrganizationSetupPage() {
  const { session } = useSession()
  const [form, setForm] = useState<FormState>(initialFormState)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [result, setResult] = useState<CreateOrganizationSetupResult | null>(
    null,
  )

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((previous) => ({ ...previous, [key]: value }))
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrorMessage(null)
    setResult(null)

    if (
      !form.organizationName ||
      !form.contactEmail ||
      !form.emergencyPhone ||
      !form.propertyName ||
      !form.city
    ) {
      setErrorMessage('Please fill all required fields before continuing.')
      return
    }

    setIsSubmitting(true)
    try {
      const creationResult = await createOrganizationSetup({
        organizationName: form.organizationName,
        contactEmail: form.contactEmail,
        emergencyPhone: form.emergencyPhone,
        propertyName: form.propertyName,
        propertyType: form.propertyType,
        city: form.city,
        createdByUid: session?.firebaseUid,
      })

      setResult(creationResult)
      setForm(initialFormState)
    } catch {
      setErrorMessage(
        'Could not create organization setup. Check Firebase auth/rules and try again.',
      )
    }
    setIsSubmitting(false)
  }

  return (
    <main className="page-shell">
      <header className="page-header">
        <p className="page-kicker">Crisis OS</p>
        <h1>Organization setup</h1>
        <p className="page-description">
          Create an organization and first property so guest onboarding can start
          with code or room QR.
        </p>
      </header>

      <section className="form-panel">
        <form className="form-grid" onSubmit={handleSubmit}>
          <label>
            Organization name
            <input
              value={form.organizationName}
              onChange={(event) =>
                updateField('organizationName', event.target.value)
              }
              placeholder="Sunrise Hospitality Group"
              required
            />
          </label>

          <label>
            Contact email
            <input
              type="email"
              value={form.contactEmail}
              onChange={(event) => updateField('contactEmail', event.target.value)}
              placeholder="ops@sunrise.example"
              required
            />
          </label>

          <label>
            Emergency phone
            <input
              value={form.emergencyPhone}
              onChange={(event) =>
                updateField('emergencyPhone', event.target.value)
              }
              placeholder="+91 98xxxxxxxx"
              required
            />
          </label>

          <label>
            Property name
            <input
              value={form.propertyName}
              onChange={(event) => updateField('propertyName', event.target.value)}
              placeholder="Sunrise Hotel MG Road"
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
              placeholder="Bengaluru"
              required
            />
          </label>

          <button type="submit" className="primary-button" disabled={isSubmitting}>
            {isSubmitting ? 'Creating setup...' : 'Create organization setup'}
          </button>
        </form>

        {errorMessage ? (
          <p className="inline-error">{errorMessage}</p>
        ) : null}

        {result ? (
          <div className="result-card">
            <h2>Setup created</h2>
            <p>
              Organization ID: <code>{result.organizationId}</code>
            </p>
            <p>
              Property ID: <code>{result.propertyId}</code>
            </p>
            <p>
              Guest join code: <code>{result.joinCode}</code>
            </p>
            <div className="page-actions">
              <Link className="ghost-button" to={routes.admin.guestAccess}>
                Continue to guest access setup
              </Link>
            </div>
          </div>
        ) : null}
      </section>
    </main>
  )
}

