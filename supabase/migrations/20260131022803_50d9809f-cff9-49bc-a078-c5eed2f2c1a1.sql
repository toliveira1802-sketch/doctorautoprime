
-- Remover constraint antiga e adicionar nova com mais tipos
ALTER TABLE public.recursos DROP CONSTRAINT IF EXISTS recursos_tipo_check;

ALTER TABLE public.recursos ADD CONSTRAINT recursos_tipo_check 
  CHECK (tipo = ANY (ARRAY['box'::text, 'elevador'::text, 'vaga_espera'::text, 'rampa'::text, 'equipamento'::text, 'vaga'::text]));
