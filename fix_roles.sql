-- =============================================
-- CORREÇÃO: Adicionar 'dev' e 'gestao' ao ENUM app_role
-- =============================================

-- Alterar o tipo ENUM para incluir dev e gestao
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'dev';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'gestao';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'mecanico';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'vendedor';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'atendente';

-- Confirmar
SELECT 'Roles adicionadas com sucesso!' as status;
