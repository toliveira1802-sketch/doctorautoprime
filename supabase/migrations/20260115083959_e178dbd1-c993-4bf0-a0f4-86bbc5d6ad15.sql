-- Adicionar user_id nas tabelas de gestão para personalização por usuário
ALTER TABLE public.gestao_dashboards 
ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Atualizar RLS para filtrar por usuário
DROP POLICY IF EXISTS "Gestao dashboards - admin access" ON public.gestao_dashboards;

CREATE POLICY "Users can manage own dashboards" ON public.gestao_dashboards
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Permitir que admins vejam todos (opcional, para compartilhamento futuro)
CREATE POLICY "Admins can view all dashboards" ON public.gestao_dashboards
  FOR SELECT TO authenticated
  USING (is_admin());

-- Widgets herdam do dashboard via CASCADE, mas adicionar policy também
DROP POLICY IF EXISTS "Gestao widgets - admin access" ON public.gestao_widgets;

CREATE POLICY "Users can manage own widgets" ON public.gestao_widgets
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM gestao_dashboards 
      WHERE id = gestao_widgets.dashboard_id 
      AND user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM gestao_dashboards 
      WHERE id = gestao_widgets.dashboard_id 
      AND user_id = auth.uid()
    )
  );

-- Dados manuais também
DROP POLICY IF EXISTS "Gestao dados manuais - admin access" ON public.gestao_dados_manuais;

CREATE POLICY "Users can manage own manual data" ON public.gestao_dados_manuais
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM gestao_widgets w
      JOIN gestao_dashboards d ON d.id = w.dashboard_id
      WHERE w.id = gestao_dados_manuais.widget_id 
      AND d.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM gestao_widgets w
      JOIN gestao_dashboards d ON d.id = w.dashboard_id
      WHERE w.id = gestao_dados_manuais.widget_id 
      AND d.user_id = auth.uid()
    )
  );

-- Índice para performance
CREATE INDEX idx_dashboards_user ON gestao_dashboards(user_id);