import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { saveAs } from 'file-saver';
import { Order, OrderItem, ServiceOrderItem } from '../types';

// ── Brand palette (misma que invoices/pdfExporter) ──
const C = {
    primary:   [183, 224, 0]  as [number, number, number],  // lima #B7E000
    secondary: [143, 212, 0]  as [number, number, number],  // #8FD400
    accent:    [110, 175, 85] as [number, number, number],  // verde medio
    darkBg:    [8,   25,  15] as [number, number, number],  // header oscuro
    cardBg:    [16,  48,  28] as [number, number, number],  // cards KPI
    sectionBar:[21, 128,  61] as [number, number, number],  // barra sección #15803D
} as const;

const G = {
    100: [243, 244, 246],
    200: [229, 231, 235],
    300: [209, 213, 219],
    400: [156, 163, 175],
    500: [107, 114, 128],
    600: [75, 85, 99],
    800: [31, 41, 55],
    900: [17, 24, 39],
};

const STATUS_META: Record<string, { bg: [number, number, number]; label: string }> = {
    pending_seller: { bg: [107, 114, 128], label: 'Pendiente' },
    pending:        { bg: [107, 114, 128], label: 'Pendiente' },
    confirmed:      { bg: [21,  128,  61], label: 'Confirmado' },
    processing:     { bg: [16,  85,   48], label: 'En preparación' },
    shipped:        { bg: [21,  128,  61], label: 'En transporte' },
    delivered:      { bg: [143, 212,   0], label: 'Entregado' },
    completed:      { bg: [143, 212,   0], label: 'Atención completada' },
    cancelled:      { bg: [239,  68,  68], label: 'Cancelado' },
};

const ORDER_TYPE_LABEL: Record<string, string> = {
    product: 'Producto',
    service: 'Servicio',
    mixed: 'Mixto',
};

