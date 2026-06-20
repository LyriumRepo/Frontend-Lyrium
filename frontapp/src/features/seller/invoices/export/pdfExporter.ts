import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { saveAs } from 'file-saver';
import type { Voucher, InvoiceKPIs } from '../types';

const C = {
    emerald: [16, 185, 129] as [number, number, number],
    teal:    [6, 182, 212] as [number, number, number],
    amber:   [245, 158, 11] as [number, number, number],
    indigo:  [99, 102, 241] as [number, number, number],
    darkBg:  [11, 26, 16] as [number, number, number],
};
const G = {
    50:  [249, 250, 251] as [number, number, number],
    100: [243, 244, 246] as [number, number, number],
    200: [229, 231, 235] as [number, number, number],
    400: [156, 163, 175] as [number, number, number],
    500: [107, 114, 128] as [number, number, number],
    600: [75, 85, 99] as [number, number, number],
    800: [31, 41, 55] as [number, number, number],
    900: [17, 24, 39] as [number, number, number],
};

const STATUS_LABEL: Record<string, string> = {
    ACCEPTED:      'Aceptado',
    SENT_WAIT_CDR: 'Pendiente CDR',
    REJECTED:      'Rechazado',
    OBSERVED:      'Observado',
    DRAFT:         'Borrador',
};

const PW = 210, ML = 18, MR = 18, CW = PW - ML - MR;

function fmtDate(d: string): string {
    if (!d) return '—';
    try { return new Date(d).toLocaleDateString('es-PE', { day: '2-digit', month: 'long', year: 'numeric' }); }
    catch { return d; }
}

function fmtCurrency(n: number): string {
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
    doc: jsPDF, label: string, value: string,
    x: number, y: number, w: number, h: number, color: [number, number, number]
): void {
    doc.setFillColor(color[0], color[1], color[2]);
    doc.rect(x, y, 2.5, h, 'F');
    doc.setFillColor(G[100][0], G[100][1], G[100][2]);
    doc.rect(x + 2.5, y, w - 2.5, h, 'F');
    doc.setTextColor(G[600][0], G[600][1], G[600][2]);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(5.5);
    doc.text(label.toUpperCase(), x + 5, y + 5.5);
    doc.setTextColor(G[900][0], G[900][1], G[900][2]);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text(value, x + 5, y + 13.5);
}

function footer(doc: jsPDF, page: number, total: number): void {
    doc.setDrawColor(G[200][0], G[200][1], G[200][2]);
    doc.setLineWidth(0.3);
    doc.line(ML, 282, ML + CW, 282);
    doc.setTextColor(G[400][0], G[400][1], G[400][2]);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6);
    doc.text('Generado por Lyrium — Reporte de Comprobantes Electrónicos', ML, 287);
    doc.text(`Pág. ${page}/${total}  |  ${new Date().toLocaleString('es-PE')}`, ML + CW, 287, { align: 'right' });
}

export async function exportInvoicesToPdf(
    vouchers: Voucher[],
    kpis: InvoiceKPIs | null
): Promise<void> {
    const logo = await loadImageB64('/img/logo.png');
    const doc = new jsPDF('p', 'mm', 'a4');

    // Header bar
    doc.setFillColor(C.darkBg[0], C.darkBg[1], C.darkBg[2]);
    doc.rect(0, 0, PW, 22, 'F');
    doc.setFillColor(C.emerald[0], C.emerald[1], C.emerald[2]);
    doc.rect(0, 20, PW, 2, 'F');

    if (logo) doc.addImage(logo, 'PNG', ML, 2, 38, 17);

    doc.setTextColor(C.emerald[0], C.emerald[1], C.emerald[2]);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('REPORTE DE COMPROBANTES', PW - MR, 8, { align: 'right' });
    doc.setTextColor(G[400][0], G[400][1], G[400][2]);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.text('Mis Comprobantes — Panel Vendedor', PW - MR, 14, { align: 'right' });

    let y = 32;

    doc.setTextColor(G[500][0], G[500][1], G[500][2]);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.text(
        `Generado: ${new Date().toLocaleString('es-PE')}  |  ${vouchers.length} comprobante${vouchers.length !== 1 ? 's' : ''}`,
        ML, y
    );
    y += 8;

    // KPI cards
    if (kpis) {
        const kpiData: Array<{ label: string; value: string; color: [number, number, number] }> = [
            { label: 'Total Facturado',       value: fmtCurrency(kpis.totalFacturado),          color: C.emerald },
            { label: 'Tasa de Éxito',         value: `${kpis.successRate.toFixed(1)}%`,          color: C.teal },
            { label: 'Pendientes CDR',        value: String(kpis.pendingCount),                  color: C.amber },
            { label: 'Comprobantes Emitidos', value: String(kpis.totalComprobantes),             color: C.indigo },
        ];
        const cardW = (CW - 12) / 4;
        const cardH = 16;
        kpiData.forEach((k, i) => {
            drawKpi(doc, k.label, k.value, ML + i * (cardW + 4), y, cardW, cardH, k.color);
        });
        y += cardH + 8;
    }

    // Table
    if (vouchers.length === 0) {
        doc.setTextColor(G[400][0], G[400][1], G[400][2]);
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(9);
        doc.text('No se encontraron comprobantes con los filtros aplicados.', ML, y);
    } else {
        const tableBody = vouchers.map(v => [
            v.type,
            `${v.series}-${v.number}`,
            v.store_name || '—',
            v.order_id || '—',
            fmtCurrency(v.amount),
            STATUS_LABEL[v.sunat_status] ?? v.sunat_status,
            fmtDate(v.emission_date),
        ]);

        autoTable(doc, {
            startY: y,
            head: [['Tipo', 'Serie-Nro', 'Tienda', 'Pedido', 'Monto', 'Estado', 'Fecha']],
            body: tableBody,
            theme: 'striped',
            headStyles: {
                fillColor: [C.emerald[0], C.emerald[1], C.emerald[2]],
                textColor: [255, 255, 255],
                fontSize: 7,
                fontStyle: 'bold',
                halign: 'center',
            },
            bodyStyles: { fontSize: 6.5, halign: 'center' },
            columnStyles: {
                0: { cellWidth: 18, halign: 'center' },
                1: { cellWidth: 22, halign: 'center' },
                2: { cellWidth: 'auto', halign: 'left' },
                3: { cellWidth: 28, halign: 'left' },
                4: { cellWidth: 22, halign: 'right' },
                5: { cellWidth: 22, halign: 'center' },
                6: { cellWidth: 22, halign: 'center' },
            },
            margin: { left: ML, right: MR },
            tableLineColor: [G[200][0], G[200][1], G[200][2]],
            tableLineWidth: 0.1,
            showHead: 'everyPage',
        });
    }

    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        footer(doc, i, totalPages);
    }

    saveAs(doc.output('blob'), `comprobantes-${new Date().toISOString().split('T')[0]}.pdf`);
}
