/**
 * ═══════════════════════════════════════════════════════════════════════════
 * VALIDACIÓN DE INPUTS
 * 
 * Validaciones centralizadas para API endpoints.
 * Previene inyecciones, datos maliciosos y valores inválidos.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

/**
 * Valida que un string no esté vacío
 */
export function required(value: unknown, fieldName: string): ValidationError | null {
  if (value === null || value === undefined || value === '') {
    return {
      field: fieldName,
      message: `${fieldName} es requerido`,
      code: 'REQUIRED',
    };
  }
  return null;
}

/**
 * Valida longitud mínima de string
 */
export function minLength(value: string, min: number, fieldName: string): ValidationError | null {
  if (value && value.length < min) {
    return {
      field: fieldName,
      message: `${fieldName} debe tener al menos ${min} caracteres`,
      code: 'MIN_LENGTH',
    };
  }
  return null;
}

/**
 * Valida longitud máxima de string
 */
export function maxLength(value: string, max: number, fieldName: string): ValidationError | null {
  if (value && value.length > max) {
    return {
      field: fieldName,
      message: `${fieldName} debe tener máximo ${max} caracteres`,
      code: 'MAX_LENGTH',
    };
  }
  return null;
}

/**
 * Valida que un valor sea numérico
 */
export function isNumber(value: unknown, fieldName: string): ValidationError | null {
  if (value !== null && value !== undefined && isNaN(Number(value))) {
    return {
      field: fieldName,
      message: `${fieldName} debe ser un número`,
      code: 'NOT_NUMBER',
    };
  }
  return null;
}

/**
 * Valida rango numérico
 */
export function numberRange(
  value: number,
  min: number,
  max: number,
  fieldName: string
): ValidationError | null {
  if (value < min || value > max) {
    return {
      field: fieldName,
      message: `${fieldName} debe estar entre ${min} y ${max}`,
      code: 'OUT_OF_RANGE',
    };
  }
  return null;
}

/**
 * Valida formato de email
 */
export function isEmail(value: string, fieldName: string): ValidationError | null {
  if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    return {
      field: fieldName,
      message: `${fieldName} debe ser un email válido`,
      code: 'INVALID_EMAIL',
    };
  }
  return null;
}

/**
 * Valida formato de URL
 */
export function isUrl(value: string, fieldName: string): ValidationError | null {
  if (value && !/^https?:\/\/[^\s]+$/.test(value)) {
    return {
      field: fieldName,
      message: `${fieldName} debe ser una URL válida (https)`,
      code: 'INVALID_URL',
    };
  }
  return null;
}

/**
 * Valida formato de RUC peruano (11 dígitos)
 */
export function isRUC(value: string, fieldName: string): ValidationError | null {
  if (value && !/^\d{11}$/.test(value)) {
    return {
      field: fieldName,
      message: `${fieldName} debe tener 11 dígitos numéricos`,
      code: 'INVALID_RUC',
    };
  }
  return null;
}

/**
 * Valida formato de DNI peruano (8 dígitos)
 */
export function isDNI(value: string, fieldName: string): ValidationError | null {
  if (value && !/^\d{8}$/.test(value)) {
    return {
      field: fieldName,
      message: `${fieldName} debe tener 8 dígitos numéricos`,
      code: 'INVALID_DNI',
    };
  }
  return null;
}

/**
 * Valida que el valor sea uno de los valores permitidos (enum)
 */
export function isEnum<T extends string>(
  value: T,
  allowedValues: T[],
  fieldName: string
): ValidationError | null {
  if (value && !allowedValues.includes(value)) {
    return {
      field: fieldName,
      message: `${fieldName} debe ser uno de: ${allowedValues.join(', ')}`,
      code: 'INVALID_ENUM',
    };
  }
  return null;
}

/**
 * Valida que un string coincida con un patrón (regex)
 */
export function matchesPattern(
  value: string,
  pattern: RegExp,
  fieldName: string,
  message?: string
): ValidationError | null {
  if (value && !pattern.test(value)) {
    return {
      field: fieldName,
      message: message || `${fieldName} tiene un formato inválido`,
      code: 'INVALID_FORMAT',
    };
  }
  return null;
}

/**
 * Valida que un string sea seguro (sin HTML/scripts)
 */
export function isSafeString(value: string, fieldName: string): ValidationError | null {
  if (value && /<[^>]*script|javascript:|on\w+=/i.test(value)) {
    return {
      field: fieldName,
      message: `${fieldName} contiene caracteres no permitidos`,
      code: 'UNSAFE_INPUT',
    };
  }
  return null;
}

/**
 * Valida ID numérico positivo
 */
export function isPositiveId(value: unknown, fieldName: string): ValidationError | null {
  const num = Number(value);
  if (isNaN(num) || num <= 0 || !Number.isInteger(num)) {
    return {
      field: fieldName,
      message: `${fieldName} debe ser un ID numérico positivo`,
      code: 'INVALID_ID',
    };
  }
  return null;
}

/**
 * Valida page number (>= 1)
 */
