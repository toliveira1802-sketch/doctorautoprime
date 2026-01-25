import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { useAuth } from '@/contexts/AuthContext'
import { useUserRole } from '@/hooks/useUserRole'
import { 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Database, 
  User, 
  Shield,
  Zap,
  Activity,
  Settings,
  FileText,
  Mail,
  Phone,
  Calendar,
  DollarSign,
  Hash
} from 'lucide-react'

// Tipos de validação
type ValidationResult = {
  field: string
  status: 'success' | 'error' | 'warning'
  message: string
}

type FormData = {
  nome: string
  email: string
  telefone: string
  cpf: string
  data: string
  valor: string
  senha: string
  confirmarSenha: string
  categoria: string
  termos: boolean
}

export default function TesteExpandido() {
  const { user, role } = useAuth()
  const { role: userRole, isLoading: roleLoading } = useUserRole()
  
  // Estados do formulário
  const [formData, setFormData] = useState<FormData>({
    nome: '',
    email: '',
    telefone: '',
    cpf: '',
    data: '',
    valor: '',
    senha: '',
    confirmarSenha: '',
    categoria: '',
    termos: false
  })

  const [validationResults, setValidationResults] = useState<ValidationResult[]>([])
  const [isValidating, setIsValidating] = useState(false)

  // Funções de validação
  const validateEmail = (email: string): ValidationResult => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    
    if (!email) {
      return {
        field: 'Email',
        status: 'error',
        message: 'Email é obrigatório'
      }
    }
    
    if (!emailRegex.test(email)) {
      return {
        field: 'Email',
        status: 'error',
        message: 'Formato de email inválido'
      }
    }
    
    return {
      field: 'Email',
      status: 'success',
      message: `Email válido: ${email}`
    }
  }

  const validatePhone = (phone: string): ValidationResult => {
    const phoneRegex = /^\(?[1-9]{2}\)? ?(?:[2-8]|9[1-9])[0-9]{3}\-?[0-9]{4}$/
    const cleanPhone = phone.replace(/\D/g, '')
    
    if (!phone) {
      return {
        field: 'Telefone',
        status: 'error',
        message: 'Telefone é obrigatório'
      }
    }
    
    if (cleanPhone.length < 10 || cleanPhone.length > 11) {
      return {
        field: 'Telefone',
        status: 'error',
        message: 'Telefone deve ter 10 ou 11 dígitos'
      }
    }
    
    if (!phoneRegex.test(phone)) {
      return {
        field: 'Telefone',
        status: 'warning',
        message: 'Formato recomendado: (11) 98765-4321'
      }
    }
    
    return {
      field: 'Telefone',
      status: 'success',
      message: `Telefone válido: ${phone}`
    }
  }

  const validateCPF = (cpf: string): ValidationResult => {
    const cleanCPF = cpf.replace(/\D/g, '')
    
    if (!cpf) {
      return {
        field: 'CPF',
        status: 'error',
        message: 'CPF é obrigatório'
      }
    }
    
    if (cleanCPF.length !== 11) {
      return {
        field: 'CPF',
        status: 'error',
        message: 'CPF deve ter 11 dígitos'
      }
    }
    
    // Validação de CPF (algoritmo simplificado)
    if (/^(\d)\1{10}$/.test(cleanCPF)) {
      return {
        field: 'CPF',
        status: 'error',
        message: 'CPF inválido (dígitos repetidos)'
      }
    }
    
    return {
      field: 'CPF',
      status: 'success',
      message: `CPF válido: ${cpf}`
    }
  }

  const validateName = (name: string): ValidationResult => {
    if (!name) {
      return {
        field: 'Nome',
        status: 'error',
        message: 'Nome é obrigatório'
      }
    }
    
    if (name.length < 3) {
      return {
        field: 'Nome',
        status: 'error',
        message: 'Nome deve ter pelo menos 3 caracteres'
      }
    }
    
    if (!/^[a-zA-ZÀ-ÿ\s]+$/.test(name)) {
      return {
        field: 'Nome',
        status: 'error',
        message: 'Nome deve conter apenas letras'
      }
    }
    
    if (name.trim().split(' ').length < 2) {
      return {
        field: 'Nome',
        status: 'warning',
        message: 'Recomendado informar nome completo'
      }
    }
    
    return {
      field: 'Nome',
      status: 'success',
      message: `Nome válido: ${name}`
    }
  }

  const validateDate = (date: string): ValidationResult => {
    if (!date) {
      return {
        field: 'Data',
        status: 'error',
        message: 'Data é obrigatória'
      }
    }
    
    const selectedDate = new Date(date)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    if (selectedDate < today) {
      return {
        field: 'Data',
        status: 'error',
        message: 'Data não pode ser no passado'
      }
    }
    
    const maxDate = new Date()
    maxDate.setFullYear(maxDate.getFullYear() + 1)
    
    if (selectedDate > maxDate) {
      return {
        field: 'Data',
        status: 'warning',
        message: 'Data muito distante (mais de 1 ano)'
      }
    }
    
    return {
      field: 'Data',
      status: 'success',
      message: `Data válida: ${new Date(date).toLocaleDateString('pt-BR')}`
    }
  }

  const validateValue = (value: string): ValidationResult => {
    if (!value) {
      return {
        field: 'Valor',
        status: 'error',
        message: 'Valor é obrigatório'
      }
    }
    
    const numValue = parseFloat(value.replace(',', '.'))
    
    if (isNaN(numValue)) {
      return {
        field: 'Valor',
        status: 'error',
        message: 'Valor deve ser numérico'
      }
    }
    
    if (numValue <= 0) {
      return {
        field: 'Valor',
        status: 'error',
        message: 'Valor deve ser maior que zero'
      }
    }
    
    if (numValue > 100000) {
      return {
        field: 'Valor',
        status: 'warning',
        message: `Valor muito alto: R$ ${numValue.toFixed(2)}`
      }
    }
    
    return {
      field: 'Valor',
      status: 'success',
      message: `Valor válido: R$ ${numValue.toFixed(2)}`
    }
  }

  const validatePassword = (password: string, confirmPassword: string): ValidationResult[] => {
    const results: ValidationResult[] = []
    
    if (!password) {
      results.push({
        field: 'Senha',
        status: 'error',
        message: 'Senha é obrigatória'
      })
      return results
    }
    
    if (password.length < 8) {
      results.push({
        field: 'Senha',
        status: 'error',
        message: 'Senha deve ter pelo menos 8 caracteres'
      })
    }
    
    if (!/[A-Z]/.test(password)) {
      results.push({
        field: 'Senha',
        status: 'warning',
        message: 'Senha deve conter letra maiúscula'
      })
    }
    
    if (!/[a-z]/.test(password)) {
      results.push({
        field: 'Senha',
        status: 'warning',
        message: 'Senha deve conter letra minúscula'
      })
    }
    
    if (!/[0-9]/.test(password)) {
      results.push({
        field: 'Senha',
        status: 'warning',
        message: 'Senha deve conter número'
      })
    }
    
    if (!/[!@#$%^&*]/.test(password)) {
      results.push({
        field: 'Senha',
        status: 'warning',
        message: 'Senha deve conter caractere especial (!@#$%^&*)'
      })
    }
    
    if (password !== confirmPassword) {
      results.push({
        field: 'Confirmar Senha',
        status: 'error',
        message: 'As senhas não coincidem'
      })
    }
    
    if (results.length === 0) {
      results.push({
        field: 'Senha',
        status: 'success',
        message: 'Senha forte e válida'
      })
    }
    
    return results
  }

  const validateCategory = (category: string): ValidationResult => {
    if (!category) {
      return {
        field: 'Categoria',
        status: 'error',
        message: 'Categoria é obrigatória'
      }
    }
    
    return {
      field: 'Categoria',
      status: 'success',
      message: `Categoria selecionada: ${category}`
    }
  }

  const validateTerms = (terms: boolean): ValidationResult => {
    if (!terms) {
      return {
        field: 'Termos',
        status: 'error',
        message: 'Você deve aceitar os termos de uso'
      }
    }
    
    return {
      field: 'Termos',
      status: 'success',
      message: 'Termos aceitos'
    }
  }

  // Executar todas as validações
  const runValidations = () => {
    setIsValidating(true)
    
    setTimeout(() => {
      const results: ValidationResult[] = []
      
      // Validar todos os campos
      results.push(validateName(formData.nome))
      results.push(validateEmail(formData.email))
      results.push(validatePhone(formData.telefone))
      results.push(validateCPF(formData.cpf))
      results.push(validateDate(formData.data))
      results.push(validateValue(formData.valor))
      results.push(...validatePassword(formData.senha, formData.confirmarSenha))
      results.push(validateCategory(formData.categoria))
      results.push(validateTerms(formData.termos))
      
      setValidationResults(results)
      setIsValidating(false)
    }, 500)
  }

  // Limpar formulário
  const clearForm = () => {
    setFormData({
      nome: '',
      email: '',
      telefone: '',
      cpf: '',
      data: '',
      valor: '',
      senha: '',
      confirmarSenha: '',
      categoria: '',
      termos: false
    })
    setValidationResults([])
  }

  // Preencher com dados de teste
  const fillTestData = () => {
    setFormData({
      nome: 'João Silva Santos',
      email: 'joao.silva@example.com',
      telefone: '(11) 98765-4321',
      cpf: '123.456.789-00',
      data: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      valor: '1500.00',
      senha: 'Senha@123',
      confirmarSenha: 'Senha@123',
      categoria: 'mecanica',
      termos: true
    })
  }

  const getStatusIcon = (status: 'success' | 'error' | 'warning') => {
    switch (status) {
      case 'success':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />
    }
  }

  const getStatusBadge = (status: 'success' | 'error' | 'warning') => {
    const variants = {
      success: 'default',
      error: 'destructive',
      warning: 'secondary'
    }
    return (
      <Badge variant={variants[status] as any}>
        {status === 'success' ? 'OK' : status === 'error' ? 'ERRO' : 'AVISO'}
      </Badge>
    )
  }

  // Estatísticas de validação
  const stats = {
    total: validationResults.length,
    success: validationResults.filter(r => r.status === 'success').length,
    error: validationResults.filter(r => r.status === 'error').length,
    warning: validationResults.filter(r => r.status === 'warning').length
  }

  return (
    <div className="container max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Página de Teste - Validação de Formulários</h1>
        <p className="text-muted-foreground">
          Ambiente de testes para validação de formulários e estados de erro
        </p>
      </div>

      {/* Alert de Informação */}
      <Alert>
        <Activity className="h-4 w-4" />
        <AlertTitle>Script de Teste Detalhado</AlertTitle>
        <AlertDescription>
          Esta página implementa validações completas de formulário com casos de uso reais.
          Teste diferentes cenários de entrada e veja os resultados em tempo real.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="form" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="form">Formulário</TabsTrigger>
          <TabsTrigger value="results">Resultados</TabsTrigger>
          <TabsTrigger value="system">Sistema</TabsTrigger>
          <TabsTrigger value="docs">Documentação</TabsTrigger>
        </TabsList>

        {/* Tab: Formulário */}
        <TabsContent value="form" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Formulário de Teste
              </CardTitle>
              <CardDescription>
                Preencha os campos abaixo para testar as validações
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Nome */}
                <div className="space-y-2">
                  <Label htmlFor="nome" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Nome Completo *
                  </Label>
                  <Input
                    id="nome"
                    placeholder="João Silva Santos"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  />
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="joao@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>

                {/* Telefone */}
                <div className="space-y-2">
                  <Label htmlFor="telefone" className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Telefone *
                  </Label>
                  <Input
                    id="telefone"
                    placeholder="(11) 98765-4321"
                    value={formData.telefone}
                    onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                  />
                </div>

                {/* CPF */}
                <div className="space-y-2">
                  <Label htmlFor="cpf" className="flex items-center gap-2">
                    <Hash className="h-4 w-4" />
                    CPF *
                  </Label>
                  <Input
                    id="cpf"
                    placeholder="123.456.789-00"
                    value={formData.cpf}
                    onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                  />
                </div>

                {/* Data */}
                <div className="space-y-2">
                  <Label htmlFor="data" className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Data do Agendamento *
                  </Label>
                  <Input
                    id="data"
                    type="date"
                    value={formData.data}
                    onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                  />
                </div>

                {/* Valor */}
                <div className="space-y-2">
                  <Label htmlFor="valor" className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Valor Estimado (R$) *
                  </Label>
                  <Input
                    id="valor"
                    placeholder="1500.00"
                    value={formData.valor}
                    onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
                  />
                </div>

                {/* Senha */}
                <div className="space-y-2">
                  <Label htmlFor="senha">Senha *</Label>
                  <Input
                    id="senha"
                    type="password"
                    placeholder="Mínimo 8 caracteres"
                    value={formData.senha}
                    onChange={(e) => setFormData({ ...formData, senha: e.target.value })}
                  />
                </div>

                {/* Confirmar Senha */}
                <div className="space-y-2">
                  <Label htmlFor="confirmarSenha">Confirmar Senha *</Label>
                  <Input
                    id="confirmarSenha"
                    type="password"
                    placeholder="Repita a senha"
                    value={formData.confirmarSenha}
                    onChange={(e) => setFormData({ ...formData, confirmarSenha: e.target.value })}
                  />
                </div>
              </div>

              {/* Categoria */}
              <div className="space-y-2">
                <Label htmlFor="categoria">Categoria do Serviço *</Label>
                <Select value={formData.categoria} onValueChange={(value) => setFormData({ ...formData, categoria: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mecanica">Mecânica Geral</SelectItem>
                    <SelectItem value="eletrica">Elétrica</SelectItem>
                    <SelectItem value="funilaria">Funilaria e Pintura</SelectItem>
                    <SelectItem value="revisao">Revisão Periódica</SelectItem>
                    <SelectItem value="diagnostico">Diagnóstico</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Termos */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="termos"
                  checked={formData.termos}
                  onCheckedChange={(checked) => setFormData({ ...formData, termos: checked as boolean })}
                />
                <Label htmlFor="termos" className="text-sm cursor-pointer">
                  Aceito os termos de uso e política de privacidade *
                </Label>
              </div>

              {/* Botões de Ação */}
              <div className="flex flex-wrap gap-2 pt-4">
                <Button onClick={runValidations} disabled={isValidating} className="flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  {isValidating ? 'Validando...' : 'Executar Validações'}
                </Button>
                <Button variant="outline" onClick={fillTestData}>
                  Preencher Dados de Teste
                </Button>
                <Button variant="outline" onClick={clearForm}>
                  Limpar Formulário
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Resultados */}
        <TabsContent value="results" className="space-y-4">
          {validationResults.length > 0 && (
            <>
              {/* Estatísticas */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">Total de Testes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.total}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-green-600">Sucessos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">{stats.success}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-red-600">Erros</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-red-600">{stats.error}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-yellow-600">Avisos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-yellow-600">{stats.warning}</div>
                  </CardContent>
                </Card>
              </div>

              {/* Resultados Detalhados */}
              <Card>
                <CardHeader>
                  <CardTitle>Resultados das Validações</CardTitle>
                  <CardDescription>
                    Detalhamento de cada validação executada
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {validationResults.map((result, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        {getStatusIcon(result.status)}
                        <div>
                          <p className="text-sm font-medium">{result.field}</p>
                          <p className="text-xs text-muted-foreground">{result.message}</p>
                        </div>
                      </div>
                      {getStatusBadge(result.status)}
                    </div>
                  ))}
                </CardContent>
              </Card>
            </>
          )}

          {validationResults.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhuma validação executada ainda.</p>
                <p className="text-sm">Preencha o formulário e clique em "Executar Validações".</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Tab: Sistema */}
        <TabsContent value="system" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Informações do Usuário
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Email</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    {user?.email || 'Não disponível'}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Role</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    {role || 'Não definida'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Documentação */}
        <TabsContent value="docs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Documentação dos Testes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h3 className="font-semibold">Validações Implementadas:</h3>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  <li><strong>Nome:</strong> Mínimo 3 caracteres, apenas letras, recomendado nome completo</li>
                  <li><strong>Email:</strong> Formato válido (usuario@dominio.com)</li>
                  <li><strong>Telefone:</strong> 10-11 dígitos, formato brasileiro</li>
                  <li><strong>CPF:</strong> 11 dígitos, sem repetições</li>
                  <li><strong>Data:</strong> Não pode ser passado, máximo 1 ano futuro</li>
                  <li><strong>Valor:</strong> Numérico, maior que zero, alerta se &gt; R$ 100.000</li>
                  <li><strong>Senha:</strong> Mínimo 8 caracteres, maiúscula, minúscula, número, especial</li>
                  <li><strong>Confirmar Senha:</strong> Deve coincidir com a senha</li>
                  <li><strong>Categoria:</strong> Seleção obrigatória</li>
                  <li><strong>Termos:</strong> Aceitação obrigatória</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
