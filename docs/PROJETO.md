# Doctor Auto Prime - Documentação do Projeto

## 📋 Visão Geral

**Doctor Auto Prime** é um CRM completo para oficinas mecânicas, desenvolvido para gerenciar todo o ciclo de atendimento ao cliente, desde a captação de leads até o acompanhamento pós-serviço.

---

## 🏗️ Arquitetura Técnica

### Stack Tecnológico
- **Frontend:** React 18 + TypeScript + Vite
- **Estilização:** Tailwind CSS + shadcn/ui
- **Backend:** Lovable Cloud (Supabase)
- **Autenticação:** Supabase Auth (Email/Telefone + OTP)
- **Database:** PostgreSQL
- **State Management:** React Query (TanStack)

### Estrutura de Pastas
```
src/
├── components/
│   ├── auth/          # Componentes de autenticação
│   ├── home/          # Componentes da home
│   ├── layout/        # Header, Sidebar, Navigation
│   ├── profile/       # Perfil do usuário
│   ├── service/       # Timeline de serviços
│   ├── ui/            # shadcn/ui components
│   └── vehicle/       # Gestão de veículos
├── contexts/          # AuthContext
├── hooks/             # Custom hooks
├── pages/             # Páginas da aplicação
│   └── admin/         # Painel administrativo
├── integrations/      # Supabase client e types
└── utils/             # Utilitários
```

---

## 👥 Sistema de Perfis (Roles)

### Hierarquia de Acesso

| Role | Descrição | Acesso |
|------|-----------|--------|
| `admin` | Administrador completo | Tudo, incluindo financeiro e analytics |
| `oficina` | Operacional da oficina | Painel admin sem financeiro/analytics |
| `user` | Cliente final | Área do cliente apenas |

### Funções de Banco de Dados
- `has_role(user_id, role)` - Verifica se usuário tem role específica
- `has_any_role(user_id, roles[])` - Verifica se tem qualquer das roles
- `has_admin_access(user_id)` - Verifica acesso admin ou oficina

---

## 📱 Módulos do Sistema

### Área do Cliente (`user`)
| Módulo | Rota | Descrição |
|--------|------|-----------|
| Home | `/` | Dashboard do cliente |
| Meus Veículos | `/veiculos/:id` | Gestão de veículos |
| Novo Agendamento | `/novo-agendamento` | Agendar serviço |
| Agenda | `/agenda` | Ver agendamentos |
| Histórico | `/historico` | Histórico de serviços |
| Perfil | `/perfil` | Dados pessoais |
| Avisos | `/avisos` | Notificações |

### Painel Admin/Oficina
| Módulo | Rota | Acesso | Descrição |
|--------|------|--------|-----------|
| Dashboard | `/admin` | admin, oficina | Visão geral |
| Agendamentos | `/admin/agendamentos` | admin, oficina | Gestão de agendamentos |
| Clientes | `/admin/clientes` | admin, oficina | Base de clientes |
| Serviços | `/admin/servicos` | admin, oficina | Catálogo de serviços |
| Pátio | `/admin/patio` | admin, oficina | Veículos no pátio |
| Agenda Mecânicos | `/admin/agenda-mecanicos` | admin, oficina | Escala da equipe |
| Nova OS | `/admin/nova-os` | admin, oficina | Criar ordem de serviço |
| Operacional | `/admin/operacional` | admin, oficina | Gestão operacional |
| Painel TV | `/admin/painel-tv` | admin, oficina | Display para TV |
| Produtividade | `/admin/produtividade` | admin, oficina | Métricas de produção |
| Configurações | `/admin/configuracoes` | admin, oficina | Configurações gerais |
| **Financeiro** | `/admin/financeiro` | **admin only** | Gestão financeira |
| **Analytics Mecânicos** | `/admin/analytics-mecanicos` | **admin only** | Analytics detalhado |
| **Feedback Mecânicos** | `/admin/feedback-mecanicos` | **admin only** | Avaliações |

---

## 🗄️ Estrutura do Banco de Dados

### Tabelas Principais

#### Gestão de Usuários
- `profiles` - Dados do perfil do usuário
- `user_roles` - Roles dos usuários (admin/oficina/user)

#### Veículos e Serviços
- `vehicles` - Veículos cadastrados
- `services` - Catálogo de serviços
- `appointments` - Agendamentos
- `service_history` - Histórico de serviços

#### Operacional
- `mechanics` - Mecânicos cadastrados
- `mechanic_schedules` - Escalas de trabalho
- `mechanic_assignments` - Atribuições de serviço
- `mechanic_analytics` - Métricas de desempenho
- `mechanic_feedback` - Avaliações

#### Pátio e OS
- `patio_vehicles` - Veículos no pátio
- `service_orders` - Ordens de serviço
- `service_order_items` - Itens da OS

#### Comunicação
- `alerts` - Alertas/notificações
- `promotions` - Promoções

#### Financeiro
- `payments` - Pagamentos
- `invoices` - Faturas

### Enums Disponíveis
- `app_role`: admin, oficina, user
- `appointment_status`: pending, confirmed, in_progress, completed, cancelled
- `service_type`: oil_change, tire_rotation, brake_service, etc.
- `alert_status`: pending, read, archived

---

## 🔐 Segurança (RLS)

Todas as tabelas possuem Row Level Security habilitado com políticas específicas:

- **Dados de usuário:** Acesso apenas ao próprio usuário
- **Dados operacionais:** Acesso para admin e oficina
- **Dados financeiros:** Acesso apenas para admin
- **Dados públicos:** Serviços e promoções visíveis para todos

---

## 🚀 Próximos Passos Sugeridos

### Curto Prazo
- [ ] Tela de gerenciamento de usuários e roles
- [ ] Permissões granulares por módulo
- [ ] Dashboard específico para role "oficina"

### Médio Prazo
- [ ] Integração com sistema de pagamento
- [ ] Notificações push
- [ ] Relatórios exportáveis (PDF/Excel)

### Longo Prazo
- [ ] App mobile (PWA)
- [ ] Integração com sistemas de peças
- [ ] IA para diagnóstico

---

## 📞 Informações do Projeto

- **URL de Preview:** https://id-preview--ad0c6e08-a053-4a31-ba05-c0434697e9f4.lovable.app
- **URL Publicada:** https://doctorautoprime.lovable.app
- **Data de Atualização:** Janeiro 2026

---

*Documentação gerada automaticamente pelo Doctor Auto Prime*
