
-- Adicionar coluna user_id na tabela ordens_servico
ALTER TABLE public.ordens_servico 
ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

-- Criar índice para performance
CREATE INDEX idx_ordens_servico_user_id ON public.ordens_servico(user_id);

-- Comentário
COMMENT ON COLUMN public.ordens_servico.user_id IS 'ID do cliente vinculado à OS';
