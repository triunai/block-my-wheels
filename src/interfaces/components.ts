import { ReactNode } from 'react'
import { Incident } from '../lib/supabaseClient'

// Animation Components
export type ParticlePreset = 
  | "floating" 
  | "traffic" 
  | "waves" 
  | "snow" 
  | "matrix" 
  | "constellation"
  | "bubbles"

export interface ParticleBackgroundProps {
  preset?: ParticlePreset
  className?: string
  id?: string
}

export interface FadeawayCarProps {
  delay?: number
  duration?: number
  direction?: "left" | "right"
  lane?: number
  emoji?: string
  color?: string
  size?: "sm" | "md" | "lg"
}

export interface FadeawayCarsProps {
  className?: string
  carCount?: number
  speed?: "slow" | "medium" | "fast"
  density?: "light" | "medium" | "heavy"
}

export interface CitySkylineProps {
  className?: string
  buildingCount?: number
  animateWindows?: boolean
  nightMode?: boolean
}

// Core Components
export interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
}

export interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

export interface RageCounterProps {
  token: string
  initialRage?: number
  disabled?: boolean
}

export interface QuickActionsProps {
  onNavigation: (page: string) => void
}

export interface NotifyButtonProps {
  token: string
  disabled?: boolean
  className?: string
}

export interface HeroSectionProps {
  onNavigation: (page: string) => void
}

export interface FooterProps {
  onNavigation: (page: string) => void
}

export interface AckModalProps {
  incident: Incident | null
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

// Page Components
export interface ScanPageProps {
  token: string
} 