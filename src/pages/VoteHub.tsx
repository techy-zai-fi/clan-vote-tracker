import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle2, Circle } from "lucide-react";

const VoteHub = () => {
  const [clans, setClans] = useState<any[]>([]);
  const [votes, setVotes] = useState<any[]>([]);
  const [voter, setVoter] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if voter session exists
    const voterData = sessionStorage.getItem('voter');
    if (!voterData) {
      navigate('/voters');
      return;
    }
    setVoter(JSON.parse(voterData));
    loadData();
  }, []);

  const loadData = async () => {
    const voterData = JSON.parse(sessionStorage.getItem('voter') || '{}');
    
    // Load clans
    const { data: clansData } = await supabase
      .from('clans')
      .select('*')
      .order('display_order');
    
    if (clansData) setClans(clansData);

    // Load existing votes for this voter
    const { data: votesData } = await supabase
      .from('votes')
      .select('*')
      .eq('voter_email', voterData.email);
    
    if (votesData) setVotes(votesData);
  };

  const hasVotedInClan = (clanId: string) => {
    return votes.some(v => v.clan_id === clanId);
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

  if (!voter) return null;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 py-6">
          <Link to="/" className="text-xl font-bold hover:text-secondary">
            ← IIMBG Elections
          </Link>
          <div className="mt-4">
            <h1 className="text-3xl font-bold">Voting Hub</h1>
            <p className="text-primary-foreground/80 mt-2">
              {voter.name} • {voter.batch} • {voter.reg_num}
            </p>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        {/* Progress Tracker */}
        <Card className="p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">Your Voting Progress</h2>
          <div className="flex gap-3 justify-center flex-wrap">
            {clans.map((clan) => (
              <div key={clan.id} className="flex flex-col items-center">
                {hasVotedInClan(clan.id) ? (
                  <CheckCircle2 className="h-8 w-8 text-green-600" />
                ) : (
                  <Circle className="h-8 w-8 text-muted-foreground" />
                )}
                <span className="text-sm font-medium mt-1">{clan.id}</span>
              </div>
            ))}
          </div>
          <p className="text-center mt-4 text-muted-foreground">
            Voted in {votes.length} of {clans.length} clans
          </p>
        </Card>

        {/* Clan Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clans.map((clan) => (
            <Link key={clan.id} to={`/vote/${clan.id}`}>
              <Card className="overflow-hidden hover-scale cursor-pointer group">
                <div className={`h-40 bg-gradient-to-br ${getClanGradient(clan.id)} flex items-center justify-center relative`}>
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                  <div className="relative z-10 text-center text-white">
                    <div className="text-5xl font-bold mb-2">{clan.id}</div>
                    <div className="text-xl font-semibold">{clan.name}</div>
                  </div>
                  {hasVotedInClan(clan.id) && (
                    <div className="absolute top-3 right-3">
                      <CheckCircle2 className="h-6 w-6 text-white drop-shadow-lg" />
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <p className="text-sm text-muted-foreground italic mb-3">
                    "{clan.quote}"
                  </p>
                  <Button className="w-full" variant={hasVotedInClan(clan.id) ? "outline" : "default"}>
                    {hasVotedInClan(clan.id) ? "View/Change Vote" : "Cast Vote"}
                  </Button>
                </div>
              </Card>
            </Link>
          ))}
        </div>

        {votes.length === clans.length && (
          <div className="mt-8 text-center">
            <Card className="p-8 bg-green-50 border-green-200">
              <CheckCircle2 className="h-16 w-16 text-green-600 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-green-900 mb-2">All Votes Cast!</h3>
              <p className="text-green-700 mb-4">
                You've voted in all {clans.length} clans. Thank you for participating!
              </p>
              <Link to="/receipt">
                <Button size="lg" className="bg-green-600 hover:bg-green-700">
                  View Receipt
                </Button>
              </Link>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default VoteHub;
