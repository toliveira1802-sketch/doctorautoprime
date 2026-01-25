/**
 * Hook para gerenciar integração com Kommo (stub - tabela não existe ainda)
 */

import { useState } from 'react';

interface KommoConfig {
    id: string;
    subdomain: string;
    client_id: string;
    client_secret: string;
    redirect_uri: string;
    access_token?: string;
    refresh_token?: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export function useKommo() {
    const [config] = useState<KommoConfig | null>(null);
    const [loading] = useState(false);
    const [syncing] = useState(false);

    // Stub implementations - tabela kommo_config não existe
    const loadConfig = async () => {
        console.log('Kommo config table not available');
    };

    const saveConfig = async (_newConfig: Partial<KommoConfig>) => {
        console.log('Kommo config table not available');
        return false;
    };

    const syncOS = async (_osId: string) => {
        console.log('Kommo sync not available');
        return false;
    };

    const getAuthUrl = () => {
        return null;
    };

    const handleCallback = async (_code: string) => {
        console.log('Kommo callback not available');
        return false;
    };

    return {
        config,
        loading,
        syncing,
        loadConfig,
        saveConfig,
        syncOS,
        getAuthUrl,
        handleCallback,
        isConfigured: false,
        isConnected: false,
    };
}
