const GUEST_CONTEXT_STORAGE_KEY = 'crisis_os_guest_context'

export type GuestJoinContext = {
  propertyId: string
  propertyName: string
  joinCode: string
  guestName: string
  roomLabel: string
  checkInId: string
}

export function saveGuestJoinContext(context: GuestJoinContext) {
  localStorage.setItem(GUEST_CONTEXT_STORAGE_KEY, JSON.stringify(context))
}

export function loadGuestJoinContext(): GuestJoinContext | null {
  const rawValue = localStorage.getItem(GUEST_CONTEXT_STORAGE_KEY)
  if (!rawValue) {
    return null
  }

  try {
    const parsed = JSON.parse(rawValue) as GuestJoinContext
    if (
      parsed.propertyId &&
      parsed.propertyName &&
      parsed.joinCode &&
      parsed.guestName &&
      parsed.roomLabel &&
      parsed.checkInId
    ) {
      return parsed
    }
  } catch {
    return null
  }

  return null
}

