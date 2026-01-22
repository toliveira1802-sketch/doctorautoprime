# 🔗 GUIA DE ROTAS E URLs - DOCTOR AUTO PRIME

> **Produção**: https://doctorautoprime.vercel.app  
> **Local**: http://localhost:8080  
> **Última Atualização**: 22 de Janeiro de 2026

---

## 🌐 URLs DE PRODUÇÃO

### Aplicação Principal
```
https://doctorautoprime.vercel.app
```

### Supabase Dashboard (Gerenciamento Técnico)
```
https://supabase.com/dashboard
```
**Login**: GitHub/Google (toliveira1802@gmail.com)

---

## 🗺️ MAPA COMPLETO DE ROTAS

### 🏠 PÁGINA INICIAL

| Rota | Descrição | Acesso |
|------|-----------|--------|
| `/` | Dashboard Unificado (Index.tsx) | Todos |
| `/login` | Página de Login | Público |

---

### 👁️ VISÃO CLIENTE

| Rota | Descrição | Acesso |
|------|-----------|--------|
| `/` | Meus Veículos e Histórico | Cliente+ |
| `/agendamentos` | Meus Agendamentos | Cliente+ |
| `/perfil` | Meu Perfil | Cliente+ |

---

### 🏭 VISÃO ADMIN (POMBAL - Operacional)

#### Módulo Principal
| Rota | Descrição | Acesso |
|------|-----------|--------|
| `/admin` | **Home** - Pendências do Dia | Admin+ |
| `/admin/dashboard` | **Visão Geral** - Métricas Operacionais | Admin+ |

#### Gestão de Clientes e OS
| Rota | Descrição | Acesso |
|------|-----------|--------|
| `/admin/nova-os` | **Nova OS** - Criar Ordem de Serviço | Admin+ |
| `/admin/clientes` | **Clientes** - Gestão de Clientes | Admin+ |
| `/admin/ordens-servico` | **Ordens de Serviço** - Lista de OS | Admin+ |

#### Operações de Pátio
| Rota | Descrição | Acesso |
|------|-----------|--------|
| `/admin/patio` | **Pátio Kanban** - 9 Estágios | Admin+ |
| `/admin/agendamentos` | **Agendamentos** - Gestão de Agenda | Admin+ |

---

### 📊 VISÃO GESTÃO (Estratégica)

#### Business Intelligence
| Rota | Descrição | Acesso |
|------|-----------|--------|
| `/gestao/bi` | **BI Overview** - Dashboard Consolidado | Gestão+ |
| `/gestao/bi/conversao` | **Conversão** - Funil de Vendas | Gestão+ |
| `/gestao/bi/margens` | **Margens** - Análise de Lucratividade | Gestão+ |

#### Departamentos
| Rota | Descrição | Acesso |
|------|-----------|--------|
| `/gestao/comercial` | **Comercial** - Vendas e Leads | Gestão+ |
| `/gestao/financeiro` | **Financeiro** - Fluxo de Caixa | Gestão+ |
| `/gestao/operacoes` | **Operações** - Eficiência e Throughput | Gestão+ |
| `/gestao/rh` | **RH** - Equipe e Performance | Gestão+ |
| `/gestao/marketing` | **Marketing** - Campanhas e ROI | Gestão+ |

#### Tecnologia e IA
| Rota | Descrição | Acesso |
|------|-----------|--------|
| `/gestao/tecnologia` | **Tecnologia** - Monitoramento de Sistemas | Gestão+ |
| `/gestao/ia/configuracoes` | **QG das IAs** 🔒 - Configuração de Agentes | Gestão+ (Senha Dupla) |
| `/gestao/melhorias` | **Melhorias** - Roadmap e Features | Gestão+ |

---

### 📺 PAINÉIS ESPECIALIZADOS

| Rota | Descrição | Acesso |
|------|-----------|--------|
| `/painel` | **Painel TV** - 4 Quadrantes (Auto-refresh 30s) | Admin+ |
| `/painel-metas` | **Painel de Metas** - Progresso Financeiro | Gestão+ |
| `/performance` | **Performance** - Produtividade de Mecânicos | Admin+ |

---

### 📅 MÓDULOS COMPARTILHADOS

| Rota | Descrição | Acesso |
|------|-----------|--------|
| `/agenda` | **Agenda** - Agendamento de Serviços | Todos |
| `/historico` | **Histórico** - Timeline de Atividades | Todos |

---

### 🔧 CONFIGURAÇÃO E SETUP

| Rota | Descrição | Acesso |
|------|-----------|--------|
| `/setup-supabase` | **Setup Workspace** - Configuração do Banco | Dev |

---

## 🎯 ROTAS POR PAPEL (RBAC)

### 👑 Master (Inativo)
```
Acesso total a todas as rotas
```

### 🛠️ Dev
```
✅ Todas as rotas
✅ /setup-supabase
✅ /gestao/ia/configuracoes (com senha dupla)
✅ Bypass de RLS
```

### 📊 Gestão
```
✅ / (Cliente)
✅ /admin/* (Admin)
✅ /gestao/* (Gestão)
✅ /gestao/ia/configuracoes (com senha dupla)
✅ /painel-metas
✅ Seletor de Empresa (GERAL)
```

