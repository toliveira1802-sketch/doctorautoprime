# 🔗 GUIA COMPLETO - FINALIZAR INTEGRAÇÃO KOMMO

**Data**: 24/01/2026 10:15 AM  
**Status**: 95% Implementado | 5% Configuração Pendente  
**Tempo Estimado**: 40 minutos

---

## ✅ O QUE JÁ ESTÁ PRONTO

### 1. **Código Implementado** (100%)
- ✅ Migration SQL com 5 tabelas
- ✅ Hook React `useKommo()`
- ✅ Página de configuração `/gestao/integracoes/kommo`
- ✅ Página de callback OAuth `/kommo/callback`
- ✅ Componente `KommoSyncButton`
- ✅ Cliente API com refresh automático
- ✅ Serviço de sincronização
- ✅ 10 exemplos de uso

### 2. **Rotas Configuradas** (100%)
- ✅ `/gestao/integracoes/kommo` - Configuração
- ✅ `/kommo/callback` - OAuth callback

---

## 🎯 ETAPAS PARA FINALIZAR (4 Passos)

### **ETAPA 1: APLICAR MIGRATION NO SUPABASE** ⏱️ 5 minutos

#### 1.1 Acessar Supabase Dashboard
```
1. Abra: https://supabase.com/dashboard
2. Login com sua conta
3. Selecione o projeto: acuufrgoyjwzlyhopaus
```

#### 1.2 Abrir SQL Editor
```
1. No menu lateral, clique em "SQL Editor"
2. Clique em "+ New query"
```

#### 1.3 Copiar e Executar Migration
```sql
-- Copie TODO o conteúdo do arquivo:
-- supabase/migrations/20260122034000_kommo_integration.sql

-- E cole no SQL Editor

-- Depois clique em "Run" (ou Ctrl+Enter)
```

#### 1.4 Verificar Tabelas Criadas
```sql
-- Execute esta query para verificar:
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE 'kommo%';

-- Deve retornar 5 tabelas:
-- 1. kommo_config
-- 2. kommo_os_mapping
-- 3. kommo_contact_mapping
-- 4. kommo_sync_log
-- 5. kommo_webhooks
```

✅ **Checkpoint**: Tabelas criadas com sucesso

---

### **ETAPA 2: CRIAR CONTA KOMMO** ⏱️ 15 minutos

#### 2.1 Criar Conta Trial
```
1. Acesse: https://www.kommo.com/pt/
2. Clique em "Experimente Grátis" ou "Teste Grátis"
3. Preencha os dados:
   - Nome: Doctor Auto Prime
   - Email: toliveira1802@gmail.com
   - Telefone: (seu telefone)
4. Escolha um subdomínio:
   - Sugestão: doctorautoprime
   - URL final: doctorautoprime.kommo.com
5. Complete o cadastro
```

#### 2.2 Configurar Conta Básica
```
1. Faça login em: https://doctorautoprime.kommo.com
2. Complete o wizard de configuração inicial
3. Pule tutoriais (pode fazer depois)
```

✅ **Checkpoint**: Conta criada e acessível

---

### **ETAPA 3: CONFIGURAR OAUTH** ⏱️ 10 minutos

#### 3.1 Criar Integração
```
1. No Kommo, vá em: Configurações (ícone de engrenagem)
2. Navegue: Integrações → API
3. Clique em: "+ Criar Integração"
4. Preencha:
   - Nome: Doctor Auto Prime Sync
   - Descrição: Sincronização de Ordens de Serviço
   - Link: https://doctorautoprime.vercel.app
```

#### 3.2 Configurar Redirect URI
```
1. Na seção "Redirect URI", adicione:
   
   PRODUÇÃO:
   https://doctorautoprime.vercel.app/kommo/callback
   
   DESENVOLVIMENTO (opcional):
   http://localhost:8080/kommo/callback

2. Clique em "Salvar"
```

#### 3.3 Copiar Credenciais
```
1. Após salvar, você verá:
   - Integration ID (Client ID)
   - Secret Key (Client Secret)

2. COPIE E GUARDE em local seguro:
   
   Subdomain: doctorautoprime
   Client ID: [copie aqui]
   Client Secret: [copie aqui]
   Redirect URI: https://doctorautoprime.vercel.app/kommo/callback
```

✅ **Checkpoint**: Credenciais OAuth obtidas

---

### **ETAPA 4: CONECTAR NO SISTEMA** ⏱️ 10 minutos

#### 4.1 Acessar Página de Configuração
```
1. Abra o sistema: https://doctorautoprime.vercel.app
   OU local: http://localhost:8080

2. Faça login com:
   - Email: toliveira1802@gmail.com
   - Senha: [sua senha]

3. Navegue para:
   Gestão → Integrações → Kommo
   URL: /gestao/integracoes/kommo
```

