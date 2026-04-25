export function initializeIncidentModule() {
  return {
    lifecycleStates: ['draft', 'active', 'resolved'],
  } as const
}

