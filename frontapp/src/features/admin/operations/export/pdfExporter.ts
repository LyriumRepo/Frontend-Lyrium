import type { Expense } from '../types/operations';

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
    100: [243, 244, 246] as [number, number, number],
    200: [229, 231, 235] as [number, number, number],
    400: [156, 163, 175] as [number, number, number],
    600: [75,  85,  99]  as [number, number, number],
    800: [31,  41,  55]  as [number, number, number],
    900: [17,  24,  39]  as [number, number, number],
};

const PW = 297, PH = 210;
const ML = 14, MR = 14, CW = PW - ML - MR;

const EXPENSE_COLOR: Record<string, [number, number, number]> = {
    'Pagado':    [21,  128, 61],
    'Pendiente': [161, 98,  7],
    'Anulado':   [107, 114, 128],
};

const EXPENSE_BG: Record<string, [number, number, number]> = {
    'Pagado':    [220, 252, 231],
    'Pendiente': [236, 253, 215],
    'Anulado':   [243, 244, 246],
};

function fmtDate(s: string | null | undefined): string {
    if (!s) return '—';
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
    doc: any, label: string, value: string, sub: string,
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
    doc.text(' — Pagos · Confidencial', ML + 22, y + 1);
    doc.text(`Generado: ${new Date().toLocaleString('es-PE')}  |  Pág. ${page} de ${total}`, ML + CW, y + 1, { align: 'right' });
}

export async function exportExpensesToPdf(expenses: Expense[]): Promise<void> {
    const [{ jsPDF: JsPDF }, { default: autoTable }, { saveAs }] = await Promise.all([
        import('jspdf'),
        import('jspdf-autotable'),
        import('file-saver'),
    ]);
    const logo = await loadImageB64('/img/logo.png');
    const doc = new JsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

    doc.setFillColor(248, 250, 252);
    doc.rect(0, 0, PW, 22, 'F');
    doc.setFillColor(C.primary[0], C.primary[1], C.primary[2]);
    doc.rect(0, 20, PW, 2, 'F');

    if (logo) doc.addImage(logo, 'PNG', ML, 2, 36, 16);

    doc.setTextColor(C.teal[0], C.teal[1], C.teal[2]);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.text('GESTIÓN OPERATIVA', PW - MR, 9, { align: 'right' });
    doc.setTextColor(100, 116, 139);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.text(
        `Panel Administrador  ·  ${expenses.length} registro${expenses.length !== 1 ? 's' : ''}  ·  ${new Date().toLocaleDateString('es-PE', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}`,
        PW - MR, 16, { align: 'right' }
    );

    let y = 28;

    const total      = expenses.reduce((s, e) => s + e.amount, 0);
    const pagados    = expenses.filter(e => e.status === 'Pagado').length;
    const pendientes = expenses.filter(e => e.status === 'Pendiente').length;
    const anulados   = expenses.filter(e => e.status === 'Anulado').length;

    const cards = [
        { label: 'Total Egresos',  value: fmtCurrency(total), sub: `${expenses.length} registros`,  color: C.primary  },
        { label: 'Pagados',        value: String(pagados),     sub: 'al día',                        color: C.secondary},
        { label: 'Pendientes',     value: String(pendientes),  sub: 'por pagar',                     color: C.teal     },
        { label: 'Anulados',       value: String(anulados),    sub: 'sin efecto',                    color: C.darkTeal },
    ];

    const cardW = (CW - 3 * 5) / 4;
    const cardH = 24;
    cards.forEach((card, i) => {
        drawKpi(doc, card.label, card.value, card.sub, ML + i * (cardW + 5), y, cardW, cardH, card.color);
    });
    y += cardH + 6;

    doc.setDrawColor(C.secondary[0], C.secondary[1], C.secondary[2]);
    doc.setLineWidth(0.6);
    doc.line(ML, y, ML + 14, y);
    y += 4;
    doc.setFillColor(C.darkTeal[0], C.darkTeal[1], C.darkTeal[2]);
    doc.rect(ML, y, 2.5, 8, 'F');
    doc.setTextColor(G[800][0], G[800][1], G[800][2]);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.text('DETALLE DE GASTOS Y COMPROBANTES', ML + 6, y + 5.5);
    y += 12;

    autoTable(doc, {
        startY: y,
        head: [['N° Recibo', 'Concepto', 'Tipo', 'Monto', 'Estado', 'Proveedor', 'Tipo Prov.', 'Fecha Emisión', 'Fecha Pago']],
        body: expenses.map(e => [
            e.receipt_number || '—',
            e.concept,
            e.voucher_type ?? '—',
            fmtCurrency(e.amount),
            e.status,
            e.supplier?.name ?? '—',
            e.supplier?.type ?? '—',
            fmtDate(e.issued_at),
            fmtDate(e.paid_at),
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
            0: { cellWidth: 24, halign: 'center' },
            1: { cellWidth: 'auto', halign: 'left' },
            2: { cellWidth: 20, halign: 'center' },
            3: { cellWidth: 20, halign: 'right' },
            4: { cellWidth: 18, halign: 'center' },
            5: { cellWidth: 'auto', halign: 'left' },
            6: { cellWidth: 18, halign: 'center' },
            7: { cellWidth: 22, halign: 'center' },
            8: { cellWidth: 22, halign: 'center' },
        },
        margin: { left: ML, right: MR },
        tableLineColor: [226, 232, 240],
        tableLineWidth: 0.1,
        showHead: 'everyPage',
        didDrawCell: (data) => {
            if (data.column.index === 4 && data.section === 'body') {
                const rawStatus = expenses[data.row.index]?.status;
                if (!rawStatus) return;
                const label = rawStatus;
                const color   = EXPENSE_COLOR[label] ?? G[400];
                const bgColor = EXPENSE_BG[label]   ?? G[100];
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
        `TOTAL EGRESOS: ${fmtCurrency(total)}   ·   Pagados: ${pagados}   ·   Pendientes: ${pendientes}   ·   Anulados: ${anulados}`,
        ML + 4, summaryY + 5
    );

    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        drawFooter(doc, i, totalPages);
    }

    saveAs(doc.output('blob'), `gestion-operativa-${new Date().toISOString().slice(0, 10)}.pdf`);
}
