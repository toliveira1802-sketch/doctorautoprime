-- =============================================
-- 1. TIPOS ENUM
-- =============================================
CREATE TYPE public.app_role AS ENUM ('admin', 'user');
CREATE TYPE public.appointment_status AS ENUM ('pendente', 'confirmado', 'concluido', 'cancelado');
CREATE TYPE public.service_type AS ENUM ('revisao', 'diagnostico');
CREATE TYPE public.event_type AS ENUM ('workshop', 'meetup', 'carwash', 'training', 'other');
CREATE TYPE public.funnel_step AS ENUM (
  'flow_started', 
  'vehicle_selected', 
  'type_selected', 
  'services_selected', 
  'date_selected', 
  'flow_completed', 
  'flow_abandoned'
);

-- =============================================
-- 2. TABELAS
-- =============================================

-- Perfis de usuário
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Roles (separado de profiles por segurança)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Veículos do usuário
CREATE TABLE public.vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  model TEXT NOT NULL,
  plate TEXT NOT NULL,
  year TEXT,
  brand TEXT,
  color TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Catálogo de serviços
CREATE TABLE public.services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  service_type service_type NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 60,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  is_full_day BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Promoções
CREATE TABLE public.promotions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  discount_label TEXT NOT NULL, -- "30% OFF", "GRÁTIS"
  discount_percent INTEGER NOT NULL DEFAULT 0,
  valid_from DATE NOT NULL,
  valid_to DATE NOT NULL,
  vehicle_models TEXT[] DEFAULT '{}', -- Modelos elegíveis (vazio = todos)
  service_id UUID REFERENCES public.services(id) ON DELETE SET NULL,
  available_dates DATE[] DEFAULT '{}', -- Datas específicas disponíveis
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Eventos Prime
CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  event_type event_type NOT NULL DEFAULT 'other',
  event_date DATE NOT NULL,
  event_time TIME,
  location TEXT,
  max_participants INTEGER,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Agendamentos
CREATE TABLE public.appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE SET NULL,
  promotion_id UUID REFERENCES public.promotions(id) ON DELETE SET NULL,
  appointment_date DATE NOT NULL,
  appointment_time TIME,
  is_full_day BOOLEAN NOT NULL DEFAULT false,
  status appointment_status NOT NULL DEFAULT 'pendente',
  subtotal DECIMAL(10,2) NOT NULL DEFAULT 0,
  discount_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  final_price DECIMAL(10,2) NOT NULL DEFAULT 0,
  pay_in_advance BOOLEAN NOT NULL DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Serviços do agendamento (muitos-para-muitos)
CREATE TABLE public.appointment_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id UUID REFERENCES public.appointments(id) ON DELETE CASCADE NOT NULL,
  service_id UUID REFERENCES public.services(id) ON DELETE CASCADE NOT NULL,
  price_at_booking DECIMAL(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (appointment_id, service_id)
);

-- Tracking de cliques em promoções
CREATE TABLE public.promo_clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  promotion_id UUID REFERENCES public.promotions(id) ON DELETE CASCADE NOT NULL,
  source TEXT, -- 'home', 'agenda'
  clicked_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tracking de cliques em eventos
CREATE TABLE public.event_clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  clicked_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Eventos de funil (conversão)
CREATE TABLE public.funnel_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id TEXT NOT NULL,
  event_type funnel_step NOT NULL,
  flow_type TEXT NOT NULL, -- 'normal', 'promo'
  promotion_id UUID REFERENCES public.promotions(id) ON DELETE SET NULL,
  vehicle_model TEXT,
  step_number INTEGER NOT NULL,
  total_steps INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Registro de interesse (quando não há promoções)
CREATE TABLE public.waitlist_interests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  source TEXT, -- 'home', 'agenda'
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================
-- 3. ÍNDICES
-- =============================================
CREATE INDEX idx_vehicles_user_id ON public.vehicles(user_id);
CREATE INDEX idx_appointments_user_id ON public.appointments(user_id);
CREATE INDEX idx_appointments_date ON public.appointments(appointment_date);
CREATE INDEX idx_appointments_status ON public.appointments(status);
CREATE INDEX idx_promotions_dates ON public.promotions(valid_from, valid_to);
CREATE INDEX idx_events_date ON public.events(event_date);
CREATE INDEX idx_funnel_events_session ON public.funnel_events(session_id);
CREATE INDEX idx_promo_clicks_promo ON public.promo_clicks(promotion_id);

