// Database Entity Interfaces

// 🆕 WhatsApp delivery status types (matches database constraints)
export type WhatsAppDeliveryStatus = 
  | 'pending' 
  | 'sent' 
  | 'delivered' 
  | 'failed' 
  | 'template_sent' 
  | 'session_reactivated'

// 🆕 Delivery method types (matches database constraints)
export type DeliveryMethod = 
  | 'direct' 
  | 'template' 
  | 'escalation' 
  | 'failed'

// 🆕 WhatsApp session status types
export type WhatsAppSessionStatus = 
  | 'active' 
  | 'expired' 
  | 'unknown'

export interface Driver {
  id: string
  user_id: string
  phone: string
  wa_id?: string
  created_at: string
}

export interface Sticker {
  id: string
  driver_id?: string // Legacy compatibility  
  owner_id?: string // New standard
  token: string
  plate?: string
  style?: string
  status?: 'active' | 'inactive'
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
  // 🆕 WhatsApp delivery tracking fields
  whatsapp_message_id?: string
  whatsapp_delivery_status?: WhatsAppDeliveryStatus
  whatsapp_delivered_at?: string
  delivery_method?: DeliveryMethod
  sticker?: Sticker
}

export interface ScanPageData {
  sticker: Sticker
  incident: Incident | null
}

// Database function return types
// 🆕 WhatsApp session interface
export interface WhatsAppSession {
  id: string
  user_id: string
  phone_number: string
  wa_id?: string
  last_message_at: string
  session_status: WhatsAppSessionStatus
  last_template_sent_at?: string
  template_response_count: number
  created_at: string
  updated_at: string
}

// Database function return types
export interface RpcResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
}
