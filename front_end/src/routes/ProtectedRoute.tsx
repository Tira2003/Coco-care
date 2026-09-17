import { Outlet } from 'react-router'
import type { UserRole } from '@/types'

interface ProtectedRouteProps {
  roles?: UserRole[]
}

export function ProtectedRoute({ roles }: ProtectedRouteProps) {
  // Bypassed for now so you can navigate directly without logging in
  return <Outlet />
}
