'use client';
// ============================================
// COMPONENT — IzipayForm
// Monta e inicializa el SDK KR de Izipay.
// Equivalente exacto de _montarFormularioIzipay() en planes.controller.js
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
  onPaid: () => void;       // Pago exitoso → mostrar modal de espera SSE
  onFailed: () => void;     // Pago fallido
}

interface IzipaySdk {
  setFormConfig: (cfg: Record<string, string>) => Promise<void>;
  renderElements: (selector: string) => void;
  onSubmit: (cb: (data: { clientAnswer: { orderStatus: string } }) => boolean) => void;
}

function getKR(): IzipaySdk | undefined {
  return (window as unknown as { KR?: IzipaySdk }).KR;
}

let _scriptLoaded = false;
let _cssLoaded    = false;

export default function IzipayForm({ config, open, onPaid, onFailed }: Props) {
  const initDone = useRef(false);

  useEffect(() => {
    if (!open || !config) return;
    initDone.current = false;

    function initKR() {
      const kr = getKR();
      if (!kr) {
        setTimeout(initKR, 300);
        return;
      }
      if (initDone.current) return;
      initDone.current = true;

      if (!config) return;

      kr.setFormConfig({
        ...config.formConfig,
        formToken: config.formToken,
      });
      // Renderizar elementos en el contenedor
      setTimeout(() => {
        kr.renderElements('#izipayFormContainer');
      }, 100);
      kr.onSubmit((paymentData) => {
        const status = paymentData.clientAnswer.orderStatus;
        if (status === 'PAID') {
          onPaid();
        } else {
          onFailed();
        }
        return false; // Prevenir redirect de Izipay
      });
    }

    // Cargar CSS de Izipay una sola vez
    if (!_cssLoaded) {
      _cssLoaded = true;
      const link = document.createElement('link');
      link.rel  = 'stylesheet';
      link.href = 'https://static.micuentaweb.pe/static/js/krypton-client/V4.0/stable/kr-payment-form.min.css';
      document.head.appendChild(link);
    }

    // Cargar script de Izipay una sola vez
    if (!_scriptLoaded) {
      _scriptLoaded = true;
      const script = document.createElement('script');
      script.src   = 'https://static.micuentaweb.pe/static/js/krypton-client/V4.0/stable/kr-payment-form.min.js';
      script.setAttribute('kr-public-key',        config.publicKey);
      script.setAttribute('kr-post-url-success',  'javascript:void(0)');
      script.onload = initKR;
      document.head.appendChild(script);
    } else {
      initKR();
    }
  }, [open, config]);

  return <div className="izipay-form-inner" />;
}
