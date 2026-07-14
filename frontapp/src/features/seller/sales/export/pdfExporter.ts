import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { saveAs } from 'file-saver';
import { Order, OrderItem, ServiceOrderItem } from '../types';

// ── Brand palette ──
const C = {
    primary:  [183, 224, 0],
    secondary:[143, 212, 0],
    teal:     [102, 214, 168],
    darkTeal: [78, 199, 184],
    blue:     [105, 190, 235],
} as const;

const G = {
    50:  [249, 250, 251],
    100: [243, 244, 246],
    200: [229, 231, 235],
    300: [209, 213, 219],
    400: [156, 163, 175],
    500: [107, 114, 128],
    600: [75, 85, 99],
    800: [31, 41, 55],
    900: [17, 24, 39],
};

const KPI_COLORS: number[][] = [
    [183, 224, 0],    // Total órdenes
    [143, 212, 0],    // Total ventas
    [102, 214, 168],  // Productos
    [78, 199, 184],   // Servicios
    [105, 190, 235],  // Mixtas
    [78, 199, 184],   // Pendientes
    [99, 102, 241],   // En proceso
    [34, 197, 94],    // Completadas
];

const ORDER_TYPE_LABEL: Record<string, string> = {
    product: 'Producto',
    service: 'Servicio',
    mixed: 'Mixto',
};

const STATUS_LABEL: Record<string, string> = {
    pending_seller: 'Pendiente',
    pending: 'Pendiente',
    confirmed: 'Confirmado',
    processing: 'En preparación',
    shipped: 'En transporte',
    delivered: 'Entregado',
    completed: 'Atención completada',
    cancelled: 'Cancelado',
};

// ── Helpers ──
function fmtDate(d: string): string {
    if (!d) return '—';
    try {
        const dt = new Date(d);
        return dt.toLocaleDateString('es-PE', { day: '2-digit', month: 'long', year: 'numeric' });
    } catch { return d; }
}

function fmtDateTime(d: string): string {
    if (!d) return '—';
    try {
        const dt = new Date(d);
        return dt.toLocaleDateString('es-PE', {
            day: '2-digit', month: 'long', year: 'numeric',
            hour: '2-digit', minute: '2-digit',
        });
    } catch { return d; }
}

