import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, FolderPlus, FileText, Table, ListChecks, BarChart3, FileSpreadsheet } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const iconOptions = [
  { value: "FileText", label: "Documento", icon: FileText },
  { value: "Table", label: "Tabela", icon: Table },
  { value: "ListChecks", label: "Lista", icon: ListChecks },
  { value: "BarChart3", label: "Gráfico", icon: BarChart3 },
  { value: "FileSpreadsheet", label: "Planilha", icon: FileSpreadsheet },
  { value: "FolderPlus", label: "Pasta", icon: FolderPlus },
];

const colorOptions = [
  { value: "from-blue-500 to-blue-600", label: "Azul" },
  { value: "from-emerald-500 to-emerald-600", label: "Verde" },
  { value: "from-amber-500 to-amber-600", label: "Amarelo" },
  { value: "from-purple-500 to-purple-600", label: "Roxo" },
  { value: "from-rose-500 to-rose-600", label: "Rosa" },
  { value: "from-cyan-500 to-cyan-600", label: "Ciano" },
  { value: "from-orange-500 to-orange-600", label: "Laranja" },
  { value: "from-indigo-500 to-indigo-600", label: "Índigo" },
];

interface AddDirectoryDialogProps {
  onSuccess?: () => void;
}

export function AddDirectoryDialog({ onSuccess }: AddDirectoryDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [icone, setIcone] = useState("FileText");
  const [cor, setCor] = useState("from-blue-500 to-blue-600");
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim()) {
      toast.error("Nome é obrigatório");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from("gestao_dashboards").insert({
        nome: nome.trim(),
        descricao: descricao.trim() || null,
        icone,
        cor,
        user_id: user?.id,
        ativo: true,
      });

      if (error) throw error;

      toast.success("Diretório criado com sucesso!");
      setNome("");
      setDescricao("");
      setIcone("FileText");
      setCor("from-blue-500 to-blue-600");
      setOpen(false);
      onSuccess?.();
    } catch (error: any) {
      console.error("Error creating directory:", error);
      toast.error("Erro ao criar diretório");
    } finally {
      setLoading(false);
    }
  };

  const SelectedIcon = iconOptions.find(i => i.value === icone)?.icon || FileText;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="lg"
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50"
        >
          <Plus className="w-6 h-6" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FolderPlus className="w-5 h-5" />
            Novo Diretório
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome *</Label>
            <Input
              id="nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Documentos, Planilhas, Relatórios..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea
              id="descricao"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Descrição opcional do diretório"
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Ícone</Label>
              <Select value={icone} onValueChange={setIcone}>
                <SelectTrigger>
                  <SelectValue>
                    <div className="flex items-center gap-2">
                      <SelectedIcon className="w-4 h-4" />
                      <span>{iconOptions.find(i => i.value === icone)?.label}</span>
                    </div>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {iconOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        <option.icon className="w-4 h-4" />
                        <span>{option.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Cor</Label>
              <Select value={cor} onValueChange={setCor}>
                <SelectTrigger>
                  <SelectValue>
                    <div className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded bg-gradient-to-br ${cor}`} />
                      <span>{colorOptions.find(c => c.value === cor)?.label}</span>
                    </div>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {colorOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        <div className={`w-4 h-4 rounded bg-gradient-to-br ${option.value}`} />
                        <span>{option.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Preview */}
          <div className="p-4 border rounded-lg bg-muted/30">
            <p className="text-xs text-muted-foreground mb-2">Preview:</p>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${cor} flex items-center justify-center`}>
                <SelectedIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-medium">{nome || "Nome do diretório"}</p>
                <p className="text-xs text-muted-foreground">{descricao || "Descrição"}</p>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Criando..." : "Criar Diretório"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
