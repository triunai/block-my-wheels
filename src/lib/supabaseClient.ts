import { createClient } from '@supabase/supabase-js'
import { logger } from './utils'
import type { Sticker, Incident, ScanPageData, Driver, RpcResponse } from '../interfaces/database'

// Types for our database schema
export interface Driver {
  id: string
  user_id: string
  phone: string
  wa_id?: string
  created_at: string
}

export interface Sticker {
  id: string
  driver_id: string
  token: string
  plate?: string
  created_at: string
  driver?: Driver
}

export interface Incident {
  id: string
  sticker_id: string
  rage?: number // Legacy compatibility
  rage_level?: number // New standard
  status: 'open' | 'acknowledged' | 'resolved' | 'expired'
  scanner_ip?: string
  created_at: string
  acknowledged_at?: string
  eta_minutes?: number
  resolved_at?: string
  sticker?: Sticker
}

export interface ScanPageData {
  sticker: Sticker
  incident: Incident | null
}

// Environment validation with template mode support
const validateEnvironment = () => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

  // Allow template mode with placeholder values
  const isTemplateMode = supabaseUrl === 'https://your-project.supabase.co' || 
                         supabaseAnonKey === 'your-anon-key' ||
                         !supabaseUrl || !supabaseAnonKey

  if (isTemplateMode) {
    logger.warn('Running in template mode - Supabase functions will be mocked')
    return { 
      supabaseUrl: 'https://template.supabase.co', 
      supabaseAnonKey: 'template-key',
      isTemplateMode: true
    }
  }

  return { supabaseUrl, supabaseAnonKey, isTemplateMode: false }
}

// Create Supabase client with environment validation
const { supabaseUrl, supabaseAnonKey, isTemplateMode } = validateEnvironment()
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Enhanced error handling wrapper
const handleRpcError = (error: unknown, operation: string): never => {
  logger.error(`Supabase RPC Error in ${operation}`, error)
  const errorMessage = error instanceof Error ? error.message : 'Unknown error'
  throw new Error(`Failed to ${operation}: ${errorMessage}`)
}

// Mock data for template mode
const mockScanPageData: ScanPageData = {
  sticker: {
    id: 'mock-sticker-1',
    driver_id: 'mock-driver-1',
    token: 'DEMO123456',
    plate: 'ABC-123',
    created_at: new Date().toISOString(),
    driver: {
      id: 'mock-driver-1',
      user_id: 'mock-user-1',
      phone: '+1234567890',
      wa_id: 'mock-wa-id',
      created_at: new Date().toISOString()
    }
  },
  incident: {
    id: 'mock-incident-1',
    sticker_id: 'mock-sticker-1',
    rage: 2,
    status: 'open',
    scanner_ip: '192.168.1.1',
    created_at: new Date().toISOString(),
    acknowledged_at: undefined,
    eta_minutes: undefined
  }
}

const mockIncidents: Incident[] = [
  {
    id: 'mock-incident-1',
    sticker_id: 'mock-sticker-1',
    rage: 2,
    status: 'open',
    scanner_ip: '192.168.1.1',
    created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
    acknowledged_at: undefined,
    eta_minutes: undefined,
    sticker: {
      id: 'mock-sticker-1',
      driver_id: 'mock-driver-1',
      token: 'DEMO123456',
      plate: 'ABC-123',
      created_at: new Date().toISOString()
    }
  },
  {
    id: 'mock-incident-2',
    sticker_id: 'mock-sticker-2',
    rage: 4,
    status: 'open',
    scanner_ip: '192.168.1.2',
    created_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(), // 15 minutes ago
    acknowledged_at: undefined,
    eta_minutes: undefined,
    sticker: {
      id: 'mock-sticker-2',
      driver_id: 'mock-driver-1',
      token: 'DEMO789012',
      plate: 'XYZ-789',
      created_at: new Date().toISOString()
    }
  }
]

// ✅ REMOVED: triggerRageWebhook function - not needed since Supabase RPC handles webhooks

