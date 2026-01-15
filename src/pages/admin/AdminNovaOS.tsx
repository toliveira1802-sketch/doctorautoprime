import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Search, User, Car, Loader2, FileText, 
  Camera, X, Image, History, Calendar, Phone, Stethoscope, Receipt
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

interface ClientWithVehicle {
  id: string;
  user_id: string;
  name: string;
  phone: string;
  plate: string;
  model?: string;
  brand?: string;
  year?: string;
  color?: string;
  vehicle_id: string;
}

const MAX_PHOTOS = 10;

export default function AdminNovaOS() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClient, setSelectedClient] = useState<ClientWithVehicle | null>(null);
  const [notes, setNotes] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showHistorico, setShowHistorico] = useState(false);
  const [tipoOS, setTipoOS] = useState<'diagnostico' | 'orcamento' | ''>('');
  
  // Photos state
  const [photosPreviews, setPhotosPreviews] = useState<string[]>([]);

  // Fetch vehicle history
  const { data: historicoVeiculo = [] } = useQuery({
    queryKey: ["historico-veiculo", selectedClient?.plate],
    queryFn: async () => {
      if (!selectedClient?.plate) return [];
      const { data, error } = await supabase
        .from("ordens_servico")
        .select("*")
        .eq("plate", selectedClient.plate)
        .order("created_at", { ascending: false })
        .limit(10);
      if (error) throw error;
      return data || [];
    },
    enabled: !!selectedClient?.plate,
  });

  // Search clients with vehicles
  const { data: searchResults = [], isLoading: isLoadingSearch } = useQuery({
    queryKey: ["clients-search", searchQuery],
    queryFn: async () => {
      if (!searchQuery || searchQuery.length < 2) return [];
      
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, user_id, full_name, phone")
        .or(`full_name.ilike.%${searchQuery}%,phone.ilike.%${searchQuery}%`)
        .limit(20);

      if (profilesError) throw profilesError;

      const { data: vehicles, error: vehiclesError } = await supabase
        .from("vehicles")
        .select("id, user_id, plate, model, brand, year, color")
        .or(`plate.ilike.%${searchQuery}%,model.ilike.%${searchQuery}%`)
        .eq("is_active", true)
        .limit(20);

      if (vehiclesError) throw vehiclesError;

      const clientsMap = new Map<string, ClientWithVehicle>();

      profiles?.forEach((profile) => {
        const vehicle = vehicles?.find((v) => v.user_id === profile.user_id);
        if (vehicle) {
          clientsMap.set(`${profile.user_id}-${vehicle.id}`, {
            id: profile.id,
            user_id: profile.user_id,
            name: profile.full_name || "Sem nome",
            phone: profile.phone || "Sem telefone",
            plate: vehicle.plate,
            model: vehicle.model,
            brand: vehicle.brand,
            year: vehicle.year,
            color: vehicle.color,
            vehicle_id: vehicle.id,
          });
        }
      });

      vehicles?.forEach((vehicle) => {
        const profile = profiles?.find((p) => p.user_id === vehicle.user_id);
        if (profile && !clientsMap.has(`${profile.user_id}-${vehicle.id}`)) {
          clientsMap.set(`${profile.user_id}-${vehicle.id}`, {
            id: profile.id,
            user_id: profile.user_id,
            name: profile.full_name || "Sem nome",
            phone: profile.phone || "Sem telefone",
            plate: vehicle.plate,
            model: vehicle.model,
            brand: vehicle.brand,
            year: vehicle.year,
            color: vehicle.color,
            vehicle_id: vehicle.id,
          });
        }
      });

      return Array.from(clientsMap.values());
    },
    enabled: searchQuery.length >= 2,
  });

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const remainingSlots = MAX_PHOTOS - photosPreviews.length;
    const filesToProcess = Array.from(files).slice(0, remainingSlots);

    filesToProcess.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotosPreviews((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (index: number) => {
    setPhotosPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!selectedClient) {
      toast.error("Selecione um cliente");
      return;
    }

    if (!selectedClient.plate || selectedClient.plate === "Sem veículo") {
      toast.error("Cliente precisa ter um veículo cadastrado");
      return;
    }

    if (!tipoOS) {
      toast.error("Selecione o tipo de atendimento (Diagnóstico ou Orçamento)");
      return;
    }

    setIsSubmitting(true);

    try {
      const { data: osData, error: osError } = await supabase
        .from("ordens_servico")
        .insert([{
          numero_os: "",
          plate: selectedClient.plate,
          vehicle: `${selectedClient.brand || ''} ${selectedClient.model || 'Veículo'}`.trim(),
          client_name: selectedClient.name,
          client_phone: selectedClient.phone,
          descricao_problema: notes || null,
          status: tipoOS,
          data_entrada: new Date().toISOString(),
          fotos_entrada: photosPreviews,
        }])
        .select()
        .single();

      if (osError) throw osError;

      toast.success("OS aberta com sucesso!");
      navigate(`/admin/ordens-servico/${osData.id}`);
    } catch (error) {
      console.error("Error creating OS:", error);
      toast.error("Erro ao abrir OS. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">Nova OS</h1>
        </div>

        {/* Bloco 1: Cliente */}
        <Card className="bg-card/50 border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <User className="w-5 h-5" />
              Cliente
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Busca */}
            {!selectedClient && (
              <div className="space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Buscar por nome, telefone ou placa..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setIsSearching(true);
                    }}
                    className="pl-10"
                  />
                </div>
                
                {isLoadingSearch && (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                  </div>
                )}
                
                {searchResults.length > 0 && (
                  <div className="border rounded-lg divide-y max-h-64 overflow-y-auto">
                    {searchResults.map((client) => (
                      <div
                        key={`${client.user_id}-${client.vehicle_id}`}
                        className="p-3 hover:bg-muted/50 cursor-pointer transition-colors"
                        onClick={() => {
                          setSelectedClient(client);
                          setSearchQuery("");
                          setIsSearching(false);
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{client.name}</p>
                            <p className="text-sm text-muted-foreground">{client.phone}</p>
                          </div>
                          <div className="text-right">
                            <Badge variant="outline" className="font-mono">
                              {client.plate}
                            </Badge>
                            <p className="text-xs text-muted-foreground mt-1">
                              {client.brand} {client.model}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Cliente Selecionado */}
            {selectedClient && (
              <div className="space-y-4">
                {/* Info do Cliente */}
                <div className="bg-muted/30 rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <span className="font-semibold text-lg">{selectedClient.name}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Phone className="w-4 h-4" />
                        <span>{selectedClient.phone}</span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedClient(null);
                        setTipoOS('');
                      }}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Veículo */}
                  <div className="flex items-center gap-3 pt-2 border-t">
                    <Car className="w-5 h-5 text-primary" />
                    <div>
                      <Badge variant="secondary" className="font-mono text-base">
                        {selectedClient.plate}
                      </Badge>
                      <p className="text-sm text-muted-foreground mt-1">
                        {selectedClient.brand} {selectedClient.model} {selectedClient.year && `• ${selectedClient.year}`}
                      </p>
                    </div>
                  </div>

                  {/* Flag Retorno + Histórico */}
                  <div className="flex items-center justify-between pt-2 border-t">
                    <div>
                      {historicoVeiculo.length > 0 ? (
                        <Badge variant="default" className="bg-green-600">
                          Cliente Retorno • {historicoVeiculo.length} OS
                        </Badge>
                      ) : (
                        <Badge variant="outline">Primeira Visita</Badge>
                      )}
                    </div>
                    {historicoVeiculo.length > 0 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowHistorico(true)}
                      >
                        <History className="w-4 h-4 mr-2" />
                        Ver Histórico
                      </Button>
                    )}
                  </div>
                </div>

                {/* Tipo de OS */}
                <div className="space-y-3">
                  <Label className="text-base font-medium">Tipo de Atendimento</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      type="button"
                      variant={tipoOS === 'diagnostico' ? 'default' : 'outline'}
                      className={`h-16 flex-col gap-1 ${tipoOS === 'diagnostico' ? 'ring-2 ring-primary' : ''}`}
                      onClick={() => setTipoOS('diagnostico')}
                    >
                      <Stethoscope className="w-5 h-5" />
                      <span>Diagnóstico</span>
                    </Button>
                    <Button
                      type="button"
                      variant={tipoOS === 'orcamento' ? 'default' : 'outline'}
                      className={`h-16 flex-col gap-1 ${tipoOS === 'orcamento' ? 'ring-2 ring-primary' : ''}`}
                      onClick={() => setTipoOS('orcamento')}
                    >
                      <Receipt className="w-5 h-5" />
                      <span>Orçamento</span>
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Bloco 2: Observações Iniciais */}
        {selectedClient && (
          <Card className="bg-card/50 border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileText className="w-5 h-5" />
                Observações Iniciais
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Descreva o problema relatado pelo cliente, sintomas observados, ou qualquer informação relevante..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                className="resize-none"
              />
            </CardContent>
          </Card>
        )}

        {/* Bloco 3: Fotos */}
        {selectedClient && (
          <Card className="bg-card/50 border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Camera className="w-5 h-5" />
                Fotos de Entrada
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Grid de fotos */}
              {photosPreviews.length > 0 && (
                <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                  {photosPreviews.map((preview, index) => (
                    <div key={index} className="relative aspect-square rounded-lg overflow-hidden border">
                      <img
                        src={preview}
                        alt={`Foto ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute top-1 right-1 w-6 h-6"
                        onClick={() => removePhoto(index)}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Upload button */}
              <div className="flex items-center gap-4">
                {photosPreviews.length < MAX_PHOTOS && (
                  <label className="cursor-pointer">
                    <div className="flex items-center gap-2 px-4 py-2 border border-dashed rounded-lg hover:bg-muted/50 transition-colors">
                      <Image className="w-5 h-5 text-muted-foreground" />
                      <span className="text-sm">Adicionar Fotos</span>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={handlePhotoUpload}
                    />
                  </label>
                )}
                <span className="text-sm text-muted-foreground">
                  {photosPreviews.length} de {MAX_PHOTOS} fotos
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Botão Abrir OS */}
        {selectedClient && (
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-6">
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting || !tipoOS}
                className="w-full h-14 text-lg font-semibold gap-3"
                size="lg"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Abrindo OS...
                  </>
                ) : (
                  <>
                    <FileText className="w-5 h-5" />
                    Abrir Ordem de Serviço
                    {tipoOS && (
                      <Badge variant="secondary" className="ml-2">
                        {tipoOS === 'diagnostico' ? 'Diagnóstico' : 'Orçamento'}
                      </Badge>
                    )}
                  </>
                )}
              </Button>
              {!tipoOS && (
                <p className="text-sm text-muted-foreground text-center mt-2">
                  Selecione o tipo de atendimento acima para continuar
                </p>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Dialog Histórico */}
      <Dialog open={showHistorico} onOpenChange={setShowHistorico}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="w-5 h-5" />
              Histórico do Veículo
            </DialogTitle>
          </DialogHeader>
          
          {selectedClient && (
            <div className="space-y-4">
              {/* Info do veículo */}
              <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                <Car className="w-5 h-5 text-primary" />
                <div>
                  <Badge variant="secondary" className="font-mono">
                    {selectedClient.plate}
                  </Badge>
                  <p className="text-sm text-muted-foreground mt-1">
                    {selectedClient.brand} {selectedClient.model} {selectedClient.year && `• ${selectedClient.year}`}
                  </p>
                </div>
              </div>

              {/* Lista de OS */}
              {historicoVeiculo.length > 0 ? (
                <div className="space-y-3">
                  {historicoVeiculo.map((os: any) => (
                    <div 
                      key={os.id} 
                      className="p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={() => navigate(`/admin/ordens-servico/${os.id}`)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="font-mono">
                              {os.numero_os || 'S/N'}
                            </Badge>
                            <Badge 
                              variant={
                                os.status === 'concluido' ? 'default' :
                                os.status === 'em_execucao' ? 'secondary' :
                                'outline'
                              }
                            >
                              {os.status}
                            </Badge>
                          </div>
                          {os.descricao_problema && (
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {os.descricao_problema}
                            </p>
                          )}
                        </div>
                        <div className="text-right text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(os.created_at).toLocaleDateString('pt-BR')}
                          </div>
                          {os.valor_final && (
                            <p className="font-medium text-foreground mt-1">
                              R$ {os.valor_final.toFixed(2)}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <History className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Nenhum histórico encontrado para este veículo</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
