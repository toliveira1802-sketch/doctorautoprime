import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Gift, Sparkles, Tag, Clock, ArrowRight } from "lucide-react";

export default function Promocoes() {
  const promocoes = [
    {
      id: 1,
      titulo: "Revisão Completa",
      descricao: "Revisão de 10.000km com 20% de desconto",
      desconto: "20% OFF",
      validade: "Válido até 28/02/2026",
      destaque: true,
    },
    {
      id: 2,
      titulo: "Troca de Óleo",
      descricao: "Óleo sintético + filtro com preço especial",
      desconto: "15% OFF",
      validade: "Válido até 15/02/2026",
      destaque: false,
    },
    {
      id: 3,
      titulo: "Alinhamento e Balanceamento",
      descricao: "Combo completo para seu carro",
      desconto: "R$ 99,90",
      validade: "Válido até 31/01/2026",
      destaque: false,
    },
  ];

  return (
    <div className="min-h-screen bg-background p-4 pb-24">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
              <Gift className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Promoções</h1>
              <p className="text-muted-foreground">Aproveite nossas ofertas especiais</p>
            </div>
          </div>
        </div>

        {/* Promoções em Destaque */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-yellow-500" />
            <h2 className="text-lg font-semibold">Ofertas em Destaque</h2>
          </div>

          {promocoes
            .filter((p) => p.destaque)
            .map((promo) => (
              <Card
                key={promo.id}
                className="border-2 border-green-500/30 bg-gradient-to-br from-green-500/5 to-emerald-500/5"
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-xl">{promo.titulo}</CardTitle>
                      <CardDescription>{promo.descricao}</CardDescription>
                    </div>
                    <Badge className="bg-green-600 hover:bg-green-700 text-white">
                      {promo.desconto}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      {promo.validade}
                    </div>
                    <Button size="sm" className="bg-green-600 hover:bg-green-700">
                      Agendar
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>

        {/* Todas as Promoções */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Tag className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold">Todas as Promoções</h2>
          </div>

          {promocoes
            .filter((p) => !p.destaque)
            .map((promo) => (
              <Card key={promo.id} className="hover:border-primary/50 transition-colors cursor-pointer">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{promo.titulo}</CardTitle>
                      <CardDescription>{promo.descricao}</CardDescription>
                    </div>
                    <Badge variant="secondary">{promo.desconto}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      {promo.validade}
                    </div>
                    <Button size="sm" variant="outline">
                      Ver mais
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>

        {/* Info Box */}
        <Card className="bg-muted/50">
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                📢 Novas promoções toda semana!
              </p>
              <p className="text-sm text-muted-foreground">
                Entre em contato para mais informações
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
