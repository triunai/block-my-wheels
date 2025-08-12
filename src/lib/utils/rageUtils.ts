import { RAGE_EMOJIS } from '../../constants/app'

export function getRageEmoji(rage: number): string {
  if (rage < 0 || rage >= RAGE_EMOJIS.length) return RAGE_EMOJIS[0]
  return RAGE_EMOJIS[rage]
}

export function getRageColor(rage: number): string {
  if (rage <= 2) return 'text-green-600'
  if (rage <= 5) return 'text-yellow-600'
  if (rage <= 7) return 'text-orange-600'
  return 'text-red-600'
}

export function getRageSeverity(rage: number): 'low' | 'medium' | 'high' | 'critical' {
  if (rage <= 2) return 'low'
  if (rage <= 5) return 'medium'
  if (rage <= 7) return 'high'
  return 'critical'
}