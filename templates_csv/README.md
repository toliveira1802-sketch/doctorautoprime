# 📊 TEMPLATES CSV - DOCTOR AUTO PRIME

## 🎯 **COMO USAR:**

1. **Baixe todos os arquivos CSV** desta pasta
2. **Abra no Excel ou Google Sheets**
3. **Preencha com seus dados REAIS**
4. **Salve como CSV** (manter formato)
5. **Me devolva os arquivos preenchidos**
6. **Eu crio os scripts SQL automaticamente**

---

## 📁 **ARQUIVOS DISPONÍVEIS:**

### **1️⃣ `01_clientes.csv`**
**Campos:**
- `nome_completo`: Nome completo do cliente
- `cpf`: CPF formatado (123.456.789-00)
- `email`: E-mail válido
- `telefone`: Telefone formatado (11) 98765-4321
- `data_nascimento`: Formato YYYY-MM-DD (ex: 1985-03-15)
- `endereco_completo`: Rua, número, bairro
- `cep`: CEP formatado (01234-567)
- `cidade`: Nome da cidade
- `estado`: Sigla do estado (SP, RJ, etc)
- `tier_fidelidade`: platina, ouro, prata, bronze
- `pontos_fidelidade`: Número de pontos (0 a 10000)
- `empresa_id`: 1=Doctor Auto Prime, 2=Doctor Auto Bosch, 3=Garage 347, 4=GERAL
- `observacoes`: Informações adicionais (opcional)

**💡 Dica:** Deixe 3 linhas de exemplo e adicione quantas precisar!

---

### **2️⃣ `02_veiculos.csv`**
**Campos:**
- `placa`: Formato ABC-1234
- `marca`: Honda, Toyota, Volkswagen, etc
- `modelo`: Civic, Corolla, Jetta, etc
- `ano`: Ano do veículo (ex: 2022)
- `cor`: Cor do veículo
- `cpf_cliente`: CPF do dono (deve existir em clientes)
- `quilometragem`: KM atual do veículo
- `chassi`: Número do chassi (17 dígitos)
- `renavam`: Número do RENAVAM (11 dígitos)
- `observacoes`: Informações adicionais (opcional)

**💡 Dica:** Um cliente pode ter VÁRIOS veículos!

---

### **3️⃣ `03_ordens_servico.csv`**
**Campos:**
- `numero_os`: Formato OS-2026-0001 (único)
- `placa_veiculo`: Placa do veículo (deve existir em veículos)
- `cpf_cliente`: CPF do cliente (deve existir em clientes)
- `status`: orcamento, aprovado, em_execucao, concluido, cancelado
- `descricao_problema`: O que o cliente relatou
- `diagnostico`: O que o mecânico encontrou
- `mecanico_responsavel`: Nome do mecânico
- `data_entrada`: Data formato YYYY-MM-DD
- `data_prevista_conclusao`: Data formato YYYY-MM-DD
- `valor_orcado`: Valor em formato 850.00
- `valor_aprovado`: Valor aprovado (pode ficar vazio se ainda não aprovado)
- `empresa_id`: 1, 2, 3 ou 4
- `prioridade`: verde (tranquilo), amarelo (médio), vermelho (urgente)
- `observacoes`: Informações adicionais (opcional)

**💡 Dica:** Comece com 2-3 OS reais que você tem agora!

---

### **4️⃣ `04_itens_os.csv`**
**Campos:**
- `numero_os`: Número da OS (deve existir em ordens_servico)
- `tipo`: mao_de_obra ou peca
- `descricao`: Descrição do serviço/peça
- `quantidade`: Quantidade (geralmente 1)
- `valor_unitario`: Preço unitário (formato 350.00)
- `status`: pendente, em_andamento, concluido
- `observacoes`: Código da peça, detalhes extras (opcional)

**💡 Dica:** Cada OS pode ter VÁRIOS itens (peças + mão de obra)!

---

### **5️⃣ `05_agendamentos.csv`**
**Campos:**
- `placa_veiculo`: Placa do veículo
- `cpf_cliente`: CPF do cliente
- `data_agendamento`: Data formato YYYY-MM-DD
- `hora_agendamento`: Hora formato HH:MM (ex: 09:00)
- `servico_solicitado`: O que o cliente quer fazer
- `status`: pendente, confirmado, cancelado, concluido
- `observacoes_cliente`: Preferências do cliente (opcional)
- `empresa_id`: 1, 2, 3 ou 4

**💡 Dica:** Coloque agendamentos futuros reais!

---

