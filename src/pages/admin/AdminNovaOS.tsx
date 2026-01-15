import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Plus, User, Car, Loader2, FileText, Trash2, Wrench, Package } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  vehicle_id: string;
}

interface OrcamentoItem {
  id: string;
  tipo: "servico" | "peca";
  descricao: string;
  quantidade: number;
  valor_unitario: number;
  valor_total: number;
}

export default function AdminNovaOS() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClient, setSelectedClient] = useState<ClientWithVehicle | null>(null);
  const [notes, setNotes] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // New client dialog state
  const [showNewClientDialog, setShowNewClientDialog] = useState(false);
  const [newClientName, setNewClientName] = useState("");
  const [newClientPhone, setNewClientPhone] = useState("");
  const [newClientPlate, setNewClientPlate] = useState("");
  const [newClientModel, setNewClientModel] = useState("");
  const [isCreatingClient, setIsCreatingClient] = useState(false);

  // Orçamento items state
  const [itensOrcamento, setItensOrcamento] = useState<OrcamentoItem[]>([]);
  const [showAddItemDialog, setShowAddItemDialog] = useState(false);
  const [newItemTipo, setNewItemTipo] = useState<"servico" | "peca">("servico");
  const [newItemDescricao, setNewItemDescricao] = useState("");
  const [newItemQuantidade, setNewItemQuantidade] = useState(1);
  const [newItemValorUnitario, setNewItemValorUnitario] = useState("");

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
        .select("id, user_id, plate, model, brand");

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

  // Handle add item to orçamento
  const handleAddItem = () => {
    if (!newItemDescricao.trim()) {
      toast.error("Descrição é obrigatória");
      return;
    }

    const valorUnitario = parseFloat(newItemValorUnitario.replace(",", ".")) || 0;
    const valorTotal = valorUnitario * newItemQuantidade;

    const newItem: OrcamentoItem = {
      id: crypto.randomUUID(),
      tipo: newItemTipo,
      descricao: newItemDescricao,
      quantidade: newItemQuantidade,
      valor_unitario: valorUnitario,
      valor_total: valorTotal,
    };

    setItensOrcamento([...itensOrcamento, newItem]);
    setShowAddItemDialog(false);
    resetItemForm();
    toast.success("Item adicionado ao orçamento");
  };

  const resetItemForm = () => {
    setNewItemTipo("servico");
    setNewItemDescricao("");
    setNewItemQuantidade(1);
    setNewItemValorUnitario("");
  };

  const handleRemoveItem = (itemId: string) => {
    setItensOrcamento(itensOrcamento.filter(item => item.id !== itemId));
    toast.success("Item removido");
  };

  const totalOrcamento = itensOrcamento.reduce((acc, item) => acc + item.valor_total, 0);

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
      // Create OS
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
          valor_orcado: totalOrcamento,
        }])
        .select()
        .single();

      if (osError) throw osError;

      // Insert items if any
      if (itensOrcamento.length > 0) {
        const itensToInsert = itensOrcamento.map(item => ({
          ordem_servico_id: osData.id,
          tipo: item.tipo,
          descricao: item.descricao,
          quantidade: item.quantidade,
          valor_unitario: item.valor_unitario,
          valor_total: item.valor_total,
          status: "pendente",
        }));

        const { error: itensError } = await supabase
          .from("ordens_servico_itens")
          .insert(itensToInsert);

        if (itensError) throw itensError;
      }

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
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div>
                      <p className="font-semibold text-foreground text-lg">{selectedClient.name}</p>
                      <p className="text-sm text-muted-foreground">{selectedClient.phone}</p>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-background/50 rounded-lg">
                      <Car className="w-4 h-4 text-primary" />
                      <div>
                        <p className="font-medium text-foreground">{selectedClient.plate}</p>
                        {selectedClient.model && (
                          <p className="text-xs text-muted-foreground">
                            {selectedClient.brand} {selectedClient.model}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedClient(null)}
                  >
                    Trocar
                  </Button>
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

        {/* Orçamento - Itens */}
        <Card className="bg-card/50 border-border/50">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileText className="w-5 h-5" />
              Itens do Orçamento
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAddItemDialog(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Item
            </Button>
          </CardHeader>
          <CardContent>
            {itensOrcamento.length > 0 ? (
              <div className="space-y-4">
                <div className="rounded-lg border border-border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/30">
                        <TableHead className="w-[80px]">Tipo</TableHead>
                        <TableHead>Descrição</TableHead>
                        <TableHead className="text-center w-[80px]">Qtd</TableHead>
                        <TableHead className="text-right w-[120px]">Unitário</TableHead>
                        <TableHead className="text-right w-[120px]">Total</TableHead>
                        <TableHead className="w-[60px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {itensOrcamento.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              {item.tipo === "servico" ? (
                                <Wrench className="w-4 h-4 text-blue-500" />
                              ) : (
                                <Package className="w-4 h-4 text-amber-500" />
                              )}
                              <span className="text-xs capitalize">{item.tipo}</span>
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">{item.descricao}</TableCell>
                          <TableCell className="text-center">{item.quantidade}</TableCell>
                          <TableCell className="text-right">
                            R$ {item.valor_unitario.toFixed(2)}
                          </TableCell>
                          <TableCell className="text-right font-semibold">
                            R$ {item.valor_total.toFixed(2)}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={() => handleRemoveItem(item.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                <div className="flex justify-end">
                  <div className="bg-primary/10 border border-primary/20 rounded-lg px-6 py-3">
                    <span className="text-sm text-muted-foreground mr-3">Total do Orçamento:</span>
                    <span className="text-xl font-bold text-primary">
                      R$ {totalOrcamento.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
                <p className="text-muted-foreground">Nenhum item adicionado</p>
                <p className="text-sm text-muted-foreground/70 mt-1">
                  Clique em "Adicionar Item" para incluir serviços ou peças
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Observações */}
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

        {/* Actions */}
        <div className="flex gap-3">
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
                Abrir OS {itensOrcamento.length > 0 && `(R$ ${totalOrcamento.toFixed(2)})`}
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

      {/* Add Item Dialog */}
      <Dialog open={showAddItemDialog} onOpenChange={setShowAddItemDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Adicionar Item ao Orçamento</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Tipo *</Label>
              <Select value={newItemTipo} onValueChange={(v: "servico" | "peca") => setNewItemTipo(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="servico">
                    <div className="flex items-center gap-2">
                      <Wrench className="w-4 h-4 text-blue-500" />
                      Serviço
                    </div>
                  </SelectItem>
                  <SelectItem value="peca">
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4 text-amber-500" />
                      Peça
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="item-descricao">Descrição *</Label>
              <Input
                id="item-descricao"
                placeholder={newItemTipo === "servico" ? "Ex: Troca de óleo" : "Ex: Filtro de óleo"}
                value={newItemDescricao}
                onChange={(e) => setNewItemDescricao(e.target.value)}
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="item-quantidade">Quantidade</Label>
                <Input
                  id="item-quantidade"
                  type="number"
                  min="1"
                  value={newItemQuantidade}
                  onChange={(e) => setNewItemQuantidade(parseInt(e.target.value) || 1)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="item-valor">Valor Unitário (R$)</Label>
                <Input
                  id="item-valor"
                  placeholder="0,00"
                  value={newItemValorUnitario}
                  onChange={(e) => setNewItemValorUnitario(e.target.value)}
                />
              </div>
            </div>
            {newItemValorUnitario && (
              <div className="p-3 bg-muted/50 rounded-lg">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total do item:</span>
                  <span className="font-semibold">
                    R$ {((parseFloat(newItemValorUnitario.replace(",", ".")) || 0) * newItemQuantidade).toFixed(2)}
                  </span>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowAddItemDialog(false);
                resetItemForm();
              }}
            >
              Cancelar
            </Button>
            <Button onClick={handleAddItem}>
              <Plus className="w-4 h-4 mr-2" />
              Adicionar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
