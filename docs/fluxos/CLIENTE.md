# Fluxo Cliente - Doctor Auto Prime

## Visão Geral
Jornada do cliente final que utiliza o app para acompanhar seus veículos e serviços na oficina.

---

## Rotas Existentes

| Rota | Página | Protegida | Descrição |
|------|--------|-----------|-----------|
| `/` | Index | Não | Home pública |
| `/login` | Login | Não | Autenticação |
| `/register` | Register | Não | Cadastro |
| `/cliente/dashboard` | ClienteDashboard | Sim | Dashboard principal |
| `/agenda` | Agenda | Sim | Agendamentos |
| `/novo-agendamento` | NovoAgendamento | Sim | Criar agendamento |
| `/agendamento-sucesso` | AgendamentoSucesso | Sim | Confirmação |
| `/reagendamento` | Reagendamento | Sim | Reagendar serviço |
| `/historico` | Historico | Sim | Histórico de serviços |
| `/performance` | Performance | Sim | Métricas do veículo |
| `/veiculo/:id` | VehicleDetails | Sim | Detalhes do veículo |
| `/servico/:id` | ServicoDetalhes | Sim | Detalhes do serviço |
| `/orcamento/:id` | OrcamentoCliente | Sim | Ver orçamento |
| `/profile` | Profile | Sim | Perfil do usuário |
| `/configuracoes` | Configuracoes | Sim | Configurações |
| `/avisos` | Avisos | Sim | Notificações |
| `/blog` | Blog | Não | Conteúdo/Promoções |
| `/promocoes` | Promocoes | Não | Promoções |

---

## Componentes do Dashboard Cliente

### Header
- Logo Doctor Auto Prime
- Botões de navegação (Cliente, Admin, Gestão)
- Ícone de perfil

### Cards Principais
1. **Meus Veículos** - Lista de veículos do cliente
2. **Lembretes** - Notificações pendentes
3. **Promoções** - Ofertas e novidades

### Redes Sociais
- Instagram
- YouTube
- TikTok
- Blog

### Bottom Navigation
- Home
- Agenda
- Histórico
- Performance

---

## Integrações

### Supabase
- `profiles` - Dados do usuário
- `ordens_servico` - Veículos e serviços

---

## Pendências / Melhorias
- [ ] Separar login cliente do login funcionário
- [ ] ...

