import type { Transaction } from '../types/transactions';

const C = {
    primary:  [34,  197, 94]  as [number, number, number], // #22c55e
    secondary:[22,  163, 74]  as [number, number, number], // #16a34a
    teal:     [21,  128, 61]  as [number, number, number], // #15803d
    darkTeal: [22,  101, 52]  as [number, number, number], // #166534
    navy:     [22,  101, 52]  as [number, number, number],
    amber:    [217, 119, 6]   as [number, number, number], // #d97706
    rose:     [220, 38,  38]  as [number, number, number], // #dc2626
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

const PAYMENT_LABEL: Record<string, string> = {
    paid:     'Pagado',
    pending:  'Pendiente',
    failed:   'Fallido',
    refunded: 'Reembolsado',
};

const TX_LABEL: Record<string, string> = {
    AUTHORISED: 'Autorizado',
    CAPTURED:   'Capturado',
    REFUSED:    'Rechazado',
    CANCELLED:  'Cancelado',
    PENDING:    'Pendiente',
    EXPIRED:    'Expirado',
    ERROR:      'Error',
};

const PAYMENT_COLOR: Record<string, [number, number, number]> = {
    paid:     [21,  128, 61],
    pending:  [161, 98,  7],
    failed:   [220, 38,  38],
    refunded: [21,  128, 61],
};

const PAYMENT_BG: Record<string, [number, number, number]> = {
    paid:     [220, 252, 231],
    pending:  [236, 253, 215],
    failed:   [255, 228, 230],
    refunded: [220, 252, 231],
};

const TX_COLOR: Record<string, [number, number, number]> = {
    AUTHORISED: [21,  128, 61],
    CAPTURED:   [21,  128, 61],
    PENDING:    [161, 98,  7],
    REFUSED:    [220, 38,  38],
    CANCELLED:  [107, 114, 128],
    EXPIRED:    [161, 98,  7],
    ERROR:      [220, 38,  38],
};

const TX_BG: Record<string, [number, number, number]> = {
    AUTHORISED: [220, 252, 231],
    CAPTURED:   [220, 252, 231],
    PENDING:    [236, 253, 215],
    REFUSED:    [255, 228, 230],
    CANCELLED:  [243, 244, 246],
    EXPIRED:    [254, 249, 195],
    ERROR:      [255, 228, 230],
};

// Landscape A4
const PW = 297, PH = 210;
const ML = 14, MR = 14, CW = PW - ML - MR;

function fmtDate(s: string): string {
    try { return new Date(s).toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' }); }
    catch { return s; }
}

function fmtCurrency(n: number | null | undefined): string {
    if (n == null) return '—';
    return `S/ ${n.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
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
    doc.setFillColor(accent[0], accent[1], accent[2]);
    doc.circle(x + w - 5, y + h - 5, 2.5, 'F');
}

function checkPage(doc: any, needed: number, y: number): number {
    if (y + needed > PH - 10) {
        doc.addPage();
        return ML;
    }
    return y;
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
    doc.text(' — Gestión de Pagos Izipay · Confidencial', ML + 22, y + 1);
    doc.text(
        `Generado: ${new Date().toLocaleString('es-PE')}  |  Pág. ${page} de ${total}`,
        ML + CW, y + 1, { align: 'right' }
    );
}

export async function exportPaymentsToPdf(transactions: Transaction[]): Promise<void> {
    const [{ jsPDF: JsPDF }, { default: autoTable }, { saveAs }] = await Promise.all([
        import('jspdf'),
        import('jspdf-autotable'),
        import('file-saver'),
    ]);
    const logo = await loadImageB64('/img/logo.png');
    const doc = new JsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

    // ── Header ───────────────────────────────────────────────────────────
    doc.setFillColor(248, 250, 252);
    doc.rect(0, 0, PW, 22, 'F');
    doc.setFillColor(C.primary[0], C.primary[1], C.primary[2]);
    doc.rect(0, 20, PW, 2, 'F');

    if (logo) doc.addImage(logo, 'PNG', ML, 2, 36, 16);

    doc.setTextColor(C.teal[0], C.teal[1], C.teal[2]);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.text('GESTIÓN DE PAGOS IZIPAY', PW - MR, 9, { align: 'right' });
    doc.setTextColor(100, 116, 139);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.text(
        `Panel Administrador  ·  ${transactions.length} transacción${transactions.length !== 1 ? 'es' : ''}  ·  ${new Date().toLocaleDateString('es-PE', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}`,
        PW - MR, 16, { align: 'right' }
    );

    let y = 28;

    // ── KPI Cards ────────────────────────────────────────────────────────
    const totalMonto    = transactions.reduce((s, t) => s + t.total, 0);
    const totalComision = transactions.reduce((s, t) => s + (t.commissionTotal ?? 0), 0);
    const pagadas       = transactions.filter(t => t.paymentStatus === 'paid').length;
    const fallidas      = transactions.filter(t => t.paymentStatus === 'failed').length;

    const cards = [
        { label: 'Total Recaudado',   value: fmtCurrency(totalMonto),    sub: `${transactions.length} transacciones`, color: C.primary  },
        { label: 'Comisión Lyrium',   value: fmtCurrency(totalComision), sub: 'total acumulado',                      color: C.teal     },
        { label: 'Pagadas',           value: String(pagadas),             sub: `de ${transactions.length}`,            color: C.secondary},
        { label: 'Fallidas / Rechaz.',value: String(fallidas),            sub: 'requieren revisión',                   color: C.darkTeal },
    ];

    const cardW = (CW - 3 * 5) / 4;
    const cardH = 24;
    cards.forEach((card, i) => {
        drawKpi(doc, card.label, card.value, card.sub, ML + i * (cardW + 5), y, cardW, cardH, card.color);
    });
    y += cardH + 6;

    // ── Section title ────────────────────────────────────────────────────
    doc.setDrawColor(C.secondary[0], C.secondary[1], C.secondary[2]);
    doc.setLineWidth(0.6);
    doc.line(ML, y, ML + 14, y);
    y += 4;
    doc.setFillColor(C.darkTeal[0], C.darkTeal[1], C.darkTeal[2]);
    doc.rect(ML, y, 2.5, 8, 'F');
    doc.setTextColor(G[800][0], G[800][1], G[800][2]);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.text('DETALLE DE TRANSACCIONES', ML + 6, y + 5.5);
    y += 12;

    // ── Tabla ────────────────────────────────────────────────────────────
    autoTable(doc, {
        startY: y,
        head: [['Orden', 'Fecha', 'Cliente', 'Tienda(s)', 'Total', 'Comisión', 'Método', 'Tarjeta', 'Estado Pago', 'Estado Trans.']],
        body: transactions.map(t => [
            t.orderNumber,
            fmtDate(t.createdAt),
            t.customer?.name ?? '—',
            t.stores.map(s => s.name).join(', ') || '—',
            fmtCurrency(t.total),
            t.commissionTotal != null ? fmtCurrency(t.commissionTotal) : '—',
            t.paymentMethod ?? '—',
            t.cardBrand ? `${t.cardBrand} ****${t.cardLast4}` : '—',
            PAYMENT_LABEL[t.paymentStatus] ?? t.paymentStatus,
            t.transactionStatus ? (TX_LABEL[t.transactionStatus] ?? t.transactionStatus) : '—',
        ]),
        theme: 'striped',
        headStyles: {
            fillColor: [220, 252, 231],
            textColor: [21, 128, 61],
            fontSize: 7, fontStyle: 'bold', halign: 'center',
        },
        bodyStyles: { fontSize: 6.5, cellPadding: 2, fillColor: [255, 255, 255], textColor: [30, 41, 59] },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        columnStyles: {
            0: { cellWidth: 28, halign: 'center', font: 'courier' },
            1: { cellWidth: 22, halign: 'center' },
            2: { cellWidth: 'auto', halign: 'left' },
            3: { cellWidth: 'auto', halign: 'left' },
            4: { cellWidth: 22, halign: 'right' },
            5: { cellWidth: 22, halign: 'right' },
            6: { cellWidth: 18, halign: 'center' },
            7: { cellWidth: 24, halign: 'center' },
            8: { cellWidth: 22, halign: 'center' },
            9: { cellWidth: 22, halign: 'center' },
        },
        margin: { left: ML, right: MR },
        tableLineColor: [226, 232, 240],
        tableLineWidth: 0.1,
        showHead: 'everyPage',
        didDrawCell: (data) => {
            if (data.section !== 'body') return;
            if (data.column.index === 8) {
                const rawStatus = transactions[data.row.index]?.paymentStatus;
                const label = PAYMENT_LABEL[rawStatus] ?? rawStatus;
                if (!label) return;
                const color   = PAYMENT_COLOR[rawStatus] ?? G[400];
                const bgColor = PAYMENT_BG[rawStatus]   ?? G[100];
                const cx = data.cell.x + 1.5;
                const cy = data.cell.y + 1.5;
                const cw = data.cell.width - 3;
                const ch = data.cell.height - 3;
                doc.setFillColor(bgColor[0], bgColor[1], bgColor[2]);
                doc.roundedRect(cx, cy, cw, ch, ch / 2, ch / 2, 'F');
                doc.setTextColor(color[0], color[1], color[2]);
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(5.5);
                doc.text(label, data.cell.x + data.cell.width / 2, data.cell.y + data.cell.height / 2 + 1, { align: 'center' });
            }
            if (data.column.index === 9) {
                const rawStatus = transactions[data.row.index]?.transactionStatus;
                if (!rawStatus) return;
                const label = TX_LABEL[rawStatus] ?? rawStatus;
                const color   = TX_COLOR[rawStatus] ?? G[400];
                const bgColor = TX_BG[rawStatus]   ?? G[100];
                const cx = data.cell.x + 1.5;
                const cy = data.cell.y + 1.5;
                const cw = data.cell.width - 3;
                const ch = data.cell.height - 3;
                doc.setFillColor(bgColor[0], bgColor[1], bgColor[2]);
                doc.roundedRect(cx, cy, cw, ch, ch / 2, ch / 2, 'F');
                doc.setTextColor(color[0], color[1], color[2]);
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(5.5);
                doc.text(label, data.cell.x + data.cell.width / 2, data.cell.y + data.cell.height / 2 + 1, { align: 'center' });
            }
        },
    });

    const finalY = (doc as any).lastAutoTable.finalY + 4;
    const summaryY = checkPage(doc, 12, finalY);
    doc.setFillColor(C.primary[0], C.primary[1], C.primary[2]);
    doc.rect(ML, summaryY, CW, 8, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(G[900][0], G[900][1], G[900][2]);
    doc.text(
        `TOTAL: ${fmtCurrency(totalMonto)}   ·   Comisión: ${fmtCurrency(totalComision)}   ·   Pagadas: ${pagadas} / ${transactions.length}`,
        ML + 4, summaryY + 5
    );

    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        drawFooter(doc, i, totalPages);
    }

    saveAs(doc.output('blob'), `pagos-izipay-${new Date().toISOString().slice(0, 10)}.pdf`);
}
