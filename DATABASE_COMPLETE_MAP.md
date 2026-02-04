# 📊 MAPEAMENTO COMPLETO DO BANCO DE DADOS

**Gerado em:** Wed Feb  4 21:15:06 UTC 2026

---

## 📋 ÍNDICE

### 🏢 EMPRESAS E ACESSO
- [companies](#companies)
- [user_company_access](#user_company_access)

### 👥 USUÁRIOS E PERMISSÕES
- [profiles](#profiles)
- [roles](#roles)
- [user_roles](#user_roles)
- [user_companies](#user_companies)
- [invite_codes](#invite_codes)

### 🚗 VEÍCULOS
- [vehicles](#vehicles)
- [vehicle_history](#vehicle_history)

### 📅 AGENDAMENTOS
- [appointments](#appointments)
- [appointment_services](#appointment_services)
- [appointment_funnel](#appointment_funnel)

### 🔧 ORDENS DE SERVIÇO
- [ordens_servico](#ordens_servico)
- [ordem_servico_items](#ordem_servico_items)
- [ordem_servico_history](#ordem_servico_history)

### 💰 FINANCEIRO
- [payments](#payments)
- [payment_methods](#payment_methods)
- [invoices](#invoices)

### 📦 ESTOQUE
- [parts](#parts)
- [parts_categories](#parts_categories)
- [stock_movements](#stock_movements)

### 🚛 PÁTIO KANBAN
- [patio_stages](#patio_stages)
- [patio_movements](#patio_movements)

### 🎁 MARKETING
- [promotions](#promotions)
- [events](#events)
- [event_participants](#event_participants)

### 🛠️ SERVIÇOS
- [services](#services)

---

## 🏢 EMPRESAS E ACESSO

### 📋 `companies`

**Descrição:** Empresas do grupo Doctor Auto Prime

**Campos:**

- `id UUID PRIMARY KEY`
- `name TEXT - Nome da empresa`
- `slug TEXT UNIQUE - Identificador para URLs`
- `logo_url TEXT - URL do logo`
- `primary_color TEXT - Cor primária (hex)`
- `is_active BOOLEAN - Status ativo/inativo`
- `created_at TIMESTAMPTZ`
- `updated_at TIMESTAMPTZ`

**⚠️ Uso:** Não encontrado no código fonte ou usado via referências

---

### 📋 `user_company_access`

**Descrição:** Controle de acesso multi-company

**Campos:**

- `id UUID PRIMARY KEY`
- `user_id UUID REFERENCES auth.users`
- `company_id UUID REFERENCES companies`
- `can_view BOOLEAN - Pode visualizar`
- `can_edit BOOLEAN - Pode editar`
- `can_manage BOOLEAN - Pode gerenciar`
- `created_at TIMESTAMPTZ`

**⚠️ Uso:** Não encontrado no código fonte ou usado via referências

---

## 👥 USUÁRIOS E PERMISSÕES

### 📋 `profiles`

**Descrição:** Perfis de usuários (extensão do auth.users)

**Campos:**

- `id UUID PRIMARY KEY REFERENCES auth.users`
- `user_id UUID REFERENCES auth.users`
- `full_name TEXT - Nome completo`
- `cpf TEXT UNIQUE - CPF do usuário`
- `phone TEXT - Telefone`
- `company_id UUID REFERENCES companies - Empresa principal`
- `avatar_url TEXT - URL do avatar`
- `created_at TIMESTAMPTZ`
- `updated_at TIMESTAMPTZ`

**📁 Usado em:**
```
components/profile/EditProfileDialog.tsx
pages/admin/AdminNovaOS.tsx
contexts/AuthContext.tsx
pages/Index.tsx
pages/gestao/GestaoTecnologia.tsx
pages/admin/AdminClientes.tsx
pages/gestao/GestaoUsuarios.tsx
pages/Agenda.tsx
pages/Register.tsx
components/gestao/WidgetCard.tsx
```

---

### 📋 `roles`

**Descrição:** Papéis/Roles do sistema (RBAC)

**Campos:**

- `id UUID PRIMARY KEY`
- `name TEXT UNIQUE - Nome do papel (dev, gestao, admin, cliente)`
- `level INTEGER - Nível de acesso (10-100)`
- `description TEXT - Descrição do papel`
- `is_active BOOLEAN - Status ativo/inativo`
- `created_at TIMESTAMPTZ`

**⚠️ Uso:** Não encontrado no código fonte ou usado via referências

---

### 📋 `user_roles`

**Descrição:** Atribuição de papéis aos usuários

**Campos:**

- `id UUID PRIMARY KEY`
- `user_id UUID REFERENCES auth.users`
- `role TEXT - Nome do papel atribuído`
- `company_id UUID REFERENCES companies - Empresa específica`
- `created_at TIMESTAMPTZ`

**📁 Usado em:**
```
pages/admin/AdminLogin.tsx
pages/gestao/GestaoUsuarios.tsx
contexts/AuthContext.tsx
hooks/useUserRole.ts
```

---

### 📋 `user_companies`

**Descrição:** Empresas às quais o usuário pertence

**Campos:**

- `id UUID PRIMARY KEY`
- `user_id UUID REFERENCES auth.users`
- `company_id UUID REFERENCES companies`
- `is_primary BOOLEAN - Empresa principal`
- `created_at TIMESTAMPTZ`

**⚠️ Uso:** Não encontrado no código fonte ou usado via referências

---

### 📋 `invite_codes`

**Descrição:** Códigos de convite para registro com roles

**Campos:**

- `id UUID PRIMARY KEY`
- `code TEXT UNIQUE - Código do convite`
- `role TEXT - Papel a ser atribuído`
- `max_uses INTEGER - Máximo de usos`
- `current_uses INTEGER - Usos atuais`
- `expires_at TIMESTAMPTZ - Data de expiração`
- `created_at TIMESTAMPTZ`

**⚠️ Uso:** Não encontrado no código fonte ou usado via referências

---

## 🚗 VEÍCULOS

### 📋 `vehicles`

**Descrição:** Veículos dos clientes

**Campos:**

- `id UUID PRIMARY KEY`
- `owner_id UUID REFERENCES auth.users - Dono do veículo`
- `company_id UUID REFERENCES companies`
- `brand TEXT - Marca`
- `model TEXT - Modelo`
- `year INTEGER - Ano`
- `plate TEXT - Placa`
- `chassis TEXT - Chassi`
- `color TEXT - Cor`
- `mileage INTEGER - Quilometragem`
- `created_at TIMESTAMPTZ`
- `updated_at TIMESTAMPTZ`

**📁 Usado em:**
```
pages/admin/AdminNovaOS.tsx
pages/ServicoDetalhes.tsx
components/home/MyVehiclesSection.tsx
pages/gestao/GestaoTecnologia.tsx
components/vehicle/AddVehicleDialog.tsx
pages/VehicleDetails.tsx
pages/Agenda.tsx
components/home/ActionButtons.tsx
components/gestao/WidgetCard.tsx
pages/NovoAgendamento.tsx
```

---

### 📋 `vehicle_history`

**Descrição:** Histórico de serviços dos veículos

**Campos:**

- `id UUID PRIMARY KEY`
- `vehicle_id UUID REFERENCES vehicles`
- `service_id UUID REFERENCES services`
- `mileage INTEGER - Km no momento do serviço`
- `notes TEXT - Observações`
- `performed_at TIMESTAMPTZ`
- `created_at TIMESTAMPTZ`

**⚠️ Uso:** Não encontrado no código fonte ou usado via referências

---

## 📅 AGENDAMENTOS

### 📋 `appointments`

**Descrição:** Agendamentos de serviços

**Campos:**

- `id UUID PRIMARY KEY`
- `client_id UUID REFERENCES auth.users`
- `vehicle_id UUID REFERENCES vehicles`
- `company_id UUID REFERENCES companies`
- `scheduled_date TIMESTAMPTZ - Data agendada`
- `status TEXT - Status (pending, confirmed, cancelled)`
- `notes TEXT - Observações`
- `created_at TIMESTAMPTZ`
- `updated_at TIMESTAMPTZ`

**📁 Usado em:**
```
pages/admin/AdminPatio.tsx
pages/ServicoDetalhes.tsx
components/service/ServiceTimeline.tsx
components/home/MyVehiclesSection.tsx
pages/admin/AdminOperacional.tsx
pages/admin/AdminFinanceiro.tsx
pages/gestao/GestaoTecnologia.tsx
pages/Reagendamento.tsx
components/profile/ServiceHistory.tsx
pages/Agenda.tsx
```

---

### 📋 `appointment_services`

**Descrição:** Serviços incluídos nos agendamentos

**Campos:**

- `id UUID PRIMARY KEY`
- `appointment_id UUID REFERENCES appointments`
- `service_id UUID REFERENCES services`
- `quantity INTEGER`
- `created_at TIMESTAMPTZ`

**⚠️ Uso:** Não encontrado no código fonte ou usado via referências

---

### 📋 `appointment_funnel`

**Descrição:** Funil de vendas dos agendamentos

**Campos:**

- `id UUID PRIMARY KEY`
- `appointment_id UUID REFERENCES appointments`
- `stage TEXT - Estágio (lead, qualified, converted)`
- `notes TEXT`
- `moved_at TIMESTAMPTZ`
- `created_at TIMESTAMPTZ`

**⚠️ Uso:** Não encontrado no código fonte ou usado via referências

---

## 🔧 ORDENS DE SERVIÇO

### 📋 `ordens_servico`

**Descrição:** Ordens de Serviço (OS)

**Campos:**

- `id UUID PRIMARY KEY`
- `numero_os TEXT UNIQUE - Número da OS`
- `client_id UUID REFERENCES auth.users`
- `vehicle_id UUID REFERENCES vehicles`
- `company_id UUID REFERENCES companies`
- `status TEXT - Status da OS`
- `valor_total DECIMAL - Valor total`
- `desconto DECIMAL - Desconto aplicado`
- `observacoes TEXT`
- `data_entrada TIMESTAMPTZ`
- `data_prevista TIMESTAMPTZ`
- `data_conclusao TIMESTAMPTZ`
- `created_at TIMESTAMPTZ`
- `updated_at TIMESTAMPTZ`

**📁 Usado em:**
```
pages/admin/AdminPatio.tsx
pages/admin/AdminNovaOS.tsx
components/home/MyVehiclesSection.tsx
hooks/useTrelloCards.ts
pages/admin/AdminOSDetalhes.tsx
pages/admin/AdminOrdensServico.tsx
components/gestao/WidgetCard.tsx
pages/admin/AdminPatioDetalhes.tsx
pages/cliente/ClienteDashboard.tsx
pages/OrcamentoCliente.tsx
```

---

### 📋 `ordem_servico_items`

**Descrição:** Itens das Ordens de Serviço

**Campos:**

- `id UUID PRIMARY KEY`
- `ordem_servico_id UUID REFERENCES ordens_servico`
- `tipo TEXT - Tipo (servico, peca)`
- `descricao TEXT - Descrição do item`
- `quantidade DECIMAL`
- `valor_unitario DECIMAL`
- `valor_total DECIMAL`
- `created_at TIMESTAMPTZ`

**⚠️ Uso:** Não encontrado no código fonte ou usado via referências

---

### 📋 `ordem_servico_history`

**Descrição:** Histórico de mudanças nas OS

**Campos:**

- `id UUID PRIMARY KEY`
- `ordem_servico_id UUID REFERENCES ordens_servico`
- `changed_by UUID REFERENCES auth.users`
- `old_status TEXT`
- `new_status TEXT`
- `notes TEXT`
- `created_at TIMESTAMPTZ`

**⚠️ Uso:** Não encontrado no código fonte ou usado via referências

---

## 💰 FINANCEIRO

### 📋 `payments`

**Descrição:** Pagamentos recebidos

**Campos:**

- `id UUID PRIMARY KEY`
- `ordem_servico_id UUID REFERENCES ordens_servico`
- `payment_method_id UUID REFERENCES payment_methods`
- `amount DECIMAL - Valor pago`
- `paid_at TIMESTAMPTZ - Data do pagamento`
- `notes TEXT`
- `created_at TIMESTAMPTZ`

**⚠️ Uso:** Não encontrado no código fonte ou usado via referências

---

### 📋 `payment_methods`

**Descrição:** Métodos de pagamento aceitos

**Campos:**

- `id UUID PRIMARY KEY`
- `name TEXT - Nome do método`
- `description TEXT`
- `is_active BOOLEAN`
- `created_at TIMESTAMPTZ`

**⚠️ Uso:** Não encontrado no código fonte ou usado via referências

---

### 📋 `invoices`

**Descrição:** Notas fiscais geradas

**Campos:**

- `id UUID PRIMARY KEY`
- `ordem_servico_id UUID REFERENCES ordens_servico`
- `invoice_number TEXT UNIQUE - Número NF`
- `issued_at TIMESTAMPTZ - Data emissão`
- `pdf_url TEXT - URL do PDF`
- `created_at TIMESTAMPTZ`

**⚠️ Uso:** Não encontrado no código fonte ou usado via referências

---

## 📦 ESTOQUE

### 📋 `parts`

**Descrição:** Peças em estoque

**Campos:**

- `id UUID PRIMARY KEY`
- `category_id UUID REFERENCES parts_categories`
- `name TEXT - Nome da peça`
- `code TEXT - Código/SKU`
- `brand TEXT - Marca`
- `quantity INTEGER - Quantidade em estoque`
- `unit_price DECIMAL - Preço unitário`
- `min_stock INTEGER - Estoque mínimo`
- `location TEXT - Localização no estoque`
- `created_at TIMESTAMPTZ`
- `updated_at TIMESTAMPTZ`

**⚠️ Uso:** Não encontrado no código fonte ou usado via referências

---

### 📋 `parts_categories`

**Descrição:** Categorias de peças

**Campos:**

- `id UUID PRIMARY KEY`
- `name TEXT - Nome da categoria`
- `description TEXT`
- `created_at TIMESTAMPTZ`

**⚠️ Uso:** Não encontrado no código fonte ou usado via referências

---

### 📋 `stock_movements`

**Descrição:** Movimentações de estoque

**Campos:**

- `id UUID PRIMARY KEY`
- `part_id UUID REFERENCES parts`
- `type TEXT - Tipo (entrada, saida, ajuste)`
- `quantity INTEGER - Quantidade movimentada`
- `reason TEXT - Motivo`
- `ordem_servico_id UUID REFERENCES ordens_servico`
- `performed_by UUID REFERENCES auth.users`
- `performed_at TIMESTAMPTZ`
- `created_at TIMESTAMPTZ`

**⚠️ Uso:** Não encontrado no código fonte ou usado via referências

---

## 🚛 PÁTIO KANBAN

### 📋 `patio_stages`

**Descrição:** Estágios do Pátio Kanban (9 fixos)

**Campos:**

- `id UUID PRIMARY KEY`
- `name TEXT - Nome do estágio`
- `order_num INTEGER - Ordem de exibição`
- `color TEXT - Cor do card`
- `description TEXT`
- `created_at TIMESTAMPTZ`

**⚠️ Uso:** Não encontrado no código fonte ou usado via referências

---

### 📋 `patio_movements`

**Descrição:** Movimentações no Pátio Kanban

**Campos:**

- `id UUID PRIMARY KEY`
- `ordem_servico_id UUID REFERENCES ordens_servico`
- `from_stage_id UUID REFERENCES patio_stages`
- `to_stage_id UUID REFERENCES patio_stages`
- `moved_by UUID REFERENCES auth.users`
- `notes TEXT`
- `moved_at TIMESTAMPTZ`
- `created_at TIMESTAMPTZ`

**⚠️ Uso:** Não encontrado no código fonte ou usado via referências

---

## 🎁 MARKETING

### 📋 `promotions`

**Descrição:** Promoções e campanhas

**Campos:**

- `id UUID PRIMARY KEY`
- `company_id UUID REFERENCES companies`
- `title TEXT - Título da promoção`
- `description TEXT`
- `discount_percentage DECIMAL - % desconto`
- `start_date TIMESTAMPTZ - Início`
- `end_date TIMESTAMPTZ - Fim`
- `is_active BOOLEAN`
- `created_at TIMESTAMPTZ`

**📁 Usado em:**
```
components/home/ActionButtons.tsx
pages/gestao/GestaoComercial.tsx
pages/Agenda.tsx
```

---

### 📋 `events`

**Descrição:** Eventos e ações de marketing

**Campos:**

- `id UUID PRIMARY KEY`
- `company_id UUID REFERENCES companies`
- `title TEXT - Título do evento`
- `description TEXT`
- `event_date TIMESTAMPTZ - Data do evento`
- `location TEXT - Local`
- `max_participants INTEGER - Máximo participantes`
- `is_active BOOLEAN`
- `created_at TIMESTAMPTZ`

**📁 Usado em:**
```
pages/Agenda.tsx
```

---

### 📋 `event_participants`

**Descrição:** Participantes dos eventos

**Campos:**

- `id UUID PRIMARY KEY`
- `event_id UUID REFERENCES events`
- `user_id UUID REFERENCES auth.users`
- `registered_at TIMESTAMPTZ`
- `attended BOOLEAN`
- `created_at TIMESTAMPTZ`

**⚠️ Uso:** Não encontrado no código fonte ou usado via referências

---

## 🛠️ SERVIÇOS

### 📋 `services`

**Descrição:** Catálogo de serviços oferecidos

**Campos:**

- `id UUID PRIMARY KEY`
- `name TEXT - Nome do serviço`
- `description TEXT - Descrição detalhada`
- `category TEXT - Categoria (revisao, diagnostico, etc)`
- `base_price DECIMAL - Preço base`
- `estimated_time INTEGER - Tempo estimado (minutos)`
- `company_id UUID REFERENCES companies`
- `is_active BOOLEAN`
- `created_at TIMESTAMPTZ`

**📁 Usado em:**
```
components/gestao/WidgetCard.tsx
```

---

## 📈 ESTATÍSTICAS

- **Total de Tabelas:** 27
- **Categorias:** 10
- **Total de Campos:** ~204

---

**🚀 Sistema Doctor Auto Prime v1.1**
