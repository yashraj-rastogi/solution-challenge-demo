import {
  collection,
  doc,
  getDocs,
  limit,
  query,
  serverTimestamp,
  where,
  writeBatch,
} from 'firebase/firestore'
import { initializeFirebaseClients } from '../../../shared/lib/firebaseClient'
import { generateJoinCode } from '../../../shared/lib/joinCode'

type PropertyType = 'hotel' | 'hostel'

export type CreateOrganizationSetupInput = {
  organizationName: string
  contactEmail: string
  emergencyPhone: string
  propertyName: string
  propertyType: PropertyType
  city: string
  createdByUid?: string
}

export type CreateOrganizationSetupResult = {
  organizationId: string
  propertyId: string
  joinCode: string
}

async function getUniqueJoinCode() {
  const { firestore } = initializeFirebaseClients()
  const propertiesRef = collection(firestore, 'properties')

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const candidate = generateJoinCode(6)
    const codeQuery = query(
      propertiesRef,
      where('joinCode', '==', candidate),
      limit(1),
    )
    const queryResult = await getDocs(codeQuery)
    if (queryResult.empty) {
      return candidate
    }
  }

  return generateJoinCode(8)
}

export async function createOrganizationSetup(
  input: CreateOrganizationSetupInput,
): Promise<CreateOrganizationSetupResult> {
  const { firestore } = initializeFirebaseClients()
  const joinCode = await getUniqueJoinCode()

  const organizationsRef = collection(firestore, 'organizations')
  const propertiesRef = collection(firestore, 'properties')

  const organizationDoc = doc(organizationsRef)
  const propertyDoc = doc(propertiesRef)

  const batch = writeBatch(firestore)

  batch.set(organizationDoc, {
    name: input.organizationName.trim(),
    contactEmail: input.contactEmail.trim().toLowerCase(),
    emergencyPhone: input.emergencyPhone.trim(),
    createdByUid: input.createdByUid ?? null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })

  batch.set(propertyDoc, {
    organizationId: organizationDoc.id,
    name: input.propertyName.trim(),
    type: input.propertyType,
    city: input.city.trim(),
    joinCode,
    isActive: true,
    createdByUid: input.createdByUid ?? null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })

  await batch.commit()

  return {
    organizationId: organizationDoc.id,
    propertyId: propertyDoc.id,
    joinCode,
  }
}

