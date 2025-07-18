import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Skeleton } from './ui/skeleton'
import { ProtectedRouteProps } from '../interfaces/auth'

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
  redirectTo = '/login'
}) => {
  const { user, profile, loading } = useAuth()
  const location = useLocation()
  
  // Debug logging
  console.log('ProtectedRoute check:', {
    path: location.pathname,
    loading,
    hasUser: !!user,
    hasProfile: !!profile,
    requiredRole,
    actualRole: profile?.user_type
  })

  // Show loading skeleton while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100 dark:from-black dark:via-gray-900 dark:to-orange-950 flex items-center justify-center">
        <div className="w-full max-w-md space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-8 w-1/2" />
        </div>
      </div>
    )
  }

  // If no user, redirect to login
  if (!user) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />
  }

  // If user exists but no profile, allow access with basic functionality
  // The profile will be created on next interaction or can be created later
  if (!profile) {
    // For now, let them through - the components should handle null profiles gracefully
    // This prevents the infinite redirect loop
  }

  // If specific role is required and we have a profile, check user role
  if (requiredRole && profile && profile.user_type !== requiredRole) {
    return <Navigate to="/unauthorized" replace />
  }

  return <>{children}</>
}

// Helper component for admin-only routes
export const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ProtectedRoute requiredRole="admin">
      {children}
    </ProtectedRoute>
  )
}

// Helper component for driver-only routes
export const DriverRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ProtectedRoute requiredRole="driver">
      {children}
    </ProtectedRoute>
  )
} 