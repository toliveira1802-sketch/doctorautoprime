# 🤖 Doctor Auto Prime - Telegram Bot

> **Bot de Telegram Integrado com 15 Agentes de IA**  
> **Versão**: 1.0.0  
> **Status**: ✅ Pronto para Deploy

---

## 📋 ÍNDICE

1. [Visão Geral](#visão-geral)
2. [Funcionalidades](#funcionalidades)
3. [Instalação Local](#instalação-local)
4. [Deploy no Hostinger](#deploy-no-hostinger)
5. [Configuração](#configuração)
6. [Comandos Disponíveis](#comandos-disponíveis)
7. [Integrações](#integrações)
8. [Segurança](#segurança)
9. [Troubleshooting](#troubleshooting)

---

## 🎯 VISÃO GERAL

Este bot de Telegram permite acesso completo ao sistema **Doctor Auto Prime** através do Telegram, oferecendo:

- ✅ Consulta de Ordens de Serviço
- ✅ Busca de Clientes e Veículos
- ✅ Status do Pátio Kanban (9 estágios)
- ✅ Estatísticas em Tempo Real
- ✅ Acesso aos 15 Agentes de IA
- ✅ Comandos Administrativos
- ✅ Sistema de Permissões (RBAC)

### Tecnologias Utilizadas

- **Node.js** 18+ (Runtime)
- **node-telegram-bot-api** (Integração Telegram)
- **@supabase/supabase-js** (Banco de dados)
- **dotenv** (Variáveis de ambiente)
- **axios** (Requisições HTTP)

---

## 🚀 FUNCIONALIDADES

### 📊 Consultas e Relatórios

- `/stats` - Estatísticas gerais do sistema
- `/os [filtro]` - Listar ordens de serviço
- `/clientes [busca]` - Buscar clientes por nome ou placa
- `/patio` - Status do pátio Kanban em tempo real

### 🤖 Sistema de IA (15 Agentes)

#### 🟢 Camada de Atendimento
- **Scout** - Qualificação de Leads
- **Comm** - Comunicação Automatizada
- **Auto** - Automação de Processos

#### 🔵 Camada de Diagnóstico
- **Francisco** - Diagnóstico Técnico
- **Ev8** - Avaliação de Problemas
- **Check** - Checklist de Inspeção

#### 🟣 Camada de Análise
- **Thales** - Análise Técnica Avançada
- **Prime** - Otimização Premium
- **Bia** - Business Intelligence
- **Juan** - Gestão Operacional
- **Doctor** - Supervisão Geral
- **Atlas** - Mapeamento de Dados
- **Book** - Documentação

### ⚙️ Comandos Administrativos

- `/empresas` - Listar empresas cadastradas
- `/usuarios` - Listar usuários do sistema
- `/logs` - Ver logs recentes

### ℹ️ Ajuda e Informações

- `/start` - Mensagem de boas-vindas
- `/help` - Guia completo de uso
- `/about` - Informações sobre o sistema

---

## 💻 INSTALAÇÃO LOCAL

### Pré-requisitos

- Node.js 18+ instalado
- Conta no Telegram
- Acesso ao banco Supabase do Doctor Auto Prime

### Passo 1: Clonar/Acessar o Projeto

```bash
cd /home/user/webapp/api/telegram
```

### Passo 2: Instalar Dependências

```bash
npm install
```

### Passo 3: Configurar Variáveis de Ambiente

```bash
# Copiar o arquivo de exemplo
cp .env.example .env

# Editar o arquivo .env
nano .env
```

Preencha as seguintes variáveis:

```env
TELEGRAM_BOT_TOKEN=8268659327:AAGKKbXCqz4UxHH6yCiyFxW7Xt3BLn6BsrI
SUPABASE_URL=https://acuufrgoyjwzlyhopaus.supabase.co
SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key_aqui
ADMIN_USER_IDS=123456789
```

### Passo 4: Testar Conexões

```bash
npm test
```

Você deve ver:
```
✅ TODOS OS TESTES PASSARAM!
🚀 O bot está pronto para ser iniciado
```

### Passo 5: Iniciar o Bot

```bash
npm start
```

O bot estará rodando e aguardando mensagens!

---

## 🌐 DEPLOY NO HOSTINGER

### Opção 1: VPS Hostinger (Recomendado)

#### 1. Conectar ao VPS via SSH

```bash
ssh root@seu-ip-hostinger
```

#### 2. Instalar Node.js (se não tiver)

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs
node --version  # Verificar instalação
```

#### 3. Clonar/Copiar o Projeto

```bash
mkdir -p /var/www/telegram-bot
cd /var/www/telegram-bot

# Copie os arquivos via SCP ou git
```

#### 4. Instalar Dependências

```bash
npm install --production
```

#### 5. Configurar .env

```bash
nano .env
```

Adicione suas credenciais.

#### 6. Instalar PM2 (Gerenciador de Processos)

```bash
npm install -g pm2
```

#### 7. Criar Arquivo de Configuração PM2

Crie `ecosystem.config.js`:

```javascript
module.exports = {
  apps: [{
    name: 'telegram-bot-doctor-auto',
    script: './bot.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '500M',
    env: {
      NODE_ENV: 'production'
    }
  }]
};
```

#### 8. Iniciar o Bot com PM2

```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

#### 9. Verificar Status

```bash
pm2 status
pm2 logs telegram-bot-doctor-auto
```

#### 10. Configurar Firewall (opcional)

```bash
ufw allow 22/tcp    # SSH
ufw enable
```

### Opção 2: Hostinger Shared Hosting

⚠️ **Limitação**: Hospedagem compartilhada geralmente não suporta Node.js com processos contínuos.

**Alternativa**: Use um serviço gratuito como:
- Railway.app
- Render.com
- Fly.io
- Heroku (com limitações)

#### Deploy no Railway (Grátis)

1. Acesse https://railway.app
2. Conecte seu GitHub
3. Importe o repositório
4. Adicione as variáveis de ambiente
5. Deploy automático!

---

## ⚙️ CONFIGURAÇÃO

### Obter Token do Bot Telegram

1. Abra o Telegram e procure por [@BotFather](https://t.me/botfather)
2. Envie `/newbot`
3. Escolha um nome e username
4. Copie o token fornecido
5. Cole no `.env` em `TELEGRAM_BOT_TOKEN`

### Obter Seu Telegram User ID

1. Procure por [@userinfobot](https://t.me/userinfobot) no Telegram
2. Envie `/start`
3. Copie seu ID
4. Adicione no `.env` em `ADMIN_USER_IDS`

### Obter Service Role Key do Supabase

1. Acesse https://supabase.com/dashboard
2. Selecione seu projeto Doctor Auto Prime
3. Vá em **Settings** > **API**
4. Copie a **service_role key** (⚠️ nunca exponha publicamente)
5. Cole no `.env`

---

## 📱 COMANDOS DISPONÍVEIS

### Comandos Básicos

| Comando | Descrição | Exemplo |
|---------|-----------|---------|
| `/start` | Iniciar o bot | `/start` |
| `/help` | Ajuda completa | `/help` |
| `/about` | Sobre o sistema | `/about` |

### Consultas (Admin)

| Comando | Descrição | Exemplo |
|---------|-----------|---------|
| `/stats` | Estatísticas gerais | `/stats` |
| `/os` | Listar todas as OS | `/os` |
| `/os [filtro]` | Filtrar OS | `/os aberta` |
| `/clientes [busca]` | Buscar clientes | `/clientes João` |
| `/clientes [placa]` | Buscar por placa | `/clientes ABC-1234` |
| `/patio` | Status do pátio | `/patio` |

### Agentes de IA

| Comando | Descrição | Exemplo |
|---------|-----------|---------|
| `/ias` | Listar todos os agentes | `/ias` |
| `/ia scout [msg]` | Falar com Scout | `/ia scout Qualificar lead X` |
| `/ia francisco [msg]` | Falar com Francisco | `/ia francisco Diagnóstico motor` |

### Administração (Admin)

| Comando | Descrição | Exemplo |
|---------|-----------|---------|
| `/empresas` | Listar empresas | `/empresas` |
| `/usuarios` | Listar usuários | `/usuarios` |
| `/logs` | Ver logs | `/logs` |

---

## 🔗 INTEGRAÇÕES

### Supabase Database

O bot se conecta diretamente ao banco de dados Supabase do Doctor Auto Prime, acessando:

- ✅ `companies` - Empresas
- ✅ `clients` - Clientes
- ✅ `vehicles` - Veículos
- ✅ `ordens_servico` - Ordens de Serviço
- ✅ `appointments` - Agendamentos

### APIs de IA (Futuro)

O bot está preparado para integrar com:

- OpenAI GPT-4/3.5
- Anthropic Claude
- Google Gemini
- Groq (LLaMA, Mixtral)
- Together AI
- Perplexity AI

---

## 🔒 SEGURANÇA

### Sistema de Permissões

- ✅ Apenas admins autorizados (via `ADMIN_USER_IDS`)
- ✅ Comandos sensíveis bloqueados para não-admins
- ✅ Logs de todas as ações
- ✅ Service Role Key protegida (nunca exposta)

### Boas Práticas

1. **Nunca** commite o arquivo `.env`
2. **Sempre** use variáveis de ambiente
3. **Mantenha** o `SUPABASE_SERVICE_ROLE_KEY` secreto
4. **Adicione** apenas IDs confiáveis em `ADMIN_USER_IDS`
5. **Monitore** os logs regularmente

---

## 🛠️ TROUBLESHOOTING

### Problema: "Bot não responde"

**Solução**:
```bash
# Verificar se o bot está rodando
pm2 status

# Ver logs de erro
pm2 logs telegram-bot-doctor-auto --lines 50

# Reiniciar o bot
pm2 restart telegram-bot-doctor-auto
```

### Problema: "Erro de conexão com Supabase"

**Solução**:
1. Verifique se a `SUPABASE_SERVICE_ROLE_KEY` está correta
2. Teste a conexão: `npm test`
3. Verifique se o IP do servidor está permitido no Supabase

### Problema: "Acesso negado"

**Solução**:
1. Obtenha seu Telegram ID: [@userinfobot](https://t.me/userinfobot)
2. Adicione no `.env`: `ADMIN_USER_IDS=seu_id_aqui`
3. Reinicie o bot: `pm2 restart telegram-bot-doctor-auto`

### Problema: "ETELEGRAM: 409 Conflict"

**Solução**:
```bash
# Outro processo está rodando o mesmo bot
# Encontre e mate o processo anterior
ps aux | grep "node.*bot.js"
kill -9 [PID]

# Ou use PM2
pm2 delete telegram-bot-doctor-auto
pm2 start ecosystem.config.js
```

### Verificar Logs

```bash
# Ver logs em tempo real
pm2 logs telegram-bot-doctor-auto

# Ver últimas 100 linhas
pm2 logs telegram-bot-doctor-auto --lines 100

# Ver apenas erros
pm2 logs telegram-bot-doctor-auto --err
```

---

## 📊 MONITORAMENTO

### PM2 Monitoring

```bash
# Dashboard interativo
pm2 monit

# Status detalhado
pm2 show telegram-bot-doctor-auto

# Métricas
pm2 describe telegram-bot-doctor-auto
```

### Logs do Sistema

```bash
# Ver logs do sistema
tail -f /var/log/syslog | grep telegram

# Logs específicos do bot
tail -f ~/.pm2/logs/telegram-bot-doctor-auto-out.log
tail -f ~/.pm2/logs/telegram-bot-doctor-auto-error.log
```

---

## 🚀 PRÓXIMOS PASSOS

### Melhorias Planejadas

- [ ] Interface com botões inline (InlineKeyboard)
- [ ] Notificações push automáticas
- [ ] Agendamento de relatórios
- [ ] Integração com WhatsApp
- [ ] Dashboard web de administração
- [ ] Suporte a múltiplos idiomas
- [ ] Comandos de voz
- [ ] Envio de fotos/documentos

### Integração Completa com IAs

- [ ] Conectar com API das IAs existentes
- [ ] Implementar conversação contextual
- [ ] Histórico de conversas
- [ ] Aprendizado baseado em feedback

---

## 📞 SUPORTE

**Developer**: Thales Oliveira  
**Email**: toliveira1802@gmail.com  
**Sistema**: Doctor Auto Prime V1.1  
**Bot Version**: 1.0.0

---

## 📄 LICENÇA

© 2026 Doctor Auto Prime - Todos os direitos reservados.  
Este software é proprietário e confidencial.

---

**🎉 BOT PRONTO PARA USO!**

Para iniciar, execute:
```bash
npm start
```

Para deploy em produção:
```bash
pm2 start ecosystem.config.js
pm2 save
```

**📱 Comece a usar enviando /start para o bot no Telegram!**
