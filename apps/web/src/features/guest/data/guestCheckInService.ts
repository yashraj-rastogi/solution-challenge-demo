import {
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore'
import { initializeFirebaseClients } from '../../../shared/lib/firebaseClient'

export const guestSafetyStatusOptions = [
  'pending',
  'safe',
  'need_help',
  'unable_to_move',
] as const

export type GuestSafetyStatus = (typeof guestSafetyStatusOptions)[number]

export type GuestCheckInRecord = {
  id: string
  propertyId: string
  propertyName: string
  guestName: string
  roomLabel: string
  status: GuestSafetyStatus | string
}

export async function getGuestCheckInsByProperty(
  propertyId: string,
): Promise<GuestCheckInRecord[]> {
  const { firestore } = initializeFirebaseClients()
  const checkInsRef = collection(firestore, 'guest_checkins')
  const checkInQuery = query(checkInsRef, where('propertyId', '==', propertyId))
  const queryResult = await getDocs(checkInQuery)

  return queryResult.docs.map((checkInDocument) => {
    const data = checkInDocument.data()
    return {
      id: checkInDocument.id,
      propertyId: String(data.propertyId ?? ''),
      propertyName: String(data.propertyName ?? ''),
      guestName: String(data.guestName ?? 'Guest'),
      roomLabel: String(data.roomLabel ?? 'Unknown room'),
      status: String(data.status ?? 'pending'),
    }
  })
}

type SubmitGuestSafetyStatusInput = {
  checkInId: string
  status: Exclude<GuestSafetyStatus, 'pending'>
}

export async function submitGuestSafetyStatus(
  input: SubmitGuestSafetyStatusInput,
): Promise<void> {
  const { firestore } = initializeFirebaseClients()
  const checkInRef = doc(firestore, 'guest_checkins', input.checkInId)
  await updateDoc(checkInRef, {
    status: input.status,
    updatedAt: serverTimestamp(),
  })
}

