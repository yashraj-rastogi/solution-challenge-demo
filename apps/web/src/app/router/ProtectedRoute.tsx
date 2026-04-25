import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useSession } from '../auth/SessionProvider'
import type { Role } from '../auth/types'
import { roleHomeRoutes, routes } from './routes'

type ProtectedRouteProps = {
  allowedRoles: Role[]
}

export function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { session } = useSession()
  const location = useLocation()

  if (!session) {
    return <Navigate to={routes.login} state={{ from: location }} replace />
  }

  if (!allowedRoles.includes(session.role)) {
    return <Navigate to={roleHomeRoutes[session.role]} replace />
  }

  return <Outlet />
}

