import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  ArrowLeft,
  Settings,
  TrendingUp,
  Zap,
  DollarSign,
  Activity,
  Save,
  Play,
  Pause
} from 'lucide-react'

// Dados de exemplo
const IAS_DATA: Record<string, any> = {
  'qualificador': {
    id: 'qualificador',
    nome: 'Qualificador de Leads',
    emoji: '🎯',
    funcao: 'Classifica leads em A/B/C automaticamente',
    descricao: 'Analisa informações do lead (origem, comportamento, histórico) e classifica em A (alta prioridade), B (média prioridade) ou C (baixa prioridade) para otimizar o trabalho da equipe de vendas.',
    tipo: 'pura',
    modelo: 'gpt-4',
    ativa: true,
    status: 'online',
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
    config: {
      apiKey: 'sk-proj-••••••••••••••••',
      temperature: 0.3,
      maxTokens: 500,
      systemPrompt: 'Você é um especialista em qualificação de leads. Analise as informações fornecidas e classifique o lead em A (alta prioridade), B (média prioridade) ou C (baixa prioridade). Seja objetivo e baseie-se em dados concretos.'
    },
    performance: 92,
    prioridade: 'maxima'
  },
  'anna-laura': {
    id: 'anna-laura',
    nome: 'Anna Laura',
    emoji: '💰',
    funcao: 'Especialista em vendas consultivas',
    descricao: 'Auxilia consultores em vendas complexas, sugerindo abordagens, argumentos de venda e estratégias de negociação baseadas no perfil do cliente e histórico de interações.',
    tipo: 'hibrida',
    modelo: 'gpt-3.5',
    ativa: true,
    status: 'online',
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
    config: {
      apiKey: 'sk-proj-••••••••••••••••',
      temperature: 0.7,
      maxTokens: 800,
      systemPrompt: 'Você é Anna Laura, especialista em vendas consultivas. Ajude consultores a fechar vendas com abordagens personalizadas, argumentos convincentes e estratégias de negociação. Seja prática e focada em resultados.'
    },
    performance: 88,
    prioridade: 'alta'
  },
  'vigilante': {
    id: 'vigilante',
    nome: 'Vigilante',
    emoji: '🚨',
    funcao: 'Monitora leads esquecidos',
    descricao: 'Sistema automático que monitora leads sem interação há mais de 30 dias e dispara alertas para a equipe comercial. Não usa IA, apenas regras de negócio.',
    tipo: 'auto',
    modelo: null,
    ativa: true,
    status: 'online',
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
    config: {
      diasSemInteracao: 30,
      frequenciaVerificacao: 'diaria',
      notificarPor: 'email,telegram'
    },
    performance: 95,
    prioridade: 'media'
  }
}

