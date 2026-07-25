'use client';

import type * as ExcelJS from 'exceljs';
import type { Expense } from '../types/operations';
import {
    EXCEL_COLORS,
    styleExcelTitleCell,
    styleExcelSubtitleCell,
    styleExcelAccentBar,
    styleExcelHeaderCell,
    styleExcelDataRow,
    styleExcelTotalRow,
    styleExcelSectionTitleCell,
    styleExcelKpiRow,
} from '@/shared/lib/excel/excelTheme';

function fmtDate(s: string | null | undefined): string {
    if (!s) return '—';
    try { return new Date(s).toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' }); }
    catch { return s; }
}

export async function exportExpensesToExcel(expenses: Expense[]): Promise<void> {
    const [{ default: ExcelJS }, { saveAs }] = await Promise.all([
        import('exceljs'),
        import('file-saver'),
    ]);
    if (expenses.length === 0) return;

    const wb = new ExcelJS.Workbook();
    wb.creator = 'Lyrium BioMarketplace';
    wb.created = new Date();

    // ── Hoja Resumen ──────────────────────────────────────────────────────
    const wsSummary = wb.addWorksheet('Resumen', {
        pageSetup: { paperSize: 9, orientation: 'portrait' },
        properties: { tabColor: { argb: 'FF' + EXCEL_COLORS.headerBg } },
    });

    wsSummary.mergeCells('A1:D1');
    const h1 = wsSummary.getCell('A1');
    h1.value = 'LYRIUM BIOMARKETPLACE';
    styleExcelTitleCell(h1, 16);
    wsSummary.getRow(1).height = 38;

    wsSummary.mergeCells('A2:D2');
    const h2 = wsSummary.getCell('A2');
    h2.value = 'Gestión Operativa — Panel Administrador';
    h2.font  = { name: 'Arial', size: 11, color: { argb: 'FF' + EXCEL_COLORS.subText } };
    h2.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + EXCEL_COLORS.titleBg } };
    h2.alignment = { vertical: 'middle', horizontal: 'left', indent: 2 };
    wsSummary.getRow(2).height = 22;

    wsSummary.mergeCells('A3:D3');
    const h3 = wsSummary.getCell('A3');
    h3.value = `Generado el ${new Date().toLocaleString('es-PE')}   ·   ${expenses.length} gasto${expenses.length !== 1 ? 's' : ''}`;
    styleExcelSubtitleCell(h3);
    wsSummary.getRow(3).height = 18;

    wsSummary.mergeCells('A4:D4');
    styleExcelAccentBar(wsSummary.getCell('A4'));
    wsSummary.getRow(4).height = 4;

    const total     = expenses.reduce((s, e) => s + e.amount, 0);
    const pagados   = expenses.filter(e => e.status === 'Pagado').length;
    const pendientes= expenses.filter(e => e.status === 'Pendiente').length;
    const anulados  = expenses.filter(e => e.status === 'Anulado').length;

    wsSummary.addRow([]);
    const kpiHeader = wsSummary.addRow(['RESUMEN OPERATIVO']);
    styleExcelSectionTitleCell(kpiHeader.getCell(1));
    kpiHeader.height = 22;

    const kpiData: Array<[string, string]> = [
        ['Total egresos',     `S/ ${total.toFixed(2)}`],
        ['Pagados',           String(pagados)          ],
        ['Pendientes',        String(pendientes)       ],
        ['Anulados',          String(anulados)         ],
        ['Total registros',   String(expenses.length)  ],
    ];

    kpiData.forEach(([label, value], idx) => {
        const row = wsSummary.addRow([label, value]);
        styleExcelKpiRow(row, idx);
        row.height = 20;
    });

    wsSummary.getColumn('A').width = 36;
    wsSummary.getColumn('B').width = 24;

    // ── Hoja Gastos ───────────────────────────────────────────────────────
    const wsDetail = wb.addWorksheet('Gastos', {
        pageSetup: { paperSize: 9, orientation: 'landscape', fitToPage: true, fitToWidth: 1 },
        properties: { tabColor: { argb: 'FF' + EXCEL_COLORS.accent } },
    });

    const COLS = [
        { header: 'N° Recibo',    key: 'receipt',   width: 18 },
        { header: 'Concepto',     key: 'concept',   width: 32 },
        { header: 'Tipo',         key: 'tipo',      width: 16 },
        { header: 'Monto',        key: 'amount',    width: 16 },
        { header: 'Estado',       key: 'status',    width: 14 },
        { header: 'Proveedor',    key: 'supplier',  width: 28 },
        { header: 'Tipo Prov.',   key: 'supplType', width: 16 },
        { header: 'Fecha Emis.',  key: 'issued',    width: 16 },
        { header: 'Fecha Pago',   key: 'paid',      width: 16 },
        { header: 'Registrado por',key: 'regBy',    width: 24 },
    ];

    wsDetail.mergeCells(1, 1, 1, COLS.length);
    const dTitle = wsDetail.getCell('A1');
    dTitle.value = 'Lyrium BioMarketplace — Gestión Operativa';
    styleExcelTitleCell(dTitle);
    wsDetail.getRow(1).height = 28;

    wsDetail.mergeCells(2, 1, 2, COLS.length);
    const dSub = wsDetail.getCell('A2');
    dSub.value = `Generado: ${new Date().toLocaleString('es-PE')}   ·   ${expenses.length} registros`;
    styleExcelSubtitleCell(dSub);
    wsDetail.getRow(2).height = 18;

    wsDetail.mergeCells(3, 1, 3, COLS.length);
    styleExcelAccentBar(wsDetail.getCell('A3'));
    wsDetail.getRow(3).height = 4;

    wsDetail.columns = COLS.map(c => ({ key: c.key, width: c.width })) as ExcelJS.Column[];

    const hRow = wsDetail.getRow(4);
    hRow.height = 26;
    COLS.forEach((c, i) => {
        const cell = hRow.getCell(i + 1);
        cell.value = c.header;
        styleExcelHeaderCell(cell);
    });
    hRow.commit();

    expenses.forEach((e, idx) => {
        const row = wsDetail.addRow({
            receipt:  e.receipt_number || '—',
            concept:  e.concept,
            tipo:     e.voucher_type ?? '—',
            amount:   e.amount,
            status:   e.status,
            supplier: e.supplier?.name ?? '—',
            supplType:e.supplier?.type ?? '—',
            issued:   fmtDate(e.issued_at),
            paid:     fmtDate(e.paid_at),
            regBy:    (e as any).registered_by?.name ?? '—',
        });

        row.getCell('amount').numFmt = '"S/ "#,##0.00';
        row.getCell('amount').alignment = { horizontal: 'right', vertical: 'middle' };
        ['receipt','tipo','status','supplType','issued','paid'].forEach(k => {
            row.getCell(k).alignment = { horizontal: 'center', vertical: 'middle' };
        });

        styleExcelDataRow(row, idx);
        row.height = 18;
        row.commit();
    });

    const totalRow = wsDetail.addRow({ receipt: `TOTAL (${expenses.length})`, amount: total });
    totalRow.getCell('amount').numFmt = '"S/ "#,##0.00';
    styleExcelTotalRow(totalRow);
    totalRow.height = 22;
    totalRow.commit();

    wsDetail.views = [{ state: 'frozen', ySplit: 4 }];
    wsDetail.autoFilter = {
        from: { row: 4, column: 1 },
        to:   { row: 4 + expenses.length, column: COLS.length },
    };

    const buffer = await wb.xlsx.writeBuffer();
    saveAs(
        new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }),
        `gestion-operativa-${new Date().toISOString().slice(0, 10)}.xlsx`
    );
}
