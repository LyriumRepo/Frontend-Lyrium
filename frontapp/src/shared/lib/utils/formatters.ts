// ============================================
// UTILIDADES DE FORMATO COMPARTIDAS
// Centraliza funciones de formato para evitar duplicación
// ============================================

/**
 * Formatea un número como moneda
 * @param val - Valor numérico a formatear
 * @param currency - Código de moneda (default: 'PEN')
 * @returns String formateado como "S/ 1,234.56"
 */
export function formatCurrency(val: number, currency: string = 'PEN'): string {
    return new Intl.NumberFormat('es-PE', {
        style: 'currency',
        currency
    }).format(val);
}

/**
 * Formatea una fecha en formato corto
 * @param date - Objeto Date o string de fecha
 * @returns String formateado como "DD/MM/YYYY"
 */
export function formatDate(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('es-PE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

/**
 * Formatea una fecha con hora
 * @param date - Objeto Date o string de fecha
 * @returns String formateado como "DD/MM/YYYY HH:mm"
 */
export function formatDateTime(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleString('es-PE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}
