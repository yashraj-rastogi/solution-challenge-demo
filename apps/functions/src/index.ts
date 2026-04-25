import { config } from './config.js'
import { initializeAiModule } from './modules/ai.js'
import { initializeBroadcastModule } from './modules/broadcast.js'
import { initializeHandoffModule } from './modules/handoff.js'
import { initializeIncidentModule } from './modules/incidents.js'

const modules = {
  incidents: initializeIncidentModule(),
  broadcast: initializeBroadcastModule(),
  ai: initializeAiModule(),
  handoff: initializeHandoffModule(),
}

export function bootstrapFunctionsApp() {
  return {
    config,
    modules,
  }
}

// Temporary bootstrap log. Replace with server/function bindings next.
console.log('[crisis-os-functions] scaffold ready', bootstrapFunctionsApp())

