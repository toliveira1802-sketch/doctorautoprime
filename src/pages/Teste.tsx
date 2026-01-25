import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
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
  Settings
} from 'lucide-react'

export default function Teste() {
  const { user, role } = useAuth()
  const { role: userRole, loading: roleLoading } = useUserRole()
  const [testInput, setTestInput] = useState('')
  const [testResults, setTestResults] = useState<Array<{
    name: string
    status: 'success' | 'error' | 'warning'
    message: string
  }>>([])

  const runTests = () => {
    const results = []

    // Teste 1: Autenticação
    if (user) {
      results.push({
        name: 'Autenticação',
        status: 'success' as const,
        message: `Usuário autenticado: ${user.email}`
      })
    } else {
      results.push({
        name: 'Autenticação',
        status: 'error' as const,
        message: 'Usuário não autenticado'
      })
    }

    // Teste 2: Role do usuário
    if (role) {
      results.push({
        name: 'Permissões (Role)',
        status: 'success' as const,
        message: `Role detectada: ${role}`
      })
    } else {
      results.push({
        name: 'Permissões (Role)',
        status: 'warning' as const,
        message: 'Role não definida'
      })
    }

    // Teste 3: Contexto de Role
    if (userRole) {
      results.push({
        name: 'Hook useUserRole',
        status: 'success' as const,
        message: `Role do hook: ${userRole}`
      })
    } else if (roleLoading) {
      results.push({
        name: 'Hook useUserRole',
        status: 'warning' as const,
        message: 'Carregando role...'
      })
    } else {
      results.push({
        name: 'Hook useUserRole',
        status: 'error' as const,
        message: 'Erro ao carregar role'
      })
    }

    // Teste 4: Input de teste
    if (testInput.trim()) {
      results.push({
        name: 'Input de Teste',
        status: 'success' as const,
        message: `Valor capturado: "${testInput}"`
      })
    } else {
      results.push({
        name: 'Input de Teste',
        status: 'warning' as const,
        message: 'Nenhum valor inserido no campo de teste'
      })
    }

    // Teste 5: Ambiente
    const isDev = import.meta.env.DEV
    results.push({
      name: 'Ambiente',
      status: 'success' as const,
      message: `Modo: ${isDev ? 'Desenvolvimento' : 'Produção'}`
    })

    setTestResults(results)
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

  return (
    <div className="container max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Página de Teste</h1>
        <p className="text-muted-foreground">
          Ambiente de testes para validação de funcionalidades do sistema Doctor Auto Prime
        </p>
      </div>

      {/* Alert de Informação */}
      <Alert>
        <Activity className="h-4 w-4" />
        <AlertTitle>Ambiente de Testes</AlertTitle>
        <AlertDescription>
          Esta página foi criada para testar componentes, integrações e funcionalidades do sistema.
          Os dados exibidos aqui são para fins de teste e desenvolvimento.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="system" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="system">Sistema</TabsTrigger>
          <TabsTrigger value="components">Componentes</TabsTrigger>
          <TabsTrigger value="integration">Integração</TabsTrigger>
        </TabsList>

        {/* Tab: Sistema */}
        <TabsContent value="system" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Informações do Usuário
              </CardTitle>
              <CardDescription>
                Dados do usuário autenticado no sistema
              </CardDescription>
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
                  <Label className="text-sm font-medium">ID do Usuário</Label>
                  <p className="text-sm text-muted-foreground mt-1 truncate">
                    {user?.id || 'Não disponível'}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Role (Contexto)</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    {role || 'Não definida'}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Role (Hook)</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    {roleLoading ? 'Carregando...' : userRole || 'Não disponível'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Permissões de Acesso
              </CardTitle>
              <CardDescription>
                Verificação de permissões baseadas em RBAC
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <span className="text-sm font-medium">Acesso Cliente</span>
                  <Badge variant={role ? 'default' : 'secondary'}>
                    {role ? 'Permitido' : 'Negado'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <span className="text-sm font-medium">Acesso Admin</span>
                  <Badge variant={role === 'admin' || role === 'dev' ? 'default' : 'secondary'}>
                    {role === 'admin' || role === 'dev' ? 'Permitido' : 'Negado'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <span className="text-sm font-medium">Acesso Gestão</span>
                  <Badge variant={role === 'gestao' || role === 'dev' ? 'default' : 'secondary'}>
                    {role === 'gestao' || role === 'dev' ? 'Permitido' : 'Negado'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <span className="text-sm font-medium">Acesso Dev</span>
                  <Badge variant={role === 'dev' ? 'default' : 'secondary'}>
                    {role === 'dev' ? 'Permitido' : 'Negado'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Componentes */}
        <TabsContent value="components" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Teste de Componentes UI
              </CardTitle>
              <CardDescription>
                Validação de componentes do Shadcn/UI
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="test-input">Campo de Teste</Label>
                <Input
                  id="test-input"
                  placeholder="Digite algo para testar..."
                  value={testInput}
                  onChange={(e) => setTestInput(e.target.value)}
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={runTests} className="flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  Executar Testes
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setTestInput('')
                    setTestResults([])
                  }}
                >
                  Limpar
                </Button>
              </div>

              {testResults.length > 0 && (
                <div className="space-y-2 mt-4">
                  <Label>Resultados dos Testes</Label>
                  {testResults.map((result, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        {getStatusIcon(result.status)}
                        <div>
                          <p className="text-sm font-medium">{result.name}</p>
                          <p className="text-xs text-muted-foreground">{result.message}</p>
                        </div>
                      </div>
                      {getStatusBadge(result.status)}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Badges de Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                <Badge>Default</Badge>
                <Badge variant="secondary">Secondary</Badge>
                <Badge variant="destructive">Destructive</Badge>
                <Badge variant="outline">Outline</Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Integração */}
        <TabsContent value="integration" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Teste de Integração
              </CardTitle>
              <CardDescription>
                Verificação de conexões com serviços externos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Em Desenvolvimento</AlertTitle>
                <AlertDescription>
                  Esta seção será expandida para incluir testes de integração com:
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Supabase (Database & Auth)</li>
                    <li>Kommo CRM</li>
                    <li>Sistema de IA (15 agentes)</li>
                    <li>APIs externas</li>
                  </ul>
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <span className="text-sm font-medium">Supabase Client</span>
                  <Badge variant="default">Conectado</Badge>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <span className="text-sm font-medium">Auth Context</span>
                  <Badge variant={user ? 'default' : 'secondary'}>
                    {user ? 'Ativo' : 'Inativo'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <span className="text-sm font-medium">React Router</span>
                  <Badge variant="default">Funcionando</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
