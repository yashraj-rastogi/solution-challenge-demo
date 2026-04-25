import {
  collection,
  getDocs,
  limit,
  query,
  where,
} from 'firebase/firestore'
import { initializeFirebaseClients } from './firebaseClient'

export type PropertyRecord = {
  id: string
  organizationId: string
  name: string
  type: 'hotel' | 'hostel' | string
  city: string
  joinCode: string
  createdByUid?: string | null
}

export async function getPropertiesByCreatorUid(
  creatorUid: string,
  maxItems = 25,
): Promise<PropertyRecord[]> {
  const { firestore } = initializeFirebaseClients()
  const propertiesRef = collection(firestore, 'properties')
  const propertiesQuery = query(
    propertiesRef,
    where('createdByUid', '==', creatorUid),
    limit(maxItems),
  )
  const queryResult = await getDocs(propertiesQuery)

  return queryResult.docs.map((propertyDocument) => {
    const data = propertyDocument.data()
    return {
      id: propertyDocument.id,
      organizationId: String(data.organizationId ?? ''),
      name: String(data.name ?? 'Unknown property'),
      type: String(data.type ?? 'hotel'),
      city: String(data.city ?? ''),
      joinCode: String(data.joinCode ?? ''),
      createdByUid:
        typeof data.createdByUid === 'string' ? data.createdByUid : null,
    }
  })
}

export async function getRecentProperties(maxItems = 25): Promise<PropertyRecord[]> {
  const { firestore } = initializeFirebaseClients()
  const propertiesRef = collection(firestore, 'properties')
  const propertiesQuery = query(propertiesRef, limit(maxItems))
  const queryResult = await getDocs(propertiesQuery)

  return queryResult.docs.map((propertyDocument) => {
    const data = propertyDocument.data()
    return {
      id: propertyDocument.id,
      organizationId: String(data.organizationId ?? ''),
      name: String(data.name ?? 'Unknown property'),
      type: String(data.type ?? 'hotel'),
      city: String(data.city ?? ''),
      joinCode: String(data.joinCode ?? ''),
      createdByUid:
        typeof data.createdByUid === 'string' ? data.createdByUid : null,
    }
  })
}
