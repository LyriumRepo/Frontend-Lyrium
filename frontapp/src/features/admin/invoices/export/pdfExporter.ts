import type { AdminInvoiceRow, AdminInvoiceKPIs } from '../hooks/useAdminInvoices';

// ── Paleta oficial Lyrium (clara/profesional, igual que seller/sales) ─────
const C = {
    primary:  [34,  197, 94]  as [number, number, number], // #22c55e
    secondary:[22,  163, 74]  as [number, number, number], // #16a34a
    teal:     [21,  128, 61]  as [number, number, number], // #15803d
    darkTeal: [22,  101, 52]  as [number, number, number], // #166534
    blue:     [34,  197, 94]  as [number, number, number], // #22c55e
    navy:     [22,  101, 52]  as [number, number, number],
    amber:    [217, 119, 6]   as [number, number, number], // #d97706
    rose:     [220, 38,  38]  as [number, number, number], // #dc2626
    indigo:   [21,  128, 61]  as [number, number, number],
};

const G = {
    50:  [249, 250, 251] as [number, number, number],
    100: [243, 244, 246] as [number, number, number],
    200: [229, 231, 235] as [number, number, number],
    300: [209, 213, 219] as [number, number, number],
    400: [156, 163, 175] as [number, number, number],
    500: [107, 114, 128] as [number, number, number],
    600: [75,  85,  99]  as [number, number, number],
    700: [55,  65,  81]  as [number, number, number],
    800: [31,  41,  55]  as [number, number, number],
    900: [17,  24,  39]  as [number, number, number],
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

const STATUS_COLOR: Record<string, [number, number, number]> = {
    ACCEPTED:      [21,  128, 61],
    SENT_WAIT_CDR: [161, 98,  7],
    REJECTED:      [220, 38,  38],
    OBSERVED:      [161, 98,  7],
    DRAFT:         [107, 114, 128],
};

const STATUS_BG: Record<string, [number, number, number]> = {
    ACCEPTED:      [220, 252, 231],
    SENT_WAIT_CDR: [236, 253, 215],
    REJECTED:      [255, 228, 230],
    OBSERVED:      [236, 253, 215],
    DRAFT:         [243, 244, 246],
};

function fmtDate(d: string): string {
    if (!d) return '—';
    try { return new Date(d).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' }); }
    catch { return d; }
}

function fmtCurrency(n: number | null | undefined): string {
    if (n == null) return '—';
    return `S/ ${n.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
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

function checkPage(doc: any, needed: number, y: number): number {
    if (y + needed > PH - 10) {
        doc.addPage();
        return ML;
    }
    return y;
}

// ── KPI card (estilo ventas) ─────────────────────────────────────────────
function drawKpi(
    doc: any,
    label: string, value: string, sub: string,
    x: number, y: number, w: number, h: number,
    accent: [number, number, number]
): void {
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(x, y, w, h, 2.5, 2.5, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.2);
    doc.roundedRect(x, y, w, h, 2.5, 2.5, 'S');
    doc.setFillColor(accent[0], accent[1], accent[2]);
    doc.rect(x, y, w, 1.2, 'F');
    doc.setFillColor(accent[0], accent[1], accent[2]);
    doc.rect(x, y, 2, h, 'F');
    doc.setTextColor(100, 116, 139);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(5);
    doc.text(label.toUpperCase(), x + 5, y + 7);
    doc.setTextColor(30, 41, 59);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.text(value, x + 5, y + 14);
    if (sub) {
        doc.setTextColor(100, 116, 139);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(4.8);
        doc.text(sub, x + 5, y + 19);
    }
    doc.setFillColor(accent[0], accent[1], accent[2]);
    doc.circle(x + w - 5, y + h - 5, 2.5, 'F');
}

// ── Footer ───────────────────────────────────────────────────────────────
function drawFooter(doc: any, page: number, total: number): void {
    const y = PH - 8;
    doc.setDrawColor(C.primary[0], C.primary[1], C.primary[2]);
    doc.setLineWidth(0.6);
    doc.line(ML, y - 2, ML + CW * 0.3, y - 2);
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.line(ML + CW * 0.3, y - 2, ML + CW, y - 2);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(5.5);
    doc.setTextColor(C.teal[0], C.teal[1], C.teal[2]);
    doc.text('Lyrium BioMarketplace', ML, y + 1);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(' — Reporte de Facturación Electrónica · Confidencial', ML + 22, y + 1);
    doc.setTextColor(G[500][0], G[500][1], G[500][2]);
    doc.text(
        `Generado: ${new Date().toLocaleString('es-PE')}  |  Página ${page} de ${total}`,
        ML + CW, y + 1, { align: 'right' }
    );
}

export async function exportAdminInvoicesToPdf(
    rows: AdminInvoiceRow[],
    kpis: AdminInvoiceKPIs | null,
    dateRange?: { from: string; to: string }
): Promise<void> {
    const [{ jsPDF: JsPDF }, { default: autoTable }, { saveAs }] = await Promise.all([
        import('jspdf'),
        import('jspdf-autotable'),
        import('file-saver'),
    ]);
    const logo = await loadImageB64('/img/logo.png');
    const doc  = new JsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

    // ── Header (estilo ventas) ───────────────────────────────────────────
    doc.setFillColor(248, 250, 252);
    doc.rect(0, 0, PW, 22, 'F');
    doc.setFillColor(C.primary[0], C.primary[1], C.primary[2]);
    doc.rect(0, 20, PW, 2, 'F');

    if (logo) doc.addImage(logo, 'PNG', ML, 2, 36, 16);

    doc.setTextColor(C.teal[0], C.teal[1], C.teal[2]);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.text('FACTURACIÓN ELECTRÓNICA', PW - MR, 9, { align: 'right' });
    doc.setTextColor(100, 116, 139);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    const rangeTxt = dateRange?.from && dateRange?.to
        ? `Período: ${fmtDate(dateRange.from)} — ${fmtDate(dateRange.to)}`
        : `Generado: ${new Date().toLocaleDateString('es-PE', { day: '2-digit', month: 'long', year: 'numeric' })}`;
    doc.text(
        `Reporte Administrativo  ·  ${rows.length} comprobante${rows.length !== 1 ? 's' : ''}  ·  ${rangeTxt}`,
        PW - MR, 16, { align: 'right' }
    );

    let y = 28;

    // ── KPI Cards ────────────────────────────────────────────────────────
    if (kpis) {
        const totalComisiones = rows.reduce((s, r) => s + (r.commission_amount ?? 0), 0);
        const totalMonto      = rows.reduce((s, r) => s + (r.order_total ?? r.amount), 0);
        const aceptados       = rows.filter(r => r.sunat_status === 'ACCEPTED').length;
        const rechazados      = rows.filter(r => r.sunat_status === 'REJECTED' || r.sunat_status === 'OBSERVED').length;

        const cards = [
            { label: 'Facturado Mes Actual',  value: fmtCurrency(kpis.totalFacturadoMesActual),  sub: `vs ${fmtCurrency(kpis.totalFacturadoMesAnterior)} mes ant.`,   color: C.primary  },
            { label: 'Total Filtrado',         value: fmtCurrency(totalMonto),                    sub: `${rows.length} comprobantes`,                                  color: C.teal     },
            { label: 'Comisiones Generadas',   value: fmtCurrency(totalComisiones),               sub: 'sobre comprobantes filtrados',                                 color: C.darkTeal },
            { label: 'Crecimiento Mensual',    value: `${kpis.porcentajeCrecimiento >= 0 ? '+' : ''}${kpis.porcentajeCrecimiento.toFixed(1)}%`, sub: 'respecto mes anterior', color: kpis.porcentajeCrecimiento >= 0 ? C.secondary : C.rose },
            { label: 'Aceptados SUNAT',        value: String(aceptados),                          sub: `${rechazados} observados/rechazados`,                          color: C.teal     },
            { label: 'Ticket Promedio',        value: fmtCurrency(kpis.montoPromedio),            sub: 'por comprobante emitido',                                      color: C.primary  },
        ];

        const cardW = (CW - 5 * 4) / 6;
        const cardH = 24;
        cards.forEach((card, i) => {
            drawKpi(doc, card.label, card.value, card.sub, ML + i * (cardW + 4), y, cardW, cardH, card.color);
        });
        y += cardH + 7;

        // Top Sellers mini-table
        if (kpis.topSellers.length > 0) {
            doc.setFillColor(220, 252, 231);
            doc.roundedRect(ML, y, 92, 6, 1, 1, 'F');
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(6);
            doc.setTextColor(C.teal[0], C.teal[1], C.teal[2]);
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
                    fillColor: [220, 252, 231],
                    textColor: [21, 128, 61],
                    fontSize: 6, fontStyle: 'bold',
                },
                bodyStyles: { fontSize: 6, textColor: [30, 41, 59] },
                alternateRowStyles: { fillColor: [248, 250, 252] },
                columnStyles: { 0: { cellWidth: 8 }, 1: { cellWidth: 52 }, 2: { cellWidth: 26, halign: 'right' }, 3: { cellWidth: 18, halign: 'right' } },
                margin: { left: ML, right: ML + CW - 108 },
                tableLineColor: [226, 232, 240],
                tableLineWidth: 0.15,
            });

            y = (doc as any).lastAutoTable.finalY + 7;
        }
    }

    // ── Separador sección ────────────────────────────────────────────────
    doc.setFillColor(C.secondary[0], C.secondary[1], C.secondary[2]);
    doc.rect(ML, y, CW, 0.7, 'F');
    y += 5;

    doc.setFillColor(220, 252, 231);
    doc.roundedRect(ML, y - 0.5, 62, 6.5, 1, 1, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(C.teal[0], C.teal[1], C.teal[2]);
    doc.text('DETALLE DE COMPROBANTES', ML + 3, y + 4);
    y += 9;

    // ── Tabla principal ──────────────────────────────────────────────────
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
                fillColor: [220, 252, 231],
                textColor: [21, 128, 61],
                fontSize: 6.5, fontStyle: 'bold', halign: 'center',
                cellPadding: { top: 3, bottom: 3, left: 2, right: 2 },
            },
            bodyStyles: { fontSize: 6, cellPadding: 2, fillColor: [255, 255, 255], textColor: [30, 41, 59] },
            alternateRowStyles: { fillColor: [248, 250, 252] },
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
            tableLineColor: [226, 232, 240],
            tableLineWidth: 0.15,
            showHead: 'everyPage',
            didDrawCell: (data) => {
                if (data.column.index === 7 && data.section === 'body') {
                    const rawStatus = rows[data.row.index]?.sunat_status;
                    const label = STATUS_LABEL[rawStatus] ?? rawStatus;
                    if (!label) return;
                    const color   = STATUS_COLOR[rawStatus] ?? G[400];
                    const bgColor = STATUS_BG[rawStatus]   ?? G[100];
                    const cx = data.cell.x + 1.5;
                    const cy = data.cell.y + 1.5;
                    const cw = data.cell.width - 3;
                    const ch = data.cell.height - 3;
                    doc.setFillColor(bgColor[0], bgColor[1], bgColor[2]);
                    doc.roundedRect(cx, cy, cw, ch, ch / 2, ch / 2, 'F');
                    doc.setTextColor(color[0], color[1], color[2]);
                    doc.setFont('helvetica', 'bold');
                    doc.setFontSize(5.5);
                    doc.text(
                        label,
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

        const summaryY = checkPage(doc, 12, finalY);
        doc.setFillColor(C.primary[0], C.primary[1], C.primary[2]);
        doc.roundedRect(ML, summaryY, CW, 9, 1.5, 1.5, 'F');
        doc.setFillColor(C.darkTeal[0], C.darkTeal[1], C.darkTeal[2]);
        doc.roundedRect(ML, summaryY, 3, 9, 1.5, 1.5, 'F');

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(6.5);
        doc.setTextColor(G[900][0], G[900][1], G[900][2]);
        doc.text('TOTAL GENERAL', ML + 6, summaryY + 6);

        doc.setFontSize(7.5);
        doc.text(fmtCurrency(totalMonto), ML + 48, summaryY + 6);

        doc.setFontSize(6);
        doc.text('·  Comisiones:', ML + 78, summaryY + 6);

        doc.setTextColor(C.darkTeal[0], C.darkTeal[1], C.darkTeal[2]);
        doc.setFontSize(7.5);
        doc.text(fmtCurrency(totalComisiones), ML + 102, summaryY + 6);

        doc.setTextColor(G[900][0], G[900][1], G[900][2]);
        doc.setFontSize(6);
        doc.text(`·  ${rows.length} comprobantes`, ML + 130, summaryY + 6);
    }

    // ── Footers (todas las páginas) ───────────────────────────────────────
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        drawFooter(doc, i, totalPages);
    }

    saveAs(doc.output('blob'), `facturacion-admin-${new Date().toISOString().slice(0, 10)}.pdf`);
}
