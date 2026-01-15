-- Tabela principal de Ordens de Serviço
CREATE TABLE public.ordens_servico (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  numero_os TEXT NOT NULL,
  plate TEXT NOT NULL,
  vehicle TEXT NOT NULL,
  client_name TEXT,
  client_phone TEXT,
  
  -- Status da OS
  status TEXT NOT NULL DEFAULT 'orcamento', -- orcamento, aprovado, parcial, recusado, em_execucao, concluido, entregue
  
  -- Datas importantes
  data_entrada TIMESTAMP WITH TIME ZONE DEFAULT now(),
  data_orcamento TIMESTAMP WITH TIME ZONE,
  data_aprovacao TIMESTAMP WITH TIME ZONE,
  data_conclusao TIMESTAMP WITH TIME ZONE,
  data_entrega TIMESTAMP WITH TIME ZONE,
  
  -- Valores
  valor_orcado NUMERIC DEFAULT 0,
  valor_aprovado NUMERIC DEFAULT 0,
  valor_final NUMERIC DEFAULT 0,
  
  -- Descrições
  descricao_problema TEXT,
  diagnostico TEXT,
  observacoes TEXT,
  motivo_recusa TEXT,
  
  -- Referências
  trello_card_id TEXT,
  trello_card_url TEXT,
  appointment_id UUID,
  mechanic_id UUID,
  
  -- Auditoria
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Tabela de itens da OS (serviços/peças)
CREATE TABLE public.ordens_servico_itens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ordem_servico_id UUID NOT NULL REFERENCES public.ordens_servico(id) ON DELETE CASCADE,
  descricao TEXT NOT NULL,
  tipo TEXT NOT NULL DEFAULT 'servico', -- servico, peca
  quantidade INTEGER DEFAULT 1,
  valor_unitario NUMERIC DEFAULT 0,
  valor_total NUMERIC DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pendente', -- pendente, aprovado, recusado
  motivo_recusa TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Índices para busca rápida
CREATE INDEX idx_ordens_servico_plate ON public.ordens_servico(plate);
CREATE INDEX idx_ordens_servico_client ON public.ordens_servico(client_name);
CREATE INDEX idx_ordens_servico_status ON public.ordens_servico(status);
CREATE INDEX idx_ordens_servico_data_entrada ON public.ordens_servico(data_entrada DESC);
CREATE INDEX idx_ordens_servico_numero ON public.ordens_servico(numero_os);

-- Função para gerar número da OS automaticamente
CREATE OR REPLACE FUNCTION public.generate_os_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.numero_os := 'OS-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(NEXTVAL('public.os_sequence')::TEXT, 4, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Sequence para número da OS
CREATE SEQUENCE public.os_sequence START 1;

-- Trigger para gerar número automaticamente
CREATE TRIGGER trigger_generate_os_number
  BEFORE INSERT ON public.ordens_servico
  FOR EACH ROW
  WHEN (NEW.numero_os IS NULL OR NEW.numero_os = '')
  EXECUTE FUNCTION public.generate_os_number();

-- Trigger para atualizar updated_at
CREATE TRIGGER update_ordens_servico_updated_at
  BEFORE UPDATE ON public.ordens_servico
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable RLS
ALTER TABLE public.ordens_servico ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ordens_servico_itens ENABLE ROW LEVEL SECURITY;

-- Policies para ordens_servico
CREATE POLICY "Admin e oficina podem ver OS"
  ON public.ordens_servico FOR SELECT
  USING (public.has_admin_access());

CREATE POLICY "Admin e oficina podem criar OS"
  ON public.ordens_servico FOR INSERT
  WITH CHECK (public.has_admin_access());

CREATE POLICY "Admin e oficina podem atualizar OS"
  ON public.ordens_servico FOR UPDATE
  USING (public.has_admin_access());

CREATE POLICY "Admin pode deletar OS"
  ON public.ordens_servico FOR DELETE
  USING (public.is_admin());

-- Policies para itens
CREATE POLICY "Admin e oficina podem ver itens OS"
  ON public.ordens_servico_itens FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.ordens_servico os 
    WHERE os.id = ordem_servico_id AND public.has_admin_access()
  ));

CREATE POLICY "Admin e oficina podem criar itens OS"
  ON public.ordens_servico_itens FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.ordens_servico os 
    WHERE os.id = ordem_servico_id AND public.has_admin_access()
  ));

CREATE POLICY "Admin e oficina podem atualizar itens OS"
  ON public.ordens_servico_itens FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.ordens_servico os 
    WHERE os.id = ordem_servico_id AND public.has_admin_access()
  ));

CREATE POLICY "Admin pode deletar itens OS"
  ON public.ordens_servico_itens FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.ordens_servico os 
    WHERE os.id = ordem_servico_id AND public.is_admin()
  ));