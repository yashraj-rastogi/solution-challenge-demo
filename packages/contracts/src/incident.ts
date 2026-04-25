export const incidentTypes = [
  'fire',
  'gas_leak',
  'food_poisoning',
  'power_outage',
  'security_threat',
] as const

export type IncidentType = (typeof incidentTypes)[number]

export const incidentStatuses = ['draft', 'active', 'resolved'] as const

export type IncidentStatus = (typeof incidentStatuses)[number]

export const guestSafetyStates = ['safe', 'need_help', 'unable_to_move'] as const

export type GuestSafetyState = (typeof guestSafetyStates)[number]

