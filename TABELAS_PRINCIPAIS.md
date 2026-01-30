# 📊 TABELAS DO BANCO DE DADOS - DOCTOR AUTO PRIME

## 🔒 TABELAS PRINCIPAIS (IMUTÁVEIS/ESTRUTURAIS)

Estas são as tabelas de **configuração, catálogo e estrutura** do sistema. Raramente mudam após setup inicial.

### 1️⃣ **SERVIÇOS (services)**
```sql
CREATE TABLE public.services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,                      -- Nome do serviço
  description TEXT,                         -- Descrição detalhada
  service_type service_type NOT NULL,      -- 'revisao' ou 'diagnostico'
  duration_minutes INTEGER NOT NULL DEFAULT 60,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  is_full_day BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

**Exemplos de dados iniciais:**
- Revisão 10.000km
- Revisão 20.000km
- Troca de óleo
- Alinhamento e Balanceamento
- Diagnóstico Completo
- Limpeza de Bicos Injetores

---

### 2️⃣ **EMPRESAS (companies)**
```sql
CREATE TABLE public.companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,                      -- "Doctor Auto Prime"
  slug TEXT NOT NULL UNIQUE,               -- "doctor-auto-prime"
  cnpj TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  logo_url TEXT,
  primary_color TEXT DEFAULT '#dc2626',   -- Vermelho padrão
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

**Empresas iniciais:**
1. Doctor Auto Prime (Principal)
2. Doctor Auto Bosch (Certificada Bosch)
3. Garage 347 (Boutique)
4. GERAL (Consolidado)

---

### 3️⃣ **ROLES/PAPÉIS (roles)**
```sql
CREATE TABLE public.roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,               -- 'dev', 'gestao', 'admin', 'cliente'
  display_name TEXT NOT NULL,              -- "Desenvolvedor"
  description TEXT,
  level INTEGER NOT NULL DEFAULT 0,        -- Nível hierárquico
  permissions JSONB DEFAULT '{}',          -- Permissões específicas
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

**Papéis do sistema:**
- `dev` - Desenvolvedor (acesso total)
- `gestao` - Gestão (BI + Estratégia)
- `admin` - Admin (Operações)
- `cliente` - Cliente (somente leitura)

---

### 4️⃣ **STATUS DE OS (ordem_servico_status - ENUM ou tabela)**
```sql
CREATE TYPE public.ordem_servico_status AS ENUM (
  'diagnostico',
  'orcamento',
  'aguardando_aprovacao',
  'aguardando_pecas',
  'em_execucao',
  'em_teste',
  'pronto_retirada',
  'entregue',
  'cancelado'
);
```

---

### 5️⃣ **TIPOS DE PAGAMENTO (payment_methods)**
```sql
CREATE TABLE public.payment_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,                      -- "Dinheiro", "Cartão", "PIX"
  code TEXT NOT NULL UNIQUE,               -- "cash", "card", "pix"
  icon TEXT,                               -- Ícone/emoji
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

---

### 6️⃣ **CATEGORIAS DE PEÇAS (parts_categories)**
```sql
CREATE TABLE public.parts_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,                      -- "Filtros", "Óleo", "Suspensão"
  description TEXT,
  parent_id UUID REFERENCES parts_categories(id), -- Categoria pai (hierarquia)
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

---

## 🔄 TABELAS OPERACIONAIS (MUTÁVEIS)

Estas tabelas armazenam **dados operacionais** que mudam frequentemente.

### 1️⃣ **USUÁRIOS E PERFIS**
- `profiles` - Perfil do usuário
- `user_roles` - Relacionamento usuário-papel
- `user_companies` - Relacionamento usuário-empresa

### 2️⃣ **VEÍCULOS E CLIENTES**
- `vehicles` - Veículos cadastrados
- `vehicle_history` - Histórico de serviços por veículo

### 3️⃣ **AGENDAMENTOS**
- `appointments` - Agendamentos
- `appointment_services` - Serviços do agendamento
- `appointment_funnel` - Funil de conversão

### 4️⃣ **ORDENS DE SERVIÇO**
- `ordens_servico` - OS principal
- `ordem_servico_items` - Itens da OS (peças/serviços)
- `ordem_servico_history` - Histórico de mudanças

### 5️⃣ **FINANCEIRO**
- `payments` - Pagamentos recebidos
- `invoices` - Notas fiscais

### 6️⃣ **ESTOQUE**
- `parts` - Peças em estoque
- `stock_movements` - Movimentações de estoque

### 7️⃣ **PÁTIO KANBAN**
- `patio_movements` - Movimentações no pátio
- `patio_stages` - Estágios do pátio

---

## 🎯 SCRIPT DE SETUP INICIAL

Para criar as **tabelas principais**, execute este script:

```sql
-- 1. TIPOS ENUM
CREATE TYPE public.service_type AS ENUM ('revisao', 'diagnostico');
CREATE TYPE public.ordem_servico_status AS ENUM (
  'diagnostico', 'orcamento', 'aguardando_aprovacao', 
  'aguardando_pecas', 'em_execucao', 'em_teste', 
  'pronto_retirada', 'entregue', 'cancelado'
);

