'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/shared/lib/context/AuthContext';
import { useRouter } from 'next/navigation';
import ModuleHeader from '@/components/layout/shared/ModuleHeader';
import Icon from '@/components/ui/Icon';

interface FaqCategory {
  id: string;
  label: string;
  icon: string;
  faqs: FaqItem[];
}

interface FaqItem {
  question: string;
  answer: string;
}

const faqCategories: FaqCategory[] = [
  {
    id: 'pedidos',
    label: 'Pedidos y Entregas',
    icon: 'Package',
    faqs: [
      {
        question: '¿Cómo puedo rastrear mi pedido?',
        answer: 'Puedes rastrear tu pedido en el módulo "Mis Pedidos" del panel de cliente. Allí encontrarás el estado actualizado, el número de seguimiento y la información del operador logístico asignado por la tienda.'
      },
      {
        question: '¿Cuánto tiempo tarda en llegar mi pedido?',
        answer: 'El tiempo de entrega depende de tu ubicación, la modalidad de envío seleccionada y el operador logístico designado por la tienda. Puedes ver los detalles en tu módulo "Mis Pedidos", donde encontrarás la fecha estimada de entrega.'
      },
      {
        question: '¿Puedo cambiar la dirección de envío después de realizar un pedido?',
        answer: 'Si tu pedido aún no ha sido enviado, puedes contactar directamente con la tienda a través del módulo "Chat con Vendedores" para solicitar el cambio de dirección. Una vez enviado, no será posible modificar la dirección.'
      },
    ],
  },
  {
    id: 'devoluciones',
    label: 'Devoluciones y Reembolsos',
    icon: 'RotateCcw',
    faqs: [
      {
        question: '¿Cómo puedo solicitar una devolución o reembolso?',
        answer: 'Las solicitudes de devolución, reembolso o cancelación se tramitan directamente con la tienda correspondiente. Puedes usar el módulo "Chat con Vendedores" o contactar a la tienda por los medios que te haya proporcionado. Si no llegas a un acuerdo, puedes abrir un ticket en "Soporte Lyrium" para que intermediemos.'
      },
      {
        question: '¿Cuánto tiempo tengo para solicitar una devolución?',
        answer: 'El plazo para solicitar una devolución es de 7 días calendario después de recibir el producto, siempre que este se encuentre en su estado original y con el empaque intacto.'
      },
      {
        question: '¿Cuánto tarda en procesarse un reembolso?',
        answer: 'Una vez que la tienda aprueba la devolución y confirma la recepción del producto, el reembolso se procesa en un plazo de 3 a 7 días hábiles, dependiendo del método de pago utilizado.'
      },
    ],
  },
  {
    id: 'pagos',
    label: 'Métodos de Pago',
    icon: 'CreditCard',
    faqs: [
      {
        question: '¿Cuáles son los métodos de pago aceptados?',
        answer: 'Aceptamos múltiples métodos de pago, incluyendo tarjetas de crédito y débito Visa, Mastercard y American Express, así como las billeteras digitales Yape y Plin.'
      },
      {
        question: '¿Es seguro pagar en Lyrium Biomarketplace?',
        answer: 'Sí, todas las transacciones están protegidas con encriptación SSL de grado bancario. No almacenamos información sensible de tus tarjetas, y todos los pagos se procesan a través de pasarelas de pago seguras.'
      },
      {
        question: '¿Puedo usar múltiples métodos de pago en una sola compra?',
        answer: 'Actualmente solo se puede usar un método de pago por cada compra. Si deseas usar diferentes métodos, puedes realizar pedidos separados.'
      },
    ],
  },
  {
    id: 'cuenta',
    label: 'Mi Cuenta',
    icon: 'User',
    faqs: [
      {
        question: '¿Cómo puedo actualizar mis datos personales?',
        answer: 'Puedes actualizar tu información personal desde el módulo "Mi Perfil" en el panel de cliente. Allí podrás modificar tu nombre, correo electrónico, teléfono y foto de perfil.'
      },
      {
        question: '¿Cómo cambio mi contraseña?',
        answer: 'Dirígete a la sección "Seguridad" en tu panel de cliente. Allí encontrarás un formulario para cambiar tu contraseña, donde deberás ingresar tu contraseña actual y la nueva. Te recomendamos usar una contraseña única y segura.'
      },
      {
        question: '¿Puedo tener más de una dirección de envío?',
        answer: 'Sí, puedes registrar múltiples direcciones de envío en la sección "Direcciones de Envío" del panel de cliente. Puedes marcar una como predeterminada y elegir cuál usar al momento de realizar un pedido.'
      },
    ],
  },
  {
    id: 'soporte',
    label: 'Soporte Técnico',
    icon: 'Headset',
    faqs: [
      {
        question: '¿Cómo puedo contactar al soporte de Lyrium?',
        answer: 'Puedes contactarnos a través del módulo "Soporte Lyrium", donde puedes crear un ticket de atención seleccionando la categoría y describiendo tu problema. También puedes contactarnos por correo electrónico o telefónicamente.'
      },
      {
        question: '¿Cuál es el horario de atención al cliente?',
        answer: 'Nuestro horario de atención es de lunes a viernes de 8:00 a.m. a 6:00 p.m. y sábados de 9:00 a.m. a 1:00 p.m. Los tickets creados fuera de este horario serán atendidos al inicio del siguiente día hábil.'
      },
      {
        question: '¿Qué hago si tengo un problema con un producto que compré?',
        answer: 'Primero, contacta al vendedor a través del módulo "Chat con Vendedores". Si no obtienes respuesta o solución en un plazo de 48 horas, puedes abrir un ticket en "Soporte Lyrium" seleccionando la categoría adecuada para que nuestro equipo interceda.'
      },
    ],
  },
];

