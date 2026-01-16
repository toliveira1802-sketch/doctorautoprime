import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Smartphone, Check, Share, Plus, MoreVertical, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function Install() {
  const navigate = useNavigate();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
    }

    // Detect platform
    const ua = navigator.userAgent;
    setIsIOS(/iPad|iPhone|iPod/.test(ua));
    setIsAndroid(/Android/.test(ua));

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === "accepted") {
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
  };

  if (isInstalled) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
        <Card className="max-w-md w-full glass-card">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-4">
              <Check className="w-8 h-8 text-green-500" />
            </div>
            <CardTitle className="text-2xl">App Instalado!</CardTitle>
            <CardDescription>
              O Doctor Auto Prime já está instalado no seu dispositivo.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={() => navigate("/")} className="w-full">
              Abrir App
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-bg flex flex-col items-center justify-center p-4">
      <Button
        variant="ghost"
        onClick={() => navigate(-1)}
        className="absolute top-4 left-4 text-muted-foreground"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Voltar
      </Button>

      <Card className="max-w-md w-full glass-card">
        <CardHeader className="text-center">
          <div className="mx-auto w-20 h-20 mb-4">
            <img src="/logo.png" alt="Doctor Auto Prime" className="w-full h-full object-contain" />
          </div>
          <CardTitle className="text-2xl">Instalar Doctor Auto Prime</CardTitle>
          <CardDescription>
            Tenha acesso rápido ao app direto da tela inicial do seu celular.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Android with prompt available */}
          {deferredPrompt && (
            <Button onClick={handleInstallClick} className="w-full" size="lg">
              <Download className="w-5 h-5 mr-2" />
              Instalar Agora
            </Button>
          )}

          {/* iOS Instructions */}
          {isIOS && !deferredPrompt && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground text-center">
                Para instalar no iPhone/iPad:
              </p>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                  <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <Share className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">1. Toque em Compartilhar</p>
                    <p className="text-xs text-muted-foreground">No Safari, toque no ícone de compartilhar na barra inferior</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                  <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <Plus className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">2. Adicionar à Tela de Início</p>
                    <p className="text-xs text-muted-foreground">Role as opções e toque em "Adicionar à Tela de Início"</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Android without prompt (fallback instructions) */}
          {isAndroid && !deferredPrompt && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground text-center">
                Para instalar no Android:
              </p>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                  <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <MoreVertical className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">1. Abra o menu</p>
                    <p className="text-xs text-muted-foreground">Toque nos 3 pontos no canto superior direito</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                  <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <Smartphone className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">2. Instalar aplicativo</p>
                    <p className="text-xs text-muted-foreground">Toque em "Instalar app" ou "Adicionar à tela inicial"</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Desktop */}
          {!isIOS && !isAndroid && !deferredPrompt && (
            <div className="text-center space-y-4">
              <p className="text-sm text-muted-foreground">
                Acesse este site pelo celular para instalar o app.
              </p>
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-xs text-muted-foreground mb-2">URL do app:</p>
                <code className="text-sm text-primary">doctorautoprime.lovable.app</code>
              </div>
            </div>
          )}

          {/* Benefits */}
          <div className="border-t pt-4 mt-4">
            <p className="text-sm font-medium mb-3">Benefícios do app:</p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                Acesso rápido pela tela inicial
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                Funciona offline
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                Experiência de app nativo
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
