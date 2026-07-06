'use client';

import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import type { SalesExportRow } from './types';
import { EXPORT_COLUMNS } from './constants';

const COLORS = {
  headerBg:     '08190F',
  headerFont:   'A3E635',
  titleBg:      '0A1F12',
  titleFont:    'A3E635',
  accentStripe: '0F2A18',
  border:       '1E5C2E',
  accent:       '163D22',
  totalBg:      '061510',
  subText:      '78C850',
};

const CURRENCY_KEYS = new Set<keyof SalesExportRow>([
  'subtotal', 'shippingCost', 'taxAmount', 'discountAmount', 'total',
]);

const WRAP_KEYS = new Set<keyof SalesExportRow>([
  'productsDetail', 'servicesDetail', 'shippingAddress', 'customerNotes', 'itemsSummary',
]);

const CENTER_KEYS = new Set<keyof SalesExportRow>([
  'orderType', 'orderStatusLabel', 'totalQuantity', 'paymentMethod', 'paymentStatusLabel', 'shippingType',
]);

function guessWidth(key: string, label: string): number {
  const widths: Record<string, number> = {
    orderNumber: 18, orderType: 10, orderStatusLabel: 14,
    customerName: 26, customerEmail: 30, customerPhone: 16,
    customerDocumentNumber: 18, storeName: 22, itemsSummary: 34,
    totalQuantity: 10, productsDetail: 55, servicesDetail: 55,
    subtotal: 14, shippingCost: 14, taxAmount: 14,
    discountAmount: 14, total: 14, couponCode: 14,
    paymentMethod: 18, paymentStatusLabel: 14, paidAt: 16,
    shippingType: 14, carrier: 20, trackingNumber: 20,
    shippingAddress: 38, shippingCity: 18, shippingPostalCode: 12,
    shippingNotes: 32, customerNotes: 38, createdAt: 16, updatedAt: 16,
  };
  return widths[key] ?? Math.max(label.length + 4, 14);
}

async function fetchImageAsBase64(url: string): Promise<ArrayBuffer | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    return await res.arrayBuffer();
  } catch {
    return null;
  }
}

