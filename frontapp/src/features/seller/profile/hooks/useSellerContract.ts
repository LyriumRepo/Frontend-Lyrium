'use client';

import { useState, useEffect, useCallback } from 'react';
import {
    fetchMyContract,
    downloadMyContract,
    uploadSignedContract,
    renewContract,
    type SellerContract,
} from '@/features/seller/profile/api/contractRepository';

export function useSellerContract() {
    const [contract, setContract] = useState<SellerContract | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [downloading, setDownloading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [renewing, setRenewing] = useState(false);

    const load = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await fetchMyContract();
            setContract(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al cargar el convenio');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { load(); }, [load]);

    const download = useCallback(async () => {
        setDownloading(true);
        try {
            await downloadMyContract();
        } finally {
            setDownloading(false);
        }
    }, []);

    const uploadSigned = useCallback(async (file: File) => {
        setUploading(true);
        try {
            await uploadSignedContract(file);
            await load();
        } finally {
            setUploading(false);
        }
    }, [load]);

    const renew = useCallback(async () => {
        if (!contract) return;
        setRenewing(true);
        try {
            await renewContract(contract.dbId);
            await load();
        } finally {
            setRenewing(false);
        }
    }, [contract, load]);

    return { contract, loading, error, downloading, uploading, renewing, download, uploadSigned, renew, reload: load };
}
