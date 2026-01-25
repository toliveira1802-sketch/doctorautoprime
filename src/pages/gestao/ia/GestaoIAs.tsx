import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  Bot, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Zap,
  Settings,
  Play,
  Pause,
  Eye,
  Lock
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'

// Dados de exemplo das IAs
const IAS_EXEMPLO = [
  {
    id: 'qualificador',
    nome: 'Qualificador de Leads',
    emoji: '🎯',
    funcao: 'Classifica leads em A/B/C automaticamente',
    tipo: 'pura' as const,
    modelo: 'gpt-4',
    ativa: true,
    status: 'online' as const,
    gastos: {
      hoje: 3.45,
      semana: 18.90,
      mes: 98.00,
      total: 294.00
    },
    uso: {
      tokens: 45000,
      tokensInput: 28000,
      tokensOutput: 17000,
      requests: 156,
      mediaTokens: 288
    },
    performance: 92,
    prioridade: 'maxima' as const
  },
  {
    id: 'anna-laura',
    nome: 'Anna Laura',
    emoji: '💰',
    funcao: 'Especialista em vendas consultivas',
    tipo: 'hibrida' as const,
    modelo: 'gpt-3.5',
    ativa: true,
    status: 'online' as const,
    gastos: {
      hoje: 0.95,
      semana: 5.20,
      mes: 28.00,
      total: 84.00
    },
    uso: {
      tokens: 32000,
      tokensInput: 19000,
      tokensOutput: 13000,
      requests: 89,
      mediaTokens: 359
    },
    performance: 88,
    prioridade: 'alta' as const
  },
  {
    id: 'vigilante',
    nome: 'Vigilante',
    emoji: '🚨',
    funcao: 'Monitora leads esquecidos',
    tipo: 'auto' as const,
    modelo: null,
    ativa: true,
    status: 'online' as const,
    gastos: {
      hoje: 0,
      semana: 0,
      mes: 0,
      total: 0
    },
    uso: {
      tokens: 0,
      tokensInput: 0,
      tokensOutput: 0,
      requests: 234,
      mediaTokens: 0
    },
    performance: 95,
    prioridade: 'media' as const
  }
]

