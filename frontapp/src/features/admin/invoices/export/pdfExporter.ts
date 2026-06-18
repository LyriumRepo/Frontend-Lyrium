import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { saveAs } from 'file-saver';
import type { AdminInvoiceRow, AdminInvoiceKPIs } from '../hooks/useAdminInvoices';

// ─── Paleta ────────────────────────────────────────────────────────────────
const BRAND  = [11,  26,  16]  as [number, number, number]; // dark bg
const GREEN  = [16, 185, 129]  as [number, number, number]; // emerald-500
const TEAL   = [6,  182, 212]  as [number, number, number]; // cyan-500
const AMBER  = [245,158,  11]  as [number, number, number]; // amber-500
const INDIGO = [99, 102, 241]  as [number, number, number]; // indigo-500
const ROSE   = [244, 63,  94]  as [number, number, number]; // rose-500
const G = {
    50:  [249,250,251] as [number,number,number],
    100: [243,244,246] as [number,number,number],
    200: [229,231,235] as [number,number,number],
    300: [209,213,219] as [number,number,number],
    400: [156,163,175] as [number,number,number],
    500: [107,114,128] as [number,number,number],
    600: [75, 85, 99]  as [number,number,number],
    700: [55, 65, 81]  as [number,number,number],
    800: [31, 41, 55]  as [number,number,number],
    900: [17, 24, 39]  as [number,number,number],
};

const PW = 297, PH = 210; // A4 landscape
const ML = 14, MR = 14, CW = PW - ML - MR;

// ─── Helpers ───────────────────────────────────────────────────────────────
const STATUS_LABEL: Record<string, string> = {
    ACCEPTED:      'Aceptado',
    SENT_WAIT_CDR: 'Pend. CDR',
    REJECTED:      'Rechazado',
    OBSERVED:      'Observado',
    DRAFT:         'Borrador',
};

const STATUS_COLOR: Record<string, [number,number,number]> = {
    ACCEPTED:      GREEN,
    SENT_WAIT_CDR: AMBER,
    REJECTED:      ROSE,
    OBSERVED:      AMBER,
    DRAFT:         G[400],
};

function fmtDate(d: string): string {
    if (!d) return '—';
    try { return new Date(d).toLocaleDateString('es-PE', { day:'2-digit', month:'short', year:'numeric' }); }
    catch { return d; }
}

function fmtCurrency(n: number | null | undefined): string {
    if (n == null) return '—';
    return `S/ ${n.toLocaleString('es-PE', { minimumFractionDigits:2, maximumFractionDigits:2 })}`;
}

function fmtCommission(rate: number | null, amount: number | null): string {
    if (rate == null || amount == null) return '—';
    const pct = rate > 1 ? Math.round(rate) : Math.round(rate * 100);
    return `${pct}%  ·  S/ ${amount.toFixed(2)}`;
}

async function loadImageB64(url: string): Promise<string | null> {
    try {
        const r = await fetch(url);
        const b = await r.blob();
        return new Promise((resolve, reject) => {
            const fr = new FileReader();
            fr.onload  = () => resolve(fr.result as string);
            fr.onerror = reject;
            fr.readAsDataURL(b);
        });
    } catch { return null; }
}

// ─── KPI card ──────────────────────────────────────────────────────────────
function drawKpi(
    doc: jsPDF,
    label: string, value: string, sub: string,
    x: number, y: number, w: number, h: number,
    accent: [number,number,number]
): void {
    // Card bg
    doc.setFillColor(G[50][0], G[50][1], G[50][2]);
    doc.roundedRect(x, y, w, h, 2, 2, 'F');
    // Accent top bar
    doc.setFillColor(accent[0], accent[1], accent[2]);
    doc.rect(x, y, w, 1.5, 'F');
    // Label
    doc.setTextColor(G[500][0], G[500][1], G[500][2]);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(5.5);
    doc.text(label.toUpperCase(), x + 4, y + 7);
    // Value
    doc.setTextColor(G[800][0], G[800][1], G[800][2]);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text(value, x + 4, y + 14);
    // Subtext
    if (sub) {
        doc.setTextColor(G[400][0], G[400][1], G[400][2]);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(5);
        doc.text(sub, x + 4, y + 19);
    }
}

// ─── Footer ────────────────────────────────────────────────────────────────
function drawFooter(doc: jsPDF, page: number, total: number): void {
    const y = PH - 8;
    doc.setDrawColor(G[200][0], G[200][1], G[200][2]);
    doc.setLineWidth(0.3);
    doc.line(ML, y - 2, ML + CW, y - 2);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(5.5);
    doc.setTextColor(G[400][0], G[400][1], G[400][2]);
    doc.text('Lyrium BioMarketplace — Reporte de Facturación Electrónica · Confidencial', ML, y + 1);
    doc.text(
        `Generado: ${new Date().toLocaleString('es-PE')}  |  Pág. ${page} de ${total}`,
        ML + CW, y + 1, { align: 'right' }
    );
}

