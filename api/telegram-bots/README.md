# 🤖 3 BOTS DE TELEGRAM COM IA

> **Sistema Doctor Auto Prime**  
> **3 Bots com Gemini IA**

---

## 📋 OS 3 BOTS

### 🟣 SIMONE - EMPRESA (Doctor Auto Prime)
- **Função**: Gerenciar empresa Doctor Auto Prime
- **IA**: Gemini 2.0 Flash Thinking Exp
- **Token**: `8268659327:AAGKKbXCqz4UxHH6yCiyFxW7Xt3BLn6BsrI`
- **Comandos**: /stats, /os, /patio, /clientes

### 🔵 SOPHIA - ASSISTENTE PESSOAL
- **Função**: Sua assistente pessoal inteligente
- **IA**: Gemini 2.0 Flash Exp
- **Token**: `8163791940:AAEwOZQTqPcJb8IQiwIIFZsDNw7GX3lz2Xw`
- **Comandos**: /motivacao, /dica, conversa livre

### 🟢 ANNA - KOMMO/CRM
- **Função**: Gestão de CRM e vendas
- **IA**: Gemini 1.5 Flash
- **Token**: `8556810685:AAG3u26TuwkASpEuBNIF-srmGGs0inb4gb8`
- **Comandos**: /leads, /funil, /qualificar

---

## ⚙️ CONFIGURAÇÃO

### 1. Pegue a Service Role Key do Supabase
```
https://supabase.com/dashboard
→ Seu projeto
→ Settings → API
→ Copie "service_role key"
```

### 2. Pegue seu Telegram ID
```
No Telegram: @userinfobot
Envie: /start
Copie seu ID
```

### 3. Configure o .env
```bash
cp .env.example .env
nano .env
# Preencha SUPABASE_SERVICE_ROLE_KEY e ADMIN_USER_ID
```

**Tudo já está configurado!** Só falta essas 2 info!

---

## 🚀 INSTALAÇÃO NO HOSTINGER

### Pré-requisitos
- Node.js 18+
- PM2 instalado
- Acesso SSH

### Passo 1: Copiar arquivos
```bash
scp -r /home/user/webapp/api/telegram-bots root@seu-ip:/var/www/
```

### Passo 2: Instalar dependências
```bash
cd /var/www/telegram-bots
npm install --production
```

### Passo 3: Configurar .env
```bash
cp .env.example .env
nano .env
# Adicione as configurações
```

### Passo 4: Iniciar com PM2
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

---

## 📊 ESTRUTURA

```
telegram-bots/
├── simone/          # Bot SIMONE PRO
├── sophia/          # Bot SOPHIA
├── anna/            # Bot ANNA
├── shared/          # Código compartilhado
├── .env.example     # Template de configuração
├── ecosystem.config.js  # PM2 config
└── README.md        # Este arquivo
```

---

## 🔧 GERENCIAR OS BOTS

```bash
# Ver status
pm2 status

# Ver logs
pm2 logs

# Reiniciar todos
pm2 restart all

# Reiniciar um específico
pm2 restart simone
pm2 restart sophia
pm2 restart anna
```

---

## 📞 SUPORTE

**Email**: toliveira1802@gmail.com  
**Sistema**: Doctor Auto Prime V1.1

---

**© 2026 Doctor Auto Prime**
