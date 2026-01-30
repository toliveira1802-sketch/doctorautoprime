# 🚀 GUIA DE SETUP DO BANCO DE DADOS

## 📋 RESUMO EXECUTIVO

Este guia contém as instruções para criar **toda a estrutura do banco de dados** do sistema Doctor Auto Prime.

**Total de Tabelas:** 26
- ✅ 6 Tabelas Principais (Estruturais/Imutáveis)
- ✅ 20 Tabelas Operacionais (Mutáveis)

---

## 🎯 ORDEM DE EXECUÇÃO

Execute os scripts **nesta ordem exata**:

### **1️⃣ PRIMEIRO: Tabelas Principais**
```bash
setup_tabelas_principais.sql
```

**Cria:**
- 2 ENUMs (service_type, ordem_servico_status)
- 6 Tabelas (companies, roles, services, payment_methods, parts_categories)
- Dados iniciais (4 empresas, 8 roles, 14 serviços, 6 métodos pagamento, 10 categorias)

**Tempo estimado:** 30 segundos

---

### **2️⃣ DEPOIS: Tabelas Operacionais**
```bash
setup_tabelas_operacionais.sql
```

**Cria:**
- 20 Tabelas operacionais
- 9 Estágios do pátio Kanban
- Índices de performance
- Comentários nas tabelas

**Tempo estimado:** 1 minuto

---

## 💻 COMO EXECUTAR NO SUPABASE

### **Método 1: Via Dashboard (Recomendado)**

1. Acesse: https://supabase.com/dashboard
2. Selecione seu projeto
3. Vá em **SQL Editor** (menu lateral)
4. Clique em **"New query"**
5. Cole o conteúdo de `setup_tabelas_principais.sql`
6. Clique em **"Run"** (ou F5)
7. Aguarde mensagem de sucesso
8. Repita os passos 4-7 com `setup_tabelas_operacionais.sql`

### **Método 2: Via CLI (Avançado)**

```bash
# Instale o Supabase CLI (se ainda não tiver)
npm install -g supabase

# Faça login
supabase login

# Link com seu projeto
supabase link --project-ref seu-project-ref

# Execute as migrações
supabase db push
```

---

## ✅ VERIFICAÇÃO

Após executar ambos os scripts, rode este comando SQL para verificar:

```sql
-- Verificar todas as tabelas criadas
SELECT table_name, 
       (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as colunas
FROM information_schema.tables t
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- Deve retornar 26 tabelas!
```

---

## 📊 ESTRUTURA CRIADA

### 🔒 **TABELAS PRINCIPAIS (6)**

| Tabela | Registros Iniciais | Descrição |
|--------|-------------------|-----------|
| companies | 4 | Empresas do grupo |
| roles | 8 | Papéis do sistema (RBAC) |
| services | 14 | Catálogo de serviços |
| payment_methods | 6 | Formas de pagamento |
| parts_categories | 10 | Categorias de peças |
| - | - | 2 ENUMs criados |

**Total de dados iniciais:** 42 registros

---

### 🔄 **TABELAS OPERACIONAIS (20)**

#### 👥 Grupo 1: Usuários (3 tabelas)
- profiles
- user_roles
- user_companies

#### 🚗 Grupo 2: Veículos (2 tabelas)
- vehicles
- vehicle_history

#### 📅 Grupo 3: Agendamentos (3 tabelas)
- appointments
- appointment_services
- appointment_funnel

#### 🔧 Grupo 4: Ordens de Serviço (3 tabelas)
- ordens_servico
- ordem_servico_items
- ordem_servico_history

#### 💰 Grupo 5: Financeiro (2 tabelas)
- payments
- invoices

#### 📦 Grupo 6: Estoque (2 tabelas)
- parts
- stock_movements

#### 🚛 Grupo 7: Pátio Kanban (2 tabelas)
- patio_stages (9 estágios pré-cadastrados)
- patio_movements

#### 🎁 Grupo 8: Marketing (3 tabelas)
- promotions
- events
- event_participants

---

## 🔑 DADOS INICIAIS IMPORTANTES

### **Empresas:**
1. Doctor Auto Prime (principal)
2. Doctor Auto Bosch (certificada)
3. Garage 347 (boutique)
4. GERAL (consolidado)

### **Roles Ativos:**
- `dev` - Desenvolvedor (nível 100)
- `gestao` - Gestão (nível 80)
- `admin` - Administrador (nível 60)
- `cliente` - Cliente (nível 10)

### **Serviços:** 14 serviços cadastrados
- Revisões (10k, 20k, 30k)
- Serviços básicos (óleo, alinhamento, freios)
- Diagnósticos (completo, motor, eletrônico)
- Especializados (injetores, correia, suspensão, embreagem)

### **Estágios do Pátio:** 9 estágios
1. Aguardando
2. Em Diagnóstico
3. Orçamento
4. Aguardando Aprovação
5. Aguardando Peças
6. Em Execução
7. Em Teste
8. Pronto para Retirada
9. Entregue

---

## 🛡️ SEGURANÇA

### **Row Level Security (RLS)**

⚠️ **IMPORTANTE:** Após criar as tabelas, configure as políticas RLS:

```sql
-- Exemplo: Habilitar RLS na tabela profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Criar política para usuários verem apenas seu próprio perfil
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

-- Criar política para usuários atualizarem apenas seu próprio perfil
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);
```

**Repita para todas as tabelas necessárias!**

---

## 🔧 TROUBLESHOOTING

### **Erro: "relation already exists"**
```sql
-- Se já existir, delete antes:
DROP TABLE IF EXISTS nome_da_tabela CASCADE;
```

### **Erro: "permission denied"**
- Certifique-se de estar logado como proprietário do projeto
- Verifique se tem permissões de escrita no schema `public`

### **Erro: "foreign key constraint"**
- Execute os scripts na ordem correta
- Primeiro: `setup_tabelas_principais.sql`
- Depois: `setup_tabelas_operacionais.sql`

---

## 📚 DOCUMENTAÇÃO ADICIONAL

- **TABELAS_PRINCIPAIS.md** - Documentação detalhada das tabelas estruturais
- **TABELAS_OPERACIONAIS.md** - Documentação detalhada das tabelas mutáveis
- **MAPA_SISTEMA_COMPLETO.md** - Visão geral do sistema

---

## 🎯 PRÓXIMOS PASSOS

Após criar as tabelas:

1. ✅ Configure Row Level Security (RLS)
2. ✅ Crie as policies de acesso
3. ✅ Configure Storage Buckets (para fotos)
4. ✅ Teste inserções básicas
5. ✅ Configure backup automático
6. ✅ Conecte o frontend ao banco

---

## 📞 SUPORTE

Se tiver problemas durante o setup:

1. Verifique os logs no Supabase Dashboard
2. Consulte a documentação das tabelas
3. Teste queries individuais
4. Verifique dependências entre tabelas

---

## ✨ RESUMO

```
📊 Total de Tabelas: 26
📁 Scripts: 2 arquivos SQL
⏱️ Tempo Total: ~2 minutos
💾 Dados Iniciais: 51 registros
🔗 Foreign Keys: 20+
📈 Índices: 50+
```

**Sistema pronto para uso após execução dos scripts! 🚀**

---

**Última Atualização:** 30/01/2026  
**Versão:** 1.0  
**Status:** ✅ Completo e Testado
