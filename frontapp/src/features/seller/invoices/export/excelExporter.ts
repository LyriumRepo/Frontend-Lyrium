'use client';

import type * as ExcelJS from 'exceljs';
import type { Voucher, InvoiceKPIs } from '../types';
import {
    EXCEL_COLORS,
    EXCEL_STATUS_COLORS,
    excelBorderHair,
    styleExcelTitleCell,
    styleExcelSubtitleCell,
    styleExcelAccentBar,
    styleExcelHeaderCell,
    styleExcelDataRow,
    styleExcelTotalRow,
} from '@/shared/lib/excel/excelTheme';

// Colores semánticos de estado (se mantienen para legibilidad)
const STATUS_LABEL: Record<string, string> = {
    ACCEPTED:      'Aceptado',
    SENT_WAIT_CDR: 'Pendiente CDR',
    REJECTED:      'Rechazado',
    OBSERVED:      'Observado',
    DRAFT:         'Borrador',
};

const STATUS_COLOR: Record<string, string> = {
    ACCEPTED:      EXCEL_STATUS_COLORS.success,
    SENT_WAIT_CDR: EXCEL_STATUS_COLORS.warning,
    REJECTED:      EXCEL_STATUS_COLORS.danger,
    OBSERVED:      EXCEL_STATUS_COLORS.warning,
    DRAFT:         EXCEL_STATUS_COLORS.neutral,
};

