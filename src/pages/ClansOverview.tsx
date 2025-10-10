import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ArrowRight, Swords, Trophy, Shield } from "lucide-react";

const ClansOverview = () => {
  const [clans, setClans] = useState<any[]>([]);

  useEffect(() => {
    loadClans();
  }, []);

  const loadClans = async () => {
    const { data } = await supabase
      .from('clans')
      .select('*')
      .order('display_order');
    
    if (data) setClans(data);
  };

  const getClanStyle = (clan: any) => {
    if (!clan?.main_color || !clan?.sub_color) {
      return {
        background: `linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))`,
      };
    }
    return {
      background: `linear-gradient(135deg, ${clan.main_color}, ${clan.sub_color})`,
    };
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Header */}
      <header className="relative border-b bg-gradient-to-br from-primary via-accent to-primary text-primary-foreground overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-secondary rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent rounded-full blur-3xl"></div>
        </div>
        <div className="container mx-auto px-4 py-12 relative">
          <Link to="/" className="inline-flex items-center gap-2 text-primary-foreground/80 hover:text-secondary transition-colors mb-6">
            <Shield className="h-5 w-5" />
            <span className="font-semibold">← Back to Arena</span>
          </Link>
          <div className="flex items-center gap-4 mb-4">
            <Swords className="h-12 w-12 text-secondary" />
            <h1 className="text-5xl font-black">Battle Arenas</h1>
          </div>
          <p className="text-xl text-primary-foreground/90 max-w-2xl">
            Six legendary clans, one ultimate championship. Choose your arena and support your warrior!
          </p>
        </div>
      </header>

      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {clans.map((clan) => (
            <Link key={clan.id} to={`/clans/${clan.id}`}>
              <Card className="overflow-hidden hover-lift cursor-pointer group border-2">
                <div 
                  className="h-56 flex items-center justify-center relative overflow-hidden"
                  style={{ background: getClanStyle(clan).background }}
                >
                  <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-all duration-500" />
                  <div className="absolute inset-0">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                  </div>
                  <div className="relative z-10 text-center text-white transform group-hover:scale-110 transition-transform duration-500">
                    {clan.logo_url ? (
                      <img src={clan.logo_url} alt={clan.name} className="h-36 w-36 mx-auto mb-4 object-contain drop-shadow-2xl" />
                    ) : (
                      <Trophy className="h-30 w-30 mx-auto mb-4 text-secondary drop-shadow-lg" />
                    )}
                    <div className="text-4xl font-bold drop-shadow-md">{clan.name}</div>
                  </div>
                </div>
                <div className="p-8 bg-gradient-to-br from-card to-muted/30">
                  <div className="mb-6">
                    <p className="text-lg text-muted-foreground italic leading-relaxed">
                      "{clan.quote}"
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-primary font-bold group-hover:text-accent transition-colors">
                      Enter Arena
                    </span>
                    <ArrowRight className="h-5 w-5 text-primary group-hover:translate-x-2 transition-transform" />
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>

        {clans.length === 0 && (
          <div className="text-center py-20">
            <div className="animate-pulse">
              <Swords className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground text-lg">Loading battle arenas...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClansOverview;
