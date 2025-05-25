import { logger } from './utils';

// Input sanitization utilities
export const sanitize = {
  // Remove potentially dangerous characters from strings
  string: (input: string): string => {
    if (typeof input !== 'string') {
      logger.warn('sanitize.string received non-string input', { input, type: typeof input });
      return '';
    }
    return input.trim().replace(/[<>\"'&]/g, '');
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

  // Sanitize numeric input
  number: (input: any): number => {
    const num = Number(input);
    if (isNaN(num)) {
      logger.warn('sanitize.number received non-numeric input', { input, type: typeof input });
      return 0;
    }
    return Math.max(0, Math.floor(num)); // Ensure positive integer
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

  // Validate rage level
  rageLevel: (rage: any): boolean => {
    const num = Number(rage);
    return !isNaN(num) && num >= 0 && num <= 10;
  },

  // Validate ETA minutes
  etaMinutes: (eta: any): boolean => {
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
    const sanitized = sanitize.token(input);
    return {
      value: sanitized,
      isValid: validate.token(sanitized)
    };
  },

  licensePlate: (input: string): { value: string; isValid: boolean } => {
    const sanitized = sanitize.licensePlate(input);
    return {
      value: sanitized,
      isValid: validate.licensePlate(sanitized)
    };
  },

  rageLevel: (input: any): { value: number; isValid: boolean } => {
    const sanitized = sanitize.number(input);
    return {
      value: sanitized,
      isValid: validate.rageLevel(sanitized)
    };
  },

  etaMinutes: (input: any): { value: number; isValid: boolean } => {
    const sanitized = sanitize.number(input);
    return {
      value: sanitized,
      isValid: validate.etaMinutes(sanitized)
    };
  }
}; 