// RPC function wrappers with template mode support
export const rpcFunctions = {
  fetchScanPage: async (token: string): Promise<ScanPageData> => {
    if (isTemplateMode) {
      logger.info(`[TEMPLATE MODE] Fetching scan page for token: ${token}`)
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500))
      return {
        ...mockScanPageData,
        sticker: { ...mockScanPageData.sticker, token }
      }
    }

    try {
      const { data, error } = await supabase.rpc('fetch_scan_page', { p_token: token })
      if (error) throw error
      return data
    } catch (error) {
      return handleRpcError(error, 'fetch scan page data')
    }
  },

  notifyDriver: async (token: string, rage: number = 0) => {
    if (isTemplateMode) {
      logger.info(`[TEMPLATE MODE] Notifying driver for token: ${token}, rage: ${rage}`)
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800))
      return { success: true, message: 'Driver notified successfully (template mode)' }
    }

    try {
      logger.info(`[NOTIFY_DRIVER_START] Creating incident for token: ${token}, rage: ${rage}`)
      
      // 🚀 OPTIMIZED: Get phone and create incident in parallel
      const [phoneQuery, incidentCreation] = await Promise.allSettled([
        // Get sticker owner's phone number
        supabase
          .from('stickers')
          .select(`
            owner_id,
            user_profiles!inner(phone)
          `)
          .eq('token', token)
          .eq('status', 'active')
          .single(),
        
        // Create incident in database
        supabase.rpc('handle_new_ping', { 
          p_token: token, 
          p_rage_level: rage,
          p_scanner_ip_text: null
        })
      ])
      
      // Handle phone query result
      if (phoneQuery.status === 'rejected') {
        logger.error('[NOTIFY_DRIVER] Failed to get sticker owner phone:', phoneQuery.reason)
        throw new Error('Invalid sticker or unable to get owner details')
      }
      
      if (!phoneQuery.value.data) {
        logger.error('[NOTIFY_DRIVER] No sticker data found')
        throw new Error('Invalid sticker or unable to get owner details')
      }
      
      // Handle incident creation result
      if (incidentCreation.status === 'rejected') {
        logger.error(`[NOTIFY_DRIVER_ERROR] RPC error:`, incidentCreation.reason)
        throw incidentCreation.reason || new Error('Failed to create incident')
      }
      
      if (incidentCreation.value.error) {
        logger.error(`[NOTIFY_DRIVER_ERROR] RPC error:`, incidentCreation.value.error)
        throw incidentCreation.value.error
      }
      
      const userProfile = phoneQuery.value.data.user_profiles as unknown as { phone: string }
      const rawPhoneNumber = userProfile.phone
      logger.info(`[NOTIFY_DRIVER] Found raw phone: ${rawPhoneNumber}`)
      
      // 🆕 SIMPLIFIED: Format phone number for WhatsApp (Malaysian format)
      const formattedPhone = rawPhoneNumber?.startsWith('+') 
        ? rawPhoneNumber 
        : rawPhoneNumber?.startsWith('0') 
          ? '+60' + rawPhoneNumber.substring(1)
          : rawPhoneNumber?.startsWith('60')
            ? '+' + rawPhoneNumber
            : '+60' + rawPhoneNumber
      
      logger.info(`[NOTIFY_DRIVER] Formatted phone: ${rawPhoneNumber} -> ${formattedPhone}`)
      
      // 🎯 ENHANCED: Make webhook call with session validation support
      logger.info(`[WEBHOOK_START] Sending webhook to n8n with session validation...`)
      
      try {
        const webhookResponse = await fetch('https://parallellium.app.n8n.cloud/webhook/whatsapp-rage-agent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            rageCounter: rage,
            phoneNumber: formattedPhone,
            timestamp: new Date().toISOString(),
            token: token,
            // 🆕 Simplified session handling
            messageType: 'rage_notification',
            fallbackMessage: 'session_prompt' // Use template if session expired
          }),
          signal: AbortSignal.timeout(15000) // 15 second timeout for session validation
        })
        
        const responseText = await webhookResponse.text()
        let responseData = null
        
        try {
          responseData = JSON.parse(responseText)
        } catch {
          // Response is not JSON, use as plain text
          responseData = { message: responseText }
        }
        
        logger.info(`[WEBHOOK_RESPONSE] Status: ${webhookResponse.status}, Data:`, responseData)
        
        if (!webhookResponse.ok) {
          logger.error(`[WEBHOOK_FAILED] HTTP ${webhookResponse.status}: ${responseText}`)
          return {
            ...incidentCreation.value.data,
            webhookStatus: 'failed',
            webhookError: responseText
          }
        } else {
          logger.info(`[WEBHOOK_SUCCESS] Message processing initiated!`)
          
          // 🎯 Handle different response types from n8n
          const webhookResult = {
            status: responseData.status || 'success',
            messageType: responseData.messageType || 'unknown',
            sessionStatus: responseData.sessionStatus || 'unknown',
            messageId: responseData.messageId || null,
            deliveryMethod: responseData.deliveryMethod || 'whatsapp', // whatsapp, sms, email
            fallbackUsed: responseData.fallbackUsed || false
          }
          
          if (webhookResult.fallbackUsed) {
            logger.info(`[FALLBACK_DELIVERY] Message sent via ${webhookResult.deliveryMethod} due to WhatsApp session expiry`)
          }
          
          return {
            ...incidentCreation.value.data,
            webhookStatus: 'success',
            webhookResult
          }
        }
      } catch (webhookError) {
        logger.error(`[WEBHOOK_ERROR] Webhook request failed:`, webhookError)
        return {
          ...incidentCreation.value.data,
          webhookStatus: 'error',
          webhookError: webhookError instanceof Error ? webhookError.message : 'Unknown error'
        }
      }
      
      return incidentCreation.value.data
    } catch (error) {
      logger.error(`[NOTIFY_DRIVER_EXCEPTION] Exception occurred:`, error)
      return handleRpcError(error, 'notify driver')
    }
  },

  ackIncident: async (incidentId: string, etaMinutes?: number) => {
    if (isTemplateMode) {
      logger.info(`[TEMPLATE MODE] Acknowledging incident: ${incidentId}, ETA: ${etaMinutes} minutes`)
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 600))
      return { success: true, message: 'Incident acknowledged successfully (template mode)' }
    }

    try {
      const { data, error } = await supabase.rpc('ack_incident', { 
        incident_id: incidentId, 
        eta_minutes: etaMinutes 
      })
      if (error) throw error
      return data
    } catch (error) {
      return handleRpcError(error, 'acknowledge incident')
    }
  },

  // Helper function to check if user has a complete profile
  checkUserProfile: async (userId: string): Promise<{ hasProfile: boolean; profile?: unknown }> => {
    if (isTemplateMode) {
      logger.info(`[TEMPLATE MODE] Skipping profile check for user: ${userId}`)
      return { hasProfile: true }
    }

    try {
      logger.info(`[PROFILE_CHECK] Checking profile for user: ${userId}`)
      
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        logger.error(`[PROFILE_CHECK] Error checking profile:`, error)
        throw error
      }

      const hasProfile = !!profile
      logger.info(`[PROFILE_CHECK] Profile exists: ${hasProfile}`)
      
      return { hasProfile, profile }
    } catch (error) {
      logger.error(`[PROFILE_CHECK] Failed to check profile:`, error)
      throw error
    }
  },

  createSticker: async (plate: string, style: string = 'modern', token?: string, userId?: string) => {
    logger.info(`[DB_CREATE_STICKER] Template mode status: ${isTemplateMode}`)
    
    try {
      logger.info(`[DB_CREATE_STICKER] Starting creation for plate: ${plate}, style: ${style}, token: ${token}`)
      
      let user_id = userId
      
      // If no userId provided, try to get it from auth
      if (!user_id) {
        logger.info(`[DB_CREATE_STICKER] Getting user auth...`)
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        logger.info(`[DB_CREATE_STICKER] Auth check result:`, { user: user?.id, error: userError })
        
        if (userError || !user) {
          logger.error(`[DB_CREATE_STICKER] Authentication failed:`, userError)
          throw new Error('User not authenticated')
        }
        user_id = user.id
      } else {
        logger.info(`[DB_CREATE_STICKER] Using provided userId: ${user_id}`)
      }

      // Check if user has a complete profile (proper validation)
      const { hasProfile, profile } = await rpcFunctions.checkUserProfile(user_id)
      
      if (!hasProfile) {
        logger.error(`[DB_CREATE_STICKER] User profile not found for: ${user_id}`)
        throw new Error('PROFILE_INCOMPLETE: Please complete your profile setup before creating stickers')
      }

      const userProfile = profile as { phone?: string }
      if (!userProfile?.phone || userProfile.phone.startsWith('temp-')) {
        logger.error(`[DB_CREATE_STICKER] User profile incomplete - missing phone: ${user_id}`)
        throw new Error('PROFILE_INCOMPLETE: Please add your phone number to your profile before creating stickers')
      }

      // Generate token if not provided
      const stickerToken = token || `BMW${Math.random().toString(36).substr(2, 6).toUpperCase()}`
      logger.info(`[DB_CREATE_STICKER] Using token: ${stickerToken}`)

      // Insert sticker with validated user
      const insertData = {
        owner_id: user_id,
        token: stickerToken,
        plate: plate,
        style: style,
        status: 'active'
      }
      logger.info(`[DB_CREATE_STICKER] Inserting data:`, insertData)

      const { data, error } = await supabase
        .from('stickers')
        .insert(insertData)
        .select()
        .single()

      logger.info(`[DB_CREATE_STICKER] Insert result:`, { data, error })

      if (error) {
        logger.error(`[DB_CREATE_STICKER] Insert failed:`, error)
        throw error
      }

      logger.info(`[DB_CREATE_STICKER] Successfully created sticker:`, data)
      return {
        ...data,
        success: true
      }
    } catch (error) {
      logger.error(`[DB_CREATE_STICKER] Operation failed:`, error)
      return handleRpcError(error, 'create sticker')
    }
  },

  // Template-specific function for getting driver incidents
  fetchDriverIncidents: async (driverId: string): Promise<Incident[]> => {
    if (isTemplateMode) {
      logger.info(`[TEMPLATE MODE] Fetching incidents for driver: ${driverId}`)
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 400))
      return mockIncidents
    }

    try {
      const { data, error } = await supabase.rpc('fetch_driver_incidents', { driver_id: driverId })
      if (error) throw error
      return data || []
    } catch (error) {
      return handleRpcError(error, 'fetch driver incidents')
    }
  }
}

// Export template mode status for components to use
export { isTemplateMode }
