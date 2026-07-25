'use client';

import type * as ExcelJS from 'exceljs';
import type { Seller } from '../types';
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

const STATUS_LABEL: Record<string, string> = {
    ACTIVE:    'Activo',
    PENDING:   'Pendiente',
    SUSPENDED: 'Suspendido',
    REJECTED:  'Rechazado',
    activa:    'Activo',
    approved:  'Aprobado',
    suspendida:'Suspendido',
    baja_logica:'Baja Lógica',
};

function fmtDate(s: string): string {
    try { return new Date(s).toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' }); }
    catch { return s; }
}

export async function exportSellersToExcel(sellers: Seller[]): Promise<void> {
    const [{ default: ExcelJS }, { saveAs }] = await Promise.all([
        import('exceljs'),
        import('file-saver'),
    ]);
    if (sellers.length === 0) return;

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
    h2.value = 'Padrón de Vendedores — Panel Administrador';
    h2.font  = { name: 'Arial', size: 11, color: { argb: 'FF' + EXCEL_COLORS.subText } };
    h2.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + EXCEL_COLORS.titleBg } };
    h2.alignment = { vertical: 'middle', horizontal: 'left', indent: 2 };
    wsSummary.getRow(2).height = 22;

    wsSummary.mergeCells('A3:D3');
    const h3 = wsSummary.getCell('A3');
    h3.value = `Generado el ${new Date().toLocaleString('es-PE')}   ·   ${sellers.length} vendedor${sellers.length !== 1 ? 'es' : ''}`;
    styleExcelSubtitleCell(h3);
    wsSummary.getRow(3).height = 18;

    wsSummary.mergeCells('A4:D4');
    styleExcelAccentBar(wsSummary.getCell('A4'));
    wsSummary.getRow(4).height = 4;

    const activos   = sellers.filter(s => ['ACTIVE','activa','approved'].includes(String(s.status))).length;
    const pendientes= sellers.filter(s => s.status === 'PENDING').length;
    const suspendidos=sellers.filter(s => ['SUSPENDED','suspendida'].includes(String(s.status))).length;

    wsSummary.addRow([]);
    const kpiHeader = wsSummary.addRow(['RESUMEN DEL PADRÓN']);
    styleExcelSectionTitleCell(kpiHeader.getCell(1));
    kpiHeader.height = 22;

    const kpiData: Array<[string, string]> = [
        ['Total vendedores',         String(sellers.length)],
        ['Activos / Aprobados',      String(activos)       ],
        ['Pendientes de aprobación', String(pendientes)    ],
        ['Suspendidos / Rechazados', String(suspendidos)   ],
    ];

    kpiData.forEach(([label, value], idx) => {
        const row = wsSummary.addRow([label, value]);
        styleExcelKpiRow(row, idx);
        row.height = 20;
    });

    wsSummary.getColumn('A').width = 36;
    wsSummary.getColumn('B').width = 20;

    // ── Hoja Vendedores ───────────────────────────────────────────────────
    const wsDetail = wb.addWorksheet('Vendedores', {
        pageSetup: { paperSize: 9, orientation: 'landscape', fitToPage: true, fitToWidth: 1 },
        properties: { tabColor: { argb: 'FF' + EXCEL_COLORS.accent } },
    });

    const COLS = [
        { header: 'ID',           key: 'id',       width: 10 },
        { header: 'Nombre',       key: 'name',     width: 26 },
        { header: 'Empresa',      key: 'company',  width: 28 },
        { header: 'Email',        key: 'email',    width: 32 },
        { header: 'Estado',       key: 'status',   width: 16 },
        { header: 'Productos',    key: 'products', width: 12 },
        { header: 'Pendientes',   key: 'pending',  width: 12 },
        { header: 'Contratos',    key: 'contract', width: 16 },
        { header: 'Registro',     key: 'regDate',  width: 18 },
    ];

    wsDetail.mergeCells(1, 1, 1, COLS.length);
    const dTitle = wsDetail.getCell('A1');
    dTitle.value = 'Lyrium BioMarketplace — Padrón de Vendedores';
    styleExcelTitleCell(dTitle);
    wsDetail.getRow(1).height = 28;

    wsDetail.mergeCells(2, 1, 2, COLS.length);
    const dSub = wsDetail.getCell('A2');
    dSub.value = `Generado: ${new Date().toLocaleString('es-PE')}   ·   ${sellers.length} registros`;
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

    sellers.forEach((s, idx) => {
        const row = wsDetail.addRow({
            id:      s.id,
            name:    s.name,
            company: s.company,
            email:   s.email,
            status:  STATUS_LABEL[String(s.status)] ?? String(s.status),
            products:s.productsTotal,
            pending: s.productsPending,
            contract:s.contractStatus ?? '—',
            regDate: fmtDate(s.regDate),
        });

        ['id','products','pending'].forEach(k => row.getCell(k).alignment = { horizontal: 'center', vertical: 'middle' });
        ['status','contract','regDate'].forEach(k => row.getCell(k).alignment = { horizontal: 'center', vertical: 'middle' });

        styleExcelDataRow(row, idx);
        row.height = 18;
        row.commit();
    });

    const totalRow = wsDetail.addRow({ id: `TOTAL`, products: sellers.reduce((s, v) => s + v.productsTotal, 0) });
    styleExcelTotalRow(totalRow);
    totalRow.height = 22;
    totalRow.commit();

    wsDetail.views = [{ state: 'frozen', ySplit: 4 }];
    wsDetail.autoFilter = {
        from: { row: 4, column: 1 },
        to:   { row: 4 + sellers.length, column: COLS.length },
    };

    const buffer = await wb.xlsx.writeBuffer();
    saveAs(
        new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }),
        `padron-vendedores-${new Date().toISOString().slice(0, 10)}.xlsx`
    );
}
