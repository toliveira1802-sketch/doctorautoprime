import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon, Search, Plus, User, Car, Loader2 } from "lucide-react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";

interface ClientWithVehicle {
  id: string;
  user_id: string;
  name: string;
  phone: string;
  plate: string;
  vehicle_id: string;
}

const timeSlots = [
  "08:00", "08:30", "09:00", "09:30", "10:00", "10:30",
  "11:00", "11:30", "13:00", "13:30", "14:00", "14:30",
  "15:00", "15:30", "16:00", "16:30", "17:00", "17:30"
];

export default function AdminNovaOS() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClient, setSelectedClient] = useState<ClientWithVehicle | null>(null);
  const [date, setDate] = useState<Date>();
  const [time, setTime] = useState<string>("");
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
      // Get current user to use as admin creating the client
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      // Create a temporary user_id for the client (in a real scenario, you'd create an auth user)
      // For now, we'll use the admin's user_id and create the profile/vehicle
      // This is a simplified approach - ideally you'd have a proper user creation flow
      
      // First check if there's an existing profile with this phone
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
        
        // Update the profile name if needed
        await supabase
          .from("profiles")
          .update({ full_name: newClientName })
          .eq("id", profileId);
      } else {
        // For admin-created clients without auth, we'll use a generated UUID
        // In production, you might want to invite the user via email/SMS
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

      // Create vehicle if plate is provided
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

      // Refresh the clients list
      await queryClient.invalidateQueries({ queryKey: ["admin-clients-vehicles"] });

      // Auto-select the new client
      setSelectedClient({
        id: `${profileId}-${vehicleId}`,
        user_id: userId,
        name: newClientName,
        phone: newClientPhone,
        plate: newClientPlate || "Sem veículo",
        vehicle_id: vehicleId,
      });

      // Close dialog and reset form
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
    if (!date) {
      toast.error("Selecione uma data");
      return;
    }
    if (!time) {
      toast.error("Selecione um horário");
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.from("appointments").insert({
        user_id: selectedClient.user_id,
        vehicle_id: selectedClient.vehicle_id || null,
        appointment_date: format(date, "yyyy-MM-dd"),
        appointment_time: time,
        notes: notes || null,
        status: "pendente",
      });

      if (error) throw error;

      toast.success("OS criada com sucesso!");
      navigate("/admin/agendamentos");
    } catch (error) {
      console.error("Error creating OS:", error);
      toast.error("Erro ao criar OS. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">Nova OS</h1>
          <Button
            variant="outline"
            onClick={() => setShowNewClientDialog(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Novo Cliente
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Cliente */}
          <Card className="bg-card/50 border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <User className="w-5 h-5" />
                Cliente
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedClient ? (
                <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-foreground">{selectedClient.name}</p>
                      <p className="text-sm text-muted-foreground">{selectedClient.phone}</p>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Car className="w-3 h-3" /> {selectedClient.plate}
                      </p>
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
                      className="pl-10"
                    />
                  </div>

                  {isSearching && searchQuery && (
                    <div className="border border-border rounded-lg overflow-hidden max-h-60 overflow-y-auto">
                      {filteredClients.length > 0 ? (
                        filteredClients.map((client) => (
                          <button
                            key={client.id}
                            onClick={() => handleSelectClient(client)}
                            className="w-full p-3 text-left hover:bg-muted/50 border-b border-border last:border-0 transition-colors"
                          >
                            <p className="font-medium text-foreground">{client.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {client.phone} • {client.plate}
                            </p>
                          </button>
                        ))
                      ) : (
                        <div className="p-4 text-center">
                          <p className="text-muted-foreground text-sm">Nenhum cliente encontrado</p>
                          <Button 
                            variant="link" 
                            size="sm" 
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
                </div>
              )}
            </CardContent>
          </Card>

          {/* Data e Hora */}
          <Card className="bg-card/50 border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <CalendarIcon className="w-5 h-5" />
                Data e Hora
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Data</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP", { locale: ptBR }) : "Selecionar data"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      disabled={(date) => date < new Date()}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>Horário</Label>
                <Select value={time} onValueChange={setTime}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar horário" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeSlots.map((slot) => (
                      <SelectItem key={slot} value={slot}>
                        {slot}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Observações */}
          <Card className="bg-card/50 border-border/50 md:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg">Observações</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Observações iniciais (opcional)..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="min-h-[120px]"
              />
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          <Button
            variant="outline"
            onClick={() => navigate("/admin/agendamentos")}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Criando...
              </>
            ) : (
              "Criar OS"
            )}
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
                    placeholder="Ex: Civic, Corolla..."
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
                  Salvando...
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
