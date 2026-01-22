# 🔗 CHECKLIST - Integração Kommo
**Doctor Auto Prime → Kommo CRM**

---

## ✅ **FASE 1: INFRAESTRUTURA (CONCLUÍDA)**

### Código criado:
- [x] Cliente API Kommo (`/integrations/kommo/client.ts`)
- [x] Tipos TypeScript (`/integrations/kommo/types.ts`)
- [x] Serviço de Sincronização (`/integrations/kommo/sync.ts`)
- [x] Migration banco de dados (`kommo_integration.sql`)

### Tabelas criadas:
- [x] `kommo_config` - Configuração e tokens
- [x] `kommo_os_mapping` - Mapeamento OS ↔ Lead
- [x] `kommo_contact_mapping` - Mapeamento Cliente ↔ Contato
- [x] `kommo_sync_log` - Log de sincronizações
- [x] `kommo_webhooks` - Webhooks recebidos

---

## 📝 **FASE 2: CONFIGURAÇÃO INICIAL**

### 1. Criar conta no Kommo:
- [ ] Acessar https://www.kommo.com/
- [ ] Criar conta (ou usar existente)
- [ ] Anotar seu **subdomínio** (ex: `doctorautoprime.kommo.com`)

### 2. Criar integração OAuth:
- [ ] Ir em **Configurações** → **Integrações** → **API**
- [ ] Criar nova integração
- [ ] Anotar:
  - `Client ID`
  - `Client Secret`
  - `Redirect URI` (ex: `https://doctorautoprime.vercel.app/kommo/callback`)

### 3. Configurar Custom Fields no Kommo:
Criar campos personalizados para Leads:
- [ ] **Placa** (texto) - ID: `______`
- [ ] **Veículo** (texto) - ID: `______`
- [ ] **Status OS** (lista) - ID: `______`
- [ ] **Número OS** (texto) - ID: `______`

Criar campos personalizados para Contatos:
- [ ] **Telefone** (telefone) - ID: `______`

### 4. Configurar Pipeline (Funil):
Criar status que correspondem aos status das OSs:
- [ ] **Orçamento** - ID: `______`
- [ ] **Aprovado** - ID: `______`
- [ ] **Em Execução** - ID: `______`
- [ ] **Concluído** - ID: `______`
- [ ] **Sucesso** (padrão Kommo) - ID: `142`
- [ ] **Não realizado** (padrão Kommo) - ID: `143`

### 5. Salvar configuração no Supabase:
```sql
INSERT INTO kommo_config (
  subdomain,
  client_id,
  client_secret,
  redirect_uri,
  is_active
) VALUES (
  'seu-dominio', -- sem .kommo.com
  'seu-client-id',
  'seu-client-secret',
  'https://doctorautoprime.vercel.app/kommo/callback',
  true
);
```

---

## 🔐 **FASE 3: AUTENTICAÇÃO (OAUTH)**

### Fluxo de autenticação:
1. [ ] Criar página `/kommo/auth` que redireciona para:
```
https://seu-dominio.kommo.com/oauth?
  client_id=SEU_CLIENT_ID
  &redirect_uri=https://doctorautoprime.vercel.app/kommo/callback
  &response_type=code
  &state=RANDOM_STRING
```

2. [ ] Criar página `/kommo/callback` que:
   - Recebe o `code`
   - Troca por `access_token` e `refresh_token`
   - Salva no `kommo_config`

3. [ ] Testar autenticação

---

## 🔄 **FASE 4: SINCRONIZAÇÃO**

### Sincronização Manual (para testar):
```typescript
import KommoClient from '@/integrations/kommo/client';
import KommoSyncService from '@/integrations/kommo/sync';

// 1. Criar cliente
const kommo = new KommoClient({
  subdomain: 'seu-dominio',
  clientId: 'seu-client-id',
  clientSecret: 'seu-client-secret',
  redirectUri: 'sua-redirect-uri',
  accessToken: 'seu-access-token',
  refreshToken: 'seu-refresh-token',
});

// 2. Criar serviço de sync
const sync = new KommoSyncService(kommo);

// 3. Sincronizar uma OS
await sync.syncOSToLead('os-uuid-aqui');
```

### Sincronização Automática:
- [ ] Ativar trigger no banco (descomentar no migration)
- [ ] Criar job/worker para processar fila de sincronização
- [ ] Testar sincronização automática

---

## 🪝 **FASE 5: WEBHOOKS**

