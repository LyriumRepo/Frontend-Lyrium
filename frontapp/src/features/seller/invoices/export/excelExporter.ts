'use client';

import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import type { Voucher, InvoiceKPIs } from '../types';

const C = {
    darkBg:     '0B1A10',
    green:      '10B981',
    greenDark:  '064E3B',
    greenMid:   '047857',
    greenLight: 'ECFDF5',
    greenBorder:'A7F3D0',
    amber:      'F59E0B',
    rose:       'F43F5E',
    teal:       '06B6D4',
    indigo:     '6366F1',
    white:      'FFFFFF',
    gray50:     'F9FAFB',
    gray100:    'F3F4F6',
    gray200:    'E5E7EB',
    gray400:    '9CA3AF',
    gray600:    '4B5563',
    gray800:    '1F2937',
};

const STATUS_LABEL: Record<string, string> = {
    ACCEPTED:      'Aceptado',
    SENT_WAIT_CDR: 'Pendiente CDR',
    REJECTED:      'Rechazado',
    OBSERVED:      'Observado',
    DRAFT:         'Borrador',
};

const STATUS_COLOR: Record<string, string> = {
    ACCEPTED:      'FF10B981',
    SENT_WAIT_CDR: 'FFF59E0B',
    REJECTED:      'FFF43F5E',
    OBSERVED:      'FFF59E0B',
    DRAFT:         'FF9CA3AF',
};

function fmtDate(d: string): string {
    if (!d) return '—';
    try { return new Date(d).toLocaleDateString('es-PE', { day:'2-digit', month:'2-digit', year:'numeric' }); }
    catch { return d; }
}

function fmtCommission(rate: number | null | undefined, amount: number | null | undefined): string {
    if (rate == null || amount == null) return '—';
    const pct = rate > 1 ? Math.round(rate) : Math.round(rate * 100);
    return `${pct}% · S/ ${amount.toFixed(2)}`;
}

function border(style: ExcelJS.BorderStyle = 'thin'): Partial<ExcelJS.Borders> {
    const s = { style, color: { argb: 'FF' + C.gray200 } };
    return { top: s, left: s, bottom: s, right: s };
}