#### 4.2 Inserir Credenciais
```
1. Na aba "Configuração", preencha:
   
   Subdomínio Kommo: doctorautoprime
   Client ID: [cole o Integration ID]
   Client Secret: [cole o Secret Key]
   Redirect URI: https://doctorautoprime.vercel.app/kommo/callback

2. Clique em "Salvar Configuração"
```

#### 4.3 Autorizar Integração
```
1. Após salvar, clique em "Conectar com Kommo"

2. Você será redirecionado para:
   https://doctorautoprime.kommo.com/oauth

3. Na tela do Kommo:
   - Revise as permissões solicitadas
   - Clique em "Permitir" ou "Autorizar"

4. Você será redirecionado de volta para:
   /kommo/callback

5. Aguarde a mensagem:
   "✅ Conectado com Sucesso!"

6. Será redirecionado automaticamente para:
   /gestao/integracoes/kommo
```

#### 4.4 Verificar Conexão
```
1. Na página de integração, verifique:
   - Badge: "✅ Conectado"
   - Status: "Conectado e sincronizando automaticamente"

2. Se aparecer "Desconectado", algo deu errado.
   Verifique os logs no console do navegador.
```

✅ **Checkpoint**: Sistema conectado ao Kommo

---

## 🧪 TESTAR SINCRONIZAÇÃO

### Teste 1: Sincronizar OS Existente

#### Opção A: Via Botão na Lista de OSs
```
1. Vá para: Admin → Ordens de Serviço
2. Encontre uma OS qualquer
3. Clique no botão "Sincronizar com Kommo" (ícone Kommo)
4. Aguarde confirmação
5. Verifique no Kommo se o Lead foi criado
```

#### Opção B: Via Página de Detalhes
```
1. Vá para: Admin → Ordens de Serviço
2. Clique em uma OS para ver detalhes
3. No cabeçalho, clique em "Sincronizar com Kommo"
4. Aguarde confirmação
5. Verifique no Kommo
```

#### Opção C: Via Console (Desenvolvedor)
```javascript
// Abra o console do navegador (F12)
// Execute:

// 1. Importar hook
const { syncOS } = useKommo();

// 2. Sincronizar OS (substitua pelo ID real)
await syncOS('uuid-da-os-aqui');

// 3. Verificar resultado
console.log('Lead criado com sucesso!');
```

### Teste 2: Verificar Logs
```
1. Vá para: /gestao/integracoes/kommo
2. Clique na aba "Logs de Sincronização"
3. Verifique se aparece:
   - ✅ sync_os_to_lead - success
   - OS: [uuid]
   - Data/Hora
```

### Teste 3: Verificar no Kommo
```
1. Acesse: https://doctorautoprime.kommo.com
2. Vá em "Leads" ou "Negócios"
3. Procure pelo lead criado
4. Verifique se os dados estão corretos:
   - Nome do cliente
   - Telefone
   - Valor da OS
   - Campos personalizados (se configurados)
```

---

## 🔧 CONFIGURAÇÕES AVANÇADAS (OPCIONAL)

### Criar Campos Personalizados no Kommo

#### 1. Acessar Configurações de Campos
```
1. No Kommo: Configurações → Campos Personalizados
2. Selecione: "Leads"
3. Clique em "+ Adicionar Campo"
```

#### 2. Criar Campos
```
Campo 1: Placa
- Tipo: Texto
- Nome: Placa
- Obrigatório: Não

Campo 2: Veículo
- Tipo: Texto
- Nome: Veículo
- Obrigatório: Não

Campo 3: Status OS
- Tipo: Lista
- Nome: Status OS
- Opções:
  - Entrada
  - Diagnóstico
  - Orçamento
  - Aguardando Aprovação
  - Aprovado
  - Em Execução
  - Teste
  - Pronto
  - Entregue

Campo 4: Número OS
- Tipo: Texto
- Nome: Número OS
- Obrigatório: Não
```

#### 3. Anotar IDs dos Campos
```
1. Após criar cada campo, clique nele
2. Na URL, você verá o ID:
   https://doctorautoprime.kommo.com/settings/fields/123456
   
3. Anote os IDs:
   - Placa: [ID]
   - Veículo: [ID]
   - Status OS: [ID]
   - Número OS: [ID]
```

#### 4. Atualizar Código (Se necessário)
```typescript
// Editar: src/integrations/kommo/sync.ts
// Procurar por: CUSTOM_FIELD_IDS
// Atualizar com os IDs reais:

const CUSTOM_FIELD_IDS = {
    placa: 123456,      // Substitua pelo ID real
    veiculo: 123457,    // Substitua pelo ID real
    status: 123458,     // Substitua pelo ID real
    numero_os: 123459,  // Substitua pelo ID real
};
```

---

## 🔔 CONFIGURAR WEBHOOKS (OPCIONAL)