-- =============================================
-- 4. TRIGGERS PARA updated_at
-- =============================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_vehicles_updated_at BEFORE UPDATE ON public.vehicles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON public.services
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_promotions_updated_at BEFORE UPDATE ON public.promotions
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON public.events
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON public.appointments
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- 5. FUNÇÃO PARA VERIFICAR ROLE (SECURITY DEFINER)
-- =============================================
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Função auxiliar para verificar se é admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(auth.uid(), 'admin')
$$;

-- =============================================
-- 6. TRIGGER PARA CRIAR PROFILE E ROLE NO SIGNUP
-- =============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- 7. RLS POLICIES
-- =============================================

-- Enable RLS em todas as tabelas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointment_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promo_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.funnel_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.waitlist_interests ENABLE ROW LEVEL SECURITY;

-- PROFILES
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (public.is_admin());

-- USER_ROLES (só admins podem ver/modificar)
CREATE POLICY "Admins can manage roles" ON public.user_roles
  FOR ALL USING (public.is_admin());
CREATE POLICY "Users can view own role" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);

-- VEHICLES
CREATE POLICY "Users can view own vehicles" ON public.vehicles
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own vehicles" ON public.vehicles
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own vehicles" ON public.vehicles
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own vehicles" ON public.vehicles
  FOR DELETE USING (auth.uid() = user_id);

-- SERVICES (leitura pública, escrita admin)
CREATE POLICY "Anyone can view active services" ON public.services
  FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage services" ON public.services
  FOR ALL USING (public.is_admin());

-- PROMOTIONS (leitura pública para ativas, escrita admin)
CREATE POLICY "Anyone can view active promotions" ON public.promotions
  FOR SELECT USING (is_active = true AND valid_to >= CURRENT_DATE);
CREATE POLICY "Admins can manage promotions" ON public.promotions
  FOR ALL USING (public.is_admin());

-- EVENTS (leitura pública para ativos, escrita admin)
CREATE POLICY "Anyone can view active events" ON public.events
  FOR SELECT USING (is_active = true AND event_date >= CURRENT_DATE);
CREATE POLICY "Admins can manage events" ON public.events
  FOR ALL USING (public.is_admin());

-- APPOINTMENTS
CREATE POLICY "Users can view own appointments" ON public.appointments
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own appointments" ON public.appointments
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own pending appointments" ON public.appointments
  FOR UPDATE USING (auth.uid() = user_id AND status = 'pendente');
CREATE POLICY "Admins can manage all appointments" ON public.appointments
  FOR ALL USING (public.is_admin());

-- APPOINTMENT_SERVICES
CREATE POLICY "Users can view own appointment services" ON public.appointment_services
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.appointments 
      WHERE id = appointment_id AND user_id = auth.uid()
    )
  );
CREATE POLICY "Users can insert own appointment services" ON public.appointment_services
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.appointments 
      WHERE id = appointment_id AND user_id = auth.uid()
    )
  );

-- TRACKING (usuário pode inserir, admin pode ver tudo)
CREATE POLICY "Users can insert own promo clicks" ON public.promo_clicks
  FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "Admins can view all promo clicks" ON public.promo_clicks
  FOR SELECT USING (public.is_admin());

CREATE POLICY "Users can insert own event clicks" ON public.event_clicks
  FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "Admins can view all event clicks" ON public.event_clicks
  FOR SELECT USING (public.is_admin());

CREATE POLICY "Users can insert own funnel events" ON public.funnel_events
  FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "Admins can view all funnel events" ON public.funnel_events
  FOR SELECT USING (public.is_admin());

CREATE POLICY "Users can insert waitlist interest" ON public.waitlist_interests
  FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "Admins can view waitlist" ON public.waitlist_interests
  FOR SELECT USING (public.is_admin());