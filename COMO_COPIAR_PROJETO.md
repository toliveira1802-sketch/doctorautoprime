# 📦 Como Copiar o Projeto para Outro Lugar

## 🎯 Método 1: Copiar Manualmente (Mais Simples)

### **Passo 1: Copiar a Pasta**
1. Abra o Windows Explorer
2. Vá para: `C:\Users\docto\OneDrive\Área de Trabalho`
3. Clique com botão direito na pasta `doctorautoprime`
4. Escolha "Copiar"
5. Vá para onde quer colar (ex: `C:\Users\docto\Desktop`)
6. Clique com botão direito → "Colar"
7. Renomeie para `doctorautoprime-backup` (ou outro nome)

### **Passo 2: Instalar Dependências**
1. Abra o PowerShell ou CMD
2. Entre na pasta copiada:
   ```bash
   cd C:\Users\docto\Desktop\doctorautoprime-backup
   ```
3. Instale as dependências:
   ```bash
   npm install
   ```

### **Passo 3: Rodar o Projeto**
```bash
npm run dev
```

Pronto! Acesse: http://localhost:8080

---

## 🎯 Método 2: Usando Git (Se tiver repositório)

### **Passo 1: Verificar se tem repositório remoto**
```bash
cd C:\Users\docto\OneDrive\Área de Trabalho\doctorautoprime
git remote -v
```

Se aparecer uma URL, você tem repositório remoto!

### **Passo 2: Clonar em outro lugar**
```bash
# Ir para onde quer clonar
cd C:\Users\docto\Desktop

# Clonar (substitua [URL] pela URL que apareceu acima)
git clone [URL] doctorautoprime-copia

# Entrar na pasta
cd doctorautoprime-copia

# Instalar dependências
npm install

# Copiar .env do projeto original
copy ..\OneDrive\Área de Trabalho\doctorautoprime\.env .env

# Rodar
npm run dev
```

---

## 🎯 Método 3: Criar Pacote ZIP

### **Passo 1: Criar ZIP**
1. Vá para: `C:\Users\docto\OneDrive\Área de Trabalho`
2. Clique com botão direito na pasta `doctorautoprime`
3. Escolha "Enviar para" → "Pasta compactada"
4. Será criado `doctorautoprime.zip`

### **Passo 2: Extrair em Outro Lugar**
1. Copie o `doctorautoprime.zip` para onde quiser
2. Clique com botão direito → "Extrair tudo"
3. Escolha a pasta de destino
4. Clique em "Extrair"

### **Passo 3: Instalar e Rodar**
```bash
cd [pasta_onde_extraiu]\doctorautoprime
npm install
npm run dev
```

---

## ⚠️ IMPORTANTE: Não Esquecer do .env

O arquivo `.env` contém as configurações do Supabase.

**Sempre copie o `.env` junto!**

```bash
# Se estiver faltando, copie manualmente:
copy C:\Users\docto\OneDrive\Área de Trabalho\doctorautoprime\.env [pasta_destino]\.env
```

---

## 🧪 Testar se Funcionou

Depois de copiar e rodar, teste:

1. ✅ Acesse: http://localhost:8080
2. ✅ Faça login
3. ✅ Navegue pelas páginas
4. ✅ Veja se os dados aparecem

Se tudo funcionar, está pronto! 🎉

---

## 🆘 Problemas Comuns

### **Erro: "npm não reconhecido"**
- Instale o Node.js: https://nodejs.org

### **Erro: "Cannot find module"**
- Execute: `npm install`

### **Erro: "Port 8080 already in use"**
- Feche o outro projeto que está rodando
- Ou mude a porta em `vite.config.ts`

### **Página em branco / Erro de login**
- Verifique se o `.env` foi copiado
- Verifique se as variáveis estão corretas

---

## 📞 Precisa de Ajuda?

Me chame que eu te ajudo! 🚀
