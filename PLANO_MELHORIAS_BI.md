# 📊 Plano de Melhorias - Dashboards de BI

## 🎯 Objetivo
Transformar os dashboards de BI de **mockups estáticos** para **painéis dinâmicos com dados reais** do Supabase, criando insights acionáveis para tomada de decisão.

---

## 📋 Status Atual

### ✅ **O que já existe:**
- ✅ 3 Dashboards criados (Overview, Conversão, Margens)
- ✅ UI/UX premium e responsiva
- ✅ Estrutura de navegação funcionando
- ✅ Dados mockados (hardcoded)

### ❌ **O que falta:**
- ❌ Conexão com dados reais do Supabase
- ❌ Queries otimizadas e views SQL
- ❌ Filtros por período (dia, semana, mês, ano)
- ❌ Filtros por empresa (multi-company)
- ❌ Gráficos interativos (recharts)
- ❌ Exportação de relatórios (PDF/Excel)
- ❌ Dashboards adicionais (4 faltando)

---

## 🚀 Fases de Implementação

### **FASE 1: Infraestrutura de Dados** (Prioridade ALTA)
**Objetivo**: Criar views SQL otimizadas para alimentar os dashboards

#### 1.1 - Criar Views Analíticas
```sql
-- View: Métricas Gerais
CREATE OR REPLACE VIEW bi_metricas_gerais AS
SELECT 
  company_id,
  DATE_TRUNC('month', created_at) as mes,
  COUNT(*) as total_os,
  COUNT(*) FILTER (WHERE status = 'concluido') as os_concluidas,
  COUNT(*) FILTER (WHERE status IN ('orcamento_enviado', 'aguardando_aprovacao')) as os_pendentes,
  SUM(valor_total) as faturamento_total,
  AVG(valor_total) as ticket_medio,
  SUM(valor_total) FILTER (WHERE status = 'concluido') as faturamento_realizado
FROM ordens_servico
GROUP BY company_id, DATE_TRUNC('month', created_at);

-- View: Conversão de Orçamentos
CREATE OR REPLACE VIEW bi_conversao_orcamentos AS
SELECT 
  company_id,
  DATE_TRUNC('month', created_at) as mes,
  COUNT(*) FILTER (WHERE status IN ('orcamento_enviado', 'aguardando_aprovacao', 'aprovado', 'em_execucao', 'concluido')) as total_orcamentos,
  COUNT(*) FILTER (WHERE status IN ('aprovado', 'em_execucao', 'concluido')) as orcamentos_aprovados,
  COUNT(*) FILTER (WHERE status = 'recusado') as orcamentos_recusados,
  ROUND(
    (COUNT(*) FILTER (WHERE status IN ('aprovado', 'em_execucao', 'concluido'))::DECIMAL / 
     NULLIF(COUNT(*) FILTER (WHERE status IN ('orcamento_enviado', 'aguardando_aprovacao', 'aprovado', 'em_execucao', 'concluido')), 0)) * 100, 
    2
  ) as taxa_conversao_percent,
  AVG(EXTRACT(EPOCH FROM (updated_at - created_at)) / 3600) FILTER (WHERE status IN ('aprovado', 'em_execucao', 'concluido')) as tempo_medio_aprovacao_horas
FROM ordens_servico
GROUP BY company_id, DATE_TRUNC('month', created_at);

-- View: Análise de Margens
CREATE OR REPLACE VIEW bi_analise_margens AS
SELECT 
  os.company_id,
  DATE_TRUNC('month', os.created_at) as mes,
  SUM(osi.quantidade * osi.preco_unitario) as receita_bruta,
  SUM(osi.quantidade * osi.custo_unitario) as custo_total,
  SUM((osi.preco_unitario - osi.custo_unitario) * osi.quantidade) as lucro_bruto,
  ROUND(
    (SUM((osi.preco_unitario - osi.custo_unitario) * osi.quantidade) / 
     NULLIF(SUM(osi.quantidade * osi.preco_unitario), 0)) * 100,
    2
  ) as margem_percent,
  SUM(os.desconto_valor) as total_descontos,
  COUNT(DISTINCT os.id) as total_os
FROM ordens_servico os
INNER JOIN os_items osi ON osi.os_id = os.id
WHERE os.status = 'concluido'
GROUP BY os.company_id, DATE_TRUNC('month', os.created_at);

-- View: Segmentação de Clientes
CREATE OR REPLACE VIEW bi_segmentacao_clientes AS
SELECT 
  p.company_id,
  p.id as cliente_id,
  p.nome,
  COUNT(os.id) as total_os,
  SUM(os.valor_total) as valor_total_gasto,
  AVG(os.valor_total) as ticket_medio,
  MAX(os.created_at) as ultima_os,
  MIN(os.created_at) as primeira_os,
  EXTRACT(DAYS FROM (NOW() - MAX(os.created_at))) as dias_desde_ultima_os,
  CASE 
    WHEN SUM(os.valor_total) > 10000 THEN 'VIP'
    WHEN SUM(os.valor_total) > 5000 THEN 'Premium'
    WHEN SUM(os.valor_total) > 2000 THEN 'Regular'
    ELSE 'Novo'
  END as segmento,
  CASE
    WHEN EXTRACT(DAYS FROM (NOW() - MAX(os.created_at))) < 30 THEN 'Ativo'
    WHEN EXTRACT(DAYS FROM (NOW() - MAX(os.created_at))) < 90 THEN 'Em Risco'
    ELSE 'Inativo'
  END as status_cliente
FROM profiles p
LEFT JOIN ordens_servico os ON os.cliente_id = p.id
GROUP BY p.company_id, p.id, p.nome;

-- View: Performance por Mecânico
CREATE OR REPLACE VIEW bi_performance_mecanicos AS
SELECT 
  m.company_id,
  m.id as mecanico_id,
  m.nome as mecanico_nome,
  DATE_TRUNC('month', os.created_at) as mes,
  COUNT(os.id) as total_os,
  COUNT(*) FILTER (WHERE os.status = 'concluido') as os_concluidas,
  AVG(EXTRACT(EPOCH FROM (os.updated_at - os.created_at)) / 86400) FILTER (WHERE os.status = 'concluido') as tempo_medio_dias,
  SUM(os.valor_total) FILTER (WHERE os.status = 'concluido') as faturamento_gerado,
  ROUND(
    (COUNT(*) FILTER (WHERE os.status = 'concluido')::DECIMAL / NULLIF(COUNT(os.id), 0)) * 100,
    2
  ) as taxa_conclusao_percent
FROM mechanics m
LEFT JOIN ordens_servico os ON os.mecanico_responsavel_id = m.id
GROUP BY m.company_id, m.id, m.nome, DATE_TRUNC('month', os.created_at);

-- View: Análise de Serviços
CREATE OR REPLACE VIEW bi_analise_servicos AS
SELECT 
  s.company_id,
  s.id as servico_id,
  s.nome as servico_nome,
  s.categoria,
  DATE_TRUNC('month', osi.created_at) as mes,
  COUNT(osi.id) as quantidade_vendida,
  SUM(osi.quantidade * osi.preco_unitario) as receita_total,
  AVG(osi.preco_unitario) as preco_medio,
  SUM((osi.preco_unitario - osi.custo_unitario) * osi.quantidade) as lucro_total,
  ROUND(
    (SUM((osi.preco_unitario - osi.custo_unitario) * osi.quantidade) / 
     NULLIF(SUM(osi.quantidade * osi.preco_unitario), 0)) * 100,
    2
  ) as margem_percent
FROM services s
INNER JOIN os_items osi ON osi.servico_id = s.id
GROUP BY s.company_id, s.id, s.nome, s.categoria, DATE_TRUNC('month', osi.created_at);

-- View: Oportunidades de Retorno
CREATE OR REPLACE VIEW bi_oportunidades_retorno AS
SELECT 
  company_id,
  cliente_id,
  cliente_nome,
  SUM(valor_recusado) as valor_total_oportunidades,
  COUNT(*) as total_itens_recusados,
  MAX(data_recusa) as ultima_recusa,
  EXTRACT(DAYS FROM (NOW() - MAX(data_recusa))) as dias_desde_recusa,
  ARRAY_AGG(DISTINCT servico_nome) as servicos_recusados
FROM (
  SELECT 
    os.company_id,
    os.cliente_id,
    p.nome as cliente_nome,
    osi.preco_unitario * osi.quantidade as valor_recusado,
    os.updated_at as data_recusa,
    s.nome as servico_nome
  FROM ordens_servico os
  INNER JOIN os_items osi ON osi.os_id = os.id
  INNER JOIN profiles p ON p.id = os.cliente_id
  LEFT JOIN services s ON s.id = osi.servico_id
  WHERE os.status = 'recusado'
    OR osi.status = 'recusado'
) sub
GROUP BY company_id, cliente_id, cliente_nome;
```

