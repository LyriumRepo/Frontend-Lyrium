import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { saveAs } from 'file-saver';
import type { AdminInvoiceRow, AdminInvoiceKPIs } from '../hooks/useAdminInvoices';

// ─── Paleta Lyrium ─────────────────────────────────────────────────────────
const BRAND      = [11,  26,  16]  as [number, number, number]; // #0B1A10
const BRAND_MID  = [6,   78,  59]  as [number, number, number]; // #064E3B
const GREEN      = [16, 185, 129]  as [number, number, number]; // #10B981
const GREEN_LIGHT= [236,253,245]   as [number, number, number]; // #ECFDF5
const GREEN_PALE = [167,243,208]   as [number, number, number]; // #A7F3D0
const TEAL       = [6,  182, 212]  as [number, number, number]; // #06B6D4
const AMBER      = [245,158,  11]  as [number, number, number]; // #F59E0B
const INDIGO     = [99, 102, 241]  as [number, number, number]; // #6366F1
const ROSE       = [244, 63,  94]  as [number, number, number]; // #F43F5E
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

const STATUS_BG: Record<string, [number,number,number]> = {
    ACCEPTED:      [209,250,229],
    SENT_WAIT_CDR: [254,243,199],
    REJECTED:      [255,228,230],
    OBSERVED:      [254,243,199],
    DRAFT:         [243,244,246],
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

// ─── Franja lateral verde en cada página ───────────────────────────────────
function drawPageAccent(doc: jsPDF): void {
    doc.setFillColor(GREEN[0], GREEN[1], GREEN[2]);
    doc.rect(0, 0, 3, PH, 'F');
    doc.setFillColor(BRAND_MID[0], BRAND_MID[1], BRAND_MID[2]);
    doc.rect(3, 0, 1.5, PH, 'F');
}

// ─── KPI card ──────────────────────────────────────────────────────────────
function drawKpi(
    doc: jsPDF,
    label: string, value: string, sub: string,
    x: number, y: number, w: number, h: number,
    accent: [number,number,number]
): void {
    // Card con fondo verde muy suave
    doc.setFillColor(GREEN_LIGHT[0], GREEN_LIGHT[1], GREEN_LIGHT[2]);
    doc.roundedRect(x, y, w, h, 2.5, 2.5, 'F');
    // Borde lateral coloreado (accent)
    doc.setFillColor(accent[0], accent[1], accent[2]);
    doc.roundedRect(x, y, 2, h, 1, 1, 'F');
    // Barra superior completa
    doc.setFillColor(accent[0], accent[1], accent[2]);
    doc.rect(x, y, w, 1.2, 'F');
    // Label
    doc.setTextColor(G[500][0], G[500][1], G[500][2]);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(5);
    doc.text(label.toUpperCase(), x + 5, y + 7);
    // Value
    doc.setTextColor(BRAND[0], BRAND[1], BRAND[2]);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.text(value, x + 5, y + 14);
    // Subtext
    if (sub) {
        doc.setTextColor(G[400][0], G[400][1], G[400][2]);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(4.8);
        doc.text(sub, x + 5, y + 19);
    }
    // Dot decorativo accent
    doc.setFillColor(accent[0], accent[1], accent[2]);
    doc.circle(x + w - 5, y + h - 5, 2.5, 'F');
}

// ─── Footer ────────────────────────────────────────────────────────────────
function drawFooter(doc: jsPDF, page: number, total: number): void {
    const y = PH - 8;
    // Línea separadora con gradiente visual (dos segmentos)
    doc.setDrawColor(GREEN[0], GREEN[1], GREEN[2]);
    doc.setLineWidth(0.6);
    doc.line(ML, y - 2, ML + CW * 0.3, y - 2);
    doc.setDrawColor(G[200][0], G[200][1], G[200][2]);
    doc.setLineWidth(0.3);
    doc.line(ML + CW * 0.3, y - 2, ML + CW, y - 2);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(5.5);
    doc.setTextColor(GREEN[0], GREEN[1], GREEN[2]);
    doc.text('Lyrium BioMarketplace', ML, y + 1);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(G[400][0], G[400][1], G[400][2]);
    doc.text(' — Reporte de Facturación Electrónica · Confidencial', ML + 22, y + 1);

    doc.setTextColor(G[500][0], G[500][1], G[500][2]);
    doc.text(
        `Generado: ${new Date().toLocaleString('es-PE')}  |  Página ${page} de ${total}`,
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

    // ── Header principal ────────────────────────────────────────────────────
    // Fondo oscuro
    doc.setFillColor(BRAND[0], BRAND[1], BRAND[2]);
    doc.rect(0, 0, PW, 30, 'F');
    // Franja verde inferior del header
    doc.setFillColor(GREEN[0], GREEN[1], GREEN[2]);
    doc.rect(0, 28, PW, 2.5, 'F');
    // Detalle decorativo — triángulo/codo derecho
    doc.setFillColor(BRAND_MID[0], BRAND_MID[1], BRAND_MID[2]);
    doc.rect(PW - 60, 0, 60, 28, 'F');
    doc.setFillColor(GREEN[0], GREEN[1], GREEN[2]);
    doc.rect(PW - 62, 0, 2.5, 28, 'F');

    // Logo
    if (logo) doc.addImage(logo, 'PNG', ML + 4, 4, 30, 13);

    // Nombre empresa
    doc.setTextColor(GREEN_PALE[0], GREEN_PALE[1], GREEN_PALE[2]);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.text('LYRIUM BIOMARKETPLACE', ML + 4, 20.5);

    // Título del reporte (derecha)
    doc.setTextColor(GREEN[0], GREEN[1], GREEN[2]);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.text('FACTURACIÓN ELECTRÓNICA', PW - MR - 4, 11, { align: 'right' });

    doc.setTextColor(GREEN_PALE[0], GREEN_PALE[1], GREEN_PALE[2]);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    const rangeTxt = dateRange?.from && dateRange?.to
        ? `Período: ${fmtDate(dateRange.from)} — ${fmtDate(dateRange.to)}`
        : `Generado: ${new Date().toLocaleDateString('es-PE', { day:'2-digit', month:'long', year:'numeric' })}`;
    doc.text(`Reporte Administrativo  ·  ${rows.length} comprobante${rows.length !== 1 ? 's' : ''}  ·  ${rangeTxt}`, PW - MR - 4, 20.5, { align: 'right' });

    let y = 36;

    // ── KPI Cards ───────────────────────────────────────────────────────────
    if (kpis) {
        const totalComisiones = rows.reduce((s, r) => s + (r.commission_amount ?? 0), 0);
        const totalMonto      = rows.reduce((s, r) => s + (r.order_total ?? r.amount), 0);
        const aceptados       = rows.filter(r => r.sunat_status === 'ACCEPTED').length;
        const rechazados      = rows.filter(r => r.sunat_status === 'REJECTED' || r.sunat_status === 'OBSERVED').length;

        const cards = [
            { label: 'Facturado Mes Actual',  value: fmtCurrency(kpis.totalFacturadoMesActual),  sub: `vs ${fmtCurrency(kpis.totalFacturadoMesAnterior)} mes ant.`, color: GREEN  },
            { label: 'Total Filtrado',         value: fmtCurrency(totalMonto),                    sub: `${rows.length} comprobantes`,                               color: TEAL   },
            { label: 'Comisiones Generadas',   value: fmtCurrency(totalComisiones),               sub: 'sobre comprobantes filtrados',                              color: AMBER  },
            { label: 'Crecimiento Mensual',    value: `${kpis.porcentajeCrecimiento >= 0 ? '+' : ''}${kpis.porcentajeCrecimiento.toFixed(1)}%`, sub: 'respecto mes anterior', color: kpis.porcentajeCrecimiento >= 0 ? GREEN : ROSE },
            { label: 'Aceptados SUNAT',        value: String(aceptados),                          sub: `${rechazados} observados/rechazados`,                       color: INDIGO },
            { label: 'Ticket Promedio',        value: fmtCurrency(kpis.montoPromedio),            sub: 'por comprobante emitido',                                   color: TEAL   },
        ];

        const cardW = (CW - 5 * 4) / 6;
        const cardH = 24;
        cards.forEach((c, i) => {
            drawKpi(doc, c.label, c.value, c.sub, ML + i * (cardW + 4), y, cardW, cardH, c.color as [number,number,number]);
        });
        y += cardH + 7;

        // Top sellers mini-table
        if (kpis.topSellers.length > 0) {
            // Título sección
            doc.setFillColor(BRAND[0], BRAND[1], BRAND[2]);
            doc.roundedRect(ML, y, 92, 6, 1, 1, 'F');
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(6);
            doc.setTextColor(GREEN[0], GREEN[1], GREEN[2]);
            doc.text('TOP VENDEDORES — MES ACTUAL', ML + 3, y + 4);
            y += 8;

            autoTable(doc, {
                startY: y,
                head: [['#', 'Tienda', 'Facturado', '% del Total']],
                body: kpis.topSellers.map((s, i) => {
                    const total = kpis.topSellers.reduce((a, x) => a + x.totalVendido, 0);
                    const pct   = total > 0 ? ((s.totalVendido / total) * 100).toFixed(1) : '0.0';
                    return [String(i + 1), s.name, fmtCurrency(s.totalVendido), `${pct}%`];
                }),
                theme: 'plain',
                headStyles: {
                    fillColor: [BRAND_MID[0],BRAND_MID[1],BRAND_MID[2]],
                    textColor: [GREEN_PALE[0],GREEN_PALE[1],GREEN_PALE[2]],
                    fontSize: 6, fontStyle: 'bold',
                },
                bodyStyles: { fontSize: 6 },
                alternateRowStyles: { fillColor: [GREEN_LIGHT[0],GREEN_LIGHT[1],GREEN_LIGHT[2]] },
                columnStyles: { 0:{cellWidth:8}, 1:{cellWidth:52}, 2:{cellWidth:26,halign:'right'}, 3:{cellWidth:18,halign:'right'} },
                margin: { left: ML, right: ML + CW - 108 },
                tableLineColor: [GREEN_PALE[0],GREEN_PALE[1],GREEN_PALE[2]],
                tableLineWidth: 0.15,
            });

            y = (doc as any).lastAutoTable.finalY + 7;
        }
    }

    // ── Separador de sección ────────────────────────────────────────────────
    doc.setFillColor(GREEN[0], GREEN[1], GREEN[2]);
    doc.rect(ML, y, CW, 0.7, 'F');
    y += 4;

    // Título sección comprobantes
    doc.setFillColor(BRAND[0], BRAND[1], BRAND[2]);
    doc.roundedRect(ML, y - 0.5, 58, 6.5, 1, 1, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(GREEN[0], GREEN[1], GREEN[2]);
    doc.text('DETALLE DE COMPROBANTES', ML + 3, y + 4);
    y += 9;

    // ── Tabla principal ─────────────────────────────────────────────────────
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
                textColor: [GREEN_PALE[0], GREEN_PALE[1], GREEN_PALE[2]],
                fontSize: 6.5, fontStyle: 'bold', halign: 'center',
                cellPadding: { top:3, bottom:3, left:2, right:2 },
            },
            bodyStyles: { fontSize: 6, cellPadding: 2 },
            alternateRowStyles: { fillColor: [GREEN_LIGHT[0], GREEN_LIGHT[1], GREEN_LIGHT[2]] },
            columnStyles: {
                0: { cellWidth: 36, halign: 'left' },
                1: { cellWidth: 16, halign: 'center' },
                2: { cellWidth: 24, halign: 'center', font: 'courier' },
                3: { cellWidth: 36, halign: 'left' },
                4: { cellWidth: 22, halign: 'center' },
                5: { cellWidth: 24, halign: 'right' },
                6: { cellWidth: 30, halign: 'center' },
                7: { cellWidth: 22, halign: 'center' },
                8: { cellWidth: 20, halign: 'center' },
            },
            margin: { left: ML, right: MR },
            tableLineColor: [GREEN_PALE[0], GREEN_PALE[1], GREEN_PALE[2]],
            tableLineWidth: 0.15,
            showHead: 'everyPage',
            didDrawCell: (data) => {
                if (data.column.index === 7 && data.section === 'body') {
                    const rawStatus = rows[data.row.index]?.sunat_status;
                    const color  = STATUS_COLOR[rawStatus] ?? G[400];
                    const bgColor = STATUS_BG[rawStatus] ?? G[100];
                    const cx = data.cell.x + 1.5;
                    const cy = data.cell.y + 1.5;
                    const cw = data.cell.width - 3;
                    const ch = data.cell.height - 3;
                    // Pill background
                    doc.setFillColor(bgColor[0], bgColor[1], bgColor[2]);
                    doc.roundedRect(cx, cy, cw, ch, ch / 2, ch / 2, 'F');
                    // Text
                    doc.setTextColor(color[0], color[1], color[2]);
                    doc.setFont('helvetica', 'bold');
                    doc.setFontSize(5.5);
                    doc.text(
                        STATUS_LABEL[rawStatus] ?? rawStatus,
                        data.cell.x + data.cell.width / 2,
                        data.cell.y + data.cell.height / 2 + 1,
                        { align: 'center' }
                    );
                }
            },
        });

        // Fila de totales
        const finalY = (doc as any).lastAutoTable.finalY + 3;
        const totalMonto      = rows.reduce((s, r) => s + (r.order_total ?? r.amount), 0);
        const totalComisiones = rows.reduce((s, r) => s + (r.commission_amount ?? 0), 0);

        doc.setFillColor(BRAND[0], BRAND[1], BRAND[2]);
        doc.roundedRect(ML, finalY, CW, 9, 1.5, 1.5, 'F');
        doc.setFillColor(GREEN[0], GREEN[1], GREEN[2]);
        doc.roundedRect(ML, finalY, 3, 9, 1.5, 1.5, 'F');

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(6.5);
        doc.setTextColor(G[400][0], G[400][1], G[400][2]);
        doc.text('TOTAL GENERAL', ML + 6, finalY + 6);

        doc.setTextColor(GREEN[0], GREEN[1], GREEN[2]);
        doc.setFontSize(7.5);
        doc.text(fmtCurrency(totalMonto), ML + 48, finalY + 6);

        doc.setTextColor(G[400][0], G[400][1], G[400][2]);
        doc.setFontSize(6);
        doc.text('·  Comisiones:', ML + 78, finalY + 6);

        doc.setTextColor(AMBER[0], AMBER[1], AMBER[2]);
        doc.setFontSize(7.5);
        doc.text(fmtCurrency(totalComisiones), ML + 102, finalY + 6);

        doc.setTextColor(G[500][0], G[500][1], G[500][2]);
        doc.setFontSize(6);
        doc.text(`·  ${rows.length} comprobantes`, ML + 130, finalY + 6);
    }

    // ── Franja lateral y footers (todas las páginas) ────────────────────────
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        drawPageAccent(doc);
        drawFooter(doc, i, totalPages);
    }

    saveAs(doc.output('blob'), `facturacion-admin-${new Date().toISOString().slice(0,10)}.pdf`);
}
