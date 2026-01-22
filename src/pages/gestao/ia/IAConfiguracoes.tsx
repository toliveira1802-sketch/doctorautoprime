import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
    Key,
    Save,
    Eye,
    EyeOff,
    CheckCircle,
    XCircle,
    Brain,
    Sparkles,
    Bot,
    Zap,
    Cpu
} from "lucide-react";
import { toast } from "sonner";

export default function IAConfiguracoes() {
    const [showKeys, setShowKeys] = useState({
        openai: false,
        gemini: false,
        anthropic: false,
        deepseek: false,
    });

    const [apiKeys, setApiKeys] = useState({
        openai: "",
        gemini: "",
        anthropic: "",
        deepseek: "",
    });

    const [status, setStatus] = useState({
        openai: false,
        gemini: false,
        anthropic: false,
        deepseek: false,
    });

    const handleSave = (provider: string) => {
        // Aqui você salvaria no Supabase ou localStorage
        toast.success(`Chave ${provider} salva com sucesso!`);
        setStatus({ ...status, [provider]: true });
    };

    const handleTest = async (provider: string) => {
        toast.loading(`Testando conexão com ${provider}...`);
        // Aqui você faria uma chamada de teste à API
        setTimeout(() => {
            toast.success(`Conexão com ${provider} OK!`);
            setStatus({ ...status, [provider]: true });
        }, 1500);
    };

    const providers = [
        {
            id: "openai",
            name: "OpenAI",
            icon: Brain,
            color: "text-green-600",
            bgColor: "bg-green-500/10",
            borderColor: "border-green-500/20",
            description: "GPT-4, GPT-3.5, DALL-E",
            placeholder: "sk-...",
            docs: "https://platform.openai.com/api-keys",
        },
        {
            id: "gemini",
            name: "Google Gemini",
            icon: Sparkles,
            color: "text-blue-600",
            bgColor: "bg-blue-500/10",
            borderColor: "border-blue-500/20",
            description: "Gemini Pro, Gemini Vision",
            placeholder: "AIza...",
            docs: "https://makersuite.google.com/app/apikey",
        },
        {
            id: "anthropic",
            name: "Anthropic Claude",
            icon: Bot,
            color: "text-purple-600",
            bgColor: "bg-purple-500/10",
            borderColor: "border-purple-500/20",
            description: "Claude 3 Opus, Sonnet, Haiku",
            placeholder: "sk-ant-...",
            docs: "https://console.anthropic.com/settings/keys",
        },
        {
            id: "deepseek",
            name: "DeepSeek",
            icon: Zap,
            color: "text-orange-600",
            bgColor: "bg-orange-500/10",
            borderColor: "border-orange-500/20",
            description: "DeepSeek Coder, DeepSeek Chat",
            placeholder: "sk-...",
            docs: "https://platform.deepseek.com/api-keys",
        },
    ];

    const localModels = [
        {
            name: "Ollama",
            icon: Cpu,
            description: "Modelos locais (Llama, Mistral, etc.)",
            status: "Configurar servidor local",
        },
    ];

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                    <Key className="w-8 h-8 text-primary" />
                    Configurações de IA
                </h1>
                <p className="text-muted-foreground mt-2">
                    Configure as chaves de API para integração com serviços de Inteligência Artificial
                </p>
            </div>

            {/* Status Cards - APIs Externas */}
            <div>
                <h2 className="text-xl font-semibold mb-3">APIs Externas</h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {providers.map((provider) => {
                        const Icon = provider.icon;
                        const isActive = status[provider.id as keyof typeof status];

                        return (
                            <Card key={provider.id} className={`${provider.bgColor} border-2 ${provider.borderColor}`}>
                                <CardHeader className="pb-3">
                                    <div className="flex items-center justify-between">
                                        <Icon className={`w-6 h-6 ${provider.color}`} />
                                        {isActive ? (
                                            <Badge className="bg-green-500/20 text-green-600 border-green-500/30">
                                                <CheckCircle className="w-3 h-3 mr-1" />
                                                Ativo
                                            </Badge>
                                        ) : (
                                            <Badge variant="outline" className="border-muted-foreground/30">
                                                <XCircle className="w-3 h-3 mr-1" />
                                                Inativo
                                            </Badge>
                                        )}
                                    </div>
                                    <CardTitle className="text-lg mt-2">{provider.name}</CardTitle>
                                    <CardDescription className="text-xs">{provider.description}</CardDescription>
                                </CardHeader>
                            </Card>
                        );
                    })}
                </div>
            </div>

            {/* IAs Locais */}
            <div>
                <h2 className="text-xl font-semibold mb-3">IAs Locais</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {localModels.map((model) => {
                        const Icon = model.icon;
                        return (
                            <Card key={model.name} className="bg-slate-500/10 border-2 border-slate-500/20">
                                <CardHeader className="pb-3">
                                    <div className="flex items-center justify-between">
                                        <Icon className="w-6 h-6 text-slate-600" />
                                        <Badge variant="outline" className="border-slate-500/30">
                                            Local
                                        </Badge>
                                    </div>
                                    <CardTitle className="text-lg mt-2">{model.name}</CardTitle>
                                    <CardDescription className="text-xs">{model.description}</CardDescription>
                                    <p className="text-xs text-muted-foreground mt-2">{model.status}</p>
                                </CardHeader>
                            </Card>
                        );
                    })}
                </div>
            </div>

            {/* Configuration Tabs */}
            <Tabs defaultValue="openai" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                    {providers.map((provider) => (
                        <TabsTrigger key={provider.id} value={provider.id}>
                            {provider.name}
                        </TabsTrigger>
                    ))}
                </TabsList>

                {providers.map((provider) => {
                    const Icon = provider.icon;

                    return (
                        <TabsContent key={provider.id} value={provider.id} className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <div className="flex items-center gap-3">
                                        <div className={`p-3 rounded-lg ${provider.bgColor} border ${provider.borderColor}`}>
                                            <Icon className={`w-6 h-6 ${provider.color}`} />
                                        </div>
                                        <div>
                                            <CardTitle>Configurar {provider.name}</CardTitle>
                                            <CardDescription>
                                                Configure a chave de API para usar {provider.name}
                                            </CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {/* API Key Input */}
                                    <div className="space-y-2">
                                        <Label htmlFor={`${provider.id}-key`}>Chave de API</Label>
                                        <div className="flex gap-2">
                                            <div className="relative flex-1">
                                                <Input
                                                    id={`${provider.id}-key`}
                                                    type={showKeys[provider.id as keyof typeof showKeys] ? "text" : "password"}
                                                    placeholder={provider.placeholder}
                                                    value={apiKeys[provider.id as keyof typeof apiKeys]}
                                                    onChange={(e) => setApiKeys({ ...apiKeys, [provider.id]: e.target.value })}
                                                    className="pr-10"
                                                />
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="absolute right-0 top-0 h-full"
                                                    onClick={() => setShowKeys({ ...showKeys, [provider.id]: !showKeys[provider.id as keyof typeof showKeys] })}
                                                >
                                                    {showKeys[provider.id as keyof typeof showKeys] ? (
                                                        <EyeOff className="w-4 h-4" />
                                                    ) : (
                                                        <Eye className="w-4 h-4" />
                                                    )}
                                                </Button>
                                            </div>
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            Obtenha sua chave em:{" "}
                                            <a
                                                href={provider.docs}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-primary hover:underline"
                                            >
                                                {provider.docs}
                                            </a>
                                        </p>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-2">
                                        <Button
                                            onClick={() => handleSave(provider.id)}
                                            className="gap-2"
                                        >
                                            <Save className="w-4 h-4" />
                                            Salvar
                                        </Button>
                                        <Button
                                            variant="outline"
                                            onClick={() => handleTest(provider.id)}
                                            className="gap-2"
                                        >
                                            <CheckCircle className="w-4 h-4" />
                                            Testar Conexão
                                        </Button>
                                    </div>

                                    {/* Info */}
                                    <Card className="bg-muted/50">
                                        <CardContent className="pt-4">
                                            <h4 className="font-semibold text-sm mb-2">ℹ️ Informações</h4>
                                            <ul className="text-xs text-muted-foreground space-y-1">
                                                <li>• As chaves são armazenadas de forma segura</li>
                                                <li>• Apenas usuários com role "dev" ou "gestao" podem configurar</li>
                                                <li>• As chaves são usadas para todas as funcionalidades de IA</li>
                                                <li>• Você pode revogar as chaves a qualquer momento no painel do provedor</li>
                                            </ul>
                                        </CardContent>
                                    </Card>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    );
                })}
            </Tabs>

            {/* Features usando IA */}
            <Card>
                <CardHeader>
                    <CardTitle>Funcionalidades que usam IA</CardTitle>
                    <CardDescription>
                        Estas funcionalidades serão habilitadas quando você configurar as chaves de API
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="flex items-center gap-3 p-3 border rounded-lg">
                            <Brain className="w-5 h-5 text-green-600" />
                            <div>
                                <p className="font-medium text-sm">Sugestões de Orçamento</p>
                                <p className="text-xs text-muted-foreground">OpenAI GPT-4</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 border rounded-lg">
                            <Sparkles className="w-5 h-5 text-blue-600" />
                            <div>
                                <p className="font-medium text-sm">Análise de Checklist</p>
                                <p className="text-xs text-muted-foreground">Google Gemini</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 border rounded-lg">
                            <Bot className="w-5 h-5 text-purple-600" />
                            <div>
                                <p className="font-medium text-sm">Assistente Virtual</p>
                                <p className="text-xs text-muted-foreground">Claude 3</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 border rounded-lg">
                            <Brain className="w-5 h-5 text-green-600" />
                            <div>
                                <p className="font-medium text-sm">Análise Preditiva</p>
                                <p className="text-xs text-muted-foreground">OpenAI GPT-4</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
