import { getAuthHeaders } from './token-store';
import { LARAVEL_API_URL } from '@/shared/lib/config/flags';

async function fetchConfirmationPdfBlob(orderId: string): Promise<Blob> {
    const headers = await getAuthHeaders();
    const response = await fetch(`${LARAVEL_API_URL}/orders/${orderId}/payment-confirmation`, {
        method: 'GET',
        headers: { Accept: 'application/pdf', ...headers },
    });
    if (!response.ok) throw new Error('Error al obtener la confirmación de pago');
    return response.blob();
}

function triggerDownload(url: string, filename: string): void {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export async function downloadConfirmationPdf(orderId: string, orderNumber: string): Promise<void> {
    const blob = await fetchConfirmationPdfBlob(orderId);
    const url = URL.createObjectURL(blob);
    triggerDownload(url, `confirmacion-pago-${orderNumber}.pdf`);
}

async function renderPdfToCanvas(pdfBlob: Blob): Promise<HTMLCanvasElement> {
    // Dynamic import to keep bundle size small
    const pdfjsLib = await import('pdfjs-dist');

    // Point worker to the bundled worker file via CDN to avoid webpack issues
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

    const arrayBuffer = await pdfBlob.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const page = await pdf.getPage(1);

    const scale = 2; // retina-quality
    const viewport = page.getViewport({ scale });

    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;

    await page.render({ canvas, viewport }).promise;

    return canvas;
}

export async function downloadConfirmationPng(orderId: string, orderNumber: string): Promise<void> {
    const blob = await fetchConfirmationPdfBlob(orderId);
    const canvas = await renderPdfToCanvas(blob);

    await new Promise<void>((resolve, reject) => {
        canvas.toBlob((imgBlob) => {
            if (!imgBlob) { reject(new Error('Error al generar PNG')); return; }
            triggerDownload(URL.createObjectURL(imgBlob), `confirmacion-pago-${orderNumber}.png`);
            resolve();
        }, 'image/png');
    });
}

export async function downloadConfirmationJpg(orderId: string, orderNumber: string): Promise<void> {
    const blob = await fetchConfirmationPdfBlob(orderId);
    const canvas = await renderPdfToCanvas(blob);

    // White background for JPG (no transparency)
    const flatCanvas = document.createElement('canvas');
    flatCanvas.width = canvas.width;
    flatCanvas.height = canvas.height;
    const ctx = flatCanvas.getContext('2d')!;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, flatCanvas.width, flatCanvas.height);
    ctx.drawImage(canvas, 0, 0);

    await new Promise<void>((resolve, reject) => {
        flatCanvas.toBlob((imgBlob) => {
            if (!imgBlob) { reject(new Error('Error al generar JPG')); return; }
            triggerDownload(URL.createObjectURL(imgBlob), `confirmacion-pago-${orderNumber}.jpg`);
            resolve();
        }, 'image/jpeg', 0.95);
    });
}
