import {
  addDoc,
  collection,
  getDocs,
  limit,
  query,
  serverTimestamp,
  where,
} from 'firebase/firestore'
import { initializeFirebaseClients } from '../../../shared/lib/firebaseClient'
import { normalizeJoinCode } from '../../../shared/lib/joinCode'

export type PropertyLookupResult = {
  propertyId: string
  propertyName: string
  organizationId: string
  joinCode: string
}

type GuestJoinInput = {
  propertyId: string
  propertyName: string
  joinCode: string
  guestName: string
  roomLabel: string
  firebaseUid?: string
}

export type GuestJoinResult = {
  checkInId: string
}

export async function lookupPropertyByJoinCode(rawCode: string) {
  const joinCode = normalizeJoinCode(rawCode)
  if (!joinCode) {
    return null
  }

  const { firestore } = initializeFirebaseClients()
  const propertiesRef = collection(firestore, 'properties')
  const propertyQuery = query(
    propertiesRef,
    where('joinCode', '==', joinCode),
    limit(1),
  )
  const queryResult = await getDocs(propertyQuery)

  if (queryResult.empty) {
    return null
  }

  const propertyDocument = queryResult.docs[0]
  const propertyData = propertyDocument.data()

  return {
    propertyId: propertyDocument.id,
    propertyName: String(propertyData.name ?? 'Unknown property'),
    organizationId: String(propertyData.organizationId ?? ''),
    joinCode,
  } as PropertyLookupResult
}

export async function createGuestCheckIn(
  input: GuestJoinInput,
): Promise<GuestJoinResult> {
  const { firestore } = initializeFirebaseClients()

  const checkInsRef = collection(firestore, 'guest_checkins')
  const checkInDocument = await addDoc(checkInsRef, {
    propertyId: input.propertyId,
    propertyName: input.propertyName,
    joinCode: input.joinCode,
    guestName: input.guestName.trim(),
    roomLabel: input.roomLabel.trim(),
    firebaseUid: input.firebaseUid ?? null,
    status: 'pending',
    joinedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })

  return {
    checkInId: checkInDocument.id,
  }
}

