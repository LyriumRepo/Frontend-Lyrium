'use client';

import { configureEcho } from '@laravel/echo-react';
import { useEffect, useState } from 'react';

export function EchoProvider({ children }: { children: React.ReactNode }) {
    const [isConfigured, setIsConfigured] = useState(false);

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
                    // Ignorar canales con ID 0 o inválido (e.g. ticket.0 antes de seleccionar un ticket)
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
    }, []);

    if (!isConfigured) {
        return null;
    }

    return <>{children}</>;
}
