# 🔑 Como Obter a Service Role Key do Supabase

## ⚠️ Importante

Para executar a migração do Trello, você precisa da **Service Role Key** do Supabase, que tem permissões administrativas para inserir dados sem restrições de RLS (Row Level Security).

## 📋 Passos para Obter a Chave

### 1. Acesse o Dashboard do Supabase
- Vá para: https://supabase.com/dashboard
- Faça login na sua conta

### 2. Selecione o Projeto
- Clique no projeto: **acuufrgoyjwzlyhopaus**

### 3. Navegue até Settings
- No menu lateral esquerdo, clique em **Settings** (⚙️)
- Depois clique em **API**

### 4. Copie a Service Role Key
- Na seção **Project API keys**, você verá:
  - `anon` `public` - Chave pública (já temos)
  - `service_role` `secret` - **ESTA É A QUE PRECISAMOS**
  
- Clique em **Reveal** ao lado de `service_role`
- Copie a chave completa

### 5. Configure no Projeto

Adicione a chave no arquivo `.env`:

```bash
# Adicione esta linha no arquivo .env
SUPABASE_SERVICE_ROLE_KEY="sua-service-role-key-aqui"
```

**OU** exporte como variável de ambiente antes de executar:

```bash
# Windows PowerShell
$env:SUPABASE_SERVICE_ROLE_KEY="sua-service-role-key-aqui"

# Windows CMD
set SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key-aqui
```

## 🔒 Segurança

⚠️ **NUNCA compartilhe a Service Role Key publicamente!**

- Esta chave tem acesso total ao banco de dados
- Pode ler, inserir, atualizar e deletar qualquer dado
- Ignora todas as políticas de RLS
- Use apenas em scripts administrativos

## ✅ Próximos Passos

Após configurar a Service Role Key:

1. Execute novamente o teste:
   ```bash
   npx tsx scripts/test-connections.ts
   ```

2. Se todos os testes passarem, execute a migração:
   ```bash
   npx tsx scripts/migrate-trello.ts
   ```

## 🐛 Troubleshooting

### Erro 401 - Invalid API Key
- Verifique se copiou a chave completa
- Certifique-se de que é a `service_role` e não a `anon`
- Verifique se não há espaços extras no início/fim

### Erro 403 - Forbidden
- A chave está correta, mas pode haver políticas RLS bloqueando
- Use a Service Role Key que ignora RLS

### Chave não aparece
- Você precisa ser Owner ou Admin do projeto
- Peça acesso ao administrador do projeto
