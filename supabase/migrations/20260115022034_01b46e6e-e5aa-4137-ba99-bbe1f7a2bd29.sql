-- Add target type to distinguish client vs admin alerts
CREATE TYPE public.alert_target AS ENUM ('client', 'admin');

ALTER TABLE public.alerts 
ADD COLUMN target_type alert_target NOT NULL DEFAULT 'client';

-- Index for target_type
CREATE INDEX idx_alerts_target_type ON public.alerts(target_type);