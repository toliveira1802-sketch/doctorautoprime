import { ArrowLeft, Clock, User, ChevronRight, Wrench, Lightbulb, Shield, Fuel } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { BottomNavigation } from "@/components/layout/BottomNavigation";

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  icon: React.ElementType;
  readTime: string;
  date: string;
}

const blogPosts: BlogPost[] = [
  {
    id: "1",
    title: "Quando trocar o óleo do motor?",
    excerpt: "Entenda os sinais que indicam a hora certa de fazer a troca de óleo e evite problemas maiores.",
    category: "Manutenção",
    icon: Wrench,
    readTime: "3 min",
    date: "10 Jan 2025",
  },
  {
    id: "2",
    title: "5 dicas para economizar combustível",
    excerpt: "Pequenas mudanças de hábito que podem fazer grande diferença no seu bolso.",
    category: "Economia",
    icon: Fuel,
    readTime: "4 min",
    date: "08 Jan 2025",
  },
  {
    id: "3",
    title: "Como identificar problemas nos freios",
    excerpt: "Sinais de alerta que você não pode ignorar para sua segurança.",
    category: "Segurança",
    icon: Shield,
    readTime: "5 min",
    date: "05 Jan 2025",
  },
  {
    id: "4",
    title: "Preparando seu carro para viagens longas",
    excerpt: "Checklist completo para garantir uma viagem tranquila e segura.",
    category: "Dicas",
    icon: Lightbulb,
    readTime: "6 min",
    date: "02 Jan 2025",
  },
];

const categoryColors: Record<string, string> = {
  "Manutenção": "bg-blue-500/20 text-blue-500",
  "Economia": "bg-emerald-500/20 text-emerald-500",
  "Segurança": "bg-red-500/20 text-red-500",
  "Dicas": "bg-amber-500/20 text-amber-500",
};

const Blog = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen gradient-bg dark flex flex-col">
      <Header />

      <main className="flex-1 px-4 pt-4 pb-24 overflow-y-auto">
        {/* Page Header */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-xl bg-muted/50 flex items-center justify-center hover:bg-muted transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-muted-foreground" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-foreground">Blog Prime</h1>
            <p className="text-sm text-muted-foreground">Dicas e novidades automotivas</p>
          </div>
        </div>

        {/* Featured Post */}
        <div className="glass-card rounded-2xl p-5 mb-6">
          <span className="text-xs font-medium text-primary bg-primary/20 px-2 py-1 rounded-full">
            Em destaque
          </span>
          <h2 className="text-lg font-bold text-foreground mt-3">
            Revisão completa: o que está incluso?
          </h2>
          <p className="text-sm text-muted-foreground mt-2">
            Descubra todos os itens verificados em uma revisão completa e por que ela é essencial para a saúde do seu veículo.
          </p>
          <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>8 min de leitura</span>
            </div>
            <div className="flex items-center gap-1">
              <User className="w-3 h-3" />
              <span>Equipe Prime</span>
            </div>
          </div>
        </div>

        {/* Posts List */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Últimos artigos
          </h3>
          
          {blogPosts.map((post) => {
            const IconComponent = post.icon;
            
            return (
              <button
                key={post.id}
                className="w-full glass-card rounded-xl p-4 flex items-start gap-4 text-left hover:bg-muted/30 transition-colors"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <IconComponent className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${categoryColors[post.category]}`}>
                      {post.category}
                    </span>
                    <span className="text-xs text-muted-foreground">{post.readTime}</span>
                  </div>
                  <h4 className="font-medium text-foreground line-clamp-1">{post.title}</h4>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{post.excerpt}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-1" />
              </button>
            );
          })}
        </div>

        {/* Coming Soon Notice */}
        <div className="mt-6 text-center py-8 glass-card rounded-xl">
          <p className="text-muted-foreground text-sm">
            Mais conteúdos em breve! 🚀
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Siga nossas redes sociais para novidades
          </p>
        </div>
      </main>

      <BottomNavigation />
    </div>
  );
};

export default Blog;
