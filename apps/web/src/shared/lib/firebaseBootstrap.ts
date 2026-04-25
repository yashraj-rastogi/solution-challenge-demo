import {
  firebaseConfig,
  firebaseRuntimeOptions,
  isFirebaseConfigReady,
  missingFirebaseEnvKeys,
} from './firebaseConfig'
import { initializeFirebaseClients } from './firebaseClient'

export type FirebaseBootstrapStatus = {
  ready: boolean
  message: string
  config: typeof firebaseConfig
  missingKeys: string[]
  analyticsEnabled: boolean
  sdkInitialized: boolean
}

export function getFirebaseBootstrapStatus(): FirebaseBootstrapStatus {
  if (!isFirebaseConfigReady) {
    return {
      ready: false,
      message:
        'Firebase env config is incomplete. Fill required VITE_FIREBASE_* keys.',
      config: firebaseConfig,
      missingKeys: [...missingFirebaseEnvKeys],
      analyticsEnabled: firebaseRuntimeOptions.enableAnalytics,
      sdkInitialized: false,
    }
  }
  try {
    initializeFirebaseClients()
  } catch {
    return {
      ready: false,
      message: 'Firebase SDK initialization failed. Check config and runtime.',
      config: firebaseConfig,
      missingKeys: [],
      analyticsEnabled: firebaseRuntimeOptions.enableAnalytics,
      sdkInitialized: false,
    }
  }

  return {
    ready: true,
    message:
      'Firebase config and SDK are initialized. Auth and Firestore are ready for integration.',
    config: firebaseConfig,
    missingKeys: [],
    analyticsEnabled: firebaseRuntimeOptions.enableAnalytics,
    sdkInitialized: true,
  }
}
