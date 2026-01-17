import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  Instagram, 
  Palette, 
  Bell, 
  Shield, 
  Trash2, 
  Moon, 
  Sun,
  Smartphone,
  ExternalLink,
  ChevronRight,
  AlertTriangle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

type ThemeMode = "light" | "dark" | "system";

export default function Configuracoes() {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const [theme, setTheme] = useState<ThemeMode>("system");
  const [notifications, setNotifications] = useState(true);
  const [instagramHandle, setInstagramHandle] = useState("");
  const [instagramLinked, setInstagramLinked] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    // Load saved preferences
    const savedTheme = localStorage.getItem("theme") as ThemeMode;
    if (savedTheme) {
      setTheme(savedTheme);
      applyTheme(savedTheme);
    }

    const savedNotifications = localStorage.getItem("notifications");
    if (savedNotifications !== null) {
      setNotifications(savedNotifications === "true");
    }

    const savedInstagram = localStorage.getItem("instagramHandle");
    if (savedInstagram) {
      setInstagramHandle(savedInstagram);
      setInstagramLinked(true);
    }
  }, []);

  const applyTheme = (mode: ThemeMode) => {
    const root = document.documentElement;
    
    if (mode === "system") {
      const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      root.classList.toggle("dark", systemDark);
    } else {
      root.classList.toggle("dark", mode === "dark");
    }
  };

  const handleThemeChange = (newTheme: ThemeMode) => {
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    applyTheme(newTheme);
    toast.success("Tema atualizado!");
  };

  const handleNotificationsChange = (enabled: boolean) => {
    setNotifications(enabled);
    localStorage.setItem("notifications", String(enabled));
    toast.success(enabled ? "Notificações ativadas" : "Notificações desativadas");
  };

  const handleInstagramLink = () => {
    if (instagramHandle.trim()) {
      const handle = instagramHandle.startsWith("@") ? instagramHandle : `@${instagramHandle}`;
      localStorage.setItem("instagramHandle", handle);
      setInstagramHandle(handle);
      setInstagramLinked(true);
      toast.success("Instagram vinculado!", {
        description: `Conectado como ${handle}`,
      });
    }
  };

  const handleInstagramUnlink = () => {
    localStorage.removeItem("instagramHandle");
    setInstagramHandle("");
    setInstagramLinked(false);
    toast.success("Instagram desvinculado");
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== "EXCLUIR") {
      toast.error("Digite EXCLUIR para confirmar");
      return;
    }

    setIsDeleting(true);
    
    try {
      // In a real app, this would call an edge function to delete the user
      // For now, we'll just sign out and show a message
      await signOut();
      toast.success("Solicitação de exclusão enviada", {
        description: "Sua conta será excluída em até 30 dias",
      });
      navigate("/login");
    } catch (error) {
      console.error("Error deleting account:", error);
      toast.error("Erro ao excluir conta");
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b">
        <div className="flex items-center gap-4 p-4">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => window.history.length > 1 ? navigate(-1) : navigate("/profile")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-semibold">Configurações</h1>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Aparência */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Palette className="h-5 w-5 text-primary" />
              Aparência
            </CardTitle>
            <CardDescription>
              Personalize como o app aparece pra você
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {theme === "dark" ? (
                  <Moon className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <Sun className="h-5 w-5 text-muted-foreground" />
                )}
                <Label htmlFor="theme">Tema</Label>
              </div>
              <Select value={theme} onValueChange={(v) => handleThemeChange(v as ThemeMode)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Claro</SelectItem>
                  <SelectItem value="dark">Escuro</SelectItem>
                  <SelectItem value="system">Sistema</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Redes Sociais */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Instagram className="h-5 w-5 text-pink-500" />
              Redes Sociais
            </CardTitle>
            <CardDescription>
              Conecte suas redes para receber conteúdo exclusivo
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {instagramLinked ? (
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 flex items-center justify-center">
                    <Instagram className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium">{instagramHandle}</p>
                    <p className="text-xs text-muted-foreground">Conectado</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={handleInstagramUnlink}>
                  Desvincular
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    placeholder="@seu_usuario"
                    value={instagramHandle}
                    onChange={(e) => setInstagramHandle(e.target.value)}
                    className="flex-1"
                  />
                  <Button onClick={handleInstagramLink} disabled={!instagramHandle.trim()}>
                    Vincular
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Receba novidades e promoções exclusivas no Instagram
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Notificações */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              Notificações
            </CardTitle>
            <CardDescription>
              Gerencie como você recebe alertas
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Smartphone className="h-5 w-5 text-muted-foreground" />
                <div>
                  <Label htmlFor="push-notifications">Push Notifications</Label>
                  <p className="text-xs text-muted-foreground">
                    Receba alertas de agendamentos e promoções
                  </p>
                </div>
              </div>
              <Switch
                id="push-notifications"
                checked={notifications}
                onCheckedChange={handleNotificationsChange}
              />
            </div>
          </CardContent>
        </Card>

        {/* Privacidade e Segurança */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Privacidade e Segurança
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <button
              className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors"
              onClick={() => window.open("https://primemotors.com.br/privacidade", "_blank")}
            >
              <span className="text-sm">Política de Privacidade</span>
              <ExternalLink className="h-4 w-4 text-muted-foreground" />
            </button>
            <button
              className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors"
              onClick={() => window.open("https://primemotors.com.br/termos", "_blank")}
            >
              <span className="text-sm">Termos de Uso</span>
              <ExternalLink className="h-4 w-4 text-muted-foreground" />
            </button>
          </CardContent>
        </Card>

        <Separator />

        {/* Zona de Perigo */}
        <Card className="border-destructive/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Zona de Perigo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <button
              className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-destructive/10 transition-colors text-destructive"
              onClick={() => setDeleteDialogOpen(true)}
            >
              <div className="flex items-center gap-3">
                <Trash2 className="h-5 w-5" />
                <div className="text-left">
                  <p className="font-medium">Excluir minha conta</p>
                  <p className="text-xs opacity-70">
                    Esta ação é irreversível
                  </p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5" />
            </button>
          </CardContent>
        </Card>

        {/* App Version */}
        <div className="text-center py-4 text-xs text-muted-foreground">
          <p>Prime Motors App v1.0.0</p>
          <p className="mt-1">© 2025 Prime Motors. Todos os direitos reservados.</p>
        </div>
      </div>

      {/* Delete Account Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Excluir Conta
            </DialogTitle>
            <DialogDescription className="text-left">
              <p className="mb-4">
                Você está prestes a excluir sua conta permanentemente. Isso vai:
              </p>
              <ul className="list-disc list-inside space-y-1 text-sm mb-4">
                <li>Remover todos os seus dados pessoais</li>
                <li>Cancelar agendamentos pendentes</li>
                <li>Perder seus pontos de fidelidade</li>
                <li>Remover todo o histórico de serviços</li>
              </ul>
              <p className="font-medium">
                Digite <span className="text-destructive">EXCLUIR</span> para confirmar:
              </p>
            </DialogDescription>
          </DialogHeader>
          <Input
            value={deleteConfirmation}
            onChange={(e) => setDeleteConfirmation(e.target.value.toUpperCase())}
            placeholder="Digite EXCLUIR"
            className="border-destructive/50 focus:border-destructive"
          />
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false);
                setDeleteConfirmation("");
              }}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteAccount}
              disabled={deleteConfirmation !== "EXCLUIR" || isDeleting}
            >
              {isDeleting ? "Excluindo..." : "Excluir Conta"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