-- 2. EMPRESAS
CREATE TABLE public.companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  cnpj TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  logo_url TEXT,
  primary_color TEXT DEFAULT '#dc2626',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Inserir empresas iniciais
INSERT INTO public.companies (name, slug, cnpj, phone) VALUES
  ('Doctor Auto Prime', 'doctor-auto-prime', '12.345.678/0001-90', '(11) 1234-5678'),
  ('Doctor Auto Bosch', 'doctor-auto-bosch', '12.345.678/0002-71', '(11) 1234-5679'),
  ('Garage 347', 'garage-347', '12.345.678/0003-52', '(11) 1234-5680'),
  ('GERAL', 'geral', NULL, NULL);

-- 3. ROLES
CREATE TABLE public.roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  description TEXT,
  level INTEGER NOT NULL DEFAULT 0,
  permissions JSONB DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Inserir roles iniciais
INSERT INTO public.roles (name, display_name, description, level) VALUES
  ('dev', 'Desenvolvedor', 'Acesso total ao sistema', 100),
  ('gestao', 'Gestão', 'BI e estratégia', 80),
  ('admin', 'Administrador', 'Operações e POMBAL', 60),
  ('cliente', 'Cliente', 'Somente leitura', 10);

-- 4. SERVIÇOS
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

-- Inserir serviços iniciais
INSERT INTO public.services (name, description, service_type, duration_minutes, price, display_order) VALUES
  ('Revisão 10.000km', 'Revisão periódica de 10 mil km', 'revisao', 120, 350.00, 1),
  ('Revisão 20.000km', 'Revisão periódica de 20 mil km', 'revisao', 180, 550.00, 2),
  ('Troca de Óleo', 'Troca de óleo lubrificante do motor', 'revisao', 60, 200.00, 3),
  ('Alinhamento e Balanceamento', 'Alinhamento de direção e balanceamento de rodas', 'revisao', 90, 180.00, 4),
  ('Diagnóstico Completo', 'Diagnóstico completo do veículo', 'diagnostico', 240, 300.00, 5),
  ('Limpeza de Bicos Injetores', 'Limpeza ultrassônica dos bicos injetores', 'revisao', 120, 350.00, 6);

-- 5. MÉTODOS DE PAGAMENTO
CREATE TABLE public.payment_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  icon TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Inserir métodos de pagamento
INSERT INTO public.payment_methods (name, code, icon, display_order) VALUES
  ('Dinheiro', 'cash', '💵', 1),
  ('Cartão de Crédito', 'credit_card', '💳', 2),
  ('Cartão de Débito', 'debit_card', '💳', 3),
  ('PIX', 'pix', '🔲', 4),
  ('Boleto', 'boleto', '📄', 5);

-- 6. CATEGORIAS DE PEÇAS
CREATE TABLE public.parts_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  parent_id UUID REFERENCES parts_categories(id),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Inserir categorias iniciais
INSERT INTO public.parts_categories (name, description) VALUES
  ('Filtros', 'Filtros de ar, óleo, combustível'),
  ('Óleos e Lubrificantes', 'Óleos para motor, câmbio, diferencial'),
  ('Suspensão', 'Componentes de suspensão'),
  ('Freios', 'Sistema de freios'),
  ('Ignição', 'Sistema de ignição'),
  ('Elétrica', 'Componentes elétricos');
```

---

## ✅ ORDEM DE CRIAÇÃO RECOMENDADA

1. **TIPOS ENUM** (service_type, ordem_servico_status)
2. **COMPANIES** (empresas)
3. **ROLES** (papéis/funções)
4. **SERVICES** (catálogo de serviços)
5. **PAYMENT_METHODS** (formas de pagamento)
6. **PARTS_CATEGORIES** (categorias de peças)

Depois dessas, você pode criar as tabelas operacionais que dependem delas.

---

**Este é o setup base para o sistema funcionar! 🚀**
