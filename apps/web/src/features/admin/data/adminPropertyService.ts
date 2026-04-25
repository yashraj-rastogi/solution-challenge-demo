import {
  collection,
  doc,
  getDocs,
  limit,
  query,
  serverTimestamp,
  setDoc,
  where,
} from 'firebase/firestore'
import { initializeFirebaseClients } from '../../../shared/lib/firebaseClient'
import { generateJoinCode } from '../../../shared/lib/joinCode'

export type OrganizationOption = {
  id: string
  name: string
}

export async function getOrganizationsByCreatorUid(
  creatorUid: string,
  maxItems = 30,
): Promise<OrganizationOption[]> {
  const { firestore } = initializeFirebaseClients()
  const organizationsRef = collection(firestore, 'organizations')
  const organizationsQuery = query(
    organizationsRef,
    where('createdByUid', '==', creatorUid),
    limit(maxItems),
  )
  const queryResult = await getDocs(organizationsQuery)

  return queryResult.docs.map((organizationDocument) => {
    const data = organizationDocument.data()
    return {
      id: organizationDocument.id,
      name: String(data.name ?? 'Unnamed organization'),
    }
  })
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

type CreatePropertyInput = {
  organizationId: string
  propertyName: string
  propertyType: 'hotel' | 'hostel'
  city: string
  createdByUid?: string
}

export type CreatePropertyResult = {
  propertyId: string
  joinCode: string
}

export async function createPropertyForOrganization(
  input: CreatePropertyInput,
): Promise<CreatePropertyResult> {
  const { firestore } = initializeFirebaseClients()
  const joinCode = await getUniqueJoinCode()
  const propertyDoc = doc(collection(firestore, 'properties'))

  await setDoc(propertyDoc, {
    organizationId: input.organizationId,
    name: input.propertyName.trim(),
    type: input.propertyType,
    city: input.city.trim(),
    joinCode,
    isActive: true,
    createdByUid: input.createdByUid ?? null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })

  return {
    propertyId: propertyDoc.id,
    joinCode,
  }
}

