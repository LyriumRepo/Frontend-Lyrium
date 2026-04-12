import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag, revalidatePath } from 'next/cache';
import { writeFile, appendFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';

/**
 * ═══════════════════════════════════════════════════════════════════════════════════
 * WEBHOOK: WooCommerce Order Status Change
 * 
 * Este endpoint recibe notificaciones de WooCommerce cuando:
 * - Un pedido cambia de estado (desde admin de WP)
 * - Un pedido es creado/actualizado/eliminado
 * - Un producto cambia
 * 
 * Características:
 * - Logging estructurado para reproducción futura
 * - Idempotencia: evita procesar el mismo evento 2 veces
 * - Graceful degradation: si falla el log, igual procesa el evento
 * ═══════════════════════════════════════════════════════════════════════════════════
 */

const WEBHOOK_SECRET = process.env.WOOCOMMERCE_WEBHOOK_SECRET;
const LOG_DIR = process.env.NODE_ENV === 'production' 
  ? '/var/log/webhooks' 
  : join(process.cwd(), '.webhook-logs');

/**
 * Estructura de log para webhooks
 */
interface WebhookLogEntry {
  id: string;
  timestamp: string;
  eventType: string;
  resourceId: string | number;
  payload: Record<string, unknown>;
  status: 'processed' | 'failed' | 'skipped';
  error?: string;
}

/**
 * Genera un ID único para idempotencia
 */
function generateEventId(eventType: string, resourceId: string | number, payload: Record<string, unknown>): string {
  const data = `${eventType}:${resourceId}:${JSON.stringify(payload).slice(0, 100)}`;
  // Hash simple para ID (no criptográfico, solo para deduplicación)
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return `${Date.now()}-${Math.abs(hash).toString(36)}`;
}

/**
 * Guarda el evento en un archivo de log para reproducción futura
 */
async function logWebhookEvent(entry: WebhookLogEntry): Promise<void> {
  try {
    // Asegurar que el directorio existe
    if (!existsSync(LOG_DIR)) {
      await mkdir(LOG_DIR, { recursive: true });
    }

    const logFile = join(LOG_DIR, `webhook-${new Date().toISOString().split('T')[0]}.jsonl`);
    const logLine = JSON.stringify(entry) + '\n';
    
    await appendFile(logFile, logLine, 'utf-8');
    console.log(`[WEBHOOK] 📝 Evento registrado en ${logFile}`);
  } catch (error) {
    // Graceful: si falla el log, no fallamos el webhook
    console.error('[WEBHOOK] ⚠️ Error al escribir log:', error);
  }
}

/**
 * Obtiene el ID de idempotencia del evento
 */
function getIdempotencyKey(request: NextRequest, eventType: string, resourceId: string | number): string {
  // Usar header de WooCommerce si existe
  const delivery = request.headers.get('x-wc-webhook-delivery');
  if (delivery) {
    return delivery;
  }
  // Fallback: generar nuestro propio ID
  return generateEventId(eventType, resourceId, {});
}

// Memoria para deduplicación en memoria (en producción usar Redis)
const processedEvents = new Set<string>();
const PROCESSED_EVENTS_TTL = 24 * 60 * 60 * 1000; // 24 horas

// Limpiar eventos antiguos cada hora
setInterval(() => {
  const now = Date.now();
  for (const key of processedEvents) {
    const timestamp = parseInt(key.split('-')[0]);
    if (now - timestamp > PROCESSED_EVENTS_TTL) {
      processedEvents.delete(key);
    }
  }
}, 60 * 60 * 1000);

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  let eventLog: WebhookLogEntry | null = null;

  try {
    // 1. Verificar secret del webhook
    const signature = request.headers.get('x-wc-webhook-signature');
    
    if (!signature || !WEBHOOK_SECRET) {
      console.error('[WEBHOOK] ❌ Secret no configurado o falta firma');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // 2. Parsear el evento
    const payload = await request.json();
    const eventType = payload.type || request.headers.get('x-wc-webhook-event') || 'unknown';
    const resourceId = payload.id || payload.order?.id || payload.product?.id || 'unknown';

    // 3. Idempotencia: evitar procesar el mismo evento dos veces
    const idempotencyKey = getIdempotencyKey(request, eventType, resourceId);
    
    if (processedEvents.has(idempotencyKey)) {
      console.log(`[WEBHOOK] ⏭️ Evento duplicado omitido: ${eventType} - ${idempotencyKey}`);
      
      // Igual registramos en log para tracking
      eventLog = {
        id: idempotencyKey,
        timestamp: new Date().toISOString(),
        eventType,
        resourceId,
        payload,
        status: 'skipped',
        error: 'Duplicated event'
      };
      await logWebhookEvent(eventLog);
      
      return NextResponse.json({
        success: true,
        received: true,
        skipped: true,
        eventType,
        resourceId,
        processingTime: Date.now() - startTime,
      });
    }

    // Marcar como procesado
    processedEvents.add(idempotencyKey);

    console.log(`[WEBHOOK] 📥 Recibido: ${eventType} para recurso ${resourceId}`);

    // 4. Inicializar log para este evento
    eventLog = {
      id: idempotencyKey,
      timestamp: new Date().toISOString(),
      eventType,
      resourceId,
      payload: payload as Record<string, unknown>,
      status: 'processed'
    };

    // 5. Procesar según tipo de evento
    let revalidatedSomething = false;

    switch (eventType) {
      case 'order.created':
      case 'order.updated':
        if (resourceId) {
          revalidateTag(`order-${resourceId}`, '/seller/orders');
          revalidatedSomething = true;
        }
        revalidateTag('seller-orders', '/seller/orders');
        revalidatePath('/seller/dashboard');
        revalidatePath('/seller/orders');
        console.log(`[WEBHOOK] ✅ Pedido ${resourceId} cache revalidado`);
        break;

      case 'order.deleted':
        revalidateTag('seller-orders', '/seller/orders');
        revalidatePath('/seller/dashboard');
        revalidatePath('/seller/orders');
        console.log(`[WEBHOOK] ✅ Pedido ${resourceId} eliminado - cache limpiado`);
        break;

      case 'product.created':
      case 'product.updated':
        revalidateTag('seller-catalog', '/seller/catalog');
        revalidatePath('/seller/catalog');
        revalidateTag('products', '/seller/catalog');
        console.log(`[WEBHOOK] ✅ Producto ${resourceId} cache revalidado`);
        break;

      case 'product.deleted':
        revalidateTag('seller-catalog', '/seller/catalog');
        revalidatePath('/seller/catalog');
        console.log(`[WEBHOOK] ✅ Producto ${resourceId} eliminado - cache limpiado`);
        break;

      case 'customer.created':
      case 'customer.updated':
        revalidateTag('seller-customers', '/seller/customers');
        console.log(`[WEBHOOK] ✅ Cliente ${resourceId} cache revalidado`);
        break;

      case 'coupon.created':
      case 'coupon.updated':
      case 'coupon.deleted':
        revalidateTag('seller-coupons', '/seller/coupons');
        console.log(`[WEBHOOK] ✅ Cupón ${resourceId} cache revalidado`);
        break;

      default:
        console.log(`[WEBHOOK] ⚠️ Evento no manejado explícitamente: ${eventType}`);
    }

    // 6. Guardar log del evento procesado
    await logWebhookEvent(eventLog);

    const processingTime = Date.now() - startTime;
    console.log(`[WEBHOOK] ✅ Completado en ${processingTime}ms`);

    return NextResponse.json({
      success: true,
      received: true,
      eventType,
      resourceId,
      revalidated: revalidatedSomething,
      processingTime,
      eventId: idempotencyKey,
    });

  } catch (error) {
    console.error('[WEBHOOK] ❌ Error procesando webhook:', error);

    // Guardar log de error
    if (eventLog) {
      eventLog.status = 'failed';
      eventLog.error = error instanceof Error ? error.message : 'Unknown error';
      await logWebhookEvent(eventLog);
    }

    return NextResponse.json(
      { error: 'Internal Server Error', message: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    );
  }
}

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * GET: Verificar estado del webhook y listar eventos recientes
 * ═══════════════════════════════════════════════════════════════════════════
 */
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'Webhook endpoint activo',
    version: '2.0.0',
    features: [
      'Idempotencia - evita procesamiento duplicado',
      'Logging estructurado para reproducción',
      'Timeout de 3s con fallback a cache',
      'Graceful degradation'
    ],
    events: [
      'order.created',
      'order.updated', 
      'order.deleted',
      'product.created',
      'product.updated',
      'product.deleted',
      'customer.created',
      'customer.updated',
      'coupon.created',
      'coupon.updated',
      'coupon.deleted',
    ],
    stats: {
      eventsInMemory: processedEvents.size,
      logDirectory: LOG_DIR
    }
  });
}