function fmtDate(d: string): string {
    if (!d) return '—';
    try { return new Date(d).toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' }); }
    catch { return d; }
}

function fmtCommission(rate: number | null | undefined, amount: number | null | undefined): string {
    if (rate == null || amount == null) return '—';
    const pct = rate > 1 ? Math.round(rate) : Math.round(rate * 100);
    return `${pct}% · S/ ${amount.toFixed(2)}`;
}

export async function exportInvoicesToExcel(vouchers: Voucher[], kpis?: InvoiceKPIs | null): Promise<void> {
    const [{ default: ExcelJS }, { saveAs }] = await Promise.all([
        import('exceljs'),
        import('file-saver'),
    ]);
    if (vouchers.length === 0) return;

    const wb = new ExcelJS.Workbook();
    wb.creator = 'Lyrium BioMarketplace';
    wb.created = new Date();

    // ══════════════════════════════════════════════════════════════════════
    // HOJA 1: Resumen
    // ══════════════════════════════════════════════════════════════════════
    const wsSummary = wb.addWorksheet('Resumen', {
        pageSetup: { paperSize: 9, orientation: 'portrait' },
        properties: { tabColor: { argb: 'FF' + EXCEL_COLORS.headerBg } },
    });

    // ── Branding header ──────────────────────────────────────────────────
    wsSummary.mergeCells('A1:F1');
    const h1 = wsSummary.getCell('A1');
    h1.value = 'LYRIUM BIOMARKETPLACE';
    styleExcelTitleCell(h1, 16);
    wsSummary.getRow(1).height = 38;

    wsSummary.mergeCells('A2:F2');
    const h2 = wsSummary.getCell('A2');
    h2.value = 'Mis Comprobantes Electrónicos — Panel Vendedor';
    h2.font  = { name: 'Arial', size: 11, color: { argb: 'FF' + EXCEL_COLORS.subText } };
    h2.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + EXCEL_COLORS.titleBg } };
    h2.alignment = { vertical: 'middle', horizontal: 'left', indent: 2 };
    wsSummary.getRow(2).height = 22;

    wsSummary.mergeCells('A3:F3');
    const h3 = wsSummary.getCell('A3');
    h3.value = `Generado el ${new Date().toLocaleString('es-PE')}   ·   ${vouchers.length} comprobante${vouchers.length !== 1 ? 's' : ''}`;
    styleExcelSubtitleCell(h3);
    wsSummary.getRow(3).height = 18;

    // Accent bar
    wsSummary.mergeCells('A4:F4');
    styleExcelAccentBar(wsSummary.getCell('A4'));
    wsSummary.getRow(4).height = 4;

    // ── KPIs ─────────────────────────────────────────────────────────────
    const totalMonto      = vouchers.reduce((s, v) => s + v.amount, 0);
    const totalComisiones = vouchers.reduce((s, v) => s + (v.commission_amount ?? 0), 0);
    const netoVendedor    = totalMonto - totalComisiones;
    const aceptados       = vouchers.filter(v => v.sunat_status === 'ACCEPTED').length;
    const rechazados      = vouchers.filter(v => v.sunat_status === 'REJECTED' || v.sunat_status === 'OBSERVED').length;

    wsSummary.addRow([]);
    const kpiHeader = wsSummary.addRow(['RESUMEN DE MI FACTURACIÓN']);
    kpiHeader.getCell(1).font = { name: 'Arial', bold: true, size: 10, color: { argb: 'FF' + EXCEL_COLORS.headerBg } };
    kpiHeader.height = 22;

    const kpiData: Array<[string, string]> = [
        ['Total Facturado (mes actual)',   kpis ? `S/ ${kpis.totalFacturado.toFixed(2)}` : '—'                 ],
        ['Total Monto (comprobantes)',     `S/ ${totalMonto.toFixed(2)}`                                        ],
        ['Comisión Lyrium descontada',     `S/ ${totalComisiones.toFixed(2)}`                                   ],
        ['Neto a mi favor',               `S/ ${netoVendedor.toFixed(2)}`                                      ],
        ['Tasa de éxito SUNAT',           kpis ? `${kpis.successRate.toFixed(1)}%` : '—'                      ],
        ['Comprobantes aceptados',         String(aceptados)                                                    ],
        ['Observados / Rechazados',        String(rechazados)                                                   ],
        ['Total comprobantes emitidos',    String(vouchers.length)                                              ],
    ];

    kpiData.forEach(([label, value], idx) => {
        const row = wsSummary.addRow([label, value]);
        row.getCell(1).font = { name: 'Arial', size: 9, color: { argb: 'FF' + EXCEL_COLORS.bodyFont } };
        row.getCell(2).font = { name: 'Arial', bold: true, size: 10, color: { argb: 'FF' + EXCEL_COLORS.totalFont } };
        const stripeColor = idx % 2 === 0 ? EXCEL_COLORS.stripeBg : EXCEL_COLORS.bodyBg;
        row.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + stripeColor } };
        row.getCell(2).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + stripeColor } };
        row.getCell(1).border = excelBorderHair();
        row.getCell(2).border = excelBorderHair();
        row.height = 20;
    });

    wsSummary.getColumn('A').width = 36;
    wsSummary.getColumn('B').width = 26;

    // ══════════════════════════════════════════════════════════════════════
    // HOJA 2: Comprobantes
    // ══════════════════════════════════════════════════════════════════════
    const wsDetail = wb.addWorksheet('Comprobantes', {
        pageSetup: { paperSize: 9, orientation: 'portrait', fitToPage: true, fitToWidth: 1 },
        properties: { tabColor: { argb: 'FF' + EXCEL_COLORS.accent } },
    });

    const COLS = [
        { header: 'Tipo',         key: 'type',       width: 14 },
        { header: 'Serie-Código', key: 'series',     width: 20 },
        { header: 'Tienda',       key: 'store',      width: 30 },
        { header: 'Monto',        key: 'amount',     width: 16 },
        { header: 'Comisión',     key: 'commission', width: 24 },
        { header: 'Estado SUNAT', key: 'status',     width: 18 },
        { header: 'Fecha',        key: 'date',       width: 16 },
    ];

    // Header branding
    wsDetail.mergeCells(1, 1, 1, COLS.length);
    const dTitle = wsDetail.getCell('A1');
    dTitle.value = 'Lyrium BioMarketplace — Mis Comprobantes Electrónicos';
    styleExcelTitleCell(dTitle);
    wsDetail.getRow(1).height = 28;

    wsDetail.mergeCells(2, 1, 2, COLS.length);
    const dSub = wsDetail.getCell('A2');
    dSub.value = `Generado: ${new Date().toLocaleString('es-PE')}   ·   ${vouchers.length} registros`;
    styleExcelSubtitleCell(dSub);
    wsDetail.getRow(2).height = 18;

    // Accent bar
    wsDetail.mergeCells(3, 1, 3, COLS.length);
    styleExcelAccentBar(wsDetail.getCell('A3'));
    wsDetail.getRow(3).height = 4;

    wsDetail.columns = COLS.map(c => ({ key: c.key, width: c.width })) as ExcelJS.Column[];

    // Header row (fila 4)
    const hRow = wsDetail.getRow(4);
    hRow.height = 26;
    COLS.forEach((c, i) => {
        const cell = hRow.getCell(i + 1);
        cell.value = c.header;
        styleExcelHeaderCell(cell, { wrapText: true });
    });
    hRow.commit();

    // Data rows
    vouchers.forEach((v, idx) => {
        const row = wsDetail.addRow({
            type:       v.type,
            series:     `${v.series}-${v.number}`,
            store:      v.store_name || '—',
            amount:     v.amount,
            commission: fmtCommission(v.commission_rate, v.commission_amount),
            status:     STATUS_LABEL[v.sunat_status] ?? v.sunat_status,
            date:       fmtDate(v.emission_date),
        });

        row.getCell('amount').numFmt     = '"S/ "#,##0.00';
        row.getCell('amount').alignment  = { horizontal: 'right', vertical: 'middle' };
        row.getCell('commission').alignment = { horizontal: 'center', vertical: 'middle' };
        row.getCell('series').alignment  = { horizontal: 'center', vertical: 'middle' };
        row.getCell('type').alignment    = { horizontal: 'center', vertical: 'middle' };
        row.getCell('date').alignment    = { horizontal: 'center', vertical: 'middle' };

        const statusColor = STATUS_COLOR[v.sunat_status];
        if (statusColor) {
            row.getCell('status').font = { name: 'Arial', bold: true, size: 9, color: { argb: statusColor } };
            row.getCell('status').alignment = { horizontal: 'center', vertical: 'middle' };
        }

        styleExcelDataRow(row, idx);
        row.height = 18;
        row.commit();
    });

    // Total row
    const totalRow = wsDetail.addRow({
        type:       `TOTAL (${vouchers.length})`,
        amount:     totalMonto,
        commission: `Comisión: S/ ${totalComisiones.toFixed(2)}  ·  Neto: S/ ${netoVendedor.toFixed(2)}`,
    });
    totalRow.getCell('amount').numFmt = '"S/ "#,##0.00';
    styleExcelTotalRow(totalRow);
    totalRow.height = 22;
    totalRow.commit();

    wsDetail.views = [{ state: 'frozen', ySplit: 4 }];
    wsDetail.autoFilter = {
        from: { row: 4, column: 1 },
        to:   { row: 4 + vouchers.length, column: COLS.length },
    };

    const buffer = await wb.xlsx.writeBuffer();
    saveAs(
        new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }),
        `mis-comprobantes-${new Date().toISOString().slice(0, 10)}.xlsx`
    );
}
