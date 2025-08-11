/**
 * Shared form validation utilities
 * Extracted from auth components to eliminate duplication
 */

import { validate, sanitizeAndValidate } from '../validation'

/**
 * Validates email format
 * @param email - Email address to validate
 * @returns true if valid, false otherwise
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validates password strength
 * @param password - Password to validate
 * @returns Error message if invalid, null if valid
 */
export const validatePassword = (password: string): string | null => {
  if (password.length < 6) {
    return 'Password must be at least 6 characters'
  }
  return null
}

/**
 * Validates password confirmation match
 * @param password - Original password
 * @param confirmPassword - Confirmation password
 * @returns true if passwords match, false otherwise
 */
export const validatePasswordMatch = (password: string, confirmPassword: string): boolean => {
  return password === confirmPassword
}

/**
 * 🆕 ENHANCED: Validates Malaysian phone number format with detailed feedback
 * @param phone - Phone number to validate
 * @returns Object with validation result and formatted number
 */
export const validateMalaysianPhone = (phone: string): {
  isValid: boolean;
  formatted: string;
  whatsappId: string;
  errorMessage?: string;
} => {
  if (!phone) {
    return {
      isValid: false,
      formatted: '',
      whatsappId: '',
      errorMessage: 'Phone number is required'
    }
  }

  const result = sanitizeAndValidate.malaysianPhone(phone)
  
  if (!result.isValid) {
    return {
      isValid: false,
      formatted: result.value,
      whatsappId: result.whatsappId,
      errorMessage: 'Please enter a valid Malaysian phone number (e.g., +60123456789 or 0123456789)'
    }
  }

  return {
    isValid: true,
    formatted: result.value,
    whatsappId: result.whatsappId
  }
}

/**
 * Legacy phone validation (generic) - kept for backward compatibility
 * @param phone - Phone number to validate
 * @returns true if valid (at least 10 digits), false otherwise
 */
export const validatePhone = (phone: string): boolean => {
  return validate.phone(phone)
}

/**
 * 🆕 ENHANCED: Comprehensive form field validation with Malaysian phone support
 * @param field - Field name
 * @param value - Field value
 * @returns Error message if invalid, null if valid
 */
export const validateField = (field: string, value: string): string | null => {
  switch (field) {
    case 'email':
      if (!value) return 'Email is required'
      if (!validateEmail(value)) return 'Please enter a valid email address'
      return null
      
    case 'password':
      if (!value) return 'Password is required'
      return validatePassword(value)
      
    case 'phone':
      // Use generic phone validation for backward compatibility
      if (!value) return 'Phone number is required'
      if (!validatePhone(value)) return 'Please enter a valid phone number (at least 10 digits)'
      return null

    case 'malaysianPhone': {
      // Use specific Malaysian phone validation
      const phoneResult = validateMalaysianPhone(value)
      return phoneResult.errorMessage || null
    }
      
    default:
      return null
  }
}

/**
 * Validates all required fields are filled
 * @param fields - Object containing field values
 * @returns Array of missing field names
 */
export const validateRequiredFields = (fields: Record<string, unknown>): string[] => {
  const missingFields: string[] = []
  
  Object.entries(fields).forEach(([key, value]) => {
    if (!value || (typeof value === 'string' && !value.trim())) {
      missingFields.push(key)
    }
  })
  
  return missingFields
}

/**
 * Format field name for display
 * @param fieldName - Raw field name
 * @returns Formatted field name
 */
export const formatFieldName = (fieldName: string): string => {
  return fieldName
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase())
    .trim()
}