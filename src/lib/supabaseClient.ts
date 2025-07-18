import { createClient } from '@supabase/supabase-js'
import { logger } from './utils'

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
  rage: number
  status: 'open' | 'ack' | 'closed'
  scanner_ip?: string
  created_at: string
  ack_at?: string
  eta_minutes?: number
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
    ack_at: undefined,
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
    ack_at: undefined,
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
    ack_at: undefined,
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
      const { data, error } = await supabase.rpc('fetch_scan_page', { token })
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
      const { data, error } = await supabase.rpc('notify_driver', { token, rage })
      if (error) throw error
      return data
    } catch (error) {
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

  createSticker: async (plate: string, style: string = 'modern', token?: string) => {
    if (isTemplateMode) {
      logger.info(`[TEMPLATE MODE] Creating sticker for plate: ${plate}, style: ${style}`)
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      const newToken = token || `BMW${Math.random().toString(36).substr(2, 6).toUpperCase()}`
      return {
        id: `mock-sticker-${Date.now()}`,
        driver_id: 'mock-driver-1',
        token: newToken,
        plate: plate,
        created_at: new Date().toISOString(),
        style: style,
        success: true
      }
    }

    try {
      const { data, error } = await supabase.rpc('create_sticker', { 
        plate, 
        style, 
        token: token || undefined 
      })
      if (error) throw error
      return data
    } catch (error) {
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
