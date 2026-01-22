# 📋 CHECKLIST - Sistema de IA Híbrida
**Doctor Auto Prime - Diagnósticos Inteligentes**

---

## ✅ **FASE 1: INFRAESTRUTURA (CONCLUÍDA)**

### Database
- [x] Tabela `diagnosticos_ia` criada
- [x] Tabela `sugestoes_ia` criada
- [x] Tabela `regras_automacao` criada
- [x] Função `buscar_diagnosticos_similares()` criada
- [x] Função `aplicar_regras_automacao()` criada
- [x] 4 regras padrão inseridas
- [x] 3 diagnósticos exemplo inseridos

---

## 📝 **FASE 2: PREENCHER BASE DE CONHECIMENTO**

### Diagnósticos para adicionar:
- [ ] **Freios** (10+ casos)
  - Barulho ao frear
  - Pedal mole
  - Pedal duro
  - Vibração ao frear
  - Freio puxando para um lado
  
- [ ] **Motor** (15+ casos)
  - Falhas em marcha lenta
  - Perda de potência
  - Superaquecimento
  - Consumo excessivo
  - Barulhos anormais
  
- [ ] **Suspensão** (10+ casos)
  - Barulhos em lombadas
  - Carro puxando para um lado
  - Desgaste irregular de pneus
  
- [ ] **Elétrica** (10+ casos)
  - Bateria descarregando
  - Luzes fracas
  - Problemas de partida
  
- [ ] **Ar Condicionado** (5+ casos)
  - Não gela
  - Barulho ao ligar
  - Cheiro ruim

### Como preencher:
```sql
INSERT INTO diagnosticos_ia (
  sintomas, categoria, diagnostico, solucao,
  pecas_necessarias, tempo_estimado_horas,
  prioridade_sugerida, validado, origem
) VALUES (
  'Descrição dos sintomas',
  'categoria',
  'Diagnóstico provável',
  'Solução recomendada',
  ARRAY['Peça 1', 'Peça 2'],
  2.5,
  'media',
  true,
  'manual'
);
```

---

## 🤖 **FASE 3: CONFIGURAR REGRAS AUTOMÁTICAS**

### Regras de Prioridade:
- [x] Cliente VIP → Alta
- [x] Tempo no pátio > 48h → Urgente
- [x] Valor > R$ 5000 → Alta
- [ ] Cliente recorrente → Média
- [ ] Garantia → Alta
- [ ] Revisão preventiva → Baixa

### Regras de Alertas:
- [x] Aguardando peças > 24h
- [ ] Em execução > 72h
- [ ] Orçamento pendente > 48h
- [ ] Aprovação pendente > 24h

### Como adicionar regras:
```sql
INSERT INTO regras_automacao (nome, descricao, tipo, condicoes, acoes, ordem_execucao)
VALUES (
  'Nome da Regra',
  'Descrição',
  'prioridade', -- ou 'alerta'
  '{"campo": "tags", "operador": "contains", "valor": "garantia"}'::jsonb,
  '{"campo": "prioridade", "valor": "alta"}'::jsonb,
  5
);
```

---

## 🎨 **FASE 4: INTERFACE (FUTURO)**

### Componentes a criar:
- [ ] Botão "Sugerir Diagnóstico" na OS
- [ ] Modal de sugestões da IA
- [ ] Feedback do mecânico (👍/👎)
- [ ] Histórico de sugestões
- [ ] Dashboard de efetividade da IA

### Hooks React:
- [ ] `useRegrasAutomacao()` - Aplica regras
- [ ] `useSugestaoIA()` - Busca sugestão
- [ ] `useDiagnosticos()` - Lista diagnósticos

---

## 🔗 **FASE 5: INTEGRAÇÃO COM IA**

### Modelos a configurar:
- [ ] **Ollama** (Local - Grátis)
  - Instalar Ollama no servidor
  - Baixar modelo Llama 3
  - Configurar endpoint
  
- [ ] **OpenAI** (Pago - Melhor qualidade)
  - Adicionar API key
  - Configurar modelo GPT-4
  
- [ ] **Gemini** (Pago - Barato)
  - Adicionar API key
  - Configurar modelo Gemini Pro
  
- [ ] **DeepSeek** (Pago - Muito barato)
  - Adicionar API key
  - Configurar modelo DeepSeek

### Serviços a criar:
- [ ] `/services/ai/ollama.ts`
- [ ] `/services/ai/openai.ts`
- [ ] `/services/ai/gemini.ts`
- [ ] `/services/ai/deepseek.ts`
- [ ] `/services/ai/rag.ts` (busca similaridade)

---

## 📊 **FASE 6: MONITORAMENTO**

### Métricas a acompanhar:
- [ ] Taxa de acerto das sugestões
- [ ] Tempo médio de resposta
- [ ] Diagnósticos mais usados
- [ ] Efetividade por categoria
- [ ] Feedback dos mecânicos

### Dashboards:
- [ ] Efetividade da IA
- [ ] Regras mais acionadas
- [ ] Diagnósticos mais comuns

---

## 🎯 **FUNCIONALIDADES FINAIS**

### O que a IA vai fazer:

#### 1. **Sugestão de Diagnóstico** (RAG + IA)
```
Mecânico descreve: "Barulho ao frear"
↓
Sistema busca casos similares no banco
↓
IA analisa e sugere: "Pastilhas gastas + disco empenado"
↓
Mecânico valida (👍/👎)
↓
Sistema aprende e melhora
```

#### 2. **Priorização Automática** (Regras)
```
Nova OS criada
↓
Sistema aplica regras automáticas
↓
Define prioridade (baixa/media/alta/urgente)
↓
Atualiza card no Pátio
```

#### 3. **Alertas Inteligentes** (Regras)
```
OS aguardando peças > 24h
↓
Sistema gera alerta
↓
Notifica responsável
```

#### 4. **Estimativas Automáticas** (IA + Histórico)
```
Diagnóstico confirmado
↓
IA sugere peças necessárias
↓
Calcula tempo estimado
↓
Estima custo
```

---

## 🚀 **PRÓXIMOS PASSOS IMEDIATOS**

1. ✅ **Infraestrutura criada** (FEITO!)
2. 📝 **Preencher base de conhecimento** (VOCÊ FAZ)
3. 🔗 **Integração Kommo** (PRÓXIMO!)
4. 🎨 **Interface** (DEPOIS)
5. 🤖 **Configurar IAs** (DEPOIS)

---

## 💡 **DICAS**

- Comece com 50-100 diagnósticos reais
- Valide com seus mecânicos
- Ajuste as regras conforme necessidade
- Monitore a efetividade
- Melhore continuamente

---

**Status Atual:** ✅ Infraestrutura 100% pronta!
**Próximo:** 🔗 Integração Kommo
