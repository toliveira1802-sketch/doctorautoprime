# 🔗 INTEGRAÇÃO COMPLETA: Trello + Supabase + Exército de IAs

**Data**: 22/01/2026 02:11  
**Status**: Plano de Integração Completo

---

## 🎯 VISÃO GERAL

Este documento conecta **3 sistemas** em um ecossistema unificado:

1. **Migração Trello → Supabase** (dados históricos do pátio)
2. **Exército de 15 IAs** (automação e inteligência)
3. **Dashboard Doctor Auto Prime** (interface e gestão)

---

## 📊 ARQUITETURA INTEGRADA

```
┌─────────────────────────────────────────────────────────┐
│                    DASHBOARD REACT                       │
│  (Doctor Auto Prime - Interface Unificada)              │
└──────────────┬──────────────────────────────────────────┘
               │
               ├─────────────────────────────────────────┐
               │                                         │
               ↓                                         ↓
┌──────────────────────────┐          ┌─────────────────────────┐
│   SUPABASE DATABASE      │          │   NESTJS API (IAs)      │
│   (Dados do Pátio)       │◄────────►│   (Automações)          │
│                          │          │                         │
│  • ordens_servico        │          │  • 15 IAs Ativas        │
│  • appointments          │          │  • Kommo Integration    │
│  • clients               │          │  • WhatsApp Business    │
│  • vehicles              │          │  • Automações 24/7      │
└──────────────┬───────────┘          └─────────────────────────┘
               │
               ↓
┌──────────────────────────┐
│   TRELLO (Legacy)        │
│   Board: NkhINjF2        │
│   (Migração Única)       │
└──────────────────────────┘
```

---

## 🔄 FLUXO DE MIGRAÇÃO + IAs

### **Fase 1: Migração Histórica (AGORA)**

```bash
# 1. Migrar dados do Trello para Supabase
npx tsx scripts/migrate-trello.ts

# Resultado:
# ✅ Todos os cards históricos → ordens_servico
# ✅ Listas → posicao_patio
# ✅ Labels → prioridade, tags
# ✅ Membros → mecanico_responsavel
```

### **Fase 2: Ativação das IAs (DEPOIS)**

Após a migração, as IAs começam a trabalhar com os dados:

#### **IAs que usam dados do Pátio:**

1. **👁️ VIGILANTE** - Monitora novas OSs
   - Detecta OSs em `entrada`
   - Alerta OSs com `prioridade = 'urgente'`
   - Monitora tempo em cada `posicao_patio`

2. **📊 RELATÓRIOS** - Analisa dados históricos
   - Tempo médio por posição
   - Taxa de conversão por mecânico
   - Gargalos operacionais
   - Tendências de serviços

3. **🔧 MECÂNICO VIRTUAL** - Diagnóstico técnico
   - Analisa `service_description`
   - Sugere diagnósticos baseado em histórico
   - Estima tempo e custo

4. **💰 ANNA LAURA** - Vendas
   - Analisa `valor_aprovado` vs `valor_final`
   - Sugere margens baseado em histórico
   - Identifica oportunidades de upsell

5. **📅 AGENDADOR** - Organiza pátio
   - Otimiza `box` e `elevador`
   - Prevê `data_previsao_entrega`
   - Gerencia capacidade

---

## 🤖 MAPEAMENTO: IAs → Dados Supabase

### **Tabela: `ordens_servico`**

| Campo Supabase | IAs que Usam | Finalidade |
|---------------|--------------|------------|
| `posicao_patio` | Vigilante, Relatórios, Agendador | Monitoramento de fluxo |
| `prioridade` | Vigilante, Qualificador | Priorização de atendimento |
| `tags` | Marketing, Relatórios | Segmentação e análise |
| `mecanico_responsavel` | Relatórios, Pós-Venda | Performance e follow-up |
| `valor_aprovado` | Anna Laura, Financeiro, Relatórios | Análise financeira |
| `data_previsao_entrega` | Agendador, Pós-Venda, Satisfação | Gestão de prazos |
| `service_description` | Mecânico Virtual, Orçamentista | Diagnóstico técnico |
| `trello_card_url` | Integrador | Rastreabilidade |

