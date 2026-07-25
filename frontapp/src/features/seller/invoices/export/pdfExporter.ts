import type { Voucher, InvoiceKPIs } from '../types';

// ── Paleta oficial Lyrium (clara/profesional, igual que seller/sales) ─────
const C = {
    primary:  [34,  197, 94]  as [number, number, number], // #22c55e
    secondary:[22,  163, 74]  as [number, number, number], // #16a34a
    teal:     [21,  128, 61]  as [number, number, number], // #15803d
    darkTeal: [22,  101, 52]  as [number, number, number], // #166534
    blue:     [34,  197, 94]  as [number, number, number], // #22c55e
    navy:     [22,  101, 52]  as [number, number, number],
};

// Colores semánticos de estado
const STATUS_LABEL: Record<string, string> = {
    ACCEPTED:      'Aceptado',
    SENT_WAIT_CDR: 'Pend. CDR',
    REJECTED:      'Rechazado',
    OBSERVED:      'Observado',
    DRAFT:         'Borrador',
};

const STATUS_COLOR: Record<string, [number, number, number]> = {
    ACCEPTED:      [21,  128, 61],
    SENT_WAIT_CDR: [161, 98,  7],
    REJECTED:      [220, 38,  38],
    OBSERVED:      [161, 98,  7],
    DRAFT:         [107, 114, 128],
};

const G = {
    50:  [249, 250, 251] as [number, number, number],
    100: [243, 244, 246] as [number, number, number],
    200: [229, 231, 235] as [number, number, number],
    400: [156, 163, 175] as [number, number, number],
    500: [107, 114, 128] as [number, number, number],
    600: [75,  85,  99]  as [number, number, number],
    700: [55,  65,  81]  as [number, number, number],
    800: [31,  41,  55]  as [number, number, number],
    900: [17,  24,  39]  as [number, number, number],
};

const PW = 210, PH = 297;
const ML = 14, MR = 14, CW = PW - ML - MR;

