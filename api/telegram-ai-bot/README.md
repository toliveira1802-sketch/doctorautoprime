# 🤖 BOT DE TELEGRAM COM MÚLTIPLAS IAs

> **Bot integrado com Claude, GPT-4 e Gemini**  
> **Sistema**: Doctor Auto Prime  
> **Status**: ✅ Pronto para uso

---

## 🎯 O QUE É ISSO?

Um bot de Telegram que:
- ✅ Conversa com **3 IAs diferentes** (Claude, GPT, Gemini)
- ✅ Acessa dados do **Supabase** (Doctor Auto Prime)
- ✅ Dá **insights inteligentes** sobre o negócio
- ✅ Funciona via **celular** (Telegram)

---

## 📦 O QUE VOCÊ PRECISA

### 1. APIs de IA (pelo menos uma)

**Claude (Anthropic)** - Recomendado!
- Melhor para análises complexas
- Cadastre em: https://console.anthropic.com/
- Preço: ~$3-15/mês (uso normal)

**OpenAI (GPT-4)**
- Versátil e rápido
- Cadastre em: https://platform.openai.com/
- Preço: ~$5-20/mês

**Google (Gemini)**
- Excelente com dados
- Cadastre em: https://makersuite.google.com/
- Preço: GRÁTIS (com limites)

### 2. Bot do Telegram

Você JÁ TEM!
```
Token: 8268659327:AAGKKbXCqz4UxHH6yCiyFxW7Xt3BLn6BsrI
```

### 3. Supabase

Você JÁ TEM!
```
URL: https://acuufrgoyjwzlyhopaus.supabase.co
Service Role Key: precisa pegar no painel
```

---

## 🚀 INSTALAÇÃO RÁPIDA

### No seu computador (testar):

```bash
cd /home/user/webapp/api/telegram-ai-bot

# Instalar dependências
npm install

# Configurar
cp .env.example .env
nano .env  # Adicione suas chaves

# Rodar
npm start
```

### No Hostinger (produção):

```bash
# 1. Conectar SSH
ssh root@seu-ip-hostinger

# 2. Navegar/criar pasta
mkdir -p /var/www/telegram-bot
cd /var/www/telegram-bot

# 3. Copiar arquivos (do seu PC)
scp -r /home/user/webapp/api/telegram-ai-bot/* root@seu-ip:/var/www/telegram-bot/

# 4. Instalar
npm install --production

# 5. Configurar
nano .env  # Adicione as chaves

# 6. Rodar com PM2
npm install -g pm2
pm2 start bot.js --name telegram-ai-bot
pm2 save
pm2 startup
```

---

## ⚙️ CONFIGURAÇÃO (.env)

```env
# ============================================
# TELEGRAM BOT (JÁ TEM!)
# ============================================
TELEGRAM_BOT_TOKEN=8268659327:AAGKKbXCqz4UxHH6yCiyFxW7Xt3BLn6BsrI

# ============================================
# SUPABASE (JÁ TEM!)
# ============================================
SUPABASE_URL=https://acuufrgoyjwzlyhopaus.supabase.co
SUPABASE_SERVICE_ROLE_KEY=SUA_CHAVE_AQUI  # ⚠️ Pegue no painel

# ============================================
# IAs (PRECISA CRIAR)
# ============================================
# Claude (Recomendado!)
ANTHROPIC_API_KEY=sk-ant-...  # https://console.anthropic.com/

# OpenAI (Opcional)
OPENAI_API_KEY=sk-...  # https://platform.openai.com/

# Gemini (Opcional - GRÁTIS!)
GOOGLE_API_KEY=AIza...  # https://makersuite.google.com/

# ============================================
# CONFIGURAÇÕES
# ============================================
DEFAULT_AI=claude  # ou gpt, ou gemini
ADMIN_USER_IDS=SEU_TELEGRAM_ID  # Pegue em @userinfobot
```

---

## 💬 COMO USAR

### Conversar com IAs

```
/claude Como melhorar o atendimento?
/gpt Analise os dados de hoje
/gemini Quais são os gargalos?
```

Ou apenas envie uma mensagem (usa IA padrão):
```
Olá! Como está o negócio?
```

### Consultar Dados (Admin)

```
/stats      - Estatísticas + insights
/os         - Últimas OS + análise
/clientes João - Buscar cliente
/patio      - Status + gargalos
```

### Ajuda

