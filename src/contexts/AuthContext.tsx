import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User, AuthError, Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabaseClient'
import { logger } from '../lib/utils'
import { UserProfile, AuthContextType, AuthProviderProps } from '../interfaces/auth'

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  // Fetch user profile from user_profiles table
  const fetchProfile = async (userId: string): Promise<UserProfile | null> => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        logger.error('Error fetching user profile:', error)
        return null
      }

      return data
    } catch (error) {
      logger.error('Error in fetchProfile:', error)
      return null
    }
  }

  // Refresh profile data
  const refreshProfile = async () => {
    if (user) {
      const profileData = await fetchProfile(user.id)
      setProfile(profileData)
    }
  }

  // Sign up new user
  const signUp = async (
    email: string, 
    password: string, 
    phone: string, 
    userType: 'driver' | 'admin' = 'driver'
  ) => {
    try {
      // Sign up with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            phone,
            user_type: userType
          }
        }
      })

      if (authError) {
        logger.error('Sign up error:', authError)
        return { user: null, error: authError }
      }

      if (authData.user) {
        // Create user profile
        const { error: profileError } = await supabase
          .from('user_profiles')
          .insert([{
            id: authData.user.id,
            user_type: userType,
            phone,
            total_incidents: 0
          }])

        if (profileError) {
          logger.error('Error creating user profile:', profileError)
          // Don't return error here as user is created, profile can be created later
        }

        logger.info('User signed up successfully')
      }

      return { user: authData.user, error: null }
    } catch (error) {
      logger.error('Unexpected error during sign up:', error)
      return { user: null, error: error as AuthError }
    }
  }

  // Sign in existing user
  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        logger.error('Sign in error:', error)
        return { user: null, error }
      }

      logger.info('User signed in successfully')
      return { user: data.user, error: null }
    } catch (error) {
      logger.error('Unexpected error during sign in:', error)
      return { user: null, error: error as AuthError }
    }
  }

  // Sign out user
  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        logger.error('Sign out error:', error)
      } else {
        logger.info('User signed out successfully')
        setUser(null)
        setProfile(null)
      }
    } catch (error) {
      logger.error('Unexpected error during sign out:', error)
    }
  }

  // Reset password
  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      })

      if (error) {
        logger.error('Password reset error:', error)
        return { error }
      }

      logger.info('Password reset email sent')
      return { error: null }
    } catch (error) {
      logger.error('Unexpected error during password reset:', error)
      return { error: error as AuthError }
    }
  }

  // Update password
  const updatePassword = async (password: string) => {
    try {
      const { error } = await supabase.auth.updateUser({ password })

      if (error) {
        logger.error('Password update error:', error)
        return { error }
      }

      logger.info('Password updated successfully')
      return { error: null }
    } catch (error) {
      logger.error('Unexpected error during password update:', error)
      return { error: error as AuthError }
    }
  }

  // Initialize auth state
  useEffect(() => {
    let mounted = true

    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        
        if (mounted) {
          if (session?.user) {
            setUser(session.user)
            const profileData = await fetchProfile(session.user.id)
            setProfile(profileData)
          }
          setLoading(false)
        }
      } catch (error) {
        logger.error('Error getting initial session:', error)
        if (mounted) {
          setLoading(false)
        }
      }
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return

        logger.info('Auth state changed:', event)

        if (session?.user) {
          setUser(session.user)
          const profileData = await fetchProfile(session.user.id)
          setProfile(profileData)
        } else {
          setUser(null)
          setProfile(null)
        }
        
        setLoading(false)
      }
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const value: AuthContextType = {
    user,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updatePassword,
    refreshProfile
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
} 