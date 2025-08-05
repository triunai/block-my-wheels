// API Request Interfaces

// Notify Driver
export interface NotifyDriverRequest {
  token: string
  rage?: number
}

// Acknowledge Incident  
export interface AcknowledgeIncidentRequest {
  incidentId: string
  etaMinutes?: number
}

// Create Sticker
export interface CreateStickerRequest {
  plate: string
  style?: string
  token?: string
  userId?: string
}

// Scan Page
export interface ScanPageRequest {
  token: string
}

// Authentication
export interface AuthRequest {
  email: string
  password: string
}

export interface SignupRequest extends AuthRequest {
  phone?: string
  userType?: 'driver' | 'admin'
}

// Profile
export interface ProfileRequest {
  phone?: string
  wa_id?: string
}