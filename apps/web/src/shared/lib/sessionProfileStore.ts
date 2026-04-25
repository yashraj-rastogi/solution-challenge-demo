import { doc, serverTimestamp, setDoc } from 'firebase/firestore'
import type { Role } from '../../app/auth/types'
import { initializeFirebaseClients } from './firebaseClient'

type SessionProfileInput = {
  uid: string
  role: Role
  displayName: string
}

export async function upsertSessionProfile({
  uid,
  role,
  displayName,
}: SessionProfileInput): Promise<void> {
  const { firestore } = initializeFirebaseClients()

  await setDoc(
    doc(firestore, 'session_profiles', uid),
    {
      role,
      displayName,
      source: 'crisis-os-web',
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  )
}

