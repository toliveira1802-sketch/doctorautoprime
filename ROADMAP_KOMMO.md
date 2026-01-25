# 🗺️ Roadmap de Integração Kommo CRM

## 📍 Contexto Operacional Real

### Fluxo Atual da Operação:
```
Cliente → Kommo (WhatsApp/Redes) → Qualificação → Doctor Auto Prime → Execução
```

**Kommo é a PORTA DE ENTRADA**, não a saída.

---

## 🚀 Versões Planejadas

### ✅ **V1 - MVP Atual (Janeiro 2026)**
**Status**: Implementado mas NÃO prioritário para uso imediato

**Funcionalidades**:
- Sincronização Doctor Auto Prime → Kommo (OS para Lead)
- Webhook básico para receber atualizações
- Configuração OAuth 2.0
- Mapeamento de dados (profiles ↔ contacts, service_orders ↔ leads)

**Decisão**: 
- ✅ Código pronto e testado
- ⏸️ **Pausar ativação** até V2/V3
- 📦 Manter infraestrutura para evolução futura

---

### 🎯 **V2 - Fluxo Invertido (Futuro - Prioridade Alta)**
**Objetivo**: Kommo como origem dos clientes

**Funcionalidades Planejadas**:

#### 1. **Importação de Leads do Kommo**
```typescript
// Fluxo desejado:
Kommo Lead (Qualificado) → Botão "Criar OS" → Doctor Auto Prime
```

**Implementação**:
- [ ] Webhook: `lead.status_changed` → Detectar leads qualificados
- [ ] API: Buscar leads em estágio específico (ex: "Orçamento Aprovado")
- [ ] UI: Botão "Importar Leads Qualificados do Kommo"
- [ ] Automação: Criar cliente + veículo + OS automaticamente

#### 2. **Sincronização Bidirecional Inteligente**
```
Kommo ←→ Doctor Auto Prime
```

**Regras**:
- **Kommo → Sistema**: Novos leads qualificados viram OS
- **Sistema → Kommo**: Atualizações de status da OS (em execução, pronto, entregue)
- **Evitar duplicação**: Verificar se lead já existe antes de criar

#### 3. **Campos Customizados no Kommo**
- [ ] **Placa do Veículo**
- [ ] **Modelo/Marca**
- [ ] **Problema Relatado**
- [ ] **Urgência** (Alta/Média/Baixa)
- [ ] **Origem** (WhatsApp/Instagram/Google/Indicação)

#### 4. **Dashboard de Conversão**
```
Leads Recebidos → Qualificados → OS Criadas → Concluídas
```

**Métricas**:
- Taxa de conversão Kommo → OS
- Tempo médio de qualificação
- Valor médio por origem (WhatsApp vs Instagram)

---

### 🔮 **V3 - Automação Completa (Futuro - Prioridade Média)**

#### 1. **Automação de Follow-up**
```typescript
// Exemplo:
OS Status: "Orçamento Enviado" 
  → Kommo envia WhatsApp após 24h
  → "Olá João! Viu nosso orçamento? Alguma dúvida?"
```

#### 2. **Integração com IA de Atendimento**
```
Cliente pergunta no WhatsApp (Kommo) 
  → IA consulta histórico no Doctor Auto Prime
  → Responde: "Seu carro está na etapa de Diagnóstico"
```

#### 3. **Sincronização de Histórico**
- Todas as conversas do Kommo visíveis no perfil do cliente
- Timeline unificada: mensagens + OS + pagamentos

#### 4. **Campanhas Automatizadas**
```
Trigger: OS concluída há 6 meses
  → Kommo: "Que tal uma revisão preventiva?"
```

---

## 🛠️ Decisões Técnicas para V2

### Arquitetura Proposta:

```typescript
// 1. Webhook Receiver (já existe)
// api/kommo/webhook.ts

// 2. NOVO: Lead Importer Service
class KommoLeadImporter {
  async importQualifiedLeads(pipelineStage: string) {
    // Buscar leads no estágio "Orçamento Aprovado"
    const leads = await kommoClient.getLeadsByStage(pipelineStage);
    
    for (const lead of leads) {
      // Verificar se já existe no sistema
      const existingClient = await checkExistingClient(lead.contact);
      
      if (!existingClient) {
        // Criar cliente + veículo + OS
        await createClientFromLead(lead);
      }
    }
  }
}

// 3. NOVO: UI Component
// src/pages/admin/KommoImport.tsx
function KommoImportPage() {
  return (
    <div>
      <h1>Importar Leads Qualificados</h1>
      <button onClick={importLeads}>
        Buscar Leads "Orçamento Aprovado"
      </button>
      <LeadsList leads={pendingLeads} />
    </div>
  );
}
```

### Tabelas Adicionais Necessárias:

```sql
-- Rastrear origem dos clientes
ALTER TABLE profiles 
ADD COLUMN origem_kommo BOOLEAN DEFAULT FALSE,
ADD COLUMN kommo_lead_id BIGINT,
ADD COLUMN data_importacao TIMESTAMPTZ;

-- Log de importações
CREATE TABLE kommo_import_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id BIGINT NOT NULL,
  client_id UUID REFERENCES profiles(id),
  os_id UUID REFERENCES ordens_servico(id),
  status TEXT, -- 'success', 'duplicate', 'error'
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 📊 Priorização

| Versão | Prioridade | Esforço | Impacto | Timeline Estimado |
|--------|-----------|---------|---------|-------------------|
| **V1** | ✅ Concluído | - | Baixo (não usado) | Janeiro 2026 |
| **V2** | 🔥 Alta | Médio (2-3 semanas) | Alto | Q1 2026 |
| **V3** | 🟡 Média | Alto (1-2 meses) | Muito Alto | Q2 2026 |

---

## 🎯 Próximos Passos Recomendados

### Curto Prazo (Agora):
1. ✅ **Pausar ativação do Kommo V1**
2. ✅ **Documentar fluxo real** (este arquivo)
3. 🔄 **Focar em funcionalidades core** do Doctor Auto Prime

### Médio Prazo (Quando priorizar V2):
1. [ ] Mapear estágios do funil Kommo
2. [ ] Definir critérios de "lead qualificado"
3. [ ] Implementar importador de leads
4. [ ] Testar com dados reais

### Longo Prazo (V3):
1. [ ] Contratar especialista em automação Kommo
2. [ ] Integrar IA de atendimento
3. [ ] Campanhas de retenção automatizadas

---

## 📌 Notas Importantes

### Por que V1 foi implementado primeiro?
- Padrão comum de integração CRM (sistema → CRM)
- Base técnica sólida para V2 (OAuth, webhooks, mapeamento)
- Aprendizado da API Kommo

### Por que V2 é mais complexo?
- Requer lógica de **deduplicação** robusta
- Precisa **validação de dados** vindos do Kommo
- Necessita **mapeamento de campos customizados**
- Exige **tratamento de erros** mais sofisticado

### Riscos de V2:
- ⚠️ Leads mal qualificados virando OS
- ⚠️ Duplicação de clientes
- ⚠️ Dados incompletos (ex: placa faltando)

**Mitigação**: UI de revisão antes de importar + validações rigorosas

---

## 🔗 Referências

- [Kommo API Docs](https://www.kommo.com/developers/)
- [Webhook Events](https://www.kommo.com/developers/webhooks/)
- Código V1: `src/integrations/kommo/`
- Migration V1: `supabase/migrations/20260122034000_kommo_integration.sql`

---

**Última Atualização**: 24 de Janeiro de 2026  
**Decisão**: Pausar V1, planejar V2 para quando houver demanda operacional  
**Responsável**: Thiago Oliveira
