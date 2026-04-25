import { collection, getDocs, limit, query, where } from 'firebase/firestore'
import { initializeFirebaseClients } from '../../../shared/lib/firebaseClient'

export type IncidentSummary = {
  id: string
  propertyId: string
  propertyName: string
  incidentType: string
  zoneLabel: string
  summaryText: string
  status: 'draft' | 'active' | 'resolved' | string
  createdByUid?: string | null
}

export async function getIncidentsByCreatorUid(
  creatorUid: string,
  maxItems = 20,
): Promise<IncidentSummary[]> {
  const { firestore } = initializeFirebaseClients()
  const incidentsRef = collection(firestore, 'incidents')
  const incidentsQuery = query(
    incidentsRef,
    where('createdByUid', '==', creatorUid),
    limit(maxItems),
  )
  const queryResult = await getDocs(incidentsQuery)

  return queryResult.docs.map((incidentDocument) => {
    const data = incidentDocument.data()
    return {
      id: incidentDocument.id,
      propertyId: String(data.propertyId ?? ''),
      propertyName: String(data.propertyName ?? 'Unknown property'),
      incidentType: String(data.incidentType ?? 'unknown'),
      zoneLabel: String(data.zoneLabel ?? ''),
      summaryText: String(data.summaryText ?? ''),
      status: String(data.status ?? 'draft'),
      createdByUid:
        typeof data.createdByUid === 'string' ? data.createdByUid : null,
    }
  })
}

export async function getRecentIncidents(maxItems = 20): Promise<IncidentSummary[]> {
  const { firestore } = initializeFirebaseClients()
  const incidentsRef = collection(firestore, 'incidents')
  const incidentsQuery = query(incidentsRef, limit(maxItems))
  const queryResult = await getDocs(incidentsQuery)

  return queryResult.docs.map((incidentDocument) => {
    const data = incidentDocument.data()
    return {
      id: incidentDocument.id,
      propertyId: String(data.propertyId ?? ''),
      propertyName: String(data.propertyName ?? 'Unknown property'),
      incidentType: String(data.incidentType ?? 'unknown'),
      zoneLabel: String(data.zoneLabel ?? ''),
      summaryText: String(data.summaryText ?? ''),
      status: String(data.status ?? 'draft'),
      createdByUid:
        typeof data.createdByUid === 'string' ? data.createdByUid : null,
    }
  })
}

