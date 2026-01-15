-- Add new appointment status values
ALTER TYPE appointment_status ADD VALUE IF NOT EXISTS 'orcamento' AFTER 'diagnostico';
ALTER TYPE appointment_status ADD VALUE IF NOT EXISTS 'aguardando_aprovacao' AFTER 'orcamento';
ALTER TYPE appointment_status ADD VALUE IF NOT EXISTS 'em_teste' AFTER 'em_execucao';