export default function IAIndividual() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [ia, setIa] = useState(IAS_DATA[id || 'qualificador'])
  const [config, setConfig] = useState(ia?.config || {})

  if (!ia) {
    return (
      <div className="container max-w-4xl mx-auto p-6">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">IA não encontrada</p>
            <Button onClick={() => navigate('/gestao/ia')} className="mt-4">
              Voltar para QG
            </Button>
          </CardContent>
        </Card>
      </div>
    )
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
      case 'pura': return '🟦 IA Pura'
      case 'hibrida': return '🟪 IA Híbrida'
      case 'auto': return '🟩 Automação'
      default: return 'Desconhecido'
    }
  }

  const handleSave = () => {
    setIa({ ...ia, config })
    alert('Configurações salvas com sucesso!')
  }

  const toggleIA = () => {
    setIa({ ...ia, ativa: !ia.ativa, status: !ia.ativa ? 'online' : 'offline' })
  }

  return (
    <div className="container max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => navigate('/gestao/ia')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <span className="text-4xl">{ia.emoji}</span>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{ia.nome}</h1>
              <p className="text-muted-foreground">{ia.funcao}</p>
            </div>
          </div>
        </div>
        <Button
          variant={ia.ativa ? 'default' : 'secondary'}
          onClick={toggleIA}
        >
          {ia.ativa ? (
            <><Pause className="h-4 w-4 mr-2" /> Pausar IA</>
          ) : (
            <><Play className="h-4 w-4 mr-2" /> Ativar IA</>
          )}
        </Button>
      </div>

      {/* Badges */}
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
            ⚡ Prioridade Máxima
          </Badge>
        )}
      </div>

      {/* Estatísticas Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Gastos do Mês
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {ia.gastos.mes.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Hoje: R$ {ia.gastos.hoje.toFixed(2)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Tokens
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{ia.uso.tokens.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Média: {ia.uso.mediaTokens}/req
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{ia.uso.requests}</div>
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
            <div className="text-2xl font-bold">{ia.performance}%</div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div 
                className="bg-green-500 h-2 rounded-full" 
                style={{ width: `${ia.performance}%` }}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="config">Configuração</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
        </TabsList>

        {/* Tab: Visão Geral */}
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sobre esta IA</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Descrição</Label>
                <p className="text-sm text-muted-foreground mt-1">
                  {ia.descricao}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Tipo</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    {getTipoLabel(ia.tipo)}
                  </p>
                </div>

                {ia.modelo && (
                  <div>
                    <Label className="text-sm font-medium">Modelo</Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      {ia.modelo.toUpperCase()}
                    </p>
                  </div>
                )}

                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    {ia.status === 'online' ? '🟢 Online' : '🔴 Offline'}
                  </p>
                </div>

                <div>
                  <Label className="text-sm font-medium">Prioridade</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    {ia.prioridade === 'maxima' ? '⚡ Máxima' : ia.prioridade === 'alta' ? '🔥 Alta' : '📊 Média'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Estatísticas Detalhadas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Gastos</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                    <div className="text-sm">
                      <span className="text-muted-foreground">Hoje:</span> R$ {ia.gastos.hoje.toFixed(2)}
                    </div>
                    <div className="text-sm">
                      <span className="text-muted-foreground">Semana:</span> R$ {ia.gastos.semana.toFixed(2)}
                    </div>
                    <div className="text-sm">
                      <span className="text-muted-foreground">Mês:</span> R$ {ia.gastos.mes.toFixed(2)}
                    </div>
                    <div className="text-sm">
                      <span className="text-muted-foreground">Total:</span> R$ {ia.gastos.total.toFixed(2)}
                    </div>
                  </div>
                </div>

                {ia.tipo !== 'auto' && (
                  <div>
                    <Label className="text-sm font-medium">Uso de Tokens</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                      <div className="text-sm">
                        <span className="text-muted-foreground">Total:</span> {ia.uso.tokens.toLocaleString()}
                      </div>
                      <div className="text-sm">
                        <span className="text-muted-foreground">Input:</span> {ia.uso.tokensInput.toLocaleString()}
                      </div>
                      <div className="text-sm">
                        <span className="text-muted-foreground">Output:</span> {ia.uso.tokensOutput.toLocaleString()}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Configuração */}
        <TabsContent value="config" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Configurações da IA
              </CardTitle>
              <CardDescription>
                Ajuste os parâmetros de funcionamento da IA
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {ia.tipo !== 'auto' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="apiKey">API Key</Label>
                    <Input
                      id="apiKey"
                      type="password"
                      value={config.apiKey || ''}
                      onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
                      placeholder="sk-proj-..."
                    />
                    <p className="text-xs text-muted-foreground">
                      Chave de API para acessar o modelo de IA
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="temperature">Temperature</Label>
                      <Input
                        id="temperature"
                        type="number"
                        min="0"
                        max="2"
                        step="0.1"
                        value={config.temperature || 0.7}
                        onChange={(e) => setConfig({ ...config, temperature: parseFloat(e.target.value) })}
                      />
                      <p className="text-xs text-muted-foreground">
                        0.0 = Determinístico | 2.0 = Criativo
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="maxTokens">Max Tokens</Label>
                      <Input
                        id="maxTokens"
                        type="number"
                        min="100"
                        max="4000"
                        step="100"
                        value={config.maxTokens || 1000}
                        onChange={(e) => setConfig({ ...config, maxTokens: parseInt(e.target.value) })}
                      />
                      <p className="text-xs text-muted-foreground">
                        Limite de tokens por resposta
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="systemPrompt">System Prompt</Label>
                    <Textarea
                      id="systemPrompt"
                      rows={6}
                      value={config.systemPrompt || ''}
                      onChange={(e) => setConfig({ ...config, systemPrompt: e.target.value })}
                      placeholder="Você é um assistente especializado em..."
                    />
                    <p className="text-xs text-muted-foreground">
                      Define o comportamento e personalidade da IA
                    </p>
                  </div>
                </>
              )}

              {ia.tipo === 'auto' && (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Esta é uma automação (não usa IA). Configure as regras de negócio abaixo:
                  </p>
                  {Object.entries(config).map(([key, value]) => (
                    <div key={key} className="space-y-2">
                      <Label htmlFor={key}>{key}</Label>
                      <Input
                        id={key}
                        value={value as string}
                        onChange={(e) => setConfig({ ...config, [key]: e.target.value })}
                      />
                    </div>
                  ))}
                </div>
              )}

              <Button onClick={handleSave} className="w-full">
                <Save className="h-4 w-4 mr-2" />
                Salvar Configurações
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Logs */}
        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Atividades</CardTitle>
              <CardDescription>
                Últimas 10 ações realizadas pela IA
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-sm border-l-2 border-green-500 pl-3 py-2">
                  <p className="font-medium">✅ Lead qualificado como "A"</p>
                  <p className="text-xs text-muted-foreground">Há 5 minutos • Lead #12345</p>
                </div>
                <div className="text-sm border-l-2 border-green-500 pl-3 py-2">
                  <p className="font-medium">✅ Lead qualificado como "B"</p>
                  <p className="text-xs text-muted-foreground">Há 12 minutos • Lead #12344</p>
                </div>
                <div className="text-sm border-l-2 border-yellow-500 pl-3 py-2">
                  <p className="font-medium">⚠️ Dados insuficientes para qualificação</p>
                  <p className="text-xs text-muted-foreground">Há 18 minutos • Lead #12343</p>
                </div>
                <div className="text-sm border-l-2 border-green-500 pl-3 py-2">
                  <p className="font-medium">✅ Lead qualificado como "C"</p>
                  <p className="text-xs text-muted-foreground">Há 25 minutos • Lead #12342</p>
                </div>
                <p className="text-xs text-muted-foreground text-center pt-4">
                  Logs completos disponíveis no banco de dados
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
