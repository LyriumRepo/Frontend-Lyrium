import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import type { AdminInvoiceRow, AdminInvoiceKPIs } from '../hooks/useAdminInvoices';

// ─── Paleta Lyrium ─────────────────────────────────────────────────────────
const C = {
    darkBg:      '0B1A10',
    darkMid:     '064E3B',
    darkLight:   '065F46',
    green:       '10B981',
    greenPale:   'A7F3D0',
    greenLight:  'ECFDF5',
    greenBorder: 'BBF7D0',
    teal:        '06B6D4',
    tealLight:   'CFFAFE',
    amber:       'F59E0B',
    amberLight:  'FEF3C7',
    rose:        'F43F5E',
    roseLight:   'FFE4E6',
    indigo:      '6366F1',
    indigoLight: 'E0E7FF',
    white:       'FFFFFF',
    gray50:      'F9FAFB',
    gray100:     'F3F4F6',
    gray200:     'E5E7EB',
    gray400:     '9CA3AF',
    gray500:     '6B7280',
    gray600:     '4B5563',
    gray700:     '374151',
    gray800:     '1F2937',
};

const STATUS_LABEL: Record<string, string> = {
    ACCEPTED:      'Aceptado',
    SENT_WAIT_CDR: 'Pendiente CDR',
    REJECTED:      'Rechazado',
    OBSERVED:      'Observado',
    DRAFT:         'Borrador',
};

const STATUS_STYLE: Record<string, { fg: string; bg: string }> = {
    ACCEPTED:      { fg: 'FF' + C.green,  bg: 'FF' + C.greenLight  },
    SENT_WAIT_CDR: { fg: 'FF' + C.amber,  bg: 'FF' + C.amberLight  },
    REJECTED:      { fg: 'FF' + C.rose,   bg: 'FF' + C.roseLight   },
    OBSERVED:      { fg: 'FF' + C.amber,  bg: 'FF' + C.amberLight  },
    DRAFT:         { fg: 'FF' + C.gray500,bg: 'FF' + C.gray100      },
};

function fmtDate(d: string): string {
    if (!d) return '—';
    try { return new Date(d).toLocaleDateString('es-PE', { day:'2-digit', month:'2-digit', year:'numeric' }); }
    catch { return d; }
}

function fmtCommission(rate: number | null, amount: number | null): string {
    if (rate == null || amount == null) return '—';
    const pct = rate > 1 ? Math.round(rate) : Math.round(rate * 100);
    return `${pct}% · S/ ${amount.toFixed(2)}`;
}

function border(style: ExcelJS.BorderStyle = 'thin', color = C.gray200): Partial<ExcelJS.Borders> {
    const s = { style, color: { argb: 'FF' + color } };
    return { top: s, left: s, bottom: s, right: s };
}

function borderBottom(style: ExcelJS.BorderStyle = 'medium', color = C.green): Partial<ExcelJS.Borders> {
    return { bottom: { style, color: { argb: 'FF' + color } } };
}

function applyHeaderCell(
    cell: ExcelJS.Cell,
    value: string,
    opts: { align?: ExcelJS.Alignment['horizontal']; size?: number } = {}
): void {
    cell.value = value;
    cell.font  = { name: 'Calibri', bold: true, size: opts.size ?? 9, color: { argb: 'FF' + C.white } };
    cell.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + C.darkBg } };
    cell.alignment = { vertical: 'middle', horizontal: opts.align ?? 'center', wrapText: true };
    cell.border = borderBottom('medium', C.green);
}