// ── Helpers ──
function fmtDate(d: string): string {
    if (!d) return '—';
    try {
        const dt = new Date(d);
        return dt.toLocaleDateString('es-PE', { day: '2-digit', month: 'long', year: 'numeric' });
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

// ── Draw helpers ──
function sectionTitle(doc: jsPDF, title: string, y: number, ml: number, cw: number): number {
    doc.setFillColor(C.sectionBar[0], C.sectionBar[1], C.sectionBar[2]);
    doc.rect(ml, y, 2.5, 12, 'F');
    doc.setTextColor(G[800][0], G[800][1], G[800][2]);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text(title.toUpperCase(), ml + 6, y + 8);
    doc.setDrawColor(G[200][0], G[200][1], G[200][2]);
    doc.setLineWidth(0.3);
    doc.line(ml, y + 14, ml + cw, y + 14);
    return y + 24;
}

function fieldRow(doc: jsPDF, pairs: Array<[string, string]>, y: number, ml: number, cw: number): number {
    const halfW = (cw - 6) / 2;
    pairs.forEach(([label, value], i) => {
        const x = ml + (i % 2) * (halfW + 6);
        doc.setTextColor(G[400][0], G[400][1], G[400][2]);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(6);
        doc.text(label.toUpperCase(), x, y);
        doc.setTextColor(G[900][0], G[900][1], G[900][2]);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        const val = value || '—';
        const tw = doc.getTextWidth(val);
        if (tw > halfW - 2) {
            doc.text(val.substring(0, Math.floor((halfW - 2) / (doc.getTextWidth('W') * 9 / 100))) + '…', x, y + 4.5);
        } else {
            doc.text(val, x, y + 4.5);
        }
    });
    return y + 10;
}

function infoBlock(doc: jsPDF, title: string, pairs: Array<[string, string]>, y: number, ml: number, cw: number): number {
    y = sectionTitle(doc, title, y, ml, cw);
    return fieldRows(doc, pairs, y, ml, cw);
}

function fieldRows(doc: jsPDF, pairs: Array<[string, string]>, y: number, ml: number, cw: number): number {
    let cy = y;
    for (let i = 0; i < pairs.length; i += 2) {
        const chunk = pairs.slice(i, i + 2);
        cy = fieldRow(doc, chunk, cy, ml, cw);
    }
    return cy + 5;
}

function footerText(doc: jsPDF, page: number, total: number, ml: number, cw: number): void {
    doc.setDrawColor(G[300][0], G[300][1], G[300][2]);
    doc.setLineWidth(0.3);
    doc.line(ml, 282, ml + cw, 282);
    doc.setTextColor(G[400][0], G[400][1], G[400][2]);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6);
    doc.text('LYRIUM — Tecnología & Bienestar', ml, 287);
    doc.text(`Documento generado electrónicamente — Pág. ${page}/${total}`, ml + cw, 287, { align: 'right' });
    doc.text(`Generado: ${new Date().toLocaleString('es-PE')}`, ml + cw, 291, { align: 'right' });
}

// ── Main ──
export async function generateOrderPdf(order: Order): Promise<void> {
    const logo = await loadImageB64('/img/logo.png');
    const doc = new jsPDF('p', 'mm', 'a4');

    const PW = 210, ML = 18, MR = 18, CW = PW - ML - MR;
    const PH = 297;
    const icon = (n: string) => n; // placeholder — jspdf icons not needed

    // ═══════ 1. HEADER BAR ═══════
    // Header oscuro (mismo estilo que Mis Comprobantes)
    doc.setFillColor(C.darkBg[0], C.darkBg[1], C.darkBg[2]);
    doc.rect(0, 0, PW, 22, 'F');
    // Franja acento lima en la base del header
    doc.setFillColor(C.primary[0], C.primary[1], C.primary[2]);
    doc.rect(0, 20, PW, 2, 'F');

    if (logo) {
        doc.addImage(logo, 'PNG', ML, 2, 38, 17);
    }

    doc.setTextColor(C.primary[0], C.primary[1], C.primary[2]);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(15);
    doc.text('LYRIUM', PW - MR, 8, { align: 'right' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(C.accent[0], C.accent[1], C.accent[2]);
    doc.text('TECNOLOGÍA & BIENESTAR', PW - MR, 14, { align: 'right' });

    // ═══════ 2. TITLE ═══════
    let y = 22 + 12;

    // accent
    doc.setDrawColor(C.secondary[0], C.secondary[1], C.secondary[2]);
    doc.setLineWidth(0.6);
    doc.line(ML, y, ML + 14, y);

    y += 5;
    doc.setTextColor(G[900][0], G[900][1], G[900][2]);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.text('COMPROBANTE DE ORDEN', ML, y);

    y += 9;
    doc.setTextColor(G[600][0], G[600][1], G[600][2]);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.text(order.orderNumber, ML, y);

    // Status badge (right aligned)
    const sm = STATUS_META[order.estado] || STATUS_META.pending_seller;
    const badgeText = sm.label.toUpperCase();
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    const bw = doc.getTextWidth(badgeText) + 10;
    const bx = PW - MR - bw;
    doc.setFillColor(sm.bg[0], sm.bg[1], sm.bg[2]);
    doc.roundedRect(bx, y - 9, bw, 7, 1.5, 1.5, 'F');
    doc.setTextColor(255, 255, 255);
    doc.text(badgeText, bx + 5, y - 4);

    y += 5;
    doc.setTextColor(G[400][0], G[400][1], G[400][2]);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text(`Fecha: ${fmtDate(order.fecha)}  |  Tipo: ${ORDER_TYPE_LABEL[order.orderType] || 'Producto'}`, ML, y);

    y += 12;

    // ═══════ 3. DATOS DEL CLIENTE ═══════
    y = infoBlock(doc, 'Datos del Cliente', [
        ['Tipo de documento', order.customerDocumentType || '—'],
        ['Número de documento', order.customerDocument || '—'],
        ['Nombre completo', order.cliente],
        ['Celular', order.customerPhone || '—'],
        ['Correo electrónico', order.customerEmail || '—'],
        ['Tienda', order.storeName || '—'],
    ], y, ML, CW);

    // ═══════ 4. DIRECCIÓN / ATENCIÓN ═══════
    const hasItems = order.items.length > 0;
    const hasServices = order.serviceItems.length > 0;
    const isMixed = order.orderType === 'mixed';

    if (isMixed) {
        // Show both
        const city = parseCity(order.envio.city);
        y = infoBlock(doc, 'Dirección de Envío', [
            ['Departamento', city.departamento],
            ['Provincia', city.provincia],
            ['Distrito', city.distrito],
            ['Dirección', order.envio.direccion || '—'],
            ['Referencia', order.envio.notes || '—'],
            ['Tipo de entrega', order.tipo_envio === 'domicilio' ? 'A Domicilio'
                : order.tipo_envio === 'agencia' ? 'Por Agencia'
                : order.tipo_envio === 'retiro_tienda' ? 'Retiro en Tienda'
                : '—'],
        ], y, ML, CW);

        const svc = order.serviceItems[0];
        y = infoBlock(doc, 'Detalle de Atención', [
            ['Especialista', svc?.specialistName || '—'],
            ['Modalidad', modality(svc?.modality ?? null)],
            ['Fecha de atención', svc?.appointmentDate ? fmtDate(svc.appointmentDate) : '—'],
            ['Horario', svc?.startTime || svc?.endTime
                ? `${svc.startTime?.substring(0, 5) || '—'} - ${svc.endTime?.substring(0, 5) || '—'}`
                : '—'],
            ['Duración', svc?.durationMinutes ? `${svc.durationMinutes} min` : '—'],
        ], y, ML, CW);
    } else if (hasItems) {
        const city = parseCity(order.envio.city);
        y = infoBlock(doc, 'Dirección de Envío', [
            ['Departamento', city.departamento],
            ['Provincia', city.provincia],
            ['Distrito', city.distrito],
            ['Dirección', order.envio.direccion || '—'],
            ['Referencia', order.envio.notes || '—'],
            ['Tipo de entrega', order.tipo_envio === 'domicilio' ? 'A Domicilio'
                : order.tipo_envio === 'agencia' ? 'Por Agencia'
                : order.tipo_envio === 'retiro_tienda' ? 'Retiro en Tienda'
                : '—'],
        ], y, ML, CW);
    } else if (hasServices) {
        const svc = order.serviceItems[0];
        y = infoBlock(doc, 'Detalle de Atención', [
            ['Especialista', svc?.specialistName || '—'],
            ['Modalidad', modality(svc?.modality ?? null)],
            ['Fecha de atención', svc?.appointmentDate ? fmtDate(svc.appointmentDate) : '—'],
            ['Horario', svc?.startTime || svc?.endTime
                ? `${svc.startTime?.substring(0, 5) || '—'} - ${svc.endTime?.substring(0, 5) || '—'}`
                : '—'],
            ['Duración', svc?.durationMinutes ? `${svc.durationMinutes} min` : '—'],
        ], y, ML, CW);
    }

    // ═══════ 5. PAGO ═══════
    const isVerified = order.estado_pago === 'verificado';
    y = sectionTitle(doc, 'Información de Pago', y, ML, CW);

    // Payment method + status (left)
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6);
    doc.setTextColor(G[400][0], G[400][1], G[400][2]);
    doc.text('MÉTODO DE PAGO', ML, y);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(G[900][0], G[900][1], G[900][2]);
    doc.text(order.metodo_pago.toUpperCase(), ML, y + 4.5);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6);
    doc.setTextColor(G[400][0], G[400][1], G[400][2]);
    doc.text('ESTADO PAGO', ML + 55, y);
    const payStatus = isVerified ? 'VERIFICADO' : (order.estado_pago || 'PENDIENTE').toUpperCase();
    doc.setFillColor(isVerified ? 21 : 107, isVerified ? 128 : 114, isVerified ? 61 : 128);
    doc.roundedRect(ML + 55, y + 0.5, doc.getTextWidth(payStatus) + 6, 5, 1, 1, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6);
    doc.text(payStatus, ML + 55 + 3, y + 4);

    y += 12;

    // Financial summary (right-aligned)
    const finRows: Array<[string, string, boolean?]> = [
        ['Subtotal', fmtCurrency(order.subtotal ?? 0)],
        ['Costo de Envío', fmtCurrency(order.shippingCost ?? 0)],
    ];
    if ((order.taxAmount ?? 0) > 0) finRows.push(['Impuestos', fmtCurrency(order.taxAmount ?? 0)]);
    if ((order.discountAmount ?? 0) > 0) finRows.push(['Descuento', `- ${fmtCurrency(order.discountAmount ?? 0)}`]);
    finRows.push(['Total', fmtCurrency(order.total ?? 0), true]);

    const finX = ML + 80;
    const finLabelW = 35;
    finRows.forEach(([label, value, bold]) => {
        doc.setFont('helvetica', bold ? 'bold' : 'normal');
        doc.setFontSize(bold ? 11 : 9);
        doc.setTextColor(G[600][0], G[600][1], G[600][2]);
        doc.text(label, finX, y);
        doc.setTextColor(bold ? G[900][0] : G[600][0], bold ? G[900][1] : G[600][1], bold ? G[900][2] : G[600][2]);
        doc.setFont('helvetica', bold ? 'bold' : 'normal');
        doc.text(value, finX + finLabelW + 5, y, { align: 'right' });
        if (bold) {
            doc.setDrawColor(C.primary[0], C.primary[1], C.primary[2]);
            doc.setLineWidth(0.6);
            doc.line(finX, y - 4, finX + finLabelW + 5 + doc.getTextWidth(value), y - 4);
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(12);
        }
        y += bold ? 10 : 6;
    });

    y += 3;

    // Coupon
    if (order.couponCode) {
        doc.setTextColor(G[500][0], G[500][1], G[500][2]);
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(7);
        doc.text(`Cupón aplicado: ${order.couponCode}`, ML, y);
        y += 5;
    }
    if (order.paidAt) {
        doc.setTextColor(G[500][0], G[500][1], G[500][2]);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7);
        doc.text(`Pagado: ${fmtDate(order.paidAt)}`, ML, y);
        y += 5;
    }

    // Coupon + paidAt spacing
    if (order.couponCode || order.paidAt) y += 3;
    else y += 2;

    // ═══════ 6. PRODUCTOS TABLE ═══════
    if (order.items.length > 0) {
        y = sectionTitle(doc, 'Resumen de Productos', Math.max(y + 2, y), ML, CW);
        const prodBody = order.items.map((item: OrderItem) => [
            item.name,
            String(item.qty),
            fmtCurrency(item.price),
            fmtCurrency(item.price * item.qty),
            (item.status || '—').replace('_', ' '),
        ]);

        autoTable(doc, {
            startY: y + 1,
            head: [['Producto', 'Cant.', 'Precio', 'Subtotal', 'Estado']],
            body: prodBody,
            theme: 'striped',
            headStyles: {
                fillColor: [C.primary[0], C.primary[1], C.primary[2]],
                textColor: [G[900][0], G[900][1], G[900][2]],
                fontSize: 7,
                fontStyle: 'bold',
                halign: 'center',
            },
            bodyStyles: { fontSize: 7, halign: 'center' },
            columnStyles: {
                0: { cellWidth: 'auto', halign: 'left' },
                1: { cellWidth: 14, halign: 'center' },
                2: { cellWidth: 24, halign: 'right' },
                3: { cellWidth: 24, halign: 'right' },
                4: { cellWidth: 22, halign: 'center' },
            },
            margin: { left: ML, right: MR },
            tableLineColor: [G[200][0], G[200][1], G[200][2]],
            tableLineWidth: 0.1,
            showHead: 'everyPage',
        });
        y = (doc as any).lastAutoTable?.finalY ?? y + 30;
        y += 6;
    }

    // ═══════ 7. SERVICIOS TABLE ═══════
    if (order.serviceItems.length > 0) {
        y = sectionTitle(doc, 'Resumen de Servicios', y, ML, CW);
        const svcBody = order.serviceItems.map((item: ServiceOrderItem) => [
            item.serviceName,
            modality(item.modality ?? null),
            item.specialistName || '—',
            item.appointmentDate ? fmtDate(item.appointmentDate) : '—',
            fmtCurrency(item.unitPrice),
            fmtCurrency(item.lineTotal),
        ]);

        autoTable(doc, {
            startY: y + 1,
            head: [['Servicio', 'Modalidad', 'Especialista', 'Fecha', 'Precio', 'Total']],
            body: svcBody,
            theme: 'striped',
            headStyles: {
                fillColor: [C.sectionBar[0], C.sectionBar[1], C.sectionBar[2]],
                textColor: [255, 255, 255],
                fontSize: 7,
                fontStyle: 'bold',
                halign: 'center',
            },
            bodyStyles: { fontSize: 7, halign: 'center' },
            columnStyles: {
                0: { cellWidth: 'auto', halign: 'left' },
                1: { cellWidth: 22, halign: 'center' },
                2: { cellWidth: 22, halign: 'center' },
                3: { cellWidth: 22, halign: 'center' },
                4: { cellWidth: 18, halign: 'right' },
                5: { cellWidth: 18, halign: 'right' },
            },
            margin: { left: ML, right: MR },
            tableLineColor: [G[200][0], G[200][1], G[200][2]],
            tableLineWidth: 0.1,
            showHead: 'everyPage',
        });
        y = (doc as any).lastAutoTable?.finalY ?? y + 30;
        y += 6;
    }

    // ═══════ 8. NOTAS ═══════
    if (order.notes) {
        y = sectionTitle(doc, 'Notas del Cliente', y, ML, CW);
        doc.setTextColor(G[600][0], G[600][1], G[600][2]);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        const lines = doc.splitTextToSize(order.notes, CW - 4);
        doc.text(lines, ML, y);
    }

    // ═══════ FOOTER (every page) ═══════
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        footerText(doc, i, totalPages, ML, CW);
    }

    // ═══════ OUTPUT ═══════
    const blob = doc.output('blob');
    saveAs(blob, `Orden-${order.orderNumber}.pdf`);
}
