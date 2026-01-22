# 📊 ANÁLISE COMPLETA: Funcionalidade de Orçamento
## O Coração do Sistema Doctor Auto Prime

---

## 🎯 VISÃO GERAL

A funcionalidade de **Orçamento** é um dos pilares centrais do sistema Doctor Auto Prime. Ela serve como ponte entre:
- **Diagnóstico técnico** → **Proposta comercial** → **Aprovação do cliente** → **Execução do serviço**

### Duas Visões Principais:

1. **👁️ VISÃO CLIENTE** (`/orcamento/:osId`)
   - Interface pública e amigável
   - Foco na experiência do cliente
   - Visualização clara de prioridades
   - Aprovação/recusa de itens (futuro)

2. **🔧 VISÃO OFICINA** (`/admin/os/:osId`)
   - Interface administrativa completa
   - Gestão de itens e margens
   - Controle de status
   - Ferramentas de venda

---

## 📁 ARQUIVOS PRINCIPAIS

### 1. **OrcamentoCliente.tsx** (438 linhas)
**Localização:** `src/pages/OrcamentoCliente.tsx`
**Rota:** `/orcamento/:osId`
**Visibilidade:** Pública (link compartilhável)

**Responsabilidades:**
- Exibir orçamento de forma clara e visual para o cliente
- Mostrar prioridades com sistema de cores (vermelho/amarelo/verde)
- Calcular totais (orçado vs aprovado)
- Integrar dados do cliente via telefone
- Link direto via WhatsApp

### 2. **AdminOSDetalhes.tsx** (2.452 linhas)
**Localização:** `src/pages/admin/AdminOSDetalhes.tsx`
**Rota:** `/admin/os/:osId`
**Visibilidade:** Apenas admin/gestão

**Responsabilidades:**
- CRUD completo de itens do orçamento
- Gestão de margens e custos
- Controle de status da OS
- Checklists (entrada, dinamômetro, pré-compra)
- Integração com IA para sugestões
- Geração de links para cliente

### 3. **AdminOrdensServico.tsx**
**Localização:** `src/pages/admin/AdminOrdensServico.tsx`
**Responsabilidades:**
- Listagem de todas as OSs
- Filtros por status (incluindo "Orçamento")
- Visualização rápida de itens
- Acesso rápido ao link do cliente

---

## 🗄️ ESTRUTURA DE DADOS

### Tabela: `ordens_servico`
```sql
-- Campos principais relacionados ao orçamento
id UUID PRIMARY KEY
numero_os TEXT -- Ex: "OS-2024-001"
status TEXT -- "orcamento", "aprovado", "parcial", etc.
client_name TEXT
client_phone TEXT
vehicle TEXT
plate TEXT
km_atual TEXT
descricao_problema TEXT
diagnostico TEXT

-- Valores calculados
valor_orcado NUMERIC -- Soma de todos os itens
valor_aprovado NUMERIC -- Soma dos itens aprovados

-- Timestamps
data_entrada TIMESTAMPTZ
data_orcamento TIMESTAMPTZ -- Quando virou "orçamento"
data_aprovacao TIMESTAMPTZ
data_conclusao TIMESTAMPTZ
data_entrega TIMESTAMPTZ

-- Checklists (JSONB)
checklist_entrada JSONB
checklist_dinamometro JSONB
checklist_precompra JSONB
```

### Tabela: `ordens_servico_itens`
```sql
id UUID PRIMARY KEY
ordem_servico_id UUID REFERENCES ordens_servico(id)

-- Descrição
descricao TEXT -- Ex: "Troca de pastilhas de freio"
tipo TEXT -- "peca" ou "mao_de_obra"

-- Valores
quantidade NUMERIC
valor_custo NUMERIC -- Custo da peça/serviço
valor_venda_sugerido NUMERIC -- Preço sugerido (custo + margem padrão)
valor_unitario NUMERIC -- Preço final (pode ter desconto)
valor_total NUMERIC -- valor_unitario * quantidade
margem_aplicada NUMERIC -- % de margem real aplicada

-- Status e Prioridade
status TEXT -- "pendente", "aprovado", "recusado"
motivo_recusa TEXT -- Se recusado, por quê?
prioridade TEXT -- "vermelho", "amarelo", "verde"
data_retorno_estimada DATE -- Para itens não urgentes

-- Justificativas
justificativa_desconto TEXT -- Se margem < padrão

-- Timestamps
created_at TIMESTAMPTZ
updated_at TIMESTAMPTZ
```