export async function exportSalesRowsToExcel(
  rows: SalesExportRow[],
  options?: {
    logoUrl?: string;
    companyName?: string;
    reportTitle?: string;
  }
): Promise<void> {
  if (rows.length === 0) return;

  const {
    logoUrl     = '/img/logo.png',   // ← con / al inicio
    companyName = 'Lyrium Market',
    reportTitle = 'Reporte de Ventas',
  } = options ?? {};

  const wb = new ExcelJS.Workbook();
  wb.creator = companyName;
  wb.created = new Date();

  const ws = wb.addWorksheet('Ventas', {
    pageSetup: { paperSize: 9, orientation: 'landscape', fitToPage: true, fitToWidth: 1 },
  });

  const colCount = EXPORT_COLUMNS.length;

  // ── 1. FILAS DE TÍTULO ────────────────────────────────────────────────────
  ws.addRow([]);
  ws.addRow([]);
  ws.addRow([]);

  ws.mergeCells(1, 3, 1, colCount);
  const titleCell = ws.getCell('C1');
  titleCell.value     = `${companyName} — ${reportTitle}`;
  titleCell.font      = { name: 'Arial', bold: true, size: 16, color: { argb: 'FF' + COLORS.titleFont } };
  titleCell.fill      = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + COLORS.titleBg } };
  titleCell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };

  ws.mergeCells(2, 3, 2, colCount);
  const subtitleCell = ws.getCell('C2');
  const dateLabel = new Date().toLocaleDateString('es-PE', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });
  subtitleCell.value     = `Generado el ${dateLabel}  ·  ${rows.length} orden${rows.length !== 1 ? 'es' : ''}`;
  subtitleCell.font      = { name: 'Arial', size: 10, italic: true, color: { argb: 'FF' + COLORS.subText } };
  subtitleCell.fill      = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + COLORS.titleBg } };
  subtitleCell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };

  ws.mergeCells(3, 1, 3, colCount);
  ws.getCell('A3').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + COLORS.accent } };

  ws.getRow(1).height = 36;
  ws.getRow(2).height = 20;
  ws.getRow(3).height = 4;

  ws.getColumn(1).width = 6;
  ws.getColumn(2).width = 14;

  ['A1', 'A2', 'B1', 'B2'].forEach((addr) => {
    ws.getCell(addr).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + COLORS.titleBg } };
  });

  // ── 2. LOGO ───────────────────────────────────────────────────────────────
  const logoBuffer = await fetchImageAsBase64(logoUrl);
  if (logoBuffer) {
    const imgExt = logoUrl.toLowerCase().endsWith('.png') ? 'png' : 'jpeg';
    const imgId = wb.addImage({ buffer: logoBuffer as any, extension: imgExt });
    ws.addImage(imgId, {
      tl: { col: 0, row: 0 } as any,
      br: { col: 2, row: 3 } as any,
    });
  }

  // ── 3. COLUMNAS + HEADERS EN FILA 4 ──────────────────────────────────────
  ws.columns = EXPORT_COLUMNS.map((c) => ({
    key:   c.key,
    width: guessWidth(c.key, c.label),
  })) as ExcelJS.Column[];

  const headerRow = ws.getRow(4);
  headerRow.height = 26;
  EXPORT_COLUMNS.forEach((c, i) => {
    const cell     = headerRow.getCell(i + 1);
    cell.value     = c.label;
    cell.font      = { name: 'Arial', bold: true, size: 10, color: { argb: 'FF' + COLORS.headerFont } };
    cell.fill      = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + COLORS.headerBg } };
    cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    cell.border    = { bottom: { style: 'medium', color: { argb: 'FF' + COLORS.border } } };
  });
  headerRow.commit();

  // ── 4. DATOS desde fila 5 ────────────────────────────────────────────────
  const dataStartRow = 5;

  rows.forEach((r, rowIndex) => {
    const dataRow = ws.getRow(rowIndex + dataStartRow);
    EXPORT_COLUMNS.forEach((c, colIndex) => {
      dataRow.getCell(colIndex + 1).value = (r as any)[c.key] ?? null;
    });

    const isEven = rowIndex % 2 === 0;
    dataRow.eachCell({ includeEmpty: true }, (cell) => {
      if (isEven) {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + COLORS.accentStripe } };
      }
      cell.border = { bottom: { style: 'hair', color: { argb: 'FF' + COLORS.border } } };
      cell.font   = { name: 'Arial', size: 9 };
    });

    dataRow.height = 18;
    dataRow.commit();
  });

  // ── 5. FORMATOS POR COLUMNA ───────────────────────────────────────────────
  EXPORT_COLUMNS.forEach((c) => {
    const col = ws.getColumn(c.index + 1);
    const key = c.key;

    if (CURRENCY_KEYS.has(key)) {
      col.numFmt    = '"S/ "#,##0.00';
      col.alignment = { horizontal: 'right', vertical: 'middle' };
    }
    if (WRAP_KEYS.has(key)) {
      col.alignment = { ...(col.alignment ?? {}), wrapText: true, vertical: 'top' };
    }
    if (CENTER_KEYS.has(key)) {
      col.alignment = { ...(col.alignment ?? {}), horizontal: 'center', vertical: 'middle' };
    }
  });

  // ── 6. FREEZE + AUTOFILTER ────────────────────────────────────────────────
  ws.views = [{ state: 'frozen', ySplit: 4 }];

  const lastDataRow = dataStartRow + rows.length - 1;   // ← definido aquí
  ws.autoFilter = {
    from: { row: 4, column: 1 },
    to:   { row: lastDataRow, column: colCount },
  };

  // ── 7. EXPORTAR ───────────────────────────────────────────────────────────
  const buffer = await wb.xlsx.writeBuffer();
  const blob   = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  saveAs(blob, `ventas-${new Date().toISOString().slice(0, 10)}.xlsx`);
}