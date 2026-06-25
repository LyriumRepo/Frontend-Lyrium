/**
 * Configuración de operadores logísticos.
 *
 * MODO DUAL:
 *   - FUTURO (automático): Cuando la rama de checkout integre selección,
 *     el CarrierResolver detectará el operador desde la orden.
 *   - FALLBACK (manual): Si no hay operador asignado, el selector manual
 *     muestra estos carriers para que el vendedor elija.
 *
 * Para agregar un nuevo operador:
 *   1. Agregar entrada aquí (frontend)
 *   2. Agregar entrada en config/logistics.php (backend)
 *   3. Los campos se renderizan automáticamente
 */
export interface CarrierField {
    key: string;
    label: string;
    type: 'text' | 'password';
    required: boolean;
}

export interface CarrierConfig {
    name: string;
    trackingUrl: string;
    fields: CarrierField[];
}

export const CARRIERS: Record<string, CarrierConfig> = {
    shalom: {
        name: 'Shalom',
        trackingUrl: 'https://rastrea.shalom.pe/',
        fields: [
            { key: 'tracking_code', label: 'Código de seguimiento', type: 'text', required: true },
            { key: 'password', label: 'Clave de seguridad', type: 'password', required: true },
            { key: 'agency', label: 'Agencia destino', type: 'text', required: false },
        ],
    },
    olva: {
        name: 'Olva',
        trackingUrl: 'https://tracking.olvaexpress.pe/',
        fields: [
            { key: 'tracking_code', label: 'Código de seguimiento', type: 'text', required: true },
            { key: 'password', label: 'Clave de seguridad', type: 'password', required: true },
            { key: 'agency', label: 'Agencia destino', type: 'text', required: false },
        ],
    },
    urbano: {
        name: 'Urbano',
        trackingUrl: 'https://www.urbano.com.pe/tracking/',
        fields: [
            { key: 'tracking_code', label: 'Código de seguimiento', type: 'text', required: true },
            { key: 'agency', label: 'Punto Urbano', type: 'text', required: false },
        ],
    },
    sharf: {
        name: 'Sharf',
        trackingUrl: 'https://envia.holasharf.com/tracking',
        fields: [
            { key: 'tracking_code', label: 'Código de seguimiento', type: 'text', required: true },
            { key: 'agency', label: 'Punto Sharf', type: 'text', required: false },
        ],
    },
};

export const CARRIER_CODES = Object.keys(CARRIERS);