### 🏭 Admin
```
✅ / (Cliente)
✅ /admin/* (Admin)
✅ /painel
✅ /performance
✅ /agenda
✅ /historico
❌ /gestao/* (Gestão)
❌ Seletor de Empresa
```

### 💼 Vendedor (Inativo)
```
✅ / (Cliente)
✅ /admin/* (Admin)
❌ /gestao/* (Gestão)
```

### 📞 Atendente (Inativo)
```
✅ / (Cliente)
✅ /admin/agendamentos
✅ /admin/clientes
❌ /gestao/* (Gestão)
```

### 🔧 Mecânico (Inativo)
```
✅ / (Cliente)
✅ /admin/patio (visualização)
✅ /agenda
❌ /gestao/* (Gestão)
```

### 👁️ Cliente
```
✅ / (Cliente)
✅ /agenda
✅ /historico
❌ /admin/* (Admin)
❌ /gestao/* (Gestão)
```

---

## 🔐 ROTAS PROTEGIDAS

### Autenticação Obrigatória
Todas as rotas exceto `/login` requerem autenticação via Supabase Auth.

### Proteção por Papel (RBAC)
- **ClienteRoute**: Wrapper para rotas acessíveis a todos os usuários autenticados
- **ProtectedRoute**: Wrapper para rotas administrativas (Admin+)
- **GestaoRoute**: Wrapper para rotas estratégicas (Gestão+)

### Senha Dupla (Double-Gate)
A rota `/gestao/ia/configuracoes` possui proteção adicional:
1. **Gate 1**: Papel `gestao` ou `dev`
2. **Gate 2**: Senha secundária específica

---

## 🏢 SELETOR DE EMPRESA (Multi-Tenancy)

### Empresas Disponíveis
```
1. Doctor Auto Prime (Padrão)
2. Doctor Auto Bosch
3. Garage 347
4. GERAL (Consolidado) - Apenas Gestão/Dev
```

### Comportamento por Papel
- **Dev/Gestão**: Pode alternar entre todas as empresas + GERAL
- **Admin/Outros**: Vê apenas a empresa atribuída
- **Cliente**: Não vê o seletor (dados filtrados automaticamente)

### Filtros Aplicados
Quando uma empresa é selecionada, todos os dados são filtrados por `company_id`:
- Clientes
- Veículos
- Ordens de Serviço
- Agendamentos
- Faturamento
- Serviços

---

## 📱 NAVEGAÇÃO MOBILE (Bottom Tab Bar)

### Tabs Principais
```
[🏠 Home] [📊 Dashboard] [🚗 Pátio] [📈 BI] [📅 Agenda]
```

### Comportamento Responsivo
- **Desktop**: Sidebar completo + Header
- **Mobile**: Bottom Tab Bar + Header simplificado
- **Tablet**: Sidebar colapsável + Bottom Tab Bar

---

## 🔄 REDIRECIONAMENTOS AUTOMÁTICOS

### Após Login
```
Cliente → /
Admin → /admin
Gestão → /gestao/bi
Dev → /admin (com acesso total)
```

### Rotas Não Autorizadas
```
Redireciona para a página inicial da visão permitida
```

### Logout
```
Todas as rotas → /login
```

---

## 🎨 COMPONENTES DE NAVEGAÇÃO

### ProfileSwitcher
Localização: Header (topo)
```
[Cliente] [Admin] [Gestão]
```
- Alterna entre visões sem recarregar
- Disponível apenas para papéis com múltiplos acessos

### AppSidebar
Localização: Lateral esquerda (desktop)
```
📊 Gestão (6 Departamentos)
🏭 POMBAL (Operacional)
⚙️ Sistema
```

### CompanySelector
Localização: Sidebar (footer) ou Header
```
[Doctor Auto Prime ▼]
```
- Apenas para Dev/Gestão
- Filtra todos os dados em tempo real

---

## 🚀 COMANDOS DE DESENVOLVIMENTO

### Iniciar Servidor Local
```bash
npm run dev
```
Acesso: http://localhost:8080

### Build de Produção
```bash
npm run build
```

### Deploy (Vercel)
```bash
git push origin main
```
Auto-deploy configurado

---

## 📊 ANALYTICS E TRACKING

### Páginas Mais Acessadas
1. `/admin` - Home Operacional
2. `/admin/patio` - Pátio Kanban
3. `/gestao/bi` - BI Overview
4. `/admin/ordens-servico` - Lista de OS
5. `/gestao/financeiro` - Dashboard Financeiro

### Tempo Médio por Página
- Home: 2-3 minutos
- Pátio Kanban: 5-10 minutos
- BI Overview: 3-5 minutos
- Configuração de OS: 8-12 minutos

---

## 🔗 LINKS EXTERNOS

### Integrações
- **Kommo CRM**: https://[subdomain].kommo.com
- **Telegram Bot**: https://t.me/[bot_name]

### Documentação
- **Supabase Docs**: https://supabase.com/docs
- **React 19 Docs**: https://react.dev
- **Shadcn/UI**: https://ui.shadcn.com

---

**Última Atualização**: 22 de Janeiro de 2026  
**Versão**: 1.0  
**Status**: ✅ Todas as rotas funcionais em produção
