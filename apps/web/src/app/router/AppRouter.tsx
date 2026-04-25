import { Navigate, Route, Routes } from 'react-router-dom'
import { GuestAccessPage } from '../../features/admin/GuestAccessPage'
import { OrganizationSetupPage } from '../../features/admin/OrganizationSetupPage'
import { PropertySetupPage } from '../../features/admin/PropertySetupPage'
import { LoginPage } from '../../features/auth/LoginPage'
import { GuestCheckInPage } from '../../features/guest/GuestCheckInPage'
import { GuestHomePage } from '../../features/guest/GuestHomePage'
import { GuestJoinPage } from '../../features/guest/GuestJoinPage'
import { BroadcastCenterPage } from '../../features/manager/BroadcastCenterPage'
import { CreateIncidentPage } from '../../features/manager/CreateIncidentPage'
import { IncidentReviewPage } from '../../features/manager/IncidentReviewPage'
import { LiveResponseBoardPage } from '../../features/manager/LiveResponseBoardPage'
import { ManagerDashboardPage } from '../../features/manager/ManagerDashboardPage'
import { ScaffoldPage } from '../../shared/components/ScaffoldPage'
import { ProtectedRoute } from './ProtectedRoute'
import { routes } from './routes'

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to={routes.login} replace />} />
      <Route path={routes.login} element={<LoginPage />} />

      <Route element={<ProtectedRoute allowedRoles={['org_admin']} />}>
        <Route
          path={routes.admin.organization}
          element={<OrganizationSetupPage />}
        />
        <Route
          path={routes.admin.property}
          element={<PropertySetupPage />}
        />
        <Route
          path={routes.admin.layout}
          element={
            <ScaffoldPage
              title="Layout Setup"
              description="Configure floors, rooms, zones, and map assets."
            />
          }
        />
        <Route
          path={routes.admin.guestAccess}
          element={<GuestAccessPage />}
        />
        <Route
          path={routes.admin.drill}
          element={
            <ScaffoldPage
              title="Drill Console"
              description="Run dry drills before enabling live incident mode."
            />
          }
        />
      </Route>

      <Route element={<ProtectedRoute allowedRoles={['manager']} />}>
        <Route
          path={routes.manager.dashboard}
          element={<ManagerDashboardPage />}
        />
        <Route
          path={routes.manager.newIncident}
          element={<CreateIncidentPage />}
        />
        <Route
          path={routes.manager.reviewIncident}
          element={<IncidentReviewPage />}
        />
        <Route
          path={routes.manager.broadcastIncident}
          element={<BroadcastCenterPage />}
        />
        <Route
          path={routes.manager.liveIncident}
          element={<LiveResponseBoardPage />}
        />
        <Route
          path={routes.manager.handoffIncident}
          element={
            <ScaffoldPage
              title="Responder Handoff"
              description="Prepare and share secure read-only incident handoff."
            />
          }
        />
        <Route
          path={routes.manager.resolveIncident}
          element={
            <ScaffoldPage
              title="Resolve Incident"
              description="Mark all-clear and finalize closure checks."
            />
          }
        />
      </Route>

      <Route element={<ProtectedRoute allowedRoles={['staff']} />}>
        <Route
          path={routes.staff.home}
          element={
            <ScaffoldPage
              title="Staff Home"
              description="View assigned incidents and active response tasks."
            />
          }
        />
        <Route
          path={routes.staff.report}
          element={
            <ScaffoldPage
              title="Quick Report"
              description="Submit real-time field report from mobile workflow."
            />
          }
        />
        <Route
          path={routes.staff.checklist}
          element={
            <ScaffoldPage
              title="Staff Checklist"
              description="Track room and zone checks with completion status."
            />
          }
        />
        <Route
          path={routes.staff.update}
          element={
            <ScaffoldPage
              title="Staff Update"
              description="Post floor updates and assisted-guest outcomes."
            />
          }
        />
      </Route>

      <Route element={<ProtectedRoute allowedRoles={['guest']} />}>
        <Route
          path={routes.guest.join}
          element={<GuestJoinPage />}
        />
        <Route
          path={routes.guest.home}
          element={<GuestHomePage />}
        />
        <Route
          path={routes.guest.alert}
          element={
            <ScaffoldPage
              title="Guest Alert Details"
              description="Read bilingual emergency instructions for active incident."
            />
          }
        />
        <Route
          path={routes.guest.checkIn}
          element={<GuestCheckInPage />}
        />
      </Route>

      <Route element={<ProtectedRoute allowedRoles={['responder']} />}>
        <Route
          path={routes.responder.viewIncident}
          element={
            <ScaffoldPage
              title="Responder View"
              description="Read-only incident handoff and critical case snapshot."
            />
          }
        />
      </Route>

      <Route path="*" element={<Navigate to={routes.login} replace />} />
    </Routes>
  )
}