const allFaqs = faqCategories.flatMap(c => c.faqs);

export default function CustomerHelpPage() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  useEffect(() => {
    if (loading) return;
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [loading, isAuthenticated, router]);

  const filteredFaqs = activeCategory
    ? faqCategories.find(c => c.id === activeCategory)?.faqs ?? []
    : allFaqs;

  const searchedFaqs = searchTerm
    ? filteredFaqs.filter(faq =>
        faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : filteredFaqs;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-500" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      <ModuleHeader
        title="Centro de Ayuda"
        subtitle="Encuentra respuestas a tus preguntas frecuentes"
        icon="HelpCircle"
      />

      <div className="bg-white dark:bg-[var(--bg-secondary)] rounded-[2.5rem] shadow-2xl border border-slate-100 dark:border-[var(--border-subtle)] overflow-hidden">
        <div className="bg-gradient-to-r from-sky-400 via-sky-500 to-sky-600 dark:from-[var(--brand-green-hover)] dark:via-[var(--brand-green)] dark:to-[var(--brand-green-hover)] p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl" />
          <div className="relative z-10 flex items-center gap-5">
            <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30">
              <Icon name="Search" className="w-7 h-7 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-black tracking-tighter text-white">
                Busca Ayuda
              </h3>
              <p className="text-[10px] font-bold text-amber-100 uppercase tracking-[0.2em] mt-1">
                Preguntas Frecuentes
              </p>
            </div>
          </div>
        </div>

        <div className="p-8">
          <div className="relative mb-8">
            <input
              type="text"
              placeholder="Buscar pregunta..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setActiveCategory(null); }}
              className="w-full text-sm font-bold text-gray-800 dark:text-[var(--text-primary)] bg-gray-50 dark:bg-[var(--bg-muted)] p-5 pl-14 border-2 border-gray-200 dark:border-[var(--border-subtle)] rounded-2xl outline-none focus:border-sky-500 dark:focus:border-[var(--brand-green)] focus:ring-2 focus:ring-sky-100 dark:focus:ring-[var(--icons-green)] transition-all"
            />
            <Icon name="Search" className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          </div>

          <div className="flex flex-wrap gap-3 mb-8">
            <button
              onClick={() => { setActiveCategory(null); setSearchTerm(''); }}
              className={`px-5 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${
                activeCategory === null
                  ? 'bg-sky-500 dark:bg-[var(--brand-green)] text-white shadow-lg'
                  : 'bg-gray-100 dark:bg-[var(--bg-muted)] text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-[#2A3F33]'
              }`}
            >
              Todas
            </button>
            {faqCategories.map(cat => (
              <button
                key={cat.id}
                onClick={() => { setActiveCategory(cat.id); setSearchTerm(''); }}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${
                  activeCategory === cat.id
                    ? 'bg-sky-500 dark:bg-[var(--brand-green)] text-white shadow-lg'
                    : 'bg-gray-100 dark:bg-[var(--bg-muted)] text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-[#2A3F33]'
                }`}
              >
                <Icon name={cat.icon as any} className="w-4 h-4" />
                {cat.label}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            {searchedFaqs.map((faq, index) => (
              <div
                key={index}
                className="border border-gray-200 dark:border-[var(--border-subtle)] rounded-2xl overflow-hidden transition-all"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className={`w-full flex items-center justify-between p-5 text-left transition-colors ${
                    openFaq === index
                      ? 'bg-sky-50 dark:bg-[#1A3A32]'
                      : 'hover:bg-gray-50 dark:hover:bg-[#182420]'
                  }`}
                >
                  <span className="text-sm font-bold text-gray-800 dark:text-[var(--text-primary)] pr-4 flex-1">
                    {faq.question}
                  </span>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                    openFaq === index
                      ? 'bg-sky-500 dark:bg-[var(--brand-green)] text-white'
                      : 'bg-gray-100 dark:bg-[var(--bg-muted)] text-gray-500'
                  }`}>
                    <Icon
                      name="ChevronDown"
                      className={`w-4 h-4 transition-transform ${
                        openFaq === index ? 'rotate-180' : ''
                      }`}
                    />
                  </div>
                </button>
                {openFaq === index && (
                  <div className="px-5 pb-5 pt-0 border-t border-gray-100 dark:border-[var(--border-subtle)]">
                    <div className="mt-4 pl-4 border-l-4 border-sky-400 dark:border-[var(--icons-green)]">
                      <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {searchedFaqs.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-sky-50 dark:bg-[#1A3A32] rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon name="SearchX" className="w-8 h-8 text-sky-400 dark:text-[var(--icons-green)]" />
              </div>
              <p className="font-bold text-gray-800 dark:text-[var(--text-primary)]">Sin resultados</p>
              <p className="text-sm text-gray-500 dark:text-[var(--text-muted)] mt-1">
                {searchTerm
                  ? `No encontramos "${searchTerm}". Intenta con otros términos.`
                  : 'No hay preguntas en esta categoría.'}
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <a
          href="/customer/support"
          className="bg-white dark:bg-[var(--bg-secondary)] p-6 rounded-[2rem] shadow-xl border border-slate-100 dark:border-[var(--border-subtle)] hover:border-[#bde90d] dark:hover:border-[var(--icons-green)] transition-all group hover:-translate-y-1"
        >
          <div className="w-14 h-14 bg-[#bde90d]/20 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Icon name="MessageCircle" className="w-7 h-7 text-[#bde90d]" />
          </div>
          <h4 className="font-bold text-gray-800 dark:text-[var(--text-primary)] mb-2">Soporte Lyrium</h4>
          <p className="text-sm text-gray-500 dark:text-[var(--text-muted)]">Habla con un agente ahora</p>
        </a>

        <button
          onClick={() => window.dispatchEvent(new CustomEvent('lyrium:open-chatbot'))}
          className="bg-white dark:bg-[var(--bg-secondary)] p-6 rounded-[2rem] shadow-xl border border-slate-100 dark:border-[var(--border-subtle)] hover:border-[var(--turquesa-500)] dark:hover:border-[var(--icons-green)] transition-all group hover:-translate-y-1 text-left w-full cursor-pointer"
        >
          <div className="w-14 h-14 bg-[var(--turquesa-500)]/10 dark:bg-[#1A3A32] rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Icon name="Bot" className="w-7 h-7 text-[var(--turquesa-500)] dark:text-[var(--icons-green)]" />
          </div>
          <h4 className="font-bold text-gray-800 dark:text-[var(--text-primary)] mb-2">Asistente Lyrio</h4>
          <p className="text-sm text-gray-500 dark:text-[var(--text-muted)]">Asistente virtual inteligente</p>
        </button>

        <a
          href="mailto:ventas@lyriumbiomarketplace.com"
          className="bg-white dark:bg-[var(--bg-secondary)] p-6 rounded-[2rem] shadow-xl border border-slate-100 dark:border-[var(--border-subtle)] hover:border-[#78e69d] dark:hover:border-[var(--icons-green)] transition-all group hover:-translate-y-1"
        >
          <div className="w-14 h-14 bg-[#78e69d]/20 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Icon name="Mail" className="w-7 h-7 text-[#78e69d]" />
          </div>
          <h4 className="font-bold text-gray-800 dark:text-[var(--text-primary)] mb-2">Correo Electrónico</h4>
          <p className="text-sm text-gray-500 dark:text-[var(--text-muted)]">ventas@lyriumbiomarketplace.com</p>
        </a>
      </div>

    </div>
  );
}
