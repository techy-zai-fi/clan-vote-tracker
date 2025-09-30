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
    
    const parsedVoter = JSON.parse(voterData);
    setVoter(parsedVoter);
    
    // Auto-redirect to voter's clan since voting is clan-only
    if (parsedVoter?.clan) {
      setTimeout(() => {
        navigate(`/vote/${parsedVoter.clan}`);
      }, 100);
    }
  }, [navigate]);

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

  if (!voter) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">Redirecting to your clan voting page...</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Card className="p-8 text-center max-w-md">
        <h2 className="text-2xl font-bold mb-4">Redirecting...</h2>
        <p className="text-muted-foreground">
          Taking you to {voter.clan} clan voting page.
        </p>
      </Card>
    </div>
  );
};

export default VoteHub;
