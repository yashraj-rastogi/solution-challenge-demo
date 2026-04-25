import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useSession } from '../../app/auth/SessionProvider'
import { routes } from '../../app/router/routes'
import {
  getPropertiesByCreatorUid,
  getRecentProperties,
  type PropertyRecord,
} from '../../shared/lib/propertyRepository'

function buildQrPayload(property: PropertyRecord) {
  return `CRISISOS://JOIN?propertyId=${property.id}&code=${property.joinCode}`
}

export function GuestAccessPage() {
  const { session } = useSession()
  const [properties, setProperties] = useState<PropertyRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  const loadProperties = useCallback(async () => {
    setIsLoading(true)
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
    } catch {
      setErrorMessage(
        'Could not load properties. Check Firestore indexes/rules and refresh.',
      )
    }

    setIsLoading(false)
  }, [session?.firebaseUid])

  useEffect(() => {
    void loadProperties()
  }, [loadProperties])

  const propertyCountLabel = useMemo(
    () => `${properties.length} ${properties.length === 1 ? 'property' : 'properties'}`,
    [properties.length],
  )

  async function handleCopy(payload: string) {
    try {
      await navigator.clipboard.writeText(payload)
      setCopiedCode(payload)
      window.setTimeout(() => setCopiedCode(null), 1500)
    } catch {
      setErrorMessage('Clipboard copy failed. Copy manually from the card.')
    }
  }

  return (
    <main className="page-shell">
      <header className="page-header">
        <p className="page-kicker">Crisis OS</p>
        <h1>Guest access setup</h1>
        <p className="page-description">
          Share property join code at front desk and use QR payload format for
          room card generation.
        </p>
      </header>

      <section className="page-panel">
        <p>Loaded: {propertyCountLabel}</p>
        <div className="page-actions">
          <button
            type="button"
            className="ghost-button"
            onClick={() => void loadProperties()}
            disabled={isLoading}
          >
            {isLoading ? 'Loading...' : 'Refresh'}
          </button>
          <Link className="ghost-button" to={routes.admin.organization}>
            Create new property
          </Link>
        </div>
      </section>

      {errorMessage ? <p className="inline-error">{errorMessage}</p> : null}

      <section className="cards-grid">
        {properties.map((property) => {
          const qrPayload = buildQrPayload(property)
          return (
            <article key={property.id} className="result-card">
              <h2>{property.name}</h2>
              <p>
                Type: <strong>{property.type}</strong>
              </p>
              <p>
                City: <strong>{property.city || 'Not set'}</strong>
              </p>
              <p>
                Join code: <code>{property.joinCode || 'Not available'}</code>
              </p>
              <p>
                Property ID: <code>{property.id}</code>
              </p>
              <p>
                QR payload: <code>{qrPayload}</code>
              </p>
              <div className="page-actions">
                <button
                  type="button"
                  className="ghost-button"
                  onClick={() => void handleCopy(property.joinCode)}
                >
                  {copiedCode === property.joinCode ? 'Copied' : 'Copy code'}
                </button>
                <button
                  type="button"
                  className="ghost-button"
                  onClick={() => void handleCopy(qrPayload)}
                >
                  {copiedCode === qrPayload ? 'Copied' : 'Copy QR payload'}
                </button>
              </div>
            </article>
          )
        })}
      </section>
    </main>
  )
}
