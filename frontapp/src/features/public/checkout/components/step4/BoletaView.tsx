'use client';

import { useCheckoutStore } from '@/store/checkoutStore';
import { Download, Image as LucideImage, Share2, MessageCircle, Mail, Check, X, FileText, Loader2, Facebook, Twitter } from 'lucide-react';
import { useState } from 'react';

const TOP_IMG =
  'https://fv5-5.files.fm/thumb_show.php?i=msu7t9u4py&view&v=1&PHPSESSID=53ba53ad2030b8e5aae3cf48c4ba83f8e248150a';
const BOTTOM_IMG =
  'https://fv5-4.files.fm/thumb_show.php?i=67vwf5vakf&view&v=1&PHPSESSID=b6862738416edfc1629012e3aecc89734866bb64';

export default function BoletaView() {
  const result = useCheckoutStore((s) => s.orderResult);
  const [downloadingPng, setDownloadingPng] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [copied, setCopied] = useState(false);
  const [pngError, setPngError] = useState(false);

  const handleDownloadPng = async () => {
    setDownloadingPng(true);
    setPngError(false);

    const origError = console.error;
    console.error = (...args: any[]) => {
      const msg = args.join(' ');
      if (
        msg.includes('cssRules') ||
        msg.includes('insertRule') ||
        msg.includes('@charset') ||
        msg.includes('@import') ||
        msg.includes('krtoolbar')
      ) return;
      origError.apply(console, args);
    };

    try {
      const { toPng } = await import('html-to-image');
      const node = document.getElementById('boleta-content');
      if (!node) return;

      const dataUrl = await toPng(node, { quality: 1, pixelRatio: 2, cacheBust: true });

      const link = document.createElement('a');
      link.download = `boleta-${result?.orderId || 'pedido'}.png`;
      link.href = dataUrl;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch {
      setPngError(true);
    } finally {
      console.error = origError;
      setDownloadingPng(false);
    }
  };

  const handleShare = () => {
    const url = `${window.location.origin}/checkout`;
    if (navigator.share) {
      navigator.share({ title: 'Mi compra en Lyrium', url });
    } else {
      setShowShare(true);
    }
  };

  if (!result) return null;

  const { orderId, total, items } = result;
  const shipping = (result as any).shipping ?? 0;
  const subtotal = items.reduce((a, i) => a + i.price * i.quantity, 0);

  const handlePrint = () => {
    const loadImage = (url: string): Promise<string> =>
      fetch(url)
        .then((r) => r.blob())
        .then(
          (blob) =>
            new Promise((res) => {
              const reader = new FileReader();
              reader.onloadend = () => res(reader.result as string);
              reader.readAsDataURL(blob);
            }),
        );

    Promise.all([loadImage(TOP_IMG), loadImage(BOTTOM_IMG)])
      .then(([topData, bottomData]) => {
        const topImg = document.getElementById(
          'boleta-top-img',
        ) as HTMLImageElement;
        const bottomImg = document.getElementById(
          'boleta-bottom-img',
        ) as HTMLImageElement;
        if (topImg) topImg.src = topData;
        if (bottomImg) bottomImg.src = bottomData;
        setTimeout(() => window.print(), 300);
      })
      .catch(() => window.print());
  };

  return (
    <>
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #boleta-print-wrapper,
          #boleta-print-wrapper * { visibility: visible; }
          #boleta-print-wrapper {
            position: absolute;
            left: 0; top: 0;
            width: 100%;
            max-height: 100vh;
          }
          .no-print { display: none !important; }
          #boleta-top-img, #boleta-bottom-img {
            display: block !important;
            width: 100% !important;
            height: auto !important;
          }
          .print-turquoise {
            background-color: #2BBFBF !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color: white !important;
          }
          #boleta-print-area {
            break-inside: avoid;
            page-break-inside: avoid;
          }
          @page { size: portrait; margin: 0mm; }
        }
      `}</style>

      <div
        id="boleta-print-wrapper"
        className="max-w-2xl mx-auto p-4 print:p-0"
      >
        <div id="boleta-print-area" className="space-y-6 print:space-y-4">
          {/* Botón descargar */}
          <div className="flex items-center justify-end gap-3 no-print">
            <button
              type="button"
              onClick={handleShare}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white dark:bg-[var(--bg-card)] text-gray-700 dark:text-[var(--text-primary)] border-2 border-gray-200 dark:border-[var(--border-subtle)] font-black text-xs uppercase tracking-widest hover:bg-gray-50 dark:hover:bg-[var(--bg-muted)] transition-all shadow-lg"
            >
              <Share2 className="w-4 h-4" /> Compartir
            </button>
            <button
              type="button"
              onClick={handleDownloadPng}
              disabled={downloadingPng}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-emerald-500 text-white font-black text-xs uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-lg disabled:opacity-50"
            >
              {downloadingPng ? <Loader2 className="w-4 h-4 animate-spin" /> : <LucideImage className="w-4 h-4" />} {downloadingPng ? '...' : 'PNG'}
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-sky-500 text-white font-black text-xs uppercase tracking-widest hover:bg-sky-600 transition-all shadow-lg"
            >
              <Download className="w-4 h-4" /> PDF
            </button>
          </div>

          {pngError && (
            <div className="text-center text-red-500 text-xs font-semibold no-print bg-red-50 dark:bg-red-900/20 py-2 px-4 rounded-xl">
              Error al generar PNG. Intenta con PDF o compártela.
            </div>
          )}

          {/* Boleta */}
          <div id="boleta-content" className="bg-white rounded-2xl overflow-hidden shadow-xl border border-gray-200 print:border-0 print:shadow-none print:rounded-none">
            {/* Imagen Superior */}
            <img
              id="boleta-top-img"
              src={TOP_IMG}
              alt="Encabezado boleta"
              className="w-full h-auto block"
              crossOrigin="anonymous"
            />

            {/* Tabla detalle pedido */}
            <div className="px-6 pt-2 pb-4 print:pt-0 print:pb-2">
              <table className="w-full text-sm border-collapse">
                <thead>
                  {/* Fila título */}
                  <tr
                    className="print-turquoise"
                    style={{ backgroundColor: '#2BBFBF', color: '#fff' }}
                  >
                    <th
                      colSpan={3}
                      className="text-left py-3 px-4 font-black uppercase tracking-wider text-sm"
                    >
                      Detalle de su pedido
                    </th>
                  </tr>

                  {/* Fila columnas */}
                  <tr
                    style={{
                      backgroundColor: '#fff',
                      borderBottom: '2px solid #2BBFBF',
                    }}
                  >
                    <th className="text-left py-3 px-4 font-black uppercase tracking-wider text-xs text-gray-700">
                      Producto
                    </th>
                    <th className="text-center py-3 px-4 font-black uppercase tracking-wider text-xs text-gray-700">
                      Cant.
                    </th>
                    <th className="text-center py-3 px-4 font-black uppercase tracking-wider text-xs text-gray-700">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {/* Filas de productos */}
                  {items.map((item) => (
                    <tr
                      key={item.id}
                      className="border-b border-[#d5f0ef] bg-white"
                    >
                      <td className="py-3 px-4 font-bold text-[#2BBFBF]">
                        {item.name}
                      </td>
                      <td className="py-3 px-4 text-center font-extrabold text-gray-800">
                        {item.quantity}
                      </td>
                      <td className="py-3 px-4 text-center font-bold text-[#2BBFBF]">
                        S/ {(item.price * item.quantity).toFixed(2)}
                      </td>
                    </tr>
                  ))}

                  {/* Subtotal */}
                  <tr className="border-b border-[#d5f0ef] bg-white">
                    <td className="py-2 px-4" />
                    <td className="py-2 px-4 text-right pr-8 text-gray-600 font-semibold text-sm">
                      Subtotal
                    </td>
                    <td className="py-2 px-4 text-center text-gray-600 font-semibold text-sm">
                      S/ {subtotal.toFixed(2)}
                    </td>
                  </tr>

                  {/* Envío */}
                  <tr className="border-b border-[#d5f0ef] bg-white">
                    <td className="py-2 px-4" />
                    <td className="py-2 px-4 text-right pr-8 text-gray-600 font-semibold text-sm">
                      Envío
                    </td>
                    <td className="py-2 px-4 text-center text-gray-600 font-semibold text-sm">
                      S/ {shipping.toFixed(2)}
                    </td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr
                    className="print-turquoise"
                    style={{ backgroundColor: '#2BBFBF', color: '#fff' }}
                  >
                    <td className="py-3 px-4" />
                    <td className="py-3 px-4 text-right pr-8 font-black text-sm uppercase tracking-wider">
                      Total a pagar
                    </td>
                    <td className="py-3 px-4 text-center font-black text-base">
                      S/ {total.toFixed(2)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Orden + Redes sociales */}
            <div className="px-6 pb-6 print:pb-4 flex flex-col items-center gap-4">
              <div className="text-center text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                Orden N° {orderId}
              </div>

              <div className="flex items-center justify-center border-t-[1.5px] border-[#d1f0eb] mt-2 pt-6 pb-2 w-full mx-auto">
                {/* Facebook */}
                <a
                  href="https://www.facebook.com/people/Lyrium-Biomarketplace/61579938364350/"
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 hover:opacity-80 transition-opacity"
                >
                  <img
                    src="https://fv5-4.files.fm/thumb_show.php?i=726g592gj8&view&v=1&PHPSESSID=53ba53ad2030b8e5aae3cf48c4ba83f8e248150a"
                    width={48}
                    height={48}
                    alt="Facebook"
                    className="block mx-auto rounded-full"
                    crossOrigin="anonymous"
                  />
                </a>
                <div className="w-[1px] h-[54px] bg-[#c8e8e4]" />
                {/* Instagram */}
                <a
                  href="https://www.instagram.com/lyrium_biomarketplace/"
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 hover:opacity-80 transition-opacity"
                >
                  <img
                    src="https://cdn-icons-png.flaticon.com/128/4138/4138124.png"
                    width={48}
                    height={48}
                    alt="Instagram"
                    className="block mx-auto rounded-[10px]"
                    crossOrigin="anonymous"
                  />
                </a>
                <div className="w-[1px] h-[54px] bg-[#c8e8e4]" />
                {/* WhatsApp */}
                <a
                  href="https://wa.me/51937093420"
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 hover:opacity-80 transition-opacity"
                >
                  <img
                    src="https://cdn-icons-png.flaticon.com/128/15713/15713434.png"
                    width={48}
                    height={48}
                    alt="WhatsApp"
                    className="block mx-auto"
                    crossOrigin="anonymous"
                  />
                </a>
                <div className="w-[1px] h-[54px] bg-[#c8e8e4]" />
                {/* YouTube */}
                <a
                  href="https://www.youtube.com/@LyriumBiomarketplace"
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 hover:opacity-80 transition-opacity"
                >
                  <img
                    src="https://cdn-icons-png.flaticon.com/128/1384/1384060.png"
                    width={48}
                    height={48}
                    alt="YouTube"
                    className="block mx-auto"
                    crossOrigin="anonymous"
                  />
                </a>
              </div>
            </div>

            {/* Imagen Inferior */}
            <img
              id="boleta-bottom-img"
              src={BOTTOM_IMG}
              alt="Pie boleta"
              className="w-full h-auto block"
              crossOrigin="anonymous"
            />
          </div>

          <p className="text-center text-[10px] text-gray-400 font-medium no-print">
            Usa los botones para descargar o compartir tu boleta
          </p>
        </div>
      </div>

      {/* Share Modal */}
      {showShare && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setShowShare(false)}>
          <div className="bg-white dark:bg-[var(--bg-secondary)] rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 w-full max-w-sm mx-4 p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-800 dark:text-[var(--text-primary)]">Compartir</h3>
              <button onClick={() => setShowShare(false)} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-gray-800 transition">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <div className="grid grid-cols-4 gap-3 mb-5">
              <a href={`https://wa.me/?text=${encodeURIComponent('Mi compra en Lyrium ' + window.location.origin + '/checkout')}`} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-1.5 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-gray-800 transition">
                <div className="w-11 h-11 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600"><MessageCircle className="w-5 h-5" /></div>
                <span className="text-[10px] font-semibold text-slate-600 dark:text-[var(--text-muted)]">WhatsApp</span>
              </a>
              <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.origin + '/checkout')}`} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-1.5 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-gray-800 transition">
                <div className="w-11 h-11 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600"><Facebook className="w-5 h-5" /></div>
                <span className="text-[10px] font-semibold text-slate-600 dark:text-[var(--text-muted)]">Facebook</span>
              </a>
              <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent('Mi compra en Lyrium ' + window.location.origin + '/checkout')}`} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-1.5 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-gray-800 transition">
                <div className="w-11 h-11 rounded-full bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center text-sky-600"><Twitter className="w-5 h-5" /></div>
                <span className="text-[10px] font-semibold text-slate-600 dark:text-[var(--text-muted)]">Twitter / X</span>
              </a>
              <a href={`mailto:?subject=${encodeURIComponent('Mi compra en Lyrium')}&body=${encodeURIComponent(window.location.origin + '/checkout')}`} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-1.5 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-gray-800 transition">
                <div className="w-11 h-11 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600"><Mail className="w-5 h-5" /></div>
                <span className="text-[10px] font-semibold text-slate-600 dark:text-[var(--text-muted)]">Correo</span>
              </a>
            </div>

            <div className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-[var(--bg-card)] rounded-xl">
              <input type="text" readOnly value={`${window.location.origin}/checkout`} className="flex-1 text-xs bg-transparent text-slate-600 dark:text-[var(--text-muted)] outline-none truncate" />
              <button onClick={async () => { await navigator.clipboard.writeText(`${window.location.origin}/checkout`); setCopied(true); setTimeout(() => { setCopied(false); setShowShare(false); }, 2000); }} className="flex items-center gap-1 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-xs font-semibold transition shrink-0">
                {copied ? <><Check className="w-3.5 h-3.5" /> Copiado</> : <><FileText className="w-3.5 h-3.5" /> Copiar</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
