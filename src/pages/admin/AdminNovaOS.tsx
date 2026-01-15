import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Save, Car, User, Phone, FileText, Loader2, Search } from "lucide-react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function AdminNovaOS() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const plate = searchParams.get("plate");
  const vehicle = searchParams.get("vehicle");
  const clientName = searchParams.get("client_name");
  const clientPhone = searchParams.get("client_phone");
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [formData, setFormData] = useState({
    plate: plate || "",
    vehicle: vehicle || "",
    client_name: clientName || "",
    client_phone: clientPhone || "",
    km_atual: "",
    descricao_problema: "",
  });

  // Buscar dados do veículo quando a placa mudar
  const searchByPlate = async (plateValue: string) => {
    if (plateValue.length < 7) return;
    
    setIsSearching(true);
    try {
      // Buscar na última OS desse veículo
      const { data: osData } = await supabase
        .from("ordens_servico")
        .select("plate, vehicle, client_name, client_phone, km_atual")
        .ilike("plate", plateValue)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (osData) {
        setFormData(prev => ({
          ...prev,
          vehicle: osData.vehicle || prev.vehicle,
          client_name: osData.client_name || prev.client_name,
          client_phone: osData.client_phone || prev.client_phone,
          km_atual: osData.km_atual || prev.km_atual,
        }));
        toast.success("Dados encontrados!");
      }
    } catch {
      // Silencioso - não encontrou dados anteriores
    } finally {
      setIsSearching(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePlateBlur = () => {
    if (formData.plate.length >= 7 && !formData.vehicle) {
      searchByPlate(formData.plate);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.plate.trim() || !formData.vehicle.trim()) {
      toast.error("Placa e veículo são obrigatórios");
      return;
    }

    setIsSubmitting(true);
    try {
      // Gerar número da OS
      const now = new Date();
      const numeroOS = `OS-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`;

      const { data, error } = await supabase
        .from("ordens_servico")
        .insert([{
          numero_os: numeroOS,
          plate: formData.plate.trim().toUpperCase(),
          vehicle: formData.vehicle.trim(),
          client_name: formData.client_name.trim() || null,
          client_phone: formData.client_phone.trim() || null,
          km_atual: formData.km_atual.trim() || null,
          descricao_problema: formData.descricao_problema.trim() || null,
          status: "diagnostico",
          data_entrada: new Date().toISOString(),
        }])
        .select()
        .single();

      if (error) throw error;

      toast.success("OS criada com sucesso!");
      navigate(`/admin/ordens-servico/${data.id}`);
    } catch (err: any) {
      console.error("Erro ao criar OS:", err);
      toast.error("Erro ao criar OS: " + (err.message || "Erro desconhecido"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AdminLayout>
      <div className="p-6 max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Nova Ordem de Serviço</h1>
            <p className="text-muted-foreground text-sm">Preencha os dados do veículo e cliente</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Car className="w-5 h-5" />
                Dados do Veículo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="plate">Placa *</Label>
                  <div className="relative">
                    <Input
                      id="plate"
                      name="plate"
                      placeholder="ABC-1234"
                      value={formData.plate}
                      onChange={handleChange}
                      onBlur={handlePlateBlur}
                      className="uppercase pr-10"
                    />
                    {isSearching ? (
                      <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-muted-foreground" />
                    ) : (
                      <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="km_atual">KM Atual</Label>
                  <Input
                    id="km_atual"
                    name="km_atual"
                    placeholder="Ex: 45.000"
                    value={formData.km_atual}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="vehicle">Veículo *</Label>
                <Input
                  id="vehicle"
                  name="vehicle"
                  placeholder="Ex: Volkswagen Golf GTI 2020"
                  value={formData.vehicle}
                  onChange={handleChange}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <User className="w-5 h-5" />
                Dados do Cliente
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="client_name">Nome do Cliente</Label>
                <Input
                  id="client_name"
                  name="client_name"
                  placeholder="Nome completo"
                  value={formData.client_name}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="client_phone">Telefone</Label>
                <Input
                  id="client_phone"
                  name="client_phone"
                  placeholder="(11) 99999-9999"
                  value={formData.client_phone}
                  onChange={handleChange}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileText className="w-5 h-5" />
                Descrição do Problema
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                name="descricao_problema"
                placeholder="Descreva o problema relatado pelo cliente ou observações iniciais..."
                rows={4}
                value={formData.descricao_problema}
                onChange={handleChange}
              />
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Button 
              type="button" 
              variant="outline" 
              className="flex-1"
              onClick={() => navigate(-1)}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              className="flex-1 gradient-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Criando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Criar OS
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
