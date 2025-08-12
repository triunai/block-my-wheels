import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User, AuthError, Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabaseClient'
import { logger } from '../lib/utils'
import { UserProfile, AuthContextType, AuthProviderProps } from '../interfaces/auth'
import { sanitizeAndValidate, phoneUtils } from '../lib/validation'

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
  const [profileLoading, setProfileLoading] = useState(false)

  // Test database connectivity
  const testDatabaseConnection = async () => {
    logger.info('[DB_TEST] Testing database connectivity...')
    try {
      const { error, count } = await supabase
        .from('user_profiles')
        .select('id', { count: 'exact', head: true })
      
      if (error) {
        logger.error('[DB_TEST] Database test failed:', error)
        return false
      }
      
      logger.info(`[DB_TEST] Database test successful. Table has ${count} rows`)
      return true
    } catch (err) {
      logger.error('[DB_TEST] Database test exception:', err)
      return false
    }
  }

  // Fetch user profile from user_profiles table
  const fetchProfile = async (userId: string): Promise<UserProfile | null> => {
    logger.info(`[FETCH_PROFILE_START] User: ${userId}`)
    
    // Prevent multiple simultaneous fetches
    if (profileLoading) {
      logger.info('[FETCH_PROFILE] Profile fetch already in progress, skipping...')
      return null
    }
    
    setProfileLoading(true)
    
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
    const isTemplateMode = !supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('your-project')

    if (isTemplateMode) {
      logger.warn('[FETCH_PROFILE] Template mode detected. Returning mock profile.')
      setProfileLoading(false)
      return {
        id: userId,
        user_type: 'driver',
        phone: '+1234567890',
        total_incidents: 0,
        whatsapp_onboarded: false,  // 🆕 Template mode user not onboarded
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    }
    
    try {
      logger.info('[FETCH_PROFILE] Querying Supabase for profile...')
      
      // Increase timeout to 15 seconds and add retry logic
      const executeQuery = async (attempt: number = 1): Promise<{data: any, error: any}> => {
        const profileQuery = supabase
          .from('user_profiles')
          .select('*')
          .eq('id', userId)
          .single()
          
        const timeoutPromise = new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error(`Profile query timeout after 15 seconds (attempt ${attempt})`)), 15000)
        )
        
        try {
          return await Promise.race([profileQuery, timeoutPromise])
        } catch (error) {
          if (error instanceof Error && error.message.includes('timeout') && attempt < 2) {
            logger.warn(`[FETCH_PROFILE] Attempt ${attempt} timed out, retrying...`)
            await new Promise(resolve => setTimeout(resolve, 1000)) // Wait 1 second
            return executeQuery(attempt + 1)
          }
          throw error
        }
      }
      
      const { data, error } = await executeQuery()
        
      logger.info(`[FETCH_PROFILE] Supabase query returned. HasError: ${!!error}, HasData: ${!!data}`)

      if (error) {
        if (error.code === 'PGRST116') {
          logger.warn('[FETCH_PROFILE] Profile not found (PGRST116), attempting creation.')
          // Check if user is still signed in before creating profile
          const currentSession = await supabase.auth.getSession()
          if (!currentSession.data.session) {
            logger.info('[FETCH_PROFILE] User signed out during profile fetch. Aborting.')
            return null
          }
          return await createDefaultProfile(userId)
        }
        logger.error('[FETCH_PROFILE] Unhandled error fetching profile:', { code: error.code, message: error.message })
        return null
      }

      logger.info('[FETCH_PROFILE_END] Success. Profile fetched.', data)
      return data
    } catch (error) {
      if (error instanceof Error && error.message.includes('timeout')) {
        logger.warn('[FETCH_PROFILE] All query attempts timed out. App will continue without profile.')
        return null
      }
      logger.error('[FETCH_PROFILE_END] Failed with critical error.', error)
      return null
    } finally {
      setProfileLoading(false)
    }
  }

  // Create default profile for users who don't have one
  const createDefaultProfile = async (userId: string): Promise<UserProfile | null> => {
    logger.info(`[CREATE_PROFILE_START] User: ${userId}`)
    
    // Check if user is still signed in before creating profile
    const currentSession = await supabase.auth.getSession()
    if (!currentSession.data.session) {
      logger.info('[CREATE_PROFILE] User signed out before profile creation. Aborting.')
      return null
    }
    
    try {
      const profileData = {
        id: userId,
        user_type: 'driver' as const,
        phone: null,
        total_incidents: 0,
      }
      
      logger.info('[CREATE_PROFILE] Inserting into Supabase...', profileData)
      
      const { data, error } = await supabase
        .from('user_profiles')
        .insert(profileData)
        .select()
        .single()
      
      logger.info(`[CREATE_PROFILE] Supabase insert returned. HasError: ${!!error}, HasData: ${!!data}`)

      if (error) {
        logger.error('[CREATE_PROFILE] Error during insert:', { 
          code: error.code, 
          message: error.message, 
          details: error.details,
          hint: error.hint 
        })
        logger.info('[CREATE_PROFILE_END] Failed.')
        return null
      }

      logger.info('[CREATE_PROFILE_END] Success. Profile created.', data)
      return data
    } catch (error) {
      logger.error('[CREATE_PROFILE_END] Failed with critical exception.', error)
      return null
    }
  }

  // Manual profile creation using RPC (bypasses RLS)
  const createProfileViaRPC = async (userId: string): Promise<UserProfile | null> => {
    logger.info(`[RPC_CREATE_START] User: ${userId}`)
    try {
      logger.info('[RPC_CREATE] Calling Supabase RPC function...')
      const { data, error } = await supabase.rpc('create_profile_for_user', { user_id: userId })
      logger.info(`[RPC_CREATE] Supabase RPC returned. HasError: ${!!error}`)

      if (error) {
        logger.error('[RPC_CREATE] RPC call failed:', error)
        logger.info('[RPC_CREATE_END] Failed.')
        return null
      }

      logger.info('[RPC_CREATE_END] Success. Profile created/retrieved via RPC.')
      // The RPC function is expected to return the profile
      return data
    } catch (error) {
      logger.error('[RPC_CREATE_END] Failed with critical exception.', error)
      return null
    }
  }

  // 🆕 NEW: Trigger onboarding webhook
  const triggerOnboardingWebhook = async (userId: string, phone: string): Promise<boolean> => {
    logger.info(`[ONBOARDING_WEBHOOK_START] User: ${userId}, Phone: ${phone}`)
    
    try {
      // Validate and sanitize phone number first
      const phoneResult = sanitizeAndValidate.malaysianPhone(phone)
      
      if (!phoneResult.isValid) {
        logger.error('[ONBOARDING_WEBHOOK] Invalid phone number provided', { phone, sanitized: phoneResult.value })
        return false
      }
      
      // 🆕 SIMPLIFIED: Prepare webhook payload to match your n8n flow
      const webhookPayload = {
        phoneNumber: phoneResult.value  // +60123456789
      }
      
      logger.info('[ONBOARDING_WEBHOOK] Prepared payload:', webhookPayload)
      
      // 🆕 Your actual n8n webhook URL (first contact/onboarding)
      const webhookUrl = 'https://parallellium.app.n8n.cloud/webhook/whatsapp-initial-onboarding'
      
      // 🆕 ENABLED: Make actual webhook call to n8n
      try {
        const response = await fetch(webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(webhookPayload)
        })
        
        if (!response.ok) {
          logger.error('[ONBOARDING_WEBHOOK] HTTP error:', { status: response.status, statusText: response.statusText })
          return false
        }
        
        const result = await response.json()
        logger.info('[ONBOARDING_WEBHOOK_END] Success:', result)
        return true
        
      } catch (fetchError) {
        logger.error('[ONBOARDING_WEBHOOK] Fetch failed:', fetchError)
        return false
      }
      
    } catch (error) {
      logger.error('[ONBOARDING_WEBHOOK_END] Failed with exception:', error)
      return false
    }
  }

  // Refresh profile data
  const refreshProfile = async () => {
    if (!user) {
      logger.warn('[REFRESH_PROFILE] Aborted: No user signed in.')
      return
    }
    logger.info(`[REFRESH_PROFILE_START] User: ${user.id}`)
    setLoading(true)

    const profileData = await fetchProfile(user.id)
    if (!profileData) {
      logger.warn('[REFRESH_PROFILE] Primary fetch failed. Trying RPC fallback.')
      const rpcProfile = await createProfileViaRPC(user.id)
      setProfile(rpcProfile)
    } else {
      setProfile(profileData)
    }

    setLoading(false)
    logger.info('[REFRESH_PROFILE_END] Process complete.')
  }

  // 🆕 ENHANCED: Sign up new user with Malaysian phone validation and onboarding webhook
  const signUp = async (
    email: string, 
    password: string, 
    phone: string, 
    userType: 'driver' = 'driver'
  ) => {
    try {
      logger.info('[SIGNUP_START] Starting signup process', { email, phone, userType })
      
      // 🆕 NEW: Validate Malaysian phone number first
      const phoneResult = sanitizeAndValidate.malaysianPhone(phone)
      
      if (!phoneResult.isValid) {
        logger.error('[SIGNUP_PHONE_ERROR] Invalid Malaysian phone number', { 
          original: phone, 
          sanitized: phoneResult.value 
        })
        return { 
          user: null, 
          error: { 
            message: 'Please enter a valid Malaysian phone number (e.g., 0123456789 or +60123456789)',
            name: 'InvalidPhoneError'
          } as AuthError 
        }
      }
      
      logger.info('[SIGNUP_PHONE_SUCCESS] Phone validated successfully', { 
        original: phone,
        formatted: phoneResult.value,
        whatsappId: phoneResult.whatsappId 
      })
      
      // Sign up with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            phone: phoneResult.value,    // Store formatted phone
            user_type: userType
          }
        }
      })

      if (authError) {
        logger.error('[SIGNUP_AUTH_ERROR] Sign up error:', authError)
        return { user: null, error: authError }
      }

      logger.info('[SIGNUP_AUTH_SUCCESS] User auth created successfully', { userId: authData.user?.id })

      if (authData.user) {
        // 🆕 ENHANCED: Create user profile with Malaysian phone and onboarding tracking
        logger.info('[SIGNUP_PROFILE_START] Creating user profile...', {
          userId: authData.user.id,
          originalPhone: phone,
          formattedPhone: phoneResult.value,
          whatsappId: phoneResult.whatsappId,
          userType
        })
        
        const { data: profileData, error: profileError } = await supabase
          .from('user_profiles')
          .insert([{
            id: authData.user.id,
            user_type: userType,
            phone: phoneResult.value,        // 🆕 Use formatted phone
            wa_id: phoneResult.whatsappId,   // 🆕 Store WhatsApp ID
            total_incidents: 0,
            whatsapp_onboarded: false        // 🆕 Start as not onboarded
          }])
          .select()
          .single()

        if (profileError) {
          logger.error('[SIGNUP_PROFILE_ERROR] Error creating user profile:', {
            error: profileError,
            code: profileError.code,
            message: profileError.message,
            details: profileError.details,
            hint: profileError.hint
          })
          
          // Return the profile error to the user so they know what went wrong
          return { 
            user: null, 
            error: { 
              message: `Account created but profile setup failed: ${profileError.message}. Please contact support.`,
              name: 'ProfileCreationError'
            } as AuthError 
          }
        } else {
          logger.info('[SIGNUP_PROFILE_SUCCESS] User profile created successfully', profileData)
          
          // 🆕 NEW: Trigger onboarding webhook
          logger.info('[SIGNUP_ONBOARDING_START] Triggering onboarding webhook...')
          const webhookSuccess = await triggerOnboardingWebhook(authData.user.id, phoneResult.value)
          
          if (webhookSuccess) {
            logger.info('[SIGNUP_ONBOARDING_SUCCESS] Onboarding webhook triggered successfully')
          } else {
            logger.warn('[SIGNUP_ONBOARDING_FAILED] Onboarding webhook failed, but signup continues')
            // Note: We don't fail the signup if webhook fails - user can still use the app
          }
        }

        logger.info('[SIGNUP_COMPLETE] User signed up successfully')
      }

      return { user: authData.user, error: null }
    } catch (error) {
      logger.error('[SIGNUP_EXCEPTION] Unexpected error during sign up:', error)
      return { user: null, error: error as AuthError }
    }
  }

  // Sign in user
  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true)
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      if (error) {
        logger.error('Sign in error:', error)
        return { user: null, error }
      }

      logger.info('User signed in successfully')
      
      // The auth state listener will handle setting user and fetching profile
      // Return success immediately
      return { user: data.user, error: null }
    } catch (err) {
      const error = err as AuthError
      logger.error('Sign in exception:', error)
      return { user: null, error }
    } finally {
      setLoading(false)
    }
  }

  // Sign out user
  const signOut = async () => {
    logger.info('[SIGN_OUT_START] Attempting to sign out user')
    
    // IMMEDIATE localStorage cleanup - do this FIRST before anything else
    try {
      logger.info('[SIGN_OUT_CLEANUP] IMMEDIATELY clearing browser storage')
      
      // Clear all Supabase-related keys from localStorage FIRST
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
      if (supabaseUrl) {
        const supabaseKey = `sb-${supabaseUrl.split('//')[1]?.split('.')[0]}-auth-token`
        localStorage.removeItem(supabaseKey)
        sessionStorage.removeItem(supabaseKey)
        logger.info(`[SIGN_OUT_CLEANUP] Removed key: ${supabaseKey}`)
      }
      
      // Clear any other potential Supabase keys
      Object.keys(localStorage).forEach(key => {
        if (key.includes('supabase') || key.includes('sb-')) {
          localStorage.removeItem(key)
          logger.info(`[SIGN_OUT_CLEANUP] Removed localStorage key: ${key}`)
        }
      })
      
      Object.keys(sessionStorage).forEach(key => {
        if (key.includes('supabase') || key.includes('sb-')) {
          sessionStorage.removeItem(key)
          logger.info(`[SIGN_OUT_CLEANUP] Removed sessionStorage key: ${key}`)
        }
      })
      
      logger.info('[SIGN_OUT_CLEANUP] Browser storage cleanup completed IMMEDIATELY')
    } catch (storageError) {
      logger.error('[SIGN_OUT_CLEANUP] Error clearing browser storage:', storageError)
    }
    
    // Force clear state immediately 
    setLoading(true)
    setUser(null)
    setProfile(null)
    
    try {
      // Use global sign out to clear session from all tabs/windows
      const { error } = await supabase.auth.signOut({ scope: 'global' })
      if (error) {
        logger.error('[SIGN_OUT_ERROR] Sign out error:', error)
        // Even if there's an error, keep the user signed out locally
      } else {
        logger.info('[SIGN_OUT_SUCCESS] User signed out successfully from all sessions')
      }
    } catch (error) {
      logger.error('[SIGN_OUT_EXCEPTION] Unexpected error during sign out:', error)
    }
    
    // Ensure we're signed out locally regardless of API success/failure
    setUser(null)
    setProfile(null)
    setLoading(false)
    
    logger.info('[SIGN_OUT_COMPLETE] Sign out process finished')
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

  // Get current session (recommended by latest docs)
  const getSession = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      if (error) {
        logger.error('Error getting session:', error)
        return null
      }
      return session
    } catch (error) {
      logger.error('Unexpected error getting session:', error)
      return null
    }
  }

  // 🆕 NEW: Mark user as onboarded (called by onboarding completion endpoint)
  const markUserOnboarded = async (userId: string): Promise<boolean> => {
    logger.info(`[MARK_ONBOARDED_START] User: ${userId}`)
    
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ whatsapp_onboarded: true })
        .eq('id', userId)
      
      if (error) {
        logger.error('[MARK_ONBOARDED_ERROR] Failed to update onboarding status:', error)
        return false
      }
      
      // Refresh the current profile if it's the same user
      if (user && user.id === userId) {
        logger.info('[MARK_ONBOARDED] Refreshing current user profile...')
        await refreshProfile()
      }
      
      logger.info('[MARK_ONBOARDED_END] Success - user marked as onboarded')
      return true
      
    } catch (error) {
      logger.error('[MARK_ONBOARDED_END] Failed with exception:', error)
      return false
    }
  }

  // Refresh the current session
  const refreshSession = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.refreshSession()
      if (error) {
        logger.error('Error refreshing session:', error)
        return { session: null, error }
      }
      return { session, error: null }
    } catch (error) {
      logger.error('Unexpected error refreshing session:', error)
      return { session: null, error: error as AuthError }
    }
  }

  // Initialize auth state
  useEffect(() => {
    logger.info('[AUTH_EFFECT_SETUP] Setting up onAuthStateChange listener.')
    
    // Check initial session state
    const checkInitialSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession()
      logger.info('[INITIAL_SESSION_CHECK]', { 
        hasSession: !!session, 
        hasUser: !!session?.user,
        userId: session?.user?.id,
        error: error?.message 
      })
    }
    checkInitialSession()
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        logger.info(`[AUTH_EVENT_START] Event: ${event}`, { 
          hasSession: !!session,
          userId: session?.user?.id,
          sessionExpiry: session?.expires_at 
        })
        
        try {
          switch (event) {
            case 'INITIAL_SESSION':
            case 'SIGNED_IN':
            case 'USER_UPDATED':
              if (session?.user) {
                logger.info('[AUTH_EVENT] Setting user and fetching profile')
                setUser(session.user)
                const userProfile = await fetchProfile(session.user.id)
                setProfile(userProfile)
              } else {
                logger.info('[AUTH_EVENT] No session/user - clearing state')
                setUser(null)
                setProfile(null)
              }
              break
            case 'SIGNED_OUT':
              logger.info('[AUTH_EVENT] User signed out - clearing state')
              setUser(null)
              setProfile(null)
              break
            default:
              logger.info(`[AUTH_EVENT] Unhandled event: ${event}`)
              break
          }
        } catch (error) {
          logger.error('[AUTH_EVENT] Critical error in handler:', error)
        } finally {
          logger.info('[AUTH_EVENT_END] Handler finished. Setting loading to false.')
          setLoading(false)
        }
      }
    )

    return () => {
      logger.info('[AUTH_EFFECT_CLEANUP] Unsubscribing from auth state changes.')
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
    refreshProfile,
    getSession,
    refreshSession,
    testDatabaseConnection,
    createProfileViaRPC, // Also exposing this for manual testing if needed
    triggerOnboardingWebhook, // 🆕 NEW: For manual onboarding trigger
    markUserOnboarded // 🆕 NEW: For onboarding completion
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
} 