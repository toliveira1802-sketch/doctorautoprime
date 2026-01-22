/**
 * API Route: Webhook do Kommo
 * Recebe eventos do Kommo e processa atualizações
 * 
 * Deploy: Vercel Serverless Function
 * Path: /api/kommo/webhook
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.VITE_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY! // Use service role para bypass RLS
);

export default async function handler(req: any, res: any) {
    // Apenas aceita POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const payload = req.body;

        // Salva webhook recebido
        await supabase.from('kommo_webhooks').insert({
            event_type: payload.event || 'unknown',
            payload: payload,
            processed: false,
        });

        // Processa eventos de Lead
        if (payload.leads) {
            await processLeadEvents(payload.leads);
        }

        // Processa eventos de Contato
        if (payload.contacts) {
            await processContactEvents(payload.contacts);
        }

        return res.status(200).json({ success: true });
    } catch (error: any) {
        console.error('Erro ao processar webhook:', error);
        return res.status(500).json({ error: error.message });
    }
}

/**
 * Processa eventos de Lead
 */
async function processLeadEvents(leads: any) {
    // Lead atualizado
    if (leads.update) {
        for (const lead of leads.update) {
            await updateOSFromLead(lead.id);
        }
    }

    // Lead com status alterado
    if (leads.status) {
        for (const lead of leads.status) {
            await updateOSStatus(lead.id, lead.status_id);
        }
    }

    // Lead deletado
    if (leads.delete) {
        for (const lead of leads.delete) {
            // Opcional: marcar OS como deletada ou apenas remover mapeamento
            await supabase
                .from('kommo_os_mapping')
                .delete()
                .eq('kommo_lead_id', lead.id);
        }
    }
}

/**
 * Processa eventos de Contato
 */
async function processContactEvents(contacts: any) {
    // Implementar se necessário
    console.log('Eventos de contato recebidos:', contacts);
}

/**
 * Atualiza OS baseado em mudanças no Lead
 */
async function updateOSFromLead(leadId: number) {
    try {
        // Busca mapeamento
        const { data: mapping } = await supabase
            .from('kommo_os_mapping')
            .select('os_id')
            .eq('kommo_lead_id', leadId)
            .single();

        if (!mapping) {
            console.log('Mapeamento não encontrado para lead:', leadId);
            return;
        }

        // Aqui você pode buscar dados do lead no Kommo e atualizar a OS
        // Por enquanto, apenas loga
        console.log('Lead atualizado:', leadId, 'OS:', mapping.os_id);

        // Log da sincronização
        await supabase.from('kommo_sync_log').insert({
            os_id: mapping.os_id,
            action: 'webhook_lead_update',
            status: 'success',
            response_data: { lead_id: leadId },
        });
    } catch (error: any) {
        console.error('Erro ao atualizar OS:', error);

        await supabase.from('kommo_sync_log').insert({
            os_id: 'unknown',
            action: 'webhook_lead_update',
            status: 'error',
            error_message: error.message,
        });
    }
}

/**
 * Atualiza status da OS quando status do Lead muda
 */
async function updateOSStatus(leadId: number, newStatusId: number) {
    try {
        // Busca mapeamento
        const { data: mapping } = await supabase
            .from('kommo_os_mapping')
            .select('os_id')
            .eq('kommo_lead_id', leadId)
            .single();

        if (!mapping) {
            console.log('Mapeamento não encontrado para lead:', leadId);
            return;
        }

        // Mapeia status do Kommo para status da OS
        const statusMapping: Record<number, string> = {
            142: 'entregue', // Sucesso (padrão Kommo)
            143: 'recusado', // Não realizado (padrão Kommo)
            // Adicione seus status customizados aqui
            // 123460: 'orcamento',
            // 123461: 'aprovado',
            // etc...
        };

        const osStatus = statusMapping[newStatusId];

        if (osStatus) {
            // Atualiza status da OS
            await supabase
                .from('ordens_servico')
                .update({ status: osStatus })
                .eq('id', mapping.os_id);

            console.log('Status atualizado:', mapping.os_id, '->', osStatus);

            // Log
            await supabase.from('kommo_sync_log').insert({
                os_id: mapping.os_id,
                action: 'webhook_status_update',
                status: 'success',
                response_data: { lead_id: leadId, new_status: osStatus },
            });
        }
    } catch (error: any) {
        console.error('Erro ao atualizar status:', error);

        await supabase.from('kommo_sync_log').insert({
            os_id: 'unknown',
            action: 'webhook_status_update',
            status: 'error',
            error_message: error.message,
        });
    }
}
