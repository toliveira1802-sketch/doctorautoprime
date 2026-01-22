# 🚗 Doctor Auto Prime

> **CRM/ERP Multi-Empresa para Oficinas Mecânicas Premium**  
> **Status**: ✅ V1.1 - Totalmente Funcional em Produção  
> **URL**: https://doctorautoprime.vercel.app

---

## 📚 DOCUMENTAÇÃO COMPLETA DO SISTEMA

### 📊 Resumo Executivo
**[RESUMO_EXECUTIVO.md](./RESUMO_EXECUTIVO.md)**  
Visão geral do sistema, números, roadmap e impacto no negócio. Ideal para apresentações e overview rápido.

### 🗺️ Mapa Completo do Sistema
**[MAPA_SISTEMA_COMPLETO.md](./MAPA_SISTEMA_COMPLETO.md)**  
Documentação técnica detalhada de toda a arquitetura, banco de dados, IAs, fluxos operacionais e integrações.

### 🔗 Guia de Rotas e URLs
**[docs/GUIA_ROTAS.md](./docs/GUIA_ROTAS.md)**  
Mapa completo de todas as rotas do sistema, organizadas por visão e papel, com descrições de acesso.

### 📖 Índice de Documentação
**[docs/README.md](./docs/README.md)**  
Índice central com links rápidos para diagramas, documentação técnica e recursos do sistema.

---

## 🖼️ DIAGRAMAS VISUAIS

Todos os diagramas em alta resolução estão em **[docs/mapas/](./docs/mapas/)**:

| Diagrama | Arquivo | Descrição |
|----------|---------|-----------|
| **Arquitetura do Sistema** | `01_arquitetura_sistema.png` | Frontend, Backend, Integrações, Pátio Kanban, Departamentos, IAs |
| **Mapa de Navegação** | `02_navegacao_fluxo.png` | ProfileSwitcher, 3 visões, módulos, seletor de empresa |
| **Schema do Banco de Dados** | `03_database_schema.png` | ERD completo com 30+ tabelas e relacionamentos |
| **Ecossistema de IA** | `04_ecossistema_ia.png` | 15 agentes em 3 camadas por departamento |
| **Fluxo do Pátio Kanban** | `05_patio_kanban.png` | 9 estágios com durações e agentes de IA |
| **Matriz de Permissões RBAC** | `06_rbac_permissoes.png` | 9 níveis de acesso com matriz completa |

---

## 🚀 QUICK START

### Desenvolvimento Local

```bash
# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento
npm run dev
```

Acesso: http://localhost:8080

### Build de Produção

```bash
# Criar build otimizado
npm run build

# Preview do build
npm run preview
```

### Deploy

O deploy é automático via Vercel ao fazer push para `main`:

```bash
git add .
git commit -m "sua mensagem"
git push origin main
```

---

## 🏗️ STACK TECNOLÓGICO

### Frontend
- **React 19** - Framework UI
- **TypeScript** - Type safety
- **Vite (Rolldown)** - Build tool
- **TailwindCSS** - Styling
- **Shadcn/UI** - Component library
- **Lucide Icons** - Icon system

### Backend
- **Supabase** - Backend as a Service
  - PostgreSQL (Database)
  - Auth (Authentication)
  - RLS (Row Level Security)
  - Edge Functions (Serverless)

### Hosting
- **Vercel** - Frontend hosting
- **Supabase Cloud** - Backend hosting

---

## 🏢 EMPRESAS SUPORTADAS

1. **Doctor Auto Prime** - Unidade Principal
2. **Doctor Auto Bosch** - Unidade Certificada Bosch
3. **Garage 347** - Unidade Boutique
4. **GERAL** - Visão Consolidada (Gestão/Dev apenas)

---

## 🎯 PRINCIPAIS FUNCIONALIDADES

### ✅ Gestão de Clientes (CRM)
- Cadastro completo de clientes e veículos
- Histórico de serviços
- Sistema de fidelidade (Bronze/Prata/Ouro/Platina)
- Integração com Kommo CRM

### ✅ Ordens de Serviço (ERP)
- Criação e gestão de OS
- Orçamentos com margens inteligentes (35-120%)
- Aprovação de clientes
- Controle de peças e mão de obra

### ✅ Pátio Kanban (9 Estágios)
- Rastreamento em tempo real
- Cards coloridos por prioridade
- Atribuição de mecânicos
- Alertas de gargalos
- Histórico completo de movimentações