// ─── Main export ───────────────────────────────────────────────────────────
export async function exportAdminInvoicesToPdf(
    rows: AdminInvoiceRow[],
    kpis: AdminInvoiceKPIs | null,
    dateRange?: { from: string; to: string }
): Promise<void> {
    const logo = await loadImageB64('/img/logo.png');
    const doc  = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

    // ── Header ──────────────────────────────────────────────────────────────
    doc.setFillColor(BRAND[0], BRAND[1], BRAND[2]);
    doc.rect(0, 0, PW, 26, 'F');
    doc.setFillColor(GREEN[0], GREEN[1], GREEN[2]);
    doc.rect(0, 24, PW, 2, 'F');

    if (logo) doc.addImage(logo, 'PNG', ML, 3, 32, 14);

    doc.setTextColor(GREEN[0], GREEN[1], GREEN[2]);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(15);
    doc.text('REPORTE DE FACTURACIÓN ELECTRÓNICA', PW - MR, 11, { align: 'right' });

    doc.setTextColor(G[400][0], G[400][1], G[400][2]);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    const rangeTxt = dateRange?.from && dateRange?.to
        ? `Período: ${fmtDate(dateRange.from)} — ${fmtDate(dateRange.to)}`
        : `Generado: ${new Date().toLocaleDateString('es-PE', { weekday:'long', day:'2-digit', month:'long', year:'numeric' })}`;
    doc.text(`Panel Administrador  ·  ${rows.length} comprobante${rows.length !== 1 ? 's' : ''}  ·  ${rangeTxt}`, PW - MR, 19, { align: 'right' });

    let y = 32;

    // ── KPI Cards ───────────────────────────────────────────────────────────
    if (kpis) {
        const totalComisiones = rows.reduce((s, r) => s + (r.commission_amount ?? 0), 0);
        const totalMonto      = rows.reduce((s, r) => s + (r.order_total ?? r.amount), 0);
        const aceptados       = rows.filter(r => r.sunat_status === 'ACCEPTED').length;
        const rechazados      = rows.filter(r => r.sunat_status === 'REJECTED' || r.sunat_status === 'OBSERVED').length;

        const cards = [
            { label: 'Facturado Mes Actual',   value: fmtCurrency(kpis.totalFacturadoMesActual),  sub: `vs ${fmtCurrency(kpis.totalFacturadoMesAnterior)} mes anterior`, color: GREEN  },
            { label: 'Total Monto (filtrado)',  value: fmtCurrency(totalMonto),                    sub: `${rows.length} comprobantes`,                                    color: TEAL   },
            { label: 'Comisiones Generadas',   value: fmtCurrency(totalComisiones),               sub: 'sobre comprobantes filtrados',                                   color: AMBER  },
            { label: 'Crecimiento Mensual',    value: `${kpis.porcentajeCrecimiento >= 0 ? '+' : ''}${kpis.porcentajeCrecimiento.toFixed(1)}%`, sub: 'respecto al mes anterior', color: kpis.porcentajeCrecimiento >= 0 ? GREEN : ROSE },
            { label: 'Aceptados SUNAT',        value: String(aceptados),                          sub: `${rechazados} observados/rechazados`,                            color: INDIGO },
            { label: 'Ticket Promedio',        value: fmtCurrency(kpis.montoPromedio),            sub: 'por comprobante emitido',                                        color: TEAL   },
        ];

        const cardW = (CW - 5 * 3) / 6;
        const cardH = 23;
        cards.forEach((c, i) => {
            drawKpi(doc, c.label, c.value, c.sub, ML + i * (cardW + 3), y, cardW, cardH, c.color as [number,number,number]);
        });
        y += cardH + 6;

        // Top sellers mini-table
        if (kpis.topSellers.length > 0) {
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(6.5);
            doc.setTextColor(G[600][0], G[600][1], G[600][2]);
            doc.text('TOP VENDEDORES (mes actual)', ML, y + 4);
            y += 6;

            autoTable(doc, {
                startY: y,
                head: [['#', 'Tienda', 'Facturado', '% del Total']],
                body: kpis.topSellers.map((s, i) => {
                    const total = kpis.topSellers.reduce((a, x) => a + x.totalVendido, 0);
                    const pct   = total > 0 ? ((s.totalVendido / total) * 100).toFixed(1) : '0.0';
                    return [String(i + 1), s.name, fmtCurrency(s.totalVendido), `${pct}%`];
                }),
                theme: 'plain',
                headStyles: { fillColor: [GREEN[0],GREEN[1],GREEN[2]], textColor:[255,255,255], fontSize:6, fontStyle:'bold' },
                bodyStyles: { fontSize: 6 },
                columnStyles: { 0:{cellWidth:8}, 1:{cellWidth:50}, 2:{cellWidth:25,halign:'right'}, 3:{cellWidth:18,halign:'right'} },
                margin: { left: ML, right: ML + CW - 105 },
                tableLineColor: [G[200][0],G[200][1],G[200][2]],
                tableLineWidth: 0.1,
            });

            y = (doc as any).lastAutoTable.finalY + 6;
        }
    }

    // ── Divider ─────────────────────────────────────────────────────────────
    doc.setDrawColor(GREEN[0], GREEN[1], GREEN[2]);
    doc.setLineWidth(0.5);
    doc.line(ML, y, ML + CW, y);
    y += 5;

    // Section title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(G[700][0], G[700][1], G[700][2]);
    doc.text('DETALLE DE COMPROBANTES', ML, y);
    y += 4;

    // ── Main table ──────────────────────────────────────────────────────────
    if (rows.length === 0) {
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(9);
        doc.setTextColor(G[400][0], G[400][1], G[400][2]);
        doc.text('No se encontraron comprobantes con los filtros aplicados.', ML, y + 6);
    } else {
        autoTable(doc, {
            startY: y,
            head: [['Vendedor / Tienda', 'Tipo', 'Serie-Código', 'Cliente', 'RUC', 'Monto', 'Comisión', 'Estado', 'Fecha']],
            body: rows.map(r => {
                const storeName = r.stores[0]?.name ?? '—';
                const vendedor  = r.seller_name ? `${r.seller_name}\n${storeName}` : storeName;
                return [
                    vendedor,
                    r.type,
                    `${r.series}-${r.number}`,
                    r.customer_name || '—',
                    r.customer_ruc  || '—',
                    fmtCurrency(r.order_total ?? r.amount),
                    fmtCommission(r.commission_rate, r.commission_amount),
                    STATUS_LABEL[r.sunat_status] ?? r.sunat_status,
                    fmtDate(r.emission_date),
                ];
            }),
            theme: 'striped',
            headStyles: {
                fillColor: [BRAND[0], BRAND[1], BRAND[2]],
                textColor: [GREEN[0], GREEN[1], GREEN[2]],
                fontSize: 6.5, fontStyle: 'bold', halign: 'center',
            },
            bodyStyles: { fontSize: 6, cellPadding: 2 },
            alternateRowStyles: { fillColor: [G[50][0], G[50][1], G[50][2]] },
            columnStyles: {
                0: { cellWidth: 36, halign: 'left' },
                1: { cellWidth: 16, halign: 'center' },
                2: { cellWidth: 24, halign: 'center', font: 'courier' },
                3: { cellWidth: 36, halign: 'left' },
                4: { cellWidth: 22, halign: 'center' },
                5: { cellWidth: 24, halign: 'right' },
                6: { cellWidth: 30, halign: 'center' },
                7: { cellWidth: 20, halign: 'center' },
                8: { cellWidth: 22, halign: 'center' },
            },
            margin: { left: ML, right: MR },
            tableLineColor: [G[200][0], G[200][1], G[200][2]],
            tableLineWidth: 0.1,
            showHead: 'everyPage',
            didDrawCell: (data) => {
                // Color badge en columna Estado
                if (data.column.index === 7 && data.section === 'body') {
                    const rawStatus = rows[data.row.index]?.sunat_status;
                    const color = STATUS_COLOR[rawStatus] ?? G[400];
                    doc.setTextColor(color[0], color[1], color[2]);
                    doc.setFont('helvetica', 'bold');
                    doc.setFontSize(6);
                    doc.text(
                        STATUS_LABEL[rawStatus] ?? rawStatus,
                        data.cell.x + data.cell.width / 2,
                        data.cell.y + data.cell.height / 2 + 1,
                        { align: 'center' }
                    );
                }
            },
        });

        // Totals row
        const finalY = (doc as any).lastAutoTable.finalY + 4;
        const totalMonto      = rows.reduce((s, r) => s + (r.order_total ?? r.amount), 0);
        const totalComisiones = rows.reduce((s, r) => s + (r.commission_amount ?? 0), 0);

        doc.setFillColor(BRAND[0], BRAND[1], BRAND[2]);
        doc.rect(ML, finalY, CW, 8, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7);
        doc.setTextColor(GREEN[0], GREEN[1], GREEN[2]);
        doc.text(`TOTAL GENERAL:  ${fmtCurrency(totalMonto)}   ·   Comisiones: ${fmtCurrency(totalComisiones)}   ·   ${rows.length} comprobantes`, ML + 4, finalY + 5);
    }

    // ── Footers ─────────────────────────────────────────────────────────────
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        drawFooter(doc, i, totalPages);
    }

    saveAs(doc.output('blob'), `facturacion-admin-${new Date().toISOString().slice(0,10)}.pdf`);
}
