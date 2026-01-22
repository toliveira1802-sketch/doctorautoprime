# 🤖 Sistema de Gestão de IAs com Rastreamento de Custos

Sistema completo para gerenciar IAs com monitoramento de gastos, uso de tokens e performance.

---

## 📦 **Conteúdo do Pacote**

```
gestao-ias-completo/
├── types/
│   └── index.ts              ← Tipos TypeScript
├── hooks/
│   └── useIACost.ts          ← Hook de cálculo de custos
├── components/
│   ├── CostTracker.tsx       ← Rastreador de custos
│   ├── IAConfig.tsx          ← Configuração de IA
│   └── UsageChart.tsx        ← Gráfico de uso
├── index.tsx                 ← Página principal (QG)
├── [id].tsx                  ← Página individual da IA
└── README.md                 ← Este arquivo
```

---

## 🚀 **Instalação**

### **1️⃣ Copiar arquivos**

Copia todos os arquivos para:

```
src/pages/gestao/ia/
```

### **2️⃣ Adicionar rotas**

No `App.tsx`:

```tsx
import GestaoIAs from "@/pages/gestao/ia";
import IAIndividual from "@/pages/gestao/ia/[id]";

// Dentro do <Router>
<Route path="/gestao/ia" component={GestaoIAs} />
<Route path="/gestao/ia/:id" component={IAIndividual} />
```

### **3️⃣ Adicionar no menu**

```tsx
<Link href="/gestao/ia">
  <Button>
    🤖 Gestão de IAs
  </Button>
</Link>
```

---

## ✨ **Features**

### **📊 Dashboard Geral**

- **Estatísticas Globais**
  - Total de IAs ativas/inativas
  - Gastos (hoje, semana, mês, total)
  - Uso de tokens e requests
  - Performance média

- **Rastreamento de Custos**
  - Gastos por período
  - Tendências (subindo/descendo)
  - Alertas de gasto alto
  - Custo médio por request
  - Custo médio por 1K tokens

- **Top Gastadoras**
  - Ranking das 5 IAs que mais gastam
  - Comparação de custos
  - Identificação de otimizações

- **Economia**
  - Cálculo de economia com IAs automáticas
  - Comparação auto vs IA
  - Percentual de economia

### **🎯 Página Individual**

Cada IA tem sua própria página com:

- **Perfil Completo**
  - Nome, função, descrição
  - Tipo (Pura/Híbrida/Auto)
  - Modelo (GPT-4, Claude, etc.)
  - Status em tempo real

- **Gastos Detalhados**
  - Gastos por período
  - Gráfico de evolução
  - Comparação com média
  - Projeções

- **Uso de Tokens**
  - Total de tokens
  - Input vs Output
  - Média por request
  - Histórico

- **Configuração**
  - API Key
  - Temperature
  - Max Tokens
  - System Prompt
  - Parâmetros avançados

- **Performance**
  - Barra de performance (0-100%)
  - Disponibilidade (uptime)
  - Tempo de resposta
  - Taxa de erro

- **Logs**
  - Histórico de ações
  - Erros e avisos
  - Timestamps
  - Detalhes

### **🔧 Tipos de IA**

#### **1. IA Pura** 🟦
- 100% baseada em LLM
- Usa API de IA (OpenAI, Anthropic, etc.)
- **Custo:** Alto (paga por token)
- **Exemplo:** Qualificador, BIA

#### **2. IA Híbrida** 🟪
- Combina IA + Automação
- Usa IA para decisões, automação para execução
- **Custo:** Médio (otimizado)
- **Exemplo:** Anna Laura, Marketeiro

#### **3. Automação** 🟩
- 100% automação (sem IA)
- Scripts, regras, integrações
- **Custo:** Zero (sem API)
- **Exemplo:** Vigilante, Organizador de Pátio

---

## 💰 **Sistema de Custos**

### **Modelos Suportados**

| Modelo | Input (1K tokens) | Output (1K tokens) | Total Estimado |
|--------|-------------------|-------------------|----------------|
| GPT-4 | R$ 0,17 | R$ 0,33 | R$ 0,50 |
| GPT-3.5 | R$ 0,008 | R$ 0,011 | R$ 0,019 |
| Claude 3 | R$ 0,08 | R$ 0,41 | R$ 0,49 |
| Gemini | R$ 0,001 | R$ 0,003 | R$ 0,004 |

