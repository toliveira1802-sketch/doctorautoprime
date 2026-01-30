# 🌐 DEPLOY NO HOSTINGER - Guia Completo

> **Bot de Telegram - Doctor Auto Prime**  
> **Plataforma**: Hostinger VPS  
> **Tempo estimado**: 15-20 minutos

---

## 📋 PRÉ-REQUISITOS

### O que você precisa ter:

1. ✅ **Conta Hostinger com VPS**
   - Plano VPS 1 ou superior
   - Mínimo: 1 vCPU, 2GB RAM

2. ✅ **Acesso SSH ao VPS**
   - IP do servidor
   - Usuário (geralmente `root`)
   - Senha ou chave SSH

3. ✅ **Token do Bot Telegram**
   - Obtido através do @BotFather

4. ✅ **Credenciais do Supabase**
   - URL do projeto
   - Service Role Key

---

## 🚀 PASSO A PASSO

### ETAPA 1: Conectar ao VPS

#### Windows (PowerShell ou CMD)

```bash
ssh root@seu-ip-do-vps
# Digite a senha quando solicitado
```

#### Linux/Mac (Terminal)

```bash
ssh root@seu-ip-do-vps
# Digite a senha quando solicitado
```

**Exemplo**:
```bash
ssh root@185.123.456.789
```

---

### ETAPA 2: Atualizar Sistema

```bash
# Atualizar pacotes do sistema
apt-get update && apt-get upgrade -y
```

---

### ETAPA 3: Instalar Node.js 20

```bash
# Baixar e instalar Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

# Verificar instalação
node --version   # Deve mostrar v20.x.x
npm --version    # Deve mostrar 10.x.x
```

---

### ETAPA 4: Criar Diretório do Bot

```bash
# Criar diretório para o bot
mkdir -p /var/www/telegram-bot
cd /var/www/telegram-bot

# Confirmar que está no diretório correto
pwd   # Deve mostrar: /var/www/telegram-bot
```

---

### ETAPA 5: Copiar Arquivos do Projeto

#### Opção A: Via SCP (do seu computador local)

**No seu computador local** (não no VPS):

```bash
# Navegar até o projeto
cd /home/user/webapp/api/telegram

# Copiar todos os arquivos para o VPS
scp -r * root@SEU-IP-DO-VPS:/var/www/telegram-bot/

# Exemplo:
scp -r * root@185.123.456.789:/var/www/telegram-bot/
```

#### Opção B: Via Git (se você tem um repositório)

**No VPS**:

```bash
cd /var/www/telegram-bot
git clone https://github.com/seu-usuario/seu-repo.git .
```

#### Opção C: Criar Arquivos Manualmente (última opção)

Se as outras opções não funcionarem, você pode criar os arquivos manualmente:

```bash
cd /var/www/telegram-bot

# Criar package.json
nano package.json
# Cole o conteúdo e salve (Ctrl+X, Y, Enter)

# Criar bot.js
nano bot.js
# Cole o conteúdo e salve

# E assim por diante...
```

---

### ETAPA 6: Instalar Dependências

```bash
cd /var/www/telegram-bot
npm install --production
```

Você verá:
```
added 127 packages in 15s
```

---

### ETAPA 7: Configurar Variáveis de Ambiente

```bash
# Copiar arquivo de exemplo
cp .env.example .env

# Editar o arquivo .env
nano .env
```

**Configure assim**:

```env
# ============================================
# TELEGRAM BOT CONFIGURATION
# ============================================
TELEGRAM_BOT_TOKEN=8268659327:AAGKKbXCqz4UxHH6yCiyFxW7Xt3BLn6BsrI

# ============================================
# SUPABASE (DOCTOR AUTO PRIME DATABASE)
# ============================================
SUPABASE_URL=https://acuufrgoyjwzlyhopaus.supabase.co
SUPABASE_SERVICE_ROLE_KEY=SEU_SERVICE_ROLE_KEY_AQUI

# ============================================
# ADMIN USERS (Seu Telegram ID)
# ============================================
ADMIN_USER_IDS=SEU_TELEGRAM_ID_AQUI

# ============================================
# BOT SETTINGS
# ============================================
NODE_ENV=production
LOG_LEVEL=info
```

