import { Navigate, Outlet } from 'react-router'
import { useAuth } from '@/contexts/AuthContext'
import type { UserRole } from '@/types'

interface ProtectedRouteProps {
  roles?: UserRole[]
}

export function ProtectedRoute({ roles }: ProtectedRouteProps) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F6F7F2]">
        <div className="flex items-center gap-2 text-sm font-medium text-[#123524]">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#123524] border-t-transparent" />
          <span>Loading...</span>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
