'use client';

import type * as ExcelJS from 'exceljs';
import type { Service } from '../types';
import {
    EXCEL_COLORS,
    styleExcelTitleCell,
    styleExcelSubtitleCell,
    styleExcelAccentBar,
    styleExcelHeaderCell,
    styleExcelDataRow,
    styleExcelTotalRow,
} from '@/shared/lib/excel/excelTheme';

export async function exportServicesToExcel(services: Service[]): Promise<void> {
    const [{ default: ExcelJS }, { saveAs }] = await Promise.all([
        import('exceljs'),
        import('file-saver'),
    ]);
    if (services.length === 0) return;

    const wb = new ExcelJS.Workbook();
    wb.creator = 'Lyrium BioMarketplace';
    wb.created = new Date();

    const wsDetail = wb.addWorksheet('Servicios', {
        pageSetup: { paperSize: 9, orientation: 'landscape', fitToPage: true, fitToWidth: 1 },
        properties: { tabColor: { argb: 'FF' + EXCEL_COLORS.headerBg } },
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
    styleExcelTitleCell(dTitle);
    wsDetail.getRow(1).height = 28;

    const publicados = services.filter(s => s.estado === 'publicado').length;
    wsDetail.mergeCells(2, 1, 2, COLS.length);
    const dSub = wsDetail.getCell('A2');
    dSub.value = `Generado: ${new Date().toLocaleString('es-PE')}   ·   ${services.length} servicios (${publicados} publicados)`;
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

        styleExcelDataRow(row, idx);
        row.height = 18;
        row.commit();
    });

    const totalMonto = services.reduce((s, v) => s + v.precio, 0);
    const totalRow = wsDetail.addRow({ id: `TOTAL (${services.length})`, price: totalMonto / services.length });
    totalRow.getCell('price').numFmt = '"S/ "#,##0.00';
    // Override id label
    totalRow.getCell('id').value = `${services.length} servicios — Precio prom.`;
    styleExcelTotalRow(totalRow);
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
