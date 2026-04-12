'use server';

import { NextResponse } from 'next/server';
import { wcServerClient, dokanServerClient } from '@/shared/lib/api/server-client';

export async function GET() {
  const results = {
    woocommerce: { status: 'disconnected', latency: null as number | null },
    dokan: { status: 'disconnected', latency: null as number | null },
    wordpress: { status: 'disconnected', latency: null as number | null },
  };

  const start = Date.now();
  const wpResult = await wcServerClient.get('/system_status', { timeout: 3000, skipAuth: false });
  results.woocommerce.latency = Date.now() - start;
  results.woocommerce.status = wpResult.success ? 'connected' : 'error';

  return NextResponse.json({
    healthy: results.woocommerce.status === 'connected',
    services: results,
    checkedAt: new Date().toISOString(),
  });
}
