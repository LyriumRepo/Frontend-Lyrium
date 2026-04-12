'use client';

import { useState, useCallback, useEffect } from 'react';
import type { 
    Plan, 
    PlanRequest, 
    SubscriptionInfo, 
    ButtonColors, 
    ExpirationWarning,
    DurationPreset,
    PaymentSummary
} from '../types';
import { mockPlans, mockButtonColors, mockSubscription, mockExpirationWarning } from '../mock';

const DURATION_PRESETS: DurationPreset[] = [
    { id: 'trial', label: 'Prueba', months: 1, isTrial: true },
    { id: '1m', label: '1 mes', months: 1, isTrial: false },
    { id: '6m', label: '6 meses', months: 6, isTrial: false },
    { id: '12m', label: '12 meses', months: 12, isTrial: false },
    { id: '24m', label: '24 meses', months: 24, isTrial: false },
    { id: '48m', label: '48 meses', months: 48, isTrial: false },
    { id: 'custom', label: 'Personalizar', months: 0, isTrial: false }
];

function getDiscountForMonths(totalMonths: number): number {
    if (totalMonths <= 1) return 0;
    if (totalMonths <= 3) return 5;
    if (totalMonths <= 6) return 12;
    if (totalMonths <= 12) return 22;
    if (totalMonths <= 18) return 30;
    if (totalMonths <= 24) return 38;
    if (totalMonths <= 36) return 48;
    return Math.min(48 + (totalMonths - 36) * 1, 60);
}

export function useSellerPlans() {
    const [userId] = useState<string>('mock-user-123');
    const [userName] = useState<string>('Vendedor Demo');
    const [currentPlan, setCurrentPlan] = useState<string>('basic');
    const [claimedPlans, setClaimedPlans] = useState<string[]>([]);
    const [trialUsedPlans, setTrialUsedPlans] = useState<string[]>([]);
    const [subscriptionInfo, setSubscriptionInfo] = useState<SubscriptionInfo | null>(mockSubscription);
    const [expirationWarning, setExpirationWarning] = useState<ExpirationWarning | null>(mockExpirationWarning);
    const [plansData, setPlansData] = useState<Record<string, Plan>>(mockPlans);
    const [planOrder] = useState<string[]>(['basic', 'standard', 'premium']);
    const [buttonColors] = useState<ButtonColors | null>(mockButtonColors);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setPlansData(mockPlans);
    }, []);

    const isPlanClaimed = useCallback((planKey: string) => {
        return claimedPlans.includes(planKey);
    }, [claimedPlans]);

    const isTrialUsed = useCallback((planKey: string) => {
        return trialUsedPlans.includes(planKey);
    }, [trialUsedPlans]);

    const getPaymentTotalMonths = useCallback((presetId: string, customMonths: number): number => {
        if (presetId === 'trial') return 1;
        if (presetId === 'custom') return customMonths;
        const preset = DURATION_PRESETS.find(p => p.id === presetId);
        return preset?.months || 1;
    }, []);

    const getPaymentDurationLabel = useCallback((presetId: string, customMonths: number): string => {
        if (presetId === 'trial') return 'Prueba gratuita (1 mes)';
        const m = getPaymentTotalMonths(presetId, customMonths);
        if (m >= 12 && m % 12 === 0) {
            const y = m / 12;
            return y === 1 ? '1 año (12 meses)' : `${y} años (${m} meses)`;
        }
        return m === 1 ? '1 mes' : `${m} meses`;
    }, [getPaymentTotalMonths]);

    const calculatePaymentSummary = useCallback((
        planId: string, 
        presetId: string, 
        customMonths: number
    ): PaymentSummary => {
        const plan = plansData[planId];
        if (!plan) return { planName: '', duration: '', originalPrice: 0, discount: 0, total: 0, perMonth: 0, currency: 'S/', months: 1 };

        const months = getPaymentTotalMonths(presetId, customMonths);
        const isTrial = presetId === 'trial';
        
        const originalPrice = plan.price * months;
        const discountPercent = isTrial ? 100 : getDiscountForMonths(months);
        const discount = originalPrice * (discountPercent / 100);
        const total = isTrial ? 0 : originalPrice - discount;
        const perMonth = months > 0 ? total / months : 0;

        return {
            planName: plan.name,
            duration: getPaymentDurationLabel(presetId, customMonths),
            originalPrice,
            discount,
            total,
            perMonth,
            currency: plan.currency,
            months,
        };
    }, [plansData, getPaymentTotalMonths, getPaymentDurationLabel]);

    const createRequest = async (request: Omit<PlanRequest, 'usuario_id' | 'userName'>) => {
        await new Promise(resolve => setTimeout(resolve, 500));
        setCurrentPlan(request.toPlan);
        
        const plan = plansData[request.toPlan];
        if (plan) {
            const newSubscription: SubscriptionInfo = {
                plan: request.toPlan,
                months: request.months,
                planId: request.toPlan,
                startDate: new Date().toISOString(),
                expiryDate: new Date(Date.now() + request.months * 30 * 24 * 60 * 60 * 1000).toISOString(),
                status: 'active'
            };
            setSubscriptionInfo(newSubscription);
        }
        
        if (request.type === 'free_claim') {
            setClaimedPlans(prev => [...prev, request.toPlan]);
        }
        
        return { success: true, message: 'Solicitud creada correctamente' };
    };

    const createPayment = async (data: { planId: string; durationId: string; months: number }) => {
        await new Promise(resolve => setTimeout(resolve, 800));
        
        setCurrentPlan(data.planId);
        
        const newSubscription: SubscriptionInfo = {
            plan: data.planId,
            months: data.months,
            planId: data.planId,
            startDate: new Date().toISOString(),
            expiryDate: new Date(Date.now() + data.months * 30 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'active'
        };
        setSubscriptionInfo(newSubscription);
        
        return { success: true, message: 'Pago procesado correctamente', formToken: 'mock-token' };
    };

    const executeDowngrade = async (toPlan: string) => {
        await new Promise(resolve => setTimeout(resolve, 500));
        setCurrentPlan(toPlan);
        
        const plan = plansData[toPlan];
        if (plan) {
            const newSubscription: SubscriptionInfo = {
                plan: toPlan,
                months: 1,
                planId: toPlan,
                startDate: new Date().toISOString(),
                expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                status: 'active'
            };
            setSubscriptionInfo(newSubscription);
        }
        
        return { success: true };
    };

    return {
        userId,
        userName,
        currentPlan,
        claimedPlans,
        trialUsedPlans,
        subscriptionInfo,
        expirationWarning,
        plansData,
        planOrder,
        buttonColors,
        isLoading,
        error,
        isLoggedIn: true,
        isVendedor: true,
        isPlanClaimed,
        isTrialUsed,
        getPaymentTotalMonths,
        getPaymentDurationLabel,
        calculatePaymentSummary,
        durationPresets: DURATION_PRESETS,
        createRequest,
        createPayment,
        executeDowngrade,
        isPending: false
    };
}
