
# Plano: Telas de Login Separadas (Cliente vs Admin)

## Objetivo
Criar duas experiências de login distintas:
- **Login Cliente** (`/login`) - focado em simplicidade e acessibilidade
- **Login Admin** (`/admin/login`) - visual corporativo e profissional

---

## O que será implementado

### 1. Nova Página de Login Admin
Criar `src/pages/admin/AdminLogin.tsx` com:
- Visual escuro/corporativo diferenciado
- Logo da empresa destacado
- Campos de email e senha
- Acesso rápido via Google OAuth
- Badge indicando "Área Restrita" ou "Painel Administrativo"
- Redirecionamento automático para `/admin` após login

### 2. Ajuste no Login Cliente
Manter `src/pages/Login.tsx` como está, mas:
- Após login, verificar se é admin/gestao para redirecionar corretamente
- Manter foco em clientes (visual mais leve)

### 3. Rotas Atualizadas
No `src/App.tsx`:
- Adicionar rota `/admin/login` para o login de admin
- Manter `/login` para clientes
- Ajustar redirecionamentos pós-login baseados no role

---

## Diferenças Visuais

| Aspecto | Login Cliente | Login Admin |
|---------|--------------|-------------|
| Fundo | Gradiente claro | Escuro/corporativo |
| Tema | Amigável, mobile-first | Profissional, desktop |
| Cadastro | Link para registro | Sem opção de auto-registro |
| Badge | Nenhum | "Painel Administrativo" |
| Ícone | Logo colorido | Logo com badge de segurança |

---

## Detalhes Técnicos

### Arquivos a criar:
- `src/pages/admin/AdminLogin.tsx` - nova página de login admin

### Arquivos a modificar:
- `src/App.tsx` - adicionar rota `/admin/login`
- `src/pages/Login.tsx` - pequenos ajustes no redirecionamento

### Fluxo de autenticação:
1. Admin acessa `/admin/login`
2. Faz login com email/senha ou Google
3. Sistema verifica role na tabela `user_roles`
4. Se role = `admin`, `gestao` ou `dev` -> redireciona para `/admin` ou `/gestao`
5. Se role = `user` -> mostra erro (acesso negado)

---

## Resultado Esperado
- Clientes usam `/login` - experiência simplificada
- Equipe interna usa `/admin/login` - visual profissional
- Proteção extra: login admin não permite auto-registro
