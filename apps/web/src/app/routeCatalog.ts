type RouteSection = {
  role: string
  routes: string[]
}

export const routeCatalog: RouteSection[] = [
  {
    role: 'Common',
    routes: ['/login'],
  },
  {
    role: 'Org Admin',
    routes: [
      '/admin/setup/organization',
      '/admin/setup/property',
      '/admin/setup/layout',
      '/admin/setup/guest-access',
      '/admin/drill',
    ],
  },
  {
    role: 'Manager',
    routes: [
      '/manager/dashboard',
      '/manager/incidents/new',
      '/manager/incidents/:id/review',
      '/manager/incidents/:id/broadcast',
      '/manager/incidents/:id/live',
      '/manager/incidents/:id/handoff',
      '/manager/incidents/:id/resolve',
    ],
  },
  {
    role: 'Staff',
    routes: [
      '/staff/home',
      '/staff/report',
      '/staff/incidents/:id/checklist',
      '/staff/incidents/:id/update',
    ],
  },
  {
    role: 'Guest',
    routes: [
      '/guest/join',
      '/guest/home',
      '/guest/incidents/:id/alert',
      '/guest/incidents/:id/check-in',
    ],
  },
  {
    role: 'Responder',
    routes: ['/responder/incidents/:id/view'],
  },
]

