import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { 
  ArrowLeft, 
  Car, 
  Phone, 
  Camera, 
  FileText, 
  User, 
  Clock,
  Check,
  Wrench,
  AlertCircle,
  CarFront,
  MessageSquare,
  Save,
  ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type OSStatus = 
  | "diagnostico"
  | "aguardando_pecas"
  | "pronto_iniciar"
  | "em_execucao"
  | "pronto_retirada"
  | "concluido";

interface TimelineStep {
  id: OSStatus;
  title: string;
  icon: string;
  completed: boolean;
  current: boolean;
  timestamp?: string;
}

const statusConfig: Record<OSStatus, { label: string; icon: string; color: string }> = {
  diagnostico: {
    label: "🧠 Diagnóstico",
    icon: "🧠",
    color: "bg-purple-500/20 text-purple-600 border-purple-500/30",
  },
  aguardando_pecas: {
    label: "😤 Aguardando Peças",
    icon: "😤",
    color: "bg-orange-500/20 text-orange-600 border-orange-500/30",
  },
  pronto_iniciar: {
    label: "🫵 Pronto para Iniciar",
    icon: "🫵",
    color: "bg-blue-500/20 text-blue-600 border-blue-500/30",
  },
  em_execucao: {
    label: "🛠️🔩 Em Execução",
    icon: "🛠️",
    color: "bg-amber-500/20 text-amber-600 border-amber-500/30",
  },
  pronto_retirada: {
    label: "💰 Pronto / Aguardando Retirada",
    icon: "💰",
    color: "bg-emerald-500/20 text-emerald-600 border-emerald-500/30",
  },
  concluido: {
    label: "✅ Concluído",
    icon: "✅",
    color: "bg-success/20 text-success border-success/30",
  },
};

const statusOrder: OSStatus[] = [
  "diagnostico",
  "aguardando_pecas",
  "pronto_iniciar",
  "em_execucao",
  "pronto_retirada",
  "concluido",
];

const AdminPatioDetalhes = () => {
  const navigate = useNavigate();
  const { patioId } = useParams();

  // Mock data - será substituído por dados reais
  const [patio, setPatio] = useState({
    id: patioId,
    status: "diagnostico" as OSStatus,
    client: {
      name: "João Silva",
      phone: "(11) 99999-1234",
      cpf: "123.456.789-00",
    },
    vehicle: {
      model: "Civic",
      brand: "Honda",
      plate: "ABC-1234",
      year: "2022",
      color: "Prata",
    },
    notes: "Cliente relatou barulho no motor. Verificar sistema de injeção.",
    createdAt: "15/01/2026 09:30",
    trelloWebhook: "",
    statusHistory: [
      { status: "diagnostico", timestamp: "15/01/2026 09:30", user: "Admin" },
    ],
  });

  const [notes, setNotes] = useState(patio.notes);
  const [trelloWebhook, setTrelloWebhook] = useState(patio.trelloWebhook);
  const [isSaving, setIsSaving] = useState(false);

  const handleStatusChange = async (newStatus: OSStatus) => {
    setIsSaving(true);
    
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    const timestamp = new Date().toLocaleString("pt-BR");
    
    setPatio((prev) => ({
      ...prev,
      status: newStatus,
      statusHistory: [
        ...prev.statusHistory,
        { status: newStatus, timestamp, user: "Admin" },
      ],
    }));

    // Trigger Trello webhook if configured
    if (trelloWebhook) {
      try {
        await fetch(trelloWebhook, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          mode: "no-cors",
          body: JSON.stringify({
            patioId: patio.id,
            newStatus,
            statusLabel: statusConfig[newStatus].label,
            vehicle: `${patio.vehicle.brand} ${patio.vehicle.model} - ${patio.vehicle.plate}`,
            client: patio.client.name,
            timestamp,
          }),
        });
        toast.success("Status atualizado e sincronizado com Trello!");
      } catch (error) {
        toast.success("Status atualizado!");
        toast.error("Erro ao sincronizar com Trello");
      }
    } else {
      toast.success("Status atualizado!");
    }

    setIsSaving(false);
  };

  const handleSaveNotes = async () => {
    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    setPatio((prev) => ({ ...prev, notes }));
    toast.success("Observações salvas!");
    setIsSaving(false);
  };

  const handleSaveTrelloWebhook = async () => {
    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    setPatio((prev) => ({ ...prev, trelloWebhook }));
    toast.success("Webhook do Trello configurado!");
    setIsSaving(false);
  };

  const getTimelineSteps = (): TimelineStep[] => {
    const currentIndex = statusOrder.indexOf(patio.status);
    
    return statusOrder.map((status, index) => {
      const historyEntry = patio.statusHistory.find((h) => h.status === status);
      
      return {
        id: status,
        title: statusConfig[status].label,
        icon: statusConfig[status].icon,
        completed: index < currentIndex,
        current: index === currentIndex,
        timestamp: historyEntry?.timestamp,
      };
    });
  };

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="rounded-full"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-foreground">Pátio #{patio.id?.slice(0, 8)}</h1>
            <p className="text-sm text-muted-foreground">Criada em {patio.createdAt}</p>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              className="gradient-primary"
              onClick={() => navigate(`/admin/ordens-servico/new?patioId=${patio.id}`)}
            >
              <Wrench className="w-4 h-4 mr-2" />
              Abrir OS
            </Button>
            <div className={cn(
              "px-4 py-2 rounded-full text-sm font-medium border",
              statusConfig[patio.status].color
            )}>
              {statusConfig[patio.status].label}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Client & Vehicle Info */}
            <Card className="glass-card border-none">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Client */}
                  <div className="space-y-4">
                    <h3 className="font-semibold flex items-center gap-2">
                      <User className="w-4 h-4 text-primary" />
                      Cliente
                    </h3>
                    <div className="space-y-2 text-sm">
                      <p className="font-medium text-foreground">{patio.client.name}</p>
                      <p className="text-muted-foreground flex items-center gap-2">
                        <Phone className="w-3 h-3" />
                        {patio.client.phone}
                      </p>
                      <p className="text-muted-foreground">CPF: {patio.client.cpf}</p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        window.open(`https://wa.me/55${patio.client.phone.replace(/\D/g, "")}`, "_blank");
                      }}
                    >
                      <MessageSquare className="w-4 h-4 mr-2" />
                      WhatsApp
                    </Button>
                  </div>

                  {/* Vehicle */}
                  <div className="space-y-4">
                    <h3 className="font-semibold flex items-center gap-2">
                      <Car className="w-4 h-4 text-primary" />
                      Veículo
                    </h3>
                    <div className="space-y-2 text-sm">
                      <p className="font-medium text-foreground">
                        {patio.vehicle.brand} {patio.vehicle.model}
                      </p>
                      <p className="text-muted-foreground">Placa: {patio.vehicle.plate}</p>
                      <p className="text-muted-foreground">
                        Ano: {patio.vehicle.year} • Cor: {patio.vehicle.color}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Timeline */}
            <Card className="glass-card border-none">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary" />
                  Timeline do Pátio
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 pt-0">
                <div className="space-y-0">
                  {getTimelineSteps().map((step, index) => {
                    const isLast = index === statusOrder.length - 1;

                    return (
                      <div key={step.id} className="relative flex gap-4">
                        {/* Timeline connector */}
                        <div className="flex flex-col items-center">
                          <div
                            className={cn(
                              "w-10 h-10 rounded-full border-2 flex items-center justify-center z-10 text-lg transition-all duration-300",
                              step.completed 
                                ? "bg-success border-success" 
                                : step.current 
                                  ? "bg-primary border-primary status-pulse" 
                                  : "bg-muted border-border"
                            )}
                          >
                            {step.completed ? (
                              <Check className="w-5 h-5 text-success-foreground" />
                            ) : (
                              <span>{step.icon}</span>
                            )}
                          </div>
                          {!isLast && (
                            <div
                              className={cn(
                                "w-0.5 h-full min-h-[40px] -mt-1",
                                step.completed ? "bg-success" : "bg-border"
                              )}
                            />
                          )}
                        </div>

                        {/* Content */}
                        <div className={cn("flex-1 pb-4", !isLast && "min-h-[60px]")}>
                          <div className="flex items-center gap-2">
                            <h3 className={cn(
                              "font-medium",
                              step.completed || step.current ? "text-foreground" : "text-muted-foreground"
                            )}>
                              {step.title}
                            </h3>
                            {step.timestamp && (
                              <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                                {step.timestamp}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Notes */}
            <Card className="glass-card border-none">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  Observações
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 pt-0 space-y-4">
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Adicione observações sobre a OS..."
                  rows={4}
                  className="bg-background/50"
                />
                <Button 
                  onClick={handleSaveNotes} 
                  disabled={isSaving}
                  size="sm"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Salvar Observações
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Actions */}
          <div className="space-y-6">
            {/* Status Change */}
            <Card className="glass-card border-none">
              <CardHeader>
                <CardTitle className="text-lg">Alterar Status</CardTitle>
              </CardHeader>
              <CardContent className="p-6 pt-0 space-y-4">
                <Select
                  value={patio.status}
                  onValueChange={(value) => handleStatusChange(value as OSStatus)}
                  disabled={isSaving}
                >
                  <SelectTrigger className="bg-background/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOrder.map((status) => (
                      <SelectItem key={status} value={status}>
                        {statusConfig[status].label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div className="grid grid-cols-2 gap-2">
                  {statusOrder.map((status) => (
                    <Button
                      key={status}
                      variant={patio.status === status ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleStatusChange(status)}
                      disabled={isSaving || patio.status === status}
                      className={cn(
                        "text-xs h-auto py-2 px-3",
                        patio.status === status && "gradient-primary"
                      )}
                    >
                      {statusConfig[status].icon}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Trello Integration */}
            <Card className="glass-card border-none">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <ExternalLink className="w-5 h-5 text-primary" />
                  Integração Trello
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 pt-0 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="trello-webhook">Webhook URL</Label>
                  <Input
                    id="trello-webhook"
                    value={trelloWebhook}
                    onChange={(e) => setTrelloWebhook(e.target.value)}
                    placeholder="https://api.trello.com/..."
                    className="bg-background/50 text-xs"
                  />
                  <p className="text-xs text-muted-foreground">
                    Cole a URL do Power-Up ou Butler do Trello para sincronizar automaticamente.
                  </p>
                </div>
                <Button 
                  onClick={handleSaveTrelloWebhook} 
                  disabled={isSaving}
                  size="sm"
                  variant="outline"
                  className="w-full"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Salvar Webhook
                </Button>
              </CardContent>
            </Card>

            {/* Status History */}
            <Card className="glass-card border-none">
              <CardHeader>
                <CardTitle className="text-lg">Histórico</CardTitle>
              </CardHeader>
              <CardContent className="p-6 pt-0">
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {patio.statusHistory.slice().reverse().map((entry, index) => (
                    <div 
                      key={index} 
                      className="flex items-start gap-3 text-sm border-b border-border/50 pb-3 last:border-0"
                    >
                      <span className="text-lg">{statusConfig[entry.status as OSStatus]?.icon}</span>
                      <div className="flex-1">
                        <p className="font-medium text-foreground">
                          {statusConfig[entry.status as OSStatus]?.label}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {entry.timestamp} • {entry.user}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminPatioDetalhes;
