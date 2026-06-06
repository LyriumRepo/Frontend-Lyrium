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
}

interface Props {
  config: IzipayConfig | null;
  open: boolean;
  onPaid: () => void;       // Pago exitoso → mostrar modal de espera SSE
  onFailed: () => void;     // Pago fallido
}

let _scriptLoaded = false;
let _cssLoaded    = false;

export default function IzipayForm({ config, open, onPaid, onFailed }: Props) {
  const initDone = useRef(false);

  useEffect(() => {
    if (!open || !config) return;
    initDone.current = false;

    function initKR() {
      const KR = (window as any).KR;
      if (!KR) {
        setTimeout(initKR, 300);
        return;
      }
      if (initDone.current) return;
      initDone.current = true;

      if (!config) return;

      KR.setFormConfig({
        formToken:       config.formToken,
        'kr-public-key': config.publicKey,
        'kr-language':   'es-PE',
      }).then(() => {
        KR.renderElements('#izipayFormContainer');
      });

      KR.onSubmit((paymentData: any) => {
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