---

## 🎨 SISTEMA DE PRIORIDADES

### 🔴 VERMELHO - Urgente
- **Label:** "Urgente"
- **Descrição:** "Troca imediata necessária - risco de segurança"
- **Uso:** Itens críticos que afetam segurança
- **Exemplos:** Freios gastos, pneus carecas, suspensão comprometida
- **Impacto Comercial:** Alta taxa de conversão (cliente não pode recusar)

### 🟡 AMARELO - Atenção
- **Label:** "Atenção"
- **Descrição:** "Recomendamos fazer em breve"
- **Uso:** Itens importantes mas não críticos
- **Exemplos:** Pastilhas com 40% de vida, correias com desgaste
- **Impacto Comercial:** Conversão média (cliente pode adiar)

### 🟢 VERDE - Preventivo
- **Label:** "Preventivo"
- **Descrição:** "Pode aguardar, mas fique atento"
- **Uso:** Manutenções preventivas e melhorias
- **Exemplos:** Troca de óleo próxima, filtros, limpezas
- **Impacto Comercial:** Conversão baixa (upsell/cross-sell)

---

## 💰 GESTÃO DE MARGENS E PREÇOS

### Fluxo de Cálculo:
```
1. CUSTO (informado pelo mecânico)
   ↓
2. MARGEM PADRÃO (40% configurável)
   ↓
3. VALOR VENDA SUGERIDO = custo × (1 + margem/100)
   ↓
4. VALOR UNITÁRIO (pode ter desconto)
   ↓
5. VALOR TOTAL = valor_unitario × quantidade
```

### Controles:
- **Margem mínima:** Sistema pode alertar se margem < X%
- **Justificativa obrigatória:** Para descontos acima de Y%
- **Histórico de margens:** Para análise comercial

---

## 🔄 FLUXO COMPLETO DO ORÇAMENTO

### 1️⃣ ENTRADA DO VEÍCULO
```
Cliente agenda → Veículo entra na oficina → OS criada
Status: "diagnostico"
```

### 2️⃣ DIAGNÓSTICO
```
Mecânico preenche:
- Checklist de entrada (obrigatório)
- Descrição do problema
- Scanner de avarias (se aplicável)
- Checklist específico (dyno/pré-compra)

Status: "diagnostico"
```

### 3️⃣ CRIAÇÃO DO ORÇAMENTO
```
Mecânico/Gerente adiciona itens:
- Peças necessárias (com custo)
- Mão de obra (sem custo, 100% margem)
- Define prioridades (vermelho/amarelo/verde)
- Define data de retorno estimada (se não urgente)

Sistema calcula:
- Valor total orçado
- Margem aplicada em cada item

Status: "orcamento"
data_orcamento: NOW()
```

### 4️⃣ ENVIO PARA CLIENTE
```
Gerente copia link: /orcamento/:osId
Envia via WhatsApp com mensagem padrão:

"Olá [Cliente]! 🚗
Seu orçamento está pronto!

OS: OS-2024-001
Veículo: Civic - ABC1234
Valor Total: R$ 2.500,00

Veja os detalhes: [LINK]
Podemos prosseguir?"
```

### 5️⃣ CLIENTE VISUALIZA
```
Cliente acessa link público
Vê:
- Seus dados (nome, telefone, aniversário)
- Dados do veículo
- Itens agrupados por prioridade
- Total orçado vs aprovado
- Legenda de cores

(Futuro: Cliente pode aprovar/recusar itens direto)
```