function fmtCurrency(n: number): string {
    return `S/ ${n.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function modality(v: string | null): string {
    if (!v) return '—';
    if (v === 'presencial' || v === 'in_person') return 'Atención en sede';
    if (v === 'domicilio' || v === 'home') return 'Atención a domicilio';
    if (v === 'online') return 'En línea';
    return v;
}

function parseCity(city: string) {
    const p = (city || '').split(',').map(s => s.trim()).filter(Boolean);
    return { distrito: p[0] || '—', provincia: p[1] || '—', departamento: p[2] || '—' };
}

async function loadImageB64(url: string): Promise<string | null> {
    try {
        const r = await fetch(url);
        const b = await r.blob();
        return new Promise((resolve, reject) => {
            const fr = new FileReader();
            fr.onload = () => resolve(fr.result as string);
            fr.onerror = reject;
            fr.readAsDataURL(b);
        });
    } catch { return null; }
}

function checkPage(doc: jsPDF, needed: number, y: number, ml: number): number {
    if (y + needed > 277) {
        doc.addPage();
        return ML;
    }
    return y;
}

// ── Layout constants ──
const PW = 210, ML = 18, MR = 18, CW = PW - ML - MR;

// ── KPI helpers ──
interface ReportKPIs {
    total: number;
    totalVentas: number;
    productos: number;
    servicios: number;
    mixtas: number;
    pendientes: number;
    enProceso: number;
    completadas: number;
}

function computeReportKPIs(orders: Order[]): ReportKPIs {
    return {
        total: orders.length,
        totalVentas: orders.reduce((s, o) => s + (o.total || 0), 0),
        productos: orders.filter(o => o.orderType === 'product').length,
        servicios: orders.filter(o => o.orderType === 'service').length,
        mixtas: orders.filter(o => o.orderType === 'mixed').length,
        pendientes: orders.filter(o => o.estado === 'pending_seller' || o.estado === 'pending' as any).length,
        enProceso: orders.filter(o => o.estado === 'confirmed' || o.estado === 'processing' || o.estado === 'shipped').length,
        completadas: orders.filter(o => o.estado === 'delivered').length,
    };
}

// ── Draw helpers ──
function drawKpiCard(
    doc: jsPDF, label: string, value: string, x: number, y: number, w: number, h: number, color: number[]
): void {
    doc.setFillColor(color[0], color[1], color[2]);
    doc.rect(x, y, 2.5, h, 'F');
    doc.setFillColor(16, 48, 28);
    doc.rect(x + 2.5, y, w - 2.5, h, 'F');
    doc.setTextColor(110, 175, 85);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(5.5);
    doc.text(label.toUpperCase(), x + 5, y + 5.5);
    doc.setTextColor(230, 248, 215);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.text(value, x + 5, y + 13.5);
}

function sectionTitle(doc: jsPDF, title: string, y: number): number {
    y = checkPage(doc, 20, y, ML);
    doc.setFillColor(C.darkTeal[0], C.darkTeal[1], C.darkTeal[2]);
    doc.rect(ML, y, 2.5, 11, 'F');
    doc.setTextColor(G[800][0], G[800][1], G[800][2]);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text(title.toUpperCase(), ML + 6, y + 7.5);
    doc.setDrawColor(38, 90, 55);
    doc.setLineWidth(0.3);
    doc.line(ML, y + 13, ML + CW, y + 13);
    return y + 18;
}

function fieldGrid(doc: jsPDF, fields: Array<[string, string]>, y: number, colCount: number = 2): number {
    const colW = (CW - (colCount - 1) * 6) / colCount;
    const rowH = 8;
    let cy = y;
    for (let i = 0; i < fields.length; i += colCount) {
        cy = checkPage(doc, rowH, cy, ML);
        for (let c = 0; c < colCount && i + c < fields.length; c++) {
            const [label, value] = fields[i + c];
            const x = ML + c * (colW + 6);
            doc.setTextColor(G[400][0], G[400][1], G[400][2]);
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(6);
            doc.text(label.toUpperCase(), x, cy);
            doc.setTextColor(G[900][0], G[900][1], G[900][2]);
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(8);
            const val = value || '—';
            const tw = doc.getTextWidth(val);
            if (tw > colW - 2) {
                doc.text(val.substring(0, Math.floor((colW - 2) / 2.5)) + '…', x, cy + 4);
            } else {
                doc.text(val, x, cy + 4);
            }
        }
        cy += rowH;
    }
    return cy + 2;
}

function footerText(doc: jsPDF, page: number, total: number): void {
    doc.setDrawColor(38, 90, 55);
    doc.setLineWidth(0.3);
    doc.line(ML, 282, ML + CW, 282);
    doc.setTextColor(70, 130, 55);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6);
    doc.text('Generado por Lyrium — Reporte General de Órdenes', ML, 287);
    doc.text(`Pág. ${page}/${total}  |  ${fmtDateTime(new Date().toISOString())}`, ML + CW, 287, { align: 'right' });
}

// ── Order detail block ──
function drawOrderDetail(doc: jsPDF, order: Order, idx: number): number {
    let y = (doc as any).lastAutoTable?.finalY ?? (idx === 0 ? 0 : ML);
    const isMixed = order.orderType === 'mixed';

    // ── Check sufficient space for the whole block (estimate) ──
    const estimate = 35
        + (order.items.length > 0 ? 18 + order.items.length * 6 : 0)
        + (order.serviceItems.length > 0 ? 18 + order.serviceItems.length * 6 : 0);

    y = checkPage(doc, estimate, y, ML);
    if (y === ML && idx > 0) {
        // page break
    }

    // ── Block header ──
    doc.setFillColor(G[100][0], G[100][1], G[100][2]);
    doc.rect(ML, y, CW, 10, 'F');
    doc.setFillColor(C.primary[0], C.primary[1], C.primary[2]);
    doc.rect(ML, y, 2.5, 10, 'F');
    doc.setTextColor(G[800][0], G[800][1], G[800][2]);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text(`${order.orderNumber}`, ML + 6, y + 6);
    // Type badge
    const typeLabel = (ORDER_TYPE_LABEL[order.orderType] || 'Producto').toUpperCase();
    const tw = doc.getTextWidth(typeLabel) + 4;
    doc.setFillColor(C.secondary[0], C.secondary[1], C.secondary[2]);
    doc.roundedRect(PW - MR - tw - 50, y + 1.5, tw + 4, 7, 1, 1, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6);
    doc.text(typeLabel, PW - MR - tw - 48, y + 6);
    // Status
    const statusLabel = (STATUS_LABEL[order.estado] || order.estado).toUpperCase();
    const sw = doc.getTextWidth(statusLabel) + 4;
    doc.setFillColor(99, 102, 241);
    doc.roundedRect(PW - MR - sw, y + 1.5, sw + 4, 7, 1, 1, 'F');
    doc.setTextColor(255, 255, 255);
    doc.text(statusLabel, PW - MR - sw + 2, y + 6);

    y += 14;

    // ── General info (2 columns) ──
    y = fieldGrid(doc, [
        ['Cliente', order.cliente],
        ['Documento', order.customerDocument || '—'],
        ['Teléfono', order.customerPhone || '—'],
        ['Correo', order.customerEmail || '—'],
        ['Fecha', fmtDate(order.fecha)],
        ['Tienda', order.storeName || '—'],
    ], y, 2);

    y += 1;

    // ── Shipping / Service section ──
    if (isMixed || order.orderType === 'product') {
        if (order.items.length > 0) {
            y = checkPage(doc, 16, y, ML);
            doc.setTextColor(G[500][0], G[500][1], G[500][2]);
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(6);
            doc.text('ENVÍO', ML, y);
            const city = parseCity(order.envio.city);
            y = fieldGrid(doc, [
                ['Tipo', order.tipo_envio === 'domicilio' ? 'A Domicilio' : order.tipo_envio === 'agencia' ? 'Por Agencia' : order.tipo_envio === 'retiro_tienda' ? 'Retiro en Tienda' : '—'],
                ['Dirección', order.envio.direccion || '—'],
                ['Ciudad', `${city.distrito}, ${city.provincia}, ${city.departamento}`],
                ['Referencia', order.envio.notes || '—'],
            ], y + 4, 2);
            y += 1;
        }
    }

    if (isMixed || order.orderType === 'service') {
        if (order.serviceItems.length > 0) {
            const svc = order.serviceItems[0];
            y = checkPage(doc, 16, y, ML);
            doc.setTextColor(G[500][0], G[500][1], G[500][2]);
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(6);
            doc.text(isMixed ? 'ATENCIÓN (SERVICIOS)' : 'ATENCIÓN', ML, y);
            y = fieldGrid(doc, [
                ['Modalidad', modality(svc?.modality ?? null)],
                ['Especialista', svc?.specialistName || '—'],
                ['Fecha atención', svc?.appointmentDate ? fmtDate(svc.appointmentDate) : '—'],
                ['Horario', svc?.startTime || svc?.endTime ? `${svc.startTime?.substring(0, 5) || '—'} - ${svc.endTime?.substring(0, 5) || '—'}` : '—'],
            ], y + 4, 2);
            y += 1;
        }
    }

    // ── Payment section ──
    y = checkPage(doc, 20, y, ML);
    doc.setTextColor(G[500][0], G[500][1], G[500][2]);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6);
    doc.text('PAGO', ML, y);

    const isVerified = order.estado_pago === 'verificado';
    y = fieldGrid(doc, [
        ['Método', order.metodo_pago.toUpperCase()],
        ['Estado', isVerified ? 'VERIFICADO' : (order.estado_pago || 'PENDIENTE')],
    ], y + 4, 2);

    // Financial summary
    const finRows: Array<[string, string]> = [
        ['Subtotal', fmtCurrency(order.subtotal ?? 0)],
        ['Envío', fmtCurrency(order.shippingCost ?? 0)],
    ];
    if ((order.taxAmount ?? 0) > 0) finRows.push(['Impuestos', fmtCurrency(order.taxAmount ?? 0)]);
    if ((order.discountAmount ?? 0) > 0) finRows.push(['Descuento', `- ${fmtCurrency(order.discountAmount ?? 0)}`]);
    finRows.push(['TOTAL', fmtCurrency(order.total ?? 0)]);

    const finX = ML + 90;
    const finLabelW = 22;
    y = checkPage(doc, finRows.length * 5, y, ML);
    finRows.forEach(([label, value], i) => {
        const isTotal = i === finRows.length - 1;
        doc.setFont('helvetica', isTotal ? 'bold' : 'normal');
        doc.setFontSize(isTotal ? 9 : 7);
        doc.setTextColor(G[600][0], G[600][1], G[600][2]);
        doc.text(label, finX, y);
        doc.setTextColor(isTotal ? G[900][0] : G[600][0], isTotal ? G[900][1] : G[600][1], isTotal ? G[900][2] : G[600][2]);
        doc.text(value, finX + finLabelW + 3, y, { align: 'right' });
        if (isTotal) {
            doc.setDrawColor(C.primary[0], C.primary[1], C.primary[2]);
            doc.setLineWidth(0.4);
            doc.line(finX, y - 1.5, finX + finLabelW + 3 + doc.getTextWidth(value), y - 1.5);
        }
        y += isTotal ? 6 : 4.5;
    });

    y += 3;

    // ── Items tables ──
    if (order.items.length > 0) {
        y = checkPage(doc, 12 + order.items.length * 6, y, ML);
        doc.setTextColor(G[500][0], G[500][1], G[500][2]);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(6);
        doc.text('PRODUCTOS', ML, y);
        y += 3;

        const prodRows = order.items.map((item: OrderItem) => [
            item.name,
            String(item.qty),
            fmtCurrency(item.price),
            fmtCurrency(item.price * item.qty),
        ]);

        const res = autoTable(doc, {
            startY: y,
            head: [['Producto', 'Cant.', 'Precio', 'Subtotal']],
            body: prodRows,
            theme: 'plain',
            headStyles: {
                fillColor: [18, 60, 38],
                textColor: [163, 230, 53],
                fontSize: 6.5,
                fontStyle: 'bold',
            },
            bodyStyles: { fontSize: 6.5 },
            columnStyles: {
                0: { cellWidth: 'auto', halign: 'left' },
                1: { cellWidth: 14, halign: 'center' },
                2: { cellWidth: 22, halign: 'right' },
                3: { cellWidth: 22, halign: 'right' },
            },
            margin: { left: ML, right: MR },
            tableLineColor: [38, 90, 55],
            tableLineWidth: 0.1,
            showHead: 'everyPage',
        });
        y = (doc as any).lastAutoTable?.finalY ?? y + 10;
        y += 3;
    }

    if (order.serviceItems.length > 0) {
        y = checkPage(doc, 12 + order.serviceItems.length * 6, y, ML);
        doc.setTextColor(G[500][0], G[500][1], G[500][2]);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(6);
        doc.text('SERVICIOS', ML, y);
        y += 3;

        const svcRows = order.serviceItems.map((item: ServiceOrderItem) => [
            item.serviceName,
            modality(item.modality ?? null),
            item.specialistName || '—',
            fmtCurrency(item.unitPrice),
        ]);

        const res = autoTable(doc, {
            startY: y,
            head: [['Servicio', 'Modalidad', 'Especialista', 'Precio']],
            body: svcRows,
            theme: 'plain',
            headStyles: {
                fillColor: [18, 60, 38],
                textColor: [163, 230, 53],
                fontSize: 6.5,
                fontStyle: 'bold',
            },
            bodyStyles: { fontSize: 6.5 },
            columnStyles: {
                0: { cellWidth: 'auto', halign: 'left' },
                1: { cellWidth: 24, halign: 'center' },
                2: { cellWidth: 22, halign: 'center' },
                3: { cellWidth: 18, halign: 'right' },
            },
            margin: { left: ML, right: MR },
            tableLineColor: [38, 90, 55],
            tableLineWidth: 0.1,
            showHead: 'everyPage',
        });
        y = (doc as any).lastAutoTable?.finalY ?? y + 10;
        y += 4;
    }

    // ── Separator between orders ──
    doc.setDrawColor(38, 90, 55);
    doc.setLineWidth(0.2);
    doc.line(ML, y, ML + CW, y);
    return y + 6;
}

// ── Main ──
export async function generateSalesReportPdf(
    orders: Order[],
    storeName?: string
): Promise<void> {
    const logo = await loadImageB64('/img/logo.png');
    const doc = new jsPDF('p', 'mm', 'a4');

    // ═══════ 1. HEADER BAR ═══════
    doc.setFillColor(8, 25, 15);
    doc.rect(0, 0, PW, 22, 'F');
    doc.setFillColor(C.primary[0], C.primary[1], C.primary[2]);
    doc.rect(0, 20, PW, 2, 'F');

    if (logo) {
        doc.addImage(logo, 'PNG', ML, 2, 38, 17);
    }

    doc.setTextColor(163, 230, 53);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('REPORTE GENERAL DE ÓRDENES', PW - MR, 8, { align: 'right' });
    doc.setTextColor(120, 190, 80);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.text('Panel de Ventas — Seller', PW - MR, 14, { align: 'right' });

    // ═══════ 2. META ═══════
    let y = 22 + 10;

    doc.setDrawColor(C.secondary[0], C.secondary[1], C.secondary[2]);
    doc.setLineWidth(0.6);
    doc.line(ML, y, ML + 14, y);

    y += 5;
    doc.setTextColor(G[800][0], G[800][1], G[800][2]);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    if (storeName) {
        doc.text(storeName, ML, y);
        y += 5;
    }
    doc.setTextColor(G[500][0], G[500][1], G[500][2]);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.text(`Generado: ${fmtDateTime(new Date().toISOString())}  |  ${orders.length} órdenes encontradas`, ML, y);
    y += 8;

    // ═══════ 3. RESUMEN EJECUTIVO ═══════
    const reportKPIs = computeReportKPIs(orders);
    const kpiData: Array<{ label: string; value: string }> = [
        { label: 'Total Órdenes', value: String(reportKPIs.total) },
        { label: 'Total Ventas', value: fmtCurrency(reportKPIs.totalVentas) },
        { label: 'Productos', value: String(reportKPIs.productos) },
        { label: 'Servicios', value: String(reportKPIs.servicios) },
        { label: 'Mixtas', value: String(reportKPIs.mixtas) },
        { label: 'Pendientes', value: String(reportKPIs.pendientes) },
        { label: 'En Proceso', value: String(reportKPIs.enProceso) },
        { label: 'Completadas', value: String(reportKPIs.completadas) },
    ];

    y = sectionTitle(doc, 'Resumen Ejecutivo', y);

    const cardW = (CW - 12) / 4;
    const cardH = 16;
    const cardGap = 4;
    const cardY = y;

    kpiData.forEach((kpi, i) => {
        const col = i % 4;
        const row = Math.floor(i / 4);
        const cx = ML + col * (cardW + cardGap);
        const cy = cardY + row * (cardH + cardGap);
        drawKpiCard(doc, kpi.label, kpi.value, cx, cy, cardW, cardH, KPI_COLORS[i]);
    });

    y = cardY + 2 * (cardH + cardGap) + 4;

    // ═══════ 4. MAIN TABLE ═══════
    if (orders.length === 0) {
        y = sectionTitle(doc, 'Órdenes', y);
        doc.setTextColor(G[400][0], G[400][1], G[400][2]);
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(9);
        doc.text('No se encontraron órdenes con los filtros aplicados.', ML, y);
        y += 8;
    } else {
        y = sectionTitle(doc, 'Órdenes', y);

        type TableRow = [string, string, string, string, string, string, string, string];
        const tableBody: TableRow[] = orders.map((order: Order) => {
            let atencion = '—';
            if (order.items.length > 0) {
                atencion = order.tipo_envio === 'domicilio' ? 'A Domicilio'
                    : order.tipo_envio === 'agencia' ? 'Por Agencia'
                    : order.tipo_envio === 'retiro_tienda' ? 'Retiro en Tienda'
                    : '—';
            } else if (order.serviceItems.length > 0) {
                const svc = order.serviceItems[0];
                atencion = modality(svc?.modality ?? null);
            }

            return [
                order.orderNumber || order.id,
                fmtDate(order.fecha),
                order.cliente,
                ORDER_TYPE_LABEL[order.orderType] || 'Producto',
                atencion,
                order.statusLabel || order.estado,
                order.paymentStatusLabel || order.estado_pago || '—',
                fmtCurrency(order.total ?? 0),
            ];
        });

        autoTable(doc, {
            startY: y + 1,
            head: [['Orden', 'Fecha', 'Cliente', 'Tipo', 'Atención', 'Estado', 'Pago', 'Total']],
            body: tableBody,
            theme: 'striped',
            headStyles: {
                fillColor: [18, 60, 38],
                textColor: [163, 230, 53],
                fontSize: 7,
                fontStyle: 'bold',
                halign: 'center',
            },
            bodyStyles: { fontSize: 6.5, halign: 'center', fillColor: [12, 35, 22], textColor: [215, 235, 205] },
            columnStyles: {
                0: { cellWidth: 26, halign: 'left' },
                1: { cellWidth: 22, halign: 'center' },
                2: { cellWidth: 'auto', halign: 'left' },
                3: { cellWidth: 16, halign: 'center' },
                4: { cellWidth: 24, halign: 'center' },
                5: { cellWidth: 22, halign: 'center' },
                6: { cellWidth: 18, halign: 'center' },
                7: { cellWidth: 22, halign: 'right' },
            },
            margin: { left: ML, right: MR },
            tableLineColor: [38, 90, 55],
            tableLineWidth: 0.1,
            showHead: 'everyPage',
        });
        y = (doc as any).lastAutoTable?.finalY ?? y + 20;
        y += 6;
    }

    // ═══════ 5. DETALLE POR ORDEN ═══════
    if (orders.length > 0) {
        y = sectionTitle(doc, 'Detalle por Orden', y);

        orders.forEach((order, idx) => {
            y = drawOrderDetail(doc, order, idx);
        });
    }

    // ═══════ FOOTER (every page) ═══════
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        footerText(doc, i, totalPages);
    }

    // ═══════ OUTPUT ═══════
    const blob = doc.output('blob');
    const dateStr = new Date().toISOString().split('T')[0];
    saveAs(blob, `reporte-ordenes-${dateStr}.pdf`);
}
