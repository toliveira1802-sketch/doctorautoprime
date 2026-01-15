-- Add google_drive_link and scanner_avarias columns to ordens_servico table
ALTER TABLE public.ordens_servico 
ADD COLUMN IF NOT EXISTS google_drive_link TEXT,
ADD COLUMN IF NOT EXISTS scanner_avarias TEXT;