### ✅ Business Intelligence
- Dashboards consolidados
- Análise de margens
- Funil de vendas
- Performance de mecânicos
- ROI de campanhas

### ✅ Sistema de IA (15 Agentes)
- **Atendimento**: Scout, Comm, Auto
- **Diagnóstico**: Francisco, Ev8, Check
- **Análise**: Thales, Prime, Bia, Juan, Doctor, Atlas, Book

### ✅ Multi-Tenancy
- 3 empresas em 1 sistema
- Isolamento total de dados
- Visão consolidada para gestão
- Seletor de empresa dinâmico

---

## 🔐 SISTEMA DE PERMISSÕES (RBAC)

### Papéis Ativos
- 🛠️ **Dev** - Sistema + IA (Acesso total)
- 📊 **Gestão** - BI + Estratégia (Todos os departamentos)
- 🏭 **Admin** - Operações (POMBAL + Pátio)
- 👁️ **Cliente** - Somente Leitura (Dados pessoais)

### Papéis Inativos
- 👑 Master, 💼 Vendedor, 📞 Atendente, 🔧 Mecânico

---

## 📊 ESTRUTURA DO PROJETO

```
doctorautoprime/
├── src/
│   ├── components/          # Componentes reutilizáveis
│   │   ├── auth/           # ClienteRoute, ProtectedRoute
│   │   ├── layout/         # AppSidebar, AdminLayout, ProfileSwitcher
│   │   └── ui/             # Shadcn/UI components
│   ├── pages/              # Páginas principais
│   │   ├── admin/          # Módulo Operacional (POMBAL)
│   │   ├── gestao/         # Módulo Estratégico (BI + IA)
│   │   └── Index.tsx       # Dashboard Unificado
│   ├── lib/                # Utilitários e Supabase client
│   └── hooks/              # Custom React hooks
├── supabase/
│   └── migrations/         # Migrações do banco de dados
├── docs/                   # Documentação e diagramas
│   ├── mapas/             # Diagramas visuais (PNG)
│   ├── README.md          # Índice de documentação
│   └── GUIA_ROTAS.md      # Guia de rotas
├── public/                 # Assets estáticos
├── MAPA_SISTEMA_COMPLETO.md    # Documentação técnica completa
├── RESUMO_EXECUTIVO.md         # Resumo para apresentação
└── README.md                    # Este arquivo
```

---

## 🔗 LINKS IMPORTANTES

### Produção
- **Aplicação**: https://doctorautoprime.vercel.app
- **Supabase Dashboard**: https://supabase.com/dashboard

### Desenvolvimento
- **Local**: http://localhost:8080
- **Diretório**: `C:\Users\docto\OneDrive\Área de Trabalho\doctorautoprime\`

### Documentação
- **Knowledge Base**: `C:\Users\docto\.gemini\antigravity\knowledge\doctor_auto_prime_project\`
- **Migrações**: `./supabase/migrations/`

---

## 📞 CONTATO TÉCNICO

- **Developer**: Thales Oliveira
- **Email**: toliveira1802@gmail.com
- **Invite Code**: THALES-DEV-2026
- **Papéis**: dev, gestao, admin

---

## 🚀 ROADMAP

### V1.1 - Estabilização (ATUAL - Jan 2026)
- ✅ Pátio Kanban Nativo (9 estágios)
- ✅ Multi-Tenancy (3 empresas)
- ✅ ProfileSwitcher (Cliente/Admin/Gestão)
- ✅ QG das IAs com senha dupla
- ✅ Integração Kommo completa

### V1.2 - Expansão de IA (Q1 2026)
- 🔄 Ativação completa dos 15 agentes
- 🔄 Dashboard de monitoramento de IA
- 🔄 Testes A/B de prompts
- 🔄 Validação automática de diagnósticos

### V1.3 - Mobilidade (Q2 2026)
- 📱 App Mobile (React Native)
- 📸 Upload de fotos de veículos
- 🔔 Push notifications
- 📍 Geolocalização

### V2.0 - Escala (Q3 2026)
- 🏢 Suporte a 10+ empresas
- 🌐 Multi-idioma
- 📊 BI Preditivo (Machine Learning)
- 🤝 Marketplace de peças

---

## 📄 LICENÇA

Propriedade de Doctor Auto Prime © 2026

---

**Última Atualização**: 22 de Janeiro de 2026  
**Versão**: V1.1  
**Status**: ✅ 100% Funcional em Produção
