import { Request, Response, NextFunction } from 'express';
import { ValidationError } from '../utils/errors.ts';

/**
 * Validation rule descriptor.
 */
interface ValidationRule {
  field: string;
  required?: boolean;
  type?: 'string' | 'number' | 'boolean' | 'array' | 'object';
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  patternMessage?: string;
  custom?: (value: any, body: any) => string | null;
}

/**
 * Creates a middleware that validates request body against provided rules.
 * Throws a ValidationError if validation fails.
 */
export function validateBody(rules: ValidationRule[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const errors: Array<{ field: string; message: string }> = [];

    for (const rule of rules) {
      const value = req.body[rule.field];

      // Required check
      if (rule.required && (value === undefined || value === null || value === '')) {
        errors.push({ field: rule.field, message: `${rule.field} is required` });
        continue;
      }

      // Skip further checks if value is absent and not required
      if (value === undefined || value === null) continue;

      // Type check
      if (rule.type === 'array') {
        if (!Array.isArray(value)) {
          errors.push({ field: rule.field, message: `${rule.field} must be an array` });
          continue;
        }
      } else if (rule.type && typeof value !== rule.type) {
        errors.push({ field: rule.field, message: `${rule.field} must be of type ${rule.type}` });
        continue;
      }

      // String length checks
      if (typeof value === 'string') {
        if (rule.minLength && value.length < rule.minLength) {
          errors.push({ field: rule.field, message: `${rule.field} must be at least ${rule.minLength} characters` });
        }
        if (rule.maxLength && value.length > rule.maxLength) {
          errors.push({ field: rule.field, message: `${rule.field} must be at most ${rule.maxLength} characters` });
        }
        if (rule.pattern && !rule.pattern.test(value)) {
          errors.push({ field: rule.field, message: rule.patternMessage || `${rule.field} has an invalid format` });
        }
      }

      // Custom validation
      if (rule.custom) {
        const customError = rule.custom(value, req.body);
        if (customError) {
          errors.push({ field: rule.field, message: customError });
        }
      }
    }

    if (errors.length > 0) {
      throw new ValidationError('Validation failed', errors);
    }

    next();
  };
}
