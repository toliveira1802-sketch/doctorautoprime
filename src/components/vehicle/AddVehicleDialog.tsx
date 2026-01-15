import { useState } from "react";
import { Car, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface AddVehicleDialogProps {
  onVehicleAdded?: () => void;
  trigger?: React.ReactNode;
}

export function AddVehicleDialog({ onVehicleAdded, trigger }: AddVehicleDialogProps) {
  const [open, setOpen] = useState(false);
  const [model, setModel] = useState("");
  const [plate, setPlate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formatPlate = (value: string) => {
    const cleaned = value.toUpperCase().replace(/[^A-Z0-9]/g, "");
    
    if (cleaned.length <= 3) {
      return cleaned;
    } else if (cleaned.length <= 7) {
      return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
    }
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 7)}`;
  };

  const handlePlateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPlate(formatPlate(e.target.value));
  };

  const validatePlate = (plate: string) => {
    const cleaned = plate.replace(/[^A-Z0-9]/gi, "");
    return /^[A-Z]{3}[0-9]{4}$/.test(cleaned) || /^[A-Z]{3}[0-9][A-Z][0-9]{2}$/.test(cleaned);
  };

  const handleSubmit = async () => {
    if (!model.trim()) {
      toast.error("Informe o modelo do veículo");
      return;
    }
    
    if (!validatePlate(plate)) {
      toast.error("Placa inválida. Use o formato ABC-1234");
      return;
    }

    setIsSubmitting(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Você precisa estar logado");
        return;
      }

      const plateClean = plate.replace(/[^A-Z0-9]/gi, "").toUpperCase();
      
      const { error } = await supabase
        .from("vehicles")
        .insert({
          user_id: user.id,
          model: model.trim(),
          plate: plateClean,
        });

      if (error) {
        if (error.code === "23505") {
          toast.error("Esta placa já está cadastrada");
        } else {
          throw error;
        }
        return;
      }
      
      toast.success("Veículo cadastrado com sucesso!");
      setModel("");
      setPlate("");
      setOpen(false);
      onVehicleAdded?.();
    } catch (error) {
      console.error("Error adding vehicle:", error);
      toast.error("Erro ao cadastrar veículo");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <button className="w-full p-4 rounded-xl border-2 border-dashed border-primary/30 flex items-center justify-center gap-3 text-primary hover:bg-primary/5 transition-colors">
            <Plus className="w-5 h-5" />
            <span className="font-medium">Adicionar Veículo</span>
          </button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Car className="w-5 h-5 text-primary" />
            Cadastrar Veículo
          </DialogTitle>
          <DialogDescription>
            Informe os dados do seu veículo para agendar serviços.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="model">Modelo do veículo *</Label>
            <Input
              id="model"
              placeholder="Ex: Civic, Corolla, HB20..."
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="h-12"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="plate">Placa *</Label>
            <Input
              id="plate"
              placeholder="ABC-1234"
              value={plate}
              onChange={handlePlateChange}
              maxLength={8}
              className="h-12 uppercase"
              required
            />
            <p className="text-xs text-muted-foreground">
              Formatos aceitos: ABC-1234 ou ABC1D23
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !model.trim() || !plate.trim()}
          >
            {isSubmitting ? "Salvando..." : "Cadastrar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
