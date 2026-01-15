-- Inserir configuração padrão da oficina se não existir
INSERT INTO public.oficina_config (id, nome)
VALUES ('00000000-0000-0000-0000-000000000001', 'Doctor Auto Prime')
ON CONFLICT (id) DO NOTHING;

-- Adicionar coluna de telefone se não existir
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'oficina_config' 
    AND column_name = 'telefone'
  ) THEN
    ALTER TABLE public.oficina_config ADD COLUMN telefone text DEFAULT '';
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'oficina_config' 
    AND column_name = 'whatsapp'
  ) THEN
    ALTER TABLE public.oficina_config ADD COLUMN whatsapp text DEFAULT '';
  END IF;
END $$;