```
/start  - Começar
/help   - Ajuda completa
/about  - Sobre o bot
```

---

## 🎯 EXEMPLO DE USO REAL

**Você:** `/stats`

**Bot:** 
```
📊 ESTATÍSTICAS - DOCTOR AUTO PRIME

📅 HOJE
• Ordens de Serviço: 12

💼 GERAL  
• Total de Clientes: 487
• Empresas Ativas: 3

🤖 INSIGHTS DA IA:
"O volume de 12 OS hoje está 15% acima da média semanal. 
Recomendo atenção ao pátio para evitar gargalos no setor 
de aguardando_aprovacao, que tem 4 veículos parados."

⏰ Atualizado: 30/01/2026 14:45
```

---

## 💰 CUSTOS ESTIMADOS

### Por IA (uso normal - 100 perguntas/dia)

- **Claude**: ~$5-10/mês
- **OpenAI**: ~$10-15/mês
- **Gemini**: GRÁTIS (até 60 req/min)

### Recomendação

**Comece com Gemini (grátis!)** e depois adicione Claude se precisar de análises mais sofisticadas.

---

## 🔧 SOLUÇÃO DE PROBLEMAS

### Bot não responde

```bash
# Ver logs
pm2 logs telegram-ai-bot

# Reiniciar
pm2 restart telegram-ai-bot

# Ver status
pm2 status
```

### Erro de API Key

- Verifique se copiou corretamente
- Teste a chave no site da IA
- Confira se tem créditos

### "Acesso negado"

- Pegue seu Telegram ID: @userinfobot
- Adicione no `.env`: `ADMIN_USER_IDS=seu_id`
- Reinicie: `pm2 restart telegram-ai-bot`

---

## 📊 QUAL IA ESCOLHER?

### Claude (Anthropic) - RECOMENDADO ⭐
✅ Melhor para análises complexas  
✅ Mais "inteligente" e contextual  
✅ Ótimo para negócios  
💰 ~$5-10/mês

### GPT-4 (OpenAI)
✅ Versátil e conhecido  
✅ Rápido  
✅ Muita documentação  
💰 ~$10-15/mês

### Gemini (Google) - GRÁTIS! 🎉
✅ GRATUITO (até 60 req/min)  
✅ Excelente com dados estruturados  
✅ Rápido  
💰 R$ 0,00

---

## 🎓 DICAS DE USO

### Perguntas Boas ✅

```
/claude Analise as últimas 5 OS e identifique padrões
/gpt Como posso reduzir o tempo de aprovação?
/gemini Quais clientes estão inativos há mais de 90 dias?
```

### Perguntas Ruins ❌

```
/claude oi
/gpt o que você faz?
/gemini 123
```

---

## 🔒 SEGURANÇA

⚠️ **NUNCA COMPARTILHE**:
- Service Role Key do Supabase
- API Keys das IAs
- Token do Bot

✅ **SEMPRE FAÇA**:
- Adicione `.env` ao `.gitignore`
- Use variáveis de ambiente
- Limite acesso admin

---

## 📞 PRÓXIMOS PASSOS

### 1. Configure as APIs (10 minutos)

1. **Gemini** (GRÁTIS): https://makersuite.google.com/
   - Faça login com Google
   - Clique "Get API Key"
   - Copie a chave

2. **Claude** (PAGO): https://console.anthropic.com/
   - Crie conta
   - Adicione cartão
   - Gere API Key

### 2. Configure o .env (2 minutos)

```bash
cd /home/user/webapp/api/telegram-ai-bot
cp .env.example .env
nano .env
# Cole suas chaves
```

### 3. Teste Local (1 minuto)

```bash
npm install
npm start
```

### 4. Teste no Telegram

- Procure seu bot
- Envie: `/start`
- Envie: `/claude Olá!`

### 5. Deploy no Hostinger

- Siga o guia de deploy acima
- Use PM2 para manter rodando

---

## 🎉 PRONTO!

Agora você tem um assistente de IA no Telegram! 🤖

**Próximas melhorias possíveis:**
- Notificações automáticas
- Relatórios agendados
- Integração com WhatsApp
- Dashboard web

---

## 📧 SUPORTE

**Email**: toliveira1802@gmail.com  
**Sistema**: Doctor Auto Prime V1.1  
**Bot**: Telegram AI Bot V1.0

---

**© 2026 Doctor Auto Prime**
