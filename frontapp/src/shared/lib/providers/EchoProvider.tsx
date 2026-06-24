'use client';

import { configureEcho } from '@laravel/echo-react';
import { useEffect, useState } from 'react';
import { WifiOff } from 'lucide-react';

type WsStatus = 'connecting' | 'connected' | 'disconnected';

export function EchoProvider({ children }: { children: React.ReactNode }) {
    const [isConfigured, setIsConfigured] = useState(false);
    const [wsStatus, setWsStatus] = useState<WsStatus>('connecting');
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        configureEcho({
            broadcaster: 'reverb',
            key: process.env.NEXT_PUBLIC_REVERB_APP_KEY!,
            wsHost: process.env.NEXT_PUBLIC_REVERB_HOST || 'localhost',
            wsPort: Number(process.env.NEXT_PUBLIC_REVERB_PORT) || 8080,
            wssPort: Number(process.env.NEXT_PUBLIC_REVERB_PORT) || 8080,
            forceTLS: process.env.NEXT_PUBLIC_REVERB_SCHEME === 'https',
            enabledTransports: ['ws', 'wss'],
            channelAuthorization: {
                endpoint: '/api/broadcasting/auth',
                transport: 'ajax' as const,
                customHandler: (
                    { channelName, socketId }: { channelName: string; socketId: string },
                    callback: (error: Error | null, data: object | null) => void,
                ) => {
                    if (/\.(0|null|undefined)$/.test(channelName)) {
                        callback(new Error('Channel skipped: invalid id'), null);
                        return;
                    }

                    fetch('/api/broadcasting/auth', {
                        method: 'POST',
                        credentials: 'same-origin',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ channel_name: channelName, socket_id: socketId }),
                    })
                        .then((r) => {
                            if (!r.ok) throw new Error(`Auth failed: ${r.status}`);
                            return r.json() as Promise<object>;
                        })
                        .then((data) => callback(null, data))
                        .catch((err: Error) => callback(err, null));
                },
            },
        });

        setIsConfigured(true);

        let pusherRef: any = null;

        const update = (state: string) => {
            if (state === 'connected') {
                setWsStatus('connected');
                setVisible(false);
            } else if (state === 'connecting' || state === 'reconnecting') {
                setWsStatus('connecting');
            } else {
                setWsStatus('disconnected');
                setVisible(true);
            }
        };

        const onConnected    = () => update('connected');
        const onDisconnected = () => update('disconnected');
        const onFailed       = () => update('disconnected');
        const onUnavailable  = () => update('disconnected');
        const onConnecting   = () => update('connecting');
        const onReconnecting = () => update('connecting');

        const timer = setTimeout(() => {
            const echo = (window as any).Echo;
            if (!echo?.connector?.pusher) return;

            pusherRef = echo.connector.pusher;
            update(pusherRef.connection.state);
            pusherRef.connection.bind('connected',     onConnected);
            pusherRef.connection.bind('disconnected',  onDisconnected);
            pusherRef.connection.bind('failed',        onFailed);
            pusherRef.connection.bind('unavailable',   onUnavailable);
            pusherRef.connection.bind('connecting',    onConnecting);
            pusherRef.connection.bind('reconnecting',  onReconnecting);
        }, 1500);

        return () => {
            clearTimeout(timer);
            if (pusherRef?.connection) {
                pusherRef.connection.unbind('connected',     onConnected);
                pusherRef.connection.unbind('disconnected',  onDisconnected);
                pusherRef.connection.unbind('failed',        onFailed);
                pusherRef.connection.unbind('unavailable',   onUnavailable);
                pusherRef.connection.unbind('connecting',    onConnecting);
                pusherRef.connection.unbind('reconnecting',  onReconnecting);
            }
        };
    }, []);

    if (!isConfigured) return null;

    return (
        <>
            {children}

            {visible && wsStatus === 'disconnected' && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[99999] animate-fadeIn">
                    <div className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/40 shadow-lg">
                        <WifiOff className="w-4 h-4 text-amber-500 shrink-0" />
                        <p className="text-xs font-bold text-amber-800 dark:text-amber-300 whitespace-nowrap">
                            Notificaciones en tiempo real no disponibles
                        </p>
                        <button
                            onClick={() => setVisible(false)}
                            className="text-amber-400 hover:text-amber-600 dark:hover:text-amber-300 transition-colors ml-1"
                            aria-label="Cerrar"
                        >
                            ✕
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