### **Tabela: `appointments`**

| Campo | IAs que Usam | Finalidade |
|-------|--------------|------------|
| `appointment_date` | Agendador, Vigilante | Gestão de agenda |
| `client_name` | Reativador, Pós-Venda | Follow-up |
| `status` | Relatórios, Satisfação | Métricas |

### **Tabela: `clients`**

| Campo | IAs que Usam | Finalidade |
|-------|--------------|------------|
| `last_service_date` | Reativador | Identificar inativos |
| `total_spent` | Qualificador, Anna Laura | Classificação de valor |
| `nps_score` | Satisfação, Relatórios | Análise de satisfação |

---

## 🚀 IMPLEMENTAÇÃO: Conectar IAs ao Supabase

### **1. Criar Endpoints para IAs**

```typescript
// src/pages/gestao/ia/api/ia-vigilante.ts

export async function executarVigilante() {
  const { data: osUrgentes } = await supabase
    .from('ordens_servico')
    .select('*')
    .eq('prioridade', 'urgente')
    .eq('posicao_patio', 'entrada')
    .is('mecanico_responsavel', null);
  
  // Alerta para cada OS urgente sem mecânico
  for (const os of osUrgentes) {
    await enviarAlerta({
      tipo: 'urgente',
      mensagem: `OS ${os.id} - ${os.vehicle_plate} precisa de atenção!`,
      os_id: os.id
    });
  }
  
  return {
    osEncontradas: osUrgentes.length,
    alertasEnviados: osUrgentes.length
  };
}
```

### **2. Criar Dashboard de IAs**

```typescript
// src/pages/gestao/ia/IADashboard.tsx

export default function IADashboard() {
  const [relatorioIAs, setRelatorioIAs] = useState([]);
  
  useEffect(() => {
    // Busca relatório das IAs
    fetch('https://doctor-auto-api-production.up.railway.app/api/ias/relatorio')
      .then(res => res.json())
      .then(data => setRelatorioIAs(data.relatorios));
  }, []);
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {relatorioIAs.map(ia => (
        <Card key={ia.ia}>
          <CardHeader>
            <CardTitle>{ia.emoji} {ia.ia}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{ia.tarefa}</p>
            <p className="mt-2 font-semibold">{ia.resultado}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
```

### **3. Automações Baseadas em Dados**

```typescript
// Exemplo: Reativador detecta clientes inativos

async function executarReativador() {
  const dataLimite = new Date();
  dataLimite.setDate(dataLimite.getDate() - 90); // 90 dias atrás
  
  const { data: clientesInativos } = await supabase
    .from('clients')
    .select('*')
    .lt('last_service_date', dataLimite.toISOString());
  
  // Envia campanha de reativação
  for (const cliente of clientesInativos) {
    await enviarWhatsApp({
      telefone: cliente.phone,
      mensagem: `Olá ${cliente.name}! Sentimos sua falta...`
    });
  }
  
  return {
    clientesContatados: clientesInativos.length
  };
}
```

---

## 📋 CHECKLIST DE INTEGRAÇÃO

### **Fase 1: Migração (AGORA)**

- [ ] Obter Service Role Key do Supabase
- [ ] Executar `npx tsx scripts/test-connections.ts`
- [ ] Executar `npx tsx scripts/migrate-trello.ts`
- [ ] Verificar dados migrados no Supabase
- [ ] Testar página AdminPatio.tsx

### **Fase 2: Conectar IAs (PRÓXIMA)**

- [ ] Criar endpoints de IAs no backend
- [ ] Conectar IAs ao Supabase
- [ ] Implementar automações básicas:
  - [ ] Vigilante (monitoramento)
  - [ ] Agendador (confirmações)
  - [ ] Reativador (clientes inativos)
- [ ] Criar dashboard de IAs
- [ ] Testar fluxo completo