### 6️⃣ APROVAÇÃO
```
Cliente aprova (via WhatsApp ou sistema)
Gerente atualiza status dos itens:
- Item X: "aprovado"
- Item Y: "recusado" (motivo: "Muito caro")

Sistema recalcula:
- valor_aprovado (soma dos aprovados)

Status OS: "aprovado" ou "parcial"
data_aprovacao: NOW()
```

### 7️⃣ EXECUÇÃO
```
Mecânico executa serviços aprovados
Status: "em_execucao"
```

### 8️⃣ CONCLUSÃO
```
Serviço finalizado
Status: "concluido"
data_conclusao: NOW()
```

### 9️⃣ ENTREGA
```
Cliente retira veículo
Status: "entregue"
data_entrega: NOW()
```

---

## 📊 DADOS PARA BI/CRM

### Métricas de Conversão:
```sql
-- Taxa de aprovação por prioridade
SELECT 
  prioridade,
  COUNT(*) FILTER (WHERE status = 'aprovado') * 100.0 / COUNT(*) as taxa_aprovacao
FROM ordens_servico_itens
GROUP BY prioridade;

-- Resultado esperado:
-- vermelho: ~95% (quase sempre aprovado)
-- amarelo: ~60% (conversão média)
-- verde: ~25% (upsell difícil)
```

### Métricas de Ticket Médio:
```sql
-- Ticket médio por tipo de serviço
SELECT 
  AVG(valor_aprovado) as ticket_medio,
  AVG(valor_orcado - valor_aprovado) as valor_medio_recusado
FROM ordens_servico
WHERE status IN ('aprovado', 'parcial', 'concluido', 'entregue');
```

### Análise de Margens:
```sql
-- Margem média por tipo de item
SELECT 
  tipo,
  AVG(margem_aplicada) as margem_media,
  MIN(margem_aplicada) as margem_minima,
  MAX(margem_aplicada) as margem_maxima
FROM ordens_servico_itens
WHERE status = 'aprovado'
GROUP BY tipo;
```

### Tempo de Aprovação:
```sql
-- Tempo médio entre orçamento e aprovação
SELECT 
  AVG(data_aprovacao - data_orcamento) as tempo_medio_aprovacao
FROM ordens_servico
WHERE data_aprovacao IS NOT NULL;
```

### Itens Mais Recusados:
```sql
-- Top 10 itens mais recusados (para ajustar preços)
SELECT 
  descricao,
  COUNT(*) as vezes_recusado,
  AVG(valor_unitario) as valor_medio,
  STRING_AGG(DISTINCT motivo_recusa, '; ') as motivos
FROM ordens_servico_itens
WHERE status = 'recusado'
GROUP BY descricao
ORDER BY vezes_recusado DESC
LIMIT 10;
```

---

## 🎯 OPORTUNIDADES COMERCIAIS

### 1. **Segmentação de Clientes**
```sql
-- Clientes que sempre aprovam tudo (VIPs)
SELECT client_phone, COUNT(*) as total_os
FROM ordens_servico
WHERE valor_aprovado = valor_orcado
GROUP BY client_phone
HAVING COUNT(*) >= 3;

-- Clientes sensíveis a preço (sempre recusam algo)
SELECT client_phone, COUNT(*) as total_os
FROM ordens_servico
WHERE valor_aprovado < valor_orcado
GROUP BY client_phone
HAVING COUNT(*) >= 3;
```

### 2. **Upsell/Cross-sell**
```sql
-- Itens verdes que foram aprovados (cliente aceita preventivos)
SELECT client_phone
FROM ordens_servico os
JOIN ordens_servico_itens osi ON os.id = osi.ordem_servico_id
WHERE osi.prioridade = 'verde' 
  AND osi.status = 'aprovado'
GROUP BY client_phone;
-- Ação: Oferecer pacotes de manutenção preventiva
```

