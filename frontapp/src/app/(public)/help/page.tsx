'use client';

import Icon from '@/components/ui/Icon';

export default function HelpPage() {
  const faqs = [
    {
      question: '¿Cómo puedo registrarme?',
      answer: 'Puedes registrarte haciendo clic en el botón "Registrarse" en la página principal y completando el formulario con tus datos.',
    },
    {
      question: '¿Cómo puedo contactarlos?',
      answer: 'Puedes contactarnos a través de nuestro formulario de contacto en la página /contactanos o enviarnos un email a soporte@lyrium.com',
    },
    {
      question: '¿Cuál es su política de devoluciones?',
      answer: 'Tienes 30 días para devolver productos en su estado original. Consulta nuestra política de devoluciones para más detalles.',
    },
    {
      question: '¿Cómo puedo rastrear mi pedido?',
      answer: 'Una vez realizado tu pedido, recibirás un email con un número de seguimiento. También puedes verlo en tu sección de pedidos.',
    },
  ];

  return (
    <main className="min-h-screen bg-[#f8f9fa] dark:bg-[var(--bg-primary)] py-12 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-sky-100 dark:bg-[var(--bg-muted)] rounded-full mb-6">
            <Icon name="HelpCircle" className="w-10 h-10 text-sky-500" />
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-800 dark:text-[var(--text-primary)]">
            Centro de Ayuda
          </h1>
          <p className="text-slate-500 dark:text-[var(--text-muted)] mt-2">
            Encuentra respuestas a tus preguntas más frecuentes
          </p>
        </div>

        <div className="grid gap-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-white dark:bg-[var(--bg-secondary)] rounded-2xl shadow-lg border border-slate-100 dark:border-[var(--border-subtle)] p-6"
            >
              <h3 className="font-bold text-slate-800 dark:text-[var(--text-primary)] mb-2 flex items-center gap-2">
                <Icon name="MessageCircle" className="w-5 h-5 text-sky-500" />
                {faq.question}
              </h3>
              <p className="text-slate-600 dark:text-[var(--text-muted)]">
                {faq.answer}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-slate-500 dark:text-[var(--text-muted)] mb-4">
            ¿No encontraste lo que buscabas?
          </p>
          <a
            href="/contactanos"
            className="inline-flex items-center gap-2 px-6 py-3 bg-sky-500 text-white font-bold rounded-xl hover:bg-sky-600 transition-colors"
          >
            <Icon name="Mail" className="w-5 h-5" />
            Contáctanos
          </a>
        </div>
      </div>
    </main>
  );
}
