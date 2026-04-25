import type { Role } from '../auth/types'

export const routes = {
  login: '/login',
  admin: {
    organization: '/admin/setup/organization',
    property: '/admin/setup/property',
    layout: '/admin/setup/layout',
    guestAccess: '/admin/setup/guest-access',
    drill: '/admin/drill',
  },
  manager: {
    dashboard: '/manager/dashboard',
    newIncident: '/manager/incidents/new',
    reviewIncident: '/manager/incidents/:id/review',
    broadcastIncident: '/manager/incidents/:id/broadcast',
    liveIncident: '/manager/incidents/:id/live',
    handoffIncident: '/manager/incidents/:id/handoff',
    resolveIncident: '/manager/incidents/:id/resolve',
  },
  staff: {
    home: '/staff/home',
    report: '/staff/report',
    checklist: '/staff/incidents/:id/checklist',
    update: '/staff/incidents/:id/update',
  },
  guest: {
    join: '/guest/join',
    home: '/guest/home',
    alert: '/guest/incidents/:id/alert',
    checkIn: '/guest/incidents/:id/check-in',
  },
  responder: {
    viewIncident: '/responder/incidents/:id/view',
  },
} as const

export const roleHomeRoutes: Record<Role, string> = {
  org_admin: routes.admin.organization,
  manager: routes.manager.dashboard,
  staff: routes.staff.home,
  guest: routes.guest.join,
  responder: routes.responder.viewIncident.replace(':id', 'active'),
}