**⚠️ IMPORTANTE**: 
- Substitua `SEU_SERVICE_ROLE_KEY_AQUI` pela sua chave real
- Obtenha seu Telegram ID em [@userinfobot](https://t.me/userinfobot)
- **NUNCA** compartilhe estas chaves!

**Salvar**: `Ctrl + X`, depois `Y`, depois `Enter`

---

### ETAPA 8: Testar Conexões

```bash
npm test
```

**Resultado esperado**:
```
✅ Telegram Bot OK!
✅ Supabase OK!
✅ Dados do sistema OK!

✅ TODOS OS TESTES PASSARAM!
🚀 O bot está pronto para ser iniciado
```

**Se houver erro**:
- Verifique se o `.env` está correto
- Confirme que as chaves são válidas
- Tente novamente: `nano .env`

---

### ETAPA 9: Instalar PM2 (Gerenciador)

```bash
# Instalar PM2 globalmente
npm install -g pm2

# Verificar instalação
pm2 --version
```

---

### ETAPA 10: Iniciar o Bot

```bash
# Iniciar o bot com PM2
pm2 start ecosystem.config.js

# Verificar status
pm2 status
```

**Você verá**:
```
┌────┬────────────────────────────┬─────────┬─────────┐
│ id │ name                       │ status  │ restart │
├────┼────────────────────────────┼─────────┼─────────┤
│ 0  │ telegram-bot-doctor-auto   │ online  │ 0       │
└────┴────────────────────────────┴─────────┴─────────┘
```

---

### ETAPA 11: Configurar Auto-Start (Importante!)

```bash
# Salvar configuração do PM2
pm2 save

# Configurar para iniciar automaticamente ao reiniciar o servidor
pm2 startup

# Copie e execute o comando que aparecer na tela
# Será algo como:
# sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u root --hp /root
```

---

### ETAPA 12: Testar o Bot! 🎉

1. Abra o Telegram
2. Procure pelo seu bot (o @username que você criou)
3. Envie: `/start`
4. Você deve receber a mensagem de boas-vindas!

---

## 🔧 COMANDOS ÚTEIS

### Gerenciar o Bot

```bash
# Ver status
pm2 status

# Ver logs em tempo real
pm2 logs telegram-bot-doctor-auto

# Reiniciar o bot
pm2 restart telegram-bot-doctor-auto

# Parar o bot
pm2 stop telegram-bot-doctor-auto

# Deletar o bot do PM2
pm2 delete telegram-bot-doctor-auto

# Monitoramento visual
pm2 monit
```

### Ver Logs

```bash
# Logs em tempo real
pm2 logs telegram-bot-doctor-auto

# Últimas 100 linhas
pm2 logs telegram-bot-doctor-auto --lines 100

# Apenas erros
pm2 logs telegram-bot-doctor-auto --err

# Logs salvos em arquivos
cat /var/www/telegram-bot/logs/out.log
cat /var/www/telegram-bot/logs/error.log
```

### Atualizar o Bot

```bash
cd /var/www/telegram-bot

# Fazer backup do .env
cp .env .env.backup

# Atualizar código (via git, scp ou manualmente)
git pull
# ou
scp novo-arquivo.js root@seu-ip:/var/www/telegram-bot/

# Reinstalar dependências se necessário
npm install --production

# Restaurar .env
cp .env.backup .env

# Reiniciar o bot
pm2 restart telegram-bot-doctor-auto
```

---

## 🔒 SEGURANÇA

### Configurar Firewall (UFW)

```bash
# Permitir SSH (IMPORTANTE!)
ufw allow 22/tcp

# Habilitar firewall
ufw enable

# Ver status
ufw status
```

### Proteger .env

```bash
# Garantir que apenas root pode ler
chmod 600 /var/www/telegram-bot/.env

# Verificar permissões
ls -la /var/www/telegram-bot/.env
# Deve mostrar: -rw------- (apenas root)
```

---

## 🛠️ TROUBLESHOOTING

### Problema: "Bot não inicia"

```bash
# Ver logs de erro
pm2 logs telegram-bot-doctor-auto --err

# Verificar se as dependências estão instaladas
cd /var/www/telegram-bot && ls node_modules/

# Reinstalar
rm -rf node_modules package-lock.json
npm install --production

# Tentar iniciar novamente
pm2 restart telegram-bot-doctor-auto
```

### Problema: "Erro 409 Conflict"

Significa que o bot já está rodando em outro lugar.

```bash
# Parar todas as instâncias
pm2 delete all

# Procurar processos do Node.js
ps aux | grep node

# Matar processos manualmente se necessário
kill -9 [PID]

# Reiniciar o bot
pm2 start ecosystem.config.js
```

### Problema: "Sem conexão com Supabase"

```bash
# Testar conexão
npm test

# Se falhar, verificar:
# 1. A chave está correta no .env?
nano .env

# 2. O servidor tem acesso à internet?
ping 8.8.8.8

# 3. Firewall do Supabase permite seu IP?
curl -I https://acuufrgoyjwzlyhopaus.supabase.co
```

### Problema: "Bot responde mas não retorna dados"

```bash
# Verificar permissões do usuário no Supabase
# O Service Role Key tem acesso total?

# Testar query manualmente
node -e "
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
supabase.from('companies').select('*').then(console.log);
"
```

---

## 📊 MONITORAMENTO

### Dashboard PM2

```bash
# Ver dashboard interativo
pm2 monit

# Navegar com setas do teclado
# Pressione 'q' para sair
```

### Verificar Uso de Recursos

```bash
# Ver RAM e CPU
pm2 show telegram-bot-doctor-auto

# Ver uso geral do servidor
htop
# ou
top
```

### Logs Automáticos

Os logs ficam salvos em:
```
/var/www/telegram-bot/logs/out.log       (saída padrão)
/var/www/telegram-bot/logs/error.log     (erros)
/var/www/telegram-bot/logs/combined.log  (ambos)
```

---

## 🎯 CHECKLIST FINAL

Antes de finalizar, confirme:

- [ ] Bot responde ao `/start` no Telegram
- [ ] Comando `/stats` retorna dados corretos
- [ ] Comando `/os` lista ordens de serviço
- [ ] Comando `/patio` mostra status do pátio
- [ ] PM2 está configurado para auto-start
- [ ] Firewall está habilitado (SSH permitido)
- [ ] Arquivo `.env` tem permissões corretas (600)
- [ ] Logs estão sendo gravados corretamente

---

## 🆘 SUPORTE RÁPIDO

### Comandos de Emergência

```bash
# Reiniciar tudo
pm2 restart all

# Ver o que está acontecendo
pm2 logs --lines 50

# Reiniciar o VPS (última opção)
reboot
```

### Contato

Se nada funcionar:

📧 **Email**: toliveira1802@gmail.com  
👨‍💻 **Dev**: Thales Oliveira  
📱 **Telegram**: @seu_usuario

---

## ✅ PRONTO!

Seu bot está rodando no Hostinger! 🎉

**Teste agora**:
1. Abra o Telegram
2. Procure seu bot
3. Envie `/start`

**📱 Comece a usar os 15 agentes de IA via Telegram!**

---

**© 2026 Doctor Auto Prime**
