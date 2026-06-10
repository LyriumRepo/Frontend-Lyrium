'use client';

import { useCheckoutStore } from '@/store/checkoutStore';
import { Download } from 'lucide-react';

const TOP_IMG =
  'https://fv5-5.files.fm/thumb_show.php?i=msu7t9u4py&view&v=1&PHPSESSID=53ba53ad2030b8e5aae3cf48c4ba83f8e248150a';
const BOTTOM_IMG =
  'https://fv5-5.files.fm/thumb_show.php?i=8dn38fae9w&view&v=1&PHPSESSID=53ba53ad2030b8e5aae3cf48c4ba83f8e248150a';

export default function BoletaView() {
  const result = useCheckoutStore((s) => s.orderResult);

  if (!result) return null;

  const { orderId, total, items } = result;

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
          #boleta-top-img,
          #boleta-bottom-img {
            display: block !important;
            width: 100% !important;
            height: auto !important;
          }
          .print-turquoise {
            background-color: #0EA5E9 !important;
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
          <div className="flex justify-end no-print">
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-sky-500 text-white font-black text-xs uppercase tracking-widest hover:bg-sky-600 transition-all shadow-lg"
            >
              <Download className="w-4 h-4" /> Descargar Boleta
            </button>
          </div>

          {/* Boleta */}
          <div className="bg-white rounded-2xl overflow-hidden shadow-xl border border-gray-200 print:border-0 print:shadow-none print:rounded-none">
            {/* Imagen Superior */}
            <img
              id="boleta-top-img"
              src={TOP_IMG}
              alt="Encabezado boleta"
              className="w-full h-auto block"
              crossOrigin="anonymous"
            />

            {/* Tabla subida hacia la imagen superior */}
            <div className="px-6 pt-2 pb-4 print:pt-0 print:pb-2 -mt-2 print:-mt-1 relative z-10">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr
                    className="print-turquoise"
                    style={{ backgroundColor: '#0EA5E9', color: '#fff' }}
                  >
                    <th className="text-left py-3 px-4 font-black uppercase tracking-wider text-xs">
                      Producto
                    </th>
                    <th className="text-center py-3 px-4 font-black uppercase tracking-wider text-xs">
                      Cantidad
                    </th>
                    <th className="text-right py-3 px-4 font-black uppercase tracking-wider text-xs">
                      Precio
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id} className="border-b border-gray-100">
                      <td className="py-3 px-4 font-medium text-gray-800">
                        {item.name}
                      </td>
                      <td className="py-3 px-4 text-center text-gray-700">
                        {item.quantity}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-gray-800">
                        S/ {(item.price * item.quantity).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr
                    className="print-turquoise"
                    style={{ backgroundColor: '#0EA5E9', color: '#fff' }}
                  >
                    <td className="py-3 px-4 font-black uppercase tracking-wider text-xs">
                      TOTAL
                    </td>
                    <td className="py-3 px-4 text-center font-black">
                      {items.reduce((a, i) => a + i.quantity, 0)}
                    </td>
                    <td className="py-3 px-4 text-right font-black text-base">
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
                  href="https://scontent.flim12-1.fna.fbcdn.net/v/t39.8562-6/422083590_1312812522712666_5569536549360094726_n.png?_nc_cat=111&ccb=1-7&_nc_sid=f537c7&_nc_ohc=KMrDXz7FHWEQ7kNvwFfz5Zs&_nc_oc=AdoLX3eoa3JV_kII4bVJjhFepzebmSLY4OHN6y7kNgj31LkOBCcXSVrC_K_wkFXgeKc&_nc_zt=14&_nc_ht=scontent.flim12-1.fna&_nc_gid=fcJRrwQxVMR-8lzNfuVVuw&_nc_ss=7b289&oh=00_Af-JFhiyOdU9SATd8zll_r1dvPm2VHJ2PelUYfKYHyqSww&oe=6A2957FC"
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
            Usa el botón Descargar o Ctrl+P para guardar la boleta
          </p>
        </div>
      </div>
    </>
  );
}
