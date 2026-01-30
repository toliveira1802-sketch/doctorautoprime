# 🎮 POPULANDO O BANCO COM DADOS REAIS

Este diretório contém scripts SQL para popular o banco de dados com **dados reais e realistas** do Doctor Auto Prime.

---

## 📋 ORDEM DE EXECUÇÃO

Execute os scripts **nesta ordem**:

### **1️⃣ Companies (Empresas)**
```sql
dados_reais/01_companies_update.sql
```
- Atualiza as 4 empresas com dados reais
- Endereços, telefones e cores corretas
- Tempo: 5 segundos

### **2️⃣ Services (Serviços)**
```sql
dados_reais/02_services_update.sql
```
- Atualiza 14 serviços com preços reais
- Descrições detalhadas
- Durações corretas
- Tempo: 10 segundos

### **3️⃣ Clientes e Veículos**
```sql
dados_reais/03_clientes_exemplo.sql
```
- 5 clientes fictícios mas realistas
- 9 veículos cadastrados
- Diferentes perfis (Platina, Ouro, Prata, Bronze)
- **IMPORTANTE:** Requer usuários no Supabase Auth primeiro!

---

## 🎯 STATUS ATUAL

### ✅ **Já Populado (Inicial)**
- [x] 4 Empresas (básico)
- [x] 8 Roles
- [x] 14 Serviços (básico)
- [x] 6 Métodos de Pagamento
- [x] 10 Categorias de Peças
- [x] 9 Estágios do Pátio

### 🔄 **Sendo Populado (Dados Reais)**
- [x] Empresas (dados completos) ← PRONTO
- [x] Serviços (preços e descrições) ← PRONTO
- [ ] Clientes (5 exemplos) ← PRÓXIMO
- [ ] Veículos (9 exemplos) ← PRÓXIMO
- [ ] Agendamentos (histórico)
- [ ] Ordens de Serviço (exemplos)
- [ ] Peças em Estoque
- [ ] Promoções Ativas

---

## 👥 CLIENTES DE EXEMPLO

### 1. **João Silva Santos** 🏆 Platina
- 2 veículos: Civic EXL 2.0 (2022), CR-V Touring (2023)
- Cliente desde 2023
- Gasto total: > R$ 10.000

### 2. **Maria Oliveira Costa** 🥇 Ouro
- 1 veículo: Corolla XEI (2021)
- Cliente desde 2024
- Gasto total: R$ 5.000 - R$ 10.000

### 3. **Carlos Eduardo Mendes** 🥈 Prata
- 1 veículo: HB20S 1.6 (2020)
- Cliente desde 2024
- Gasto total: R$ 2.000 - R$ 5.000

### 4. **Ana Paula Rodrigues** 🥉 Bronze
- 1 veículo: Onix 1.0 (2019)
- Cliente desde 2026 (nova)
- Gasto total: < R$ 2.000

### 5. **Pedro Henrique Santos** 🏢 Empresarial
- 3 veículos: 2 Hilux, 1 L200 (frota)
- Cliente desde 2023
- Gasto total: > R$ 15.000

---

## 💰 PREÇOS DOS SERVIÇOS

| Serviço | Tipo | Preço | Duração |
|---------|------|-------|---------|
| Revisão 10.000km | Revisão | R$ 450 | 2h |
| Revisão 20.000km | Revisão | R$ 680 | 3h |
| Revisão 30.000km | Revisão | R$ 920 | 4h |
| Troca de Óleo | Revisão | R$ 180 | 1h |
| Alinhamento | Revisão | R$ 150 | 1.5h |
| Diagnóstico Completo | Diagnóstico | R$ 380 | 4h |
| Limpeza Bicos | Revisão | R$ 380 | 2h |
| Correia Dentada | Revisão | R$ 1.200 | 5h |
| Embreagem | Revisão | R$ 1.800 | 8h |

---

## 🚗 VEÍCULOS POR MARCA

- **Honda:** 2 (Civic, CR-V)
- **Toyota:** 4 (Corolla, 2x Hilux, L200)
- **Hyundai:** 1 (HB20S)
- **Chevrolet:** 1 (Onix)
- **Mitsubishi:** 1 (L200)

**Total:** 9 veículos

---

## 🎲 PRÓXIMOS PASSOS

### **FASE 1: Completar Clientes** ✅
- [x] Scripts de exemplo criados
- [ ] Criar usuários no Supabase Auth
- [ ] Executar scripts

### **FASE 2: Histórico**
- [ ] Criar agendamentos passados
- [ ] Criar OS concluídas
- [ ] Criar histórico de veículos

### **FASE 3: Estoque**
- [ ] Popular peças comuns
- [ ] Definir quantidades mínimas
- [ ] Preços de custo e venda

### **FASE 4: Marketing**
- [ ] Criar promoções ativas
- [ ] Criar eventos futuros
- [ ] Campanhas de fidelidade

---

## 📝 COMO USAR

### **Método 1: Supabase Dashboard**

1. Acesse: https://supabase.com/dashboard
2. SQL Editor → New Query
3. Cole o conteúdo do script
4. Clique em "Run"
5. Verifique os resultados

### **Método 2: Linha por linha**

Execute os SELECTs de verificação após cada INSERT/UPDATE para confirmar que os dados foram inseridos corretamente.

---

## ⚠️ AVISOS IMPORTANTES

### **Dados Fictícios**
- CPFs são fictícios (formato válido, mas não existem)
- Telefones são fictícios
- Endereços são exemplos
- Use apenas para testes e demonstração

### **IDs de Usuários**
- Os scripts usam `user-uuid-*` como placeholder
- **VOCÊ DEVE** substituir pelos UUIDs reais do `auth.users`
- Não funcionará sem isso!

### **Backup**
- Faça backup antes de executar
- Teste em ambiente de desenvolvimento primeiro
- Valide os dados inseridos

---

## 🔍 QUERIES DE VERIFICAÇÃO

### Listar todas as empresas:
```sql
SELECT name, phone, email, is_active FROM public.companies;
```

### Listar todos os serviços com preços:
```sql
SELECT name, price, duration_minutes FROM public.services WHERE is_active = true;
```

### Listar clientes e seus veículos:
```sql
SELECT 
  p.full_name,
  COUNT(v.id) as total_veiculos
FROM public.profiles p
LEFT JOIN public.vehicles v ON v.user_id = p.user_id
GROUP BY p.full_name;
```

---

## 📊 ESTATÍSTICAS ESPERADAS

Após executar todos os scripts:

```
✅ 4 Empresas completas
✅ 14 Serviços com preços reais
✅ 5 Clientes cadastrados
✅ 9 Veículos ativos
✅ 6 Métodos de pagamento
✅ 10 Categorias de peças
✅ 9 Estágios do pátio
```

**Total de registros:** ~57

---

## 🚀 BORA COMEÇAR!

**Você está aqui:** Fase 1 - Dados Básicos

**Próximo passo:** Execute `01_companies_update.sql` no Supabase!

---

**Última Atualização:** 30/01/2026  
**Status:** 🟢 Em Andamento
