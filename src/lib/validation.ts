import { logger } from './utils'

// Input sanitization utilities
export const sanitize = {
  // Remove potentially dangerous characters from strings
  string: (input: string): string => {
    if (typeof input !== 'string') {
      logger.warn('sanitize.string received non-string input', { input, type: typeof input });
      return '';
    }
    return input.trim().replace(/[<>"'&]/g, '');
  },

  // Sanitize license plate format
  licensePlate: (input: string): string => {
    if (typeof input !== 'string') {
      logger.warn('sanitize.licensePlate received non-string input', { input, type: typeof input });
      return '';
    }
    return input.trim().toUpperCase().replace(/[^A-Z0-9\s-]/g, '');
  },

  // Sanitize token format (alphanumeric only)
  token: (input: string): string => {
    if (typeof input !== 'string') {
      logger.warn('sanitize.token received non-string input', { input, type: typeof input });
      return '';
    }
    return input.trim().replace(/[^a-zA-Z0-9]/g, '');
  },

  // 🆕 NEW: Sanitize Malaysian phone number
  malaysianPhone: (input: string): string => {
    if (typeof input !== 'string') {
      logger.warn('sanitize.malaysianPhone received non-string input', { input, type: typeof input });
      return '';
    }
    
    // Remove all non-digit characters except +
    let cleaned = input.trim().replace(/[^\d+]/g, '');
    
    // Handle different input formats
    if (cleaned.startsWith('60')) {
      // Add + if missing: 60123456789 -> +60123456789
      cleaned = '+' + cleaned;
    } else if (cleaned.startsWith('0')) {
      // Convert local format: 0123456789 -> +60123456789
      cleaned = '+60' + cleaned.substring(1);
    } else if (!cleaned.startsWith('+60')) {
      // Assume it's a local number without 0: 123456789 -> +60123456789
      cleaned = '+60' + cleaned;
    }
    
    return cleaned;
  },

  // Sanitize numeric input
  number: (input: unknown): number => {
    const num = Number(input)
    if (isNaN(num)) {
      logger.warn('sanitize.number received non-numeric input', { input, type: typeof input })
      return 0
    }
    return Math.max(0, Math.floor(num)) // Ensure positive integer
  }
};

// Validation utilities
export const validate = {
  // Validate token format
  token: (token: string): boolean => {
    if (!token || typeof token !== 'string') {
      return false;
    }
    // Token should be alphanumeric and between 6-50 characters
    return /^[a-zA-Z0-9]{6,50}$/.test(token);
  },

  // Validate license plate format
  licensePlate: (plate: string): boolean => {
    if (!plate || typeof plate !== 'string') {
      return false;
    }
    // Basic license plate validation (adjust regex based on your region)
    return /^[A-Z0-9\s-]{2,15}$/.test(plate.trim().toUpperCase());
  },

  // 🆕 NEW: Validate Malaysian phone number
  malaysianPhone: (phone: string): boolean => {
    if (!phone || typeof phone !== 'string') {
      return false;
    }
    
    const cleaned = phone.trim();
    
    // Malaysian phone number formats:
    // Mobile: +60123456789, +60143456789, +60173456789, +60183456789, +60193456789
    // Landline KL: +60312345678, +60387654321
    // Landline other states: +603xxxxxxxx, +604xxxxxxxx, +605xxxxxxxx, etc.
    
    const mobileRegex = /^\+60(1[0-9])\d{7,8}$/;          // Mobile numbers
    const landlineRegex = /^\+60[3-9]\d{7,8}$/;           // Landline numbers
    
    return mobileRegex.test(cleaned) || landlineRegex.test(cleaned);
  },

  // Keep existing generic phone validation for backward compatibility
  phone: (phone: string): boolean => {
    if (!phone || typeof phone !== 'string') {
      return false;
    }
    // Generic international phone validation
    const cleaned = phone.replace(/[\s()-]/g, '');
    return cleaned.length >= 10 && /^\+?\d+$/.test(cleaned);
  },

  // Validate rage level
  rageLevel: (rage: unknown): boolean => {
    const num = Number(rage);
    return !isNaN(num) && num >= 0 && num <= 10;
  },

  // Validate ETA minutes
  etaMinutes: (eta: unknown): boolean => {
    const num = Number(eta);
    return !isNaN(num) && num >= 0 && num <= 1440; // Max 24 hours
  },

  // Validate incident ID format
  incidentId: (id: string): boolean => {
    if (!id || typeof id !== 'string') {
      return false;
    }
    // UUID format validation
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
  }
};

// Combined sanitize and validate function
export const sanitizeAndValidate = {
  token: (input: string): { value: string; isValid: boolean } => {
    const sanitized = sanitize.token(input)
    return {
      value: sanitized,
      isValid: validate.token(sanitized)
    }
  },

  licensePlate: (input: string): { value: string; isValid: boolean } => {
    const sanitized = sanitize.licensePlate(input);
    return {
      value: sanitized,
      isValid: validate.licensePlate(sanitized)
    };
  },

  // 🆕 NEW: Combined Malaysian phone sanitization and validation
  malaysianPhone: (input: string): { value: string; isValid: boolean; whatsappId: string } => {
    const sanitized = sanitize.malaysianPhone(input);
    const isValid = validate.malaysianPhone(sanitized);
    
    // Convert to WhatsApp ID format (remove + prefix)
    const whatsappId = sanitized.startsWith('+') ? sanitized.substring(1) : sanitized;
    
    return {
      value: sanitized,        // +60123456789
      isValid,
      whatsappId              // 60123456789
    };
  },

  rageLevel: (input: unknown): { value: number; isValid: boolean } => {
    const sanitized = sanitize.number(input);
    return {
      value: sanitized,
      isValid: validate.rageLevel(sanitized)
    };
  },

  etaMinutes: (input: unknown): { value: number; isValid: boolean } => {
    const sanitized = sanitize.number(input);
    return {
      value: sanitized,
      isValid: validate.etaMinutes(sanitized)
    };
  }
};

// 🆕 NEW: Helper functions for phone number conversion
export const phoneUtils = {
  // Convert phone to WhatsApp ID format
  toWhatsAppId: (phone: string): string => {
    const cleaned = sanitize.malaysianPhone(phone);
    return cleaned.startsWith('+') ? cleaned.substring(1) : cleaned;
  },
  
  // Format phone for display
  formatDisplay: (phone: string): string => {
    const cleaned = sanitize.malaysianPhone(phone);
    if (cleaned.length === 13 && cleaned.startsWith('+60')) {
      // +60123456789 -> +60 12-345 6789
      return `${cleaned.substring(0, 3)} ${cleaned.substring(3, 5)}-${cleaned.substring(5, 8)} ${cleaned.substring(8)}`;
    }
    return cleaned;
  },
  
  // Check if it's a mobile vs landline
  isMobile: (phone: string): boolean => {
    const cleaned = sanitize.malaysianPhone(phone);
    return /^\+60(1[0-9])\d{7,8}$/.test(cleaned);
  }
}; 