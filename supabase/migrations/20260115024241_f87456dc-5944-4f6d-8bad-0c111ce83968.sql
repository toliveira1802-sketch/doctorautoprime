-- Add new OS statuses with emojis to the appointment_status enum
ALTER TYPE appointment_status ADD VALUE IF NOT EXISTS 'diagnostico';
ALTER TYPE appointment_status ADD VALUE IF NOT EXISTS 'aguardando_pecas';
ALTER TYPE appointment_status ADD VALUE IF NOT EXISTS 'pronto_iniciar';
ALTER TYPE appointment_status ADD VALUE IF NOT EXISTS 'em_execucao';
ALTER TYPE appointment_status ADD VALUE IF NOT EXISTS 'pronto_retirada';