// ─── KPI card en Excel (ocupa 2 filas, 2 columnas) ─────────────────────────
function writeKpiBlock(
    ws: ExcelJS.Worksheet,
    startRow: number,
    col: number,
    label: string,
    value: string,
    accent: string,
    accentBg: string,
): void {
    // Fila 1: accent top + label
    const r1 = ws.getRow(startRow);
    r1.height = 14;
    const c1 = r1.getCell(col);
    c1.value = label.toUpperCase();
    c1.font  = { name: 'Calibri', bold: true, size: 7, color: { argb: 'FF' + C.gray600 } };
    c1.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + accentBg } };
    c1.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
    c1.border = {
        top:   { style: 'medium', color: { argb: 'FF' + accent } },
        left:  { style: 'thin',   color: { argb: 'FF' + C.gray200 } },
        right: { style: 'thin',   color: { argb: 'FF' + C.gray200 } },
    };

    // Fila 2: value
    const r2 = ws.getRow(startRow + 1);
    r2.height = 22;
    const c2 = r2.getCell(col);
    c2.value = value;
    c2.font  = { name: 'Calibri', bold: true, size: 13, color: { argb: 'FF' + accent } };
    c2.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + accentBg } };
    c2.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
    c2.border = {
        bottom: { style: 'thin', color: { argb: 'FF' + C.gray200 } },
        left:   { style: 'thin', color: { argb: 'FF' + C.gray200 } },
        right:  { style: 'thin', color: { argb: 'FF' + C.gray200 } },
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
        properties: { tabColor: { argb: 'FF' + C.green } },
    });

    // ── Branding header ─────────────────────────────────────────────────────
    wsSummary.mergeCells('A1:I1');
    const h1 = wsSummary.getCell('A1');
    h1.value = 'LYRIUM BIOMARKETPLACE';
    h1.font  = { name: 'Calibri', bold: true, size: 20, color: { argb: 'FF' + C.green } };
    h1.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + C.darkBg } };
    h1.alignment = { vertical: 'middle', horizontal: 'left', indent: 2 };
    wsSummary.getRow(1).height = 44;

    wsSummary.mergeCells('A2:I2');
    const h2 = wsSummary.getCell('A2');
    h2.value = 'Reporte de Facturación Electrónica — Panel Administrador';
    h2.font  = { name: 'Calibri', size: 11, color: { argb: 'FF' + C.greenPale } };
    h2.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + C.darkMid } };
    h2.alignment = { vertical: 'middle', horizontal: 'left', indent: 2 };
    wsSummary.getRow(2).height = 24;

    wsSummary.mergeCells('A3:I3');
    const h3 = wsSummary.getCell('A3');
    h3.value = `Generado el ${new Date().toLocaleString('es-PE')}   ·   ${rows.length} comprobante${rows.length !== 1 ? 's' : ''}`;
    h3.font  = { name: 'Calibri', size: 9, italic: true, color: { argb: 'FF' + C.gray400 } };
    h3.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + C.darkLight } };
    h3.alignment = { vertical: 'middle', horizontal: 'left', indent: 2 };
    wsSummary.getRow(3).height = 18;

    // Accent bar
    wsSummary.mergeCells('A4:I4');
    wsSummary.getCell('A4').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + C.green } };
    wsSummary.getRow(4).height = 4;

    // ── KPIs en cuadrícula 4×2 ──────────────────────────────────────────────
    if (kpis) {
        const totalMonto      = rows.reduce((s, r) => s + (r.order_total ?? r.amount), 0);
        const totalComisiones = rows.reduce((s, r) => s + (r.commission_amount ?? 0), 0);
        const aceptados       = rows.filter(r => r.sunat_status === 'ACCEPTED').length;
        const rechazados      = rows.filter(r => r.sunat_status === 'REJECTED' || r.sunat_status === 'OBSERVED').length;

        wsSummary.addRow([]); // fila 5 — spacer
        wsSummary.getRow(5).height = 8;

        // Título sección KPIs
        wsSummary.mergeCells('A6:I6');
        const kpiTitle = wsSummary.getCell('A6');
        kpiTitle.value = 'INDICADORES CLAVE DE RENDIMIENTO';
        kpiTitle.font  = { name: 'Calibri', bold: true, size: 8, color: { argb: 'FF' + C.gray600 } };
        kpiTitle.alignment = { vertical: 'middle', indent: 1 };
        wsSummary.getRow(6).height = 18;

        // KPIs en 4 columnas, 2 filas (fila 7-8 y 9-10)
        const kpiData = [
            { label: 'Facturado mes actual',    value: `S/ ${kpis.totalFacturadoMesActual.toLocaleString('es-PE',{minimumFractionDigits:2})}`,   accent: C.green,  bg: C.greenLight  },
            { label: 'Total monto filtrado',     value: `S/ ${totalMonto.toLocaleString('es-PE',{minimumFractionDigits:2})}`,                      accent: C.teal,   bg: C.tealLight   },
            { label: 'Comisiones generadas',     value: `S/ ${totalComisiones.toLocaleString('es-PE',{minimumFractionDigits:2})}`,                 accent: C.amber,  bg: C.amberLight  },
            { label: 'Aceptados SUNAT',          value: String(aceptados),                                                                          accent: C.green,  bg: C.greenLight  },
            { label: 'Facturado mes anterior',   value: `S/ ${kpis.totalFacturadoMesAnterior.toLocaleString('es-PE',{minimumFractionDigits:2})}`,  accent: C.teal,   bg: C.tealLight   },
            { label: 'Crecimiento mensual',      value: `${kpis.porcentajeCrecimiento >= 0 ? '+' : ''}${kpis.porcentajeCrecimiento.toFixed(1)}%`,  accent: kpis.porcentajeCrecimiento >= 0 ? C.green : C.rose, bg: kpis.porcentajeCrecimiento >= 0 ? C.greenLight : C.roseLight },
            { label: 'Ticket promedio',          value: `S/ ${kpis.montoPromedio.toLocaleString('es-PE',{minimumFractionDigits:2})}`,              accent: C.indigo, bg: C.indigoLight },
            { label: 'Observados / Rechazados',  value: String(rechazados),                                                                          accent: C.rose,   bg: C.roseLight   },
        ];

        // 4 KPIs por fila, 2 filas → columnas A,C,E,G (con espacio B,D,F,H entre tarjetas)
        const kpiCols = [1, 3, 5, 7]; // A, C, E, G
        kpiData.forEach((k, i) => {
            const row  = i < 4 ? 7 : 9;
            const col  = kpiCols[i % 4];
            writeKpiBlock(wsSummary, row, col, k.label, k.value, k.accent, k.bg);
        });

        // Ajuste de ancho para columnas de tarjeta y separadores
        [1,3,5,7].forEach(c => { wsSummary.getColumn(c).width = 28; });
        [2,4,6,8].forEach(c => { wsSummary.getColumn(c).width = 2; });

        // Spacer
        wsSummary.getRow(11).height = 10;

        // ── Top Sellers ──────────────────────────────────────────────────────
        if (kpis.topSellers.length > 0) {
            const tsRow = wsSummary.addRow([]); // fila 12
            tsRow.height = 8;

            const tsTitleRow = wsSummary.addRow([]);
            wsSummary.mergeCells(`A${tsTitleRow.number}:G${tsTitleRow.number}`);
            const tsTitle = tsTitleRow.getCell(1);
            tsTitle.value = 'TOP VENDEDORES — MES ACTUAL';
            tsTitle.font  = { name: 'Calibri', bold: true, size: 8, color: { argb: 'FF' + C.gray600 } };
            tsTitleRow.height = 18;

            const tsHeadRow = wsSummary.addRow(['#', 'Tienda / Vendedor', '', 'Total Vendido', '', '% del Total', '']);
            ['A','B','C','D','E','F','G'].forEach((col, i) => {
                const cell = tsHeadRow.getCell(col);
                cell.font  = { name: 'Calibri', bold: true, size: 9, color: { argb: 'FF' + C.white } };
                cell.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + C.darkBg } };
                cell.alignment = { horizontal: 'center', vertical: 'middle' };
                cell.border = { bottom: { style: 'medium', color: { argb: 'FF' + C.green } } };
            });
            tsHeadRow.height = 24;

            const totalTS = kpis.topSellers.reduce((a, s) => a + s.totalVendido, 0);
            kpis.topSellers.forEach((s, i) => {
                const pct  = totalTS > 0 ? ((s.totalVendido / totalTS) * 100).toFixed(1) : '0.0';
                const row  = wsSummary.addRow([i + 1, s.name, '', s.totalVendido, '', `${pct}%`, '']);
                row.getCell(4).numFmt = '"S/ "#,##0.00';
                row.getCell(4).alignment = { horizontal: 'right', vertical: 'middle' };
                row.getCell(6).alignment = { horizontal: 'center', vertical: 'middle' };
                row.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };

                const fillArgb = i % 2 === 0 ? 'FF' + C.greenLight : 'FF' + C.white;
                ['A','B','C','D','E','F','G'].forEach(col => {
                    row.getCell(col).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: fillArgb } };
                    row.getCell(col).border = border('hair', C.greenBorder);
                    if (!row.getCell(col).font?.bold) {
                        row.getCell(col).font = { name: 'Calibri', size: 9 };
                    }
                });
                row.height = 20;
            });
        }
    }

    wsSummary.getColumn(9).width = 4; // margen derecho

    // ══════════════════════════════════════════════════════════════════════
    // HOJA 2: Detalle de Comprobantes
    // ══════════════════════════════════════════════════════════════════════
    const wsDetail = wb.addWorksheet('Comprobantes', {
        pageSetup: { paperSize: 9, orientation: 'landscape', fitToPage: true, fitToWidth: 1 },
        properties: { tabColor: { argb: 'FF' + C.darkMid } },
    });

    // ── Header ──────────────────────────────────────────────────────────────
    const NCOLS = 10;
    wsDetail.mergeCells(1, 1, 1, NCOLS);
    const dTitle = wsDetail.getCell('A1');
    dTitle.value = 'LYRIUM BIOMARKETPLACE — Detalle de Comprobantes Electrónicos';
    dTitle.font  = { name: 'Calibri', bold: true, size: 14, color: { argb: 'FF' + C.green } };
    dTitle.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + C.darkBg } };
    dTitle.alignment = { vertical: 'middle', horizontal: 'left', indent: 2 };
    wsDetail.getRow(1).height = 38;

    wsDetail.mergeCells(2, 1, 2, NCOLS);
    const dSub = wsDetail.getCell('A2');
    dSub.value = `Generado: ${new Date().toLocaleString('es-PE')}   ·   ${rows.length} registro${rows.length !== 1 ? 's' : ''}`;
    dSub.font  = { name: 'Calibri', size: 9, italic: true, color: { argb: 'FF' + C.greenPale } };
    dSub.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + C.darkMid } };
    dSub.alignment = { vertical: 'middle', horizontal: 'left', indent: 2 };
    wsDetail.getRow(2).height = 20;

    // Accent bar
    wsDetail.mergeCells(3, 1, 3, NCOLS);
    wsDetail.getCell('A3').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + C.green } };
    wsDetail.getRow(3).height = 4;

    // ── Definición de columnas ───────────────────────────────────────────────
    const COLS = [
        { header: 'Vendedor',     key: 'seller',    width: 22 },
        { header: 'Tienda',       key: 'store',     width: 26 },
        { header: 'Tipo',         key: 'type',      width: 13 },
        { header: 'Serie-Código', key: 'series',    width: 17 },
        { header: 'Cliente',      key: 'customer',  width: 26 },
        { header: 'RUC',          key: 'ruc',       width: 15 },
        { header: 'Monto',        key: 'amount',    width: 16 },
        { header: 'Comisión',     key: 'commission',width: 22 },
        { header: 'Estado SUNAT', key: 'status',    width: 18 },
        { header: 'Fecha',        key: 'date',      width: 14 },
    ];

    wsDetail.columns = COLS.map(c => ({ key: c.key, width: c.width })) as ExcelJS.Column[];

    // ── Fila de encabezados (fila 4) ────────────────────────────────────────
    const hRow = wsDetail.getRow(4);
    hRow.height = 28;
    COLS.forEach((c, i) => {
        applyHeaderCell(hRow.getCell(i + 1), c.header);
    });
    hRow.commit();

    // ── Filas de datos ───────────────────────────────────────────────────────
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

        row.getCell('amount').numFmt = '"S/ "#,##0.00';
        row.getCell('amount').alignment    = { horizontal: 'right',  vertical: 'middle' };
        row.getCell('commission').alignment = { horizontal: 'center', vertical: 'middle' };
        row.getCell('series').alignment    = { horizontal: 'center', vertical: 'middle' };
        row.getCell('type').alignment      = { horizontal: 'center', vertical: 'middle' };
        row.getCell('date').alignment      = { horizontal: 'center', vertical: 'middle' };

        // Estado con color
        const st = STATUS_STYLE[r.sunat_status];
        if (st) {
            row.getCell('status').font = { name: 'Calibri', bold: true, size: 9, color: { argb: st.fg } };
            row.getCell('status').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: st.bg } };
            row.getCell('status').alignment = { horizontal: 'center', vertical: 'middle' };
        }

        // Filas alternas con tinte verde muy suave
        const fillArgb = idx % 2 === 0 ? 'FF' + C.gray50 : 'FF' + C.white;
        row.eachCell({ includeEmpty: true }, (cell, colNum) => {
            if (!cell.font?.bold) cell.font = { name: 'Calibri', size: 9 };
            // No sobreescribir fondo del estado
            if (colNum !== 9) {
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: fillArgb } };
            }
            cell.border = border('hair', C.gray200);
            if (!cell.alignment) cell.alignment = { vertical: 'middle' };
        });

        row.height = 18;
        row.commit();
    });

    // ── Fila de totales ──────────────────────────────────────────────────────
    const totalMonto      = rows.reduce((s, r) => s + (r.order_total ?? r.amount), 0);
    const totalComisiones = rows.reduce((s, r) => s + (r.commission_amount ?? 0), 0);

    const totalRow = wsDetail.addRow({
        seller:     `TOTAL — ${rows.length} comprobante${rows.length !== 1 ? 's' : ''}`,
        amount:     totalMonto,
        commission: `S/ ${totalComisiones.toFixed(2)}`,
    });

    totalRow.eachCell({ includeEmpty: true }, cell => {
        cell.fill   = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + C.darkBg } };
        cell.border = { top: { style: 'medium', color: { argb: 'FF' + C.green } } };
        cell.font   = { name: 'Calibri', size: 9 };
    });
    totalRow.getCell('seller').font     = { name: 'Calibri', bold: true, size: 9, color: { argb: 'FF' + C.greenPale } };
    totalRow.getCell('amount').font     = { name: 'Calibri', bold: true, size: 10, color: { argb: 'FF' + C.green } };
    totalRow.getCell('amount').numFmt   = '"S/ "#,##0.00';
    totalRow.getCell('amount').alignment = { horizontal: 'right', vertical: 'middle' };
    totalRow.getCell('commission').font  = { name: 'Calibri', bold: true, size: 9, color: { argb: 'FF' + C.amber } };
    totalRow.getCell('commission').alignment = { horizontal: 'center', vertical: 'middle' };
    totalRow.height = 24;
    totalRow.commit();

    // ── Freeze + autofilter ─────────────────────────────────────────────────
    wsDetail.views = [{ state: 'frozen', ySplit: 4 }];
    wsDetail.autoFilter = {
        from: { row: 4, column: 1 },
        to:   { row: 4 + rows.length, column: COLS.length },
    };

    const buffer = await wb.xlsx.writeBuffer();
    saveAs(
        new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }),
        `facturacion-admin-${new Date().toISOString().slice(0,10)}.xlsx`
    );
}
