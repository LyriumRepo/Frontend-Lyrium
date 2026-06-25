import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import type { AdminInvoiceRow, AdminInvoiceKPIs } from '../hooks/useAdminInvoices';

// ── Paleta oficial Lyrium — lima verde (igual que PDF) ────────────────────
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

// Colores semánticos de estado
const STATUS_LABEL: Record<string, string> = {
    ACCEPTED:      'Aceptado',
    SENT_WAIT_CDR: 'Pendiente CDR',
    REJECTED:      'Rechazado',
    OBSERVED:      'Observado',
    DRAFT:         'Borrador',
};

const STATUS_STYLE: Record<string, { fg: string; bg: string }> = {
    ACCEPTED:      { fg: 'FF10B981', bg: 'FFECFDF5' },
    SENT_WAIT_CDR: { fg: 'FFF59E0B', bg: 'FFFEF3C7' },
    REJECTED:      { fg: 'FFF43F5E', bg: 'FFFFE4E6' },
    OBSERVED:      { fg: 'FFF59E0B', bg: 'FFFEF3C7' },
    DRAFT:         { fg: 'FF9CA3AF', bg: 'FFF3F4F6' },
};

function fmtDate(d: string): string {
    if (!d) return '—';
    try { return new Date(d).toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' }); }
    catch { return d; }
}

function fmtCommission(rate: number | null, amount: number | null): string {
    if (rate == null || amount == null) return '—';
    const pct = rate > 1 ? Math.round(rate) : Math.round(rate * 100);
    return `${pct}% · S/ ${amount.toFixed(2)}`;
}

function borderHair(): Partial<ExcelJS.Borders> {
    const s = { style: 'hair' as ExcelJS.BorderStyle, color: { argb: 'FF' + COLORS.border } };
    return { top: s, left: s, bottom: s, right: s };
}

function applyHeaderCell(cell: ExcelJS.Cell, value: string): void {
    cell.value = value;
    cell.font  = { name: 'Arial', bold: true, size: 9, color: { argb: 'FF' + COLORS.headerFont } };
    cell.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + COLORS.headerBg } };
    cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    cell.border = { bottom: { style: 'medium', color: { argb: 'FF' + COLORS.border } } };
}

// ── KPI card (2 filas × 1 columna) ───────────────────────────────────────
function writeKpiBlock(
    ws: ExcelJS.Worksheet,
    startRow: number,
    col: number,
    label: string,
    value: string,
): void {
    const r1 = ws.getRow(startRow);
    r1.height = 14;
    const c1 = r1.getCell(col);
    c1.value = label.toUpperCase();
    c1.font  = { name: 'Arial', bold: true, size: 7, color: { argb: 'FF' + COLORS.subText } };
    c1.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + COLORS.accentStripe } };
    c1.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
    c1.border = {
        top:   { style: 'medium', color: { argb: 'FF' + COLORS.border } },
        left:  { style: 'thin',   color: { argb: 'FF' + COLORS.border } },
        right: { style: 'thin',   color: { argb: 'FF' + COLORS.border } },
    };

    const r2 = ws.getRow(startRow + 1);
    r2.height = 22;
    const c2 = r2.getCell(col);
    c2.value = value;
    c2.font  = { name: 'Arial', bold: true, size: 13, color: { argb: 'FF' + COLORS.headerFont } };
    c2.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + COLORS.accentStripe } };
    c2.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
    c2.border = {
        bottom: { style: 'thin', color: { argb: 'FF' + COLORS.border } },
        left:   { style: 'thin', color: { argb: 'FF' + COLORS.border } },
        right:  { style: 'thin', color: { argb: 'FF' + COLORS.border } },
    };
}

