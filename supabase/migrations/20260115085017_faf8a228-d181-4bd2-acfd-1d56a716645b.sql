-- Criar tabela para sugestões de melhorias do sistema
CREATE TABLE public.melhorias_sugestoes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  titulo TEXT NOT NULL,
  descricao TEXT NOT NULL,
  categoria TEXT DEFAULT 'geral',
  status TEXT DEFAULT 'pendente',
  prioridade TEXT DEFAULT 'normal',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.melhorias_sugestoes ENABLE ROW LEVEL SECURITY;

-- Políticas RLS: admins e gestão podem ver todas, usuários veem as próprias
CREATE POLICY "Admins podem ver todas as sugestões" 
ON public.melhorias_sugestoes 
FOR SELECT 
USING (public.has_admin_access());

CREATE POLICY "Usuários podem criar sugestões" 
ON public.melhorias_sugestoes 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins podem atualizar sugestões" 
ON public.melhorias_sugestoes 
FOR UPDATE 
USING (public.has_admin_access());

CREATE POLICY "Admins podem excluir sugestões" 
ON public.melhorias_sugestoes 
FOR DELETE 
USING (public.has_admin_access());

-- Trigger para updated_at
CREATE TRIGGER update_melhorias_sugestoes_updated_at
BEFORE UPDATE ON public.melhorias_sugestoes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();