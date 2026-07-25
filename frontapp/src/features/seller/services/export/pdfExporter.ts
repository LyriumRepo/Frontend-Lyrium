import type { Service } from '../types';

const C = {
    primary:  [34,  197, 94]  as [number, number, number], // #22c55e
    secondary:[22,  163, 74]  as [number, number, number], // #16a34a
    teal:     [21,  128, 61]  as [number, number, number], // #15803d
    darkTeal: [22,  101, 52]  as [number, number, number], // #166534
};

const G = {
    100: [243, 244, 246] as [number, number, number],
    200: [229, 231, 235] as [number, number, number],
    400: [156, 163, 175] as [number, number, number],
    600: [75,  85,  99]  as [number, number, number],
    800: [31,  41,  55]  as [number, number, number],
    900: [17,  24,  39]  as [number, number, number],
};

const PW = 210, PH = 297;
const ML = 14, MR = 14, CW = PW - ML - MR;

function fmtCurrency(n: number): string {
    return `S/ ${n.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
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
    doc.text(' — Mis Servicios · Panel Vendedor', ML + 22, y + 1);
    doc.text(`Generado: ${new Date().toLocaleString('es-PE')}  |  Pág. ${page} de ${total}`, ML + CW, y + 1, { align: 'right' });
}

export async function exportServiciosToPdf(services: Service[]): Promise<void> {
    const [{ jsPDF: JsPDF }, { default: autoTable }, { saveAs }] = await Promise.all([
        import('jspdf'),
        import('jspdf-autotable'),
        import('file-saver'),
    ]);
    const doc = new JsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

    doc.setFillColor(248, 250, 252);
    doc.rect(0, 0, PW, 22, 'F');
    doc.setFillColor(C.primary[0], C.primary[1], C.primary[2]);
    doc.rect(0, 20, PW, 2, 'F');

    doc.setTextColor(C.teal[0], C.teal[1], C.teal[2]);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.text('MIS SERVICIOS', PW - MR, 9, { align: 'right' });
    doc.setTextColor(100, 116, 139);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.text(
        `Panel Vendedor  ·  ${services.length} servicio${services.length !== 1 ? 's' : ''}  ·  ${new Date().toLocaleDateString('es-PE', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}`,
        PW - MR, 16, { align: 'right' }
    );

    let y = 28;

    const publicados  = services.filter(s => s.estado === 'publicado').length;
    const borradores  = services.filter(s => s.estado === 'borrador').length;
    const domicilio   = services.filter(s => s.domicilio).length;
    const precioPromedio = services.length > 0 ? services.reduce((s, v) => s + v.precio, 0) / services.length : 0;

    const cards = [
        { label: 'Total Servicios', value: String(services.length), sub: 'catálogo activo',      color: C.primary  },
        { label: 'Publicados',      value: String(publicados),       sub: 'visibles al público',  color: C.secondary},
        { label: 'Borradores',      value: String(borradores),       sub: 'sin publicar',         color: C.teal     },
        { label: 'A Domicilio',     value: String(domicilio),        sub: 'servicios con visita', color: C.darkTeal },
    ];

    const cardW = (CW - 2 * 4) / 3;
    const cardH = 24;
    cards.slice(0, 3).forEach((card, i) => {
        drawKpi(doc, card.label, card.value, card.sub, ML + i * (cardW + 4), y, cardW, cardH, card.color);
    });
    y += cardH + 4;
    drawKpi(doc, cards[3].label, cards[3].value, cards[3].sub, ML, y, cardW, cardH, cards[3].color);
    drawKpi(doc, 'Precio Promedio', fmtCurrency(precioPromedio), 'promedio catálogo', ML + cardW + 4, y, cardW, cardH, C.primary);
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
    doc.text('CATÁLOGO DE SERVICIOS', ML + 6, y + 5.5);
    y += 12;

    autoTable(doc, {
        startY: y,
        head: [['Denominación', 'Categoría', 'Precio', 'Duración', 'Cupos', 'Estado', 'Dom.', 'Anticipación']],
        body: services.map(s => [
            s.denominacion,
            s.categoria,
            fmtCurrency(s.precio),
            `${s.duracion} min`,
            String(s.cupos),
            s.estado === 'publicado' ? 'Publicado' : 'Borrador',
            s.domicilio ? 'Sí' : 'No',
            `${s.anticipacionReserva}h`,
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
            0: { cellWidth: 'auto', halign: 'left' },
            1: { cellWidth: 30, halign: 'center' },
            2: { cellWidth: 22, halign: 'right' },
            3: { cellWidth: 20, halign: 'center' },
            4: { cellWidth: 14, halign: 'center' },
            5: { cellWidth: 22, halign: 'center' },
            6: { cellWidth: 12, halign: 'center' },
            7: { cellWidth: 22, halign: 'center' },
        },
        margin: { left: ML, right: MR },
        tableLineColor: [226, 232, 240],
        tableLineWidth: 0.1,
        showHead: 'everyPage',
    });

    const finalY = (doc as any).lastAutoTable.finalY + 4;
    doc.setFillColor(C.primary[0], C.primary[1], C.primary[2]);
    doc.rect(ML, finalY, CW, 8, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(G[900][0], G[900][1], G[900][2]);
    doc.text(
        `TOTAL: ${services.length} servicios   ·   Publicados: ${publicados}   ·   Borradores: ${borradores}   ·   Precio prom.: ${fmtCurrency(precioPromedio)}`,
        ML + 4, finalY + 5
    );

    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        drawFooter(doc, i, totalPages);
    }

    saveAs(doc.output('blob'), `mis-servicios-${new Date().toISOString().slice(0, 10)}.pdf`);
}
