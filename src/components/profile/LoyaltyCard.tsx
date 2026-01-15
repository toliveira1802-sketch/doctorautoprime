import { Award, Star, Crown, Percent, Gift } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

interface LoyaltyCardProps {
  cashback: number;
  level: string;
  progress: number;
}

const loyaltyConfig = {
  bronze: { 
    label: "Bronze", 
    color: "from-amber-700 to-amber-600", 
    textColor: "text-amber-700",
    bgColor: "bg-amber-50",
    nextLevel: "Prata", 
    spendNeeded: 2000, // R$ 2000 para próximo nível
    icon: Award,
    benefits: ["15% de cashback em serviços", "Prioridade básica no agendamento"]
  },
  silver: { 
    label: "Prata", 
    color: "from-slate-500 to-slate-400", 
    textColor: "text-slate-600",
    bgColor: "bg-slate-50",
    nextLevel: "Ouro", 
    spendNeeded: 5000,
    icon: Award,
    benefits: ["15% de cashback", "Lavagem cortesia", "Prioridade no agendamento"]
  },
  gold: { 
    label: "Ouro", 
    color: "from-yellow-500 to-amber-400", 
    textColor: "text-yellow-600",
    bgColor: "bg-yellow-50",
    nextLevel: "Platinum", 
    spendNeeded: 10000,
    icon: Star,
    benefits: ["15% de cashback", "Lavagem + higienização grátis", "Carro reserva", "Atendimento VIP"]
  },
  platinum: { 
    label: "Platinum", 
    color: "from-slate-800 to-slate-600", 
    textColor: "text-slate-700",
    bgColor: "bg-slate-100",
    nextLevel: null, 
    spendNeeded: null,
    icon: Crown,
    benefits: ["15% de cashback + bônus", "Serviços exclusivos", "Eventos VIP", "Gerente dedicado"]
  },
};

export function LoyaltyCard({ cashback, level, progress }: LoyaltyCardProps) {
  const config = loyaltyConfig[level as keyof typeof loyaltyConfig] || loyaltyConfig.bronze;
  const Icon = config.icon;

  return (
    <Card className="overflow-hidden border-0 shadow-lg">
      {/* Card Header with gradient */}
      <div className={`bg-gradient-to-r ${config.color} p-6 text-white`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm opacity-80">Programa Cashback</p>
            <h3 className="text-2xl font-bold flex items-center gap-2 mt-1">
              <Icon className="h-6 w-6" />
              Cliente {config.label}
            </h3>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1 justify-end">
              <Percent className="h-5 w-5" />
              <span className="text-3xl font-bold">15</span>
            </div>
            <p className="text-sm opacity-80">de cashback</p>
          </div>
        </div>

        <div className="mt-4 p-3 bg-white/15 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-sm">Saldo disponível</span>
            <span className="text-xl font-bold">R$ {cashback.toFixed(2).replace('.', ',')}</span>
          </div>
          <p className="text-xs opacity-80 mt-1">Use para pagar serviços aqui</p>
        </div>

        {config.nextLevel && (
          <div className="mt-4">
            <div className="flex justify-between text-sm mb-2">
              <span>Progresso para {config.nextLevel}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2 bg-white/20" />
          </div>
        )}
      </div>

      {/* Benefits */}
      <CardContent className="p-4">
        <p className="text-sm font-medium text-muted-foreground mb-3">Seus benefícios:</p>
        <div className="space-y-2">
          {config.benefits.map((benefit, index) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <div className={`h-6 w-6 rounded-full ${config.bgColor} flex items-center justify-center`}>
                <Gift className={`h-3 w-3 ${config.textColor}`} />
              </div>
              <span>{benefit}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
