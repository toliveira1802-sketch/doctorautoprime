-- Adicionar campos para checklist e fotos na tabela ordens_servico
ALTER TABLE public.ordens_servico 
ADD COLUMN IF NOT EXISTS checklist_entrada jsonb DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS checklist_dinamometro jsonb DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS checklist_precompra jsonb DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS fotos_entrada text[] DEFAULT '{}'::text[],
ADD COLUMN IF NOT EXISTS km_atual text;