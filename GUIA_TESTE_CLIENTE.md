# 🧪 Guia de Teste - Visão Cliente

## 🎯 Objetivo
Testar o fluxo completo de um cliente no sistema Doctor Auto Prime, desde o login até a aprovação de um orçamento.

---

## 🔗 **Link de Acesso**
```
https://doctorautoprime.vercel.app
```

---

## 📋 **Checklist de Teste**

### **FASE 1: Login e Acesso** ✅

#### 1.1 - Acessar o Sistema
- [ ] Abrir o link: https://doctorautoprime.vercel.app
- [ ] Verificar se a página de login carrega corretamente
- [ ] Verificar se há opções de login (Google OAuth e Email/Senha)

#### 1.2 - Fazer Login como Cliente
**Opção A - Usar conta existente:**
```
Email: toliveira1802@gmail.com
Senha: [sua senha]
```

**Opção B - Criar nova conta de teste:**
```
1. Clicar em "Criar Conta" ou "Registrar"
2. Preencher dados:
   - Nome: João Silva (exemplo)
   - Email: joao.teste@email.com
   - Senha: Teste@123
   - CPF: 123.456.789-00
   - Telefone: (11) 98765-4321
3. Confirmar cadastro
```

#### 1.3 - Verificar Redirecionamento
- [ ] Após login, verificar se foi redirecionado para o **Dashboard Cliente**
- [ ] Verificar se o nome do usuário aparece no header
- [ ] Verificar se há um menu lateral ou superior

**✅ O que você deve ver:**
```
┌─────────────────────────────────────────────────────────┐
│  🏠 Doctor Auto Prime                    👤 João Silva  │
├─────────────────────────────────────────────────────────┤
│  📋 Minhas Ordens de Serviço                            │
│  ┌─────────────────┐  ┌─────────────────┐              │
│  │ OS #2026-001    │  │ OS #2026-002    │              │
│  │ Status: Aguard. │  │ Status: Pronto  │              │
│  │ R$ 1.500,00     │  │ R$ 850,00       │              │
│  └─────────────────┘  └─────────────────┘              │
└─────────────────────────────────────────────────────────┘
```

---

### **FASE 2: Visualizar Ordens de Serviço** 📋

#### 2.1 - Dashboard Cliente
- [ ] Verificar se há cards/lista de OSs
- [ ] Verificar se cada OS mostra:
  - [ ] Número da OS
  - [ ] Status atual
  - [ ] Valor total
  - [ ] Data de criação
  - [ ] Veículo (placa/modelo)

#### 2.2 - Filtros e Busca
- [ ] Testar filtro por status (Todas, Pendentes, Concluídas)
- [ ] Testar busca por número da OS ou placa
- [ ] Verificar se a lista atualiza corretamente

**✅ Status possíveis:**
```
🔵 Diagnóstico
🟡 Orçamento Enviado
🟠 Aguardando Aprovação
🟢 Aprovado
⚙️ Em Execução
✅ Pronto
🎉 Entregue
❌ Recusado
```

---

### **FASE 3: Visualizar Detalhes da OS** 🔍

#### 3.1 - Abrir uma OS
- [ ] Clicar em uma OS da lista
- [ ] Verificar se abre a página de detalhes

**✅ O que você deve ver:**
```
┌─────────────────────────────────────────────────────────┐
│  OS #2026-001 - Manutenção Preventiva                   │
│  Status: 🟡 Orçamento Enviado                           │
├─────────────────────────────────────────────────────────┤
│  🚗 Veículo: Fiat Uno - ABC-1234                        │
│  📅 Data: 24/01/2026                                    │
│  👤 Cliente: João Silva                                 │
├─────────────────────────────────────────────────────────┤
│  📋 Itens do Orçamento:                                 │
│  ┌───────────────────────────────────────────────────┐ │
│  │ 1. Troca de Óleo              R$ 150,00           │ │
│  │ 2. Filtro de Óleo             R$ 45,00            │ │
│  │ 3. Revisão de Freios          R$ 280,00           │ │
│  │ 4. Alinhamento e Balanceamento R$ 120,00          │ │
│  └───────────────────────────────────────────────────┘ │
│                                                          │
│  💰 Subtotal:        R$ 595,00                          │
│  🎁 Desconto:        R$ 0,00                            │
│  ✅ Total:           R$ 595,00                          │
│                                                          │
│  [✅ Aprovar Orçamento]  [❌ Recusar]                   │
└─────────────────────────────────────────────────────────┘
```

#### 3.2 - Verificar Informações
- [ ] Dados do veículo estão corretos
- [ ] Lista de serviços/peças está completa
- [ ] Valores estão corretos (unitário e total)
- [ ] Há descrição de cada item
- [ ] Há observações/notas (se aplicável)

