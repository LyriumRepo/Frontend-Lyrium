'use client';

import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import type { Service } from '../types';

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

function borderHair(): Partial<ExcelJS.Borders> {
    const s = { style: 'hair' as ExcelJS.BorderStyle, color: { argb: 'FF' + COLORS.border } };
    return { top: s, left: s, bottom: s, right: s };
}

export async function exportServicesToExcel(services: Service[]): Promise<void> {
    if (services.length === 0) return;

    const wb = new ExcelJS.Workbook();
    wb.creator = 'Lyrium BioMarketplace';
    wb.created = new Date();

    const wsDetail = wb.addWorksheet('Servicios', {
        pageSetup: { paperSize: 9, orientation: 'landscape', fitToPage: true, fitToWidth: 1 },
        properties: { tabColor: { argb: 'FF' + COLORS.headerBg } },
    });

    const COLS = [
        { header: '#',             key: 'id',         width: 8  },
        { header: 'Denominación',  key: 'name',       width: 32 },
        { header: 'Categoría',     key: 'category',   width: 22 },
        { header: 'Precio',        key: 'price',      width: 14 },
        { header: 'Duración (min)',key: 'duration',   width: 16 },
        { header: 'Cupos',         key: 'cupos',      width: 10 },
        { header: 'Estado',        key: 'estado',     width: 14 },
        { header: 'A domicilio',   key: 'domicilio',  width: 14 },
        { header: 'Anticipación',  key: 'anticip',    width: 16 },
    ];

    wsDetail.mergeCells(1, 1, 1, COLS.length);
    const dTitle = wsDetail.getCell('A1');
    dTitle.value = 'Lyrium BioMarketplace — Mis Servicios';
    dTitle.font  = { name: 'Arial', bold: true, size: 13, color: { argb: 'FF' + COLORS.titleFont } };
    dTitle.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + COLORS.titleBg } };
    dTitle.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
    wsDetail.getRow(1).height = 28;

    const publicados = services.filter(s => s.estado === 'publicado').length;
    wsDetail.mergeCells(2, 1, 2, COLS.length);
    const dSub = wsDetail.getCell('A2');
    dSub.value = `Generado: ${new Date().toLocaleString('es-PE')}   ·   ${services.length} servicios (${publicados} publicados)`;
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

    services.forEach((s, idx) => {
        const row = wsDetail.addRow({
            id:       s.id,
            name:     s.denominacion,
            category: s.categoria,
            price:    s.precio,
            duration: s.duracion,
            cupos:    s.cupos,
            estado:   s.estado === 'publicado' ? 'Publicado' : 'Borrador',
            domicilio:s.domicilio ? 'Sí' : 'No',
            anticip:  `${s.anticipacionReserva}h`,
        });

        row.getCell('price').numFmt = '"S/ "#,##0.00';
        row.getCell('price').alignment = { horizontal: 'right', vertical: 'middle' };
        ['id','duration','cupos','estado','domicilio','anticip'].forEach(k => {
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

    const totalMonto = services.reduce((s, v) => s + v.precio, 0);
    const totalRow = wsDetail.addRow({ id: `TOTAL (${services.length})`, price: totalMonto / services.length });
    totalRow.getCell('id').font   = { name: 'Arial', bold: true, size: 9, color: { argb: 'FF' + COLORS.headerFont } };
    totalRow.getCell('price').font = { name: 'Arial', bold: true, size: 9, color: { argb: 'FF' + COLORS.headerFont } };
    totalRow.getCell('price').numFmt = '"S/ "#,##0.00';
    // Override id label
    totalRow.getCell('id').value = `${services.length} servicios — Precio prom.`;
    totalRow.eachCell({ includeEmpty: true }, cell => {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + COLORS.totalBg } };
        cell.border = { top: { style: 'medium', color: { argb: 'FF' + COLORS.border } } };
    });
    totalRow.height = 22;
    totalRow.commit();

    wsDetail.views = [{ state: 'frozen', ySplit: 4 }];
    wsDetail.autoFilter = {
        from: { row: 4, column: 1 },
        to:   { row: 4 + services.length, column: COLS.length },
    };

    const buffer = await wb.xlsx.writeBuffer();
    saveAs(
        new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }),
        `mis-servicios-${new Date().toISOString().slice(0, 10)}.xlsx`
    );
}