export default function GestaoIAs() {
  const navigate = useNavigate()
  const [ias, setIas] = useState(IAS_EXEMPLO)
  const [senhaProtegida, setSenhaProtegida] = useState(true)
  const [senhaInput, setSenhaInput] = useState('')

  // Estatísticas globais
  const stats = {
    totalIAs: ias.length,
    ativas: ias.filter(ia => ia.ativa).length,
    gastosHoje: ias.reduce((acc, ia) => acc + ia.gastos.hoje, 0),
    gastosMes: ias.reduce((acc, ia) => acc + ia.gastos.mes, 0),
    totalRequests: ias.reduce((acc, ia) => acc + ia.uso.requests, 0),
    performanceMedia: Math.round(ias.reduce((acc, ia) => acc + ia.performance, 0) / ias.length)
  }

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'pura': return 'bg-blue-500/20 text-blue-500 border-blue-500/30'
      case 'hibrida': return 'bg-purple-500/20 text-purple-500 border-purple-500/30'
      case 'auto': return 'bg-green-500/20 text-green-500 border-green-500/30'
      default: return 'bg-gray-500/20 text-gray-500 border-gray-500/30'
    }
  }

  const getTipoLabel = (tipo: string) => {
    switch (tipo) {
      case 'pura': return '🟦 Pura'
      case 'hibrida': return '🟪 Híbrida'
      case 'auto': return '🟩 Auto'
      default: return 'Desconhecido'
    }
  }

  const toggleIA = (id: string) => {
    setIas(ias.map(ia => 
      ia.id === id ? { ...ia, ativa: !ia.ativa, status: !ia.ativa ? 'online' : 'offline' } : ia
    ))
  }

  const handleUnlock = () => {
    // Senha exemplo: "ia2026"
    if (senhaInput === 'ia2026') {
      setSenhaProtegida(false)
    } else {
      alert('Senha incorreta!')
    }
  }

  if (senhaProtegida) {
    return (
      <div className="container max-w-4xl mx-auto p-6">
        <Card className="border-2 border-yellow-500/30">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4">
              <Lock className="h-16 w-16 text-yellow-500" />
            </div>
            <CardTitle className="text-2xl">🔐 QG das IAs - Acesso Protegido</CardTitle>
            <CardDescription>
              Esta área contém configurações críticas do sistema de IA.
              <br />
              Digite a senha para continuar.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Input
                type="password"
                placeholder="Digite a senha..."
                value={senhaInput}
                onChange={(e) => setSenhaInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleUnlock()}
              />
              <p className="text-xs text-muted-foreground">
                💡 Dica: Senha de exemplo é "ia2026"
              </p>
            </div>
            <Button onClick={handleUnlock} className="w-full">
              Desbloquear
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">🤖 QG das IAs</h1>
          <p className="text-muted-foreground">
            Central de comando e monitoramento das inteligências artificiais
          </p>
        </div>
        <Button variant="outline" onClick={() => setSenhaProtegida(true)}>
          <Lock className="h-4 w-4 mr-2" />
          Bloquear
        </Button>
      </div>

      {/* Estatísticas Globais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Bot className="h-4 w-4" />
              IAs Ativas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.ativas}/{stats.totalIAs}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((stats.ativas / stats.totalIAs) * 100)}% operacionais
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Gastos Hoje
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {stats.gastosHoje.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-green-500" />
              Mês: R$ {stats.gastosMes.toFixed(2)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRequests}</div>
            <p className="text-xs text-muted-foreground">
              Total de chamadas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.performanceMedia}%</div>
            <p className="text-xs text-muted-foreground">
              Média geral
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Lista de IAs */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Inteligências Artificiais</h2>
        
        {ias.map((ia) => (
          <Card key={ia.id} className={`border-2 ${getTipoColor(ia.tipo)}`}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{ia.emoji}</span>
                    <div>
                      <CardTitle className="text-xl">{ia.nome}</CardTitle>
                      <CardDescription>{ia.funcao}</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={getTipoColor(ia.tipo)}>
                      {getTipoLabel(ia.tipo)}
                    </Badge>
                    {ia.modelo && (
                      <Badge variant="secondary">
                        {ia.modelo.toUpperCase()}
                      </Badge>
                    )}
                    <Badge variant={ia.status === 'online' ? 'default' : 'secondary'}>
                      {ia.status === 'online' ? '🟢 Online' : '🔴 Offline'}
                    </Badge>
                    {ia.prioridade === 'maxima' && (
                      <Badge variant="destructive">
                        ⚡ Máxima
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/gestao/ia/${ia.id}`)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Ver Detalhes
                  </Button>
                  <Button
                    variant={ia.ativa ? 'default' : 'secondary'}
                    size="sm"
                    onClick={() => toggleIA(ia.id)}
                  >
                    {ia.ativa ? (
                      <><Pause className="h-4 w-4 mr-2" /> Pausar</>
                    ) : (
                      <><Play className="h-4 w-4 mr-2" /> Ativar</>
                    )}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Gastos */}
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Gastos</p>
                  <p className="text-lg font-semibold">R$ {ia.gastos.mes.toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground">
                    Hoje: R$ {ia.gastos.hoje.toFixed(2)}
                  </p>
                </div>

                {/* Tokens */}
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Tokens</p>
                  <p className="text-lg font-semibold">{ia.uso.tokens.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">
                    Média: {ia.uso.mediaTokens}/req
                  </p>
                </div>

                {/* Requests */}
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Requests</p>
                  <p className="text-lg font-semibold">{ia.uso.requests}</p>
                  <p className="text-xs text-muted-foreground">
                    Total de chamadas
                  </p>
                </div>

                {/* Performance */}
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Performance</p>
                  <p className="text-lg font-semibold">{ia.performance}%</p>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full" 
                      style={{ width: `${ia.performance}%` }}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Botão Adicionar IA */}
      <Card className="border-dashed">
        <CardContent className="py-8 text-center">
          <Button variant="outline" size="lg">
            <Bot className="h-5 w-5 mr-2" />
            Adicionar Nova IA
          </Button>
          <p className="text-sm text-muted-foreground mt-2">
            Configure uma nova inteligência artificial
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