export async function exportInvoicesToExcel(vouchers: Voucher[], kpis?: InvoiceKPIs | null): Promise<void> {
    if (vouchers.length === 0) return;

    const wb = new ExcelJS.Workbook();
    wb.creator = 'Lyrium BioMarketplace';
    wb.created = new Date();

    // ── Hoja 1: Resumen ────────────────────────────────────────────────────
    const wsSummary = wb.addWorksheet('Resumen', {
        pageSetup: { paperSize: 9, orientation: 'portrait' },
        properties: { tabColor: { argb: 'FF' + C.green } },
    });

    // Branding
    wsSummary.mergeCells('A1:F1');
    const t1 = wsSummary.getCell('A1');
    t1.value = 'LYRIUM BIOMARKETPLACE';
    t1.font  = { name: 'Arial', bold: true, size: 16, color: { argb: 'FF' + C.green } };
    t1.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + C.darkBg } };
    t1.alignment = { vertical: 'middle', horizontal: 'left', indent: 2 };
    wsSummary.getRow(1).height = 38;

    wsSummary.mergeCells('A2:F2');
    const t2 = wsSummary.getCell('A2');
    t2.value = 'Mis Comprobantes Electrónicos — Panel Vendedor';
    t2.font  = { name: 'Arial', size: 11, color: { argb: 'FFA7F3D0' } };
    t2.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + C.darkBg } };
    t2.alignment = { vertical: 'middle', horizontal: 'left', indent: 2 };
    wsSummary.getRow(2).height = 22;

    wsSummary.mergeCells('A3:F3');
    const t3 = wsSummary.getCell('A3');
    t3.value = `Generado el ${new Date().toLocaleString('es-PE')}   ·   ${vouchers.length} comprobantes`;
    t3.font  = { name: 'Arial', size: 9, italic: true, color: { argb: 'FF' + C.gray400 } };
    t3.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + C.greenDark } };
    t3.alignment = { vertical: 'middle', horizontal: 'left', indent: 2 };
    wsSummary.getRow(3).height = 18;

    wsSummary.mergeCells('A4:F4');
    wsSummary.getCell('A4').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + C.green } };
    wsSummary.getRow(4).height = 3;

    // KPIs
    const totalMonto      = vouchers.reduce((s, v) => s + (v.order_total ?? v.amount), 0);
    const totalComisiones = vouchers.reduce((s, v) => s + (v.commission_amount ?? 0), 0);
    const netoVendedor    = totalMonto - totalComisiones;
    const aceptados       = vouchers.filter(v => v.sunat_status === 'ACCEPTED').length;
    const rechazados      = vouchers.filter(v => v.sunat_status === 'REJECTED' || v.sunat_status === 'OBSERVED').length;

    wsSummary.addRow([]);
    const kpiHeader = wsSummary.addRow(['RESUMEN DE MI FACTURACIÓN']);
    kpiHeader.getCell(1).font = { name: 'Arial', bold: true, size: 10, color: { argb: 'FF' + C.gray600 } };
    kpiHeader.height = 22;

    const kpiData: Array<[string, string | number, string]> = [
        ['Total Facturado (mes actual)',   kpis ? `S/ ${kpis.totalFacturado.toFixed(2)}`    : '—',                     'FF' + C.green  ],
        ['Total Monto (comprobantes)',     `S/ ${totalMonto.toFixed(2)}`,                                               'FF' + C.teal   ],
        ['Comisión Lyrium descontada',     `S/ ${totalComisiones.toFixed(2)}`,                                          'FF' + C.amber  ],
        ['Neto a mi favor',               `S/ ${netoVendedor.toFixed(2)}`,                                             'FF' + C.indigo ],
        ['Tasa de éxito SUNAT',           kpis ? `${kpis.successRate.toFixed(1)}%`          : '—',                     'FF' + C.green  ],
        ['Comprobantes aceptados',         String(aceptados),                                                            'FF' + C.green  ],
        ['Observados / Rechazados',        String(rechazados),                                                           'FF' + C.rose   ],
        ['Total comprobantes emitidos',    String(vouchers.length),                                                      'FF' + C.teal   ],
    ];

    kpiData.forEach(([label, value, color]) => {
        const row = wsSummary.addRow([label, value]);
        row.getCell(1).font = { name: 'Arial', size: 9, color: { argb: 'FF' + C.gray600 } };
        row.getCell(2).font = { name: 'Arial', bold: true, size: 10, color: { argb: color } };
        row.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + C.gray50 } };
        row.getCell(2).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + C.gray50 } };
        row.getCell(1).border = border('hair');
        row.getCell(2).border = border('hair');
        row.height = 20;
    });

    wsSummary.getColumn('A').width = 36;
    wsSummary.getColumn('B').width = 26;

    // ── Hoja 2: Comprobantes ───────────────────────────────────────────────
    const wsDetail = wb.addWorksheet('Comprobantes', {
        pageSetup: { paperSize: 9, orientation: 'portrait', fitToPage: true, fitToWidth: 1 },
        properties: { tabColor: { argb: 'FF' + C.greenMid } },
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
    dTitle.font  = { name: 'Arial', bold: true, size: 13, color: { argb: 'FF' + C.white } };
    dTitle.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + C.darkBg } };
    dTitle.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
    wsDetail.getRow(1).height = 28;

    wsDetail.mergeCells(2, 1, 2, COLS.length);
    const dSub = wsDetail.getCell('A2');
    dSub.value = `Generado: ${new Date().toLocaleString('es-PE')}   ·   ${vouchers.length} registros`;
    dSub.font  = { name: 'Arial', size: 9, italic: true, color: { argb: 'FFA7F3D0' } };
    dSub.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + C.greenDark } };
    dSub.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
    wsDetail.getRow(2).height = 18;

    wsDetail.columns = COLS.map(c => ({ key: c.key, width: c.width })) as ExcelJS.Column[];

    // Header row
    const hRow = wsDetail.getRow(3);
    hRow.height = 26;
    COLS.forEach((c, i) => {
        const cell = hRow.getCell(i + 1);
        cell.value = c.header;
        cell.font  = { name: 'Arial', bold: true, size: 9, color: { argb: 'FF' + C.white } };
        cell.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + C.darkBg } };
        cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
        cell.border = { bottom: { style: 'medium', color: { argb: 'FF' + C.green } } };
    });
    hRow.commit();

    // Data rows
    vouchers.forEach((v, idx) => {
        const row = wsDetail.addRow({
            type:       v.type,
            series:     `${v.series}-${v.number}`,
            store:      v.store_name || '—',
            amount:     v.order_total ?? v.amount,
            commission: fmtCommission(v.commission_rate, v.commission_amount),
            status:     STATUS_LABEL[v.sunat_status] ?? v.sunat_status,
            date:       fmtDate(v.emission_date),
        });

        row.getCell('amount').numFmt    = '"S/ "#,##0.00';
        row.getCell('amount').alignment = { horizontal: 'right', vertical: 'middle' };
        row.getCell('commission').alignment = { horizontal: 'center', vertical: 'middle' };
        row.getCell('series').alignment = { horizontal: 'center', vertical: 'middle' };
        row.getCell('type').alignment   = { horizontal: 'center', vertical: 'middle' };
        row.getCell('date').alignment   = { horizontal: 'center', vertical: 'middle' };

        const statusColor = STATUS_COLOR[v.sunat_status];
        if (statusColor) {
            row.getCell('status').font = { name: 'Arial', bold: true, size: 9, color: { argb: statusColor } };
        }

        const fillColor = idx % 2 === 0 ? 'FF' + C.gray50 : 'FF' + C.white;
        row.eachCell({ includeEmpty: true }, cell => {
            if (!cell.font?.bold) cell.font = { name: 'Arial', size: 9 };
            cell.fill   = { type: 'pattern', pattern: 'solid', fgColor: { argb: fillColor } };
            cell.border = border('hair');
        });

        row.height = 18;
        row.commit();
    });

    // Totals row
    const totalRow = wsDetail.addRow({
        type:       `TOTAL (${vouchers.length})`,
        amount:     totalMonto,
        commission: `Comisión: S/ ${totalComisiones.toFixed(2)}  ·  Neto: S/ ${netoVendedor.toFixed(2)}`,
    });
    totalRow.getCell('type').font       = { name: 'Arial', bold: true, size: 9, color: { argb: 'FF' + C.green } };
    totalRow.getCell('amount').font     = { name: 'Arial', bold: true, size: 9, color: { argb: 'FF' + C.green } };
    totalRow.getCell('amount').numFmt   = '"S/ "#,##0.00';
    totalRow.getCell('commission').font = { name: 'Arial', bold: true, size: 9, color: { argb: 'FF' + C.amber } };
    totalRow.eachCell({ includeEmpty: true }, cell => {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + C.darkBg } };
        cell.border = border();
    });
    totalRow.height = 22;
    totalRow.commit();

    wsDetail.views = [{ state: 'frozen', ySplit: 3 }];
    wsDetail.autoFilter = { from: { row: 3, column: 1 }, to: { row: 3 + vouchers.length, column: COLS.length } };

    const buffer = await wb.xlsx.writeBuffer();
    saveAs(
        new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }),
        `mis-comprobantes-${new Date().toISOString().slice(0, 10)}.xlsx`
    );
}
