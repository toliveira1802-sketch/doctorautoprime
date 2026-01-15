-- Tabela de Dashboards
CREATE TABLE public.gestao_dashboards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  descricao TEXT,
  icone TEXT DEFAULT 'LayoutDashboard',
  cor TEXT DEFAULT '#3b82f6',
  ordem INTEGER DEFAULT 0,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tipos de widget disponíveis
CREATE TYPE public.widget_type AS ENUM (
  'card_numero',
  'card_percentual',
  'grafico_linha',
  'grafico_barra',
  'grafico_pizza',
  'lista',
  'tabela',
  'gauge',
  'texto'
);

-- Tabela de Widgets/Indicadores
CREATE TABLE public.gestao_widgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dashboard_id UUID REFERENCES gestao_dashboards(id) ON DELETE CASCADE NOT NULL,
  titulo TEXT NOT NULL,
  tipo widget_type NOT NULL DEFAULT 'card_numero',
  tamanho TEXT DEFAULT 'md',
  cor TEXT,
  icone TEXT,
  ordem INTEGER DEFAULT 0,
  fonte_dados TEXT NOT NULL,
  query_config JSONB,
  valor_fixo TEXT,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela para dados manuais
CREATE TABLE public.gestao_dados_manuais (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  widget_id UUID REFERENCES gestao_widgets(id) ON DELETE CASCADE,
  chave TEXT NOT NULL,
  valor TEXT NOT NULL,
  data_referencia DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.gestao_dashboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gestao_widgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gestao_dados_manuais ENABLE ROW LEVEL SECURITY;

-- Policies usando has_admin_access() sem parâmetro
CREATE POLICY "Gestao dashboards - admin access" ON public.gestao_dashboards
  FOR ALL TO authenticated
  USING (has_admin_access());

CREATE POLICY "Gestao widgets - admin access" ON public.gestao_widgets
  FOR ALL TO authenticated
  USING (has_admin_access());

CREATE POLICY "Gestao dados manuais - admin access" ON public.gestao_dados_manuais
  FOR ALL TO authenticated
  USING (has_admin_access());

-- Índices
CREATE INDEX idx_widgets_dashboard ON gestao_widgets(dashboard_id);
CREATE INDEX idx_dados_widget ON gestao_dados_manuais(widget_id);

-- Triggers para updated_at
CREATE TRIGGER update_gestao_dashboards_updated_at
  BEFORE UPDATE ON gestao_dashboards
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_gestao_widgets_updated_at
  BEFORE UPDATE ON gestao_widgets
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();