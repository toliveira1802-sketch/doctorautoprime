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

interface AddVehicleDialogProps {
  onVehicleAdded: (vehicle: { model: string; plate: string }) => void;
  trigger?: React.ReactNode;
}

export function AddVehicleDialog({ onVehicleAdded, trigger }: AddVehicleDialogProps) {
  const [open, setOpen] = useState(false);
  const [model, setModel] = useState("");
  const [plate, setPlate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formatPlate = (value: string) => {
    // Remove tudo que não é letra ou número
    const cleaned = value.toUpperCase().replace(/[^A-Z0-9]/g, "");
    
    // Formata como ABC-1234 ou ABC1D23 (Mercosul)
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
    // Placa antiga (ABC-1234) ou Mercosul (ABC1D23)
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
    
    // Simula salvamento (aqui integraria com Supabase)
    await new Promise(resolve => setTimeout(resolve, 500));
    
    onVehicleAdded({ model: model.trim(), plate: plate.toUpperCase() });
    
    toast.success("Veículo cadastrado!");
    setModel("");
    setPlate("");
    setOpen(false);
    setIsSubmitting(false);
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
            <Label htmlFor="model">Modelo do veículo</Label>
            <Input
              id="model"
              placeholder="Ex: Civic, Corolla, HB20..."
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="h-12"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="plate">Placa</Label>
            <Input
              id="plate"
              placeholder="ABC-1234"
              value={plate}
              onChange={handlePlateChange}
              maxLength={8}
              className="h-12 uppercase"
            />
            <p className="text-xs text-muted-foreground">
              Com a placa, buscamos automaticamente os dados do veículo
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
