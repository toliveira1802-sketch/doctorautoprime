/**
 * Hook para gerenciar integração com Kommo
 */

import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import KommoClient from '@/integrations/kommo/client';
import { KommoSyncService } from '@/integrations/kommo/sync';

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

interface KommoSyncLog {
    id: string;
    os_id: string;
    action: string;
    status: 'success' | 'error';
    error_message?: string;
    created_at: string;
}

export function useKommo() {
    const [config, setConfig] = useState<KommoConfig | null>(null);
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);

    // Carrega configuração
    useEffect(() => {
        loadConfig();
    }, []);

    const loadConfig = async () => {
        try {
            // @ts-ignore - Tabela kommo_config será adicionada após aplicar migration
            const { data, error } = await supabase
                .from('kommo_config')
                .select('*')
                .eq('is_active', true)
                .single();

            if (error && error.code !== 'PGRST116') {
                console.error('Erro ao carregar config Kommo:', error);
            }

            setConfig(data);
        } catch (error) {
            console.error('Erro ao carregar config Kommo:', error);
        } finally {
            setLoading(false);
        }
    };

    // Salva configuração inicial (sem tokens)
    const saveConfig = async (configData: {
        subdomain: string;
        client_id: string;
        client_secret: string;
        redirect_uri: string;
    }) => {
        try {
            // Desativa configs antigas
            // @ts-ignore - Tabela kommo_config
            await supabase
                .from('kommo_config')
                .update({ is_active: false })
                .eq('is_active', true);

            // Cria nova config
            // @ts-ignore - Tabela kommo_config
            const { data, error } = await supabase
                .from('kommo_config')
                .insert({
                    ...configData,
                    is_active: true,
                })
                .select()
                .single();

            if (error) throw error;

            setConfig(data);
            return data;
        } catch (error) {
            console.error('Erro ao salvar config:', error);
            throw error;
        }
    };

    // Salva tokens OAuth
    const saveTokens = async (accessToken: string, refreshToken: string) => {
        if (!config) throw new Error('Config não encontrada');

        try {
            // @ts-ignore - Tabela kommo_config
            const { data, error } = await supabase
                .from('kommo_config')
                .update({
                    access_token: accessToken,
                    refresh_token: refreshToken,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', config.id)
                .select()
                .single();

            if (error) throw error;

            setConfig(data);
            return data;
        } catch (error) {
            console.error('Erro ao salvar tokens:', error);
            throw error;
        }
    };

    // Cria cliente Kommo
    const createClient = (): KommoClient | null => {
        if (!config?.access_token) return null;

        return new KommoClient({
            subdomain: config.subdomain,
            clientId: config.client_id,
            clientSecret: config.client_secret,
            redirectUri: config.redirect_uri,
            accessToken: config.access_token,
            refreshToken: config.refresh_token,
        });
    };

    // Sincroniza OS específica
    const syncOS = async (osId: string) => {
        const client = createClient();
        if (!client) throw new Error('Kommo não configurado');

        setSyncing(true);
        try {
            const sync = new KommoSyncService(client);
            const leadId = await sync.syncOSToLead(osId);

            // Log de sucesso
            // @ts-ignore - Tabela kommo_sync_log
            await supabase.from('kommo_sync_log').insert({
                os_id: osId,
                action: 'sync_os_to_lead',
                status: 'success',
                response_data: { lead_id: leadId },
            });

            return leadId;
        } catch (error: any) {
            // Log de erro
            // @ts-ignore - Tabela kommo_sync_log
            await supabase.from('kommo_sync_log').insert({
                os_id: osId,
                action: 'sync_os_to_lead',
                status: 'error',
                error_message: error.message,
            });

            throw error;
        } finally {
            setSyncing(false);
        }
    };

    // Busca logs de sincronização
    const getSyncLogs = async (osId?: string): Promise<KommoSyncLog[]> => {
        try {
            // @ts-ignore - Tabela kommo_sync_log
            let query = supabase
                .from('kommo_sync_log')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(50);

            if (osId) {
                query = query.eq('os_id', osId);
            }

            const { data, error } = await query;

            if (error) throw error;

            return data || [];
        } catch (error) {
            console.error('Erro ao buscar logs:', error);
            return [];
        }
    };

    // Verifica se está conectado
    const isConnected = !!config?.access_token;

    // URL de autenticação OAuth
    const getAuthUrl = () => {
        if (!config) return null;

        const params = new URLSearchParams({
            client_id: config.client_id,
            redirect_uri: config.redirect_uri,
            response_type: 'code',
            state: Math.random().toString(36).substring(7),
        });

        return `https://${config.subdomain}.kommo.com/oauth?${params}`;
    };

    // Desconectar
    const disconnect = async () => {
        if (!config) return;

        try {
            // @ts-ignore - Tabela kommo_config
            await supabase
                .from('kommo_config')
                .update({
                    access_token: null,
                    refresh_token: null,
                    is_active: false,
                })
                .eq('id', config.id);

            setConfig(null);
        } catch (error) {
            console.error('Erro ao desconectar:', error);
            throw error;
        }
    };

    return {
        config,
        loading,
        syncing,
        isConnected,
        saveConfig,
        saveTokens,
        syncOS,
        getSyncLogs,
        getAuthUrl,
        disconnect,
        createClient,
    };
}