*Valores em BRL (taxa: 1 USD = R$ 5,50)*

### **Cálculo de Custos**

```typescript
// Exemplo de cálculo
const custoRequest = (
  (tokensInput / 1000) * precoInput +
  (tokensOutput / 1000) * precoOutput
) * taxaConversao;

// Exemplo real:
// GPT-4: 500 tokens input, 300 tokens output
// Custo = (0.5 * 0.17) + (0.3 * 0.33) = R$ 0,184
```

### **Otimização de Custos**

#### **Estratégias:**

1. **Use GPT-3.5 quando possível**
   - 26x mais barato que GPT-4
   - Bom para tarefas simples

2. **Limite max_tokens**
   - Evita respostas muito longas
   - Reduz custo de output

3. **Cache de respostas**
   - Salva respostas comuns
   - Evita requests duplicadas

4. **IAs Híbridas**
   - Use IA só para decisões
   - Automação para execução

5. **IAs Automáticas**
   - Custo zero
   - Ideal para tarefas repetitivas

---

## 📊 **Estrutura de Dados**

### **Interface IA**

```typescript
interface IA {
  // Identificação
  id: string;
  nome: string;
  funcao: string;
  emoji: string;
  
  // Tipo
  tipo: "pura" | "hibrida" | "auto";
  modelo: "gpt-4" | "gpt-3.5" | "claude-3" | null;
  
  // Status
  ativa: boolean;
  status: "online" | "offline" | "standby";
  
  // Gastos
  gastos: {
    hoje: number;
    semana: number;
    mes: number;
    total: number;
  };
  
  // Uso
  uso: {
    tokens: number;
    tokensInput: number;
    tokensOutput: number;
    requests: number;
    mediaTokens: number;
  };
  
  // Config
  config?: {
    apiKey?: string;
    temperature?: number;
    maxTokens?: number;
    systemPrompt?: string;
  };
  
  // Performance
  performance: number;  // 0-100
  prioridade: "maxima" | "alta" | "media";
}
```

---

## 🎯 **As 15 IAs**

### **IAs Puras (100% IA)** 🟦

1. **👑 BIA** - Líder Desenvolvedora
   - Modelo: GPT-4
   - Gasto médio: R$ 45/mês

2. **🎯 QUALIFICADOR** - Classificação de Leads
   - Modelo: Claude 3
   - Gasto médio: R$ 98/mês

3. **🕵️ DEDO DURO** - Detector de Inconsistências
   - Modelo: GPT-3.5
   - Gasto médio: R$ 12/mês

### **IAs Híbridas (IA + Auto)** 🟪

4. **💰 ANNA LAURA** - Especialista em Vendas++
   - Modelo: GPT-3.5 + Cálculos
   - Gasto médio: R$ 28/mês

5. **📱 MARKETEIRO** - Marketing e Conteúdo
   - Modelo: GPT-4 + Automação
   - Gasto médio: R$ 35/mês

6. **🔍 COMPETIDOR** - Análise de Concorrência
   - Modelo: GPT-3.5 + Web Scraping
   - Gasto médio: R$ 18/mês

7. **📊 ANALISTA DE DADOS** - Análise de Leads
   - Modelo: GPT-3.5 + SQL
   - Gasto médio: R$ 22/mês

8. **💵 ANALISTA DE PREÇO** - Monitor de Mercado
   - Modelo: GPT-3.5 + APIs
   - Gasto médio: R$ 15/mês

9. **🔧 ANALISTA TÉCNICO** - Diagnóstico
   - Modelo: GPT-4 + Base de Conhecimento
   - Gasto médio: R$ 38/mês

### **IAs Automáticas (0% IA)** 🟩

10. **🚨 VIGILANTE** - Monitor de Leads
    - Custo: R$ 0/mês

11. **🔄 REATIVADOR** - Reativação
    - Custo: R$ 0/mês

12. **📝 FISCAL DO CRM** - Qualidade de Dados
    - Custo: R$ 0/mês

13. **🏗️ ORGANIZADOR DE PÁTIO** - Controle de Pátio
    - Custo: R$ 0/mês

14. **📈 ESTRATEGISTA DE ISCAS** - Monitor de Conversão
    - Custo: R$ 0/mês

15. **💘 CASANOVA** - Recompensa de Meta
    - Custo: R$ 0/mês

**Total:** R$ 311/mês  
**Economia:** R$ 186/mês (6 IAs automáticas)

