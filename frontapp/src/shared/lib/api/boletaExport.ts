const TOP_IMG =
  'https://fv5-5.files.fm/thumb_show.php?i=msu7t9u4py&view&v=1&PHPSESSID=53ba53ad2030b8e5aae3cf48c4ba83f8e248150a';
const BOTTOM_IMG =
  'https://fv5-8.files.fm/thumb_show.php?i=8dn38fae9w&view&v=1&PHPSESSID=53ba53ad2030b8e5aae3cf48c4ba83f8e248150a';

export interface BoletaOrder {
  id: string;
  orderNumber?: string;
  orderItems?: Array<{
    productName: string;
    unitPrice: number;
    quantity: number;
    lineTotal: number;
  }>;
  items?: Array<{
    productName: string;
    unitPrice: number;
    quantity: number;
    lineTotal: number;
  }>;
  subtotalAmount?: number;
  subtotal?: number;
  taxAmount?: number;
  shippingCost?: number;
  discountAmount?: number;
  total?: number;
}

function getItems(o: BoletaOrder) {
  return o.orderItems ?? o.items ?? [];
}

function getSubtotal(o: BoletaOrder) {
  if (o.subtotalAmount != null) return o.subtotalAmount;
  if (o.subtotal != null) return o.subtotal;
  return getItems(o).reduce((s, i) => s + i.lineTotal, 0);
}

// Precios al consumidor incluyen IGV por ley peruana — se extrae (no se suma).
// Si el backend ya provee total, lo usamos directamente.
function getTotal(o: BoletaOrder): number {
  if (o.total != null) return o.total;
  const sub = getSubtotal(o);
  return sub + (o.shippingCost ?? 0) - (o.discountAmount ?? 0);
}

function loadImageAsDataUrl(url: string): Promise<string> {
  return fetch(url)
    .then((r) => r.blob())
    .then(
      (blob) =>
        new Promise<string>((res) => {
          const reader = new FileReader();
          reader.onloadend = () => res(reader.result as string);
          reader.readAsDataURL(blob);
        }),
    );
}

const FB_IMG = 'https://fv5-4.files.fm/thumb_show.php?i=726g592gj8&view&v=1&PHPSESSID=53ba53ad2030b8e5aae3cf48c4ba83f8e248150a';
const IG_IMG = 'https://cdn-icons-png.flaticon.com/128/4138/4138124.png';
const WA_IMG = 'https://cdn-icons-png.flaticon.com/128/15713/15713434.png';

