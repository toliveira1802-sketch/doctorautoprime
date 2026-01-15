-- Add cost and pricing fields to ordens_servico_itens
ALTER TABLE public.ordens_servico_itens
ADD COLUMN IF NOT EXISTS valor_custo numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS valor_venda_sugerido numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS margem_aplicada numeric DEFAULT 40,
ADD COLUMN IF NOT EXISTS justificativa_desconto text;

-- Add margem_minima to oficina_config for management to set minimum margin
ALTER TABLE public.oficina_config
ADD COLUMN IF NOT EXISTS margem_minima_pecas numeric DEFAULT 40,
ADD COLUMN IF NOT EXISTS margem_minima_servicos numeric DEFAULT 50;

COMMENT ON COLUMN public.ordens_servico_itens.valor_custo IS 'Valor de custo do item';
COMMENT ON COLUMN public.ordens_servico_itens.valor_venda_sugerido IS 'Valor de venda sugerido calculado com margem';
COMMENT ON COLUMN public.ordens_servico_itens.margem_aplicada IS 'Margem real aplicada na venda';
COMMENT ON COLUMN public.ordens_servico_itens.justificativa_desconto IS 'Justificativa quando margem fica abaixo do mínimo';
COMMENT ON COLUMN public.oficina_config.margem_minima_pecas IS 'Margem mínima para peças (%) definida pela gestão';
COMMENT ON COLUMN public.oficina_config.margem_minima_servicos IS 'Margem mínima para serviços (%) definida pela gestão';