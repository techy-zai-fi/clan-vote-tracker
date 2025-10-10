import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, CheckCircle } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const ClanVoting = () => {
  const { clanId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [clan, setClan] = useState<any>(null);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState("");
  const [existingVote, setExistingVote] = useState<any>(null);
  const [voter, setVoter] = useState<any>(null);
  const [settings, setSettings] = useState<any>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if admin/user is logged in (for session management)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        toast({
          title: "Session Required",
          description: "Please log in to supervise voting",
          variant: "destructive",
        });
        navigate('/auth');
        return;
      }

      // Get voter info from sessionStorage (set by VoterLookup page)
      const storedVoter = sessionStorage.getItem('voter');
      if (!storedVoter) {
        toast({
          title: "No Voter Selected",
          description: "Please look up voter first",
          variant: "destructive",
        });
        navigate('/voters');
        return;
      }

      const voterData = JSON.parse(storedVoter);
      
      // Enforce same-clan-only voting
      if (voterData.clan !== clanId) {
        toast({
          title: "Access Denied",
          description: "This voter belongs to a different clan. Redirecting...",
          variant: "destructive",
        });
        setTimeout(() => navigate(`/vote/${voterData.clan}`), 2000);
        return;
      }
      
      setVoter(voterData);
      loadData(voterData);
      setLoading(false);
    });
  }, [clanId, navigate]);


  const loadData = async (voterData: any) => {
    
    // Load clan
    const { data: clanData } = await supabase
      .from('clans')
      .select('*')
      .eq('id', clanId)
      .single();
    
    if (clanData) setClan(clanData);

    // Load settings
    const { data: settingsData } = await supabase
      .from('election_settings')
      .select('*')
      .eq('id', 1)
      .single();
    
    if (settingsData) setSettings(settingsData);

    // Load voting rules to determine which candidates the voter can vote for
    const { data: rulesData } = await supabase
      .from('voting_rules')
      .select('*')
      .eq('is_active', true)
      .or(`voter_batch.eq.${voterData.batch},voter_batch.eq.All`);

    let candidatesData = [];
    
    if (rulesData && rulesData.length > 0) {
      // Find applicable rule
      const applicableRule = rulesData.find(rule => 
        (rule.voter_batch === voterData.batch || rule.voter_batch === 'All') &&
        (!rule.voter_section || rule.voter_section === String(voterData.year))
      );

      if (applicableRule) {
        // Build query based on rule
        let query = supabase
          .from('candidates')
          .select('*')
          .eq('clan_id', clanId)
          .eq('is_active', true);

        // Apply batch filter
        if (applicableRule.can_vote_for_batch !== 'All') {
          query = query.eq('batch', applicableRule.can_vote_for_batch);
        }

        // Apply section filter if specified
        if (applicableRule.can_vote_for_section) {
          query = query.eq('year', parseInt(applicableRule.can_vote_for_section));
        }

        const { data } = await query;
        candidatesData = data || [];
      }
    } else {
      // Fallback to default behavior (same batch only)
      const { data } = await supabase
        .from('candidates')
        .select('*')
        .eq('clan_id', clanId)
        .eq('batch', voterData.batch)
        .eq('is_active', true);
      
      candidatesData = data || [];
    }
    
    setCandidates(candidatesData);

    // Check for existing vote
    const { data: voteData } = await supabase
      .from('votes')
      .select('*')
      .eq('voter_email', voterData.email)
      .eq('clan_id', clanId)
      .maybeSingle();
    
    if (voteData) {
      setExistingVote(voteData);
      setSelectedCandidate(voteData.candidate_id);
    }
  };

  const handleSubmit = async () => {
    if (!selectedCandidate) {
      toast({
        title: "No candidate selected",
        description: "Please select a candidate before submitting.",
        variant: "destructive",
      });
      return;
    }

    if (existingVote && !settings?.allow_vote_changes) {
      toast({
        title: "Vote already cast",
        description: "You cannot change your vote once submitted.",
        variant: "destructive",
      });
      return;
    }

    setShowConfirm(true);
  };

  const confirmSubmit = async () => {
    setIsSubmitting(true);
    setShowConfirm(false);

    try {
      const voteData = {
        voter_email: voter.email,
        voter_regnum: voter.reg_num,
        clan_id: clanId,
        batch: voter.batch,
        candidate_id: selectedCandidate,
        device_hash: navigator.userAgent ? btoa(navigator.userAgent).slice(0, 50) : undefined,
        user_agent: navigator.userAgent,
      };

      const { error } = await supabase
        .from('votes')
        .upsert(voteData, { 
          onConflict: 'voter_email,clan_id,batch',
          ignoreDuplicates: false 
        });

      if (error) throw error;

      // Log audit
      await supabase.from('audit_log').insert({
        actor_label: voter.email,
        action: existingVote ? 'UPDATE_VOTE' : 'CAST_VOTE',
        payload_json: { clan_id: clanId, candidate_id: selectedCandidate },
      });

      toast({
        title: "Vote recorded",
        description: `Your vote for ${clan?.name} has been ${existingVote ? 'updated' : 'cast'} successfully. Ready for next voter.`,
      });

      // Clear voter from sessionStorage and redirect to voter lookup for next voter
      sessionStorage.removeItem('voter');
      setTimeout(() => navigate('/voters'), 1500);
    } catch (error: any) {
      console.error('Vote error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to record vote. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getClanStyle = () => {
    if (!clan?.main_color || !clan?.sub_color) {
      return {
        background: `linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))`,
      };
    }
    return {
      background: `linear-gradient(135deg, ${clan.main_color}, ${clan.sub_color})`,
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8">
          <p className="text-muted-foreground">Loading voting page...</p>
        </Card>
      </div>
    );
  }

  if (!voter || !clan) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Clan-themed header */}
      <div 
        className="py-16 relative"
        style={{ background: getClanStyle().background }}
      >
        <div className="absolute inset-0 bg-black/20" />
        <div className="container mx-auto px-4 relative z-10">
          <Link to={`/clans/${clanId}`}>
            <Button variant="ghost" className="text-white hover:bg-white/20 mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Clan
            </Button>
          </Link>
          <div className="text-center text-white">
            {clan.logo_url && (
              <img src={clan.logo_url} alt={clan.name} className="h-24 w-24 mx-auto mb-4 object-contain drop-shadow-2xl" />
            )}
            <div className="text-7xl font-bold mb-2">{clan.id}</div>
            <h1 className="text-3xl font-bold mb-2">{clan.name}</h1>
            <p className="text-xl italic">"{clan.quote}"</p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <Card className="max-w-4xl mx-auto p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-2">Cast Your Vote</h2>
            <p className="text-muted-foreground">
              {voter.name} • {voter.batch} • Select one candidate from your batch
            </p>
          </div>

          {existingVote && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-semibold text-green-900">You've already voted in this clan</p>
                <p className="text-green-700">
                  {settings?.allow_vote_changes 
                    ? "You can change your vote until voting closes." 
                    : "Your vote has been locked and cannot be changed."}
                </p>
              </div>
            </div>
          )}

          {candidates.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                No candidates available for {voter.batch} in {clan.name}.
              </p>
            </div>
          ) : (
            <>
              <RadioGroup value={selectedCandidate} onValueChange={setSelectedCandidate}>
                <div className="space-y-4">
                  {candidates.map((candidate) => (
                    <Card key={candidate.id} className="p-4 hover:bg-accent/5 cursor-pointer transition-colors">
                      <div className="flex items-start gap-4">
                        <RadioGroupItem value={candidate.id} id={candidate.id} />
                        <Label htmlFor={candidate.id} className="flex-1 cursor-pointer">
                          <div className="flex gap-4">
                            {candidate.photo_url && (
                              <img 
                                src={candidate.photo_url} 
                                alt={candidate.name}
                                className="w-20 h-20 rounded-lg object-cover"
                              />
                            )}
                            <div className="flex-1">
                              <h3 className="font-semibold text-lg">{candidate.name}</h3>
                              <p className="text-sm text-muted-foreground">
                                {candidate.batch} • Year {candidate.year} • {candidate.gender}
                              </p>
                              {candidate.manifesto && (
                                <p className="text-sm mt-2 line-clamp-2">{candidate.manifesto}</p>
                              )}
                            </div>
                          </div>
                        </Label>
                      </div>
                    </Card>
                  ))}
                </div>
              </RadioGroup>

              <div className="mt-8 flex gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => navigate(`/clans/${clanId}`)}
                  className="flex-1"
                >
                  Back to Clan
                </Button>
                <Button 
                  onClick={handleSubmit}
                  disabled={!selectedCandidate || isSubmitting || (existingVote && !settings?.allow_vote_changes)}
                  className="flex-1 text-white"
                  style={{ background: getClanStyle().background }}
                >
                  {isSubmitting ? "Submitting..." : existingVote ? "Update Vote" : "Cast Vote"}
                </Button>
              </div>
            </>
          )}
        </Card>
      </div>

      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Your Vote</AlertDialogTitle>
            <AlertDialogDescription>
              {existingVote && !settings?.allow_vote_changes
                ? "Are you sure you want to update your vote? This action cannot be undone."
                : "Are you sure you want to cast this vote?"}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmSubmit}>Confirm</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ClanVoting;