export function buildBoletaHtml(order: BoletaOrder): string {
  const items = getItems(order);
  const itemsHtml = items
    .map(
      (i) => `
    <tr style="border-bottom: 1px solid #e5e7eb;">
      <td style="padding: 12px 16px; font-weight: 500; color: #1f2937;">${i.productName}</td>
      <td style="padding: 12px 16px; text-align: center; color: #374151;">${i.quantity}</td>
      <td style="padding: 12px 16px; text-align: right; font-weight: 700; color: #1f2937;">S/ ${i.lineTotal.toFixed(2)}</td>
    </tr>`,
    )
    .join('');

  const totalQty = items.reduce((a, i) => a + i.quantity, 0);
  const subtotalVal = getSubtotal(order);
  const shippingVal = order.shippingCost ?? 0;
  const discountVal = order.discountAmount ?? 0;
  const finalTotal = getTotal(order);
  // IGV extraído de los precios (informativo, ya está incluido en subtotal)
  const igvInfo = Math.round((subtotalVal - subtotalVal / 1.18) * 100) / 100;

  const breakdownRows = `
    <tr style="border-top: 2px solid #e5e7eb;">
      <td style="padding: 10px 16px; font-size: 13px; color: #374151;">Subtotal</td>
      <td style="padding: 10px 16px;"></td>
      <td style="padding: 10px 16px; text-align: right; font-weight: 700; color: #1f2937;">S/ ${subtotalVal.toFixed(2)}</td>
    </tr>
    ${shippingVal > 0 ? `
    <tr>
      <td style="padding: 10px 16px; font-size: 13px; color: #374151;">Envío</td>
      <td style="padding: 10px 16px;"></td>
      <td style="padding: 10px 16px; text-align: right; font-weight: 700; color: #1f2937;">S/ ${shippingVal.toFixed(2)}</td>
    </tr>` : ''}
    ${discountVal > 0 ? `
    <tr>
      <td style="padding: 10px 16px; font-size: 13px; color: #374151;">Descuento</td>
      <td style="padding: 10px 16px;"></td>
      <td style="padding: 10px 16px; text-align: right; font-weight: 700; color: #dc2626;">-S/ ${discountVal.toFixed(2)}</td>
    </tr>` : ''}
    <tr>
      <td colspan="3" style="padding: 4px 16px; font-size: 10px; color: #9ca3af; font-style: italic;">
        Precios incluyen IGV (18%): S/ ${igvInfo.toFixed(2)}
      </td>
    </tr>`;

  return `<!DOCTYPE html>
<html>
<head><title>Boleta de Compra - ${order.id}</title>
<style>
  @media print {
    body * { visibility: hidden; }
    #boleta-wrapper, #boleta-wrapper * { visibility: visible; }
    #boleta-wrapper { position: absolute; left: 0; top: 0; width: 100%; }
    .no-print { display: none !important; }
    #boleta-top-img, #boleta-bottom-img { display: block !important; width: 100% !important; height: auto !important; }
    .print-turquoise { background-color: #0EA5E9 !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; color: white !important; }
    #boleta-print-area { break-inside: avoid; page-break-inside: avoid; }
    @page { size: portrait; margin: 0mm; }
  }
  body { font-family: Arial, Helvetica, sans-serif; margin: 0; padding: 0; background: #f3f4f6; }
</style>
</head>
<body>
<div id="boleta-wrapper" style="max-width: 672px; margin: 0 auto; padding: 16px;">
  <div id="boleta-print-area" style="max-width: 672px; margin: 0 auto;">
    <div class="no-print" style="text-align: right; margin-bottom: 16px;">
      <button onclick="window.print()" style="display: inline-flex; align-items: center; gap: 8px; padding: 12px 24px; border-radius: 16px; background: #0EA5E9; color: white; font-weight: 900; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; border: none; cursor: pointer;">
        Descargar Boleta
      </button>
    </div>

    <div style="background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1); border: 1px solid #e5e7eb;">
      <img id="boleta-top-img" src="${TOP_IMG}" alt="Encabezado boleta" crossorigin="anonymous" style="width: 100%; height: auto; display: block;" />

      <div style="padding: 8px 24px 16px; margin-top: -8px; position: relative; z-index: 10;">
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <thead>
            <tr class="print-turquoise" style="background: #0EA5E9; color: white;">
              <th style="text-align: left; padding: 12px 16px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.05em; font-size: 12px;">Producto</th>
              <th style="text-align: center; padding: 12px 16px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.05em; font-size: 12px;">Cantidad</th>
              <th style="text-align: right; padding: 12px 16px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.05em; font-size: 12px;">Precio</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
          <tfoot>
            ${breakdownRows}
            <tr class="print-turquoise" style="background: #0EA5E9; color: white;">
              <td style="padding: 12px 16px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.05em; font-size: 12px;">TOTAL</td>
              <td style="padding: 12px 16px; text-align: center; font-weight: 900;">${totalQty}</td>
              <td style="padding: 12px 16px; text-align: right; font-weight: 900; font-size: 16px;">S/ ${finalTotal.toFixed(2)}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div style="padding: 0 24px 24px; display: flex; flex-direction: column; align-items: center; gap: 16px;">
        <div style="text-align: center; font-size: 10px; color: #9ca3af; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em;">
          ${order.orderNumber ? 'N° ' + order.orderNumber : 'Orden N° ' + order.id}
        </div>

        <div style="display: flex; align-items: center; justify-content: center; border-top: 1.5px solid #d1f0eb; margin-top: 8px; padding-top: 24px; padding-bottom: 8px; width: 100%;">
          <a href="https://www.facebook.com" target="_blank" style="padding: 0 16px;">
            <img src="${FB_IMG}" width="48" height="48" alt="Facebook" crossorigin="anonymous" style="border-radius: 50%;" />
          </a>
          <div style="width: 1px; height: 54px; background: #c8e8e4;"></div>
          <a href="https://www.instagram.com/lyrium_biomarketplace/" target="_blank" style="padding: 0 16px;">
            <img src="${IG_IMG}" width="48" height="48" alt="Instagram" crossorigin="anonymous" style="border-radius: 10px;" />
          </a>
          <div style="width: 1px; height: 54px; background: #c8e8e4;"></div>
          <a href="https://wa.me/51937093420" target="_blank" style="padding: 0 16px;">
            <img src="${WA_IMG}" width="48" height="48" alt="WhatsApp" crossorigin="anonymous" />
          </a>
        </div>
      </div>

      <img id="boleta-bottom-img" src="${BOTTOM_IMG}" alt="Pie boleta" crossorigin="anonymous" style="width: 100%; height: auto; display: block;" />
    </div>
  </div>
</div>
</body>
</html>`;
}

