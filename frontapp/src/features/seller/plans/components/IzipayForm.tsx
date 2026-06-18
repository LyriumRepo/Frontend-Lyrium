'use client';
// ============================================
// COMPONENT — IzipayForm
// Monta e inicializa el SDK KR de Izipay.
// ============================================

import { useEffect, useRef } from 'react';

interface IzipayConfig {
  formToken: string;
  publicKey: string;
  orderId: string;
  formConfig?: Record<string, string>;
}

interface Props {
  config: IzipayConfig | null;
  open: boolean;
  onPaid: () => void;
  onFailed: () => void;
}

interface IzipaySdk {
  setFormConfig: (cfg: Record<string, string>) => Promise<void>;
  renderElements: (selector: string) => void;
  onSubmit: (cb: (data: { clientAnswer: { orderStatus: string } }) => boolean) => void;
}

function getKR(): IzipaySdk | undefined {
  return (window as unknown as { KR?: IzipaySdk }).KR;
}

const KR_CSS = 'https://static.micuentaweb.pe/static/js/krypton-client/V4.0/stable/kr-payment-form.min.css';
const KR_JS  = 'https://static.micuentaweb.pe/static/js/krypton-client/V4.0/stable/kr-payment-form.min.js';

let _cssLoaded    = false;
let _scriptEl: HTMLScriptElement | null = null;

function ensureCSS() {
  if (_cssLoaded) return;
  _cssLoaded = true;
  const link = document.createElement('link');
  link.rel  = 'stylesheet';
  link.href = KR_CSS;
  document.head.appendChild(link);
}

function loadScript(publicKey: string): Promise<void> {
  return new Promise((resolve) => {
    if (_scriptEl) {
      // Script ya existe — sólo resolemos; setFormConfig actualizará el token
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = KR_JS;
    script.setAttribute('kr-public-key',       publicKey);
    script.setAttribute('kr-post-url-success', 'javascript:void(0)');
    script.onload = () => resolve();
    document.head.appendChild(script);
    _scriptEl = script;
  });
}

export default function IzipayForm({ config, open, onPaid, onFailed }: Props) {
  const initDone = useRef(false);

  useEffect(() => {
    if (!open || !config) return;

    let cancelled = false;
    initDone.current = false;

    async function init() {
      ensureCSS();
      await loadScript(config!.publicKey);
      if (cancelled) return;

      // Espera a que el objeto KR esté disponible (puede tardar unos ms tras onload)
      let kr = getKR();
      let retries = 0;
      while (!kr && retries < 30) {
        await new Promise(r => setTimeout(r, 100));
        kr = getKR();
        retries++;
      }

      if (!kr || cancelled || initDone.current) return;
      initDone.current = true;

      await kr.setFormConfig({
        ...config!.formConfig,
        'kr-public-key': config!.publicKey,
        formToken: config!.formToken,
      });

      if (cancelled) return;

      // Pequeño delay para que el DOM del modal esté completamente pintado
      await new Promise(r => setTimeout(r, 200));
      if (cancelled) return;

      kr.renderElements('#izipayFormContainer');

      kr.onSubmit((paymentData) => {
        const status = paymentData.clientAnswer.orderStatus;
        if (status === 'PAID') {
          onPaid();
        } else {
          onFailed();
        }
        return false;
      });
    }

    init().catch(console.error);

    return () => {
      cancelled = true;
    };
  }, [open, config, onPaid, onFailed]);

  return <div className="izipay-form-inner" />;
}
