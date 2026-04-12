'use client';

import { useState } from 'react';
import Icon from '@/components/ui/Icon';

export default function SupportPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Support request:', formData);
  };

  return (
    <main className="min-h-screen bg-[#f8f9fa] dark:bg-[var(--bg-primary)] py-12 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-sky-100 dark:bg-[var(--bg-muted)] rounded-full mb-6">
            <Icon name="Headphones" className="w-10 h-10 text-sky-500" />
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-800 dark:text-[var(--text-primary)]">
            Soporte Técnico
          </h1>
          <p className="text-slate-500 dark:text-[var(--text-muted)] mt-2">
            Estamos aquí para ayudarte
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <div className="bg-white dark:bg-[var(--bg-secondary)] rounded-2xl shadow-lg border border-slate-100 dark:border-[var(--border-subtle)] p-6">
            <div className="w-12 h-12 bg-sky-100 dark:bg-[var(--bg-muted)] rounded-xl flex items-center justify-center mb-4">
              <Icon name="Mail" className="w-6 h-6 text-sky-500" />
            </div>
            <h3 className="font-bold text-lg text-slate-800 dark:text-[var(--text-primary)] mb-2">
              Email
            </h3>
            <p className="text-slate-600 dark:text-[var(--text-muted)]">
              soporte@lyrium.com
            </p>
          </div>

          <div className="bg-white dark:bg-[var(--bg-secondary)] rounded-2xl shadow-lg border border-slate-100 dark:border-[var(--border-subtle)] p-6">
            <div className="w-12 h-12 bg-sky-100 dark:bg-[var(--bg-muted)] rounded-xl flex items-center justify-center mb-4">
              <Icon name="Clock" className="w-6 h-6 text-sky-500" />
            </div>
            <h3 className="font-bold text-lg text-slate-800 dark:text-[var(--text-primary)] mb-2">
              Horario
            </h3>
            <p className="text-slate-600 dark:text-[var(--text-muted)]">
              Lun - Vie: 9am - 6pm
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white dark:bg-[var(--bg-secondary)] rounded-2xl shadow-lg border border-slate-100 dark:border-[var(--border-subtle)] p-6">
          <h2 className="text-xl font-bold text-slate-800 dark:text-[var(--text-primary)] mb-6">
            Envíanos un mensaje
          </h2>
          
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-[var(--text-primary)] mb-2">
                Nombre
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-[var(--bg-muted)] border border-slate-200 dark:border-[var(--border-subtle)] rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-[var(--text-primary)] mb-2">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-[var(--bg-muted)] border border-slate-200 dark:border-[var(--border-subtle)] rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
                required
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 dark:text-[var(--text-primary)] mb-2">
              Asunto
            </label>
            <input
              type="text"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-[var(--bg-muted)] border border-slate-200 dark:border-[var(--border-subtle)] rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 dark:text-[var(--text-primary)] mb-2">
              Mensaje
            </label>
            <textarea
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              rows={5}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-[var(--bg-muted)] border border-slate-200 dark:border-[var(--border-subtle)] rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-4 bg-sky-500 text-white font-bold rounded-xl hover:bg-sky-600 transition-colors flex items-center justify-center gap-2"
          >
            <Icon name="Send" className="w-5 h-5" />
            Enviar Mensaje
          </button>
        </form>
      </div>
    </main>
  );
}
