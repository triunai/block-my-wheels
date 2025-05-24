
import { createClient } from '@supabase/supabase-js'

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

// Create Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// RPC function wrappers
export const rpcFunctions = {
  fetchScanPage: async (token: string): Promise<ScanPageData> => {
    const { data, error } = await supabase.rpc('fetch_scan_page', { token })
    if (error) throw error
    return data
  },

  notifyDriver: async (token: string, rage: number = 0) => {
    const { data, error } = await supabase.rpc('notify_driver', { token, rage })
    if (error) throw error
    return data
  },

  ackIncident: async (incidentId: string, etaMinutes?: number) => {
    const { data, error } = await supabase.rpc('ack_incident', { 
      incident_id: incidentId, 
      eta_minutes: etaMinutes 
    })
    if (error) throw error
    return data
  },

  createSticker: async (plate: string, style: string = 'modern') => {
    const { data, error } = await supabase.rpc('create_sticker', { plate, style })
    if (error) throw error
    return data
  }
}
