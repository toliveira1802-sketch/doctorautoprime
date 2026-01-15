-- Create alert_clicks table for tracking interactions and measuring return rate
CREATE TABLE public.alert_clicks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  alert_id UUID NOT NULL REFERENCES public.alerts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  action TEXT NOT NULL DEFAULT 'click',
  clicked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  notes TEXT
);

-- Enable RLS
ALTER TABLE public.alert_clicks ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can insert own alert clicks"
ON public.alert_clicks FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own alert clicks"
ON public.alert_clicks FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all alert clicks"
ON public.alert_clicks FOR ALL
USING (is_admin());

-- Indexes
CREATE INDEX idx_alert_clicks_alert_id ON public.alert_clicks(alert_id);
CREATE INDEX idx_alert_clicks_user_id ON public.alert_clicks(user_id);