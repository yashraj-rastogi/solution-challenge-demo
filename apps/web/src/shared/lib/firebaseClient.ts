import { getAnalytics, isSupported, type Analytics } from 'firebase/analytics'
import {
  getApp,
  getApps,
  initializeApp,
  type FirebaseApp,
} from 'firebase/app'
import {
  browserLocalPersistence,
  getAuth,
  setPersistence,
  type Auth,
} from 'firebase/auth'
import { getFirestore, type Firestore } from 'firebase/firestore'
import {
  firebaseConfig,
  firebaseRuntimeOptions,
  isFirebaseConfigReady,
} from './firebaseConfig'

type FirebaseClients = {
  app: FirebaseApp
  auth: Auth
  firestore: Firestore
  persistenceReady: Promise<void>
}

let clients: FirebaseClients | null = null
let analyticsInstance: Analytics | null = null
let analyticsInitPromise: Promise<void> | null = null

function startAnalyticsInit(app: FirebaseApp) {
  if (!firebaseRuntimeOptions.enableAnalytics) {
    return
  }

  if (analyticsInstance || analyticsInitPromise) {
    return
  }

  if (typeof window === 'undefined') {
    return
  }

  analyticsInitPromise = isSupported()
    .then((supported) => {
      if (supported) {
        analyticsInstance = getAnalytics(app)
      }
    })
    .catch(() => {
      // Analytics is optional for MVP scaffolding; failures should not break auth.
    })
}

export function initializeFirebaseClients(): FirebaseClients {
  if (!isFirebaseConfigReady) {
    throw new Error('Firebase config is missing required VITE_FIREBASE_* keys.')
  }

  if (clients) {
    return clients
  }

  const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig)
  const auth = getAuth(app)
  const firestore = getFirestore(app)
  const persistenceReady = setPersistence(auth, browserLocalPersistence).catch(
    () => {
      // Continue even if persistence mode cannot be applied in this environment.
    },
  )

  clients = {
    app,
    auth,
    firestore,
    persistenceReady,
  }

  startAnalyticsInit(app)

  return clients
}

export function getFirebaseAnalytics() {
  return analyticsInstance
}

