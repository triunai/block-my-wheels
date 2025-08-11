// Rage level constants
export const RAGE_EMOJIS = ['😐', '😐', '😕', '😠', '😠', '😡', '😡', '🤬', '🤬', '🔥', '💀'] as const

export const MAX_RAGE_LEVEL = 10
export const DEFAULT_ETA_MINUTES = 5
export const MAX_ETA_HOURS = 24

// Time constants
export const QUERY_STALE_TIME = 5 * 60 * 1000 // 5 minutes
export const TOAST_DURATION = 4000 // 4 seconds

// Form validation
export const PASSWORD_MIN_LENGTH = 6
export const PHONE_MIN_LENGTH = 10

// API response times
export const MOCK_API_DELAY = {
  SHORT: 400,
  MEDIUM: 600,
  LONG: 800,
} as const

// Dashboard stats configuration
export const DASHBOARD_STATS = {
  OPEN_INCIDENTS: {
    icon: 'Bell',
    color: 'text-blue-600',
    label: 'Open Incidents',
  },
  ACTIVE_STICKERS: {
    icon: 'Car',
    color: 'text-green-600',
    label: 'Active Stickers',
  },
  TOTAL_RAGE: {
    icon: 'Clock',
    color: 'text-orange-600',
    label: 'Total Rage Points',
  },
} as const