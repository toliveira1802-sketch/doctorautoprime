# Doctor Auto Prime 🚗

CRM completo para oficinas mecânicas, desenvolvido para gerenciar todo o ciclo de atendimento ao cliente.

## 🚀 Stack Tecnológico

- **Frontend:** React 18 + TypeScript + Vite
- **Estilização:** Tailwind CSS + shadcn/ui
- **Backend:** Lovable Cloud (Supabase)
- **Autenticação:** Email/Telefone + OTP
- **Database:** PostgreSQL
- **State Management:** React Query (TanStack)

## 📋 Pré-requisitos

- Node.js 18+ 
- npm ou bun

## 🛠️ Instalação Local

```bash
# 1. Clone o repositório
git clone <YOUR_GIT_URL>

# 2. Acesse o diretório
cd doctor-auto-prime

# 3. Instale as dependências
npm install

# 4. Inicie o servidor de desenvolvimento
npm run dev
```

O app estará disponível em `http://localhost:5173`

## 📁 Estrutura do Projeto

```
src/
├── components/
│   ├── auth/          # Autenticação (login, registro, OTP)
│   ├── gestao/        # Dashboards de gestão
│   ├── home/          # Componentes da home
│   ├── layout/        # Header, Sidebar, Navigation
│   ├── patio/         # Gestão do pátio (Kanban)
│   ├── profile/       # Perfil do usuário
│   ├── service/       # Timeline de serviços
│   ├── ui/            # shadcn/ui components
│   └── vehicle/       # Gestão de veículos
├── contexts/          # AuthContext
├── hooks/             # Custom hooks
├── pages/             # Páginas da aplicação
│   ├── admin/         # Painel administrativo
│   └── gestao/        # Dashboards de gestão
├── integrations/      # Supabase client e types
└── utils/             # Utilitários
```

## 👥 Roles de Usuário

| Role | Descrição | Acesso |
|------|-----------|--------|
| `admin` | Administrador | Acesso completo |
| `gestao` | Gestão | Dashboards e relatórios |
| `user` | Cliente | Área do cliente |
| `dev` | Desenvolvedor | Recursos de desenvolvimento |

## 🔧 Scripts Disponíveis

```bash
npm run dev      # Servidor de desenvolvimento
npm run build    # Build de produção
npm run preview  # Preview do build
npm run lint     # Verificação de lint
npm run test     # Executa testes
```

## 🌐 URLs do Projeto

- **Preview:** https://id-preview--ad0c6e08-a053-4a31-ba05-c0434697e9f4.lovable.app
- **Produção:** https://doctorautoprime.lovable.app

## 📱 PWA

O app suporta instalação como PWA em dispositivos móveis. Acesse `/install` para instruções.

## 🔐 Variáveis de Ambiente

O projeto utiliza Lovable Cloud, que configura automaticamente as variáveis necessárias:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `VITE_SUPABASE_PROJECT_ID`

## 📖 Documentação Adicional

Para documentação detalhada do projeto, consulte:
- [docs/PROJETO.md](docs/PROJETO.md) - Documentação completa do sistema

## 🤝 Contribuindo

1. Faça fork do projeto
2. Crie uma branch (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto é proprietário da Doctor Auto Prime.
