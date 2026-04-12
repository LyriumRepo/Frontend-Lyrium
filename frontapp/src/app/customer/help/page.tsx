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
    answer: 'Puedes rastrear tu pedido en la sección "Mis Pedidos". Allí encontrarás el estado actualizado y el número de seguimiento.'
  },
  {
    question: '¿Cómo puedo devolver un producto?',
    answer: 'Para devolver un producto, ve a "Mis Pedidos", selecciona el pedido y haz clic en "Solicitar Devolución". Te guiaremos a través del proceso.'
  },
  {
    question: '¿Cuáles son los métodos de pago aceptados?',
    answer: 'Aceptamos tarjetas de crédito/débito (Visa, Mastercard, American Express), PayPal y transferencia bancaria.'
  },
  {
    question: '¿Cuánto tiempo tarda en llegar mi pedido?',
    answer: 'El tiempo de entrega depende de tu ubicación. Generalmente entre 3-7 días hábiles para Lima y 5-10 días hábiles para provincias.'
  },
  {
    question: '¿Cómo puedo contactar al soporte?',
    answer: 'Puedescontactarnos a través de nuestro chat en vivo, enviando un ticket de soporte o escribiendo a soporte@lyrium.com'
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
        <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 p-8 flex items-center gap-5 relative overflow-hidden">
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
              className="w-full text-sm font-bold text-gray-800 dark:text-[var(--text-primary)] bg-gray-50 dark:bg-[var(--bg-muted)] p-4 pl-12 border-2 border-gray-200 dark:border-[var(--border-subtle)] rounded-xl outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100 transition-all"
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
                  <div className="p-4 pt-0 border-t border-gray-100 dark:border-[var(--border-subtle)]">
                    <p className="text-sm text-gray-600 dark:text-[var(--text-muted)]">
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
          className="bg-white dark:bg-[var(--bg-secondary)] p-6 rounded-2xl shadow-lg border border-slate-100 dark:border-[var(--border-subtle)] hover:border-sky-300 dark:hover:border-sky-600 transition-colors group"
        >
          <div className="w-12 h-12 bg-sky-100 dark:bg-sky-900/30 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Icon name="MessageCircle" className="w-6 h-6 text-sky-600 dark:text-sky-400" />
          </div>
          <h4 className="font-bold text-gray-800 dark:text-[var(--text-primary)] mb-2">Chat en Vivo</h4>
          <p className="text-sm text-gray-500 dark:text-[var(--text-muted)]">Habla con un agente ahora</p>
        </a>

        <a
          href="mailto:soporte@lyrium.com"
          className="bg-white dark:bg-[var(--bg-secondary)] p-6 rounded-2xl shadow-lg border border-slate-100 dark:border-[var(--border-subtle)] hover:border-violet-300 dark:hover:border-violet-600 transition-colors group"
        >
          <div className="w-12 h-12 bg-violet-100 dark:bg-violet-900/30 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Icon name="Mail" className="w-6 h-6 text-violet-600 dark:text-violet-400" />
          </div>
          <h4 className="font-bold text-gray-800 dark:text-[var(--text-primary)] mb-2">Email</h4>
          <p className="text-sm text-gray-500 dark:text-[var(--text-muted)]">soporte@lyrium.com</p>
        </a>

        <a
          href="tel:+5101800000"
          className="bg-white dark:bg-[var(--bg-secondary)] p-6 rounded-2xl shadow-lg border border-slate-100 dark:border-[var(--border-subtle)] hover:border-emerald-300 dark:hover:border-emerald-600 transition-colors group"
        >
          <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Icon name="Phone" className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h4 className="font-bold text-gray-800 dark:text-[var(--text-primary)] mb-2">Teléfono</h4>
          <p className="text-sm text-gray-500 dark:text-[var(--text-muted)]">0800-0000 (Sin costo)</p>
        </a>
      </div>
    </div>
  );
}
