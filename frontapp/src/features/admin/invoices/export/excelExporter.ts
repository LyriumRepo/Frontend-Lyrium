import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import type { AdminInvoiceRow, AdminInvoiceKPIs } from '../hooks/useAdminInvoices';

const C = {
    darkBg:    '0B1A10',
    green:     '10B981',
    greenDark: '064E3B',
    greenMid:  '047857',
    greenLight:'ECFDF5',
    greenBorder:'A7F3D0',
    amber:     'F59E0B',
    rose:      'F43F5E',
    teal:      '06B6D4',
    white:     'FFFFFF',
    gray50:    'F9FAFB',
    gray100:   'F3F4F6',
    gray200:   'E5E7EB',
    gray400:   '9CA3AF',
    gray600:   '4B5563',
    gray800:   '1F2937',
};

const STATUS_LABEL: Record<string, string> = {
    ACCEPTED:      'Aceptado',
    SENT_WAIT_CDR: 'Pendiente CDR',
    REJECTED:      'Rechazado',
    OBSERVED:      'Observado',
    DRAFT:         'Borrador',
};

const STATUS_COLOR: Record<string, string> = {
    ACCEPTED:      'FF10B981',
    SENT_WAIT_CDR: 'FFF59E0B',
    REJECTED:      'FFF43F5E',
    OBSERVED:      'FFF59E0B',
    DRAFT:         'FF9CA3AF',
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

function border(style: ExcelJS.BorderStyle = 'thin'): Partial<ExcelJS.Borders> {
    const s = { style, color: { argb: 'FF' + C.gray200 } };
    return { top: s, left: s, bottom: s, right: s };
}

export async function exportAdminInvoicesToExcel(
    rows: AdminInvoiceRow[],
    kpis: AdminInvoiceKPIs | null,
): Promise<void> {
    if (rows.length === 0) return;

    const wb = new ExcelJS.Workbook();
    wb.creator = 'Lyrium BioMarketplace';
    wb.created = new Date();

    // ── Hoja 1: Resumen ────────────────────────────────────────────────────
    const wsSummary = wb.addWorksheet('Resumen', {
        pageSetup: { paperSize: 9, orientation: 'landscape' },
        properties: { tabColor: { argb: 'FF' + C.green } },
    });

    // Header branding
    wsSummary.mergeCells('A1:H1');
    const t1 = wsSummary.getCell('A1');
    t1.value = 'LYRIUM BIOMARKETPLACE';
    t1.font  = { name: 'Arial', bold: true, size: 18, color: { argb: 'FF' + C.green } };
    t1.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + C.darkBg } };
    t1.alignment = { vertical: 'middle', horizontal: 'left', indent: 2 };
    wsSummary.getRow(1).height = 40;

    wsSummary.mergeCells('A2:H2');
    const t2 = wsSummary.getCell('A2');
    t2.value = 'Reporte de Facturación Electrónica — Panel Administrador';
    t2.font  = { name: 'Arial', size: 11, color: { argb: 'FFA7F3D0' } };
    t2.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + C.darkBg } };
    t2.alignment = { vertical: 'middle', horizontal: 'left', indent: 2 };
    wsSummary.getRow(2).height = 22;

    wsSummary.mergeCells('A3:H3');
    const t3 = wsSummary.getCell('A3');
    t3.value = `Generado el ${new Date().toLocaleString('es-PE')}   ·   ${rows.length} comprobantes`;
    t3.font  = { name: 'Arial', size: 9, italic: true, color: { argb: 'FF' + C.gray400 } };
    t3.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + C.greenDark } };
    t3.alignment = { vertical: 'middle', horizontal: 'left', indent: 2 };
    wsSummary.getRow(3).height = 18;

    // Accent bar
    wsSummary.mergeCells('A4:H4');
    wsSummary.getCell('A4').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + C.green } };
    wsSummary.getRow(4).height = 3;

    // KPI section
    if (kpis) {
        const totalMonto      = rows.reduce((s, r) => s + (r.order_total ?? r.amount), 0);
        const totalComisiones = rows.reduce((s, r) => s + (r.commission_amount ?? 0), 0);
        const aceptados       = rows.filter(r => r.sunat_status === 'ACCEPTED').length;
        const rechazados      = rows.filter(r => r.sunat_status === 'REJECTED' || r.sunat_status === 'OBSERVED').length;

        wsSummary.addRow([]);
        const kpiHeaderRow = wsSummary.addRow(['INDICADORES CLAVE']);
        kpiHeaderRow.getCell(1).font = { name: 'Arial', bold: true, size: 9, color: { argb: 'FF' + C.gray600 } };
        kpiHeaderRow.height = 20;

        const kpiData = [
            ['Facturado mes actual',   `S/ ${kpis.totalFacturadoMesActual.toLocaleString('es-PE',{minimumFractionDigits:2})}`,  'FF' + C.green  ],
            ['Facturado mes anterior', `S/ ${kpis.totalFacturadoMesAnterior.toLocaleString('es-PE',{minimumFractionDigits:2})}`, 'FF06B6D4'       ],
            ['Crecimiento mensual',    `${kpis.porcentajeCrecimiento >= 0 ? '+' : ''}${kpis.porcentajeCrecimiento.toFixed(1)}%`,  kpis.porcentajeCrecimiento >= 0 ? 'FF' + C.green : 'FF' + C.rose ],
            ['Total monto (filtrado)', `S/ ${totalMonto.toLocaleString('es-PE',{minimumFractionDigits:2})}`,                     'FF' + C.teal   ],
            ['Comisiones generadas',   `S/ ${totalComisiones.toLocaleString('es-PE',{minimumFractionDigits:2})}`,                'FF' + C.amber  ],
            ['Ticket promedio',        `S/ ${kpis.montoPromedio.toLocaleString('es-PE',{minimumFractionDigits:2})}`,             'FF06B6D4'       ],
            ['Aceptados SUNAT',        String(aceptados),                                                                         'FF' + C.green  ],
            ['Observados / Rechazados',String(rechazados),                                                                        'FF' + C.rose   ],
        ];

        kpiData.forEach(([label, value, color]) => {
            const row = wsSummary.addRow([label, value]);
            row.getCell(1).font = { name: 'Arial', size: 9, color: { argb: 'FF' + C.gray600 } };
            row.getCell(2).font = { name: 'Arial', bold: true, size: 10, color: { argb: color as string } };
            row.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + C.gray50 } };
            row.getCell(2).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + C.gray50 } };
            row.getCell(1).border = border('hair');
            row.getCell(2).border = border('hair');
            row.height = 20;
        });

        // Top sellers
        if (kpis.topSellers.length > 0) {
            wsSummary.addRow([]);
            const tsHeader = wsSummary.addRow(['TOP VENDEDORES (mes actual)']);
            tsHeader.getCell(1).font = { name: 'Arial', bold: true, size: 9, color: { argb: 'FF' + C.gray600 } };
            tsHeader.height = 20;

            const tsHead = wsSummary.addRow(['#', 'Tienda', 'Total Vendido', '% del Total']);
            ['A','B','C','D'].forEach(col => {
                const cell = tsHead.getCell(col);
                cell.font  = { name: 'Arial', bold: true, size: 9, color: { argb: 'FF' + C.white } };
                cell.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + C.greenDark } };
                cell.alignment = { horizontal: 'center', vertical: 'middle' };
                cell.border = border();
            });
            tsHead.height = 22;

            const totalTS = kpis.topSellers.reduce((a, s) => a + s.totalVendido, 0);
            kpis.topSellers.forEach((s, i) => {
                const pct  = totalTS > 0 ? ((s.totalVendido / totalTS) * 100).toFixed(1) : '0.0';
                const row  = wsSummary.addRow([i + 1, s.name, s.totalVendido, `${pct}%`]);
                row.getCell(3).numFmt = '"S/ "#,##0.00';
                row.getCell(3).alignment = { horizontal: 'right' };
                row.getCell(4).alignment = { horizontal: 'center' };
                if (i % 2 === 0) {
                    ['A','B','C','D'].forEach(col => {
                        row.getCell(col).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + C.greenLight } };
                    });
                }
                ['A','B','C','D'].forEach(col => { row.getCell(col).border = border('hair'); });
                row.height = 18;
            });
        }
    }

    wsSummary.getColumn('A').width = 32;
    wsSummary.getColumn('B').width = 24;

    // ── Hoja 2: Detalle ────────────────────────────────────────────────────
    const wsDetail = wb.addWorksheet('Comprobantes', {
        pageSetup: { paperSize: 9, orientation: 'landscape', fitToPage: true, fitToWidth: 1 },
        properties: { tabColor: { argb: 'FF' + C.greenMid } },
    });

    // Header
    const COLS = [
        { header: 'Vendedor',     key: 'seller',    width: 24 },
        { header: 'Tienda',       key: 'store',     width: 28 },
        { header: 'Tipo',         key: 'type',      width: 14 },
        { header: 'Serie-Código', key: 'series',    width: 18 },
        { header: 'Cliente',      key: 'customer',  width: 28 },
        { header: 'RUC Cliente',  key: 'ruc',       width: 16 },
        { header: 'Monto',        key: 'amount',    width: 16 },
        { header: 'Comisión',     key: 'commission',width: 22 },
        { header: 'Estado SUNAT', key: 'status',    width: 18 },
        { header: 'Fecha',        key: 'date',      width: 16 },
    ];

    wsDetail.mergeCells(1, 1, 1, COLS.length);
    const dTitle = wsDetail.getCell('A1');
    dTitle.value = 'Lyrium BioMarketplace — Detalle de Comprobantes Electrónicos';
    dTitle.font  = { name: 'Arial', bold: true, size: 13, color: { argb: 'FF' + C.white } };
    dTitle.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + C.darkBg } };
    dTitle.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
    wsDetail.getRow(1).height = 30;

    wsDetail.mergeCells(2, 1, 2, COLS.length);
    const dSub = wsDetail.getCell('A2');
    dSub.value = `Generado: ${new Date().toLocaleString('es-PE')}   ·   ${rows.length} registros`;
    dSub.font  = { name: 'Arial', size: 9, italic: true, color: { argb: 'FFA7F3D0' } };
    dSub.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + C.greenDark } };
    dSub.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
    wsDetail.getRow(2).height = 18;

    // Column definitions
    wsDetail.columns = COLS.map(c => ({ key: c.key, width: c.width })) as ExcelJS.Column[];

    // Header row
    const hRow = wsDetail.getRow(3);
    hRow.height = 26;
    COLS.forEach((c, i) => {
        const cell = hRow.getCell(i + 1);
        cell.value = c.header;
        cell.font  = { name: 'Arial', bold: true, size: 9, color: { argb: 'FF' + C.white } };
        cell.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + C.darkBg } };
        cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
        cell.border = { bottom: { style: 'medium', color: { argb: 'FF' + C.green } } };
    });
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

        // Amount formatting
        row.getCell('amount').numFmt = '"S/ "#,##0.00';
        row.getCell('amount').alignment = { horizontal: 'right', vertical: 'middle' };
        row.getCell('commission').alignment = { horizontal: 'center', vertical: 'middle' };
        row.getCell('series').alignment = { horizontal: 'center', vertical: 'middle', wrapText: false };
        row.getCell('type').alignment   = { horizontal: 'center', vertical: 'middle' };
        row.getCell('date').alignment   = { horizontal: 'center', vertical: 'middle' };

        // Status color
        const statusColor = STATUS_COLOR[r.sunat_status];
        if (statusColor) {
            row.getCell('status').font = { name: 'Arial', bold: true, size: 9, color: { argb: statusColor } };
        }

        // Alternating rows
        const fillColor = idx % 2 === 0 ? 'FF' + C.gray50 : 'FF' + C.white;
        row.eachCell({ includeEmpty: true }, cell => {
            if (!cell.font?.bold) cell.font = { name: 'Arial', size: 9 };
            cell.fill   = { type: 'pattern', pattern: 'solid', fgColor: { argb: fillColor } };
            cell.border = border('hair');
        });

        row.height = 18;
        row.commit();
    });

    // Totals row
    const totalMonto      = rows.reduce((s, r) => s + (r.order_total ?? r.amount), 0);
    const totalComisiones = rows.reduce((s, r) => s + (r.commission_amount ?? 0), 0);
    const totalRow = wsDetail.addRow({
        seller:     `TOTAL (${rows.length} comprobantes)`,
        amount:     totalMonto,
        commission: `S/ ${totalComisiones.toFixed(2)}`,
    });
    totalRow.getCell('seller').font = { name: 'Arial', bold: true, size: 9, color: { argb: 'FF' + C.green } };
    totalRow.getCell('amount').font = { name: 'Arial', bold: true, size: 9, color: { argb: 'FF' + C.green } };
    totalRow.getCell('amount').numFmt = '"S/ "#,##0.00';
    totalRow.getCell('commission').font = { name: 'Arial', bold: true, size: 9, color: { argb: 'FF' + C.amber } };
    totalRow.eachCell({ includeEmpty: true }, cell => {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + C.darkBg } };
        cell.border = border();
    });
    totalRow.height = 22;
    totalRow.commit();

    wsDetail.views = [{ state: 'frozen', ySplit: 3 }];
    wsDetail.autoFilter = { from: { row: 3, column: 1 }, to: { row: 3 + rows.length, column: COLS.length } };

    const buffer = await wb.xlsx.writeBuffer();
    saveAs(
        new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }),
        `facturacion-admin-${new Date().toISOString().slice(0,10)}.xlsx`
    );
}
