// Database Entity Interfaces

export interface Sticker {
  id: string
  token: string
  plate: string
  style: string
  status: 'active' | 'inactive'
  owner_id: string
  driver_id?: string // Legacy compatibility
  created_at: string
  updated_at?: string
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

export interface Driver {
  id: string
  phone: string
  wa_id?: string
}

// Database function return types
export interface RpcResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
}
