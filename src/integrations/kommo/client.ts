/**
 * Kommo (ex-amoCRM) API Client
 * Documentação: https://www.amocrm.com/developers/content/crm_platform/
 */

export interface KommoConfig {
    subdomain: string; // seu-dominio.kommo.com
    clientId: string;
    clientSecret: string;
    redirectUri: string;
    accessToken?: string;
    refreshToken?: string;
}

export interface KommoLead {
    id?: number;
    name: string;
    price?: number;
    status_id?: number;
    pipeline_id?: number;
    responsible_user_id?: number;
    custom_fields_values?: Array<{
        field_id: number;
        values: Array<{
            value: string | number;
        }>;
    }>;
    _embedded?: {
        tags?: Array<{
            id: number;
            name: string;
        }>;
        contacts?: Array<{
            id: number;
        }>;
    };
}

export interface KommoContact {
    id?: number;
    name: string;
    first_name?: string;
    last_name?: string;
    responsible_user_id?: number;
    custom_fields_values?: Array<{
        field_id: number;
        values: Array<{
            value: string;
            enum_id?: number;
        }>;
    }>;
}

export interface KommoNote {
    entity_id: number;
    entity_type: 'leads' | 'contacts' | 'companies';
    note_type: 'common' | 'call_in' | 'call_out';
    params: {
        text: string;
    };
}

class KommoClient {
    private config: KommoConfig;
    private baseUrl: string;

    constructor(config: KommoConfig) {
        this.config = config;
        this.baseUrl = `https://${config.subdomain}.kommo.com/api/v4`;
    }

    /**
     * Faz requisição autenticada para a API do Kommo
     */
    private async request<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<T> {
        const url = `${this.baseUrl}${endpoint}`;

        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.config.accessToken}`,
            ...options.headers,
        };

        const response = await fetch(url, {
            ...options,
            headers,
        });

        if (response.status === 401) {
            // Token expirado, tentar refresh
            await this.refreshAccessToken();
            // Retry request
            return this.request(endpoint, options);
        }

        if (!response.ok) {
            const error = await response.json();
            throw new Error(`Kommo API Error: ${JSON.stringify(error)}`);
        }

        return response.json();
    }

    /**
     * Atualiza o access token usando refresh token
     */
    private async refreshAccessToken(): Promise<void> {
        const response = await fetch(`https://${this.config.subdomain}.kommo.com/oauth2/access_token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                client_id: this.config.clientId,
                client_secret: this.config.clientSecret,
                grant_type: 'refresh_token',
                refresh_token: this.config.refreshToken,
                redirect_uri: this.config.redirectUri,
            }),
        });

        if (!response.ok) {
            throw new Error('Failed to refresh Kommo access token');
        }

        const data = await response.json();
        this.config.accessToken = data.access_token;
        this.config.refreshToken = data.refresh_token;

        // Salva os novos tokens no Supabase
        await this.saveTokensToDatabase(data.access_token, data.refresh_token);
    }

    /**
     * Salva tokens no Supabase
     */
    private async saveTokensToDatabase(accessToken: string, refreshToken: string): Promise<void> {
        try {
            // Importa dinamicamente para evitar circular dependency
            const { supabase } = await import('@/integrations/supabase/client');

            // @ts-ignore - Tabela kommo_config será adicionada após aplicar migration
            await supabase
                .from('kommo_config')
                .update({
                    access_token: accessToken,
                    refresh_token: refreshToken,
                    updated_at: new Date().toISOString(),
                })
                .eq('subdomain', this.config.subdomain)
                .eq('is_active', true);
        } catch (error) {
            console.error('Erro ao salvar tokens no banco:', error);
            // Não lança erro para não quebrar o fluxo
        }
    }

    /**
     * LEADS
     */

    async createLead(lead: KommoLead): Promise<KommoLead> {
        const response = await this.request<{ _embedded: { leads: KommoLead[] } }>(
            '/leads',
            {
                method: 'POST',
                body: JSON.stringify([lead]),
            }
        );
        return response._embedded.leads[0];
    }

    async updateLead(leadId: number, lead: Partial<KommoLead>): Promise<KommoLead> {
        const response = await this.request<{ _embedded: { leads: KommoLead[] } }>(
            `/leads/${leadId}`,
            {
                method: 'PATCH',
                body: JSON.stringify(lead),
            }
        );
        return response._embedded.leads[0];
    }

    async getLead(leadId: number): Promise<KommoLead> {
        return this.request<KommoLead>(`/leads/${leadId}`);
    }

    async getLeads(filters?: {
        query?: string;
        status_id?: number;
        responsible_user_id?: number;
    }): Promise<KommoLead[]> {
        const params = new URLSearchParams(filters as any);
        const response = await this.request<{ _embedded: { leads: KommoLead[] } }>(
            `/leads?${params}`
        );
        return response._embedded?.leads || [];
    }

    /**
     * CONTACTS
     */

    async createContact(contact: KommoContact): Promise<KommoContact> {
        const response = await this.request<{ _embedded: { contacts: KommoContact[] } }>(
            '/contacts',
            {
                method: 'POST',
                body: JSON.stringify([contact]),
            }
        );
        return response._embedded.contacts[0];
    }

    async updateContact(contactId: number, contact: Partial<KommoContact>): Promise<KommoContact> {
        const response = await this.request<{ _embedded: { contacts: KommoContact[] } }>(
            `/contacts/${contactId}`,
            {
                method: 'PATCH',
                body: JSON.stringify(contact),
            }
        );
        return response._embedded.contacts[0];
    }

    async getContact(contactId: number): Promise<KommoContact> {
        return this.request<KommoContact>(`/contacts/${contactId}`);
    }

    async searchContactByPhone(phone: string): Promise<KommoContact | null> {
        const response = await this.request<{ _embedded: { contacts: KommoContact[] } }>(
            `/contacts?query=${encodeURIComponent(phone)}`
        );
        return response._embedded?.contacts?.[0] || null;
    }

    /**
     * NOTES
     */

    async addNote(note: KommoNote): Promise<void> {
        await this.request('/notes', {
            method: 'POST',
            body: JSON.stringify([note]),
        });
    }

    /**
     * WEBHOOKS
     */

    async createWebhook(settings: {
        destination: string;
        events: string[];
    }): Promise<void> {
        await this.request('/webhooks', {
            method: 'POST',
            body: JSON.stringify(settings),
        });
    }

    async getWebhooks(): Promise<any[]> {
        const response = await this.request<{ _embedded: { webhooks: any[] } }>('/webhooks');
        return response._embedded?.webhooks || [];
    }
}

export default KommoClient;
