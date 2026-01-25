# 🧪 Página de Teste - Doctor Auto Prime

## 📋 Descrição

Página de teste criada para o sistema **Doctor Auto Prime**, um CRM/ERP Multi-Empresa para Oficinas Mecânicas Premium. Esta página permite validar funcionalidades, componentes e integrações do sistema de forma organizada e visual.

---

## 🎯 Objetivo

A página de teste foi desenvolvida para:

- **Validar autenticação** e contexto de usuário
- **Verificar permissões RBAC** (Role-Based Access Control)
- **Testar componentes UI** do Shadcn/UI
- **Monitorar integrações** com serviços externos
- **Facilitar debugging** durante o desenvolvimento

---

## 🚀 Como Acessar

### URL da Página
```
/teste
```

### Requisitos de Acesso
- ✅ Usuário deve estar **autenticado**
- ✅ Qualquer role pode acessar (cliente, admin, gestão, dev)
- ✅ Layout: **AdminLayout** (com sidebar e header)

---

## 📂 Estrutura da Página

A página está organizada em **3 abas principais**:

### 1️⃣ **Sistema**
Exibe informações do usuário e permissões de acesso.

**Componentes:**
- **Informações do Usuário**
  - Email
  - ID do Usuário
  - Role (do contexto de autenticação)
  - Role (do hook `useUserRole`)

- **Permissões de Acesso**
  - Acesso Cliente
  - Acesso Admin
  - Acesso Gestão
  - Acesso Dev

### 2️⃣ **Componentes**
Permite testar componentes UI e executar validações.

**Funcionalidades:**
- Campo de input para testes
- Botão "Executar Testes" que valida:
  - ✅ Autenticação
  - ✅ Permissões (Role)
  - ✅ Hook useUserRole
  - ✅ Valor do input de teste
  - ✅ Ambiente (Dev/Produção)
- Exibição de badges de status
- Resultados visuais com ícones e mensagens

### 3️⃣ **Integração**
Verifica conexões com serviços externos.

**Status Monitorados:**
- Supabase Client
- Auth Context
- React Router

---

## 🛠️ Tecnologias Utilizadas

### Frontend
- **React 19** com TypeScript
- **Shadcn/UI** - Componentes UI
- **Lucide Icons** - Sistema de ícones
- **TailwindCSS** - Estilização

### Componentes Shadcn/UI
- `Card`, `CardContent`, `CardHeader`, `CardTitle`, `CardDescription`
- `Button`
- `Input`, `Label`
- `Tabs`, `TabsContent`, `TabsList`, `TabsTrigger`
- `Badge`
- `Alert`, `AlertDescription`, `AlertTitle`

### Hooks Personalizados
- `useAuth()` - Contexto de autenticação
- `useUserRole()` - Hook para obter role do usuário

---

## 📝 Código de Implementação

### Arquivo Criado
```
src/pages/Teste.tsx
```

### Rota Adicionada no App.tsx
```tsx
<Route path="/teste" element={
    <ProtectedRoute>
        <AdminLayout><Teste /></AdminLayout>
    </ProtectedRoute>
} />
```

### Import Adicionado
```tsx
import Teste from '@/pages/Teste'
```

---

## 🎨 Interface Visual

### Layout
- **Container**: Máximo 6xl, centralizado
- **Espaçamento**: Padding de 6 unidades
- **Responsividade**: Grid adaptativo (1 coluna mobile, 2 colunas desktop)

### Cores e Estados
- ✅ **Sucesso**: Verde (`text-green-500`)
- ❌ **Erro**: Vermelho (`text-red-500`)
- ⚠️ **Aviso**: Amarelo (`text-yellow-500`)

### Badges
- **Default**: Azul
- **Secondary**: Cinza
- **Destructive**: Vermelho
- **Outline**: Borda apenas

---

## 🧪 Testes Implementados

### 1. Teste de Autenticação
- Verifica se o usuário está autenticado
- Exibe email do usuário

### 2. Teste de Permissões (Role)
- Verifica role do contexto de autenticação
- Exibe role detectada

### 3. Teste do Hook useUserRole
- Valida funcionamento do hook personalizado
- Exibe role do hook

### 4. Teste de Input
- Captura valor digitado no campo de teste
- Valida se há conteúdo inserido

### 5. Teste de Ambiente
- Detecta modo de execução (Dev/Produção)
- Usa `import.meta.env.DEV`

---

## 🔧 Como Usar

### 1. Executar Testes
1. Acesse `/teste` no navegador
2. Vá para a aba **"Componentes"**
3. Digite algo no campo "Campo de Teste"
4. Clique em **"Executar Testes"**
5. Veja os resultados com status visual

### 2. Verificar Permissões
1. Acesse a aba **"Sistema"**
2. Veja suas informações de usuário
3. Confira as permissões baseadas na sua role

### 3. Monitorar Integrações
1. Acesse a aba **"Integração"**
2. Verifique status das conexões
3. Identifique problemas de integração

---

## 📊 Matriz de Permissões

| Role    | Acesso Cliente | Acesso Admin | Acesso Gestão | Acesso Dev |
|---------|----------------|--------------|---------------|------------|
| cliente | ✅             | ❌           | ❌            | ❌         |
| admin   | ✅             | ✅           | ❌            | ❌         |
| gestao  | ✅             | ❌           | ✅            | ❌         |
| dev     | ✅             | ✅           | ✅            | ✅         |

---

## 🚀 Próximos Passos

### Melhorias Futuras
- [ ] Adicionar testes de conexão com Supabase
- [ ] Implementar testes de integração com Kommo CRM
- [ ] Adicionar validação de APIs de IA (15 agentes)
- [ ] Criar testes de performance
- [ ] Adicionar logs de debug
- [ ] Implementar exportação de resultados

### Expansões Planejadas
- [ ] Teste de upload de arquivos
- [ ] Teste de formulários complexos
- [ ] Validação de fluxos do Pátio Kanban
- [ ] Teste de notificações
- [ ] Simulação de cenários de erro

---

## 📞 Suporte

Para dúvidas ou problemas com a página de teste:

- **Developer**: Thales Oliveira
- **Email**: toliveira1802@gmail.com
- **Repositório**: https://github.com/toliveira1802-sketch/doctorautoprime

---

## 📄 Licença

Propriedade de Doctor Auto Prime © 2026

---

**Criado em**: 24 de Janeiro de 2026  
**Versão**: 1.0  
**Status**: ✅ Funcional