### **6️⃣ `06_pecas_estoque.csv`**
**Campos:**
- `codigo_peca`: Código único da peça (ex: OLEO-5W30-4L)
- `nome`: Nome descritivo da peça
- `categoria`: Lubrificantes, Filtros, Freios, Correias, etc
- `fabricante`: Mobil, Bosch, Gates, Tecfil, etc
- `preco_custo`: Preço que você paga (formato 145.00)
- `preco_venda`: Preço que você cobra (formato 180.00)
- `estoque_atual`: Quantidade em estoque
- `estoque_minimo`: Quando deve repor
- `localizacao`: Onde fica no estoque (ex: Prateleira A1)
- `empresa_id`: 1, 2, 3 ou 4
- `observacoes`: Original, Paralelo, etc (opcional)

**💡 Dica:** Coloque as peças que você mais usa!

---

### **7️⃣ `07_patio_kanban.csv`**
**Campos:**
- `numero_os`: Número da OS
- `placa_veiculo`: Placa do veículo
- `estagio_atual`: aguardando_entrada, diagnostico, aguardando_aprovacao, aguardando_pecas, em_execucao, controle_qualidade, finalizado, aguardando_retirada, concluido
- `data_entrada_patio`: Data e hora formato YYYY-MM-DD HH:MM:SS
- `mecanico_responsavel`: Nome do mecânico
- `observacoes_patio`: Status atual do veículo no pátio

**💡 Dica:** Mostre onde cada carro está AGORA no processo!

---

### **8️⃣ `08_pagamentos.csv`**
**Campos:**
- `numero_os`: Número da OS
- `cpf_cliente`: CPF do cliente
- `data_pagamento`: Data formato YYYY-MM-DD
- `forma_pagamento`: dinheiro, pix, cartao_debito, cartao_credito, transferencia
- `valor_total`: Valor total (formato 650.00)
- `valor_pago`: Valor já pago (formato 650.00)
- `status_pagamento`: pendente, pago, parcial, atrasado
- `numero_parcelas`: Número de parcelas (1 se à vista)
- `observacoes`: Descontos, condições (opcional)

**💡 Dica:** Registre os pagamentos das OS concluídas!

---

## ⚠️ **REGRAS IMPORTANTES:**

### **Relacionamentos:**
1. **Veículos** precisam ter um **Cliente** (CPF deve existir)
2. **Ordens de Serviço** precisam ter **Veículo** E **Cliente**
3. **Itens de OS** precisam ter uma **OS** existente
4. **Agendamentos** precisam ter **Veículo** E **Cliente**
5. **Pátio** precisa ter uma **OS** existente
6. **Pagamentos** precisam ter uma **OS** existente

### **Formatos:**
- ✅ **CPF:** 123.456.789-00
- ✅ **Telefone:** (11) 98765-4321
- ✅ **CEP:** 01234-567
- ✅ **Placa:** ABC-1234
- ✅ **Data:** YYYY-MM-DD (ex: 2026-01-30)
- ✅ **Hora:** HH:MM (ex: 09:00)
- ✅ **Valor:** 850.00 (sem R$, ponto como decimal)

### **IDs das Empresas:**
- `1` = Doctor Auto Prime
- `2` = Doctor Auto Bosch
- `3` = Garage 347
- `4` = GERAL

---

## 🎯 **ORDEM DE PREENCHIMENTO:**

1. **Primeiro:** `01_clientes.csv`
2. **Segundo:** `02_veiculos.csv` (com CPFs dos clientes)
3. **Terceiro:** `03_ordens_servico.csv` (com placas e CPFs)
4. **Quarto:** `04_itens_os.csv` (com números de OS)
5. **Quinto:** `05_agendamentos.csv` (com placas e CPFs)
6. **Sexto:** `06_pecas_estoque.csv`
7. **Sétimo:** `07_patio_kanban.csv` (com números de OS)
8. **Oitavo:** `08_pagamentos.csv` (com números de OS)

---

## 🚀 **DEPOIS DE PREENCHER:**

1. **Salve cada arquivo como CSV**
2. **Me envie todos de volta**
3. **Eu gero os scripts SQL automaticamente**
4. **Você executa no Supabase**
5. **PRONTO! Banco com dados reais! 🎉**

---

## 💡 **DÚVIDAS COMUNS:**

**Q: Preciso preencher TODOS os arquivos?**
A: Não! Comece com o essencial: clientes, veículos e 1-2 OS.

**Q: Posso adicionar mais linhas?**
A: SIM! Adicione quantas precisar!

**Q: E se eu errar algum campo?**
A: Sem problema! Eu valido e te aviso antes de gerar o SQL.

**Q: Posso deixar campos vazios?**
A: Alguns sim (observações), outros não (nome, CPF, placa). Veja os exemplos!

---

## 📞 **PRECISA DE AJUDA?**

Me mande as dúvidas que eu te ajudo a preencher! 🎯