### 3. **Retorno de Clientes**
```sql
-- Itens amarelos/verdes recusados (oportunidade de retorno)
SELECT 
  os.client_phone,
  os.client_name,
  osi.descricao,
  osi.data_retorno_estimada,
  osi.valor_total
FROM ordens_servico os
JOIN ordens_servico_itens osi ON os.id = osi.ordem_servico_id
WHERE osi.status = 'recusado'
  AND osi.prioridade IN ('amarelo', 'verde')
  AND osi.data_retorno_estimada IS NOT NULL
  AND osi.data_retorno_estimada <= CURRENT_DATE + INTERVAL '30 days';
-- Ação: Campanha de WhatsApp "Lembra daquele serviço?"
```

### 4. **Análise de Sazonalidade**
```sql
-- Quais serviços vendem mais em cada época do ano
SELECT 
  EXTRACT(MONTH FROM data_orcamento) as mes,
  descricao,
  COUNT(*) as quantidade,
  SUM(valor_total) as faturamento
FROM ordens_servico os
JOIN ordens_servico_itens osi ON os.id = osi.ordem_servico_id
WHERE osi.status = 'aprovado'
GROUP BY mes, descricao
ORDER BY mes, faturamento DESC;
-- Ação: Promoções sazonais
```

---

## 🚀 INTEGRAÇÕES EXISTENTES

### 1. **WhatsApp**
- Link direto para telefone do cliente
- Mensagem pré-formatada com dados da OS
- Botão "Enviar Orçamento" gera link compartilhável

### 2. **Profiles (CRM)**
- Busca cliente por telefone
- Exibe nome completo e aniversário
- Futuro: Histórico de OSs, fidelidade, etc.

### 3. **IA (Edge Functions)**
- `ai-budget-suggestions`: Sugere itens baseado no diagnóstico
- `ai-checklist-analysis`: Analisa checklist e identifica problemas
- Futuro: Previsão de aprovação, sugestão de preços

---

## 📈 DASHBOARDS SUGERIDOS

### Dashboard 1: **Conversão de Orçamentos**
```
Métricas:
- Taxa de aprovação geral
- Taxa de aprovação por prioridade
- Tempo médio de aprovação
- Valor médio aprovado vs orçado

Gráficos:
- Funil: Orçado → Aprovado → Executado → Entregue
- Pizza: Distribuição de status (aprovado/parcial/recusado)
- Linha: Evolução da taxa de aprovação ao longo do tempo
```

### Dashboard 2: **Análise de Margens**
```
Métricas:
- Margem média geral
- Margem média por tipo (peça vs mão de obra)
- Quantidade de descontos aplicados
- Valor total de descontos

Gráficos:
- Histograma: Distribuição de margens
- Tabela: Top 10 itens com menor margem
- Alerta: Itens abaixo da margem mínima
```

### Dashboard 3: **Oportunidades de Retorno**
```
Métricas:
- Itens recusados com data de retorno próxima
- Valor total em oportunidades
- Clientes com itens pendentes

Ações:
- Botão: "Enviar campanha de retorno"
- Filtro: Por prioridade, por data, por cliente
```

### Dashboard 4: **Performance Comercial**
```
Métricas:
- Ticket médio
- Itens por OS (média)
- Taxa de upsell (itens verdes aprovados)
- Faturamento por mecânico/gerente

Gráficos:
- Ranking: Mecânicos com maior taxa de aprovação
- Linha: Evolução do ticket médio
```

---

## 🔮 FUNCIONALIDADES FUTURAS

### 1. **Aprovação Online pelo Cliente**
```
Cliente acessa /orcamento/:osId
Pode marcar itens como:
- ✅ Aprovado
- ❌ Recusado (com motivo opcional)
- 🤔 Tenho dúvida (abre chat)

Sistema atualiza status em tempo real
Notifica oficina via toast/email
```

### 2. **Negociação de Preços**
```
Cliente pode:
- Solicitar desconto em item específico
- Propor valor alternativo

Gerente recebe notificação
Pode aceitar/recusar/contra-propor
```

### 3. **Pagamento Online**
```
Integração com gateway de pagamento
Cliente pode pagar sinal/total
Gera comprovante automático
```

