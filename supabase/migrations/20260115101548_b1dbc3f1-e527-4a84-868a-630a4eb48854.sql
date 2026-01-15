-- Corrigir search_path na função generate_os_number
CREATE OR REPLACE FUNCTION public.generate_os_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.numero_os := 'OS-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(NEXTVAL('public.os_sequence')::TEXT, 4, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql
SET search_path = public;