#### 3.3 - Verificar Anexos (se houver)
- [ ] Fotos do veículo
- [ ] Fotos de peças danificadas
- [ ] Documentos anexados
- [ ] Possibilidade de fazer download

---

### **FASE 4: Aprovar/Recusar Orçamento** ✅❌

#### 4.1 - Testar Aprovação
**Cenário 1: Aprovar Orçamento**
- [ ] Clicar no botão "Aprovar Orçamento"
- [ ] Verificar se aparece modal de confirmação
- [ ] Confirmar aprovação
- [ ] Verificar se o status muda para "Aprovado" 🟢
- [ ] Verificar se aparece mensagem de sucesso
- [ ] Verificar se há opção de assinar digitalmente (se implementado)

**✅ Mensagem esperada:**
```
✅ Orçamento aprovado com sucesso!
Sua ordem de serviço foi enviada para execução.
Você receberá atualizações por email/WhatsApp.
```

**Cenário 2: Recusar Orçamento**
- [ ] Clicar no botão "Recusar"
- [ ] Verificar se aparece campo para motivo da recusa
- [ ] Preencher motivo (ex: "Valor acima do esperado")
- [ ] Confirmar recusa
- [ ] Verificar se o status muda para "Recusado" ❌
- [ ] Verificar se aparece mensagem de confirmação

**✅ Mensagem esperada:**
```
❌ Orçamento recusado
Sua recusa foi registrada. Entraremos em contato em breve
para discutir alternativas.
```

---

### **FASE 5: Acompanhar Status da OS** 📊

#### 5.1 - Timeline de Status
- [ ] Verificar se há uma timeline/histórico de status
- [ ] Verificar se mostra data/hora de cada mudança
- [ ] Verificar se mostra quem fez a mudança (mecânico/atendente)

**✅ Exemplo de Timeline:**
```
📅 24/01/2026 10:30 - OS Criada
📅 24/01/2026 11:15 - Diagnóstico Concluído
📅 24/01/2026 12:00 - Orçamento Enviado
📅 24/01/2026 14:30 - Orçamento Aprovado (por você)
📅 24/01/2026 15:00 - Em Execução (Mecânico: Carlos)
📅 25/01/2026 16:00 - Pronto para Retirada
```

#### 5.2 - Notificações
- [ ] Verificar se há ícone de notificações no header
- [ ] Verificar se mostra notificações de mudança de status
- [ ] Verificar se há opção de marcar como lida

---

### **FASE 6: Histórico de OSs** 📚

#### 6.1 - Visualizar Histórico
- [ ] Voltar para o dashboard
- [ ] Verificar se há seção "Histórico" ou "OSs Anteriores"
- [ ] Verificar se mostra todas as OSs (ativas e concluídas)

#### 6.2 - Filtrar por Período
- [ ] Testar filtro "Últimos 30 dias"
- [ ] Testar filtro "Últimos 3 meses"
- [ ] Testar filtro "Último ano"
- [ ] Testar filtro "Todas"

#### 6.3 - Estatísticas Pessoais
- [ ] Verificar se mostra total gasto
- [ ] Verificar se mostra número de OSs
- [ ] Verificar se mostra serviço mais frequente
- [ ] Verificar se mostra próxima manutenção sugerida

**✅ Exemplo:**
```
📊 Suas Estatísticas:
- Total de OSs: 12
- Valor Total Gasto: R$ 8.450,00
- Ticket Médio: R$ 704,17
- Serviço Mais Frequente: Troca de Óleo
- Próxima Manutenção Sugerida: Revisão de Freios (em 2 meses)
```

---

### **FASE 7: Perfil e Configurações** ⚙️

#### 7.1 - Acessar Perfil
- [ ] Clicar no nome/avatar do usuário
- [ ] Verificar se abre menu de perfil
- [ ] Clicar em "Meu Perfil" ou "Configurações"

#### 7.2 - Editar Dados Pessoais
- [ ] Verificar se pode editar:
  - [ ] Nome
  - [ ] Email
  - [ ] Telefone
  - [ ] Endereço
  - [ ] CPF (somente leitura)
- [ ] Salvar alterações
- [ ] Verificar se aparece mensagem de sucesso

#### 7.3 - Gerenciar Veículos
- [ ] Verificar se há seção "Meus Veículos"
- [ ] Verificar se mostra veículos cadastrados
- [ ] Testar adicionar novo veículo:
  - [ ] Placa
  - [ ] Marca/Modelo
  - [ ] Ano
  - [ ] Cor
  - [ ] KM atual
- [ ] Salvar veículo
- [ ] Verificar se aparece na lista

#### 7.4 - Preferências de Notificação
- [ ] Verificar se há opções de notificação:
  - [ ] Email
  - [ ] WhatsApp
  - [ ] SMS
- [ ] Testar ativar/desativar cada opção
- [ ] Salvar preferências

