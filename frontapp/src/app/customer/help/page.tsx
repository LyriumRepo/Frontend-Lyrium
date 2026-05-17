'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/shared/lib/context/AuthContext';
import { useRouter } from 'next/navigation';
import Icon from '@/components/ui/Icon';

interface FaqItem {
  question: string;
  answer: string;
}

const faqs: FaqItem[] = [
  {
    question: '¿Cómo puedo rastrear mi pedido?',
    answer: 'Puedes rastrear tu pedido en el módulo "Mis Pedidos". En detalles del pedido encontrarás el estado actualizado y el número de seguimiento.'
  },
  {
    question: '¿Cómo puedo realizar una devolución, reembolso o cancelación de pedido?',
    answer: 'Cualquier solicitud de devolución, reembolso o cancelación de pedido se tramitará directamente con la tienda correspondiente, puede utilizar su módulo "Chat con Vendedor" o las vías de contacto corporativas (correo electrónico y WhatsApp) brindadas por la misma.'
  },
  {
    question: '¿Cuáles son los métodos de pago aceptados por Lyrium Biomarketplace?',
    answer: 'Aceptamos múltiples métodos de pago, incluyendo tarjetas de crédito y débito Visa, Mastercard y American Express, así como las billeteras digitales Yape y Plin.'
  },
  {
    question: '¿Cuánto tiempo tarda en llegar mi pedido?',
    answer: 'El tiempo de entrega depende de tu ubicación, la modalidad de envió y del operador logístico designado por la tienda en donde realizo el pedido. También puedo ver los detalles en su modulo "Mis Pedidos".'
  },
  {
    question: '¿Cómo puedo contactar al soporte de Lyrium Biomarketplace?',
    answer: 'Puedes contactarnos a través del módulo "Soporte Lyrium", enviando un ticket de atención con su respectiva categoría y asunto.'
  }
];

export default function CustomerHelpPage() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (loading) return;
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [loading, isAuthenticated, router]);

  const filteredFaqs = faqs.filter(faq => 
    faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-800 dark:text-[var(--text-primary)]">
            Centro de Ayuda
          </h1>
          <p className="text-slate-500 dark:text-[var(--text-muted)] mt-1">
            Encuentra respuestas a tus preguntas
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-[var(--bg-secondary)] rounded-3xl shadow-xl border border-slate-100 dark:border-[var(--border-subtle)] overflow-hidden">
        <div className="bg-gradient-to-r from-sky-400 via-sky-500 to-sky-600 dark:from-[var(--brand-green-hover)] dark:via-[var(--brand-green)] dark:to-[var(--brand-green-hover)] p-8 flex items-center gap-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl" />
          <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30 shadow-inner">
            <Icon name="Search" className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-black tracking-tighter leading-none text-white">
              Busca Ayuda
            </h3>
            <p className="text-[10px] font-bold text-amber-100 uppercase tracking-[0.2em] mt-1">
              Preguntas Frecuentes
            </p>
          </div>
        </div>

        <div className="p-8">
          <div className="relative mb-8">
            <input
              type="text"
              placeholder="Buscar pregunta..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-sm font-bold text-gray-800 dark:text-[var(--text-primary)] bg-gray-50 dark:bg-[var(--bg-muted)] p-4 pl-12 border-2 border-gray-200 dark:border-[var(--border-subtle)] rounded-xl outline-none focus:border-sky-500 dark:focus:border-[var(--brand-green)] focus:ring-2 focus:ring-sky-100  dark:focus:ring-[var(--icons-green)] transition-all"
            />
            <Icon name="Search" className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          </div>

          <div className="space-y-4">
            {filteredFaqs.map((faq, index) => (
              <div
                key={index}
                className="border-2 border-gray-200 dark:border-[var(--border-subtle)] rounded-xl overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 dark:hover:bg-[#182420] transition-colors"
                >
                  <span className="text-sm font-bold text-gray-800 dark:text-[var(--text-primary)] pr-4">
                    {faq.question}
                  </span>
                  <Icon
                    name="ChevronDown"
                    className={`w-5 h-5 text-gray-500 transition-transform ${
                      openFaq === index ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {openFaq === index && (
                  <div className="p-4 pt-4 border-t border-gray-100 dark:border-[var(--border-subtle)]">
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {filteredFaqs.length === 0 && (
            <div className="text-center py-8">
              <Icon name="SearchX" className="w-12 h-12 text-gray-300 dark:text-[#2A3F33] mx-auto mb-4" />
              <p className="text-gray-500 dark:text-[var(--text-muted)]">No se encontraron resultados</p>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <a
          href="/customer/support"
          className="bg-white dark:bg-[var(--bg-secondary)] p-6 rounded-2xl shadow-lg border border-slate-100 dark:border-[var(--border-subtle)] hover:border-[#bde90d] transition-colors group"
        >
          <div className="w-12 h-12 bg-[#bde90d]/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Icon name="MessageCircle" className="w-6 h-6 text-[#bde90d]" />
          </div>
          <h4 className="font-bold text-gray-800 dark:text-[var(--text-primary)] mb-2">Soporte Lyrium</h4>
          <p className="text-sm text-gray-500 dark:text-[var(--text-muted)]">Habla con un agente ahora</p>
        </a>

        <a
          href="mailto:soporte@lyrium.com"
          className="bg-white dark:bg-[var(--bg-secondary)] p-6 rounded-2xl shadow-lg border border-slate-100 dark:border-[var(--border-subtle)] hover:border-[#78e69d] transition-colors group"
        >
          <div className="w-12 h-12 bg-[#78e69d]/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Icon name="Mail" className="w-6 h-6 text-[#78e69d]" />
          </div>
          <h4 className="font-bold text-gray-800 dark:text-[var(--text-primary)] mb-2">Email</h4>
          <p className="text-sm text-gray-500 dark:text-[var(--text-muted)]">ventas@lyriumbiomarketplace.com</p>
        </a>

        <a
          href="tel:+5101800000"
          className="bg-white dark:bg-[var(--bg-secondary)] p-6 rounded-2xl shadow-lg border border-slate-100 dark:border-[var(--border-subtle)] hover:border-[#59a6cb] transition-colors group"
        >
          <div className="w-12 h-12 bg-[#59a6cb]/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Icon name="Phone" className="w-6 h-6 text-[#59a6cb]" />
          </div>
          <h4 className="font-bold text-gray-800 dark:text-[var(--text-primary)] mb-2">Teléfono</h4>
          <p className="text-sm text-gray-500 dark:text-[var(--text-muted)]">0800-0000 (Sin costo)</p>
        </a>
      </div>
    </div>
  );
}
