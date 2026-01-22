# 🤖 AI Copilot Instructions - Doctor Auto Prime

**Project**: Multi-company CRM/ERP for premium automotive repair shops  
**Stack**: React 19 + TypeScript + Vite + Supabase + TailwindCSS  
**Status**: Production (V1.1) - Vercel + Supabase hosting

---

## 🏗️ Architecture Overview

### Three-Tier Stack
- **Frontend**: React 19 + Vite (port 8080), builds to Vercel
- **Backend**: Supabase (PostgreSQL + Auth + RLS + Edge Functions)
- **External**: Kommo CRM integration, IA agents, Telegram webhook

### Role-Based Access (RBAC)
The system enforces **9 permission levels** via Supabase RLS + client-side guards:

| Role | Primary View | Key Authority |
|------|------------|---|
| `dev` | Full system + all companies | Master bypass (email: toliveira1802@gmail.com, sophia.duarte1@hotmail.com) |
| `admin` | Gestão (management) view | Company operations, all modules |
| `gestao` | Gestão (management) view | Strategic & operational modules |
| `user` | Cliente (client) view | Own agenda + vehicle details |

**Implementation**: `src/hooks/useUserRole.ts` checks master emails first, then `user_roles` table. Frontend redirects based on role in `src/App.tsx`.

### Multi-Tenancy Pattern
- **Company Selection**: `CompanyContext` (src/contexts/CompanyContext.tsx) manages selected company + "all companies" view
- **Isolation**: All queries filter by `empresa_id` at Supabase RLS policy level
- **Mock Data**: Falls back to local data if Supabase unavailable (development mode)

---

## 📁 Project Structure & Key Files

```
src/
├── components/        # Shadcn/ui + domain components
├── contexts/         # AuthContext, CompanyContext (global state)
├── hooks/            # useUserRole, useTrelloCards, useKommo, custom
├── integrations/     # Supabase client, Kommo API, IA service layers
├── lib/              # Utility functions (cn, mock-data, supabase config)
├── pages/            # Route-based pages by role
│   ├── gestao/      # Management view (BI, operations, HR, finance)
│   ├── admin/       # Admin operations (patio kanban, OS, clients)
│   └── cliente/     # Client-facing (agenda, profile, vehicle details)
├── services/ai/      # AI agent integrations
└── types/            # TypeScript type definitions (from Supabase)

docs/
├── mapas/            # Visual architecture diagrams (ERD, RBAC matrix, etc)
└── GUIA_ROTAS.md    # Complete route mapping by role
```

---

## 🔑 Critical Patterns & Conventions

### Authentication & Role Enforcement
```typescript
// useUserRole.ts handles the full flow:
// 1. Master email bypass (MASTER_EMAILS array)
// 2. Fallback to user_roles table lookup
// 3. Dev mode: no-auth defaults to 'admin'
// 4. Always subscribe to auth state changes

// In components:
import { useAuth } from '@/contexts/AuthContext'  // Session + user data
import { useUserRole } from '@/hooks/useUserRole'  // Role + permissions
```

**Route Protection**: `ProtectedRoute` wrapper in App.tsx validates `requiredRoles` against user role.

### Company Context Usage
```typescript
// Get selected company + all companies
const { selectedCompany, companies, selectCompany, isAllCompaniesView } = useContext(CompanyContext)

// Always include empresa_id in queries:
supabase.from('table').select('*').eq('empresa_id', selectedCompany?.id)
```

### Supabase Client Pattern
- **Client initialization**: `src/integrations/supabase/client.ts` (auto-generated from Supabase schema)
- **Import**: `import { supabase } from '@/integrations/supabase/client'`
- **RLS**: All table queries automatically filtered by RLS policies (requires auth context)
- **Service Role**: API routes (api/kommo/webhook.ts) use `SUPABASE_SERVICE_ROLE_KEY` to bypass RLS for webhooks

### TypeScript Types
- **Auto-generated**: `src/integrations/supabase/types.ts` from Supabase schema (25+ tables)
- **Custom types**: `src/types/database.ts` extends Supabase types for application domain
- **Always use strict typing**: No `any` type unless absolutely necessary