### 4. **Histórico de Orçamentos**
```
Cliente vê todos os orçamentos anteriores
Pode comparar preços ao longo do tempo
Vê evolução do veículo (km, serviços)
```

### 5. **Recomendações Inteligentes**
```
IA analisa:
- Histórico do cliente
- Histórico do veículo
- Padrões de aprovação

Sugere:
- Itens com alta chance de aprovação
- Melhor momento para oferecer preventivos
- Preço ideal baseado no perfil do cliente
```

---

## 🎓 INSIGHTS PARA O TIME COMERCIAL

### Padrões de Comportamento:

1. **Cliente VIP (aprova tudo)**
   - Foco: Qualidade e confiança
   - Estratégia: Oferecer serviços premium, pacotes completos
   - Comunicação: Técnica, detalhada

2. **Cliente Econômico (aprova só urgente)**
   - Foco: Preço e necessidade
   - Estratégia: Enfatizar segurança, parcelar, descontos
   - Comunicação: Direta, objetiva

3. **Cliente Preventivo (aprova verdes)**
   - Foco: Manutenção e durabilidade
   - Estratégia: Pacotes de manutenção, planos anuais
   - Comunicação: Educativa, benefícios a longo prazo

### Gatilhos de Conversão:

- **Segurança:** "Risco para você e sua família"
- **Economia:** "Evite um problema maior e mais caro"
- **Conveniência:** "Já está aqui, aproveite"
- **Urgência:** "Precisa ser feito agora"
- **Social:** "Outros clientes com o mesmo carro fizeram"

---

## 📝 CHECKLIST DE IMPLEMENTAÇÃO BI/CRM

### Fase 1: Histórico de Dados ✅
- [x] Tabela `ordens_servico` com timestamps
- [x] Tabela `ordens_servico_itens` com status e prioridades
- [ ] Tabela `crm_cliente_history` (mudanças no perfil)
- [ ] Tabela `os_status_history` (mudanças de status)
- [ ] Triggers para popular histórico automaticamente

### Fase 2: Métricas Calculadas
- [ ] View `metricas_conversao` (taxa de aprovação)
- [ ] View `metricas_margens` (análise de margens)
- [ ] View `oportunidades_retorno` (itens recusados com data)
- [ ] View `clientes_segmentados` (VIP/Econômico/Preventivo)

### Fase 3: Dashboards
- [ ] Dashboard de Conversão
- [ ] Dashboard de Margens
- [ ] Dashboard de Oportunidades
- [ ] Dashboard de Performance

### Fase 4: Automações
- [ ] Campanha automática de retorno (itens recusados)
- [ ] Alerta de margem baixa
- [ ] Sugestão de upsell baseada em IA
- [ ] Relatório semanal para gestão

---

## 🎯 PRÓXIMOS PASSOS RECOMENDADOS

1. **Imediato:**
   - Criar tabelas de histórico
   - Implementar triggers
   - Criar views de métricas básicas

2. **Curto Prazo (1-2 semanas):**
   - Dashboard de conversão
   - Segmentação de clientes
   - Campanha de retorno manual

3. **Médio Prazo (1 mês):**
   - Aprovação online pelo cliente
   - Dashboards avançados
   - Automações de campanha

4. **Longo Prazo (3 meses):**
   - IA para recomendações
   - Negociação de preços online
   - Pagamento integrado

---

## 📌 NOTAS IMPORTANTES

- **Dados sensíveis:** Margens e custos NUNCA devem aparecer na visão do cliente
- **Performance:** Queries de métricas devem ser otimizadas (indexes, materialized views)
- **Privacidade:** Link público não deve expor dados de outros clientes
- **Auditoria:** Todas as mudanças de status/valores devem ser logadas
- **Backup:** Histórico de orçamentos é crítico para disputas/auditorias

---

**Documento criado em:** 2026-01-21
**Versão:** 1.0
**Autor:** Análise do sistema existente
**Status:** 📝 Rascunho para anotações
