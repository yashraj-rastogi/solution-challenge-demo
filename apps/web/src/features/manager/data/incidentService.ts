import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { initializeFirebaseClients } from '../../../shared/lib/firebaseClient'

export const incidentTypeOptions = [
  'fire',
  'gas_leak',
  'food_poisoning',
  'power_outage',
  'security_threat',
] as const

export type IncidentType = (typeof incidentTypeOptions)[number]

type CreateIncidentDraftInput = {
  propertyId: string
  propertyName: string
  incidentType: IncidentType
  zoneLabel: string
  summaryText: string
  createdByUid?: string
}

export type CreateIncidentDraftResult = {
  incidentId: string
}

export async function createIncidentDraft(
  input: CreateIncidentDraftInput,
): Promise<CreateIncidentDraftResult> {
  const { firestore } = initializeFirebaseClients()
  const incidentsRef = collection(firestore, 'incidents')

  const incidentDoc = await addDoc(incidentsRef, {
    propertyId: input.propertyId,
    propertyName: input.propertyName,
    incidentType: input.incidentType,
    zoneLabel: input.zoneLabel.trim(),
    summaryText: input.summaryText.trim(),
    status: 'draft',
    createdByUid: input.createdByUid ?? null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })

  return {
    incidentId: incidentDoc.id,
  }
}