---

## 🛠️ Developer Workflows

### Local Development
```bash
npm run dev          # Start Vite dev server on port 8080
npm run build        # Production build (vite build)
npm run lint         # ESLint check
npm run test         # Vitest suite (jsdom environment)
npm run test:watch   # Watch mode
```

### Database Migrations
- Supabase migrations stored in `supabase/migrations/`
- Use Supabase CLI for local development: `supabase local start`
- RLS policies are critical—always test with different user roles

### Build & Deploy
- **Vercel**: Auto-deploys on `main` branch push
- **Environment variables**: `.env` contains Supabase credentials (VITE_SUPABASE_*)
- **PWA support**: vite-plugin-pwa configured for offline support

### Testing
- **Framework**: Vitest + React Testing Library
- **Setup**: `src/test/setup.ts` initializes test environment
- **Config**: `vitest.config.ts` uses jsdom + alias paths

---

## 🔌 Integration Points

### Kommo CRM
- **API routes**: `api/kommo/webhook.ts` handles incoming webhooks
- **Service role**: Uses `SUPABASE_SERVICE_ROLE_KEY` to bypass RLS for webhook processing
- **Tables**: `kommo_webhooks`, `kommo_contacts` for tracking & sync
- **Pattern**: POST to `/api/kommo/webhook`, parse event type, update Supabase tables

### External IA Services
- **Directory**: `src/services/ai/` (Scout, Comm, Francisco, etc.)
- **Pattern**: Each agent as separate service with own request/response types
- **Integration**: Called from gestao pages to generate summaries, analyses

### Telegram (Automation)
- Scheduled agenda suggestions via Telegram bot
- Pattern: Check in gestao/MigracaoTrello.tsx for current implementation

---

## ⚙️ Project-Specific Conventions

### Styling
- **Framework**: TailwindCSS + Shadcn/ui components
- **Utility**: `cn()` function (from clsx + tailwind-merge) combines classNames
- **Dark mode**: Next-themes integrated, toggle in profile

### Component Organization
- **Layout**: `components/layout/` (Header, Sidebar, BottomNav)
- **Domain components**: Organized by feature (auth/, gestao/, patio/, etc.)
- **UI library**: `components/ui/` for Shadcn component wrappers

### Form Handling
- **Library**: React Hook Form + Zod for validation
- **Pattern**: Form components use RHF controller pattern
- **Validation**: Zod schemas defined inline or in types file

### State Management
- **Global**: React Context (Auth, Company, Theme)
- **Server state**: TanStack React Query for remote data
- **Local**: React useState for UI state

---

## 🚨 Common Pitfalls

1. **Forget empresa_id filter**: All queries must include selected company ID or RLS will reject them
2. **Skip role checks**: Don't assume user role—always validate via `useUserRole()` or `useAuth()`
3. **Missing TypeScript**: Use auto-generated Supabase types, don't create raw queries
4. **Environment variables**: Never hardcode Supabase URL/keys—use VITE_* prefixed vars (frontend accessible)
5. **RLS bypass only in APIs**: Service role key is only for webhooks (api/), not frontend code

---

## 📚 Key Documentation Files

| File | Purpose |
|------|---------|
| [MAPA_SISTEMA_COMPLETO.md](../MAPA_SISTEMA_COMPLETO.md) | Full system architecture, database schema, IA ecosystem |
| [GUIA_ROTAS.md](../docs/GUIA_ROTAS.md) | Complete route mapping by user role |
| [RESUMO_EXECUTIVO.md](../RESUMO_EXECUTIVO.md) | Business overview, metrics, roadmap |
| [src/pages/gestao/bi/README.md](../src/pages/gestao/bi/README.md) | BI module specifics |

---

## ✅ Before Committing

- [ ] TypeScript compilation passes (`npm run build`)
- [ ] No ESLint errors (`npm run lint`)
- [ ] Company/role context used correctly (empresa_id filters)
- [ ] RLS policies tested with multiple user roles
- [ ] UI respects mobile-first design (bottom nav for client view, sidebar for admin)
- [ ] Dark mode visual tested
