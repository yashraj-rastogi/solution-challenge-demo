export function initializeBroadcastModule() {
  return {
    supportedScopes: ['all', 'floor', 'zone', 'staff-only'],
  } as const
}