### **Fase 3: Automações Avançadas**

- [ ] Integrar Kommo CRM
- [ ] Conectar WhatsApp Business API
- [ ] Implementar todas as 15 IAs
- [ ] Machine Learning para qualificação
- [ ] Análise preditiva

---

## 🎯 CASOS DE USO PRÁTICOS

### **Caso 1: Nova OS Urgente**

```
1. Cliente agenda serviço urgente
2. VIGILANTE detecta OS com prioridade='urgente'
3. QUALIFICADOR analisa perfil do cliente
4. ANNA LAURA sugere preço premium por urgência
5. AGENDADOR aloca box disponível
6. MECÂNICO VIRTUAL sugere diagnóstico inicial
7. PÓS-VENDA agenda follow-up
```

### **Caso 2: Cliente Inativo**

```
1. REATIVADOR identifica cliente sem serviço há 90 dias
2. MARKETING cria campanha personalizada
3. WhatsApp envia mensagem automática
4. QUALIFICADOR analisa resposta
5. AGENDADOR marca horário
6. SATISFAÇÃO coleta feedback pós-serviço
```

### **Caso 3: Análise de Performance**

```
1. RELATÓRIOS analisa dados históricos do Trello migrados
2. Identifica que "Aguard. Peças" tem tempo médio de 5 dias
3. ESTOQUE verifica peças mais solicitadas
4. BIA sugere otimização de estoque
5. FINANCEIRO calcula impacto no fluxo de caixa
```

---

## 🔧 CONFIGURAÇÃO TÉCNICA

### **Variáveis de Ambiente**

```bash
# .env

# Supabase
VITE_SUPABASE_URL=https://acuufrgoyjwzlyhopaus.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=sua-chave-aqui

# API das IAs
VITE_IA_API_URL=https://doctor-auto-api-production.up.railway.app

# Kommo CRM
KOMMO_API_URL=https://doctorautobosch.kommo.com/api/v4
KOMMO_JWT_TOKEN=seu-token-aqui

# WhatsApp Business
WHATSAPP_API_URL=https://graph.facebook.com/v18.0
WHATSAPP_TOKEN=seu-token-aqui
```

### **Scripts NPM**

```json
{
  "scripts": {
    "migrate:trello": "tsx scripts/migrate-trello.ts",
    "test:connections": "tsx scripts/test-connections.ts",
    "ia:vigilante": "tsx scripts/ias/executar-vigilante.ts",
    "ia:reativador": "tsx scripts/ias/executar-reativador.ts",
    "ia:all": "tsx scripts/ias/executar-todas.ts"
  }
}
```

---

## 📊 MÉTRICAS DE SUCESSO

### **Pós-Migração**

- ✅ 100% dos cards do Trello migrados
- ✅ 0 erros de inserção
- ✅ Dados acessíveis no AdminPatio.tsx
- ✅ Histórico preservado (trello_card_url)

### **Pós-Integração IAs**

- ✅ 15 IAs ativas e funcionando
- ✅ Automações rodando 24/7
- ✅ Tempo de resposta < 1h para leads urgentes
- ✅ Taxa de reativação > 15%
- ✅ NPS > 8.0

---

## 🚀 PRÓXIMOS PASSOS

### **AGORA (Você precisa fazer)**

1. Obter Service Role Key do Supabase
2. Executar migração do Trello
3. Verificar dados migrados

### **DEPOIS (Implementação das IAs)**

1. Criar endpoints de IAs no backend
2. Conectar IAs ao Supabase
3. Implementar automações básicas
4. Testar fluxo completo
5. Ativar todas as 15 IAs

---

**🎉 Com isso, você terá um sistema completo:**
- ✅ Dados históricos do Trello no Supabase
- ✅ 15 IAs trabalhando 24/7
- ✅ Automação completa de vendas e atendimento
- ✅ Dashboard unificado e inteligente

**🔑 AÇÃO IMEDIATA: Execute a migração do Trello!**

Leia: `MIGRACAO_TRELLO_PRONTA.md`
