import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, LayoutDashboard, Settings, Eye, Trash2, GripVertical } from "lucide-react";

interface Dashboard {
  id: string;
  nome: string;
  descricao: string | null;
  icone: string;
  cor: string;
  ordem: number;
  ativo: boolean;
  created_at: string;
}

export default function GestaoDashboards() {
  const navigate = useNavigate();
  const [dashboards, setDashboards] = useState<Dashboard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newDashboard, setNewDashboard] = useState({
    nome: "",
    descricao: "",
    cor: "#3b82f6",
  });

  useEffect(() => {
    fetchDashboards();
  }, []);

  async function fetchDashboards() {
    try {
      const { data, error } = await supabase
        .from("gestao_dashboards")
        .select("*")
        .order("ordem", { ascending: true });

      if (error) throw error;
      setDashboards(data || []);
    } catch (err) {
      console.error("Erro ao carregar dashboards:", err);
      toast.error("Erro ao carregar dashboards");
    } finally {
      setIsLoading(false);
    }
  }

  async function createDashboard() {
    if (!newDashboard.nome.trim()) {
      toast.error("Nome é obrigatório");
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Usuário não autenticado");
        return;
      }

      const { error } = await supabase.from("gestao_dashboards").insert({
        nome: newDashboard.nome,
        descricao: newDashboard.descricao || null,
        cor: newDashboard.cor,
        ordem: dashboards.length,
        user_id: user.id,
      });

      if (error) throw error;

      toast.success("Dashboard criado!");
      setIsDialogOpen(false);
      setNewDashboard({ nome: "", descricao: "", cor: "#3b82f6" });
      fetchDashboards();
    } catch (err) {
      console.error("Erro ao criar dashboard:", err);
      toast.error("Erro ao criar dashboard");
    }
  }

  async function deleteDashboard(id: string) {
    if (!confirm("Tem certeza que deseja excluir este dashboard?")) return;

    try {
      const { error } = await supabase
        .from("gestao_dashboards")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast.success("Dashboard excluído");
      fetchDashboards();
    } catch (err) {
      console.error("Erro ao excluir dashboard:", err);
      toast.error("Erro ao excluir dashboard");
    }
  }

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-full">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Gestão - Dashboards</h1>
            <p className="text-muted-foreground">Crie e gerencie seus indicadores personalizados</p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Novo Dashboard
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Criar Novo Dashboard</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome</Label>
                  <Input
                    id="nome"
                    placeholder="Ex: Marketing, SLA, Vendas..."
                    value={newDashboard.nome}
                    onChange={(e) => setNewDashboard({ ...newDashboard, nome: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="descricao">Descrição</Label>
                  <Textarea
                    id="descricao"
                    placeholder="Descrição opcional do dashboard"
                    value={newDashboard.descricao}
                    onChange={(e) => setNewDashboard({ ...newDashboard, descricao: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cor">Cor</Label>
                  <div className="flex gap-2">
                    <Input
                      id="cor"
                      type="color"
                      value={newDashboard.cor}
                      onChange={(e) => setNewDashboard({ ...newDashboard, cor: e.target.value })}
                      className="w-16 h-10 p-1 cursor-pointer"
                    />
                    <Input
                      value={newDashboard.cor}
                      onChange={(e) => setNewDashboard({ ...newDashboard, cor: e.target.value })}
                      className="flex-1"
                    />
                  </div>
                </div>
                <Button onClick={createDashboard} className="w-full">
                  Criar Dashboard
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Dashboards Grid */}
        {dashboards.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-12 text-center">
              <LayoutDashboard className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                Nenhum dashboard criado
              </h3>
              <p className="text-muted-foreground mb-4">
                Crie seu primeiro dashboard para começar a monitorar indicadores
              </p>
              <Button onClick={() => setIsDialogOpen(true)} variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Criar Primeiro Dashboard
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {dashboards.map((dashboard) => (
              <Card
                key={dashboard.id}
                className="group relative overflow-hidden hover:shadow-lg transition-all cursor-pointer"
                style={{ borderLeftColor: dashboard.cor, borderLeftWidth: "4px" }}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `${dashboard.cor}20` }}
                      >
                        <LayoutDashboard className="w-5 h-5" style={{ color: dashboard.cor }} />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{dashboard.nome}</CardTitle>
                        {dashboard.descricao && (
                          <p className="text-sm text-muted-foreground line-clamp-1">
                            {dashboard.descricao}
                          </p>
                        )}
                      </div>
                    </div>
                    <GripVertical className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity cursor-grab" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 mt-2">
                    <Button
                      size="sm"
                      variant="default"
                      className="flex-1"
                      onClick={() => navigate(`/gestao/dashboard/${dashboard.id}`)}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Ver
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => navigate(`/gestao/dashboard/${dashboard.id}/editar`)}
                    >
                      <Settings className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-destructive hover:text-destructive"
                      onClick={() => deleteDashboard(dashboard.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