---

### **FASE 8: Responsividade Mobile** 📱

#### 8.1 - Testar em Mobile
- [ ] Abrir o sistema no celular (ou usar DevTools F12 → Mobile View)
- [ ] Verificar se o layout se adapta
- [ ] Verificar se todos os botões são clicáveis
- [ ] Verificar se o menu lateral vira hamburger menu
- [ ] Testar navegação completa

#### 8.2 - Testar Gestos
- [ ] Swipe para abrir menu (se aplicável)
- [ ] Scroll suave nas listas
- [ ] Zoom em imagens/fotos
- [ ] Pull to refresh (se implementado)

---

### **FASE 9: Casos de Erro** ⚠️

#### 9.1 - Testar Validações
- [ ] Tentar aprovar orçamento sem estar logado (deve redirecionar)
- [ ] Tentar acessar OS de outro cliente (deve bloquear)
- [ ] Tentar editar dados com campos vazios (deve validar)

#### 9.2 - Testar Conexão
- [ ] Desativar internet
- [ ] Tentar carregar página
- [ ] Verificar se mostra mensagem de erro amigável
- [ ] Reativar internet
- [ ] Verificar se reconecta automaticamente

---

## 🐛 **Bugs Conhecidos para Verificar**

### **Prioridade Alta:**
- [ ] Cliente consegue ver OSs de outros clientes?
- [ ] Valores estão calculados corretamente (subtotal, desconto, total)?
- [ ] Status muda corretamente após aprovação/recusa?
- [ ] Notificações são enviadas após mudança de status?

### **Prioridade Média:**
- [ ] Fotos/anexos carregam corretamente?
- [ ] Timeline de status mostra todas as etapas?
- [ ] Filtros funcionam corretamente?
- [ ] Busca retorna resultados corretos?

### **Prioridade Baixa:**
- [ ] Layout quebra em alguma resolução?
- [ ] Cores/fontes estão consistentes?
- [ ] Animações/transições funcionam suavemente?
- [ ] Ícones estão alinhados?

---

## 📊 **Critérios de Sucesso**

### **✅ Teste Passou Se:**
1. Cliente consegue fazer login sem problemas
2. Dashboard carrega e mostra OSs corretamente
3. Detalhes da OS mostram todas as informações
4. Aprovação/Recusa de orçamento funciona
5. Status atualiza em tempo real
6. Histórico mostra todas as OSs
7. Perfil pode ser editado
8. Sistema é responsivo em mobile
9. Mensagens de erro são claras
10. Performance é boa (< 3s para carregar)

### **❌ Teste Falhou Se:**
1. Não consegue fazer login
2. OSs não carregam ou mostram dados errados
3. Aprovação/Recusa não funciona
4. Status não atualiza
5. Cliente vê dados de outros clientes (CRÍTICO!)
6. Sistema quebra em mobile
7. Erros sem mensagem clara
8. Performance ruim (> 5s para carregar)

---

## 📝 **Template de Reporte de Bug**

Se encontrar algum problema, use este template:

```markdown
## 🐛 Bug Report

**Título:** [Descrição curta do problema]

**Prioridade:** [ ] Alta  [ ] Média  [ ] Baixa

**Descrição:**
[Descreva o que aconteceu]

**Passos para Reproduzir:**
1. [Primeiro passo]
2. [Segundo passo]
3. [Terceiro passo]

**Resultado Esperado:**
[O que deveria acontecer]

**Resultado Atual:**
[O que realmente aconteceu]

**Screenshots:**
[Anexar prints se possível]

**Ambiente:**
- Navegador: [Chrome/Firefox/Safari]
- Versão: [versão do navegador]
- OS: [Windows/Mac/Linux/Mobile]
- Resolução: [1920x1080 / Mobile]

**Informações Adicionais:**
[Qualquer outra informação relevante]
```

---

## 🎯 **Próximos Passos Após Teste**

### **Se tudo funcionou:**
1. ✅ Marcar "Visão Cliente" como 100% funcional
2. ✅ Testar próxima visão (Admin/Vendedor)
3. ✅ Documentar fluxo de uso

### **Se encontrou bugs:**
1. 🐛 Listar todos os bugs encontrados
2. 🔥 Priorizar correções (Alta → Média → Baixa)
3. 🛠️ Corrigir bugs críticos primeiro
4. ✅ Re-testar após correções

---

## 📞 **Suporte**

Se precisar de ajuda durante o teste:
- 📧 Email: toliveira1802@gmail.com
- 💬 WhatsApp: [seu número]
- 🐛 GitHub Issues: [link do repo]

---

**Última Atualização:** 24 de Janeiro de 2026  
**Versão do Sistema:** 1.0 (95% funcional)  
**Responsável pelo Teste:** Thiago Oliveira
