// API Response Interfaces

// Generic API Response wrapper
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
  timestamp?: string
}

// Notify Driver
export interface NotifyDriverResponse {
  success: boolean
  message: string
  incidentId?: string
}

// Acknowledge Incident
export interface AcknowledgeIncidentResponse {
  success: boolean
  message: string
  acknowledgedAt?: string
}

// Create Sticker
export interface CreateStickerResponse {
  success: boolean
  sticker?: {
    id: string
    token: string
    plate: string
    style: string
    created_at: string
  }
  error?: string
}

// Scan Page
export interface ScanPageResponse {
  sticker: {
    id: string
    token: string
    plate: string
    driver?: {
      id: string
      phone: string
    }
  }
  incident?: {
    id: string
    rage_level: number
    status: string
    created_at: string
  }
}

// Authentication
export interface AuthResponse {
  success: boolean
  user?: {
    id: string
    email: string
    role: string
  }
  session?: {
    access_token: string
    refresh_token: string
  }
  error?: string
}

// Profile
export interface ProfileResponse {
  success: boolean
  profile?: {
    id: string
    user_type: 'driver' | 'admin'
    phone: string
    wa_id?: string
    total_incidents: number
    avg_response_time_minutes?: number
  }
  error?: string
}

// WhatsApp Message (Outgoing from n8n)
export interface WhatsAppMessageRequest {
  messaging_product: 'whatsapp'
  to: string
  type: 'text'
  text: {
    body: string
  }
}

// n8n Webhook Response (Back to Supabase) - Enhanced for session management
export interface N8nWebhookResponse {
  success: boolean
  status: 'success' | 'failed' | 'partial'
  message_id?: string
  delivery_method: 'direct' | 'template' | 'escalation' | 'failed'
  session_status: 'active' | 'expired' | 'unknown'
  escalation_level: number
  template_used?: string
  user_response?: string
  processing_time_ms?: number
  timestamp: string
  error?: string
  debug_info?: {
    phone_number_valid: boolean
    template_approved: boolean
    session_last_seen?: string
  }
}