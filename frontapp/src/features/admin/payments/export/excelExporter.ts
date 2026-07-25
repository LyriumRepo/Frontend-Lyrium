'use client';

import type * as ExcelJS from 'exceljs';
import type { Transaction } from '../types/transactions';
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

const PAYMENT_LABEL: Record<string, string> = {
    paid:     'Pagado',
    pending:  'Pendiente',
    failed:   'Fallido',
    refunded: 'Reembolsado',
};

const TX_LABEL: Record<string, string> = {
    AUTHORISED: 'Autorizado',
    CAPTURED:   'Capturado',
    REFUSED:    'Rechazado',
    CANCELLED:  'Cancelado',
    PENDING:    'Pendiente',
    EXPIRED:    'Expirado',
    ERROR:      'Error',
};

function fmtDate(s: string): string {
    try { return new Date(s).toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' }); }
    catch { return s; }
}

export async function exportPaymentsToExcel(transactions: Transaction[]): Promise<void> {
    const [{ default: ExcelJS }, { saveAs }] = await Promise.all([
        import('exceljs'),
        import('file-saver'),
    ]);
    if (transactions.length === 0) return;

    const wb = new ExcelJS.Workbook();
    wb.creator = 'Lyrium BioMarketplace';
    wb.created = new Date();

    // ── Hoja Resumen ──────────────────────────────────────────────────────
    const wsSummary = wb.addWorksheet('Resumen', {
        pageSetup: { paperSize: 9, orientation: 'portrait' },
        properties: { tabColor: { argb: 'FF' + EXCEL_COLORS.headerBg } },
    });

    wsSummary.mergeCells('A1:E1');
    const h1 = wsSummary.getCell('A1');
    h1.value = 'LYRIUM BIOMARKETPLACE';
    styleExcelTitleCell(h1, 16);
    wsSummary.getRow(1).height = 38;

    wsSummary.mergeCells('A2:E2');
    const h2 = wsSummary.getCell('A2');
    h2.value = 'Gestión de Pagos Izipay — Panel Administrador';
    h2.font  = { name: 'Arial', size: 11, color: { argb: 'FF' + EXCEL_COLORS.subText } };
    h2.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + EXCEL_COLORS.titleBg } };
    h2.alignment = { vertical: 'middle', horizontal: 'left', indent: 2 };
    wsSummary.getRow(2).height = 22;

    wsSummary.mergeCells('A3:E3');
    const h3 = wsSummary.getCell('A3');
    h3.value = `Generado el ${new Date().toLocaleString('es-PE')}   ·   ${transactions.length} transacción${transactions.length !== 1 ? 'es' : ''}`;
    styleExcelSubtitleCell(h3);
    wsSummary.getRow(3).height = 18;

    wsSummary.mergeCells('A4:E4');
    styleExcelAccentBar(wsSummary.getCell('A4'));
    wsSummary.getRow(4).height = 4;

    const totalMonto    = transactions.reduce((s, t) => s + t.total, 0);
    const totalComision = transactions.reduce((s, t) => s + (t.commissionTotal ?? 0), 0);
    const pagadas       = transactions.filter(t => t.paymentStatus === 'paid').length;
    const fallidas      = transactions.filter(t => t.paymentStatus === 'failed').length;

    wsSummary.addRow([]);
    const kpiHeader = wsSummary.addRow(['RESUMEN DE PAGOS']);
    styleExcelSectionTitleCell(kpiHeader.getCell(1));
    kpiHeader.height = 22;

    const kpiData: Array<[string, string]> = [
        ['Total recaudado',       `S/ ${totalMonto.toFixed(2)}`   ],
        ['Comisión Lyrium total', `S/ ${totalComision.toFixed(2)}`],
        ['Transacciones pagadas', String(pagadas)                  ],
        ['Transacciones fallidas',String(fallidas)                 ],
        ['Total transacciones',   String(transactions.length)      ],
    ];

    kpiData.forEach(([label, value], idx) => {
        const row = wsSummary.addRow([label, value]);
        styleExcelKpiRow(row, idx);
        row.height = 20;
    });

    wsSummary.getColumn('A').width = 36;
    wsSummary.getColumn('B').width = 26;

    // ── Hoja Transacciones ────────────────────────────────────────────────
    const wsDetail = wb.addWorksheet('Transacciones', {
        pageSetup: { paperSize: 9, orientation: 'landscape', fitToPage: true, fitToWidth: 1 },
        properties: { tabColor: { argb: 'FF' + EXCEL_COLORS.accent } },
    });

    const COLS = [
        { header: 'Orden',           key: 'order',   width: 20 },
        { header: 'Fecha',           key: 'date',    width: 18 },
        { header: 'Cliente',         key: 'customer',width: 28 },
        { header: 'Tienda(s)',       key: 'stores',  width: 28 },
        { header: 'Total',           key: 'total',   width: 16 },
        { header: 'Comisión',        key: 'comm',    width: 18 },
        { header: 'Método',          key: 'method',  width: 14 },
        { header: 'Tarjeta',         key: 'card',    width: 20 },
        { header: 'Estado Pago',     key: 'pstatus', width: 16 },
        { header: 'Estado Trans.',   key: 'tstatus', width: 18 },
    ];

    wsDetail.mergeCells(1, 1, 1, COLS.length);
    const dTitle = wsDetail.getCell('A1');
    dTitle.value = 'Lyrium BioMarketplace — Gestión de Pagos Izipay';
    styleExcelTitleCell(dTitle);
    wsDetail.getRow(1).height = 28;

    wsDetail.mergeCells(2, 1, 2, COLS.length);
    const dSub = wsDetail.getCell('A2');
    dSub.value = `Generado: ${new Date().toLocaleString('es-PE')}   ·   ${transactions.length} registros`;
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
        styleExcelHeaderCell(cell, { wrapText: true });
    });
    hRow.commit();

    transactions.forEach((t, idx) => {
        const row = wsDetail.addRow({
            order:   t.orderNumber,
            date:    fmtDate(t.createdAt),
            customer:t.customer?.name ?? '—',
            stores:  t.stores.map(s => s.name).join(', ') || '—',
            total:   t.total,
            comm:    t.commissionTotal != null ? `S/ ${t.commissionTotal.toFixed(2)}` : '—',
            method:  t.paymentMethod ?? '—',
            card:    t.cardBrand ? `${t.cardBrand} ****${t.cardLast4}` : '—',
            pstatus: PAYMENT_LABEL[t.paymentStatus] ?? t.paymentStatus,
            tstatus: t.transactionStatus ? (TX_LABEL[t.transactionStatus] ?? t.transactionStatus) : '—',
        });

        row.getCell('total').numFmt   = '"S/ "#,##0.00';
        row.getCell('total').alignment = { horizontal: 'right', vertical: 'middle' };
        row.getCell('order').font = { name: 'Courier New', size: 9, color: { argb: 'FF' + EXCEL_COLORS.bodyFont } };
        ['date','customer','stores','comm','method','card','pstatus','tstatus'].forEach(k => {
            row.getCell(k).alignment = { horizontal: 'center', vertical: 'middle' };
        });

        styleExcelDataRow(row, idx);
        row.height = 18;
        row.commit();
    });

    const totalRow = wsDetail.addRow({ order: `TOTAL (${transactions.length})`, total: totalMonto, comm: `S/ ${totalComision.toFixed(2)}` });
    totalRow.getCell('total').numFmt = '"S/ "#,##0.00';
    styleExcelTotalRow(totalRow);
    totalRow.height = 22;
    totalRow.commit();

    wsDetail.views = [{ state: 'frozen', ySplit: 4 }];
    wsDetail.autoFilter = {
        from: { row: 4, column: 1 },
        to:   { row: 4 + transactions.length, column: COLS.length },
    };

    const buffer = await wb.xlsx.writeBuffer();
    saveAs(
        new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }),
        `pagos-izipay-${new Date().toISOString().slice(0, 10)}.xlsx`
    );
}
