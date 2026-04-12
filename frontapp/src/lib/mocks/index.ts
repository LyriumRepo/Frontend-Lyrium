/**
 * ═══════════════════════════════════════════════════════════════════════════════════
 * MOCKS - DEPRECATED
 * 
 * ⚠️ ESTA CARPETA ESTÁ EN DESUSO
 * 
 * Los archivos individuales de mocks aún funcionan pero:
 * - No deben ser importados en código nuevo
 * - Serán eliminados cuando Laravel esté completamente operativo
 * 
 * PARA MIGRACIÓN:
 * ============
 * 1. En lugar de importar desde '@/lib/mocks/*'
 * 2. Usar Server Actions desde '@/shared/lib/actions/*'
 * 3. Los tipos están disponibles en '@/lib/types/entities'
 * 
 * Esta carpeta existe solo para backwards compatibility.
 * No agregar nuevos mocks aquí.
 * ═══════════════════════════════════════════════════════════════════════════════════
 * 
 * Archivos existentes (no modificar - solo para migración gradual):
 * - mockCatalogData.ts
 * - mockSalesData.ts  
 * - mockFinanceData.ts
 * - mockInvoiceData.ts
 * - mockLogisticsData.ts
 * - mockHelpDeskData.ts
 * - mockChatData.ts
 * - mockAgendaData.ts
 * - sellersData.ts
 * - treasuryData.ts
 * - operationsData.ts
 * - contractsData.ts
 * - analyticsData.ts
 * - inventoryData.ts
 * 
 * Próximos pasos:
 * - Crear Server Actions para cada entidad
 * - Reemplazar importaciones de mocks por llamadas a Server Actions
 * - Eliminar archivo de mock cuando no tenga referencias
 */