// ─── Payloads ────────────────────────────────────────────────────────────────

export interface ChangePasswordPayload {
  current_password: string;
  password: string;
  password_confirmation: string;
}

// ─── Responses ───────────────────────────────────────────────────────────────

export interface ChangePasswordSuccessResponse {
  message: string;
}

export interface ChangePasswordErrorResponse {
  message: string;
  errors?: {
    actual?: string[];
    nueva?: string[];
  };
}

export type ChangePasswordResult =
  | { success: true; message: string }
  | { success: false; message: string; errors?: ChangePasswordErrorResponse['errors'] };

// ─── Form State ──────────────────────────────────────────────────────────────

export interface PasswordFormData {
  actual: string;
  nueva: string;
  confirmar: string;
}

export interface PasswordVisibility {
  actual: boolean;
  nueva: boolean;
  confirmar: boolean;
}

export interface PasswordRequirements {
  length: boolean;
  uppercase: boolean;
  lowercase: boolean;
  number: boolean;
  symbol: boolean;
}