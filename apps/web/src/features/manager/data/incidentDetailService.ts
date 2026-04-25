import {
  collection,
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore'
import { initializeFirebaseClients } from '../../../shared/lib/firebaseClient'

export type IncidentDetail = {
  id: string
  propertyId: string
  propertyName: string
  incidentType: string
  zoneLabel: string
  summaryText: string
  status: string
  aiGuestMessage?: string
  aiInternalSummary?: string
}

export async function getIncidentById(
  incidentId: string,
): Promise<IncidentDetail | null> {
  const { firestore } = initializeFirebaseClients()
  const incidentRef = doc(firestore, 'incidents', incidentId)
  const snapshot = await getDoc(incidentRef)

  if (!snapshot.exists()) {
    return null
  }

  const data = snapshot.data()
  return {
    id: snapshot.id,
    propertyId: String(data.propertyId ?? ''),
    propertyName: String(data.propertyName ?? 'Unknown property'),
    incidentType: String(data.incidentType ?? 'unknown'),
    zoneLabel: String(data.zoneLabel ?? ''),
    summaryText: String(data.summaryText ?? ''),
    status: String(data.status ?? 'draft'),
    aiGuestMessage: String(data.aiGuestMessage ?? ''),
    aiInternalSummary: String(data.aiInternalSummary ?? ''),
  }
}

type SaveIncidentReviewInput = {
  incidentId: string
  aiInternalSummary: string
  aiGuestMessage: string
  updatedByUid?: string
}

export async function saveIncidentReviewDraft(
  input: SaveIncidentReviewInput,
): Promise<void> {
  const { firestore } = initializeFirebaseClients()
  const incidentRef = doc(firestore, 'incidents', input.incidentId)
  await updateDoc(incidentRef, {
    aiInternalSummary: input.aiInternalSummary.trim(),
    aiGuestMessage: input.aiGuestMessage.trim(),
    updatedByUid: input.updatedByUid ?? null,
    updatedAt: serverTimestamp(),
  })
}

type ActivateIncidentInput = {
  incidentId: string
  propertyId: string
  message: string
  targetScope: 'all' | 'floor' | 'zone' | 'staff-only'
  updatedByUid?: string
}

export async function activateIncidentWithBroadcast(
  input: ActivateIncidentInput,
) {
  const { firestore } = initializeFirebaseClients()
  const incidentRef = doc(firestore, 'incidents', input.incidentId)
  const broadcastRef = doc(collection(firestore, 'incident_broadcasts'))

  await updateDoc(incidentRef, {
    status: 'active',
    lastBroadcastScope: input.targetScope,
    lastBroadcastMessage: input.message.trim(),
    lastBroadcastAt: serverTimestamp(),
    updatedByUid: input.updatedByUid ?? null,
    updatedAt: serverTimestamp(),
  })

  await setDoc(broadcastRef, {
    incidentId: input.incidentId,
    propertyId: input.propertyId,
    message: input.message.trim(),
    targetScope: input.targetScope,
    createdByUid: input.updatedByUid ?? null,
    createdAt: serverTimestamp(),
  })
}

