import { Award, Star, Crown, TrendingUp, Gift } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

interface LoyaltyCardProps {
  points: number;
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
    pointsNeeded: 500, 
    icon: Award,
    benefits: ["5% de desconto em revisões", "Prioridade básica no agendamento"]
  },
  silver: { 
    label: "Prata", 
    color: "from-slate-500 to-slate-400", 
    textColor: "text-slate-600",
    bgColor: "bg-slate-50",
    nextLevel: "Ouro", 
    pointsNeeded: 1500, 
    icon: Award,
    benefits: ["10% de desconto em revisões", "Lavagem cortesia", "Prioridade no agendamento"]
  },
  gold: { 
    label: "Ouro", 
    color: "from-yellow-500 to-amber-400", 
    textColor: "text-yellow-600",
    bgColor: "bg-yellow-50",
    nextLevel: "Platinum", 
    pointsNeeded: 3000, 
    icon: Star,
    benefits: ["15% de desconto em revisões", "Lavagem + higienização grátis", "Carro reserva", "Atendimento VIP"]
  },
  platinum: { 
    label: "Platinum", 
    color: "from-slate-800 to-slate-600", 
    textColor: "text-slate-700",
    bgColor: "bg-slate-100",
    nextLevel: null, 
    pointsNeeded: null, 
    icon: Crown,
    benefits: ["20% de desconto em tudo", "Serviços exclusivos", "Eventos VIP", "Gerente dedicado", "Brindes exclusivos"]
  },
};

export function LoyaltyCard({ points, level, progress }: LoyaltyCardProps) {
  const config = loyaltyConfig[level as keyof typeof loyaltyConfig] || loyaltyConfig.bronze;
  const Icon = config.icon;

  return (
    <Card className="overflow-hidden border-0 shadow-lg">
      {/* Card Header with gradient */}
      <div className={`bg-gradient-to-r ${config.color} p-6 text-white`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm opacity-80">Programa de Fidelidade</p>
            <h3 className="text-2xl font-bold flex items-center gap-2 mt-1">
              <Icon className="h-6 w-6" />
              Cliente {config.label}
            </h3>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold">{points.toLocaleString()}</p>
            <p className="text-sm opacity-80">pontos</p>
          </div>
        </div>

        {config.nextLevel && (
          <div className="mt-6">
            <div className="flex justify-between text-sm mb-2">
              <span>Progresso para {config.nextLevel}</span>
              <span>{points} / {config.pointsNeeded}</span>
            </div>
            <Progress value={progress} className="h-2 bg-white/20" />
            <p className="text-xs mt-2 opacity-80">
              Faltam {(config.pointsNeeded! - points).toLocaleString()} pontos para o próximo nível
            </p>
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

        {/* How to earn points */}
        <div className={`mt-4 p-3 rounded-lg ${config.bgColor}`}>
          <div className="flex items-center gap-2">
            <TrendingUp className={`h-4 w-4 ${config.textColor}`} />
            <span className="text-sm font-medium">Como ganhar pontos?</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Cada R$1 gasto em serviços = 1 ponto. Avaliações e indicações também valem pontos!
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
