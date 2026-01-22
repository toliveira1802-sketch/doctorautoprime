import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Search, Plus, Pencil, User, Car } from "lucide-react";
import { format } from "date-fns";

interface Profile {
  id: string;
  user_id: string;
  full_name: string | null;
  phone: string | null;
  cpf: string | null;
  birthday: string | null;
  loyalty_points: number | null;
  loyalty_level: string | null;
  tags: string[] | null;
  internal_notes: string | null;
  created_at: string;
}

interface Vehicle {
  plate: string;
}

export default function AdminClientes() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCreateMode, setIsCreateMode] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Profile | null>(null);
  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    cpf: "",
    birthday: "",
    loyalty_level: "bronze",
    tags: "",
    internal_notes: "",
  });

  // Buscar clientes com seus veículos
  const { data: clients = [], isLoading } = useQuery({
    queryKey: ["admin-clients"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select(`
          *,
          vehicles (plate)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data || []) as any[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (newClient: Partial<Profile>) => {
      // Criar usuário auth primeiro
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: `${newClient.phone}@temp.com`, // Email temporário
        password: Math.random().toString(36).slice(-8),
        options: {
          data: {
            full_name: newClient.full_name,
            phone: newClient.phone,
          }
        }
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error("Falha ao criar usuário");

      // Atualizar perfil
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          full_name: newClient.full_name,
          phone: newClient.phone,
          cpf: newClient.cpf,
          birthday: newClient.birthday,
          loyalty_level: newClient.loyalty_level || "bronze",
          loyalty_points: 0,
          tags: newClient.tags,
          internal_notes: newClient.internal_notes,
        })
        .eq("user_id", authData.user.id);

      if (profileError) throw profileError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-clients"] });
      toast.success("Cliente criado com sucesso!");
      handleCloseDialog();
    },
    onError: (error) => {
      toast.error("Erro ao criar cliente: " + error.message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: { id: string; updates: Partial<Profile> }) => {
      const { error } = await supabase
        .from("profiles")
        .update(data.updates)
        .eq("id", data.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-clients"] });
      toast.success("Cliente atualizado com sucesso!");
      handleCloseDialog();
    },
    onError: (error) => {
      toast.error("Erro ao atualizar cliente: " + error.message);
    },
  });

  const filteredClients = clients.filter((client) => {
    const searchLower = search.toLowerCase();
    const plateMatch = client.vehicles?.some(v =>
      v.plate?.toLowerCase().includes(searchLower)
    );
    return (
      client.full_name?.toLowerCase().includes(searchLower) ||
      client.phone?.includes(search) ||
      plateMatch
    );
  });

  const handleOpenCreate = () => {
    setIsCreateMode(true);
    setSelectedClient(null);
    setFormData({
      full_name: "",
      phone: "",
      cpf: "",
      birthday: "",
      loyalty_level: "bronze",
      tags: "",
      internal_notes: "",
    });
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (client: Profile & { vehicles: Vehicle[] }) => {
    setIsCreateMode(false);
    setSelectedClient(client);
    setFormData({
      full_name: client.full_name || "",
      phone: client.phone || "",
      cpf: client.cpf || "",
      birthday: client.birthday || "",
      loyalty_level: client.loyalty_level || "bronze",
      tags: client.tags?.join(", ") || "",
      internal_notes: client.internal_notes || "",
    });
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setIsCreateMode(false);
    setSelectedClient(null);
    setFormData({
      full_name: "",
      phone: "",
      cpf: "",
      birthday: "",
      loyalty_level: "bronze",
      tags: "",
      internal_notes: "",
    });
  };

  const handleSubmit = () => {
    if (isCreateMode) {
      const newClient: Partial<Profile> = {
        full_name: formData.full_name || null,
        phone: formData.phone || null,
        cpf: formData.cpf || null,
        birthday: formData.birthday || null,
        loyalty_level: formData.loyalty_level,
        tags: formData.tags ? formData.tags.split(",").map((t) => t.trim()) : [],
        internal_notes: formData.internal_notes || null,
      };
      createMutation.mutate(newClient);
    } else if (selectedClient) {
      const updates: Partial<Profile> = {
        full_name: formData.full_name || null,
        phone: formData.phone || null,
        cpf: formData.cpf || null,
        birthday: formData.birthday || null,
        loyalty_level: formData.loyalty_level,
        tags: formData.tags ? formData.tags.split(",").map((t) => t.trim()) : [],
        internal_notes: formData.internal_notes || null,
      };
      updateMutation.mutate({ id: selectedClient.id, updates });
    }
  };

  const getLoyaltyBadgeColor = (level: string | null) => {
    switch (level) {
      case "gold":
        return "bg-yellow-500 text-yellow-950";
      case "silver":
        return "bg-gray-400 text-gray-950";
      case "bronze":
      default:
        return "bg-orange-600 text-orange-50";
    }
  };

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Clientes</h1>
            <p className="text-muted-foreground">
              Gerencie os clientes cadastrados
            </p>
          </div>
          <Button onClick={handleOpenCreate} className="gap-2">
            <Plus className="w-4 h-4" />
            Novo Cliente
          </Button>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, telefone ou placa..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Badge variant="secondary">{filteredClients.length} clientes</Badge>
        </div>

        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead>Placa</TableHead>
                <TableHead>Pontos</TableHead>
                <TableHead>Nível</TableHead>
                <TableHead>Cadastro</TableHead>
                <TableHead className="w-[100px]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    Carregando...
                  </TableCell>
                </TableRow>
              ) : filteredClients.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <User className="h-8 w-8" />
                      <p>Nenhum cliente encontrado</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredClients.map((client) => (
                  <TableRow key={client.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">
                          {client.full_name || "Sem nome"}
                        </p>
                        {client.tags && client.tags.length > 0 && (
                          <div className="flex gap-1 mt-1">
                            {client.tags.slice(0, 2).map((tag) => (
                              <Badge
                                key={tag}
                                variant="outline"
                                className="text-xs"
                              >
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{client.phone || "-"}</TableCell>
                    <TableCell>
                      {client.vehicles && client.vehicles.length > 0 ? (
                        <div className="flex items-center gap-1">
                          <Car className="w-3 h-3 text-muted-foreground" />
                          <span className="font-mono text-sm">
                            {client.vehicles[0].plate}
                          </span>
                          {client.vehicles.length > 1 && (
                            <Badge variant="secondary" className="text-xs">
                              +{client.vehicles.length - 1}
                            </Badge>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="font-semibold">
                        {client.loyalty_points || 0}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge className={getLoyaltyBadgeColor(client.loyalty_level)}>
                        {client.loyalty_level || "bronze"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {format(new Date(client.created_at), "dd/MM/yyyy")}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenEdit(client)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Create/Edit Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {isCreateMode ? "Novo Cliente" : "Editar Cliente"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="full_name">Nome Completo *</Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) =>
                    setFormData({ ...formData, full_name: e.target.value })
                  }
                  placeholder="Nome completo do cliente"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone *</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    placeholder="(11) 99999-9999"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cpf">CPF</Label>
                  <Input
                    id="cpf"
                    value={formData.cpf}
                    onChange={(e) =>
                      setFormData({ ...formData, cpf: e.target.value })
                    }
                    placeholder="000.000.000-00"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="birthday">Data de Nascimento</Label>
                  <Input
                    id="birthday"
                    type="date"
                    value={formData.birthday}
                    onChange={(e) =>
                      setFormData({ ...formData, birthday: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="loyalty_level">Nível de Fidelidade</Label>
                  <Select
                    value={formData.loyalty_level}
                    onValueChange={(value) =>
                      setFormData({ ...formData, loyalty_level: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bronze">Bronze</SelectItem>
                      <SelectItem value="silver">Prata</SelectItem>
                      <SelectItem value="gold">Ouro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="tags">Tags (separadas por vírgula)</Label>
                <Input
                  id="tags"
                  value={formData.tags}
                  onChange={(e) =>
                    setFormData({ ...formData, tags: e.target.value })
                  }
                  placeholder="VIP, Recorrente, Indicação..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="internal_notes">Notas Internas</Label>
                <Textarea
                  id="internal_notes"
                  value={formData.internal_notes}
                  onChange={(e) =>
                    setFormData({ ...formData, internal_notes: e.target.value })
                  }
                  placeholder="Observações sobre o cliente..."
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={handleCloseDialog}>
                Cancelar
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={updateMutation.isPending || createMutation.isPending}
              >
                {updateMutation.isPending || createMutation.isPending
                  ? "Salvando..."
                  : isCreateMode
                    ? "Criar Cliente"
                    : "Salvar"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