### Configurar Webhooks no Kommo:
1. [ ] Ir em **Configurações** → **Webhooks**
2. [ ] Adicionar webhook:
   - URL: `https://doctorautoprime.vercel.app/api/kommo/webhook`
   - Eventos:
     - [x] Lead criado
     - [x] Lead atualizado
     - [x] Lead deletado
     - [x] Contato criado
     - [x] Contato atualizado

### Criar endpoint de webhook:
- [ ] Criar `/api/kommo/webhook` (Vercel Function)
- [ ] Validar assinatura do webhook
- [ ] Processar eventos
- [ ] Salvar em `kommo_webhooks`

---

## 📊 **FASE 6: MAPEAMENTOS**

### Atualizar IDs no código:
No arquivo `/integrations/kommo/sync.ts`, atualizar:

```typescript
// Linha ~30: Campo Placa
field_id: 123456, // ← SUBSTITUIR pelo ID real

// Linha ~34: Campo Veículo
field_id: 123457, // ← SUBSTITUIR pelo ID real

// Linha ~38: Campo Status OS
field_id: 123458, // ← SUBSTITUIR pelo ID real

// Linha ~68: Campo Telefone
field_id: 123459, // ← SUBSTITUIR pelo ID real

// Linha ~155: Mapeamento de status
const statusMapping: Record<string, number> = {
  'orcamento': 123460, // ← SUBSTITUIR
  'aprovado': 123461,  // ← SUBSTITUIR
  'em_execucao': 123462, // ← SUBSTITUIR
  'concluido': 123463, // ← SUBSTITUIR
  'entregue': 142,     // OK (padrão)
  'recusado': 143,     // OK (padrão)
};
```

---

## 🎯 **FUNCIONALIDADES FINAIS**

### O que a integração faz:

#### 1. **OS → Lead (Automático)**
```
Nova OS criada no Doctor Auto Prime
↓
Sistema cria Lead no Kommo
↓
Vincula ao Contato (cliente)
↓
Adiciona nota com diagnóstico
↓
Salva mapeamento no banco
```

#### 2. **Cliente → Contato (Automático)**
```
Novo cliente na OS
↓
Sistema busca contato no Kommo (por telefone)
↓
Se não existe, cria novo contato
↓
Vincula ao Lead
```

#### 3. **Atualização de Status (Bidirecional)**
```
Status da OS muda
↓
Sistema atualiza status do Lead no Kommo
↓
(E vice-versa via webhook)
```

#### 4. **Histórico Completo**
```
Todas as ações são logadas em kommo_sync_log
↓
Possível rastrear qualquer sincronização
↓
Facilita debug e auditoria
```

---

## 🧪 **FASE 7: TESTES**

### Testes manuais:
- [ ] Criar OS manualmente → Verificar Lead no Kommo
- [ ] Atualizar OS → Verificar atualização no Lead
- [ ] Mudar status OS → Verificar mudança de status no Lead
- [ ] Criar contato → Verificar no Kommo
- [ ] Atualizar Lead no Kommo → Verificar webhook

### Testes de erro:
- [ ] Token expirado (deve fazer refresh automático)
- [ ] Kommo offline (deve logar erro)
- [ ] Campos inválidos (deve logar erro)

---

## 📈 **FASE 8: MONITORAMENTO**

### Dashboards a criar:
- [ ] Total de OSs sincronizadas
- [ ] Taxa de sucesso de sincronização
- [ ] Erros recentes
- [ ] Webhooks pendentes
- [ ] Tempo médio de sincronização

### Alertas:
- [ ] Taxa de erro > 10%
- [ ] Webhooks não processados > 100
- [ ] Token expirando em < 24h

---

## 🚀 **PRÓXIMOS PASSOS IMEDIATOS**

1. ✅ **Infraestrutura criada** (FEITO!)
2. ✅ **Interface de configuração** (FEITO!)
3. ✅ **OAuth implementado** (FEITO!)
4. ✅ **Webhook endpoint** (FEITO!)
5. 📝 **Configurar conta Kommo** (VOCÊ FAZ)
6. 🔄 **Testar sincronização** (DEPOIS)
7. 🪝 **Configurar webhooks** (DEPOIS)

---

## 💡 **DICAS**

- Comece sincronizando manualmente
- Teste com poucas OSs primeiro
- Monitore os logs constantemente
- Documente os IDs dos campos
- Faça backup antes de ativar sync automático

---

## 📚 **DOCUMENTAÇÃO**

- **API Kommo:** https://www.amocrm.com/developers/content/crm_platform/
- **OAuth:** https://www.amocrm.com/developers/content/oauth/step-by-step
- **Webhooks:** https://www.amocrm.com/developers/content/webhooks/

---

**Status Atual:** ✅ Código 100% pronto!
**Próximo:** 📝 Configurar conta e OAuth
