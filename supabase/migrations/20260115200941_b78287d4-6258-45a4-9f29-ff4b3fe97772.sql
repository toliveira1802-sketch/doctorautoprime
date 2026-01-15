-- Adicionar campos aos itens da OS
ALTER TABLE public.ordens_servico_itens 
ADD COLUMN IF NOT EXISTS prioridade TEXT DEFAULT 'amarelo' CHECK (prioridade IN ('verde', 'amarelo', 'vermelho')),
ADD COLUMN IF NOT EXISTS data_retorno_estimada DATE;

-- Renomear tipo para incluir mao_de_obra
-- Primeiro remover o default para alterar
ALTER TABLE public.ordens_servico_itens 
ALTER COLUMN tipo DROP DEFAULT;

-- Atualizar constraint de tipo (se existir, remover)
ALTER TABLE public.ordens_servico_itens 
DROP CONSTRAINT IF EXISTS ordens_servico_itens_tipo_check;

-- Adicionar nova constraint
ALTER TABLE public.ordens_servico_itens 
ADD CONSTRAINT ordens_servico_itens_tipo_check 
CHECK (tipo IN ('peca', 'servico', 'mao_de_obra'));

-- Atualizar registros existentes de 'servico' para 'peca' se necessário
UPDATE public.ordens_servico_itens SET tipo = 'peca' WHERE tipo = 'servico';

-- Definir novo default
ALTER TABLE public.ordens_servico_itens 
ALTER COLUMN tipo SET DEFAULT 'peca';

-- Adicionar campos de remarketing na OS
ALTER TABLE public.ordens_servico 
ADD COLUMN IF NOT EXISTS enviado_gestao BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS enviado_gestao_em TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS remarketing_status TEXT DEFAULT 'pendente' CHECK (remarketing_status IN ('pendente', 'em_avaliacao', 'agendado', 'concluido')),
ADD COLUMN IF NOT EXISTS remarketing_data_prevista DATE;