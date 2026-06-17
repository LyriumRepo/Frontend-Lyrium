'use client';

import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import type { Voucher } from '../types';

const COLORS = {
    headerBg:     '10B981',
    headerFont:   'FFFFFF',
    titleBg:      '064E3B',
    titleFont:    'FFFFFF',
    accentStripe: 'ECFDF5',
    border:       'A7F3D0',
};

const COLUMNS = [
    { key: 'type',         label: 'Tipo',          width: 14 },
    { key: 'seriesNumber', label: 'Serie-Número',   width: 18 },
    { key: 'storeName',    label: 'Tienda',         width: 30 },
    { key: 'storeRuc',     label: 'RUC Tienda',     width: 16 },
    { key: 'orderId',      label: 'Pedido',         width: 24 },
    { key: 'amount',       label: 'Monto',          width: 14 },
    { key: 'status',       label: 'Estado SUNAT',   width: 18 },
    { key: 'emissionDate', label: 'Fecha Emisión',  width: 18 },
];

const STATUS_LABEL: Record<string, string> = {
    ACCEPTED:      'Aceptado',
    SENT_WAIT_CDR: 'Pendiente CDR',
    REJECTED:      'Rechazado',
    OBSERVED:      'Observado',
    DRAFT:         'Borrador',
};

export async function exportInvoicesToExcel(vouchers: Voucher[]): Promise<void> {
    if (vouchers.length === 0) return;

    const wb = new ExcelJS.Workbook();
    wb.creator = 'Lyrium Market';
    wb.created = new Date();

    const ws = wb.addWorksheet('Comprobantes', {
        pageSetup: { paperSize: 9, orientation: 'landscape', fitToPage: true, fitToWidth: 1 },
    });

    const colCount = COLUMNS.length;

    ws.addRow([]);
    ws.addRow([]);
    ws.addRow([]);

    ws.mergeCells(1, 1, 1, colCount);
    const titleCell = ws.getCell('A1');
    titleCell.value     = 'Lyrium Market — Reporte de Comprobantes Electrónicos';
    titleCell.font      = { name: 'Arial', bold: true, size: 16, color: { argb: COLORS.titleFont } };
    titleCell.fill      = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.titleBg } };
    titleCell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };

    ws.mergeCells(2, 1, 2, colCount);
    const subtitleCell = ws.getCell('A2');
    const dateLabel = new Date().toLocaleDateString('es-PE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    subtitleCell.value     = `Generado el ${dateLabel}  ·  ${vouchers.length} comprobante${vouchers.length !== 1 ? 's' : ''}`;
    subtitleCell.font      = { name: 'Arial', size: 10, italic: true, color: { argb: 'A7F3D0' } };
    subtitleCell.fill      = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.titleBg } };
    subtitleCell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };

    ws.mergeCells(3, 1, 3, colCount);
    ws.getCell('A3').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '047857' } };

    ws.getRow(1).height = 36;
    ws.getRow(2).height = 20;
    ws.getRow(3).height = 4;

    ws.columns = COLUMNS.map(c => ({ key: c.key, width: c.width })) as ExcelJS.Column[];

    const headerRow = ws.getRow(4);
    headerRow.height = 26;
    COLUMNS.forEach((c, i) => {
        const cell     = headerRow.getCell(i + 1);
        cell.value     = c.label;
        cell.font      = { name: 'Arial', bold: true, size: 10, color: { argb: COLORS.headerFont } };
        cell.fill      = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.headerBg } };
        cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
        cell.border    = { bottom: { style: 'medium', color: { argb: '047857' } } };
    });
    headerRow.commit();

    vouchers.forEach((v, rowIndex) => {
        const row = ws.getRow(rowIndex + 5);
        const vals: Record<string, string | number> = {
            type:         v.type,
            seriesNumber: `${v.series}-${v.number}`,
            storeName:    v.store_name || '—',
            storeRuc:     v.store_ruc || '—',
            orderId:      v.order_id || '—',
            amount:       v.amount,
            status:       STATUS_LABEL[v.sunat_status] ?? v.sunat_status,
            emissionDate: new Date(v.emission_date).toLocaleDateString('es-PE'),
        };

        COLUMNS.forEach((c, i) => {
            row.getCell(i + 1).value = vals[c.key] ?? null;
        });

        row.eachCell({ includeEmpty: true }, cell => {
            if (rowIndex % 2 === 0) {
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.accentStripe } };
            }
            cell.border = { bottom: { style: 'hair', color: { argb: COLORS.border } } };
            cell.font   = { name: 'Arial', size: 9 };
        });

        // Currency format for amount column (index 5 = col 6)
        row.getCell(6).numFmt    = '"S/ "#,##0.00';
        row.getCell(6).alignment = { horizontal: 'right', vertical: 'middle' };
        row.height = 18;
        row.commit();
    });

    ws.views = [{ state: 'frozen', ySplit: 4 }];
    ws.autoFilter = {
        from: { row: 4, column: 1 },
        to:   { row: 4 + vouchers.length, column: colCount },
    };

    const buffer = await wb.xlsx.writeBuffer();
    saveAs(
        new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }),
        `comprobantes-${new Date().toISOString().slice(0, 10)}.xlsx`
    );
}
