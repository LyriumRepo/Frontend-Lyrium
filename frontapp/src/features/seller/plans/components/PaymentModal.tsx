'use client';
import { motion } from 'framer-motion';
import Modal from '@/features/seller/plans/shared/Modal';
import { formatPrice, getPlanIconSvg } from '@/features/seller/plans/lib/helpers';
import { durationPresets, getDiscountForMonths } from '@/features/seller/plans/lib/plans';
import type { PlansMap } from '@/features/seller/plans/types';

interface Props {
  open: boolean; plan: string | null; plansData: PlansMap;
  selectedPresetId: string; customMonths: number; trialUsedPlans: string[];
  onClose: () => void; onSelectPreset: (id: string) => void;
  onChangeCustomQty: (delta: number) => void; onProcess: () => void;
}

export default function PaymentModal({ open, plan, plansData, selectedPresetId, customMonths, trialUsedPlans, onClose, onSelectPreset, onChangeCustomQty, onProcess }: Props) {
  if (!plan) return null;
  const data = plansData[plan]; if (!data) return null;

  const isTrial = selectedPresetId === 'trial';
  const trialBlocked = trialUsedPlans.includes(plan);
  const effectivePreset = (trialBlocked && selectedPresetId === 'trial') ? '1m' : selectedPresetId;

  const totalMonths = (() => {
    if (effectivePreset === 'trial') return 1;
    if (effectivePreset === 'custom') return customMonths;
    return durationPresets.find(p => p.id === effectivePreset)?.months ?? 1;
  })();

  const durationLabel = (() => {
    if (effectivePreset === 'trial') return 'Prueba gratuita (1 mes)';
    const m = totalMonths;
    if (m >= 12 && m % 12 === 0) { const y = m / 12; return y === 1 ? '1 año (12 meses)' : `${y} años (${m} meses)`; }
    return m === 1 ? '1 mes' : `${m} meses`;
  })();

  const discount = isTrial ? 0 : getDiscountForMonths(totalMonths);
  const baseTotal = isTrial ? 0 : data.price * totalMonths;
  const discountAmt = baseTotal * (discount / 100);
  const finalTotal = baseTotal - discountAmt;
  const cur = data.currency ?? 'S/';

  const iconHtml = getPlanIconSvg(plan, 28, plansData).replace('stroke="currentColor"', 'stroke="white"');

  return (
    <Modal open={open} onClose={onClose} className="max-w-md">
      <div className="text-center mb-6">
        <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg" style={{ background: data.cssColor }}
          dangerouslySetInnerHTML={{ __html: iconHtml }} />
        <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Suscribirse a {data.name}</h2>
        {data.description && <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{data.description}</p>}
      </div>

      <div className="mb-5">
        <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Selecciona la duración</h4>
        <div className="grid grid-cols-4 gap-2">
          {durationPresets.map(p => {
            const blocked = p.isTrial && trialBlocked;
            const isActive = p.id === effectivePreset && !blocked;
            const discount = p.isTrial ? 0 : getDiscountForMonths(p.months ?? 1);
            return (
              <button key={p.id}
                className={`relative px-2 py-3 rounded-xl text-xs font-semibold border-2 transition-all ${
                  isActive
                    ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300 shadow-sm'
                    : blocked
                      ? 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-400 dark:text-gray-500 cursor-not-allowed opacity-50'
                      : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:border-gray-400 dark:hover:border-gray-500'
                }`}
                disabled={blocked}
                onClick={() => !blocked && onSelectPreset(p.id)}
                title={blocked ? 'Ya utilizaste la prueba gratuita' : ''}
              >
                <span className="block">{p.label}</span>
                {p.isTrial && !blocked && <span className="block mt-0.5 text-[10px] font-bold text-teal-600 dark:text-teal-400">Gratis</span>}
                {p.isTrial && blocked && <span className="block mt-0.5 text-[10px] font-bold text-gray-400">Usado</span>}
                {!p.isTrial && p.id !== 'custom' && discount > 0 && <span className="block mt-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">-{discount}%</span>}
                {p.id === 'custom' && <span className="block mt-0.5 text-[10px] font-bold text-teal-600 dark:text-teal-400">Meses</span>}
              </button>
            );
          })}
        </div>

        {effectivePreset === 'trial' && (
          <div className="mt-2 px-3 py-2 rounded-lg bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-700/30 text-teal-700 dark:text-teal-300 text-xs font-medium text-center">
            Prueba gratuita por 1 mes sin compromiso
          </div>
        )}
        {effectivePreset !== 'trial' && discount > 0 && (
          <div className="mt-2 px-3 py-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700/30 text-emerald-700 dark:text-emerald-300 text-xs font-medium text-center">
            {discount}% de descuento por {durationLabel}
          </div>
        )}
      </div>

      {effectivePreset === 'custom' && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-5 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700/30"
        >
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 text-center mb-3">Elige la cantidad de meses</p>
          <div className="flex items-center justify-center gap-3">
            <motion.button whileTap={{ scale: 0.9 }}
              className="w-10 h-10 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 font-bold text-lg flex items-center justify-center hover:border-gray-400 dark:hover:border-gray-500 transition-all"
              onClick={() => onChangeCustomQty(-1)}
            >
              −
            </motion.button>
            <input type="number" className="w-16 text-center py-2.5 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-extrabold text-lg outline-none focus:border-teal-500 transition-all [-moz-appearance:textfield]" value={customMonths} min={4} max={48} readOnly />
            <motion.button whileTap={{ scale: 0.9 }}
              className="w-10 h-10 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 font-bold text-lg flex items-center justify-center hover:border-gray-400 dark:hover:border-gray-500 transition-all"
              onClick={() => onChangeCustomQty(1)}
            >
              +
            </motion.button>
          </div>
          <div className="flex justify-between mt-2 text-[10px] text-gray-400 dark:text-gray-500 font-medium px-1">
            <span>4 meses</span>
            <span>48 meses</span>
          </div>
        </motion.div>
      )}

      <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700/30 mb-5 space-y-2">
        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>Plan</span>
          <span className="font-semibold text-gray-700 dark:text-gray-200">{data.name}</span>
        </div>
        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>Duración</span>
          <span className="font-semibold text-gray-700 dark:text-gray-200">{durationLabel}</span>
        </div>
        <div className="h-px bg-gray-200 dark:bg-gray-700" />
        {baseTotal > 0 && discount > 0 && (
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>Precio original</span>
            <span className="line-through">{formatPrice(baseTotal, cur)}</span>
          </div>
        )}
        {discountAmt > 0 && (
          <div className="flex justify-between text-xs">
            <span className="text-gray-500 dark:text-gray-400">Descuento</span>
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">-{formatPrice(discountAmt, cur)} ({discount}%)</span>
          </div>
        )}
        <div className="h-px bg-gray-200 dark:bg-gray-700" />
        <div className="flex justify-between text-sm">
          <span className="font-bold text-gray-800 dark:text-gray-100">Total a pagar</span>
          <span className="font-extrabold text-gray-900 dark:text-gray-100">{formatPrice(finalTotal, cur)}</span>
        </div>
        {!isTrial && totalMonths > 1 && (
          <div className="flex justify-between text-xs">
            <span className="text-gray-500 dark:text-gray-400">Equivale a</span>
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">{formatPrice(finalTotal / totalMonths, cur)}/mes</span>
          </div>
        )}
      </div>

      {effectivePreset === 'trial' ? (
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-teal-500 via-sky-500 to-emerald-500 text-white font-bold text-sm shadow-lg shadow-teal-500/20 transition-all"
          onClick={onProcess}
        >
          Activar prueba gratuita
        </motion.button>
      ) : (
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
          className="w-full py-3 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold text-sm shadow-lg shadow-black/10 transition-all hover:bg-gray-800 dark:hover:bg-gray-100"
          onClick={onProcess}
        >
          Continuar al pago con Izipay
        </motion.button>
      )}
    </Modal>
  );
}