export function downloadPdf(order: BoletaOrder): void {
  const html = buildBoletaHtml(order);
  const win = window.open('', '_blank');
  if (!win) return;
  win.document.write(html);
  win.document.close();
}

export async function downloadPng(order: BoletaOrder): Promise<void> {
  await downloadImage(order, 'png');
}

export async function downloadJpg(order: BoletaOrder): Promise<void> {
  await downloadImage(order, 'jpeg');
}

const TRANSPARENT_DOT = 'data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==';

async function downloadImage(order: BoletaOrder, format: 'png' | 'jpeg'): Promise<void> {
  // Convert all external images to data URLs so html2canvas never hits CORS.
  // files.fm and flaticon.com don't send CORS headers — fetch falls back to
  // TRANSPARENT_DOT so those slots are blank rather than crashing the export.
  const [topImg, bottomImg, fbImg, igImg, waImg] = await Promise.all([
    loadImageAsDataUrl(TOP_IMG).catch(() => TRANSPARENT_DOT),
    loadImageAsDataUrl(BOTTOM_IMG).catch(() => TRANSPARENT_DOT),
    loadImageAsDataUrl(FB_IMG).catch(() => TRANSPARENT_DOT),
    loadImageAsDataUrl(IG_IMG).catch(() => TRANSPARENT_DOT),
    loadImageAsDataUrl(WA_IMG).catch(() => TRANSPARENT_DOT),
  ]);

  // Swap external URLs → data URLs in the generated HTML.
  let html = buildBoletaHtml(order);
  html = html
    .replaceAll(TOP_IMG, topImg)
    .replaceAll(BOTTOM_IMG, bottomImg)
    .replaceAll(FB_IMG, fbImg)
    .replaceAll(IG_IMG, igImg)
    .replaceAll(WA_IMG, waImg);

  // Parse the full HTML and extract only the print area (skips the PDF button).
  const parsed = new DOMParser().parseFromString(html, 'text/html');
  const printArea = parsed.getElementById('boleta-print-area');
  if (!printArea) throw new Error('No se encontró el contenido de la boleta');

  // Mount in an off-screen div in the current document so html2canvas can
  // measure layout. All <img> sources are now data URLs — no CORS risk.
  const container = document.createElement('div');
  container.style.cssText =
    'position:fixed;left:-9999px;top:0;width:672px;background:#f3f4f6;font-family:Arial,Helvetica,sans-serif;';
  container.innerHTML = printArea.outerHTML;
  document.body.appendChild(container);

  // Wait for the data-URL images inside the container to decode.
  await Promise.all(
    Array.from(container.querySelectorAll('img')).map(
      (img) =>
        img.complete
          ? Promise.resolve()
          : new Promise<void>((resolve) => {
              img.onload = () => resolve();
              img.onerror = () => resolve(); // blank is fine
            }),
    ),
  );

  try {
    const html2canvas = (await import('html2canvas')).default;

    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: false,   // not needed — everything is a data URL
      allowTaint: false,
      backgroundColor: '#f3f4f6',
      logging: false,
    });

    const mimeType = format === 'jpeg' ? 'image/jpeg' : 'image/png';
    const ext = format === 'jpeg' ? 'jpg' : 'png';

    await new Promise<void>((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) { reject(new Error('Canvas vacío al exportar')); return; }
          const a = document.createElement('a');
          a.href = URL.createObjectURL(blob);
          a.download = `boleta-${order.id}.${ext}`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          setTimeout(() => URL.revokeObjectURL(a.href), 1000);
          resolve();
        },
        mimeType,
        0.95,
      );
    });
  } finally {
    if (document.body.contains(container)) {
      document.body.removeChild(container);
    }
  }
}