export function isValidPage(value: unknown, fieldName: string): ValidationError | null {
  const num = Number(value);
  if (isNaN(num) || num < 1) {
    return {
      field: fieldName,
      message: `${fieldName} debe ser 1 o mayor`,
      code: 'INVALID_PAGE',
    };
  }
  return null;
}

/**
 * Valida per_page (entre 1 y 100)
 */
export function isValidPerPage(value: unknown, fieldName: string): ValidationError | null {
  const num = Number(value);
  if (isNaN(num) || num < 1 || num > 100) {
    return {
      field: fieldName,
      message: `${fieldName} debe estar entre 1 y 100`,
      code: 'INVALID_PER_PAGE',
    };
  }
  return null;
}

/**
 * Valida status de WooCommerce
 */
export function isValidWooStatus(value: string, fieldName: string): ValidationError | null {
  const validStatuses = [
    'pending', 'processing', 'on-hold', 'completed', 'cancelled',
    'refunded', 'failed', 'trash', 'publish', 'draft', 'private'
  ];
  return isEnum(value, validStatuses as unknown as string[], fieldName);
}

/**
 * Valida tipo de voucher (Rapifac)
 */
export function isValidVoucherType(value: string, fieldName: string): ValidationError | null {
  const validTypes = ['FACTURA', 'BOLETA', 'NOTA_CREDITO', 'NOTA_DEBITO'];
  return isEnum(value, validTypes, fieldName);
}

/**
 * Clase para validar objetos complejos
 */
export class Validator<T extends Record<string, unknown>> {
  private errors: ValidationError[] = [];

  constructor(private data: T) {}

  field<K extends string>(key: K): FieldValidator<T[K]> {
    return new FieldValidator(this.data, key, this.errors);
  }

  validate(): ValidationResult {
    return {
      valid: this.errors.length === 0,
      errors: this.errors,
    };
  }

  getErrors(): ValidationError[] {
    return this.errors;
  }
}

class FieldValidator<T> {
  constructor(
    private data: Record<string, unknown>,
    private key: string,
    private errors: ValidationError[]
  ) {}

  required(message?: string): this {
    const value = this.data[this.key];
    if (value === null || value === undefined || value === '') {
      this.errors.push({
        field: String(this.key),
        message: message || `${String(this.key)} es requerido`,
        code: 'REQUIRED',
      });
    }
    return this;
  }

  minLength(min: number): this {
    const value = this.data[this.key];
    if (typeof value === 'string' && value.length < min) {
      this.errors.push({
        field: String(this.key),
        message: `${String(this.key)} debe tener al menos ${min} caracteres`,
        code: 'MIN_LENGTH',
      });
    }
    return this;
  }

  maxLength(max: number): this {
    const value = this.data[this.key];
    if (typeof value === 'string' && value.length > max) {
      this.errors.push({
        field: String(this.key),
        message: `${String(this.key)} debe tener máximo ${max} caracteres`,
        code: 'MAX_LENGTH',
      });
    }
    return this;
  }

  isEmail(): this {
    const value = this.data[this.key];
    if (typeof value === 'string' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      this.errors.push({
        field: String(this.key),
        message: `${String(this.key)} debe ser un email válido`,
        code: 'INVALID_EMAIL',
      });
    }
    return this;
  }

  isNumber(): this {
    const value = this.data[this.key];
    if (value !== null && value !== undefined && isNaN(Number(value))) {
      this.errors.push({
        field: String(this.key),
        message: `${String(this.key)} debe ser numérico`,
        code: 'NOT_NUMBER',
      });
    }
    return this;
  }

  min(min: number): this {
    const value = Number(this.data[this.key]);
    if (!isNaN(value) && value < min) {
      this.errors.push({
        field: String(this.key),
        message: `${String(this.key)} debe ser al menos ${min}`,
        code: 'MIN_VALUE',
      });
    }
    return this;
  }

  max(max: number): this {
    const value = Number(this.data[this.key]);
    if (!isNaN(value) && value > max) {
      this.errors.push({
        field: String(this.key),
        message: `${String(this.key)} debe ser máximo ${max}`,
        code: 'MAX_VALUE',
      });
    }
    return this;
  }

  matches(pattern: RegExp, message?: string): this {
    const value = this.data[this.key];
    if (typeof value === 'string' && !pattern.test(value)) {
      this.errors.push({
        field: String(this.key),
        message: message || `${String(this.key)} tiene formato inválido`,
        code: 'INVALID_FORMAT',
      });
    }
    return this;
  }

  isEnum(allowed: string[]): this {
    const value = this.data[this.key];
    if (value && !allowed.includes(String(value))) {
      this.errors.push({
        field: String(this.key),
        message: `${String(this.key)} debe ser uno de: ${allowed.join(', ')}`,
        code: 'INVALID_ENUM',
      });
    }
    return this;
  }

  isSafe(): this {
    const value = this.data[this.key];
    if (typeof value === 'string' && /<[^>]*script|javascript:|on\w+=/i.test(value)) {
      this.errors.push({
        field: String(this.key),
        message: `${String(this.key)} contiene caracteres no permitidos`,
        code: 'UNSAFE_INPUT',
      });
    }
    return this;
  }
}
