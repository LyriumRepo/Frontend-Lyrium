import type { Seller } from '../types';

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

const STATUS_LABEL: Record<string, string> = {
    ACTIVE:    'Activo', PENDING: 'Pendiente', SUSPENDED: 'Suspendido',
    REJECTED:  'Rechazado', activa: 'Activo', approved: 'Aprobado',
    suspendida:'Suspendido', baja_logica: 'Baja Lógica',
};

const STATUS_COLOR: Record<string, [number, number, number]> = {
    ACTIVE:      [21,  128, 61],
    activa:      [21,  128, 61],
    approved:    [21,  128, 61],
    PENDING:     [161, 98,  7],
    SUSPENDED:   [161, 98,  7],
    suspendida:  [161, 98,  7],
    REJECTED:    [220, 38,  38],
    baja_logica: [107, 114, 128],
};

const STATUS_BG: Record<string, [number, number, number]> = {
    ACTIVE:      [220, 252, 231],
    activa:      [220, 252, 231],
    approved:    [220, 252, 231],
    PENDING:     [236, 253, 215],
    SUSPENDED:   [254, 249, 195],
    suspendida:  [254, 249, 195],
    REJECTED:    [255, 228, 230],
    baja_logica: [243, 244, 246],
};

const PW = 297, PH = 210;
const ML = 14, MR = 14, CW = PW - ML - MR;

function fmtDate(s: string): string {
    try { return new Date(s).toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' }); }
    catch { return s; }
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
    doc.text(' — Padrón de Vendedores · Confidencial', ML + 22, y + 1);
    doc.text(`Generado: ${new Date().toLocaleString('es-PE')}  |  Pág. ${page} de ${total}`, ML + CW, y + 1, { align: 'right' });
}

export async function exportSellersToPdf(sellers: Seller[]): Promise<void> {
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
    doc.text('PADRÓN DE VENDEDORES', PW - MR, 9, { align: 'right' });
    doc.setTextColor(100, 116, 139);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.text(
        `Panel Administrador  ·  ${sellers.length} vendedor${sellers.length !== 1 ? 'es' : ''}  ·  ${new Date().toLocaleDateString('es-PE', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}`,
        PW - MR, 16, { align: 'right' }
    );

    let y = 28;

    const activos    = sellers.filter(s => ['ACTIVE','activa','approved'].includes(String(s.status))).length;
    const pendientes = sellers.filter(s => s.status === 'PENDING').length;
    const suspendidos= sellers.filter(s => ['SUSPENDED','suspendida'].includes(String(s.status))).length;

    const cards = [
        { label: 'Total Vendedores',    value: String(sellers.length), sub: 'registrados',     color: C.primary   },
        { label: 'Activos / Aprobados', value: String(activos),        sub: 'en operación',    color: C.secondary },
        { label: 'Pendientes',          value: String(pendientes),      sub: 'por aprobar',     color: C.teal      },
        { label: 'Suspendidos',         value: String(suspendidos),     sub: 'bloqueados',      color: C.darkTeal  },
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
    doc.text('LISTADO DE VENDEDORES', ML + 6, y + 5.5);
    y += 12;

    autoTable(doc, {
        startY: y,
        head: [['ID', 'Nombre', 'Empresa', 'Email', 'Estado', 'Productos', 'Pendientes', 'Contratos', 'Registro']],
        body: sellers.map(s => [
            String(s.id),
            s.name,
            s.company,
            s.email,
            STATUS_LABEL[String(s.status)] ?? String(s.status),
            String(s.productsTotal),
            String(s.productsPending),
            s.contractStatus ?? '—',
            fmtDate(s.regDate),
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
            0: { cellWidth: 12, halign: 'center' },
            1: { cellWidth: 'auto', halign: 'left' },
            2: { cellWidth: 'auto', halign: 'left' },
            3: { cellWidth: 'auto', halign: 'left' },
            4: { cellWidth: 20, halign: 'center' },
            5: { cellWidth: 18, halign: 'center' },
            6: { cellWidth: 18, halign: 'center' },
            7: { cellWidth: 20, halign: 'center' },
            8: { cellWidth: 22, halign: 'center' },
        },
        margin: { left: ML, right: MR },
        tableLineColor: [226, 232, 240],
        tableLineWidth: 0.1,
        showHead: 'everyPage',
        didDrawCell: (data) => {
            if (data.column.index === 4 && data.section === 'body') {
                const rawStatus = String(sellers[data.row.index]?.status);
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

    const finalY = (doc as any).lastAutoTable.finalY + 4;
    const summaryY = checkPage(doc, 12, finalY);
    doc.setFillColor(C.primary[0], C.primary[1], C.primary[2]);
    doc.rect(ML, summaryY, CW, 8, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(G[900][0], G[900][1], G[900][2]);
    doc.text(
        `TOTAL: ${sellers.length} vendedores   ·   Activos: ${activos}   ·   Pendientes: ${pendientes}   ·   Suspendidos: ${suspendidos}`,
        ML + 4, summaryY + 5
    );

    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        drawFooter(doc, i, totalPages);
    }

    saveAs(doc.output('blob'), `padron-vendedores-${new Date().toISOString().slice(0, 10)}.pdf`);
}
