// ─── Scan Response Types ──────────────────────────────────────────────────────

export interface IssuerData {
  name: string | null;
  ruc: string | null;
  address: string | null;
}

export interface CustomerData {
  name: string | null;
  ruc: string | null;
  address: string | null;
}

export interface ItemData {
  description: string;
  quantity: number | null;
  unit_price: number | null;
  total: number | null;
}

export interface PaymentData {
  payment_method: string | null;
  amount_words: string | null;
  gross_amount: number | null;
  retention_ir: number | null;
  net_amount: number | null;
  currency: string | null;
}

export interface TotalsData {
  taxable_amount: number | null;
  inafect_amount: number | null;
  exempt_amount: number | null;
  free_amount: number | null;
  igv: number | null;
  isc: number | null;
  icbper: number | null;
  other_taxes: number | null;
  other_charges: number | null;
  discounts: number | null;
  grand_total: number | null;
}

// Honorarios
export interface ScannedHonorariosResponse {
  success: boolean;
  document_type: 'RECIBO_POR_HONORARIOS';
  document_number: string | null;
  issue_date: string | null;
  currency: string | null;
  issuer: IssuerData | null;
  customer: CustomerData | null;
  payment: PaymentData | null;
  service: { description: string } | null;
  metadata: { is_scanned_image: boolean; source: string };
}

// Factura
export interface ScannedFacturaResponse {
  success: boolean;
  document_type: 'FACTURA';
  document_number: string | null;
  issue_date: string | null;
  due_date: string | null;
  currency: string | null;
  issuer: IssuerData | null;
  customer: CustomerData | null;
  items: ItemData[];
  totals: TotalsData | null;
  amount_in_words: string | null;
  metadata: {
    is_scanned_image: boolean;
    source: string;
    authorization_date?: string;
  };
}

// Boleta
export interface ScannedBoletaResponse {
  success: boolean;
  document_type: 'BOLETA';
  document_number: string | null;
  issue_date: string | null;
  currency: string | null;
  issuer: IssuerData | null;
  customer: CustomerData | null;
  items: ItemData[];
  totals: { igv: number | null; grand_total: number | null } | null;
  metadata: { is_scanned_image: boolean; source: string };
}

// ─── Bank Statement ────────────────────────────────────────────────────────────

export interface BankStatementLine {
  date: string;
  description: string;
  reference: string | null;
  charge: number | null;
  deposit: number | null;
  glossary_key: string | null;
  glossary_description: string | null;
  hour: string | null;
  med: string | null;
  tipo: string | null;
  place: string | null;
  origen: string | null;
  num_op: string | null;
  suc_age: string | null;
  balance: number | null;
}

export interface BankStatementScanResponse {
  file_url: string;
  file_path: string;
  is_bank_statement: true;
  scan: {
    success: boolean;
    document_type: 'ESTADO_CUENTA_BCP';
    document_number: string | null;
    period: string | null;
    period_full: string | null;
    opening_balance: number | null;
    closing_balance: number | null;
    lines: BankStatementLine[];
    metadata: { is_scanned_image: boolean; source: string };
  };
}

export interface BatchStoreLine {
  date: string;
  description: string;
  amount: number;
  reference?: string;
  glossary_key?: string;
  glossary_description?: string;
  hour?: string;
  med?: string;
  tipo?: string;
  place?: string;
  balance?: number;
}

export interface ScanBatchStorePayload {
  file_path: string;
  supplier_id: number;
  lines: BatchStoreLine[];
  period?: string;
  period_full?: string;
  opening_balance?: number;
  closing_balance?: number;
}

export interface ScanBatchStoreResponse {
  success: boolean;
  expense: import('./operations').Expense;
  count: number;
}

export type ScanFileResponse =
  | (Omit<ScanApiResponse, 'scan'> & { scan: ScannedDataResponse; is_bank_statement?: false })
  | BankStatementScanResponse;

export function isBankStatementResponse(
  res: ScanFileResponse,
): res is BankStatementScanResponse {
  return 'is_bank_statement' in res && res.is_bank_statement === true;
}

export type ScannedDataResponse =
  | ScannedHonorariosResponse
  | ScannedFacturaResponse
  | ScannedBoletaResponse;

// Full scan endpoint response
export interface ScanApiResponse {
  file_url: string;
  file_path: string;
  scan: ScannedDataResponse;
  expense: import('./operations').Expense & {
    scan_data: Record<string, unknown> | null;
  };
}
