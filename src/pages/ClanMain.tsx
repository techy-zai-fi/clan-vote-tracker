import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Swords, Users, Shield, Trophy, Target } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const ClanMain = () => {
  const { clanId } = useParams();
  const navigate = useNavigate();
  const [clan, setClan] = useState<any>(null);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [voter, setVoter] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, [clanId]);

  const loadData = async () => {
    // Load clan details
    const { data: clanData } = await supabase
      .from('clans')
      .select('*')
      .eq('id', clanId)
      .single();
    
    if (clanData) setClan(clanData);

    // Load voter data if available
    const voterData = sessionStorage.getItem('voter');
    if (voterData) {
      setVoter(JSON.parse(voterData));
    }

    // Load all active candidates for this clan
    const { data: candidatesData } = await supabase
      .from('candidates')
      .select('*')
      .eq('clan_id', clanId)
      .eq('is_active', true)
      .order('batch')
      .order('name');
    
    if (candidatesData) setCandidates(candidatesData);
  };

  const getClanGradient = (clanId: string) => {
    const gradients: Record<string, string> = {
      MM: 'from-blue-600 to-blue-700',
      SS: 'from-gray-600 to-gray-700',
      WW: 'from-sky-600 to-sky-700',
      YY: 'from-yellow-600 to-yellow-700',
      AA: 'from-amber-600 to-amber-700',
      NN: 'from-indigo-600 to-indigo-700',
    };
    return gradients[clanId] || 'from-primary to-accent';
  };

  const handleVoteNow = () => {
    const voterData = sessionStorage.getItem('voter');
    if (!voterData) {
      navigate('/voters');
      return;
    }
    navigate(`/vote/${clanId}`);
  };

  if (!clan) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  // Group candidates by batch
  const candidatesByBatch = candidates.reduce((acc, candidate) => {
    if (!acc[candidate.batch]) {
      acc[candidate.batch] = [];
    }
    acc[candidate.batch].push(candidate);
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <div className="min-h-screen bg-background">
      {/* Clan Arena Header */}
      <header className={`relative bg-gradient-to-br ${getClanGradient(clanId)} text-white overflow-hidden`}>
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-black rounded-full blur-3xl"></div>
        </div>
        <div className="container mx-auto px-4 py-8 relative">
          <Link to="/clans">
            <Button variant="ghost" className="text-white hover:bg-white/20 mb-6 backdrop-blur-sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Arenas
            </Button>
          </Link>
          <div className="text-center py-12">
            <div className="mb-6">
              <Trophy className="h-20 w-20 mx-auto text-secondary drop-shadow-2xl" />
            </div>
            <h1 className="text-8xl font-black mb-6 drop-shadow-2xl tracking-tight">{clan.id}</h1>
            <h2 className="text-4xl font-bold mb-4 drop-shadow-lg">{clan.name} Arena</h2>
            <p className="text-2xl italic opacity-90 drop-shadow-md max-w-2xl mx-auto">"{clan.quote}"</p>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-16">
        {/* Call to Action Section */}
        <Card className="relative overflow-hidden mb-16 border-2 hover-lift">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-accent/5 to-primary/5"></div>
          <div className="relative p-12 text-center">
            <div className="mb-6">
              <Swords className="h-20 w-20 mx-auto text-primary" />
            </div>
            <h3 className="text-3xl font-black mb-4">Ready for Battle?</h3>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              {voter 
                ? voter.clan === clanId 
                  ? `Step into the arena and cast your vote for ${clan.name}'s champion. Your voice determines the victor!`
                  : "Warriors can only vote in their home arena. This clan's battle is reserved for its members."
                : "Register as a warrior to unlock voting privileges and support your champion!"
              }
            </p>
            {voter?.clan === clanId ? (
              <Button 
                size="lg" 
                onClick={handleVoteNow} 
                className="text-lg px-12 py-6 bg-gradient-to-r from-primary to-accent hover:shadow-2xl"
              >
                <Swords className="mr-2 h-6 w-6" />
                Cast Your Vote
              </Button>
            ) : (
              <Link to="/voters">
                <Button 
                  size="lg" 
                  variant="outline"
                  className="text-lg px-12 py-6 border-2 hover:bg-primary/10"
                >
                  <Target className="mr-2 h-6 w-6" />
                  Register to Vote
                </Button>
              </Link>
            )}
          </div>
        </Card>

        {/* Warriors Section */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-8">
            <Shield className="h-10 w-10 text-primary" />
            <h3 className="text-4xl font-black">Clan Warriors</h3>
          </div>
          
          {Object.keys(candidatesByBatch).length > 0 ? (
            <div className="space-y-12">
              {Object.entries(candidatesByBatch).map(([batch, batchCandidates]) => (
                <div key={batch}>
                  <div className="flex items-center gap-3 mb-6">
                    <Badge variant="outline" className="text-lg px-4 py-2 font-bold">
                      {batch} Squad
                    </Badge>
                    <span className="text-muted-foreground text-base">
                      {(batchCandidates as any[]).length} {(batchCandidates as any[]).length === 1 ? 'Warrior' : 'Warriors'}
                    </span>
                  </div>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {(batchCandidates as any[]).map((candidate) => (
                      <Card key={candidate.id} className="sport-card overflow-hidden group">
                        <div className="relative">
                          {candidate.photo_url ? (
                            <div className="h-48 overflow-hidden">
                              <img 
                                src={candidate.photo_url} 
                                alt={candidate.name}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                            </div>
                          ) : (
                            <div className={`h-48 bg-gradient-to-br ${getClanGradient(clanId)} flex items-center justify-center`}>
                              <Shield className="h-16 w-16 text-white/50" />
                            </div>
                          )}
                          <div className="absolute top-3 right-3">
                            <Badge variant="secondary" className="backdrop-blur-sm">
                              {candidate.gender}
                            </Badge>
                          </div>
                        </div>
                        <div className="p-6">
                          <h5 className="font-bold text-xl mb-3 group-hover:text-primary transition-colors">
                            {candidate.name}
                          </h5>
                          {candidate.manifesto && (
                            <p className="text-sm text-muted-foreground leading-relaxed line-clamp-4">
                              {candidate.manifesto}
                            </p>
                          )}
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Card className="p-16 text-center sport-card">
              <Users className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h4 className="text-xl font-bold mb-2">No Warriors Yet</h4>
              <p className="text-muted-foreground">Champions will be announced soon. Stay tuned!</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClanMain;
