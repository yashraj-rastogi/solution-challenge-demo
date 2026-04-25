import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSession } from '../../app/auth/SessionProvider'
import { routes } from '../../app/router/routes'
import { normalizeJoinCode } from '../../shared/lib/joinCode'
import {
  createGuestCheckIn,
  lookupPropertyByJoinCode,
  type PropertyLookupResult,
} from './data/guestJoinService'
import { saveGuestJoinContext } from './data/guestJoinContext'

type JoinFormState = {
  joinCode: string
  guestName: string
  roomLabel: string
}

const initialJoinFormState: JoinFormState = {
  joinCode: '',
  guestName: '',
  roomLabel: '',
}

export function GuestJoinPage() {
  const navigate = useNavigate()
  const { session } = useSession()
  const [form, setForm] = useState<JoinFormState>(initialJoinFormState)
  const [matchedProperty, setMatchedProperty] = useState<PropertyLookupResult | null>(
    null,
  )
  const [isValidatingCode, setIsValidatingCode] = useState(false)
  const [isJoining, setIsJoining] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  function updateField<K extends keyof JoinFormState>(
    key: K,
    value: JoinFormState[K],
  ) {
    setForm((previous) => ({ ...previous, [key]: value }))
  }

  async function handleValidateJoinCode() {
    setErrorMessage(null)
    setMatchedProperty(null)
    setIsValidatingCode(true)

    try {
      const property = await lookupPropertyByJoinCode(form.joinCode)
      if (!property) {
        setErrorMessage('No active property found for this join code.')
      } else {
        setMatchedProperty(property)
      }
    } catch {
      setErrorMessage('Could not validate join code. Please try again.')
    }

    setIsValidatingCode(false)
  }

  async function handleJoin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrorMessage(null)

    if (!matchedProperty) {
      setErrorMessage('Validate a join code before joining.')
      return
    }

    if (!form.guestName || !form.roomLabel) {
      setErrorMessage('Guest name and room label are required.')
      return
    }

    setIsJoining(true)
    try {
      const joinResult = await createGuestCheckIn({
        propertyId: matchedProperty.propertyId,
        propertyName: matchedProperty.propertyName,
        joinCode: matchedProperty.joinCode,
        guestName: form.guestName,
        roomLabel: form.roomLabel,
        firebaseUid: session?.firebaseUid,
      })

      saveGuestJoinContext({
        propertyId: matchedProperty.propertyId,
        propertyName: matchedProperty.propertyName,
        joinCode: matchedProperty.joinCode,
        guestName: form.guestName.trim(),
        roomLabel: form.roomLabel.trim(),
        checkInId: joinResult.checkInId,
      })

      navigate(routes.guest.home)
    } catch {
      setErrorMessage(
        'Join failed while creating guest check-in. Check Firestore rules and try again.',
      )
    }
    setIsJoining(false)
  }

  const normalizedCode = normalizeJoinCode(form.joinCode)

  return (
    <main className="page-shell">
      <header className="page-header">
        <p className="page-kicker">Crisis OS</p>
        <h1>Guest join</h1>
        <p className="page-description">
          Enter property join code or room QR code equivalent to enroll in this
          location&apos;s safety channel.
        </p>
      </header>

      <section className="form-panel">
        <form className="form-grid" onSubmit={handleJoin}>
          <label>
            Property join code
            <input
              value={form.joinCode}
              onChange={(event) => updateField('joinCode', event.target.value)}
              placeholder="AB12CD"
              required
            />
          </label>

          <div className="inline-group">
            <p>
              Normalized code: <code>{normalizedCode || 'Not entered yet'}</code>
            </p>
            <button
              type="button"
              className="ghost-button"
              onClick={() => void handleValidateJoinCode()}
              disabled={isValidatingCode}
            >
              {isValidatingCode ? 'Checking...' : 'Validate code'}
            </button>
          </div>

          <label>
            Guest name
            <input
              value={form.guestName}
              onChange={(event) => updateField('guestName', event.target.value)}
              placeholder="Riya Sharma"
              required
            />
          </label>

          <label>
            Room / Bed label
            <input
              value={form.roomLabel}
              onChange={(event) => updateField('roomLabel', event.target.value)}
              placeholder="Room 204"
              required
            />
          </label>

          <button type="submit" className="primary-button" disabled={isJoining}>
            {isJoining ? 'Joining safety channel...' : 'Join property'}
          </button>
        </form>

        {matchedProperty ? (
          <div className="result-card">
            <h2>Property verified</h2>
            <p>
              Name: <strong>{matchedProperty.propertyName}</strong>
            </p>
            <p>
              Property ID: <code>{matchedProperty.propertyId}</code>
            </p>
            <p>
              Join code: <code>{matchedProperty.joinCode}</code>
            </p>
          </div>
        ) : null}

        {errorMessage ? <p className="inline-error">{errorMessage}</p> : null}
      </section>
    </main>
  )
}

