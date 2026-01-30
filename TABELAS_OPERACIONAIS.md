# 🔄 TABELAS OPERACIONAIS - DOCTOR AUTO PRIME

## 📋 VISÃO GERAL

Estas são as tabelas que armazenam **dados operacionais** do dia a dia do sistema. Elas dependem das tabelas principais e são constantemente modificadas.

---

## 👥 GRUPO 1: USUÁRIOS E PERFIS

### 1️⃣ **PROFILES (Perfis de Usuário)**
```sql
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  cpf TEXT,
  birth_date DATE,
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

**Relacionamentos:**
- `user_id` → `auth.users` (Supabase Auth)

---

### 2️⃣ **USER_ROLES (Relacionamento Usuário-Papel)**
```sql
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role_id UUID REFERENCES public.roles(id) ON DELETE CASCADE NOT NULL,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role_id, company_id)
);
```

**Relacionamentos:**
- `user_id` → `auth.users`
- `role_id` → `roles` (dev, gestao, admin, cliente)
- `company_id` → `companies` (opcional para roles globais)

---

### 3️⃣ **USER_COMPANIES (Acesso do Usuário a Empresas)**
```sql
CREATE TABLE public.user_companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
  is_primary BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, company_id)
);
```

**Relacionamentos:**
- `user_id` → `auth.users`
- `company_id` → `companies`

---

## 🚗 GRUPO 2: VEÍCULOS

### 4️⃣ **VEHICLES (Veículos dos Clientes)**
```sql
CREATE TABLE public.vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  model TEXT NOT NULL,
  plate TEXT NOT NULL,
  year TEXT,
  brand TEXT,
  color TEXT,
  chassis TEXT,
  renavam TEXT,
  km_current INTEGER,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (plate)
);
```

**Relacionamentos:**
- `user_id` → `auth.users`

---

### 5️⃣ **VEHICLE_HISTORY (Histórico do Veículo)**
```sql
CREATE TABLE public.vehicle_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE CASCADE NOT NULL,
  event_type TEXT NOT NULL, -- 'service', 'maintenance', 'repair', 'inspection'
  description TEXT,
  km_at_event INTEGER,
  cost DECIMAL(10,2),
  date DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

**Relacionamentos:**
- `vehicle_id` → `vehicles`

---

## 📅 GRUPO 3: AGENDAMENTOS

