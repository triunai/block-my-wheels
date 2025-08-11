import { ReactNode } from 'react'
import { User, AuthError, Session } from '@supabase/supabase-js'

export interface UserProfile {
  id: string
  user_type: 'driver' | 'admin'
  phone: string
  wa_id?: string
  total_incidents: number
  avg_response_time_minutes?: number
  whatsapp_onboarded: boolean
  created_at: string
  updated_at: string
}

export interface AuthContextType {
  user: User | null
  profile: UserProfile | null
  loading: boolean
  signUp: (email: string, password: string, phone: string, userType?: 'driver') => Promise<{ user: User | null; error: AuthError | null }>
  signIn: (email: string, password: string) => Promise<{ user: User | null; error: AuthError | null }>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>
  updatePassword: (password: string) => Promise<{ error: AuthError | null }>
  refreshProfile: () => Promise<void>
  getSession: () => Promise<Session | null>
  refreshSession: () => Promise<{ session: Session | null; error: AuthError | null }>
  testDatabaseConnection: () => Promise<boolean>
  createProfileViaRPC: (userId: string) => Promise<UserProfile | null>
  triggerOnboardingWebhook: (userId: string, phone: string) => Promise<boolean> // 🆕 NEW
  markUserOnboarded: (userId: string) => Promise<boolean> // 🆕 NEW
}

export interface AuthProviderProps {
  children: ReactNode
}

export interface ProtectedRouteProps {
  children: ReactNode
  requiredRole?: 'driver' | 'admin'
  redirectTo?: string
} 