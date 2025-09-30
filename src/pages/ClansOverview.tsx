import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { getDB, Clan } from "@/lib/db";
import { ArrowRight } from "lucide-react";

const ClansOverview = () => {
  const [clans, setClans] = useState<Clan[]>([]);

  useEffect(() => {
    loadClans();
  }, []);

  const loadClans = async () => {
    const db = await getDB();
    const allClans = await db.getAllFromIndex('clans', 'by-order');
    setClans(allClans);
  };

  const getClanGradient = (clanId: string) => {
    const gradients: Record<string, string> = {
      BD: 'from-red-600 to-red-700',
      AS: 'from-purple-600 to-purple-700',
      DR: 'from-orange-600 to-orange-700',
      GA: 'from-green-600 to-green-700',
      MA: 'from-blue-600 to-blue-700',
      VI: 'from-violet-600 to-violet-700',
    };
    return gradients[clanId] || 'from-primary to-accent';
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 py-6">
          <Link to="/" className="text-xl font-bold hover:text-secondary">
            ← Back to Home
          </Link>
          <h1 className="text-3xl font-bold mt-4">The Six Clans</h1>
          <p className="text-primary-foreground/80 mt-2">
            Choose your clan and cast your vote for Panch representatives
          </p>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clans.map((clan) => (
            <Link key={clan.id} to={`/vote/${clan.id}`}>
              <Card className="overflow-hidden hover-scale cursor-pointer group">
                <div className={`h-48 bg-gradient-to-br ${getClanGradient(clan.id)} flex items-center justify-center relative overflow-hidden`}>
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                  <div className="relative z-10 text-center text-white">
                    <div className="text-6xl font-bold mb-2">{clan.id}</div>
                    <div className="text-2xl font-semibold">{clan.name}</div>
                  </div>
                </div>
                <div className="p-6">
                  <p className="text-lg text-muted-foreground mb-4 italic">
                    "{clan.quote}"
                  </p>
                  <div className="flex items-center text-primary font-semibold group-hover:gap-3 gap-2 transition-all">
                    View Candidates
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>

        {clans.length === 0 && (
          <div className="text-center py-16">
            <p className="text-muted-foreground">Loading clans...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClansOverview;
