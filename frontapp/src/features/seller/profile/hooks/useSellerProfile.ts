'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/shared/lib/context/AuthContext';
import { useToast } from '@/shared/lib/context/ToastContext';
import { validateRUC, validateDNI, validateBCPAccount, validateCCI } from '@/shared/lib/utils/validation';
import { USE_MOCKS } from '@/shared/lib/config/flags';
import { users as userRepo } from '@/shared/lib/api';
import { mapStoreToLocal, sellerApi, type StoreData } from '@/shared/lib/api/sellerRepository';
import type { VendorProfileData } from '../types';

export function useSellerProfile() {
    const { user } = useAuth();
    const { showToast } = useToast();
    const queryClient = useQueryClient();

    const { data, isLoading: loading, error } = useQuery({
        queryKey: ['seller', 'profile', user?.id],
        queryFn: async () => {
            // Estado de la última solicitud de datos críticos (pendiente/rechazada)
            let profileRequest = null;
            try {
                profileRequest = await sellerApi.getProfileRequest();
            } catch (e) {
                // Sin solicitud registrada: se deja profileRequest en null.
            }

            if (!user?.id) throw new Error("No authenticated user");

            // Cargar datos completos del usuario desde API
            let userData = user;
            try {
                const fullUser = await userRepo.getCurrentUser();
                if (fullUser) {
                    userData = fullUser;
                }
            } catch (e) {
                // Sin datos completos disponibles: se sigue con el user de sesión.
            }

            // Cargar tienda desde Laravel API
            let store: StoreData | null = null;
            try {
                const rawStore = await sellerApi.getStore();
                store = mapStoreToLocal(rawStore);
            } catch (e) {
                // Sin tienda accesible: se cae a los datos del usuario abajo.
            }

            // Si no hay tienda, crear objeto vacío pero usar datos del usuario.
            // No se inyectan placeholders en campos críticos (RUC/DNI/BCP/CCI/
            // ubicación): un campo vacío debe verse vacío, no con un valor
            // inventado que el vendedor podría guardar sin darse cuenta.
            if (!store) {
                return {
                    razon_social: userData.display_name?.toUpperCase() || userData.username?.toUpperCase() || "",
                    ruc: "",
                    nombre_comercial: userData.display_name || userData.username || "",
                    rep_legal_nombre: "",
                    rep_legal_dni: "",
                    rep_legal_foto: undefined,
                    experience_years: 0,
                    location: { departamento: "", provincia: "", distrito: "" },
                    tax_condition: "",
                    admin_nombre: userData.admin_nombre || userData.display_name || userData.username || "",
                    admin_dni: userData.admin_dni || "",
                    admin_email: userData.email || "",
                    phone_1: userData.phone || "",
                    phone_2: userData.phone_2 || "",
                    direccion_fiscal: "",
                    cuenta_bcp: "",
                    cci: "",
                    bank_secondary: undefined,
                    rrss: { instagram: "", facebook: "", tiktok: "" },
                    profileRequest: profileRequest ? {
                        id: profileRequest.id,
                        status: profileRequest.status,
                        admin_notes: profileRequest.admin_notes || undefined,
                        attempts: profileRequest.attempts,
                        created_at: profileRequest.created_at,
                    } : null,
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
                ruc: store.ruc || "",
                nombre_comercial: store.nombre_comercial || store.store_name || "",
                rep_legal_nombre: store.rep_legal_nombre || "",
                rep_legal_dni: store.rep_legal_dni || "",
                rep_legal_foto: store.rep_legal_foto,
                experience_years: store.experience_years || 0,
                // Ubicación de la tienda, no del usuario (UserResource no expone
                // "location"; nunca se guardaba ahí — ver D7 en la entrega).
                location: {
                    departamento: store.department || "",
                    provincia: store.province || "",
                    distrito: store.district || ""
                },
                tax_condition: store.tax_condition || "",
                admin_nombre: userData.display_name || "",
                admin_dni: userData.document_number || "",
                admin_email: userData.email || store.email || "",
                phone_1: store.phone || "",
                phone_2: userData.phone_2 || "",
                direccion_fiscal: store.direccion_fiscal || "",
                cuenta_bcp: (store.cuenta_bcp || "").replace(/\D/g, ''),
                cci: (store.cci || "").replace(/\D/g, ''),
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

                // Datos no críticos que se guardan directo en la tienda.
                // admin_email -> corporate_email (StoreUpdateRequest la valida;
                // "email" no existe ahí y hubiera chocado con el email de login).
                // rrss -> claves planas (StoreUpdateRequest no tiene "social").
                // location -> department/province de la tienda (UpdateSellerProfileRequest
                // no acepta "location", por eso nunca se guardaba antes).
                const nonCriticalStoreData: Record<string, unknown> = {
                    nombre_comercial: updatedData.nombre_comercial,
                    rep_legal_foto: updatedData.rep_legal_foto,
                    direccion_fiscal: updatedData.direccion_fiscal,
                    experience_years: updatedData.experience_years,
                    tax_condition: updatedData.tax_condition,
                    phone: updatedData.phone_1,
                    corporate_email: updatedData.admin_email,
                    instagram: updatedData.rrss.instagram,
                    facebook: updatedData.rrss.facebook,
                    tiktok: updatedData.rrss.tiktok,
                    department: updatedData.location.departamento,
                    province: updatedData.location.provincia,
                };

                const store: StoreData | null = await sellerApi.getStore();

                if (!store?.id) {
                    throw new Error('No se encontró la tienda del vendedor.');
                }

                if (updatedData.rep_legal_foto?.startsWith('data:')) {
                    // Subir la foto ANTES de tocar usuario/tienda: si el
                    // upload falla (tamaño/tipo), no queda un guardado a medias.
                    const res = await fetch(updatedData.rep_legal_foto);
                    const blob = await res.blob();
                    const file = new File([blob], `rep-${Date.now()}.jpg`, { type: blob.type });
                    const uploadData = await sellerApi.uploadRepLegalPhoto(store.id, file);
                    nonCriticalStoreData.rep_legal_foto = uploadData.url;
                } else if (updatedData.rep_legal_foto) {
                    // La foto no cambió: no reenviar la URL absoluta que ya
                    // trae getImageUrl() (rompería en otro dominio/entorno).
                    try {
                        nonCriticalStoreData.rep_legal_foto = new URL(updatedData.rep_legal_foto).pathname;
                    } catch {
                        nonCriticalStoreData.rep_legal_foto = updatedData.rep_legal_foto;
                    }
                }

                await sellerApi.updateStore(store.id, nonCriticalStoreData);

                await userRepo.updateUser(user!.id, {
                    name: updatedData.admin_nombre,
                    document_number: updatedData.admin_dni,
                    phone: updatedData.phone_1,
                    phone_2: updatedData.phone_2,
                });

                // Cambio crítico real: el valor nuevo no está vacío Y es
                // distinto del que ya tiene la tienda (evita disparar una
                // solicitud de aprobación con datos sin tocar).
                const hasCriticalChanges =
                    (criticalData.ruc && criticalData.ruc !== store.ruc) ||
                    (criticalData.razon_social && criticalData.razon_social !== store.razon_social) ||
                    (criticalData.rep_legal_nombre && criticalData.rep_legal_nombre !== store.rep_legal_nombre) ||
                    (criticalData.rep_legal_dni && criticalData.rep_legal_dni !== store.rep_legal_dni) ||
                    (criticalData.cuenta_bcp && criticalData.cuenta_bcp !== store.cuenta_bcp) ||
                    (criticalData.cci && criticalData.cci !== store.cci);

                if (hasCriticalChanges) {
                    await sellerApi.createProfileRequest(criticalData);
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
        // BCP/CCI pueden llegar con guiones (display) desde el estado del form;
        // se normalizan a solo dígitos antes de validar el formato.
        const cuentaBcpDigits = formData.cuenta_bcp.replace(/\D/g, '');
        const cciDigits = formData.cci.replace(/\D/g, '');
        if (!validateRUC(formData.ruc)) { showToast("El RUC debe tener exactamente 11 dígitos numéricos.", "error"); return false; }
        if (!validateDNI(formData.rep_legal_dni)) { showToast("El DNI del Representante Legal debe tener exactamente 8 dígitos numéricos.", "error"); return false; }
        if (formData.admin_dni && !validateDNI(formData.admin_dni)) { showToast("El DNI del Administrador debe tener exactamente 8 dígitos numéricos.", "error"); return false; }
        if (!validateBCPAccount(cuentaBcpDigits)) { showToast("La Cuenta BCP debe tener exactamente 14 dígitos numéricos.", "error"); return false; }
        if (!validateCCI(cciDigits)) { showToast("El CCI debe tener exactamente 20 dígitos numéricos.", "error"); return false; }
        if (!formData.direccion_fiscal) { showToast("La dirección fiscal es obligatoria.", "error"); return false; }
        return true;
    };

    return {
        data: data || null,
        loading,
        isSaving: updateMutation.isPending,
        error,
        updateProfile: async (formData: VendorProfileData) => {
            if (!validateForm(formData)) {
                throw new Error('Corrige los campos marcados antes de guardar.');
            }
            await updateMutation.mutateAsync(formData);
        },
        validateForm
    };
}
