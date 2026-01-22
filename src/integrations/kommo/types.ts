/**
 * Tipos para integração com Kommo
 */

export interface KommoTokens {
    access_token: string;
    refresh_token: string;
    expires_in: number;
    token_type: string;
}

export interface KommoWebhookPayload {
    leads?: {
        add?: Array<{ id: number }>;
        update?: Array<{ id: number }>;
        delete?: Array<{ id: number }>;
        status?: Array<{ id: number; status_id: number; old_status_id: number }>;
    };
    contacts?: {
        add?: Array<{ id: number }>;
        update?: Array<{ id: number }>;
        delete?: Array<{ id: number }>;
    };
}

export interface KommoCustomField {
    field_id: number;
    field_name: string;
    field_code: string;
    field_type: 'text' | 'numeric' | 'checkbox' | 'select' | 'multiselect' | 'date' | 'url' | 'textarea' | 'radiobutton' | 'streetaddress' | 'smart_address' | 'birthday' | 'legal_entity';
    values: Array<{
        value: string | number;
        enum_id?: number;
        enum_code?: string;
    }>;
}

export interface KommoLeadStatus {
    id: number;
    name: string;
    color: string;
    sort: number;
    is_editable: boolean;
    pipeline_id: number;
}

export interface KommoPipeline {
    id: number;
    name: string;
    sort: number;
    is_main: boolean;
    is_unsorted_on: boolean;
    is_archive: boolean;
    account_id: number;
    _embedded: {
        statuses: KommoLeadStatus[];
    };
}

export interface KommoUser {
    id: number;
    name: string;
    email: string;
    lang: string;
    rights: {
        is_admin: boolean;
        is_free: boolean;
        is_active: boolean;
    };
}

// Mapeamento entre Doctor Auto Prime e Kommo
export interface OSToLeadMapping {
    os_id: string;
    kommo_lead_id: number;
    synced_at: string;
}

export interface ClientToContactMapping {
    client_id: string;
    kommo_contact_id: number;
    synced_at: string;
}
