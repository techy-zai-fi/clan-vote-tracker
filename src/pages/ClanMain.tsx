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

  const getClanStyle = () => {
    if (!clan?.main_color || !clan?.sub_color) {
      return {
        background: `linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))`,
        mainColor: '#3B82F6',
        subColor: '#1E40AF',
      };
    }
    return {
      background: `linear-gradient(135deg, ${clan.main_color}, ${clan.sub_color})`,
      mainColor: clan.main_color,
      subColor: clan.sub_color,
    };
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
      <header 
        className="relative text-white overflow-hidden"
        style={{ background: getClanStyle().background }}
      >
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-black rounded-full blur-3xl"></div>
        </div>
        {/* Decorative Graphics */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 border-4 border-white rotate-45"></div>
          <div className="absolute bottom-10 right-10 w-40 h-40 border-4 border-white rounded-full"></div>
          <div className="absolute top-1/2 right-1/4 w-24 h-24 border-4 border-white" style={{ clipPath: 'polygon(50% 0%, 100% 100%, 0% 100%)' }}></div>
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
              {clan.logo_url ? (
                <img src={clan.logo_url} alt={clan.name} className="h-52 w-52 mx-auto object-contain drop-shadow-2xl" />
              ) : (
                <Trophy className="h-42 w-42 mx-auto text-secondary drop-shadow-2xl" />
              )}
            </div>
            <h1 className="text-8xl font-black mb-6 drop-shadow-2xl tracking-tight">{clan.id}</h1>
            <h2 className="text-3xl font-bold mb-4 drop-shadow-lg">{clan.name} Arena</h2>
            <p className="text-2xl italic opacity-90 drop-shadow-md max-w-2xl mx-auto">"{clan.quote}"</p>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-16">
        {/* Call to Action Section */}
        <Card className="relative overflow-hidden mb-16 border-2 hover-lift">
          <div 
            className="absolute inset-0 opacity-10"
            style={{ background: `linear-gradient(135deg, ${getClanStyle().mainColor}20, ${getClanStyle().subColor}20)` }}
          ></div>
          {/* Decorative corner elements */}
          <div className="absolute top-0 right-0 w-32 h-32 opacity-5" style={{ background: getClanStyle().mainColor, clipPath: 'polygon(100% 0, 100% 100%, 0 0)' }}></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 opacity-5" style={{ background: getClanStyle().subColor, clipPath: 'polygon(0 100%, 100% 100%, 0 0)' }}></div>
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
                className="text-lg px-12 py-6 text-white hover:shadow-2xl transition-all hover:scale-105"
                style={{ background: `linear-gradient(135deg, ${getClanStyle().mainColor}, ${getClanStyle().subColor})` }}
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
                            <div 
                              className="h-48 flex items-center justify-center"
                              style={{ background: `linear-gradient(135deg, ${getClanStyle().mainColor}, ${getClanStyle().subColor})` }}
                            >
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
