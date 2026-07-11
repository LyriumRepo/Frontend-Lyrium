'use client';

import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import type { Seller } from '../types';

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

function borderHair(): Partial<ExcelJS.Borders> {
    const s = { style: 'hair' as ExcelJS.BorderStyle, color: { argb: 'FF' + COLORS.border } };
    return { top: s, left: s, bottom: s, right: s };
}

export async function exportSellersToExcel(sellers: Seller[]): Promise<void> {
    if (sellers.length === 0) return;

    const wb = new ExcelJS.Workbook();
    wb.creator = 'Lyrium BioMarketplace';
    wb.created = new Date();

    // ── Hoja Resumen ──────────────────────────────────────────────────────
    const wsSummary = wb.addWorksheet('Resumen', {
        pageSetup: { paperSize: 9, orientation: 'portrait' },
        properties: { tabColor: { argb: 'FF' + COLORS.headerBg } },
    });

    wsSummary.mergeCells('A1:D1');
    const h1 = wsSummary.getCell('A1');
    h1.value = 'LYRIUM BIOMARKETPLACE';
    h1.font  = { name: 'Arial', bold: true, size: 16, color: { argb: 'FF' + COLORS.titleFont } };
    h1.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + COLORS.titleBg } };
    h1.alignment = { vertical: 'middle', horizontal: 'left', indent: 2 };
    wsSummary.getRow(1).height = 38;

    wsSummary.mergeCells('A2:D2');
    const h2 = wsSummary.getCell('A2');
    h2.value = 'Padrón de Vendedores — Panel Administrador';
    h2.font  = { name: 'Arial', size: 11, color: { argb: 'FF' + COLORS.subText } };
    h2.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + COLORS.titleBg } };
    h2.alignment = { vertical: 'middle', horizontal: 'left', indent: 2 };
    wsSummary.getRow(2).height = 22;

    wsSummary.mergeCells('A3:D3');
    const h3 = wsSummary.getCell('A3');
    h3.value = `Generado el ${new Date().toLocaleString('es-PE')}   ·   ${sellers.length} vendedor${sellers.length !== 1 ? 'es' : ''}`;
    h3.font  = { name: 'Arial', size: 9, italic: true, color: { argb: 'FF' + COLORS.headerFont } };
    h3.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + COLORS.accent } };
    h3.alignment = { vertical: 'middle', horizontal: 'left', indent: 2 };
    wsSummary.getRow(3).height = 18;

    wsSummary.mergeCells('A4:D4');
    wsSummary.getCell('A4').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + COLORS.accent } };
    wsSummary.getRow(4).height = 4;

    const activos   = sellers.filter(s => ['ACTIVE','activa','approved'].includes(String(s.status))).length;
    const pendientes= sellers.filter(s => s.status === 'PENDING').length;
    const suspendidos=sellers.filter(s => ['SUSPENDED','suspendida'].includes(String(s.status))).length;

    wsSummary.addRow([]);
    const kpiHeader = wsSummary.addRow(['RESUMEN DEL PADRÓN']);
    kpiHeader.getCell(1).font = { name: 'Arial', bold: true, size: 10, color: { argb: 'FF' + COLORS.headerBg } };
    kpiHeader.height = 22;

    const kpiData: Array<[string, string]> = [
        ['Total vendedores',         String(sellers.length)],
        ['Activos / Aprobados',      String(activos)       ],
        ['Pendientes de aprobación', String(pendientes)    ],
        ['Suspendidos / Rechazados', String(suspendidos)   ],
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
    wsSummary.getColumn('B').width = 20;

    // ── Hoja Vendedores ───────────────────────────────────────────────────
    const wsDetail = wb.addWorksheet('Vendedores', {
        pageSetup: { paperSize: 9, orientation: 'landscape', fitToPage: true, fitToWidth: 1 },
        properties: { tabColor: { argb: 'FF' + COLORS.accent } },
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
    dTitle.font  = { name: 'Arial', bold: true, size: 13, color: { argb: 'FF' + COLORS.titleFont } };
    dTitle.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + COLORS.titleBg } };
    dTitle.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
    wsDetail.getRow(1).height = 28;

    wsDetail.mergeCells(2, 1, 2, COLS.length);
    const dSub = wsDetail.getCell('A2');
    dSub.value = `Generado: ${new Date().toLocaleString('es-PE')}   ·   ${sellers.length} registros`;
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

        const isEven = idx % 2 === 0;
        row.eachCell({ includeEmpty: true }, cell => {
            if (!cell.font?.bold) cell.font = { name: 'Arial', size: 9 };
            if (isEven) cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + COLORS.accentStripe } };
            cell.border = borderHair();
        });
        row.height = 18;
        row.commit();
    });

    const totalRow = wsDetail.addRow({ id: `TOTAL`, products: sellers.reduce((s, v) => s + v.productsTotal, 0) });
    totalRow.getCell('id').font = { name: 'Arial', bold: true, size: 9, color: { argb: 'FF' + COLORS.headerFont } };
    totalRow.getCell('products').font = { name: 'Arial', bold: true, size: 9, color: { argb: 'FF' + COLORS.headerFont } };
    totalRow.eachCell({ includeEmpty: true }, cell => {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + COLORS.totalBg } };
        cell.border = { top: { style: 'medium', color: { argb: 'FF' + COLORS.border } } };
    });
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