### 1. Criar Webhook no Kommo
```
1. Kommo: Configurações → Webhooks
2. Clique em "+ Adicionar Webhook"
3. Configure:
   - URL: https://doctorautoprime.vercel.app/api/kommo/webhook
   - Eventos:
     ✅ Lead criado
     ✅ Lead atualizado
     ✅ Lead deletado
     ✅ Nota adicionada
4. Salvar
```

### 2. Criar Edge Function (Supabase)
```sql
-- Criar função para processar webhooks
-- (Código já está preparado, só precisa ativar)
```

---

## 📊 MONITORAMENTO

### Verificar Saúde da Integração

#### 1. Dashboard de Logs
```
Acesse: /gestao/integracoes/kommo → Aba "Logs"

Verifique:
- Taxa de sucesso (deve ser > 95%)
- Erros recentes
- Tempo médio de sincronização
```

#### 2. Banco de Dados
```sql
-- Ver estatísticas de sincronização
SELECT 
    status,
    COUNT(*) as total,
    DATE(created_at) as data
FROM kommo_sync_log
GROUP BY status, DATE(created_at)
ORDER BY data DESC;

-- Ver OSs sincronizadas
SELECT COUNT(*) FROM kommo_os_mapping;

-- Ver contatos mapeados
SELECT COUNT(*) FROM kommo_contact_mapping;
```

---

## ❌ TROUBLESHOOTING

### Erro: "Código de autorização não encontrado"
```
Causa: Redirect URI incorreta
Solução:
1. Verifique se a URI no Kommo está EXATAMENTE igual
2. Deve incluir /kommo/callback
3. Sem barras extras no final
```

### Erro: "Config não encontrada"
```
Causa: Migration não aplicada
Solução:
1. Volte à ETAPA 1
2. Execute a migration no Supabase
3. Verifique se as tabelas foram criadas
```

### Erro: "Invalid client credentials"
```
Causa: Client ID ou Secret incorretos
Solução:
1. Volte ao Kommo
2. Copie novamente as credenciais
3. Cole exatamente como aparecem
4. Sem espaços extras
```

### Erro: "Access token expired"
```
Causa: Token expirou (normal após 24h)
Solução:
1. O sistema deve renovar automaticamente
2. Se não renovar, desconecte e reconecte
3. Verifique logs de erro
```

---

## ✅ CHECKLIST FINAL

Marque cada item ao completar:

### Configuração Inicial
- [ ] Migration aplicada no Supabase
- [ ] 5 tabelas criadas
- [ ] Conta Kommo criada
- [ ] Subdomínio escolhido

### OAuth
- [ ] Integração criada no Kommo
- [ ] Redirect URI configurada
- [ ] Client ID copiado
- [ ] Client Secret copiado

### Conexão
- [ ] Credenciais inseridas no sistema
- [ ] Configuração salva
- [ ] Autorização concedida
- [ ] Badge "Conectado" aparecendo

### Testes
- [ ] OS sincronizada com sucesso
- [ ] Lead criado no Kommo
- [ ] Logs registrados
- [ ] Dados corretos no Kommo

### Opcional
- [ ] Campos personalizados criados
- [ ] IDs anotados
- [ ] Código atualizado
- [ ] Webhooks configurados

---

## 🎯 PRÓXIMOS PASSOS APÓS FINALIZAR

1. **Sincronizar OSs Existentes** (opcional)
   - Criar script para sincronizar OSs antigas
   - Executar em lote

2. **Automatizar Sincronização**
   - Adicionar trigger no banco
   - Sincronizar automaticamente ao criar OS

3. **Configurar Webhooks**
   - Sincronização bidirecional
   - Atualizar OS quando Lead mudar no Kommo

4. **Monitorar Performance**
   - Criar dashboard de métricas
   - Alertas de erro

5. **Documentar para Equipe**
   - Criar manual de uso
   - Treinar equipe

---

## 📞 SUPORTE

**Problemas?**
- Verifique logs no console (F12)
- Verifique logs no Supabase
- Consulte documentação Kommo
- Entre em contato com suporte

**Links Úteis:**
- Kommo API: https://www.amocrm.com/developers/
- Supabase Docs: https://supabase.com/docs
- Documentação do projeto: KOMMO_IMPLEMENTADO.md

---

## 🚀 COMEÇAR AGORA

**Tempo total estimado**: 40 minutos

**Ordem recomendada:**
1. ETAPA 1: Migration (5 min) ← COMECE AQUI
2. ETAPA 2: Conta Kommo (15 min)
3. ETAPA 3: OAuth (10 min)
4. ETAPA 4: Conectar (10 min)
5. Testar (5 min)

**Pronto para começar?**
Vá para a ETAPA 1 e siga passo a passo!

---

**BOA SORTE! 🎉**