#### 1.2 - Criar Migration
**Arquivo**: `supabase/migrations/20260124000000_bi_views.sql`

#### 1.3 - Aplicar RLS nas Views
```sql
-- Garantir que as views respeitam company_id
ALTER VIEW bi_metricas_gerais SET (security_invoker = true);
ALTER VIEW bi_conversao_orcamentos SET (security_invoker = true);
ALTER VIEW bi_analise_margens SET (security_invoker = true);
ALTER VIEW bi_segmentacao_clientes SET (security_invoker = true);
ALTER VIEW bi_performance_mecanicos SET (security_invoker = true);
ALTER VIEW bi_analise_servicos SET (security_invoker = true);
ALTER VIEW bi_oportunidades_retorno SET (security_invoker = true);
```

---

### **FASE 2: Hooks e Queries React** (Prioridade ALTA)
**Objetivo**: Criar hooks customizados para buscar dados das views

#### 2.1 - Hook: `useBIMetrics`
**Arquivo**: `src/hooks/useBIMetrics.ts`

```typescript
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCompany } from '@/contexts/CompanyContext';

export type PeriodoFiltro = 'dia' | 'semana' | 'mes' | 'trimestre' | 'ano' | 'all';

export function useBIMetrics(periodo: PeriodoFiltro = 'mes') {
  const { selectedCompany } = useCompany();

  return useQuery({
    queryKey: ['bi-metrics', selectedCompany, periodo],
    queryFn: async () => {
      let query = supabase
        .from('bi_metricas_gerais')
        .select('*');

      // Filtrar por empresa (ou GERAL = todas)
      if (selectedCompany !== 'GERAL') {
        query = query.eq('company_id', selectedCompany);
      }

      // Filtrar por período
      const now = new Date();
      let dataInicio: Date;

      switch (periodo) {
        case 'dia':
          dataInicio = new Date(now.setDate(now.getDate() - 1));
          break;
        case 'semana':
          dataInicio = new Date(now.setDate(now.getDate() - 7));
          break;
        case 'mes':
          dataInicio = new Date(now.setMonth(now.getMonth() - 1));
          break;
        case 'trimestre':
          dataInicio = new Date(now.setMonth(now.getMonth() - 3));
          break;
        case 'ano':
          dataInicio = new Date(now.setFullYear(now.getFullYear() - 1));
          break;
        default:
          dataInicio = new Date(0); // All time
      }

      if (periodo !== 'all') {
        query = query.gte('mes', dataInicio.toISOString());
      }

      const { data, error } = await query.order('mes', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!selectedCompany,
  });
}
```

