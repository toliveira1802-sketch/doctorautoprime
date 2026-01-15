import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Search, Plus, User, Car, Loader2, FileText, 
  ClipboardCheck, Package, Wrench, ChevronDown, ChevronUp,
  Camera, X, Image
} from "lucide-react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";

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

export default function AdminNovaOS() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClient, setSelectedClient] = useState<ClientWithVehicle | null>(null);
  const [notes, setNotes] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Expandable sections state
  const [checklistOpen, setChecklistOpen] = useState(true);
  const [pecasOpen, setPecasOpen] = useState(false);
  const [servicosOpen, setServicosOpen] = useState(false);

  // Checklist state
  const [checklist, setChecklist] = useState({
    nivelOleo: false,
    nivelAgua: false,
    freios: false,
    pneus: false,
    luzes: false,
    bateria: false,
    correia: false,
    suspensao: false,
  });

  // Photos state
  const [photos, setPhotos] = useState<File[]>([]);
  const [photosPreviews, setPhotosPreviews] = useState<string[]>([]);
  const [isUploadingPhotos, setIsUploadingPhotos] = useState(false);

  // New client dialog state
  const [showNewClientDialog, setShowNewClientDialog] = useState(false);
  const [newClientName, setNewClientName] = useState("");
  const [newClientPhone, setNewClientPhone] = useState("");
  const [newClientPlate, setNewClientPlate] = useState("");
  const [newClientModel, setNewClientModel] = useState("");
  const [isCreatingClient, setIsCreatingClient] = useState(false);

  // Fetch clients with vehicles for search
  const { data: clients = [] } = useQuery({
    queryKey: ["admin-clients-vehicles"],
    queryFn: async () => {
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, user_id, full_name, phone");

      if (profilesError) throw profilesError;

      const { data: vehicles, error: vehiclesError } = await supabase
        .from("vehicles")
        .select("id, user_id, plate, model, brand, year, color");

      if (vehiclesError) throw vehiclesError;

      const clientsWithVehicles: ClientWithVehicle[] = [];
      
      for (const profile of profiles || []) {
        const userVehicles = (vehicles || []).filter(v => v.user_id === profile.user_id);
        
        if (userVehicles.length > 0) {
          for (const vehicle of userVehicles) {
            clientsWithVehicles.push({
              id: `${profile.id}-${vehicle.id}`,
              user_id: profile.user_id,
              name: profile.full_name || "Sem nome",
              phone: profile.phone || "",
              plate: vehicle.plate,
              model: vehicle.model,
              brand: vehicle.brand || "",
              year: vehicle.year || "",
              color: vehicle.color || "",
              vehicle_id: vehicle.id,
            });
          }
        } else {
          clientsWithVehicles.push({
            id: profile.id,
            user_id: profile.user_id,
            name: profile.full_name || "Sem nome",
            phone: profile.phone || "",
            plate: "Sem veículo",
            vehicle_id: "",
          });
        }
      }

      return clientsWithVehicles;
    },
  });

  const filteredClients = clients.filter(
    (client) =>
      client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.phone.includes(searchQuery) ||
      client.plate.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectClient = (client: ClientWithVehicle) => {
    setSelectedClient(client);
    setSearchQuery("");
    setIsSearching(false);
  };

  const MAX_PHOTOS = 5;

  // Photo handlers
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const remainingSlots = MAX_PHOTOS - photos.length;
    if (remainingSlots <= 0) {
      toast.error(`Limite máximo de ${MAX_PHOTOS} fotos atingido`);
      return;
    }

    const newPhotos = Array.from(files).slice(0, remainingSlots);
    if (files.length > remainingSlots) {
      toast.warning(`Apenas ${remainingSlots} foto${remainingSlots !== 1 ? 's' : ''} adicionada${remainingSlots !== 1 ? 's' : ''} (limite: ${MAX_PHOTOS})`);
    }

    const newPreviews = newPhotos.map(file => URL.createObjectURL(file));
    
    setPhotos(prev => [...prev, ...newPhotos]);
    setPhotosPreviews(prev => [...prev, ...newPreviews]);
  };

  const removePhoto = (index: number) => {
    URL.revokeObjectURL(photosPreviews[index]);
    setPhotos(prev => prev.filter((_, i) => i !== index));
    setPhotosPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const uploadPhotosToStorage = async (osId: string): Promise<string[]> => {
    const uploadedUrls: string[] = [];
    
    for (const photo of photos) {
      const fileExt = photo.name.split('.').pop();
      const fileName = `${osId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      
      const { error } = await supabase.storage
        .from('os-photos')
        .upload(fileName, photo);
      
      if (error) {
        console.error('Error uploading photo:', error);
        continue;
      }
      
      const { data: { publicUrl } } = supabase.storage
        .from('os-photos')
        .getPublicUrl(fileName);
      
      uploadedUrls.push(publicUrl);
    }
    
    return uploadedUrls;
  };

  const handleCreateClient = async () => {
    if (!newClientName.trim()) {
      toast.error("Nome é obrigatório");
      return;
    }
    if (!newClientPhone.trim()) {
      toast.error("Telefone é obrigatório");
      return;
    }

    setIsCreatingClient(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const { data: existingProfile } = await supabase
        .from("profiles")
        .select("id, user_id")
        .eq("phone", newClientPhone.replace(/\D/g, ""))
        .single();

      let userId: string;
      let profileId: string;

      if (existingProfile) {
        userId = existingProfile.user_id;
        profileId = existingProfile.id;
        
        await supabase
          .from("profiles")
          .update({ full_name: newClientName })
          .eq("id", profileId);
      } else {
        userId = crypto.randomUUID();
        
        const { data: newProfile, error: profileError } = await supabase
          .from("profiles")
          .insert({
            user_id: userId,
            full_name: newClientName,
            phone: newClientPhone.replace(/\D/g, ""),
          })
          .select()
          .single();

        if (profileError) throw profileError;
        profileId = newProfile.id;
      }

      let vehicleId = "";

      if (newClientPlate.trim()) {
        const { data: newVehicle, error: vehicleError } = await supabase
          .from("vehicles")
          .insert({
            user_id: userId,
            plate: newClientPlate.toUpperCase().replace(/[^A-Z0-9]/g, ""),
            model: newClientModel || "Não informado",
          })
          .select()
          .single();

        if (vehicleError) throw vehicleError;
        vehicleId = newVehicle.id;
      }

      await queryClient.invalidateQueries({ queryKey: ["admin-clients-vehicles"] });

      setSelectedClient({
        id: `${profileId}-${vehicleId}`,
        user_id: userId,
        name: newClientName,
        phone: newClientPhone,
        plate: newClientPlate || "Sem veículo",
        model: newClientModel,
        vehicle_id: vehicleId,
      });

      setShowNewClientDialog(false);
      setNewClientName("");
      setNewClientPhone("");
      setNewClientPlate("");
      setNewClientModel("");

      toast.success("Cliente cadastrado com sucesso!");
    } catch (error) {
      console.error("Error creating client:", error);
      toast.error("Erro ao cadastrar cliente. Tente novamente.");
    } finally {
      setIsCreatingClient(false);
    }
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
          status: "orcamento",
          data_entrada: new Date().toISOString(),
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

        {/* Cliente Card */}
        <Card className="bg-card/50 border-border/50">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <User className="w-5 h-5" />
              Cliente
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowNewClientDialog(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Novo Cliente
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedClient ? (
              <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="font-semibold text-foreground text-lg">{selectedClient.name}</p>
                    <p className="text-sm text-muted-foreground">{selectedClient.phone}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedClient(null)}
                  >
                    Trocar
                  </Button>
                </div>
                
                {/* Vehicle Data Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-3 bg-background/50 rounded-lg">
                  <div>
                    <p className="text-xs text-muted-foreground">Placa</p>
                    <p className="font-mono font-semibold text-foreground">{selectedClient.plate}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Marca</p>
                    <p className="font-medium text-foreground">{selectedClient.brand || "-"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Modelo</p>
                    <p className="font-medium text-foreground">{selectedClient.model || "-"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Ano</p>
                    <p className="font-medium text-foreground">{selectedClient.year || "-"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Cor</p>
                    <p className="font-medium text-foreground">{selectedClient.color || "-"}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por nome, telefone ou placa..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setIsSearching(true);
                    }}
                    onFocus={() => setIsSearching(true)}
                    className="pl-10 h-12 text-base"
                  />
                </div>

                {isSearching && searchQuery && (
                  <div className="border border-border rounded-lg overflow-hidden max-h-80 overflow-y-auto">
                    {filteredClients.length > 0 ? (
                      filteredClients.map((client) => (
                        <button
                          key={client.id}
                          onClick={() => handleSelectClient(client)}
                          className="w-full p-4 text-left hover:bg-muted/50 border-b border-border last:border-0 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-foreground">{client.name}</p>
                              <p className="text-sm text-muted-foreground">{client.phone}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-mono text-sm text-foreground">{client.plate}</p>
                              {client.model && (
                                <p className="text-xs text-muted-foreground">{client.model}</p>
                              )}
                            </div>
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="p-6 text-center">
                        <p className="text-muted-foreground">Nenhum cliente encontrado</p>
                        <Button 
                          variant="link" 
                          className="mt-2"
                          onClick={() => setShowNewClientDialog(true)}
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Cadastrar novo cliente
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                {!isSearching && !searchQuery && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Digite para buscar um cliente existente ou cadastre um novo
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Observações Iniciais */}
        <Card className="bg-card/50 border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileText className="w-5 h-5" />
              Observações Iniciais
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Descreva o problema relatado pelo cliente, sintomas do veículo, etc..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-[100px]"
            />
          </CardContent>
        </Card>

        {/* Fotos Section */}
        <Card className="bg-card/50 border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Camera className="w-5 h-5" />
              Fotos do Veículo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Photo Previews */}
              {photosPreviews.length > 0 && (
                <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                  {photosPreviews.map((preview, index) => (
                    <div key={index} className="relative group aspect-square">
                      <img
                        src={preview}
                        alt={`Foto ${index + 1}`}
                        className="w-full h-full object-cover rounded-lg border border-border"
                      />
                      <button
                        onClick={() => removePhoto(index)}
                        className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Upload Button */}
              {photos.length < MAX_PHOTOS && (
                <div className="flex items-center gap-3">
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                    <div className="flex items-center gap-2 px-4 py-3 border-2 border-dashed border-border rounded-lg hover:border-primary hover:bg-primary/5 transition-colors">
                      <Camera className="w-5 h-5 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {photosPreviews.length > 0 ? "Adicionar mais fotos" : "Clique para adicionar fotos"}
                      </span>
                    </div>
                  </label>
                </div>
              )}
              
              {/* Photo count */}
              <div className="text-sm text-muted-foreground">
                {photosPreviews.length} de {MAX_PHOTOS} fotos
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Checklist Section */}
        <Collapsible open={checklistOpen} onOpenChange={setChecklistOpen}>
          <Card className="bg-card/50 border-border/50">
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                <CardTitle className="flex items-center justify-between text-lg">
                  <div className="flex items-center gap-2">
                    <ClipboardCheck className="w-5 h-5" />
                    Checklist de Entrada
                  </div>
                  {checklistOpen ? (
                    <ChevronUp className="w-5 h-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-muted-foreground" />
                  )}
                </CardTitle>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="pt-0">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { key: "nivelOleo", label: "Nível de Óleo" },
                    { key: "nivelAgua", label: "Nível de Água" },
                    { key: "freios", label: "Freios" },
                    { key: "pneus", label: "Pneus" },
                    { key: "luzes", label: "Luzes" },
                    { key: "bateria", label: "Bateria" },
                    { key: "correia", label: "Correia" },
                    { key: "suspensao", label: "Suspensão" },
                  ].map((item) => (
                    <div key={item.key} className="flex items-center space-x-2">
                      <Checkbox
                        id={item.key}
                        checked={checklist[item.key as keyof typeof checklist]}
                        onCheckedChange={(checked) =>
                          setChecklist({ ...checklist, [item.key]: checked === true })
                        }
                      />
                      <label
                        htmlFor={item.key}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        {item.label}
                      </label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>

        {/* Peças Section */}
        <Collapsible open={pecasOpen} onOpenChange={setPecasOpen}>
          <Card className="bg-card/50 border-border/50">
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                <CardTitle className="flex items-center justify-between text-lg">
                  <div className="flex items-center gap-2">
                    <Package className="w-5 h-5" />
                    Peças
                    <span className="text-xs text-muted-foreground font-normal ml-2">(0 itens)</span>
                  </div>
                  {pecasOpen ? (
                    <ChevronUp className="w-5 h-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-muted-foreground" />
                  )}
                </CardTitle>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="pt-0">
                <div className="text-center py-8 text-muted-foreground">
                  <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Nenhuma peça adicionada</p>
                  <Button variant="outline" size="sm" className="mt-3" disabled>
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Peça
                  </Button>
                </div>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>

        {/* Serviços Section */}
        <Collapsible open={servicosOpen} onOpenChange={setServicosOpen}>
          <Card className="bg-card/50 border-border/50">
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                <CardTitle className="flex items-center justify-between text-lg">
                  <div className="flex items-center gap-2">
                    <Wrench className="w-5 h-5" />
                    Serviços
                    <span className="text-xs text-muted-foreground font-normal ml-2">(0 itens)</span>
                  </div>
                  {servicosOpen ? (
                    <ChevronUp className="w-5 h-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-muted-foreground" />
                  )}
                </CardTitle>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="pt-0">
                <div className="text-center py-8 text-muted-foreground">
                  <Wrench className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Nenhum serviço adicionado</p>
                  <Button variant="outline" size="sm" className="mt-3" disabled>
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Serviço
                  </Button>
                </div>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>

        {/* Actions */}
        <div className="flex gap-3 sticky bottom-4">
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !selectedClient}
            className="flex-1 h-14 text-lg gradient-primary"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Abrindo...
              </>
            ) : (
              <>
                <FileText className="w-5 h-5 mr-2" />
                Abrir OS
              </>
            )}
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate("/admin")}
            disabled={isSubmitting}
            className="h-14"
          >
            Cancelar
          </Button>
        </div>
      </div>

      {/* New Client Dialog */}
      <Dialog open={showNewClientDialog} onOpenChange={setShowNewClientDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Novo Cliente</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome *</Label>
              <Input
                id="name"
                placeholder="Nome completo"
                value={newClientName}
                onChange={(e) => setNewClientName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone *</Label>
              <Input
                id="phone"
                placeholder="(11) 99999-9999"
                value={newClientPhone}
                onChange={(e) => setNewClientPhone(e.target.value)}
              />
            </div>
            <div className="border-t border-border pt-4">
              <p className="text-sm text-muted-foreground mb-3">Veículo (opcional)</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="plate">Placa</Label>
                  <Input
                    id="plate"
                    placeholder="ABC-1234"
                    value={newClientPlate}
                    onChange={(e) => setNewClientPlate(e.target.value.toUpperCase())}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="model">Modelo</Label>
                  <Input
                    id="model"
                    placeholder="Ex: Civic 2020"
                    value={newClientModel}
                    onChange={(e) => setNewClientModel(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowNewClientDialog(false)}
              disabled={isCreatingClient}
            >
              Cancelar
            </Button>
            <Button onClick={handleCreateClient} disabled={isCreatingClient}>
              {isCreatingClient ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Cadastrando...
                </>
              ) : (
                "Cadastrar"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
