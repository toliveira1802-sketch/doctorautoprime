# 🔄 Migração Trello → Supabase - Guia Rápido

## ✅ Status dos Testes

**Trello**: ✅ Conectado (Board: "Gestão de Pátio - Doctor Auto")
- ✅ 3 listas encontradas
- ✅ Cards acessíveis

**Supabase**: ⚠️ Precisa de Service Role Key
- ❌ Anon Key não tem permissão para inserir dados

---

## 🚀 Como Executar a Migração

### Passo 1: Obter Service Role Key

1. Acesse: https://supabase.com/dashboard
2. Selecione o projeto: **acuufrgoyjwzlyhopaus**
3. Vá em **Settings** → **API**
4. Copie a **Service Role Key** (não a Anon Key!)

### Passo 2: Configurar a Chave

**Opção A - Arquivo .env (recomendado)**
```bash
# Adicione no arquivo .env
SUPABASE_SERVICE_ROLE_KEY="sua-chave-aqui"
```

**Opção B - Variável de ambiente temporária**
```powershell
# PowerShell
$env:SUPABASE_SERVICE_ROLE_KEY="sua-chave-aqui"
```

### Passo 3: Testar Conexões

```bash
npx tsx scripts/test-connections.ts
```

Você deve ver: **✅ TODOS OS TESTES PASSARAM (6/6)**

### Passo 4: Executar Migração

```bash
npx tsx scripts/migrate-trello.ts
```

---

## 📊 O que será migrado

### Mapeamento Listas → Posições

| Lista Trello | Posição Pátio |
|-------------|---------------|
| AGENDADOS HOJE | entrada |
| DIAGNÓSTICO | entrada |
| ORÇAMENTOS | aguardando_orcamento |
| AGUARD. APROVAÇÃO | aguardando_aprovacao |
| AGUARD. PEÇAS | aguardando_pecas |
| PRONTO P/ INICIAR | aguardando_pecas |
| EM EXECUÇÃO | em_execucao |
| PRONTOS | pronto |

### Dados Migrados por Card

- ✅ Nome → `vehicle_model` + `vehicle_plate`
- ✅ Descrição → `service_description`
- ✅ Lista → `posicao_patio`
- ✅ Labels → `prioridade`, `cor_card`, `tags`
- ✅ Membros → `mecanico_responsavel`
- ✅ Data → `data_entrada`
- ✅ URL → `trello_card_url`
- ✅ ID → `trello_card_id`

---

## ⚠️ Importante

1. **Backup**: Faça backup do banco antes de executar
2. **Cards arquivados**: São ignorados automaticamente
3. **Duplicatas**: Execute apenas uma vez
4. **Teste primeiro**: Use `test-connections.ts` antes

---

## 🐛 Troubleshooting

### ❌ Erro 401 - Invalid API Key
→ Você está usando a **Anon Key**. Precisa da **Service Role Key**!
→ Leia: `COMO_OBTER_SERVICE_ROLE_KEY.md`

### ❌ Erro ao buscar cards do Trello
→ Verifique se as credenciais do Trello estão corretas
→ Confirme que o Board ID é: `NkhINjF2`

### ❌ Tabela ordens_servico não encontrada
→ Execute a migration: `20260122022000_patio_expansion.sql`

---

## 📁 Arquivos Criados

```
scripts/
├── migrate-trello.ts              # Script principal de migração
├── test-connections.ts            # Testa conexões antes de migrar
├── COMO_OBTER_SERVICE_ROLE_KEY.md # Guia para obter a chave
└── README_MIGRACAO.md             # Este arquivo
```

---

## 🎯 Próximos Passos Após Migração

1. ✅ Verificar dados no Supabase
2. ✅ Testar página `AdminPatio.tsx`
3. ✅ Ajustar mapeamentos se necessário
4. ✅ Desativar sync Trello (opcional)
5. ✅ Treinar equipe no novo sistema

---

**🚀 Pronto para migrar? Execute os passos acima!**
