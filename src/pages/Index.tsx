import { Header } from "@/components/layout/Header";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { ActionButtons } from "@/components/home/ActionButtons";
import { MyVehiclesSection } from "@/components/home/MyVehiclesSection";
import { Card, CardContent } from "@/components/ui/card";
import { Youtube, Instagram, BookOpen, ExternalLink } from "lucide-react";

const socialLinks = [
  {
    icon: Instagram,
    label: "Instagram",
    handle: "@drprime_oficial",
    url: "https://instagram.com/drprime_oficial",
    color: "from-purple-500 via-pink-500 to-orange-500",
    bgColor: "bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-orange-500/10",
  },
  {
    icon: Youtube,
    label: "YouTube",
    handle: "Dr. Prime",
    url: "https://youtube.com/@drprime",
    color: "from-red-600 to-red-500",
    bgColor: "bg-red-500/10",
  },
  {
    icon: BookOpen,
    label: "Blog",
    handle: "blog.doctorauto.com.br",
    url: "https://blog.doctorauto.com.br",
    color: "from-primary to-primary/80",
    bgColor: "bg-primary/10",
  },
];

const Index = () => {
  return (
    <div className="h-screen gradient-bg dark flex flex-col overflow-hidden">
      <Header />

      <main className="flex-1 px-4 pt-6 flex flex-col">
        {/* Welcome Section */}
        <section className="animate-fade-in">
          <h2 className="text-2xl font-bold text-foreground mb-4">
            Olá, Carlos! 👋
          </h2>
        </section>

        {/* My Vehicles - only shows if vehicle is in service */}
        <MyVehiclesSection />

        {/* Action Buttons */}
        <section className="flex-1 mt-4">
          <ActionButtons />
        </section>

        {/* Social Links */}
        <section className="py-4 space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground px-1">Siga a Dr. Prime</h3>
          {socialLinks.map((social) => (
            <a
              key={social.label}
              href={social.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <Card className={`border-0 shadow-md overflow-hidden hover:shadow-lg transition-shadow ${social.bgColor}`}>
                <CardContent className="flex items-center gap-4 py-3 px-4">
                  <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${social.color} flex items-center justify-center shadow-lg`}>
                    <social.icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-sm">{social.label}</p>
                    <p className="text-xs text-muted-foreground">{social.handle}</p>
                  </div>
                  <ExternalLink className="h-4 w-4 text-muted-foreground" />
                </CardContent>
              </Card>
            </a>
          ))}
        </section>
      </main>

      <BottomNavigation />
    </div>
  );
};

export default Index;
