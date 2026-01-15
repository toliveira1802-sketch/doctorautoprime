import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Search, Plus, User, Car, Loader2, FileText, 
  ClipboardCheck, Package, Wrench, ChevronDown, ChevronUp,
  Camera, X, Image, Gauge, Zap, Activity, ShieldCheck, FileSearch, 
  Cog, Compass, AlertTriangle, CheckCircle, XCircle, AlertCircle,
  Target, TrendingUp, Trash2, ChevronRight
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
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

  // Checklist type selection
  const [checklistType, setChecklistType] = useState<'entrada' | 'dinamometro' | 'precompra'>('entrada');

  // Checklist Entrada state
  const [checklistEntrada, setChecklistEntrada] = useState({
    nivelOleo: false,
    nivelAgua: false,
    freios: false,
    pneus: false,
    luzes: false,
    bateria: false,
    correia: false,
    suspensao: false,
  });

  // Checklist Dinamômetro state
  const [checklistDyno, setChecklistDyno] = useState({
    // Antes de subir no rolo
    combustivelAdequado: false,
    oleoNivel: false,
    arrefecimentoOk: false,
    pneusCalibrados: false,
    correiasPolias: false,
    // Eletrônica
    scannerSemFalhas: false,
    monitorarIAT: false,
    monitorarEGT: false,
    pressaoCombustivel: false,
    // Durante os pulls
    afrEstavel: false,
    knockControl: false,
    pressaoTurbo: false,
    temperaturaControle: false,
    // Pós-dyno
    verificarVazamentos: false,
    lerFalhasPosTest: false,
    analisarCurva: false,
    compararBaseline: false,
  });

  // Dyno results
  const [dynoResults, setDynoResults] = useState({
    potenciaAntes: '',
    potenciaDepois: '',
    torqueAntes: '',
    torqueDepois: '',
  });

  // Checklist Pré-Compra state
  const [checklistPreCompra, setChecklistPreCompra] = useState({
    // Histórico
    manualRevisoes: false,
    recallPendente: false,
    sinaisLeilaoSinistro: false,
    modificacoesNaoDeclaradas: false,
    // Estrutura
    longarinas: false,
    colunas: false,
    alinhamentoPortasCapo: false,
    soldasForaPadrao: false,
    // Mecânica profunda
    compressaoMotor: false,
    consumoOleo: false,
    fumacaEscape: false,
    temperaturaTrabalho: false,
    // Eletrônica
    scannerCompleto: false,
    modulosFalhaHistorica: false,
    kmRealCruzamento: false,
    // Test drive
    direcaoPuxa: false,
    vibracoes: false,
    trocasMarcha: false,
    freadaAlta: false,
  });

  // Parecer pré-compra
  const [parecerPreCompra, setParecerPreCompra] = useState<'recomendada' | 'ressalvas' | 'nao_comprar' | ''>('');

  // Produtos Upsell
  interface ProdutoUpsell {
    id: string;
    nome: string;
    preco: number;
    adicionais: { id: string; nome: string; preco: number; selecionado: boolean }[];
  }

  const produtosUpsellDisponiveis: ProdutoUpsell[] = [
    {
      id: '1',
      nome: 'Troca de Óleo',
      preco: 150,
      adicionais: [
        { id: '1a', nome: 'Filtro de Óleo Premium', preco: 45, selecionado: false },
        { id: '1b', nome: 'Aditivo para Motor', preco: 35, selecionado: false },
        { id: '1c', nome: 'Limpeza de Cárter', preco: 80, selecionado: false },
      ]
    },
    {
      id: '2',
      nome: 'Alinhamento',
      preco: 120,
      adicionais: [
        { id: '2a', nome: 'Balanceamento', preco: 80, selecionado: false },
        { id: '2b', nome: 'Rodízio de Pneus', preco: 40, selecionado: false },
        { id: '2c', nome: 'Geometria Completa', preco: 150, selecionado: false },
      ]
    },
    {
      id: '3',
      nome: 'Diagnóstico Eletrônico',
      preco: 80,
      adicionais: [
        { id: '3a', nome: 'Limpeza de Bicos', preco: 180, selecionado: false },
        { id: '3b', nome: 'Reset de ECU', preco: 60, selecionado: false },
        { id: '3c', nome: 'Atualização de Software', preco: 120, selecionado: false },
      ]
    },
    {
      id: '4',
      nome: 'Revisão de Freios',
      preco: 100,
      adicionais: [
        { id: '4a', nome: 'Pastilhas Cerâmicas', preco: 250, selecionado: false },
        { id: '4b', nome: 'Troca de Fluido', preco: 80, selecionado: false },
        { id: '4c', nome: 'Discos Ventilados', preco: 450, selecionado: false },
      ]
    },
    {
      id: '5',
      nome: 'Check-up Completo',
      preco: 200,
      adicionais: [
        { id: '5a', nome: 'Higienização A/C', preco: 120, selecionado: false },
        { id: '5b', nome: 'Troca de Filtros', preco: 150, selecionado: false },
        { id: '5c', nome: 'Limpeza de Radiador', preco: 90, selecionado: false },
      ]
    },
  ];

  const [produtosSelecionados, setProdutosSelecionados] = useState<ProdutoUpsell[]>([]);
  const [produtosOpen, setProdutosOpen] = useState(false);

  const adicionarProdutoUpsell = (produto: ProdutoUpsell) => {
    if (!produtosSelecionados.find(p => p.id === produto.id)) {
      setProdutosSelecionados([...produtosSelecionados, { ...produto, adicionais: produto.adicionais.map(u => ({ ...u })) }]);
    }
  };

  const removerProdutoUpsell = (produtoId: string) => {
    setProdutosSelecionados(produtosSelecionados.filter(p => p.id !== produtoId));
  };

  const toggleAdicional = (produtoId: string, adicionalId: string) => {
    setProdutosSelecionados(produtosSelecionados.map(p => {
      if (p.id === produtoId) {
        return {
          ...p,
          adicionais: p.adicionais.map(u => u.id === adicionalId ? { ...u, selecionado: !u.selecionado } : u)
        };
      }
      return p;
    }));
  };

  const calcularTotalProdutos = () => {
    return produtosSelecionados.reduce((total, p) => {
      const adicionaisTotal = p.adicionais.filter(u => u.selecionado).reduce((t, u) => t + u.preco, 0);
      return total + p.preco + adicionaisTotal;
    }, 0);
  };

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
                    Checklist
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
              <CardContent className="pt-0 space-y-6">
                {/* Checklist Type Selector */}
                <Tabs value={checklistType} onValueChange={(v) => setChecklistType(v as 'entrada' | 'dinamometro' | 'precompra')}>
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="entrada" className="flex items-center gap-1 text-xs md:text-sm">
                      <ClipboardCheck className="w-4 h-4" />
                      <span className="hidden sm:inline">Entrada</span>
                    </TabsTrigger>
                    <TabsTrigger value="dinamometro" className="flex items-center gap-1 text-xs md:text-sm">
                      <Gauge className="w-4 h-4" />
                      <span className="hidden sm:inline">Dinamômetro</span>
                    </TabsTrigger>
                    <TabsTrigger value="precompra" className="flex items-center gap-1 text-xs md:text-sm">
                      <ShieldCheck className="w-4 h-4" />
                      <span className="hidden sm:inline">Pré-Compra</span>
                    </TabsTrigger>
                  </TabsList>

                  {/* Checklist Entrada */}
                  <TabsContent value="entrada" className="mt-4">
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
                            id={`entrada-${item.key}`}
                            checked={checklistEntrada[item.key as keyof typeof checklistEntrada]}
                            onCheckedChange={(checked) =>
                              setChecklistEntrada({ ...checklistEntrada, [item.key]: checked === true })
                            }
                          />
                          <label
                            htmlFor={`entrada-${item.key}`}
                            className="text-sm font-medium leading-none cursor-pointer"
                          >
                            {item.label}
                          </label>
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  {/* Checklist Dinamômetro */}
                  <TabsContent value="dinamometro" className="mt-4 space-y-6">
                    {/* Antes de subir no rolo */}
                    <div className="space-y-3">
                      <h4 className="font-semibold text-sm flex items-center gap-2 text-primary">
                        <Activity className="w-4 h-4" />
                        Antes de subir no rolo
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-6">
                        {[
                          { key: "combustivelAdequado", label: "Combustível adequado (octanagem confirmada)" },
                          { key: "oleoNivel", label: "Óleo no nível correto" },
                          { key: "arrefecimentoOk", label: "Sistema de arrefecimento ok" },
                          { key: "pneusCalibrados", label: "Pneus calibrados" },
                          { key: "correiasPolias", label: "Correias e polias revisadas" },
                        ].map((item) => (
                          <div key={item.key} className="flex items-center space-x-2">
                            <Checkbox
                              id={`dyno-${item.key}`}
                              checked={checklistDyno[item.key as keyof typeof checklistDyno]}
                              onCheckedChange={(checked) =>
                                setChecklistDyno({ ...checklistDyno, [item.key]: checked === true })
                              }
                            />
                            <label htmlFor={`dyno-${item.key}`} className="text-sm cursor-pointer">
                              {item.label}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Eletrônica */}
                    <div className="space-y-3">
                      <h4 className="font-semibold text-sm flex items-center gap-2 text-primary">
                        <Zap className="w-4 h-4" />
                        Eletrônica
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-6">
                        {[
                          { key: "scannerSemFalhas", label: "Scanner sem falhas críticas" },
                          { key: "monitorarIAT", label: "Monitorar IAT" },
                          { key: "monitorarEGT", label: "Monitorar EGT (se aplicável)" },
                          { key: "pressaoCombustivel", label: "Pressão de combustível" },
                        ].map((item) => (
                          <div key={item.key} className="flex items-center space-x-2">
                            <Checkbox
                              id={`dyno-${item.key}`}
                              checked={checklistDyno[item.key as keyof typeof checklistDyno]}
                              onCheckedChange={(checked) =>
                                setChecklistDyno({ ...checklistDyno, [item.key]: checked === true })
                              }
                            />
                            <label htmlFor={`dyno-${item.key}`} className="text-sm cursor-pointer">
                              {item.label}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Durante os pulls */}
                    <div className="space-y-3">
                      <h4 className="font-semibold text-sm flex items-center gap-2 text-primary">
                        <Gauge className="w-4 h-4" />
                        Durante os pulls
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-6">
                        {[
                          { key: "afrEstavel", label: "AFR estável" },
                          { key: "knockControl", label: "Knock control ativo?" },
                          { key: "pressaoTurbo", label: "Pressão de turbo dentro do esperado" },
                          { key: "temperaturaControle", label: "Temperatura sob controle" },
                        ].map((item) => (
                          <div key={item.key} className="flex items-center space-x-2">
                            <Checkbox
                              id={`dyno-${item.key}`}
                              checked={checklistDyno[item.key as keyof typeof checklistDyno]}
                              onCheckedChange={(checked) =>
                                setChecklistDyno({ ...checklistDyno, [item.key]: checked === true })
                              }
                            />
                            <label htmlFor={`dyno-${item.key}`} className="text-sm cursor-pointer">
                              {item.label}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Pós-dyno */}
                    <div className="space-y-3">
                      <h4 className="font-semibold text-sm flex items-center gap-2 text-primary">
                        <ClipboardCheck className="w-4 h-4" />
                        Pós-dyno
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-6">
                        {[
                          { key: "verificarVazamentos", label: "Verificar vazamentos" },
                          { key: "lerFalhasPosTest", label: "Ler falhas pós-teste" },
                          { key: "analisarCurva", label: "Analisar curva de potência" },
                          { key: "compararBaseline", label: "Comparar baseline x final" },
                        ].map((item) => (
                          <div key={item.key} className="flex items-center space-x-2">
                            <Checkbox
                              id={`dyno-${item.key}`}
                              checked={checklistDyno[item.key as keyof typeof checklistDyno]}
                              onCheckedChange={(checked) =>
                                setChecklistDyno({ ...checklistDyno, [item.key]: checked === true })
                              }
                            />
                            <label htmlFor={`dyno-${item.key}`} className="text-sm cursor-pointer">
                              {item.label}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Resultado */}
                    <div className="space-y-3 border-t border-border pt-4">
                      <h4 className="font-semibold text-sm flex items-center gap-2 text-primary">
                        📌 Resultado: antes e depois
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="space-y-1">
                          <label className="text-xs text-muted-foreground">Potência Antes (cv)</label>
                          <Input
                            type="number"
                            placeholder="___"
                            value={dynoResults.potenciaAntes}
                            onChange={(e) => setDynoResults({ ...dynoResults, potenciaAntes: e.target.value })}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs text-muted-foreground">Potência Depois (cv)</label>
                          <Input
                            type="number"
                            placeholder="___"
                            value={dynoResults.potenciaDepois}
                            onChange={(e) => setDynoResults({ ...dynoResults, potenciaDepois: e.target.value })}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs text-muted-foreground">Torque Antes (kgfm)</label>
                          <Input
                            type="number"
                            placeholder="___"
                            value={dynoResults.torqueAntes}
                            onChange={(e) => setDynoResults({ ...dynoResults, torqueAntes: e.target.value })}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs text-muted-foreground">Torque Depois (kgfm)</label>
                          <Input
                            type="number"
                            placeholder="___"
                            value={dynoResults.torqueDepois}
                            onChange={(e) => setDynoResults({ ...dynoResults, torqueDepois: e.target.value })}
                          />
                        </div>
                      </div>
                      {dynoResults.potenciaAntes && dynoResults.potenciaDepois && (
                        <div className="p-3 bg-primary/10 rounded-lg">
                          <p className="text-sm font-medium">
                            Ganho: {(Number(dynoResults.potenciaDepois) - Number(dynoResults.potenciaAntes)).toFixed(1)} cv
                            {dynoResults.torqueAntes && dynoResults.torqueDepois && (
                              <> | {(Number(dynoResults.torqueDepois) - Number(dynoResults.torqueAntes)).toFixed(1)} kgfm</>
                            )}
                          </p>
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  {/* Checklist Pré-Compra */}
                  <TabsContent value="precompra" className="mt-4 space-y-6">
                    {/* Histórico */}
                    <div className="space-y-3">
                      <h4 className="font-semibold text-sm flex items-center gap-2 text-primary">
                        <FileSearch className="w-4 h-4" />
                        Histórico
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-6">
                        {[
                          { key: "manualRevisoes", label: "Manual / revisões" },
                          { key: "recallPendente", label: "Recall pendente" },
                          { key: "sinaisLeilaoSinistro", label: "Sinais de leilão / sinistro" },
                          { key: "modificacoesNaoDeclaradas", label: "Modificações não declaradas" },
                        ].map((item) => (
                          <div key={item.key} className="flex items-center space-x-2">
                            <Checkbox
                              id={`precompra-${item.key}`}
                              checked={checklistPreCompra[item.key as keyof typeof checklistPreCompra]}
                              onCheckedChange={(checked) =>
                                setChecklistPreCompra({ ...checklistPreCompra, [item.key]: checked === true })
                              }
                            />
                            <label htmlFor={`precompra-${item.key}`} className="text-sm cursor-pointer">
                              {item.label}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Estrutura */}
                    <div className="space-y-3">
                      <h4 className="font-semibold text-sm flex items-center gap-2 text-primary">
                        <Car className="w-4 h-4" />
                        Estrutura
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-6">
                        {[
                          { key: "longarinas", label: "Longarinas" },
                          { key: "colunas", label: "Colunas" },
                          { key: "alinhamentoPortasCapo", label: "Alinhamento de portas e capô" },
                          { key: "soldasForaPadrao", label: "Soldas fora do padrão" },
                        ].map((item) => (
                          <div key={item.key} className="flex items-center space-x-2">
                            <Checkbox
                              id={`precompra-${item.key}`}
                              checked={checklistPreCompra[item.key as keyof typeof checklistPreCompra]}
                              onCheckedChange={(checked) =>
                                setChecklistPreCompra({ ...checklistPreCompra, [item.key]: checked === true })
                              }
                            />
                            <label htmlFor={`precompra-${item.key}`} className="text-sm cursor-pointer">
                              {item.label}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Mecânica profunda */}
                    <div className="space-y-3">
                      <h4 className="font-semibold text-sm flex items-center gap-2 text-primary">
                        <Cog className="w-4 h-4" />
                        Mecânica profunda
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-6">
                        {[
                          { key: "compressaoMotor", label: "Compressão do motor" },
                          { key: "consumoOleo", label: "Consumo de óleo" },
                          { key: "fumacaEscape", label: "Fumaça no escape" },
                          { key: "temperaturaTrabalho", label: "Temperatura de trabalho" },
                        ].map((item) => (
                          <div key={item.key} className="flex items-center space-x-2">
                            <Checkbox
                              id={`precompra-${item.key}`}
                              checked={checklistPreCompra[item.key as keyof typeof checklistPreCompra]}
                              onCheckedChange={(checked) =>
                                setChecklistPreCompra({ ...checklistPreCompra, [item.key]: checked === true })
                              }
                            />
                            <label htmlFor={`precompra-${item.key}`} className="text-sm cursor-pointer">
                              {item.label}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Eletrônica */}
                    <div className="space-y-3">
                      <h4 className="font-semibold text-sm flex items-center gap-2 text-primary">
                        <Zap className="w-4 h-4" />
                        Eletrônica
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-6">
                        {[
                          { key: "scannerCompleto", label: "Scanner completo" },
                          { key: "modulosFalhaHistorica", label: "Módulos com falha histórica" },
                          { key: "kmRealCruzamento", label: "Km real (cruzamento de módulos)" },
                        ].map((item) => (
                          <div key={item.key} className="flex items-center space-x-2">
                            <Checkbox
                              id={`precompra-${item.key}`}
                              checked={checklistPreCompra[item.key as keyof typeof checklistPreCompra]}
                              onCheckedChange={(checked) =>
                                setChecklistPreCompra({ ...checklistPreCompra, [item.key]: checked === true })
                              }
                            />
                            <label htmlFor={`precompra-${item.key}`} className="text-sm cursor-pointer">
                              {item.label}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Test drive */}
                    <div className="space-y-3">
                      <h4 className="font-semibold text-sm flex items-center gap-2 text-primary">
                        <Compass className="w-4 h-4" />
                        Test drive
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-6">
                        {[
                          { key: "direcaoPuxa", label: "Direção puxa?" },
                          { key: "vibracoes", label: "Vibrações" },
                          { key: "trocasMarcha", label: "Trocas de marcha" },
                          { key: "freadaAlta", label: "Freada em alta" },
                        ].map((item) => (
                          <div key={item.key} className="flex items-center space-x-2">
                            <Checkbox
                              id={`precompra-${item.key}`}
                              checked={checklistPreCompra[item.key as keyof typeof checklistPreCompra]}
                              onCheckedChange={(checked) =>
                                setChecklistPreCompra({ ...checklistPreCompra, [item.key]: checked === true })
                              }
                            />
                            <label htmlFor={`precompra-${item.key}`} className="text-sm cursor-pointer">
                              {item.label}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Parecer Final */}
                    <div className="space-y-3 border-t border-border pt-4">
                      <h4 className="font-semibold text-sm flex items-center gap-2">
                        📌 Parecer final
                      </h4>
                      <RadioGroup
                        value={parecerPreCompra}
                        onValueChange={(v) => setParecerPreCompra(v as typeof parecerPreCompra)}
                        className="space-y-2"
                      >
                        <div className="flex items-center space-x-3 p-3 rounded-lg border border-green-500/30 bg-green-500/10 hover:bg-green-500/20 transition-colors cursor-pointer">
                          <RadioGroupItem value="recomendada" id="parecer-recomendada" />
                          <label htmlFor="parecer-recomendada" className="flex items-center gap-2 cursor-pointer flex-1">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                            <span className="font-medium text-green-700">Compra recomendada</span>
                          </label>
                        </div>
                        <div className="flex items-center space-x-3 p-3 rounded-lg border border-yellow-500/30 bg-yellow-500/10 hover:bg-yellow-500/20 transition-colors cursor-pointer">
                          <RadioGroupItem value="ressalvas" id="parecer-ressalvas" />
                          <label htmlFor="parecer-ressalvas" className="flex items-center gap-2 cursor-pointer flex-1">
                            <AlertCircle className="w-5 h-5 text-yellow-600" />
                            <span className="font-medium text-yellow-700">Compra com ressalvas</span>
                          </label>
                        </div>
                        <div className="flex items-center space-x-3 p-3 rounded-lg border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 transition-colors cursor-pointer">
                          <RadioGroupItem value="nao_comprar" id="parecer-nao-comprar" />
                          <label htmlFor="parecer-nao-comprar" className="flex items-center gap-2 cursor-pointer flex-1">
                            <XCircle className="w-5 h-5 text-red-600" />
                            <span className="font-medium text-red-700">NÃO COMPRAR</span>
                          </label>
                        </div>
                      </RadioGroup>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>

        {/* Produtos Upsell */}
        <Collapsible open={produtosOpen} onOpenChange={setProdutosOpen}>
          <Card className="bg-card/50 border-border/50">
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                <CardTitle className="flex items-center justify-between text-lg">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Upsell
                    {produtosSelecionados.length > 0 && (
                      <Badge variant="secondary" className="ml-2">
                        {produtosSelecionados.length} | R$ {calcularTotalProdutos().toFixed(2)}
                      </Badge>
                    )}
                  </div>
                  {produtosOpen ? (
                    <ChevronUp className="w-5 h-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-muted-foreground" />
                  )}
                </CardTitle>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="pt-0 space-y-4">
                {/* Produtos Disponíveis */}
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground font-medium">Adicionar produto:</p>
                  <div className="flex flex-wrap gap-2">
                    {produtosUpsellDisponiveis
                      .filter(p => !produtosSelecionados.find(ps => ps.id === p.id))
                      .map(produto => (
                        <Button
                          key={produto.id}
                          variant="outline"
                          size="sm"
                          onClick={() => adicionarProdutoUpsell(produto)}
                          className="gap-2"
                        >
                          <Plus className="w-3 h-3" />
                          {produto.nome}
                          <span className="text-muted-foreground">R$ {produto.preco}</span>
                        </Button>
                      ))}
                  </div>
                </div>

                {/* Produtos Selecionados com Adicionais */}
                {produtosSelecionados.length > 0 ? (
                  <div className="space-y-3">
                    {produtosSelecionados.map(produto => (
                      <div key={produto.id} className="border border-border rounded-lg p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <TrendingUp className="w-5 h-5 text-primary" />
                            <div>
                              <p className="font-semibold">{produto.nome}</p>
                              <p className="text-sm text-muted-foreground">R$ {produto.preco.toFixed(2)}</p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removerProdutoUpsell(produto.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>

                        {/* Adicionais */}
                        <div className="pl-8 space-y-2">
                          <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                            <ChevronRight className="w-3 h-3" />
                            Serviços Adicionais:
                          </p>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                            {produto.adicionais.map(adicional => (
                              <button
                                key={adicional.id}
                                onClick={() => toggleAdicional(produto.id, adicional.id)}
                                className={`p-2 rounded-lg border text-left transition-all ${
                                  adicional.selecionado 
                                    ? 'border-primary bg-primary/10 ring-1 ring-primary' 
                                    : 'border-border hover:border-primary/50 hover:bg-muted/50'
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <span className="text-sm font-medium">{adicional.nome}</span>
                                  {adicional.selecionado && <CheckCircle className="w-4 h-4 text-primary" />}
                                </div>
                                <span className="text-xs text-muted-foreground">+ R$ {adicional.preco.toFixed(2)}</span>
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Subtotal do Produto */}
                        {produto.adicionais.some(u => u.selecionado) && (
                          <div className="pl-8 pt-2 border-t border-dashed">
                            <p className="text-sm">
                              Subtotal: <span className="font-semibold">
                                R$ {(produto.preco + produto.adicionais.filter(u => u.selecionado).reduce((t, u) => t + u.preco, 0)).toFixed(2)}
                              </span>
                            </p>
                          </div>
                        )}
                      </div>
                    ))}

                    {/* Total Geral */}
                    <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold">Total Upsell:</span>
                        <span className="text-xl font-bold text-primary">R$ {calcularTotalProdutos().toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6 text-muted-foreground">
                    <TrendingUp className="w-10 h-10 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Selecione produtos para sugerir ao cliente</p>
                  </div>
                )}
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