#### 2.2 - Hooks Adicionais
- `useBIConversao` - Dados de conversão
- `useBIMargens` - Análise de margens
- `useBIClientes` - Segmentação de clientes
- `useBIMecanicos` - Performance de mecânicos
- `useBIServicos` - Análise de serviços
- `useBIOportunidades` - Oportunidades de retorno

---

### **FASE 3: Componentes de Gráficos** (Prioridade MÉDIA)
**Objetivo**: Criar componentes reutilizáveis com Recharts

#### 3.1 - Instalar Recharts
```bash
npm install recharts
```

#### 3.2 - Componentes Base
**Arquivo**: `src/components/bi/charts/`

- `LineChart.tsx` - Gráfico de linha (tendências)
- `BarChart.tsx` - Gráfico de barras (comparações)
- `PieChart.tsx` - Gráfico de pizza (distribuições)
- `AreaChart.tsx` - Gráfico de área (volumes)
- `MetricCard.tsx` - Card de métrica com comparação

#### 3.3 - Exemplo: MetricCard
```typescript
interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number; // Percentual de mudança
  icon: React.ReactNode;
  color: string;
  loading?: boolean;
}

export function MetricCard({ title, value, change, icon, color, loading }: MetricCardProps) {
  const isPositive = change && change > 0;
  
  return (
    <Card className={`bg-gradient-to-br ${color}/10 border-${color}/20`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {title}
          </CardTitle>
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-8 w-24" />
        ) : (
          <>
            <div className="text-2xl font-bold text-foreground">{value}</div>
            {change !== undefined && (
              <p className={`text-xs mt-1 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {isPositive ? '↑' : '↓'} {Math.abs(change)}% vs período anterior
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
```

---

### **FASE 4: Atualizar Dashboards Existentes** (Prioridade ALTA)
**Objetivo**: Substituir dados mockados por dados reais

#### 4.1 - BIOverview.tsx
**Mudanças**:
- ✅ Usar `useBIMetrics()` para métricas gerais
- ✅ Adicionar filtro de período (dropdown)
- ✅ Adicionar filtro de empresa (se GERAL)
- ✅ Mostrar loading states
- ✅ Adicionar gráfico de tendência (últimos 6 meses)

#### 4.2 - BIConversao.tsx
**Mudanças**:
- ✅ Usar `useBIConversao()` para dados de conversão
- ✅ Gráfico de funil de vendas
- ✅ Gráfico de linha: taxa de conversão ao longo do tempo
- ✅ Tabela: OSs pendentes de aprovação
- ✅ Tempo médio de aprovação

#### 4.3 - BIMargens.tsx
**Mudanças**:
- ✅ Usar `useBIMargens()` para análise de margens
- ✅ Gráfico de barras: margem por categoria de serviço
- ✅ Gráfico de pizza: distribuição de custos
- ✅ Alerta: serviços com margem abaixo de 20%
- ✅ Comparação: margem atual vs meta

---

### **FASE 5: Criar Novos Dashboards** (Prioridade MÉDIA)

#### 5.1 - BIOportunidades.tsx
**Rota**: `/gestao/bi/oportunidades`

**Conteúdo**:
- 📊 Valor total em oportunidades (orçamentos recusados)
- 📋 Lista de clientes para follow-up
- 📈 Gráfico: principais motivos de recusa
- 🎯 Campanhas sugeridas (ex: desconto em serviços recusados)
- 📧 Botão: "Enviar campanha de retorno"

#### 5.2 - BIClientes.tsx
**Rota**: `/gestao/bi/clientes`

**Conteúdo**:
- 👥 Segmentação: VIP, Premium, Regular, Novo
- 📊 Gráfico de pizza: distribuição por segmento
- 📈 Taxa de retorno (clientes que voltam)
- ⏰ Tempo médio entre OSs
- 🚨 Alerta: clientes em risco (>90 dias sem OS)
- 📋 Tabela: Top 20 clientes (por valor)

#### 5.3 - BIMecanicos.tsx (NOVO)
**Rota**: `/gestao/bi/mecanicos`

**Conteúdo**:
- 🏆 Ranking de mecânicos (por faturamento)
- ⏱️ Tempo médio de execução por mecânico
- ✅ Taxa de conclusão
- 📊 Gráfico: OSs por mecânico (últimos 3 meses)
- 💰 Faturamento gerado por mecânico

#### 5.4 - BIServicos.tsx (NOVO)
**Rota**: `/gestao/bi/servicos`

**Conteúdo**:
- 🔝 Top 10 serviços mais vendidos
- 💰 Serviços mais lucrativos
- 📉 Serviços com baixa margem
- 📊 Gráfico: evolução de vendas por categoria
- 🎯 Sugestões de promoções (serviços com baixa demanda)

#### 5.5 - BIOperacional.tsx (NOVO)
**Rota**: `/gestao/bi/operacional`

**Conteúdo**:
- ⏱️ Tempo médio por etapa do workflow
- 🚧 Gargalos identificados (etapas com maior tempo)
- 📊 Gráfico Kanban: distribuição de OSs por status
- 📈 Produtividade: OSs concluídas por dia
- 🎯 Meta vs Realizado

#### 5.6 - BIFinanceiro.tsx (NOVO)
**Rota**: `/gestao/bi/financeiro`

**Conteúdo**:
- 💰 Faturamento: Realizado vs Previsto
- 📊 Gráfico de área: receita mensal (12 meses)
- 💳 Formas de pagamento mais usadas
- 📉 Inadimplência (OSs não pagas)
- 🎯 Projeção de faturamento (próximo mês)

---

### **FASE 6: Filtros Avançados** (Prioridade BAIXA)

#### 6.1 - Componente: `BIFilters`
**Arquivo**: `src/components/bi/BIFilters.tsx`

**Funcionalidades**:
- 📅 Filtro de período (dia, semana, mês, trimestre, ano, customizado)
- 🏢 Filtro de empresa (multi-company)
- 👤 Filtro de mecânico
- 📦 Filtro de categoria de serviço
- 🔄 Comparação com período anterior
- 💾 Salvar filtros favoritos

#### 6.2 - Persistência de Filtros
```typescript
// localStorage para lembrar filtros do usuário
const [filters, setFilters] = useLocalStorage('bi-filters', {
  periodo: 'mes',
  company: 'GERAL',
  comparar: true,
});
```

---

### **FASE 7: Exportação de Relatórios** (Prioridade BAIXA)

#### 7.1 - Exportar para PDF
**Biblioteca**: `jspdf` + `html2canvas`

```typescript
async function exportarPDF(dashboardRef: React.RefObject<HTMLDivElement>) {
  const canvas = await html2canvas(dashboardRef.current!);
  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF('p', 'mm', 'a4');
  pdf.addImage(imgData, 'PNG', 10, 10, 190, 0);
  pdf.save(`relatorio-bi-${new Date().toISOString()}.pdf`);
}
```

#### 7.2 - Exportar para Excel
**Biblioteca**: `xlsx`

```typescript
function exportarExcel(data: any[], filename: string) {
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Relatório');
  XLSX.writeFile(wb, `${filename}.xlsx`);
}
```

---

## 📅 Cronograma Estimado

| Fase | Descrição | Esforço | Prioridade | Prazo |
|------|-----------|---------|------------|-------|
| 1 | Infraestrutura de Dados (Views SQL) | 4-6h | 🔥 Alta | 1-2 dias |
| 2 | Hooks e Queries React | 3-4h | 🔥 Alta | 1 dia |
| 3 | Componentes de Gráficos | 4-6h | 🟡 Média | 1-2 dias |
| 4 | Atualizar Dashboards Existentes | 6-8h | 🔥 Alta | 2-3 dias |
| 5 | Criar Novos Dashboards (6 novos) | 12-16h | 🟡 Média | 3-5 dias |
| 6 | Filtros Avançados | 3-4h | 🟢 Baixa | 1 dia |
| 7 | Exportação de Relatórios | 2-3h | 🟢 Baixa | 1 dia |

**Total Estimado**: 34-47 horas (~1-2 semanas de trabalho focado)

---

## 🎯 Priorização Recomendada

### **Sprint 1 (Semana 1)**: MVP Funcional
1. ✅ Criar views SQL (Fase 1)
2. ✅ Criar hooks React (Fase 2)
3. ✅ Atualizar BIOverview com dados reais (Fase 4.1)
4. ✅ Atualizar BIConversao com dados reais (Fase 4.2)

**Resultado**: 2 dashboards funcionando com dados reais

### **Sprint 2 (Semana 2)**: Expansão
1. ✅ Atualizar BIMargens com dados reais (Fase 4.3)
2. ✅ Criar componentes de gráficos (Fase 3)
3. ✅ Criar BIOportunidades (Fase 5.1)
4. ✅ Criar BIClientes (Fase 5.2)

**Resultado**: 5 dashboards funcionando + biblioteca de gráficos

### **Sprint 3 (Opcional)**: Refinamento
1. ✅ Criar dashboards restantes (Fase 5.3-5.6)
2. ✅ Implementar filtros avançados (Fase 6)
3. ✅ Adicionar exportação (Fase 7)

**Resultado**: Sistema completo de BI

---

## 🛠️ Tecnologias Utilizadas

- **Frontend**: React + TypeScript
- **Gráficos**: Recharts
- **Queries**: TanStack Query (React Query)
- **Database**: Supabase (PostgreSQL)
- **Exportação**: jsPDF + xlsx
- **UI**: shadcn/ui + Tailwind CSS

---

## 📊 Métricas de Sucesso

Após implementação, os dashboards devem fornecer:

1. ✅ **Visibilidade em Tempo Real**: Dados atualizados automaticamente
2. ✅ **Insights Acionáveis**: Identificar oportunidades e problemas
3. ✅ **Comparações**: Período atual vs anterior
4. ✅ **Segmentação**: Por empresa, mecânico, categoria
5. ✅ **Performance**: Queries < 2s, UI responsiva
6. ✅ **Usabilidade**: Filtros intuitivos, exportação fácil

---

## 🚀 Próximos Passos

**Você quer:**

1. **Começar pela Fase 1** (criar views SQL)?
2. **Ver um protótipo** de como ficaria um dashboard com dados reais?
3. **Priorizar um dashboard específico** (qual)?
4. **Ajustar o plano** antes de começar?

**Me diga como prefere seguir e começamos a implementar! 🎯**