function fmtDate(d: string): string {
    if (!d) return '—';
    try { return new Date(d).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' }); }
    catch { return d; }
}

function fmtCurrency(n: number | null | undefined): string {
    if (n == null) return '—';
    return `S/ ${n.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function fmtCommission(rate: number | null | undefined, amount: number | null | undefined): string {
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

function drawKpi(
    doc: any,
    label: string, value: string, sub: string,
    x: number, y: number, w: number, h: number,
    accent: [number, number, number]
): void {
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(x, y, w, h, 2, 2, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.2);
    doc.roundedRect(x, y, w, h, 2, 2, 'S');
    doc.setFillColor(accent[0], accent[1], accent[2]);
    doc.rect(x, y, w, 1.5, 'F');
    doc.setFillColor(accent[0], accent[1], accent[2]);
    doc.rect(x, y, 2.5, h, 'F');
    doc.setTextColor(100, 116, 139);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(5.5);
    doc.text(label.toUpperCase(), x + 5, y + 8);
    doc.setTextColor(30, 41, 59);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text(value, x + 5, y + 16);
    if (sub) {
        doc.setTextColor(100, 116, 139);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(5);
        doc.text(sub, x + 5, y + 21);
    }
}

function drawFooter(doc: any, page: number, total: number): void {
    const y = PH - 8;
    doc.setDrawColor(C.primary[0], C.primary[1], C.primary[2]);
    doc.setLineWidth(0.5);
    doc.line(ML, y - 2, ML + 20, y - 2);
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.line(ML + 20, y - 2, ML + CW, y - 2);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(5.5);
    doc.setTextColor(C.teal[0], C.teal[1], C.teal[2]);
    doc.text('Lyrium BioMarketplace', ML, y + 1);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(' — Mis Comprobantes Electrónicos · Confidencial', ML + 22, y + 1);
    doc.text(
        `Generado: ${new Date().toLocaleString('es-PE')}  |  Pág. ${page} de ${total}`,
        ML + CW, y + 1, { align: 'right' }
    );
}

export async function exportInvoicesToPdf(
    vouchers: Voucher[],
    kpis: InvoiceKPIs | null
): Promise<void> {
    const [{ jsPDF: JsPDF }, { default: autoTable }, { saveAs }] = await Promise.all([
        import('jspdf'),
        import('jspdf-autotable'),
        import('file-saver'),
    ]);
    const logo = await loadImageB64('/img/logo.png');
    const doc  = new JsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

    // ── Header (estilo ventas) ───────────────────────────────────────────
    doc.setFillColor(248, 250, 252);
    doc.rect(0, 0, PW, 22, 'F');
    doc.setFillColor(C.primary[0], C.primary[1], C.primary[2]);
    doc.rect(0, 20, PW, 2, 'F');

    if (logo) doc.addImage(logo, 'PNG', ML, 2, 38, 17);

    doc.setTextColor(C.teal[0], C.teal[1], C.teal[2]);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.text('MIS COMPROBANTES ELECTRÓNICOS', PW - MR, 9, { align: 'right' });
    doc.setTextColor(100, 116, 139);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.text(
        `Panel Vendedor  ·  ${vouchers.length} comprobante${vouchers.length !== 1 ? 's' : ''}  ·  ${new Date().toLocaleDateString('es-PE', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}`,
        PW - MR, 16, { align: 'right' }
    );

    let y = 28;

    // ── KPI Cards ────────────────────────────────────────────────────────
    if (kpis) {
        const totalMonto      = vouchers.reduce((s, v) => s + (v.order_total ?? v.amount), 0);
        const totalComisiones = vouchers.reduce((s, v) => s + (v.commission_amount ?? 0), 0);
        const netoVendedor    = totalMonto - totalComisiones;
        const aceptados       = vouchers.filter(v => v.sunat_status === 'ACCEPTED').length;

        const cards = [
            { label: 'Total Facturado',  value: fmtCurrency(kpis.totalFacturado),  sub: 'mes actual',             color: C.primary  },
            { label: 'Total Monto',      value: fmtCurrency(totalMonto),            sub: `${vouchers.length} cpte`, color: C.teal     },
            { label: 'Comisión Lyrium',  value: fmtCurrency(totalComisiones),       sub: 'descontado por Lyrium',  color: C.darkTeal },
            { label: 'Neto Vendedor',    value: fmtCurrency(netoVendedor),          sub: 'monto - comisión',       color: C.primary  },
            { label: 'Tasa de Éxito',    value: `${kpis.successRate.toFixed(1)}%`, sub: 'aceptados SUNAT',        color: C.secondary},
            { label: 'Aceptados',        value: String(aceptados),                  sub: `de ${vouchers.length}`,  color: C.darkTeal },
        ];

        const cardW = (CW - 2 * 4) / 3;
        const cardH = 24;

        cards.slice(0, 3).forEach((card, i) => {
            drawKpi(doc, card.label, card.value, card.sub, ML + i * (cardW + 4), y, cardW, cardH, card.color);
        });
        y += cardH + 4;
        cards.slice(3).forEach((card, i) => {
            drawKpi(doc, card.label, card.value, card.sub, ML + i * (cardW + 4), y, cardW, cardH, card.color);
        });
        y += cardH + 6;
    }

    // ── Separador + título sección ───────────────────────────────────────
    doc.setDrawColor(C.secondary[0], C.secondary[1], C.secondary[2]);
    doc.setLineWidth(0.6);
    doc.line(ML, y, ML + 14, y);
    y += 4;
    doc.setFillColor(C.darkTeal[0], C.darkTeal[1], C.darkTeal[2]);
    doc.rect(ML, y, 2.5, 8, 'F');
    doc.setTextColor(G[800][0], G[800][1], G[800][2]);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.text('DETALLE DE COMPROBANTES', ML + 6, y + 5.5);
    y += 12;

    // ── Tabla principal ──────────────────────────────────────────────────
    if (vouchers.length === 0) {
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(9);
        doc.setTextColor(G[400][0], G[400][1], G[400][2]);
        doc.text('No se encontraron comprobantes con los filtros aplicados.', ML, y + 6);
    } else {
        autoTable(doc, {
            startY: y,
            head: [['Tipo', 'Serie-Código', 'Tienda', 'Monto', 'Comisión', 'Estado', 'Fecha']],
            body: vouchers.map(v => [
                v.type,
                `${v.series}-${v.number}`,
                v.store_name || '—',
                fmtCurrency(v.order_total ?? v.amount),
                fmtCommission(v.commission_rate, v.commission_amount),
                STATUS_LABEL[v.sunat_status] ?? v.sunat_status,
                fmtDate(v.emission_date),
            ]),
            theme: 'striped',
            headStyles: {
                fillColor: [220, 252, 231],
                textColor: [21, 128, 61],
                fontSize: 7, fontStyle: 'bold', halign: 'center',
            },
            bodyStyles: { fontSize: 6.5, cellPadding: 2.5, fillColor: [255, 255, 255], textColor: [30, 41, 59] },
            alternateRowStyles: { fillColor: [248, 250, 252] },
            columnStyles: {
                0: { cellWidth: 18, halign: 'center' },
                1: { cellWidth: 26, halign: 'center', font: 'courier' },
                2: { cellWidth: 'auto', halign: 'left' },
                3: { cellWidth: 24, halign: 'right' },
                4: { cellWidth: 32, halign: 'center' },
                5: { cellWidth: 22, halign: 'center' },
                6: { cellWidth: 22, halign: 'center' },
            },
            margin: { left: ML, right: MR },
            tableLineColor: [226, 232, 240],
            tableLineWidth: 0.1,
            showHead: 'everyPage',
            didDrawCell: (data) => {
                if (data.column.index === 5 && data.section === 'body') {
                    const rawStatus = vouchers[data.row.index]?.sunat_status;
                    const label = STATUS_LABEL[rawStatus] ?? rawStatus;
                    if (!label) return;
                    const color = STATUS_COLOR[rawStatus] ?? G[400];
                    doc.setTextColor(color[0], color[1], color[2]);
                    doc.setFont('helvetica', 'bold');
                    doc.setFontSize(6.5);
                    doc.text(
                        label,
                        data.cell.x + data.cell.width / 2,
                        data.cell.y + data.cell.height / 2 + 1,
                        { align: 'center' }
                    );
                }
            },
        });

        // Totales
        const finalY = (doc as any).lastAutoTable.finalY + 4;
        const totalMonto      = vouchers.reduce((s, v) => s + (v.order_total ?? v.amount), 0);
        const totalComisiones = vouchers.reduce((s, v) => s + (v.commission_amount ?? 0), 0);

        doc.setFillColor(C.primary[0], C.primary[1], C.primary[2]);
        doc.rect(ML, finalY, CW, 8, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7);
        doc.setTextColor(G[900][0], G[900][1], G[900][2]);
        doc.text(
            `TOTAL: ${fmtCurrency(totalMonto)}   ·   Comisión Lyrium: ${fmtCurrency(totalComisiones)}   ·   Neto: ${fmtCurrency(totalMonto - totalComisiones)}`,
            ML + 4, finalY + 5
        );
    }

    // ── Footers ─────────────────────────────────────────────────────────
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        drawFooter(doc, i, totalPages);
    }

    saveAs(doc.output('blob'), `mis-comprobantes-${new Date().toISOString().slice(0, 10)}.pdf`);
}
