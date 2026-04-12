import { useState, useCallback } from 'react';

export interface ValidationRule<T> {
  validate: (value: T) => boolean;
  message: string;
}

export interface FieldValidation<T> {
  value: T;
  error?: string;
  touched: boolean;
}

export interface UseFormValidationOptions<T extends Record<string, any>> {
  fields: {
    [K in keyof T]?: ValidationRule<T[K]>[];
  };
  initialValues: T;
}

export interface UseFormValidationReturn<T extends Record<string, any>> {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
  isValid: boolean;
  setValue: (field: keyof T, value: T[keyof T]) => void;
  setTouched: (field: keyof T) => void;
  validateField: (field: keyof T) => boolean;
  validateAll: () => boolean;
  reset: () => void;
}

export function useFormValidation<T extends Record<string, any>>(
  options: UseFormValidationOptions<T>
): UseFormValidationReturn<T> {
  const { fields, initialValues } = options;
  
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});

  const setValue = useCallback((field: keyof T, value: T[keyof T]) => {
    setValues(prev => ({ ...prev, [field]: value }));
    
    const fieldRules = fields[field];
    if (fieldRules) {
      const rule = fieldRules.find(r => !r.validate(value));
      if (rule) {
        setErrors(prev => ({ ...prev, [field]: rule.message }));
      } else {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[field];
          return newErrors;
        });
      }
    }
  }, [fields]);

  const setTouchedField = useCallback((field: keyof T) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  }, []);

  const validateField = useCallback((field: keyof T): boolean => {
    const fieldRules = fields[field];
    if (!fieldRules) return true;
    
    const value = values[field];
    const rule = fieldRules.find(r => !r.validate(value));
    
    if (rule) {
      setErrors(prev => ({ ...prev, [field]: rule.message }));
      return false;
    } else {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
      return true;
    }
  }, [fields, values]);

  const validateAll = useCallback((): boolean => {
    let isValid = true;
    const newErrors: Partial<Record<keyof T, string>> = {};
    
    (Object.keys(fields) as (keyof T)[]).forEach(field => {
      const fieldRules = fields[field];
      const value = values[field];
      
      if (fieldRules) {
        const rule = fieldRules.find(r => !r.validate(value));
        if (rule) {
          newErrors[field] = rule.message;
          isValid = false;
        }
      }
    });
    
    setErrors(newErrors);
    return isValid;
  }, [fields, values]);

  const isValid = Object.keys(errors).length === 0;

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  }, [initialValues]);

  return {
    values,
    errors,
    touched,
    isValid,
    setValue,
    setTouched: setTouchedField,
    validateField,
    validateAll,
    reset,
  };
}