### 6️⃣ **APPOINTMENTS (Agendamentos)**
```sql
CREATE TABLE public.appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE SET NULL,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
  appointment_date DATE NOT NULL,
  appointment_time TIME,
  status TEXT NOT NULL DEFAULT 'pendente', -- pendente, confirmado, concluido, cancelado
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

**Relacionamentos:**
- `user_id` → `auth.users`
- `vehicle_id` → `vehicles`
- `company_id` → `companies`

---

### 7️⃣ **APPOINTMENT_SERVICES (Serviços do Agendamento)**
```sql
CREATE TABLE public.appointment_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id UUID REFERENCES public.appointments(id) ON DELETE CASCADE NOT NULL,
  service_id UUID REFERENCES public.services(id) ON DELETE CASCADE NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (appointment_id, service_id)
);
```

**Relacionamentos:**
- `appointment_id` → `appointments`
- `service_id` → `services`

---

### 8️⃣ **APPOINTMENT_FUNNEL (Funil de Conversão)**
```sql
CREATE TABLE public.appointment_funnel (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  step TEXT NOT NULL, -- flow_started, vehicle_selected, services_selected, etc
  vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE SET NULL,
  selected_services JSONB DEFAULT '[]',
  selected_date DATE,
  completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

**Relacionamentos:**
- `user_id` → `auth.users`
- `vehicle_id` → `vehicles`

---

## 🔧 GRUPO 4: ORDENS DE SERVIÇO

### 9️⃣ **ORDENS_SERVICO (Ordem de Serviço Principal)**
```sql
CREATE TABLE public.ordens_servico (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  numero_os TEXT NOT NULL UNIQUE,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  plate TEXT NOT NULL,
  vehicle TEXT NOT NULL,
  client_name TEXT,
  client_phone TEXT,
  status TEXT NOT NULL DEFAULT 'diagnostico',
  mechanic_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  data_entrada DATE,
  data_orcamento DATE,
  data_aprovacao DATE,
  data_conclusao DATE,
  data_entrega DATE,
  valor_orcado DECIMAL(10,2),
  valor_aprovado DECIMAL(10,2),
  valor_final DECIMAL(10,2),
  descricao_problema TEXT,
  diagnostico TEXT,
  observacoes TEXT,
  motivo_recusa TEXT,
  checklist_entrada JSONB DEFAULT '{}',
  checklist_dinamometro JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

**Relacionamentos:**
- `company_id` → `companies`
- `user_id` → `auth.users` (cliente)
- `mechanic_id` → `auth.users` (mecânico)

---

### 🔟 **ORDEM_SERVICO_ITEMS (Itens da OS)**
```sql
CREATE TABLE public.ordem_servico_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ordem_servico_id UUID REFERENCES public.ordens_servico(id) ON DELETE CASCADE NOT NULL,
  descricao TEXT NOT NULL,
  tipo TEXT NOT NULL, -- 'peca' ou 'servico'
  quantidade INTEGER NOT NULL DEFAULT 1,
  valor_unitario DECIMAL(10,2) NOT NULL DEFAULT 0,
  valor_total DECIMAL(10,2) NOT NULL DEFAULT 0,
  valor_custo DECIMAL(10,2),
  valor_venda_sugerido DECIMAL(10,2),
  margem_aplicada DECIMAL(5,2),
  justificativa_desconto TEXT,
  status TEXT NOT NULL DEFAULT 'pendente', -- pendente, aprovado, recusado
  motivo_recusa TEXT,
  prioridade TEXT, -- verde, amarelo, vermelho
  data_retorno_estimada DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

**Relacionamentos:**
- `ordem_servico_id` → `ordens_servico`

---

### 1️⃣1️⃣ **ORDEM_SERVICO_HISTORY (Histórico da OS)**
```sql
CREATE TABLE public.ordem_servico_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ordem_servico_id UUID REFERENCES public.ordens_servico(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL, -- 'created', 'status_changed', 'approved', 'completed'
  old_value JSONB,
  new_value JSONB,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

**Relacionamentos:**
- `ordem_servico_id` → `ordens_servico`
- `user_id` → `auth.users` (quem fez a ação)

---

## 💰 GRUPO 5: FINANCEIRO

### 1️⃣2️⃣ **PAYMENTS (Pagamentos)**
```sql
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ordem_servico_id UUID REFERENCES public.ordens_servico(id) ON DELETE CASCADE,
  payment_method_id UUID REFERENCES public.payment_methods(id) ON DELETE SET NULL NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  payment_date DATE NOT NULL,
  installments INTEGER DEFAULT 1,
  fee_amount DECIMAL(10,2) DEFAULT 0,
  net_amount DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, completed, failed, refunded
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

**Relacionamentos:**
- `ordem_servico_id` → `ordens_servico`
- `payment_method_id` → `payment_methods`

---

### 1️⃣3️⃣ **INVOICES (Notas Fiscais)**
```sql
CREATE TABLE public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ordem_servico_id UUID REFERENCES public.ordens_servico(id) ON DELETE CASCADE NOT NULL,
  invoice_number TEXT NOT NULL UNIQUE,
  issue_date DATE NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  tax_amount DECIMAL(10,2) DEFAULT 0,
  pdf_url TEXT,
  xml_url TEXT,
  status TEXT NOT NULL DEFAULT 'issued', -- issued, cancelled
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

**Relacionamentos:**
- `ordem_servico_id` → `ordens_servico`

---

## 📦 GRUPO 6: ESTOQUE

### 1️⃣4️⃣ **PARTS (Peças em Estoque)**
```sql
CREATE TABLE public.parts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES public.parts_categories(id) ON DELETE SET NULL,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  code TEXT,
  brand TEXT,
  unit TEXT NOT NULL DEFAULT 'UN', -- UN, KG, L, M
  quantity_current DECIMAL(10,2) NOT NULL DEFAULT 0,
  quantity_min DECIMAL(10,2) NOT NULL DEFAULT 0,
  cost_price DECIMAL(10,2) NOT NULL DEFAULT 0,
  sale_price DECIMAL(10,2) NOT NULL DEFAULT 0,
  margin_percent DECIMAL(5,2),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

**Relacionamentos:**
- `category_id` → `parts_categories`
- `company_id` → `companies`

---

### 1️⃣5️⃣ **STOCK_MOVEMENTS (Movimentações de Estoque)**
```sql
CREATE TABLE public.stock_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  part_id UUID REFERENCES public.parts(id) ON DELETE CASCADE NOT NULL,
  ordem_servico_id UUID REFERENCES public.ordens_servico(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  movement_type TEXT NOT NULL, -- 'entrada', 'saida', 'ajuste', 'devolucao'
  quantity DECIMAL(10,2) NOT NULL,
  unit_cost DECIMAL(10,2),
  total_cost DECIMAL(10,2),
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

**Relacionamentos:**
- `part_id` → `parts`
- `ordem_servico_id` → `ordens_servico`
- `user_id` → `auth.users`

---

## 🚛 GRUPO 7: PÁTIO KANBAN

### 1️⃣6️⃣ **PATIO_STAGES (Estágios do Pátio)**
```sql
CREATE TABLE public.patio_stages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  color TEXT,
  order_position INTEGER NOT NULL,
  duration_avg_hours INTEGER,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

**Dados iniciais:**
- Aguardando (cinza)
- Em Diagnóstico (azul)
- Orçamento (amarelo)
- Aguardando Aprovação (laranja)
- Aguardando Peças (roxo)
- Em Execução (verde)
- Em Teste (azul-claro)
- Pronto p/ Retirada (verde-escuro)
- Entregue (cinza-escuro)

---

### 1️⃣7️⃣ **PATIO_MOVEMENTS (Movimentações no Pátio)**
```sql
CREATE TABLE public.patio_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ordem_servico_id UUID REFERENCES public.ordens_servico(id) ON DELETE CASCADE NOT NULL,
  stage_id UUID REFERENCES public.patio_stages(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  entered_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  exited_at TIMESTAMPTZ,
  duration_minutes INTEGER,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

**Relacionamentos:**
- `ordem_servico_id` → `ordens_servico`
- `stage_id` → `patio_stages`
- `user_id` → `auth.users` (quem moveu)

---

## 🎁 GRUPO 8: PROMOÇÕES E EVENTOS

### 1️⃣8️⃣ **PROMOTIONS (Promoções)**
```sql
CREATE TABLE public.promotions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  discount_label TEXT NOT NULL, -- "30% OFF", "R$ 99,90"
  discount_percent DECIMAL(5,2) NOT NULL DEFAULT 0,
  discount_fixed DECIMAL(10,2) NOT NULL DEFAULT 0,
  valid_from DATE NOT NULL,
  valid_to DATE NOT NULL,
  vehicle_models TEXT[] DEFAULT '{}',
  service_id UUID REFERENCES public.services(id) ON DELETE SET NULL,
  available_dates DATE[] DEFAULT '{}',
  max_uses INTEGER,
  current_uses INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

**Relacionamentos:**
- `service_id` → `services`

---

### 1️⃣9️⃣ **EVENTS (Eventos Prime)**
```sql
CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  event_type TEXT NOT NULL DEFAULT 'other', -- workshop, meetup, carwash, training
  event_date DATE NOT NULL,
  event_time TIME,
  location TEXT,
  max_participants INTEGER,
  current_participants INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

**Relacionamentos:**
- `company_id` → `companies`

---

### 2️⃣0️⃣ **EVENT_PARTICIPANTS (Participantes de Eventos)**
```sql
CREATE TABLE public.event_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  status TEXT NOT NULL DEFAULT 'confirmed', -- confirmed, cancelled, attended
  registered_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (event_id, user_id)
);
```

**Relacionamentos:**
- `event_id` → `events`
- `user_id` → `auth.users`

---

## 📊 RESUMO DAS TABELAS

| # | Tabela | Grupo | Descrição |
|---|--------|-------|-----------|
| 1 | profiles | Usuários | Dados do perfil |
| 2 | user_roles | Usuários | Papéis do usuário |
| 3 | user_companies | Usuários | Empresas do usuário |
| 4 | vehicles | Veículos | Veículos cadastrados |
| 5 | vehicle_history | Veículos | Histórico de serviços |
| 6 | appointments | Agendamentos | Agendamentos |
| 7 | appointment_services | Agendamentos | Serviços do agendamento |
| 8 | appointment_funnel | Agendamentos | Funil de conversão |
| 9 | ordens_servico | OS | Ordem de serviço principal |
| 10 | ordem_servico_items | OS | Itens da OS |
| 11 | ordem_servico_history | OS | Histórico da OS |
| 12 | payments | Financeiro | Pagamentos |
| 13 | invoices | Financeiro | Notas fiscais |
| 14 | parts | Estoque | Peças |
| 15 | stock_movements | Estoque | Movimentações |
| 16 | patio_stages | Pátio | Estágios do Kanban |
| 17 | patio_movements | Pátio | Movimentações no pátio |
| 18 | promotions | Marketing | Promoções |
| 19 | events | Marketing | Eventos |
| 20 | event_participants | Marketing | Participantes |

**Total: 20 tabelas operacionais**

---

## 🔗 DEPENDÊNCIAS

### Ordem de Criação Recomendada:

1. **Usuários**: profiles, user_roles, user_companies
2. **Veículos**: vehicles, vehicle_history
3. **Agendamentos**: appointments, appointment_services, appointment_funnel
4. **OS**: ordens_servico, ordem_servico_items, ordem_servico_history
5. **Financeiro**: payments, invoices
6. **Estoque**: parts, stock_movements
7. **Pátio**: patio_stages, patio_movements
8. **Marketing**: promotions, events, event_participants

---

**Próximo passo: Criar o script SQL completo! 🚀**
