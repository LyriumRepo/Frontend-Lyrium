'use client';

import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import type { InventoryItem } from '../types';

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

const STOCK_LABEL: Record<string, string> = {
    ok:       'OK',
    low:      'Stock Bajo',
    critical: 'Crítico',
    out:      'Sin Stock',
};

function getStockStatus(item: InventoryItem): string {
    const available = item.stock - (item.reserved ?? 0);
    if (available <= 0)  return 'out';
    if (available <= 5)  return 'critical';
    if (available <= 9)  return 'low';
    return 'ok';
}

function fmtDate(d: Date): string {
    try { return d.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' }); }
    catch { return '—'; }
}

function borderHair(): Partial<ExcelJS.Borders> {
    const s = { style: 'hair' as ExcelJS.BorderStyle, color: { argb: 'FF' + COLORS.border } };
    return { top: s, left: s, bottom: s, right: s };
}

export async function exportInventoryToExcel(items: InventoryItem[]): Promise<void> {
    if (items.length === 0) return;

    const wb = new ExcelJS.Workbook();
    wb.creator = 'Lyrium BioMarketplace';
    wb.created = new Date();

    const wsDetail = wb.addWorksheet('Inventario', {
        pageSetup: { paperSize: 9, orientation: 'landscape', fitToPage: true, fitToWidth: 1 },
        properties: { tabColor: { argb: 'FF' + COLORS.headerBg } },
    });

    const COLS = [
        { header: 'SKU',           key: 'sku',       width: 18 },
        { header: 'Producto',      key: 'name',      width: 34 },
        { header: 'Categoría',     key: 'category',  width: 22 },
        { header: 'Stock Total',   key: 'stock',     width: 14 },
        { header: 'Reservado',     key: 'reserved',  width: 12 },
        { header: 'Disponible',    key: 'available', width: 12 },
        { header: 'Precio',        key: 'price',     width: 16 },
        { header: 'Estado Stock',  key: 'stockStatus',width: 16 },
        { header: 'Actualizado',   key: 'updatedAt', width: 18 },
    ];

    wsDetail.mergeCells(1, 1, 1, COLS.length);
    const dTitle = wsDetail.getCell('A1');
    dTitle.value = 'Lyrium BioMarketplace — Control de Inventario';
    dTitle.font  = { name: 'Arial', bold: true, size: 13, color: { argb: 'FF' + COLORS.titleFont } };
    dTitle.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + COLORS.titleBg } };
    dTitle.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
    wsDetail.getRow(1).height = 28;

    const alerts = items.filter(i => ['out','critical'].includes(getStockStatus(i))).length;
    wsDetail.mergeCells(2, 1, 2, COLS.length);
    const dSub = wsDetail.getCell('A2');
    dSub.value = `Generado: ${new Date().toLocaleString('es-PE')}   ·   ${items.length} productos   ·   ${alerts} alertas de stock`;
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
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
        cell.border = { bottom: { style: 'medium', color: { argb: 'FF' + COLORS.border } } };
    });
    hRow.commit();

    items.forEach((item, idx) => {
        const available = item.stock - (item.reserved ?? 0);
        const status = getStockStatus(item);
        const row = wsDetail.addRow({
            sku:         item.sku,
            name:        item.name,
            category:    item.category,
            stock:       item.stock,
            reserved:    item.reserved ?? 0,
            available:   available,
            price:       item.price,
            stockStatus: STOCK_LABEL[status] ?? status,
            updatedAt:   fmtDate(item.updatedAt),
        });

        row.getCell('price').numFmt = '"S/ "#,##0.00';
        row.getCell('price').alignment = { horizontal: 'right', vertical: 'middle' };
        ['stock','reserved','available'].forEach(k => {
            row.getCell(k).alignment = { horizontal: 'center', vertical: 'middle' };
        });
        ['stockStatus','updatedAt','sku'].forEach(k => {
            row.getCell(k).alignment = { horizontal: 'center', vertical: 'middle' };
        });

        // Color critical stock
        if (status === 'out' || status === 'critical') {
            row.getCell('available').font = { name: 'Arial', bold: true, size: 9, color: { argb: 'FFF43F5E' } };
            row.getCell('stockStatus').font = { name: 'Arial', bold: true, size: 9, color: { argb: 'FFF43F5E' } };
        } else if (status === 'low') {
            row.getCell('available').font = { name: 'Arial', bold: true, size: 9, color: { argb: 'FFF59E0B' } };
            row.getCell('stockStatus').font = { name: 'Arial', bold: true, size: 9, color: { argb: 'FFF59E0B' } };
        }

        const isEven = idx % 2 === 0;
        row.eachCell({ includeEmpty: true }, cell => {
            if (!cell.font?.bold) cell.font = { name: 'Arial', size: 9 };
            if (isEven) cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + COLORS.accentStripe } };
            cell.border = borderHair();
        });
        row.height = 18;
        row.commit();
    });

    const totalRow = wsDetail.addRow({
        sku:      `TOTAL (${items.length})`,
        stock:    items.reduce((s, i) => s + i.stock, 0),
        available:items.reduce((s, i) => s + (i.stock - (i.reserved ?? 0)), 0),
    });
    totalRow.getCell('sku').font   = { name: 'Arial', bold: true, size: 9, color: { argb: 'FF' + COLORS.headerFont } };
    totalRow.getCell('stock').font = { name: 'Arial', bold: true, size: 9, color: { argb: 'FF' + COLORS.headerFont } };
    totalRow.getCell('available').font = { name: 'Arial', bold: true, size: 9, color: { argb: 'FF' + COLORS.headerFont } };
    totalRow.eachCell({ includeEmpty: true }, cell => {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + COLORS.totalBg } };
        cell.border = { top: { style: 'medium', color: { argb: 'FF' + COLORS.border } } };
    });
    totalRow.height = 22;
    totalRow.commit();

    wsDetail.views = [{ state: 'frozen', ySplit: 4 }];
    wsDetail.autoFilter = {
        from: { row: 4, column: 1 },
        to:   { row: 4 + items.length, column: COLS.length },
    };

    const buffer = await wb.xlsx.writeBuffer();
    saveAs(
        new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }),
        `inventario-${new Date().toISOString().slice(0, 10)}.xlsx`
    );
}
