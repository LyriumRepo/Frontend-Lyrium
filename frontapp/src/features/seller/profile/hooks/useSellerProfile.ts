'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/shared/lib/context/AuthContext';
import { useToast } from '@/shared/lib/context/ToastContext';
import { validateRUC, validateDNI, validateBCPAccount, validateCCI } from '@/shared/lib/utils/validation';
import { USE_MOCKS } from '@/shared/lib/config/flags';
import { users as userRepo } from '@/shared/lib/api';
import { sellerApi, type StoreData } from '@/shared/lib/api/sellerRepository';
import type { VendorProfileData } from '../types';

export function useSellerProfile() {
    const { user } = useAuth();
    const { showToast } = useToast();
    const queryClient = useQueryClient();

    const { data, isLoading: loading, error } = useQuery({
        queryKey: ['seller', 'profile', user?.id],
        queryFn: async () => {
            console.log('[useSellerProfile] User from auth:', user);
            
            // Get profile request status
            let profileRequest = null;
            try {
                profileRequest = await sellerApi.getProfileRequest();
                console.log('[useSellerProfile] Profile request:', profileRequest);
            } catch (e) {
                console.log('[useSellerProfile] No profile request found');
            }
            
            if (!user?.id) throw new Error("No authenticated user");

            // Cargar datos completos del usuario desde API
            let userData = user;
            try {
                const fullUser = await userRepo.getCurrentUser();
                console.log('[useSellerProfile] Full user API response:', JSON.stringify(fullUser, null, 2));
                if (fullUser) {
                    userData = fullUser;
                    console.log('[useSellerProfile] admin_nombre from API:', userData.admin_nombre);
                    console.log('[useSellerProfile] admin_dni from API:', userData.admin_dni);
                    console.log('[useSellerProfile] phone from API:', userData.phone);
                    console.log('[useSellerProfile] phone_2 from API:', userData.phone_2);
                    console.log('[useSellerProfile] location from API:', userData.location);
                }
            } catch (e) {
                console.log('[useSellerProfile] Could not load full user data, using session user');
            }

            // Cargar tienda desde Laravel API
            console.log('[useSellerProfile] Fetching store from Laravel API...');
            let store: StoreData | null = null;
            try {
                store = await sellerApi.getStore();
                console.log('[useSellerProfile] Store API response:', JSON.stringify(store, null, 2));
            } catch (e) {
                console.log('[useSellerProfile] Store API error:', e);
            }
            console.log('[useSellerProfile] Store result:', store);
            console.log('[useSellerProfile] Store nombre_comercial:', store?.nombre_comercial);
            console.log('[useSellerProfile] Store tax_condition:', store?.tax_condition);
            console.log('[useSellerProfile] Store phone:', store?.phone);
            
            // Si no hay tienda, crear objeto vacío pero usar datos del usuario
            if (!store) {
                console.warn('[useSellerProfile] No store found, creating default profile from user data');
                
                // Si el usuario tiene datos de perfil, usarlos
                const hasProfileData = userData.admin_nombre || userData.admin_dni || userData.phone_2 || userData.location?.departamento;
                
                if (hasProfileData) {
                    return {
                        razon_social: userData.display_name?.toUpperCase() || userData.username?.toUpperCase() || "MI EMPRESA S.A.C.",
                        ruc: "20000000001",
                        nombre_comercial: userData.display_name || userData.username || "Mi Tienda",
                        rep_legal_nombre: userData.display_name || userData.username || "Admin",
                        rep_legal_dni: userData.admin_dni || "40000001",
                        rep_legal_foto: undefined,
                        experience_years: 2,
                        location: { 
                            departamento: userData.location?.departamento || "Lima", 
                            provincia: userData.location?.provincia || "Lima", 
                            distrito: userData.location?.distrito || "Miraflores"
                        },
                        tax_condition: "RUC",
                        admin_nombre: userData.admin_nombre || userData.display_name || userData.username || "Admin",
                        admin_dni: userData.admin_dni || "40000001",
                        admin_email: userData.email || "",
                        phone_1: userData.phone || "",
                        phone_2: userData.phone_2 || "",
                        direccion_fiscal: "Av. Principal 123, Lima",
                        cuenta_bcp: "19100000000000",
                        cci: "00219100000000000000",
                        bank_secondary: { bank: "BCP" },
                        rrss: { instagram: "", facebook: "", tiktok: "" }
                    } as VendorProfileData;
                }
                
                // Si no hay datos de perfil, retornar datos vacíos para que el usuario llene
                return {
                    razon_social: "",
                    ruc: "",
                    nombre_comercial: "",
                    rep_legal_nombre: "",
                    rep_legal_dni: "",
                    rep_legal_foto: undefined,
                    experience_years: 0,
                    location: { departamento: "", provincia: "", distrito: "" },
                    tax_condition: "",
                    admin_nombre: "",
                    admin_dni: "",
                    admin_email: userData.email || "",
                    phone_1: userData.phone || "",
                    phone_2: "",
                    direccion_fiscal: "",
                    cuenta_bcp: "",
                    cci: "",
                    bank_secondary: undefined,
                    rrss: { instagram: "", facebook: "", tiktok: "" }
                } as VendorProfileData;
            }

            // Helper para formatear bank_secondary
            const formatBankSecondary = (value: any): any => {
                if (typeof value === 'object' && value !== null) {
                    return value;
                }
                if (typeof value === 'string' && value) {
                    try {
                        return JSON.parse(value);
                    } catch {
                        return { bank: value };
                    }
                }
                return undefined;
            };

            return {
                razon_social: store.razon_social || store.store_name?.toUpperCase() || "",
                ruc: store.ruc || "20000000001",
                nombre_comercial: store.nombre_comercial || store.store_name || "",
                rep_legal_nombre: store.rep_legal_nombre || "",
                rep_legal_dni: store.rep_legal_dni || "40000001",
                rep_legal_foto: store.rep_legal_foto,
                experience_years: store.experience_years || 2,
                location: { 
                    departamento: userData.location?.departamento || "Lima", 
                    provincia: userData.location?.provincia || "Lima",
                    distrito: userData.location?.distrito || ""
                },
                tax_condition: store.tax_condition || "RUC",
                admin_nombre: userData.admin_nombre || "",
                admin_dni: userData.admin_dni || "40000001",
                admin_email: userData.email || store.email || "",
                phone_1: userData.phone || store.phone || "",
                phone_2: userData.phone_2 || "",
                direccion_fiscal: store.direccion_fiscal || "Dirección no especificada",
                cuenta_bcp: store.cuenta_bcp || "19100000000000",
                cci: store.cci || "00219100000000000000",
                bank_secondary: formatBankSecondary(store.bank_secondary),
                rrss: { 
                    instagram: store.social?.instagram || "", 
                    facebook: store.social?.facebook || "", 
                    tiktok: store.social?.tiktok || ""
                },
                profileRequest: profileRequest ? {
                    id: profileRequest.id,
                    status: profileRequest.status,
                    admin_notes: profileRequest.admin_notes || undefined,
                    attempts: profileRequest.attempts,
                    created_at: profileRequest.created_at,
                } : null
            } as VendorProfileData;
        },
        enabled: !!user?.id,
        staleTime: 10 * 60 * 1000,
    });

    const updateMutation = useMutation({
        mutationFn: async (updatedData: VendorProfileData) => {
            console.log('[useSellerProfile] Saving profile...', updatedData);
            
            if (!USE_MOCKS) {
                // Datos críticos que requieren aprobación del admin
                const criticalData = {
                    razon_social: updatedData.razon_social,
                    ruc: updatedData.ruc,
                    rep_legal_nombre: updatedData.rep_legal_nombre,
                    rep_legal_dni: updatedData.rep_legal_dni,
                    cuenta_bcp: updatedData.cuenta_bcp,
                    cci: updatedData.cci,
                };

                // Datos no críticos que se guardan directamente
                const nonCriticalData = {
                    admin_nombre: updatedData.admin_nombre,
                    admin_dni: updatedData.admin_dni,
                    phone_2: updatedData.phone_2,
                    location: updatedData.location,
                    nombre_comercial: updatedData.nombre_comercial,
                    direccion_fiscal: updatedData.direccion_fiscal,
                    experience_years: updatedData.experience_years,
                    tax_condition: updatedData.tax_condition,
                    phone: updatedData.phone_1,
                    email: updatedData.admin_email,
                    social: updatedData.rrss,
                };

                // 1. Guardar datos no críticos directamente
                try {
                    console.log('[useSellerProfile] Updating user profile (non-critical)...');
                    await userRepo.updateUser(user!.id, {
                        admin_nombre: nonCriticalData.admin_nombre,
                        admin_dni: nonCriticalData.admin_dni,
                        phone_2: nonCriticalData.phone_2,
                        location: nonCriticalData.location
                    });
                    console.log('[useSellerProfile] User profile updated successfully');
                } catch (err) {
                    console.error('[useSellerProfile] Error updating user profile:', err);
                    throw err;
                }
                
                // Get current store from API
                try {
                    const store = await sellerApi.getStore();
                    console.log('[useSellerProfile] Store found:', store);
                    console.log('[useSellerProfile] Store ID:', store?.id, 'Store user_id:', store?.user_id);
                    
                    if (store?.id) {
                        // Guardar datos no críticos en store
                        console.log('[useSellerProfile] Updating store (non-critical):', nonCriticalData);
                        await sellerApi.updateStore(store.id, nonCriticalData);
                        console.log('[useSellerProfile] Store non-critical data updated successfully');

                        // Comparar con valores actuales para detectar cambios reales
                        console.log('[useSellerProfile] Current store values:', {
                            ruc: store.ruc,
                            razon_social: store.razon_social,
                            rep_legal_nombre: store.rep_legal_nombre,
                            rep_legal_dni: store.rep_legal_dni,
                            cuenta_bcp: store.cuenta_bcp,
                            cci: store.cci,
                        });
                        console.log('[useSellerProfile] New critical data:', criticalData);
                        
                        const hasCriticalChanges = 
                            (criticalData.ruc && criticalData.ruc !== store.ruc) ||
                            (criticalData.razon_social && criticalData.razon_social !== store.razon_social) ||
                            (criticalData.rep_legal_nombre && criticalData.rep_legal_nombre !== store.rep_legal_nombre) ||
                            (criticalData.rep_legal_dni && criticalData.rep_legal_dni !== store.rep_legal_dni) ||
                            (criticalData.cuenta_bcp && criticalData.cuenta_bcp !== store.cuenta_bcp) ||
                            (criticalData.cci && criticalData.cci !== store.cci);
                        
                        console.log('[useSellerProfile] Has critical changes:', hasCriticalChanges);
                        
                        if (hasCriticalChanges) {
                            console.log('[useSellerProfile] Creating profile request for critical data:', criticalData);
                            await sellerApi.createProfileRequest(criticalData);
                            console.log('[useSellerProfile] Profile request created successfully');
                        } else {
                            console.log('[useSellerProfile] No critical changes detected, skipping profile request');
                        }
                    } else {
                        console.warn('[useSellerProfile] No store to update');
                    }
                } catch (err) {
                    console.error('[useSellerProfile] Error updating store:', err);
                    throw err;
                }
            }
            return updatedData;
        },
        onSuccess: (newData) => {
            queryClient.setQueryData(['seller', 'profile', user?.id], newData);
            queryClient.invalidateQueries({ queryKey: ['seller', 'profile', user?.id] });
            showToast("Información de perfil actualizada exitosamente. Los datos críticos están pendientes de aprobación.", "success");
        },
        onError: (error: Error) => {
            const message = error.message;
            if (message.includes('solicitud pendiente') || message.includes('Ya tienes')) {
                showToast("Ya tienes una solicitud de cambio de datos pendiente de revisión. Espera a que el admin la approve o rechace antes de enviar otra.", "warning");
            } else {
                showToast(`Error al guardar: ${message}`, "error");
            }
        }
    });

    const validateForm = (formData: VendorProfileData): boolean => {
        if (!validateRUC(formData.ruc)) { showToast("El RUC debe tener exactamente 11 dígitos numéricos.", "error"); return false; }
        if (!validateDNI(formData.rep_legal_dni)) { showToast("El DNI del Representante Legal debe tener exactamente 8 dígitos numéricos.", "error"); return false; }
        if (formData.admin_dni && !validateDNI(formData.admin_dni)) { showToast("El DNI del Administrador debe tener exactamente 8 dígitos numéricos.", "error"); return false; }
        if (!validateBCPAccount(formData.cuenta_bcp)) { showToast("La Cuenta BCP debe tener exactamente 14 dígitos numéricos.", "error"); return false; }
        if (!validateCCI(formData.cci)) { showToast("El CCI debe tener exactamente 20 dígitos numéricos.", "error"); return false; }
        if (!formData.direccion_fiscal) { showToast("La dirección fiscal es obligatoria.", "error"); return false; }
        return true;
    };

    return {
        data: data || null,
        loading,
        isSaving: updateMutation.isPending,
        error,
        updateProfile: async (formData: VendorProfileData) => {
            if (validateForm(formData)) {
                await updateMutation.mutateAsync(formData);
            }
        },
        validateForm
    };
}
