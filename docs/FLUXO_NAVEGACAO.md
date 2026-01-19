# Mapa de Navegação - Doctor Auto Prime

> Documentação completa do fluxo de navegação entre telas

---

## 📋 Índice

1. [Fluxo de Autenticação](#fluxo-de-autenticação)
2. [Área do Cliente](#área-do-cliente)
3. [Painel Administrativo](#painel-administrativo)
4. [Área de Gestão](#área-de-gestão)
5. [Páginas Públicas](#páginas-públicas)
6. [Navegação Global](#navegação-global)

---

## 🔐 Fluxo de Autenticação

| DE | PARA | AÇÃO | DESCRIÇÃO |
|----|------|------|-----------|
| `/login` | `/register` | Link "Criar conta" | Novo usuário |
| `/login` | `/` | Login com sucesso | Redireciona para Home |
| `/register` | `/verify-otp` | Cadastro realizado | Verificação de telefone/email |
| `/verify-otp` | `/biometric-setup` | Código validado | Configurar biometria (opcional) |
| `/biometric-setup` | `/` | Configuração concluída | Redireciona para Home |
| Qualquer página | `/login` | Sessão expirada | Redirecionamento automático |

---

## 🏠 Área do Cliente

### Home (`/`)

| PARA | AÇÃO | COMPONENTE |
|------|------|------------|
| `/agenda` | Menu inferior | `BottomNavigation` |
| `/profile` | Menu inferior | `BottomNavigation` |
| `/avisos` | Menu inferior (sino) | `BottomNavigation` |
| `/novo-agendamento` | Botão "Agendar Serviço" | `ActionButtons` |
| `/veiculo/:vehicleId` | Clique no card do veículo | `MyVehiclesSection` |
| `/servico/:vehicleId` | Clique em "Ver detalhes" do serviço | `MyVehiclesSection` |
| `/blog` | Botão "Blog" | Seção de redes sociais |
| `/historico` | Link no perfil | Via `/profile` |

### Agenda (`/agenda`)

| PARA | AÇÃO | DESCRIÇÃO |
|------|------|-----------|
| `/` | Menu inferior | Voltar para Home |
| `/novo-agendamento` | Botão "+" flutuante | Criar novo agendamento |
| `/reagendamento` | Botão "Reagendar" no card | Alterar data/hora |
| `/servico/:vehicleId` | Clique no agendamento | Ver detalhes do serviço |

### Novo Agendamento (`/novo-agendamento`)

| PARA | AÇÃO | DESCRIÇÃO |
|------|------|-----------|
| `/` | Botão voltar | Cancelar agendamento |
| `/agendamento-sucesso` | Finalizar agendamento | Confirmação |

### Agendamento Sucesso (`/agendamento-sucesso`)

| PARA | AÇÃO | DESCRIÇÃO |
|------|------|-----------|
| `/` | Botão "Voltar ao início" | Retorna à Home |
| `/agenda` | Botão "Ver minha agenda" | Ver agendamentos |

### Reagendamento (`/reagendamento`)

| PARA | AÇÃO | DESCRIÇÃO |
|------|------|-----------|
| `/agenda` | Botão voltar | Cancelar alteração |
| `/agendamento-sucesso` | Confirmar reagendamento | Sucesso |

### Detalhes do Veículo (`/veiculo/:vehicleId`)

| PARA | AÇÃO | DESCRIÇÃO |
|------|------|-----------|
| `/` | Botão voltar | Retorna à Home |
| `/novo-agendamento` | Botão "Agendar Serviço" | Agendar para este veículo |
| `/historico` | Link "Ver histórico" | Histórico deste veículo |

### Detalhes do Serviço (`/servico/:vehicleId`)

| PARA | AÇÃO | DESCRIÇÃO |
|------|------|-----------|
| `/` | Botão voltar | Retorna à Home |
| `tel:` | Botão "Ligar para oficina" | Abre discador |

### Histórico (`/historico`)

| PARA | AÇÃO | DESCRIÇÃO |
|------|------|-----------|
| `/` | Menu inferior | Retorna à Home |
| `/profile` | Menu inferior | Vai para perfil |

### Perfil (`/profile`)

| PARA | AÇÃO | DESCRIÇÃO |
|------|------|-----------|
| `/` | Menu inferior | Retorna à Home |
| `/historico` | Link "Ver histórico" | Histórico de serviços |
| `/configuracoes` | Ícone engrenagem | Configurações do app |
| `/login` | Botão "Sair" | Logout |

### Configurações (`/configuracoes`)

| PARA | AÇÃO | DESCRIÇÃO |
|------|------|-----------|
| `/profile` | Botão voltar | Retorna ao perfil |

### Avisos (`/avisos`)

| PARA | AÇÃO | DESCRIÇÃO |
|------|------|-----------|
| `/` | Menu inferior | Retorna à Home |
| `/novo-agendamento` | Clique no alerta | Agendar serviço sugerido |

---

## 🔧 Painel Administrativo

### Dashboard Admin (`/admin`)

| PARA | AÇÃO | COMPONENTE |
|------|------|------------|
| `/admin/ordens-servico` | Menu lateral | `AppSidebar` |
| `/admin/patio` | Menu lateral | `AppSidebar` |
| `/admin/agendamentos` | Menu lateral | `AppSidebar` |
| `/admin/clientes` | Menu lateral | `AppSidebar` |
| `/admin/servicos` | Menu lateral | `AppSidebar` |
| `/admin/financeiro` | Menu lateral | `AppSidebar` |
| `/admin/analytics-mecanicos` | Menu lateral | `AppSidebar` |
| `/admin/feedback-mecanicos` | Menu lateral | `AppSidebar` |
| `/admin/configuracoes` | Menu lateral | `AppSidebar` |
| `/gestao` | Menu lateral | `AppSidebar` |
| `/admin/nova-os` | Botão "+ Nova OS" | Header |

### Ordens de Serviço (`/admin/ordens-servico`)

| PARA | AÇÃO | DESCRIÇÃO |
|------|------|-----------|
| `/admin` | Menu lateral | Voltar ao dashboard |
| `/admin/nova-os` | Botão "+ Nova OS" | Criar nova OS |
| `/admin/ordens-servico/:osId` | Clique na linha da tabela | Ver detalhes |

### Nova OS (`/admin/nova-os`)

| PARA | AÇÃO | DESCRIÇÃO |
|------|------|-----------|
| `/admin/ordens-servico` | Botão voltar | Cancelar criação |
| `/admin/ordens-servico/:osId` | OS criada com sucesso | Ver OS criada |

### Detalhes da OS (`/admin/ordens-servico/:osId`)

| PARA | AÇÃO | DESCRIÇÃO |
|------|------|-----------|
| `/admin/ordens-servico` | Botão voltar | Voltar à lista |
| `/orcamento/:osId` | Botão "Enviar orçamento" | Abre link público (nova aba) |
| `whatsapp://` | Botão WhatsApp | Envia link do orçamento |

### Pátio (`/admin/patio`)

| PARA | AÇÃO | DESCRIÇÃO |
|------|------|-----------|
| `/admin` | Menu lateral | Voltar ao dashboard |
| `/admin/patio/:patioId` | Clique no card | Ver detalhes do veículo |

### Detalhes do Pátio (`/admin/patio/:patioId`)

| PARA | AÇÃO | DESCRIÇÃO |
|------|------|-----------|
| `/admin/patio` | Botão voltar | Voltar ao Kanban |
| `/admin/ordens-servico/:osId` | Link "Ver OS" | Abrir OS relacionada |

### Agendamentos Admin (`/admin/agendamentos`)

| PARA | AÇÃO | DESCRIÇÃO |
|------|------|-----------|
| `/admin` | Menu lateral | Voltar ao dashboard |
| `/admin/clientes` | Clique no cliente | Ver ficha do cliente |

### Clientes (`/admin/clientes`)

| PARA | AÇÃO | DESCRIÇÃO |
|------|------|-----------|
| `/admin` | Menu lateral | Voltar ao dashboard |
| Modal | Clique no cliente | Abrir detalhes (modal) |

### Financeiro (`/admin/financeiro`)

| PARA | AÇÃO | DESCRIÇÃO |
|------|------|-----------|
| `/admin` | Menu lateral | Voltar ao dashboard |

### Analytics Mecânicos (`/admin/analytics-mecanicos`)

| PARA | AÇÃO | DESCRIÇÃO |
|------|------|-----------|
| `/admin` | Menu lateral | Voltar ao dashboard |
| `/admin/feedback-mecanicos` | Menu lateral | Dar feedback |

### Feedback Mecânicos (`/admin/feedback-mecanicos`)

| PARA | AÇÃO | DESCRIÇÃO |
|------|------|-----------|
| `/admin` | Menu lateral | Voltar ao dashboard |

### Serviços (`/admin/servicos`)

| PARA | AÇÃO | DESCRIÇÃO |
|------|------|-----------|
| `/admin` | Menu lateral | Voltar ao dashboard |

### Configurações Admin (`/admin/configuracoes`)

| PARA | AÇÃO | DESCRIÇÃO |
|------|------|-----------|
| `/admin` | Menu lateral | Voltar ao dashboard |

---

## 📊 Área de Gestão

### Dashboards (`/gestao`)

| PARA | AÇÃO | DESCRIÇÃO |
|------|------|-----------|
| `/admin` | Menu lateral | Voltar ao admin |
| `/gestao/rh` | Card "Recursos Humanos" | Gestão de mecânicos |
| `/gestao/operacoes` | Card "Operações" | KPIs operacionais |
| `/gestao/financeiro` | Card "Financeiro" | BI financeiro |
| `/gestao/tecnologia` | Card "Tecnologia" | Métricas técnicas |
| `/gestao/comercial` | Card "Comercial" | Análise comercial |
| `/gestao/usuarios` | Card "Usuários" | Gestão de permissões |
| `/gestao/melhorias` | Card "Melhorias" | Sugestões |
| `/gestao/dashboard/:dashboardId` | Card personalizado | Dashboard customizado |

### RH (`/gestao/rh`)

| PARA | AÇÃO | DESCRIÇÃO |
|------|------|-----------|
| `/gestao` | Botão voltar | Voltar aos dashboards |
| `/admin/analytics-mecanicos` | Link interno | Ver analytics |

### Operações (`/gestao/operacoes`)

| PARA | AÇÃO | DESCRIÇÃO |
|------|------|-----------|
| `/gestao` | Botão voltar | Voltar aos dashboards |

### Financeiro Gestão (`/gestao/financeiro`)

| PARA | AÇÃO | DESCRIÇÃO |
|------|------|-----------|
| `/gestao` | Botão voltar | Voltar aos dashboards |

### Tecnologia (`/gestao/tecnologia`)

| PARA | AÇÃO | DESCRIÇÃO |
|------|------|-----------|
| `/gestao` | Botão voltar | Voltar aos dashboards |

### Comercial (`/gestao/comercial`)

| PARA | AÇÃO | DESCRIÇÃO |
|------|------|-----------|
| `/gestao` | Botão voltar | Voltar aos dashboards |

### Usuários (`/gestao/usuarios`)

| PARA | AÇÃO | DESCRIÇÃO |
|------|------|-----------|
| `/gestao` | Botão voltar | Voltar aos dashboards |

### Melhorias (`/gestao/melhorias`)

| PARA | AÇÃO | DESCRIÇÃO |
|------|------|-----------|
| `/gestao` | Botão voltar | Voltar aos dashboards |

### Dashboard View (`/gestao/dashboard/:dashboardId`)

| PARA | AÇÃO | DESCRIÇÃO |
|------|------|-----------|
| `/gestao` | Botão voltar | Voltar aos dashboards |

---

## 🌐 Páginas Públicas

### Orçamento Cliente (`/orcamento/:osId`)

| PARA | AÇÃO | DESCRIÇÃO |
|------|------|-----------|
| Nenhum | Página isolada | Cliente aprova/recusa itens |
| `tel:` | Botão ligar | Contato com oficina |
| `whatsapp://` | Botão WhatsApp | Contato via WhatsApp |

---

## 🧭 Navegação Global

### Menu Inferior (Cliente) - `BottomNavigation`

| ÍCONE | ROTA | DESCRIÇÃO |
|-------|------|-----------|
| 🏠 Home | `/` | Página inicial |
| 📅 Agenda | `/agenda` | Agendamentos |
| 🔔 Avisos | `/avisos` | Alertas e notificações |
| 👤 Perfil | `/profile` | Dados do usuário |

### Menu Lateral (Admin) - `AppSidebar`

| SEÇÃO | ROTAS |
|-------|-------|
| **Operacional** | `/admin`, `/admin/ordens-servico`, `/admin/patio`, `/admin/agendamentos` |
| **Cadastros** | `/admin/clientes`, `/admin/servicos` |
| **Equipe** | `/admin/analytics-mecanicos`, `/admin/feedback-mecanicos` |
| **Financeiro** | `/admin/financeiro` |
| **Sistema** | `/admin/configuracoes`, `/admin/documentacao` |
| **Gestão** | `/gestao` |

---

## 🔄 Fluxos Principais

### Fluxo: Cliente Agenda Serviço
```
/ → /novo-agendamento → /agendamento-sucesso → /
```

### Fluxo: Admin Cria OS e Envia Orçamento
```
/admin → /admin/nova-os → /admin/ordens-servico/:id → /orcamento/:id (cliente)
```

### Fluxo: Gestão Analisa Performance
```
/gestao → /gestao/rh → /admin/analytics-mecanicos
```

### Fluxo: Cliente Acompanha Serviço
```
/ → /servico/:id (timeline em tempo real)
```

---

## 📱 Responsividade

| Dispositivo | Navegação Principal |
|-------------|---------------------|
| Mobile | `BottomNavigation` (fixo inferior) |
| Tablet | `BottomNavigation` ou `AppSidebar` (colapsável) |
| Desktop | `AppSidebar` (expandido) |

---

## 🔒 Controle de Acesso

| Rota | Acesso Mínimo | Observação |
|------|---------------|------------|
| `/` a `/configuracoes` | `user` | Área do cliente |
| `/admin/*` | `admin` | Painel operacional |
| `/admin/financeiro` | `gestao` | Dados sensíveis |
| `/admin/analytics-mecanicos` | `gestao` | Dados sensíveis |
| `/gestao/*` | `gestao` | BI e alta gestão |
| `/gestao/usuarios` | `dev` ou `gestao` | Gestão de permissões |
| `/orcamento/:osId` | Público | Sem autenticação |

> ⚠️ **Nota**: Autenticação temporariamente desabilitada para desenvolvimento.

---

*Última atualização: Janeiro 2025*
