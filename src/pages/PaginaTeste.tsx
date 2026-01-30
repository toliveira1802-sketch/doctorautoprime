import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import { 
  Rocket, 
  Zap, 
  Code, 
  Heart, 
  Star,
  Sparkles,
  CheckCircle2,
  XCircle,
  AlertCircle
} from 'lucide-react'

export default function PaginaTeste() {
  const [contador, setContador] = useState(0)
  const [nome, setNome] = useState('')

  const handleToast = (tipo: 'success' | 'error' | 'info') => {
    switch (tipo) {
      case 'success':
        toast.success('Sucesso! 🎉', {
          description: 'Operação concluída com êxito!',
        })
        break
      case 'error':
        toast.error('Erro! 😱', {
          description: 'Algo deu errado...',
        })
        break
      case 'info':
        toast.info('Informação! 💡', {
          description: 'Isso é uma notificação informativa.',
        })
        break
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2">
            <Rocket className="h-12 w-12 text-purple-600 animate-bounce" />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Página de Teste
            </h1>
            <Sparkles className="h-12 w-12 text-pink-600 animate-pulse" />
          </div>
          <p className="text-xl text-muted-foreground">
            Explorando componentes do Shadcn/UI 🚀
          </p>
          <div className="flex gap-2 justify-center flex-wrap">
            <Badge variant="default" className="text-sm">React 19</Badge>
            <Badge variant="secondary" className="text-sm">TypeScript</Badge>
            <Badge variant="outline" className="text-sm">Tailwind CSS</Badge>
            <Badge variant="default" className="text-sm bg-purple-600">Shadcn/UI</Badge>
          </div>
        </div>

        {/* Tabs Section */}
        <Tabs defaultValue="componentes" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="componentes">
              <Code className="mr-2 h-4 w-4" />
              Componentes
            </TabsTrigger>
            <TabsTrigger value="interacao">
              <Zap className="mr-2 h-4 w-4" />
              Interação
            </TabsTrigger>
            <TabsTrigger value="info">
              <Heart className="mr-2 h-4 w-4" />
              Info
            </TabsTrigger>
          </TabsList>

          {/* Tab: Componentes */}
          <TabsContent value="componentes" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    Card Success
                  </CardTitle>
                  <CardDescription>Este é um card de sucesso</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Componente Card com ícone de sucesso e hover effect.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button size="sm" className="w-full" variant="default">
                    Confirmar
                  </Button>
                </CardFooter>
              </Card>

              <Card className="hover:shadow-lg transition-shadow border-red-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <XCircle className="h-5 w-5 text-red-600" />
                    Card Error
                  </CardTitle>
                  <CardDescription>Este é um card de erro</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Card com borda vermelha para alertas de erro.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button size="sm" className="w-full" variant="destructive">
                    Cancelar
                  </Button>
                </CardFooter>
              </Card>

              <Card className="hover:shadow-lg transition-shadow border-yellow-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-yellow-600" />
                    Card Warning
                  </CardTitle>
                  <CardDescription>Este é um card de aviso</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Card com borda amarela para avisos importantes.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button size="sm" className="w-full" variant="outline">
                    Entendi
                  </Button>
                </CardFooter>
              </Card>

            </div>
          </TabsContent>

          {/* Tab: Interação */}
          <TabsContent value="interacao" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              
              {/* Contador */}
              <Card>
                <CardHeader>
                  <CardTitle>Contador Interativo</CardTitle>
                  <CardDescription>Teste de estado com useState</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <p className="text-6xl font-bold text-purple-600">{contador}</p>
                    <p className="text-sm text-muted-foreground mt-2">Cliques registrados</p>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => setContador(contador + 1)} 
                      className="flex-1"
                      size="lg"
                    >
                      Incrementar
                    </Button>
                    <Button 
                      onClick={() => setContador(contador - 1)} 
                      className="flex-1"
                      variant="outline"
                      size="lg"
                    >
                      Decrementar
                    </Button>
                  </div>
                  <Button 
                    onClick={() => setContador(0)} 
                    className="w-full"
                    variant="secondary"
                  >
                    Resetar
                  </Button>
                </CardContent>
              </Card>

              {/* Formulário */}
              <Card>
                <CardHeader>
                  <CardTitle>Formulário de Teste</CardTitle>
                  <CardDescription>Input com feedback visual</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="nome">Seu Nome</Label>
                    <Input
                      id="nome"
                      placeholder="Digite seu nome..."
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                    />
                  </div>
                  {nome && (
                    <div className="p-4 bg-purple-50 dark:bg-purple-950 rounded-lg">
                      <p className="text-sm font-medium">Olá, {nome}! 👋</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Seu nome tem {nome.length} caracteres
                      </p>
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label>Notificações Toast</Label>
                    <div className="grid grid-cols-3 gap-2">
                      <Button
                        onClick={() => handleToast('success')}
                        size="sm"
                        variant="default"
                      >
                        Sucesso
                      </Button>
                      <Button
                        onClick={() => handleToast('error')}
                        size="sm"
                        variant="destructive"
                      >
                        Erro
                      </Button>
                      <Button
                        onClick={() => handleToast('info')}
                        size="sm"
                        variant="outline"
                      >
                        Info
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

            </div>
          </TabsContent>

          {/* Tab: Info */}
          <TabsContent value="info" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-6 w-6 text-yellow-500 fill-yellow-500" />
                  Sobre esta Página
                </CardTitle>
                <CardDescription>Informações técnicas</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h3 className="font-semibold">🎨 Tecnologias Utilizadas:</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                    <li>React 19 com TypeScript</li>
                    <li>Vite para build otimizado</li>
                    <li>Tailwind CSS para estilização</li>
                    <li>Shadcn/UI para componentes</li>
                    <li>Lucide React para ícones</li>
                    <li>Sonner para notificações toast</li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold">🚀 Funcionalidades Demonstradas:</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                    <li>Componentes Card com variações</li>
                    <li>Sistema de Tabs responsivo</li>
                    <li>Gerenciamento de estado com useState</li>
                    <li>Formulários controlados</li>
                    <li>Notificações toast interativas</li>
                    <li>Badges e ícones animados</li>
                    <li>Gradientes e efeitos visuais</li>
                  </ul>
                </div>

                <div className="p-4 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-950 dark:to-pink-950 rounded-lg">
                  <p className="text-sm font-medium text-center">
                    💜 Feito com amor e React! 💜
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

        </Tabs>

        {/* Footer */}
        <Card className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0">
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <p className="text-lg font-semibold">
                🎉 Página de Teste - Doctor Auto Prime
              </p>
              <p className="text-sm opacity-90">
                Explore os componentes e interaja com a interface!
              </p>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  )
}
