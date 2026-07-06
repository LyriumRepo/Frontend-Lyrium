'use client';

import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import type { Transaction } from '../types/transactions';

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

function borderHair(): Partial<ExcelJS.Borders> {
    const s = { style: 'hair' as ExcelJS.BorderStyle, color: { argb: 'FF' + COLORS.border } };
    return { top: s, left: s, bottom: s, right: s };
}

export async function exportPaymentsToExcel(transactions: Transaction[]): Promise<void> {
    if (transactions.length === 0) return;

    const wb = new ExcelJS.Workbook();
    wb.creator = 'Lyrium BioMarketplace';
    wb.created = new Date();

    // ── Hoja Resumen ──────────────────────────────────────────────────────
    const wsSummary = wb.addWorksheet('Resumen', {
        pageSetup: { paperSize: 9, orientation: 'portrait' },
        properties: { tabColor: { argb: 'FF' + COLORS.headerBg } },
    });

    wsSummary.mergeCells('A1:E1');
    const h1 = wsSummary.getCell('A1');
    h1.value = 'LYRIUM BIOMARKETPLACE';
    h1.font  = { name: 'Arial', bold: true, size: 16, color: { argb: 'FF' + COLORS.titleFont } };
    h1.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + COLORS.titleBg } };
    h1.alignment = { vertical: 'middle', horizontal: 'left', indent: 2 };
    wsSummary.getRow(1).height = 38;

    wsSummary.mergeCells('A2:E2');
    const h2 = wsSummary.getCell('A2');
    h2.value = 'Gestión de Pagos Izipay — Panel Administrador';
    h2.font  = { name: 'Arial', size: 11, color: { argb: 'FF' + COLORS.subText } };
    h2.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + COLORS.titleBg } };
    h2.alignment = { vertical: 'middle', horizontal: 'left', indent: 2 };
    wsSummary.getRow(2).height = 22;

    wsSummary.mergeCells('A3:E3');
    const h3 = wsSummary.getCell('A3');
    h3.value = `Generado el ${new Date().toLocaleString('es-PE')}   ·   ${transactions.length} transacción${transactions.length !== 1 ? 'es' : ''}`;
    h3.font  = { name: 'Arial', size: 9, italic: true, color: { argb: 'FF' + COLORS.headerFont } };
    h3.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + COLORS.accent } };
    h3.alignment = { vertical: 'middle', horizontal: 'left', indent: 2 };
    wsSummary.getRow(3).height = 18;

    wsSummary.mergeCells('A4:E4');
    wsSummary.getCell('A4').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + COLORS.accent } };
    wsSummary.getRow(4).height = 4;

    const totalMonto    = transactions.reduce((s, t) => s + t.total, 0);
    const totalComision = transactions.reduce((s, t) => s + (t.commissionTotal ?? 0), 0);
    const pagadas       = transactions.filter(t => t.paymentStatus === 'paid').length;
    const fallidas      = transactions.filter(t => t.paymentStatus === 'failed').length;

    wsSummary.addRow([]);
    const kpiHeader = wsSummary.addRow(['RESUMEN DE PAGOS']);
    kpiHeader.getCell(1).font = { name: 'Arial', bold: true, size: 10, color: { argb: 'FF' + COLORS.headerBg } };
    kpiHeader.height = 22;

    const kpiData: Array<[string, string]> = [
        ['Total recaudado',       `S/ ${totalMonto.toFixed(2)}`   ],
        ['Comisión Lyrium total', `S/ ${totalComision.toFixed(2)}`],
        ['Transacciones pagadas', String(pagadas)                  ],
        ['Transacciones fallidas',String(fallidas)                 ],
        ['Total transacciones',   String(transactions.length)      ],
    ];

    kpiData.forEach(([label, value]) => {
        const row = wsSummary.addRow([label, value]);
        row.getCell(1).font = { name: 'Arial', size: 9, color: { argb: 'FF' + COLORS.subText } };
        row.getCell(2).font = { name: 'Arial', bold: true, size: 10, color: { argb: 'FF' + COLORS.headerFont } };
        row.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + COLORS.accentStripe } };
        row.getCell(2).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + COLORS.accentStripe } };
        row.getCell(1).border = borderHair();
        row.getCell(2).border = borderHair();
        row.height = 20;
    });

    wsSummary.getColumn('A').width = 36;
    wsSummary.getColumn('B').width = 26;

    // ── Hoja Transacciones ────────────────────────────────────────────────
    const wsDetail = wb.addWorksheet('Transacciones', {
        pageSetup: { paperSize: 9, orientation: 'landscape', fitToPage: true, fitToWidth: 1 },
        properties: { tabColor: { argb: 'FF' + COLORS.accent } },
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
    dTitle.font  = { name: 'Arial', bold: true, size: 13, color: { argb: 'FF' + COLORS.titleFont } };
    dTitle.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + COLORS.titleBg } };
    dTitle.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
    wsDetail.getRow(1).height = 28;

    wsDetail.mergeCells(2, 1, 2, COLS.length);
    const dSub = wsDetail.getCell('A2');
    dSub.value = `Generado: ${new Date().toLocaleString('es-PE')}   ·   ${transactions.length} registros`;
    dSub.font  = { name: 'Arial', size: 9, italic: true, color: { argb: 'FF' + COLORS.headerFont } };
    dSub.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + COLORS.accent } };
    dSub.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
    wsDetail.getRow(2).height = 18;

    wsDetail.mergeCells(3, 1, 3, COLS.length);
    wsDetail.getCell('A3').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + COLORS.accent } };
    wsDetail.getRow(3).height = 4;

    wsDetail.columns = COLS.map(c => ({ key: c.key, width: c.width })) as ExcelJS.Column[];

    const hRow = wsDetail.getRow(4);
    hRow.height = 26;
    COLS.forEach((c, i) => {
        const cell = hRow.getCell(i + 1);
        cell.value = c.header;
        cell.font  = { name: 'Arial', bold: true, size: 9, color: { argb: 'FF' + COLORS.headerFont } };
        cell.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + COLORS.headerBg } };
        cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
        cell.border = { bottom: { style: 'medium', color: { argb: 'FF' + COLORS.border } } };
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
        row.getCell('order').font = { name: 'Courier New', size: 9 };
        ['date','customer','stores','comm','method','card','pstatus','tstatus'].forEach(k => {
            row.getCell(k).alignment = { horizontal: 'center', vertical: 'middle' };
        });

        const isEven = idx % 2 === 0;
        row.eachCell({ includeEmpty: true }, cell => {
            if (!cell.font?.bold) cell.font = { name: 'Arial', size: 9 };
            if (isEven) cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + COLORS.accentStripe } };
            cell.border = borderHair();
        });
        row.height = 18;
        row.commit();
    });

    const totalRow = wsDetail.addRow({ order: `TOTAL (${transactions.length})`, total: totalMonto, comm: `S/ ${totalComision.toFixed(2)}` });
    totalRow.getCell('order').font = { name: 'Arial', bold: true, size: 9, color: { argb: 'FF' + COLORS.headerFont } };
    totalRow.getCell('total').font = { name: 'Arial', bold: true, size: 9, color: { argb: 'FF' + COLORS.headerFont } };
    totalRow.getCell('total').numFmt = '"S/ "#,##0.00';
    totalRow.eachCell({ includeEmpty: true }, cell => {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + COLORS.totalBg } };
        cell.border = { top: { style: 'medium', color: { argb: 'FF' + COLORS.border } } };
    });
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