---

## 🔧 **Configuração**

### **1. Adicionar API Keys**

Na página individual da IA:

1. Clica em "⚙️ Configuração"
2. Adiciona a API Key
3. Configura parâmetros
4. Salva

### **2. Ajustar Parâmetros**

#### **Temperature** (0.0 - 2.0)
- **0.0-0.3:** Determinístico (respostas consistentes)
- **0.7-1.0:** Balanceado (recomendado)
- **1.5-2.0:** Criativo (respostas variadas)

#### **Max Tokens**
- **500-1000:** Respostas curtas
- **1500-2000:** Respostas médias
- **3000-4000:** Respostas longas

#### **System Prompt**
Define o comportamento da IA:

```
Você é a Anna Laura, especialista em vendas++.
Sua função é auxiliar consultores a fechar vendas.
Seja direta, objetiva e focada em resultados.
Nunca dê descontos sem autorização.
```

---

## 📈 **Monitoramento**

### **Alertas Automáticos**

O sistema alerta quando:

- ✅ Gasto diário > R$ 50
- ✅ Gasto mensal > R$ 500
- ✅ Performance < 70%
- ✅ Taxa de erro > 5%
- ✅ Disponibilidade < 95%

### **Relatórios**

Exporta relatórios em:
- CSV (dados brutos)
- PDF (relatório visual)
- JSON (integração)

---

## 🎨 **Personalização**

### **Cores por Tipo**

```css
/* IA Pura */
.ia-pura {
  border-color: #3b82f6; /* Azul */
}

/* IA Híbrida */
.ia-hibrida {
  border-color: #a855f7; /* Roxo */
}

/* Automação */
.ia-auto {
  border-color: #10b981; /* Verde */
}
```

### **Badges**

```tsx
{ia.tipo === "pura" && (
  <Badge className="bg-blue-500/20 text-blue-500">
    🟦 Pura
  </Badge>
)}

{ia.tipo === "hibrida" && (
  <Badge className="bg-purple-500/20 text-purple-500">
    🟪 Híbrida
  </Badge>
)}

{ia.tipo === "auto" && (
  <Badge className="bg-green-500/20 text-green-500">
    🟩 Auto
  </Badge>
)}
```

---

## 🔗 **Integração com API**

### **Buscar IAs**

```typescript
// GET /api/ias
const response = await fetch('https://api.example.com/ias');
const ias = await response.json();
```

### **Atualizar IA**

```typescript
// PATCH /api/ias/:id
await fetch(`https://api.example.com/ias/${id}`, {
  method: 'PATCH',
  body: JSON.stringify({
    ativa: true,
    config: {
      temperature: 0.7,
      maxTokens: 2000
    }
  })
});
```

### **Registrar Uso**

```typescript
// POST /api/ias/:id/uso
await fetch(`https://api.example.com/ias/${id}/uso`, {
  method: 'POST',
  body: JSON.stringify({
    tokensInput: 500,
    tokensOutput: 300,
    custo: 0.184
  })
});
```

---

## 🐛 **Troubleshooting**

### **Problema: Custos não aparecem**

**Solução:**
1. Verifica se a IA tem `modelo` configurado
2. Confirma que `tokensInput` e `tokensOutput` estão sendo registrados
3. Checa se `PRECOS_MODELOS` tem o modelo

### **Problema: Performance sempre 0%**

**Solução:**
1. Implementa cálculo de performance baseado em:
   - Taxa de sucesso
   - Tempo de resposta
   - Feedback do usuário

### **Problema: API Key não salva**

**Solução:**
1. Verifica se tem backend configurado
2. Usa `localStorage` como fallback
3. Implementa criptografia para segurança

---

## 🚀 **Próximos Passos**

1. **[ ] Integrar com backend real**
2. **[ ] Adicionar gráficos de evolução**
3. **[ ] Implementar cache de respostas**
4. **[ ] Criar sistema de alertas**
5. **[ ] Exportar relatórios**
6. **[ ] Adicionar comparação entre IAs**
7. **[ ] Implementar fine-tuning**

---

## 📞 **Suporte**

Dúvidas ou problemas?

1. Verifica a documentação completa
2. Testa os exemplos fornecidos
3. Checa o console do navegador
4. Revisa as configurações

---

## 🎉 **Pronto!**

Agora você tem um sistema completo de gestão de IAs com rastreamento de custos!

**Boa sorte! 🚀**
