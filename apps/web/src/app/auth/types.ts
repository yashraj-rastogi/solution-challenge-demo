export const roles = [
  'org_admin',
  'manager',
  'staff',
  'guest',
  'responder',
] as const

export type Role = (typeof roles)[number]

export type Session = {
  role: Role
  displayName: string
  firebaseUid?: string
}
