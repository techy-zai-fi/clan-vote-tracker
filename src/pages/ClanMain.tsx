import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Vote, Users } from "lucide-react";
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
      {/* Clan Header */}
      <header className={`bg-gradient-to-br ${getClanGradient(clanId)} text-white`}>
        <div className="container mx-auto px-4 py-8">
          <Link to="/clans">
            <Button variant="ghost" className="text-white hover:bg-white/20 mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Clans
            </Button>
          </Link>
          <div className="text-center py-8">
            <h1 className="text-6xl font-bold mb-4">{clan.id}</h1>
            <h2 className="text-3xl font-semibold mb-4">{clan.name}</h2>
            <p className="text-xl italic opacity-90">"{clan.quote}"</p>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        {/* Vote Now Section */}
        <Card className="p-8 mb-12 text-center bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
          <Vote className="h-16 w-16 mx-auto mb-4 text-primary" />
          <h3 className="text-2xl font-bold mb-2">Ready to Vote?</h3>
          <p className="text-muted-foreground mb-6">
            {voter 
              ? voter.clan === clanId 
                ? `Cast your vote for ${clan.name} Panch representative`
                : "You can only vote in your own clan"
              : "Identify yourself first to proceed with voting"
            }
          </p>
          {voter?.clan === clanId ? (
            <Button size="lg" onClick={handleVoteNow} className="text-lg px-8">
              <Vote className="mr-2 h-5 w-5" />
              Vote Now
            </Button>
          ) : (
            <Link to="/voters">
              <Button size="lg" variant="outline" className="text-lg px-8">
                <Users className="mr-2 h-5 w-5" />
                Identify Yourself
              </Button>
            </Link>
          )}
        </Card>

        {/* Candidates Section */}
        <div className="mb-8">
          <h3 className="text-3xl font-bold mb-6">Candidates</h3>
          
          {Object.keys(candidatesByBatch).length > 0 ? (
            <div className="space-y-8">
              {Object.entries(candidatesByBatch).map(([batch, batchCandidates]) => (
                <div key={batch}>
                  <h4 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <Badge variant="outline" className="text-base px-3 py-1">
                      {batch}
                    </Badge>
                    <span className="text-muted-foreground text-sm">
                      ({(batchCandidates as any[]).length} {(batchCandidates as any[]).length === 1 ? 'candidate' : 'candidates'})
                    </span>
                  </h4>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {(batchCandidates as any[]).map((candidate) => (
                      <Card key={candidate.id} className="p-6 hover:shadow-lg transition-shadow">
                        <div className="flex items-start gap-4">
                          {candidate.photo_url && (
                            <img 
                              src={candidate.photo_url} 
                              alt={candidate.name}
                              className="w-16 h-16 rounded-full object-cover"
                            />
                          )}
                          <div className="flex-1">
                            <h5 className="font-semibold text-lg mb-1">{candidate.name}</h5>
                            <Badge variant="secondary" className="mb-2">
                              {candidate.gender}
                            </Badge>
                            {candidate.manifesto && (
                              <p className="text-sm text-muted-foreground mt-2 line-clamp-3">
                                {candidate.manifesto}
                              </p>
                            )}
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center">
              <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No candidates available yet</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClanMain;
