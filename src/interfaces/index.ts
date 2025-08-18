// Centralized interface exports for cleaner imports

// Database interfaces
export type {
  Driver,
  Sticker,
  Incident,
  ScanPageData,
  RpcResponse
} from './database'

// Authentication interfaces
export type {
  UserProfile,
  AuthContextType,
  AuthProviderProps,
  ProtectedRouteProps
} from './auth'

// Component interfaces
export type {
  ParticlePreset,
  ParticleBackgroundProps,
  FadeawayCarProps,
  FadeawayCarsProps,
  CitySkylineProps,
  ErrorBoundaryProps,
  ErrorBoundaryState,
  RageCounterProps,
  QuickActionsProps,
  NotifyButtonProps,
  HeroSectionProps,
  FooterProps,
  AckModalProps,
  ScanPageProps
} from './components'

// Request interfaces
export type {
  NotifyDriverRequest,
  AcknowledgeIncidentRequest,
  CreateStickerRequest,
  ScanPageRequest,
  AuthRequest,
  SignupRequest,
  ProfileRequest,
  N8nWebhookRequest
} from './requests'

// Response interfaces
export type {
  ApiResponse,
  NotifyDriverResponse,
  AcknowledgeIncidentResponse,
  CreateStickerResponse,
  ScanPageResponse,
  AuthResponse,
  ProfileResponse,
  WhatsAppMessageRequest,
  N8nWebhookResponse
} from './responses'
