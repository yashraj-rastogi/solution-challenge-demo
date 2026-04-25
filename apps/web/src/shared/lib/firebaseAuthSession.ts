import { signInAnonymously, signOut, type User } from 'firebase/auth'
import { initializeFirebaseClients } from './firebaseClient'

export async function ensureFirebaseAuthSession(): Promise<User> {
  const { auth, persistenceReady } = initializeFirebaseClients()
  await persistenceReady

  if (auth.currentUser) {
    return auth.currentUser
  }

  const credentials = await signInAnonymously(auth)
  return credentials.user
}

export async function signOutFirebaseAuthSession(): Promise<void> {
  const { auth } = initializeFirebaseClients()
  if (!auth.currentUser) {
    return
  }
  await signOut(auth)
}

