/**
 * Serviço de sincronização entre Doctor Auto Prime e Kommo
 */

import KommoClient, { KommoLead, KommoContact } from './client';
import { supabase } from '@/integrations/supabase/client';

export class KommoSyncService {
    private kommo: KommoClient;

    constructor(kommo: KommoClient) {
        this.kommo = kommo;
    }

    /**
     * Sincroniza OS para Lead no Kommo
     */
    async syncOSToLead(osId: string): Promise<number> {
        // 1. Busca OS no Supabase
        const { data: os, error } = await supabase
            .from('ordens_servico')
            .select('*')
            .eq('id', osId)
            .single();

        if (error || !os) {
            throw new Error('OS não encontrada');
        }

        // 2. Verifica se já existe lead vinculado
        const { data: mapping } = await supabase
            .from('kommo_os_mapping')
            .select('kommo_lead_id')
            .eq('os_id', osId)
            .single();

        if (mapping?.kommo_lead_id) {
            // Atualiza lead existente
            await this.kommo.updateLead(mapping.kommo_lead_id, {
                name: `OS ${os.numero_os} - ${os.vehicle} ${os.plate}`,
                price: os.valor_aprovado || os.valor_orcado,
                custom_fields_values: [
                    {
                        field_id: 123456, // ID do campo customizado "Placa"
                        values: [{ value: os.plate }],
                    },
                    {
                        field_id: 123457, // ID do campo customizado "Veículo"
                        values: [{ value: os.vehicle }],
                    },
                    {
                        field_id: 123458, // ID do campo customizado "Status OS"
                        values: [{ value: os.status }],
                    },
                ],
            });
            return mapping.kommo_lead_id;
        }

        // 3. Busca ou cria contato
        let contactId: number | undefined;
        if (os.client_phone) {
            const contact = await this.kommo.searchContactByPhone(os.client_phone);
            if (contact) {
                contactId = contact.id;
            } else {
                const newContact = await this.kommo.createContact({
                    name: os.client_name || 'Cliente',
                    custom_fields_values: [
                        {
                            field_id: 123459, // ID do campo "Telefone"
                            values: [{ value: os.client_phone }],
                        },
                    ],
                });
                contactId = newContact.id;
            }
        }

        // 4. Cria lead
        const lead = await this.kommo.createLead({
            name: `OS ${os.numero_os} - ${os.vehicle} ${os.plate}`,
            price: os.valor_aprovado || os.valor_orcado,
            custom_fields_values: [
                {
                    field_id: 123456, // Placa
                    values: [{ value: os.plate }],
                },
                {
                    field_id: 123457, // Veículo
                    values: [{ value: os.vehicle }],
                },
                {
                    field_id: 123458, // Status OS
                    values: [{ value: os.status }],
                },
            ],
            _embedded: contactId ? {
                contacts: [{ id: contactId }],
            } : undefined,
        });

        // 5. Salva mapeamento
        await supabase.from('kommo_os_mapping').insert({
            os_id: osId,
            kommo_lead_id: lead.id!,
            synced_at: new Date().toISOString(),
        });

        // 6. Adiciona nota com detalhes
        if (os.diagnostico || os.observacoes) {
            await this.kommo.addNote({
                entity_id: lead.id!,
                entity_type: 'leads',
                note_type: 'common',
                params: {
                    text: `
📋 Diagnóstico: ${os.diagnostico || 'Não informado'}

📝 Observações: ${os.observacoes || 'Nenhuma'}

🔧 Mecânico: ${os.mecanico_responsavel || 'Não atribuído'}
          `.trim(),
                },
            });
        }

        return lead.id!;
    }

    /**
     * Sincroniza Cliente para Contato no Kommo
     */
    async syncClientToContact(clientName: string, clientPhone: string): Promise<number> {
        // Busca contato existente
        const contact = await this.kommo.searchContactByPhone(clientPhone);

        if (contact) {
            return contact.id!;
        }

        // Cria novo contato
        const newContact = await this.kommo.createContact({
            name: clientName,
            custom_fields_values: [
                {
                    field_id: 123459, // Telefone
                    values: [{ value: clientPhone }],
                },
            ],
        });

        return newContact.id!;
    }

    /**
     * Atualiza status do lead quando OS muda de status
     */
    async updateLeadStatus(osId: string, newStatus: string): Promise<void> {
        const { data: mapping } = await supabase
            .from('kommo_os_mapping')
            .select('kommo_lead_id')
            .eq('os_id', osId)
            .single();

        if (!mapping?.kommo_lead_id) {
            return;
        }

        // Mapeia status da OS para status do Kommo
        const statusMapping: Record<string, number> = {
            'orcamento': 123460, // ID do status "Orçamento"
            'aprovado': 123461, // ID do status "Aprovado"
            'em_execucao': 123462, // ID do status "Em Execução"
            'concluido': 123463, // ID do status "Concluído"
            'entregue': 142, // ID do status "Sucesso" (padrão Kommo)
            'recusado': 143, // ID do status "Não realizado" (padrão Kommo)
        };

        const statusId = statusMapping[newStatus];
        if (statusId) {
            await this.kommo.updateLead(mapping.kommo_lead_id, {
                status_id: statusId,
            });
        }
    }

    /**
     * Processa webhook do Kommo
     */
    async processWebhook(payload: any): Promise<void> {
        // Implementar lógica de processamento de webhooks
        // Por exemplo: quando um lead é atualizado no Kommo, atualizar a OS
        console.log('Webhook recebido:', payload);
    }
}

export default KommoSyncService;
