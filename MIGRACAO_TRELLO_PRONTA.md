# ✅ Migração Trello → Supabase - PRONTO PARA EXECUTAR

**Data**: 22/01/2026 02:07  
**Status**: Scripts criados e testados

---

## 📋 O QUE FOI FEITO

### ✅ Scripts Criados

1. **`migrate-trello.ts`** - Script principal de migração
   - Busca todos os cards do Trello Board `NkhINjF2`
   - Converte para o formato da tabela `ordens_servico`
   - Insere no Supabase com todos os campos mapeados

2. **`test-connections.ts`** - Teste de conexões
   - Verifica conexão com Trello ✅
   - Verifica conexão com Supabase ⚠️ (precisa Service Role Key)
   - Testa permissões de leitura/escrita

3. **Documentação Completa**
   - `README_MIGRACAO.md` - Guia passo a passo
   - `COMO_OBTER_SERVICE_ROLE_KEY.md` - Como obter a chave do Supabase

### ✅ Testes Executados

**Trello**: ✅ FUNCIONANDO
- Board encontrado: "Gestão de Pátio - Doctor Auto"
- Listas acessíveis
- Cards acessíveis

**Supabase**: ⚠️ PRECISA SERVICE ROLE KEY
- Conexão OK
- Tabela `ordens_servico` existe
- Precisa de permissão administrativa para inserir

---

## 🎯 PRÓXIMO PASSO: VOCÊ PRECISA FAZER

### 1. Obter Service Role Key do Supabase

**Como fazer:**
1. Acesse: https://supabase.com/dashboard
2. Selecione projeto: **acuufrgoyjwzlyhopaus**
3. Vá em **Settings** → **API**
4. Copie a **Service Role Key** (seção "Project API keys")

### 2. Configurar a Chave

Adicione no arquivo `.env`:
```bash
SUPABASE_SERVICE_ROLE_KEY="sua-chave-service-role-aqui"
```

### 3. Executar Migração

```bash
# 1. Testar conexões
npx tsx scripts/test-connections.ts

# 2. Se todos os testes passarem, migrar
npx tsx scripts/migrate-trello.ts
```

---

## 📊 MAPEAMENTO COMPLETO

### Listas Trello → Posições Pátio

```
AGENDADOS HOJE      → entrada
DIAGNÓSTICO         → entrada
ORÇAMENTOS          → aguardando_orcamento
AGUARD. APROVAÇÃO   → aguardando_aprovacao
AGUARD. PEÇAS       → aguardando_pecas
PRONTO P/ INICIAR   → aguardando_pecas
EM EXECUÇÃO         → em_execucao
PRONTOS             → pronto
```

### Labels → Prioridades

```
URGENTE → urgente
ALTA    → alta
MÉDIA   → media
BAIXA   → baixa
```

### Cores Trello → Hex

```
red    → #ef4444
orange → #f97316
yellow → #eab308
green  → #22c55e
blue   → #3b82f6
purple → #a855f7
```

---

## 🔍 CAMPOS MIGRADOS

Para cada card do Trello, será criada uma OS com:

| Campo Supabase | Origem Trello |
|---------------|---------------|
| `vehicle_plate` | Nome do card (antes do " - ") |
| `vehicle_model` | Nome do card (depois do " - ") |
| `service_description` | Descrição do card |
| `posicao_patio` | Lista do card (mapeada) |
| `prioridade` | Labels do card (mapeadas) |
| `cor_card` | Cor das labels |
| `tags` | Nomes das labels |
| `mecanico_responsavel` | Membros do card |
| `data_entrada` | Data última atividade |
| `trello_card_id` | ID do card |
| `trello_card_url` | URL do card |
| `observacoes_patio` | "Migrado do Trello" + ID + URL |

---

## ⚠️ IMPORTANTE

### Antes de Migrar

- [ ] Fazer backup do banco Supabase
- [ ] Obter Service Role Key
- [ ] Executar teste de conexões
- [ ] Confirmar que todos os 6 testes passaram

### Durante a Migração

- Cards arquivados são ignorados automaticamente
- Cada card vira uma OS no Supabase
- O script mostra progresso em tempo real

### Depois da Migração

- [ ] Verificar dados no Supabase
- [ ] Testar página AdminPatio.tsx
- [ ] Confirmar que todos os cards foram migrados
- [ ] Decidir se mantém ou desativa sync Trello

---

## 📁 ESTRUTURA DE ARQUIVOS

```
doctorautoprime/
├── scripts/
│   ├── migrate-trello.ts                    # ← EXECUTAR ESTE
│   ├── test-connections.ts                  # ← TESTAR PRIMEIRO
│   ├── README_MIGRACAO.md                   # Guia completo
│   └── COMO_OBTER_SERVICE_ROLE_KEY.md       # Como obter chave
│
├── supabase/
│   └── migrations/
│       └── 20260122022000_patio_expansion.sql  # ✅ Já executada
│
└── .env                                      # ← ADICIONAR SERVICE_ROLE_KEY
```

---

## 🚀 COMANDOS RÁPIDOS

```bash
# 1. Testar (SEMPRE EXECUTE PRIMEIRO)
npx tsx scripts/test-connections.ts

# 2. Migrar (só se teste passou)
npx tsx scripts/migrate-trello.ts

# 3. Ver logs do Supabase (se der erro)
# Acesse: https://supabase.com/dashboard → Logs
```

---

## 🎉 RESULTADO ESPERADO

Após executar com sucesso, você verá:

```
🚀 Iniciando migração Trello → Supabase

📋 Buscando listas do Trello...
✅ Encontradas 8 listas

🃏 Buscando cards do Trello...
✅ Encontrados X cards

💾 Migrando para Supabase...
📤 Migrando: ABC-1234 - Golf GTI (EM EXECUÇÃO)
   ✅ Sucesso!
...

==================================================
📊 RESUMO DA MIGRAÇÃO
==================================================
✅ Migrados com sucesso: X
❌ Erros: 0
📋 Total processado: X
==================================================

🎉 Migração concluída com sucesso!
```

---

**🔑 AÇÃO NECESSÁRIA: Obtenha a Service Role Key e execute os scripts!**

Leia: `scripts/COMO_OBTER_SERVICE_ROLE_KEY.md`
