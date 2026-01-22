# 🔄 Migração Trello → Supabase

Este script migra todos os cards do Trello Board **NkhINjF2** para a tabela `ordens_servico` do Supabase.

## 📋 Pré-requisitos

1. Python 3.8+
2. Biblioteca `requests`

## 🚀 Como Executar

### 1. Instalar dependências

```bash
pip install requests
```

### 2. Configurar variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto ou exporte as variáveis:

```bash
# Supabase
export SUPABASE_URL="https://your-project.supabase.co"
export SUPABASE_ANON_KEY="your-anon-key-here"
```

**OU** edite diretamente no script as linhas:
```python
SUPABASE_URL = "https://your-project.supabase.co"
SUPABASE_KEY = "your-anon-key"
```

### 3. Executar migração

```bash
cd scripts
python migrate_trello_to_supabase.py
```

## 🗺️ Mapeamento

### Listas Trello → Posições Pátio

| Lista Trello | Posição Pátio |
|-------------|---------------|
| AGENDADOS HOJE | `entrada` |
| DIAGNÓSTICO | `entrada` |
| ORÇAMENTOS | `aguardando_orcamento` |
| AGUARD. APROVAÇÃO | `aguardando_aprovacao` |
| AGUARD. PEÇAS | `aguardando_pecas` |
| PRONTO P/ INICIAR | `aguardando_pecas` |
| EM EXECUÇÃO | `em_execucao` |
| PRONTOS | `pronto` |

### Labels Trello → Prioridades

| Label Trello | Prioridade |
|-------------|------------|
| URGENTE | `urgente` |
| ALTA | `alta` |
| MÉDIA | `media` |
| BAIXA | `baixa` |

### Cores Trello → Cores Card

| Cor Trello | Hex Color |
|-----------|-----------|
| red | `#ef4444` |
| orange | `#f97316` |
| yellow | `#eab308` |
| green | `#22c55e` |
| blue | `#3b82f6` |
| purple | `#a855f7` |

## 📊 O que é migrado

Para cada card do Trello, o script migra:

- ✅ Nome do card → `vehicle_model` e `vehicle_plate` (se formato "ABC-1234 - Descrição")
- ✅ Descrição → `service_description`
- ✅ Lista → `posicao_patio`
- ✅ Labels → `prioridade`, `cor_card`, `tags`
- ✅ Membros → `mecanico_responsavel`
- ✅ Data de atividade → `data_entrada`
- ✅ URL do card → `trello_card_url`
- ✅ ID do card → `trello_card_id`

## ⚠️ Importante

1. **Backup**: Faça backup do banco antes de executar
2. **Cards arquivados**: São ignorados automaticamente
3. **Duplicatas**: O script não verifica duplicatas. Execute apenas uma vez ou limpe a tabela antes
4. **Custom Fields**: Ainda não implementado (pode ser adicionado se necessário)

## 🔧 Troubleshooting

### Erro de autenticação Supabase
- Verifique se `SUPABASE_URL` e `SUPABASE_ANON_KEY` estão corretos
- Certifique-se de que a política RLS permite inserção

### Erro de autenticação Trello
- As credenciais já estão no script
- Se expiradas, gere novas em: https://trello.com/app-key

### Campos faltando
- Verifique se a migration `20260122022000_patio_expansion.sql` foi executada
- Confirme que todos os campos existem na tabela `ordens_servico`

## 📝 Próximos Passos

Após a migração:

1. ✅ Verificar dados migrados no Supabase
2. ✅ Testar página AdminPatio.tsx
3. ✅ Ajustar mapeamentos se necessário
4. ✅ Desativar sincronização Trello (se aplicável)
5. ✅ Treinar equipe no novo sistema

## 🎯 Modo Dry-Run (Teste)

Para testar sem inserir dados, comente a linha:

```python
if insert_ordem_servico(os_data):
```

E descomente:

```python
# print(json.dumps(os_data, indent=2))
```

Isso mostrará os dados que seriam inseridos sem efetivamente inserir.
