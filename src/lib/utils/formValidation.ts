/**
 * Shared form validation utilities
 * Extracted from auth components to eliminate duplication
 */

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
 * Validates phone number format
 * @param phone - Phone number to validate
 * @returns true if valid (at least 10 digits), false otherwise
 */
export const validatePhone = (phone: string): boolean => {
  // Remove common formatting characters for validation
  const digitsOnly = phone.replace(/[\s()-]/g, '')
  return digitsOnly.length >= 10 && /^\d+$/.test(digitsOnly)
}

/**
 * Comprehensive form field validation
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
      if (!value) return 'Phone number is required'
      if (!validatePhone(value)) return 'Please enter a valid phone number (at least 10 digits)'
      return null
      
    default:
      return null
  }
}

/**
 * Validates all required fields are filled
 * @param fields - Object containing field values
 * @returns Array of missing field names
 */
export const validateRequiredFields = (fields: Record<string, any>): string[] => {
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