export async function exportAdminInvoicesToExcel(
    rows: AdminInvoiceRow[],
    kpis: AdminInvoiceKPIs | null,
): Promise<void> {
    if (rows.length === 0) return;

    const wb = new ExcelJS.Workbook();
    wb.creator = 'Lyrium BioMarketplace';
    wb.created = new Date();

    // ══════════════════════════════════════════════════════════════════════
    // HOJA 1: Resumen
    // ══════════════════════════════════════════════════════════════════════
    const wsSummary = wb.addWorksheet('Resumen', {
        pageSetup: { paperSize: 9, orientation: 'landscape' },
        properties: { tabColor: { argb: 'FF' + COLORS.headerBg } },
    });

    // ── Branding header ─────────────────────────────────────────────────
    wsSummary.mergeCells('A1:I1');
    const h1 = wsSummary.getCell('A1');
    h1.value = 'LYRIUM BIOMARKETPLACE';
    h1.font  = { name: 'Arial', bold: true, size: 20, color: { argb: 'FF' + COLORS.titleFont } };
    h1.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + COLORS.titleBg } };
    h1.alignment = { vertical: 'middle', horizontal: 'left', indent: 2 };
    wsSummary.getRow(1).height = 44;

    wsSummary.mergeCells('A2:I2');
    const h2 = wsSummary.getCell('A2');
    h2.value = 'Reporte de Facturación Electrónica — Panel Administrador';
    h2.font  = { name: 'Arial', size: 11, color: { argb: 'FF' + COLORS.subText } };
    h2.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + COLORS.titleBg } };
    h2.alignment = { vertical: 'middle', horizontal: 'left', indent: 2 };
    wsSummary.getRow(2).height = 24;

    wsSummary.mergeCells('A3:I3');
    const h3 = wsSummary.getCell('A3');
    h3.value = `Generado el ${new Date().toLocaleString('es-PE')}   ·   ${rows.length} comprobante${rows.length !== 1 ? 's' : ''}`;
    h3.font  = { name: 'Arial', size: 9, italic: true, color: { argb: 'FF' + COLORS.headerFont } };
    h3.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + COLORS.accent } };
    h3.alignment = { vertical: 'middle', horizontal: 'left', indent: 2 };
    wsSummary.getRow(3).height = 18;

    // Accent bar
    wsSummary.mergeCells('A4:I4');
    wsSummary.getCell('A4').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + COLORS.accent } };
    wsSummary.getRow(4).height = 4;

    // ── KPIs en cuadrícula 4×2 ───────────────────────────────────────────
    if (kpis) {
        const totalMonto      = rows.reduce((s, r) => s + (r.order_total ?? r.amount), 0);
        const totalComisiones = rows.reduce((s, r) => s + (r.commission_amount ?? 0), 0);
        const aceptados       = rows.filter(r => r.sunat_status === 'ACCEPTED').length;
        const rechazados      = rows.filter(r => r.sunat_status === 'REJECTED' || r.sunat_status === 'OBSERVED').length;

        wsSummary.addRow([]);
        wsSummary.getRow(5).height = 8;

        wsSummary.mergeCells('A6:I6');
        const kpiTitle = wsSummary.getCell('A6');
        kpiTitle.value = 'INDICADORES CLAVE DE RENDIMIENTO';
        kpiTitle.font  = { name: 'Arial', bold: true, size: 8, color: { argb: 'FF' + COLORS.headerFont } };
        kpiTitle.alignment = { vertical: 'middle', indent: 1 };
        wsSummary.getRow(6).height = 18;

        const kpiData = [
            { label: 'Facturado mes actual',    value: `S/ ${kpis.totalFacturadoMesActual.toLocaleString('es-PE', { minimumFractionDigits: 2 })}` },
            { label: 'Total monto filtrado',     value: `S/ ${totalMonto.toLocaleString('es-PE', { minimumFractionDigits: 2 })}` },
            { label: 'Comisiones generadas',     value: `S/ ${totalComisiones.toLocaleString('es-PE', { minimumFractionDigits: 2 })}` },
            { label: 'Aceptados SUNAT',          value: String(aceptados) },
            { label: 'Facturado mes anterior',   value: `S/ ${kpis.totalFacturadoMesAnterior.toLocaleString('es-PE', { minimumFractionDigits: 2 })}` },
            { label: 'Crecimiento mensual',      value: `${kpis.porcentajeCrecimiento >= 0 ? '+' : ''}${kpis.porcentajeCrecimiento.toFixed(1)}%` },
            { label: 'Ticket promedio',          value: `S/ ${kpis.montoPromedio.toLocaleString('es-PE', { minimumFractionDigits: 2 })}` },
            { label: 'Observados / Rechazados',  value: String(rechazados) },
        ];

        const kpiCols = [1, 3, 5, 7];
        kpiData.forEach((k, i) => {
            const row = i < 4 ? 7 : 9;
            const col = kpiCols[i % 4];
            writeKpiBlock(wsSummary, row, col, k.label, k.value);
        });

        [1, 3, 5, 7].forEach(c => { wsSummary.getColumn(c).width = 28; });
        [2, 4, 6, 8].forEach(c => { wsSummary.getColumn(c).width = 2; });

        wsSummary.getRow(11).height = 10;

        // ── Top Sellers ─────────────────────────────────────────────────
        if (kpis.topSellers.length > 0) {
            const tsRow = wsSummary.addRow([]);
            tsRow.height = 8;

            const tsTitleRow = wsSummary.addRow([]);
            wsSummary.mergeCells(`A${tsTitleRow.number}:G${tsTitleRow.number}`);
            const tsTitle = tsTitleRow.getCell(1);
            tsTitle.value = 'TOP VENDEDORES — MES ACTUAL';
            tsTitle.font  = { name: 'Arial', bold: true, size: 8, color: { argb: 'FF' + COLORS.headerBg } };
            tsTitleRow.height = 18;

            const tsHeadRow = wsSummary.addRow(['#', 'Tienda / Vendedor', '', 'Total Vendido', '', '% del Total', '']);
            ['A', 'B', 'C', 'D', 'E', 'F', 'G'].forEach(col => {
                const cell = tsHeadRow.getCell(col);
                cell.font  = { name: 'Arial', bold: true, size: 9, color: { argb: 'FF' + COLORS.headerFont } };
                cell.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + COLORS.headerBg } };
                cell.alignment = { horizontal: 'center', vertical: 'middle' };
                cell.border = { bottom: { style: 'medium', color: { argb: 'FF' + COLORS.border } } };
            });
            tsHeadRow.height = 24;

            const totalTS = kpis.topSellers.reduce((a, s) => a + s.totalVendido, 0);
            kpis.topSellers.forEach((s, i) => {
                const pct = totalTS > 0 ? ((s.totalVendido / totalTS) * 100).toFixed(1) : '0.0';
                const row = wsSummary.addRow([i + 1, s.name, '', s.totalVendido, '', `${pct}%`, '']);
                row.getCell(4).numFmt    = '"S/ "#,##0.00';
                row.getCell(4).alignment = { horizontal: 'right', vertical: 'middle' };
                row.getCell(6).alignment = { horizontal: 'center', vertical: 'middle' };
                row.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };

                const fillArgb = i % 2 === 0 ? 'FF' + COLORS.accentStripe : 'FFFFFFFF';
                ['A', 'B', 'C', 'D', 'E', 'F', 'G'].forEach(col => {
                    row.getCell(col).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: fillArgb } };
                    row.getCell(col).border = borderHair();
                    if (!row.getCell(col).font?.bold) row.getCell(col).font = { name: 'Arial', size: 9 };
                });
                row.height = 20;
            });
        }
    }

    wsSummary.getColumn(9).width = 4;

    // ══════════════════════════════════════════════════════════════════════
    // HOJA 2: Detalle de Comprobantes
    // ══════════════════════════════════════════════════════════════════════
    const wsDetail = wb.addWorksheet('Comprobantes', {
        pageSetup: { paperSize: 9, orientation: 'landscape', fitToPage: true, fitToWidth: 1 },
        properties: { tabColor: { argb: 'FF' + COLORS.accent } },
    });

    const NCOLS = 10;
    wsDetail.mergeCells(1, 1, 1, NCOLS);
    const dTitle = wsDetail.getCell('A1');
    dTitle.value = 'LYRIUM BIOMARKETPLACE — Detalle de Comprobantes Electrónicos';
    dTitle.font  = { name: 'Arial', bold: true, size: 14, color: { argb: 'FF' + COLORS.titleFont } };
    dTitle.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + COLORS.titleBg } };
    dTitle.alignment = { vertical: 'middle', horizontal: 'left', indent: 2 };
    wsDetail.getRow(1).height = 38;

    wsDetail.mergeCells(2, 1, 2, NCOLS);
    const dSub = wsDetail.getCell('A2');
    dSub.value = `Generado: ${new Date().toLocaleString('es-PE')}   ·   ${rows.length} registro${rows.length !== 1 ? 's' : ''}`;
    dSub.font  = { name: 'Arial', size: 9, italic: true, color: { argb: 'FF' + COLORS.headerFont } };
    dSub.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + COLORS.accent } };
    dSub.alignment = { vertical: 'middle', horizontal: 'left', indent: 2 };
    wsDetail.getRow(2).height = 20;

    // Accent bar
    wsDetail.mergeCells(3, 1, 3, NCOLS);
    wsDetail.getCell('A3').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + COLORS.accent } };
    wsDetail.getRow(3).height = 4;

    const COLS = [
        { header: 'Vendedor',     key: 'seller',     width: 22 },
        { header: 'Tienda',       key: 'store',      width: 26 },
        { header: 'Tipo',         key: 'type',       width: 13 },
        { header: 'Serie-Código', key: 'series',     width: 17 },
        { header: 'Cliente',      key: 'customer',   width: 26 },
        { header: 'RUC',          key: 'ruc',        width: 15 },
        { header: 'Monto',        key: 'amount',     width: 16 },
        { header: 'Comisión',     key: 'commission', width: 22 },
        { header: 'Estado SUNAT', key: 'status',     width: 18 },
        { header: 'Fecha',        key: 'date',       width: 14 },
    ];

    wsDetail.columns = COLS.map(c => ({ key: c.key, width: c.width })) as ExcelJS.Column[];

    // Header row (fila 4)
    const hRow = wsDetail.getRow(4);
    hRow.height = 28;
    COLS.forEach((c, i) => applyHeaderCell(hRow.getCell(i + 1), c.header));
    hRow.commit();

    // Data rows
    rows.forEach((r, idx) => {
        const storeName = r.stores[0]?.name ?? '—';
        const row = wsDetail.addRow({
            seller:     r.seller_name || '—',
            store:      storeName,
            type:       r.type,
            series:     `${r.series}-${r.number}`,
            customer:   r.customer_name || '—',
            ruc:        r.customer_ruc  || '—',
            amount:     r.order_total ?? r.amount,
            commission: fmtCommission(r.commission_rate, r.commission_amount),
            status:     STATUS_LABEL[r.sunat_status] ?? r.sunat_status,
            date:       fmtDate(r.emission_date),
        });

        row.getCell('amount').numFmt     = '"S/ "#,##0.00';
        row.getCell('amount').alignment  = { horizontal: 'right',  vertical: 'middle' };
        row.getCell('commission').alignment = { horizontal: 'center', vertical: 'middle' };
        row.getCell('series').alignment  = { horizontal: 'center', vertical: 'middle' };
        row.getCell('type').alignment    = { horizontal: 'center', vertical: 'middle' };
        row.getCell('date').alignment    = { horizontal: 'center', vertical: 'middle' };

        const st = STATUS_STYLE[r.sunat_status];
        if (st) {
            row.getCell('status').font = { name: 'Arial', bold: true, size: 9, color: { argb: st.fg } };
            row.getCell('status').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: st.bg } };
            row.getCell('status').alignment = { horizontal: 'center', vertical: 'middle' };
        }

        const isEven = idx % 2 === 0;
        row.eachCell({ includeEmpty: true }, (cell, colNum) => {
            if (!cell.font?.bold) cell.font = { name: 'Arial', size: 9 };
            if (colNum !== 9) {
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: isEven ? 'FF' + COLORS.accentStripe : 'FFFFFFFF' } };
            }
            cell.border = borderHair();
            if (!cell.alignment) cell.alignment = { vertical: 'middle' };
        });

        row.height = 18;
        row.commit();
    });

    // Total row
    const totalMonto      = rows.reduce((s, r) => s + (r.order_total ?? r.amount), 0);
    const totalComisiones = rows.reduce((s, r) => s + (r.commission_amount ?? 0), 0);

    const totalRow = wsDetail.addRow({
        seller:     `TOTAL — ${rows.length} comprobante${rows.length !== 1 ? 's' : ''}`,
        amount:     totalMonto,
        commission: `S/ ${totalComisiones.toFixed(2)}`,
    });
    totalRow.eachCell({ includeEmpty: true }, cell => {
        cell.fill   = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + COLORS.totalBg } };
        cell.border = { top: { style: 'medium', color: { argb: 'FF' + COLORS.border } } };
        cell.font   = { name: 'Arial', size: 9, color: { argb: 'FF' + COLORS.headerFont } };
    });
    totalRow.getCell('seller').font     = { name: 'Arial', bold: true, size: 9, color: { argb: 'FF' + COLORS.headerFont } };
    totalRow.getCell('amount').font     = { name: 'Arial', bold: true, size: 10, color: { argb: 'FF' + COLORS.headerFont } };
    totalRow.getCell('amount').numFmt   = '"S/ "#,##0.00';
    totalRow.getCell('amount').alignment = { horizontal: 'right', vertical: 'middle' };
    totalRow.getCell('commission').font  = { name: 'Arial', bold: true, size: 9, color: { argb: 'FF78C850' } };
    totalRow.getCell('commission').alignment = { horizontal: 'center', vertical: 'middle' };
    totalRow.height = 24;
    totalRow.commit();

    wsDetail.views = [{ state: 'frozen', ySplit: 4 }];
    wsDetail.autoFilter = {
        from: { row: 4, column: 1 },
        to:   { row: 4 + rows.length, column: COLS.length },
    };

    const buffer = await wb.xlsx.writeBuffer();
    saveAs(
        new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }),
        `facturacion-admin-${new Date().toISOString().slice(0, 10)}.xlsx`
    );
}
