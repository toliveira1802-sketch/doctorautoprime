# 🚀 GUIA DE DEPLOY - VERCEL

## ✅ Pré-requisitos Concluídos:
- [x] Build local testado e funcionando
- [x] Arquivo `vercel.json` criado
- [x] `.gitignore` atualizado
- [x] Supabase já está na cloud

---

## 📝 PASSO A PASSO PARA DEPLOY:

### 1️⃣ **Instalar Vercel CLI** (se ainda não tiver)
```bash
npm install -g vercel
```

### 2️⃣ **Fazer Login na Vercel**
```bash
vercel login
```
- Escolha o método de login (GitHub, GitLab, Bitbucket ou Email)
- Siga as instruções no navegador

### 3️⃣ **Deploy do Projeto**
```bash
npx vercel
```

**Durante o processo, responda:**
- `Set up and deploy "~/doctorautoprime"?` → **Y**
- `Which scope do you want to deploy to?` → Escolha sua conta
- `Link to existing project?` → **N** (primeira vez)
- `What's your project's name?` → **doctorautoprime** (ou o nome que preferir)
- `In which directory is your code located?` → **./** (Enter)
- `Want to override the settings?` → **N** (já temos vercel.json)

### 4️⃣ **Configurar Variáveis de Ambiente**

Após o deploy inicial, você precisa adicionar as variáveis de ambiente:

**Opção A: Via Dashboard (Recomendado)**
1. Acesse: https://vercel.com/dashboard
2. Clique no seu projeto
3. Vá em **Settings** → **Environment Variables**
4. Adicione:
   - `VITE_SUPABASE_URL` = `https://acuufrgoyjwzlyhopaus.supabase.co`
   - `VITE_SUPABASE_PUBLISHABLE_KEY` = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - `VITE_SUPABASE_PROJECT_ID` = `acuufrgoyjwzlyhopaus`

**Opção B: Via CLI**
```bash
vercel env add VITE_SUPABASE_URL
# Cole o valor quando solicitado: https://acuufrgoyjwzlyhopaus.supabase.co

vercel env add VITE_SUPABASE_PUBLISHABLE_KEY
# Cole a chave quando solicitado

vercel env add VITE_SUPABASE_PROJECT_ID
# Cole o ID quando solicitado: acuufrgoyjwzlyhopaus
```

### 5️⃣ **Fazer Deploy de Produção**
```bash
vercel --prod
```

---

## 🌐 URLs Geradas:

Após o deploy, você terá:
- **Preview URL:** `https://doctorautoprime-xxx.vercel.app` (para testes)
- **Production URL:** `https://doctorautoprime.vercel.app` (oficial)

---

## 🔧 Configurações Adicionais:

### **Domínio Personalizado** (Opcional)
Se você tiver um domínio próprio (ex: `doctorautoprime.com.br`):

1. Vá em **Settings** → **Domains**
2. Clique em **Add Domain**
3. Digite seu domínio
4. Siga as instruções para configurar DNS

### **Configurar Supabase para Produção**

No painel do Supabase (https://supabase.com/dashboard):

1. Vá em **Authentication** → **URL Configuration**
2. Adicione a URL da Vercel em **Site URL**:
   - `https://doctorautoprime.vercel.app`
3. Adicione em **Redirect URLs**:
   - `https://doctorautoprime.vercel.app/**`

---

## 🔄 Deploy Automático (Opcional)

Para deploys automáticos a cada commit:

### **Conectar com GitHub:**
1. Crie um repositório no GitHub
2. Faça push do código:
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/doctorautoprime.git
git push -u origin main
```
3. No dashboard da Vercel, conecte o repositório
4. A partir de agora, cada push fará deploy automático!

---

## ✅ Checklist Pós-Deploy:

- [ ] Acessar a URL de produção
- [ ] Testar login com Google
- [ ] Testar criação de OS
- [ ] Testar link de orçamento para cliente
- [ ] Verificar se todas as páginas carregam
- [ ] Testar em mobile
- [ ] Configurar domínio personalizado (se aplicável)

---

## 🆘 Troubleshooting:

### **Erro: "Environment variables not found"**
- Certifique-se de adicionar as variáveis no dashboard da Vercel
- Faça um novo deploy após adicionar: `vercel --prod`

### **Erro: "404 on page refresh"**
- Verifique se o `vercel.json` está configurado corretamente
- O arquivo já está criado, mas se der erro, verifique o conteúdo

### **Erro de autenticação Supabase**
- Verifique se as URLs estão configuradas no Supabase
- Certifique-se de que as variáveis de ambiente estão corretas

---

## 📊 Monitoramento:

Após o deploy, você pode monitorar:
- **Analytics:** https://vercel.com/dashboard/analytics
- **Logs:** https://vercel.com/dashboard/deployments
- **Performance:** Vercel Speed Insights (ativar nas configurações)

---

## 🎯 Próximos Passos:

1. ✅ Deploy básico funcionando
2. 🔄 Configurar deploy automático via GitHub
3. 🌐 Configurar domínio personalizado
4. 📊 Ativar analytics da Vercel
5. 🔒 Configurar SSL (automático na Vercel)
6. 📱 Testar PWA em mobile

---

**Pronto para começar? Execute:**
```bash
npx vercel
```

**Boa sorte! 🚀**
