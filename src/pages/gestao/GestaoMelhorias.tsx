import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, Lightbulb, Clock, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Sugestao {
  id: string;
  titulo: string;
  descricao: string;
  categoria: string;
  status: string;
  prioridade: string;
  created_at: string;
  user_id: string;
}

const CATEGORIAS = [
  { value: "geral", label: "Geral" },
  { value: "interface", label: "Interface" },
  { value: "funcionalidade", label: "Funcionalidade" },
  { value: "performance", label: "Performance" },
  { value: "seguranca", label: "Segurança" },
];

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  pendente: { label: "Pendente", color: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20", icon: Clock },
  em_analise: { label: "Em Análise", color: "bg-blue-500/10 text-blue-600 border-blue-500/20", icon: Loader2 },
  aprovado: { label: "Aprovado", color: "bg-green-500/10 text-green-600 border-green-500/20", icon: CheckCircle },
  rejeitado: { label: "Rejeitado", color: "bg-red-500/10 text-red-600 border-red-500/20", icon: XCircle },
  implementado: { label: "Implementado", color: "bg-purple-500/10 text-purple-600 border-purple-500/20", icon: CheckCircle },
};

export default function GestaoMelhorias() {
  const { user } = useAuth();
  const [sugestoes, setSugestoes] = useState<Sugestao[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    titulo: "",
    descricao: "",
    categoria: "geral",
  });

  useEffect(() => {
    fetchSugestoes();
  }, []);

  async function fetchSugestoes() {
    try {
      const { data, error } = await supabase
        .from("melhorias_sugestoes")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setSugestoes(data || []);
    } catch (err) {
      console.error("Erro ao carregar sugestões:", err);
      toast.error("Erro ao carregar sugestões");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!formData.titulo.trim() || !formData.descricao.trim()) {
      toast.error("Preencha todos os campos");
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("melhorias_sugestoes").insert({
        user_id: user?.id,
        titulo: formData.titulo.trim(),
        descricao: formData.descricao.trim(),
        categoria: formData.categoria,
      });

      if (error) throw error;

      toast.success("Sugestão enviada com sucesso!");
      setFormData({ titulo: "", descricao: "", categoria: "geral" });
      setShowForm(false);
      fetchSugestoes();
    } catch (err) {
      console.error("Erro ao enviar sugestão:", err);
      toast.error("Erro ao enviar sugestão");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleUpdateStatus(id: string, newStatus: string) {
    try {
      const { error } = await supabase
        .from("melhorias_sugestoes")
        .update({ status: newStatus })
        .eq("id", id);

      if (error) throw error;
      toast.success("Status atualizado!");
      fetchSugestoes();
    } catch (err) {
      console.error("Erro ao atualizar status:", err);
      toast.error("Erro ao atualizar status");
    }
  }

  return (
    <AdminLayout>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Lightbulb className="w-6 h-6 text-yellow-500" />
              Sugestões de Melhorias
            </h1>
            <p className="text-muted-foreground mt-1">
              Envie suas ideias para melhorar o sistema
            </p>
          </div>
          <Button onClick={() => setShowForm(!showForm)}>
            <Plus className="w-4 h-4 mr-2" />
            Nova Sugestão
          </Button>
        </div>

        {/* Form */}
        {showForm && (
          <Card className="border-primary/20 bg-primary/5 mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Nova Sugestão</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="titulo">Título</Label>
                    <Input
                      id="titulo"
                      placeholder="Ex: Adicionar filtro de data"
                      value={formData.titulo}
                      onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Categoria</Label>
                    <Select
                      value={formData.categoria}
                      onValueChange={(value) => setFormData({ ...formData, categoria: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIAS.map((cat) => (
                          <SelectItem key={cat.value} value={cat.value}>
                            {cat.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="descricao">Descrição</Label>
                  <Textarea
                    id="descricao"
                    placeholder="Descreva sua sugestão em detalhes..."
                    rows={4}
                    value={formData.descricao}
                    onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  />
                </div>

                <div className="flex gap-2 justify-end">
                  <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      "Enviar Sugestão"
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Lista de sugestões */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : sugestoes.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-12 text-center">
              <Lightbulb className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                Nenhuma sugestão ainda
              </h3>
              <p className="text-muted-foreground mb-4">
                Seja o primeiro a enviar uma ideia de melhoria!
              </p>
              <Button onClick={() => setShowForm(true)} variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Sugestão
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {sugestoes.map((sugestao) => {
              const statusConfig = STATUS_CONFIG[sugestao.status] || STATUS_CONFIG.pendente;
              const StatusIcon = statusConfig.icon;
              const categoriaLabel = CATEGORIAS.find((c) => c.value === sugestao.categoria)?.label || sugestao.categoria;

              return (
                <Card key={sugestao.id} className="group hover:shadow-md transition-shadow">
                  <CardContent className="py-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-2">
                          <h3 className="font-semibold text-foreground">{sugestao.titulo}</h3>
                          <Badge variant="outline" className={statusConfig.color}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {statusConfig.label}
                          </Badge>
                          <Badge variant="secondary">{categoriaLabel}</Badge>
                        </div>
                        <p className="text-muted-foreground text-sm mb-2">{sugestao.descricao}</p>
                        <p className="text-xs text-muted-foreground">
                          Enviado em {format(new Date(sugestao.created_at), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
                        </p>
                      </div>

                      {/* Admin controls */}
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <Select
                          value={sugestao.status}
                          onValueChange={(value) => handleUpdateStatus(sugestao.id, value)}
                        >
                          <SelectTrigger className="w-36">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pendente">Pendente</SelectItem>
                            <SelectItem value="em_analise">Em Análise</SelectItem>
                            <SelectItem value="aprovado">Aprovado</SelectItem>
                            <SelectItem value="rejeitado">Rejeitado</SelectItem>
                            <SelectItem value="implementado">Implementado</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
