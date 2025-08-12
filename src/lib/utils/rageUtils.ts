/**
 * Rage-related utility functions for the incident management system
 */

export const getRageEmoji = (rageLevel: number): string => {
  if (rageLevel === 0) return '😐'
  if (rageLevel === 1) return '😕'
  if (rageLevel === 2) return '😟'
  if (rageLevel === 3) return '😠'
  if (rageLevel === 4) return '😡'
  if (rageLevel === 5) return '🤬'
  if (rageLevel >= 6) return '💀'
  return '😐' // Default fallback
}

export const getRageColor = (rageLevel: number): string => {
  if (rageLevel === 0) return 'text-gray-500'
  if (rageLevel === 1) return 'text-yellow-500'
  if (rageLevel === 2) return 'text-orange-500'
  if (rageLevel === 3) return 'text-red-500'
  if (rageLevel === 4) return 'text-red-600'
  if (rageLevel >= 5) return 'text-red-700'
  return 'text-gray-500' // Default fallback
}

export const getRageLabel = (rageLevel: number): string => {
  if (rageLevel === 0) return 'Calm'
  if (rageLevel === 1) return 'Slightly Annoyed'
  if (rageLevel === 2) return 'Frustrated'
  if (rageLevel === 3) return 'Angry'
  if (rageLevel === 4) return 'Very Angry'
  if (rageLevel === 5) return 'Furious'
  if (rageLevel >= 6) return 'Absolutely Livid'
  return 'Unknown' // Default fallback
}

export const getRageBadgeClass = (rageLevel: number): string => {
  const baseClasses = 'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium'
  
  if (rageLevel === 0) return `${baseClasses} bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200`
  if (rageLevel === 1) return `${baseClasses} bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300`
  if (rageLevel === 2) return `${baseClasses} bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300`
  if (rageLevel === 3) return `${baseClasses} bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300`
  if (rageLevel === 4) return `${baseClasses} bg-red-200 text-red-900 dark:bg-red-900/50 dark:text-red-200`
  if (rageLevel >= 5) return `${baseClasses} bg-red-300 text-red-900 dark:bg-red-900/70 dark:text-red-100`
  
  return `${baseClasses} bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200` // Default fallback
}

export const getUrgencyLevel = (rageLevel: number): 'low' | 'medium' | 'high' | 'critical' => {
  if (rageLevel <= 1) return 'low'
  if (rageLevel <= 3) return 'medium'  
  if (rageLevel <= 5) return 'high'
  return 'critical'
}

export const getRageDescription = (rageLevel: number): string => {
  if (rageLevel === 0) return 'User reported calmly - no rush needed'
  if (rageLevel === 1) return 'User is slightly annoyed - respond when convenient'
  if (rageLevel === 2) return 'User is frustrated - should respond soon'
  if (rageLevel === 3) return 'User is angry - respond quickly'
  if (rageLevel === 4) return 'User is very angry - respond immediately'
  if (rageLevel === 5) return 'User is furious - urgent response required'
  if (rageLevel >= 6) return 'User is absolutely livid - EMERGENCY response needed'
  return 'Rage level unknown'
}