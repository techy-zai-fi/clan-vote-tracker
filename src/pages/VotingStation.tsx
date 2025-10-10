import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, MonitorCheck, CheckCircle } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
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

const VotingStation = () => {
  const { stationId } = useParams();
  const [waiting, setWaiting] = useState(true);
  const [voterName, setVoterName] = useState("");
  const [voter, setVoter] = useState<any>(null);
  const [sessionId, setSessionId] = useState<string>("");
  const [clan, setClan] = useState<any>(null);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState("");
  const [settings, setSettings] = useState<any>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!stationId) {
      toast({
        title: "Invalid Station",
        description: "No station ID provided",
        variant: "destructive",
      });
      return;
    }

    console.log(`Station ${stationId} initialized, waiting for voters...`);

    // Subscribe to new voting sessions for this station
    const channel = supabase
      .channel(`station-${stationId}-queue`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'voting_sessions',
          filter: `station_id=eq.${stationId}`
        },
        async (payload) => {
          console.log('New voter assigned to this station:', payload);
          const session = payload.new;
          
          setVoterName(session.voter_name || session.voter_email);
          setSessionId(session.id);
          setWaiting(false);

          // Update status to 'voting'
          await supabase
            .from('voting_sessions')
            .update({ status: 'voting' })
            .eq('id', session.id);

          // Load voter data and candidates
          const voterData = {
            email: session.voter_email,
            reg_num: session.voter_regnum,
            clan: session.voter_clan,
            name: session.voter_name,
            batch: session.voter_batch,
            year: session.voter_year
          };
          
          setVoter(voterData);
          await loadVotingData(voterData, session.id);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [stationId, navigate, toast]);

  const loadVotingData = async (voterData: any, sessionId: string) => {
    // Load clan
    const { data: clanData } = await supabase
      .from('clans')
      .select('*')
      .eq('id', voterData.clan)
      .single();
    
    if (clanData) setClan(clanData);

    // Load settings
    const { data: settingsData } = await supabase
      .from('election_settings')
      .select('*')
      .eq('id', 1)
      .single();
    
    if (settingsData) setSettings(settingsData);

    // Load voting rules to determine candidates
    const { data: rulesData } = await supabase
      .from('voting_rules')
      .select('*')
      .eq('is_active', true)
      .or(`voter_batch.eq.${voterData.batch},voter_batch.eq.All`);

    let candidatesData = [];
    
    if (rulesData && rulesData.length > 0) {
      const applicableRule = rulesData.find(rule => 
        (rule.voter_batch === voterData.batch || rule.voter_batch === 'All') &&
        (!rule.voter_section || rule.voter_section === String(voterData.year))
      );

      if (applicableRule) {
        let query = supabase
          .from('candidates')
          .select('*')
          .eq('clan_id', voterData.clan)
          .eq('is_active', true);

        if (applicableRule.can_vote_for_batch !== 'All') {
          query = query.eq('batch', applicableRule.can_vote_for_batch);
        }

        if (applicableRule.can_vote_for_section) {
          query = query.eq('year', parseInt(applicableRule.can_vote_for_section));
        }

        const { data } = await query;
        candidatesData = data || [];
      }
    } else {
      const { data } = await supabase
        .from('candidates')
        .select('*')
        .eq('clan_id', voterData.clan)
        .eq('batch', voterData.batch)
        .eq('is_active', true);
      
      candidatesData = data || [];
    }
    
    setCandidates(candidatesData);
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

    setShowConfirm(true);
  };

  const confirmSubmit = async () => {
    setIsSubmitting(true);
    setShowConfirm(false);

    try {
      const voteData = {
        voter_email: voter.email,
        voter_regnum: voter.reg_num,
        clan_id: voter.clan,
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
        action: 'CAST_VOTE',
        payload_json: { 
          clan_id: voter.clan, 
          candidate_id: selectedCandidate,
          station_session: sessionId 
        },
      });

      // Update session status
      await supabase
        .from('voting_sessions')
        .update({ 
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('id', sessionId);

      // Play beep sound
      try {
        const beep = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGB0fPTgjMGHm7A7+OZRQ0PVKzm77BdGAg+ltryxnMpBSuAzvLaizsIGGS57OShTA0NTqnk8LlnHwU9k9rzyHosBCZ7yvDZij4KDFW07OqlVxEMRJzf8rpqJAU2gtPz0oA0BhxqvO7mnEoODlKo5O+zYBoGPJPa8sdyKgUpf8zy24k8CBlkvOrpoVEOClCl4vC4Zh4FN4TT89KCNQYbaLru5qBJDQpUq+TwsmEbBjyT2/LHcioFKX/M8tyIOggYY77r56JODwtQp+PwtmMfBTaF1PPTgjYGGme97uagSQ0KVKzk8LJgGgY8k9vyxnMpBSp/zPLciTwIG2S96+aiTA0MTqfk8LljHgU2hdTz04Q2BhpmvO7mnEoPDFOp5fCyYRoGPJPa88Z0KQUpgMzy3Ik8ChpkvevooU0PDVKq5PCyYhsGO5La88dyKgUrgsvy24k8ChljvevpoVANC1Gq5PCyYxsGOpLb88ZyKQUrf8zx3Io8Chtkvevno00ODU6m5PCzYh0FN4TU89OBNQYaaLzu5ZxKDgtTqOTwsmEbBjuS2/PGcikFK3/M8duKPAoZY73r6aJPDgtQqOPws2IdBjaF1PPTgTUGGWi87uacSQ0KU6fk77NgGgY7k9vxx3EpBSt/zPLbijsJGGS96+ijTw4MU6jk8LFiGwY7ktvzx3EpBSuAy/Hcijwj');
        beep.play();
      } catch (audioError) {
        console.error('Error playing beep:', audioError);
      }

      toast({
        title: "Vote Recorded!",
        description: "Thank you for voting. Preparing for next voter...",
      });

      // Reset state for next voter
      setTimeout(() => {
        setWaiting(true);
        setVoter(null);
        setVoterName("");
        setSessionId("");
        setClan(null);
        setCandidates([]);
        setSelectedCandidate("");
      }, 2000);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-background flex items-center justify-center p-8">
      <Card className="p-12 max-w-lg w-full text-center space-y-6">
        <MonitorCheck className="h-20 w-20 mx-auto text-primary" />
        
        <div>
          <h1 className="text-4xl font-bold mb-2">Voting Station</h1>
          <p className="text-xl text-muted-foreground">{stationId?.toUpperCase()}</p>
        </div>

        {waiting ? (
          <div className="space-y-4 py-8">
            <Loader2 className="h-12 w-12 mx-auto animate-spin text-primary" />
            <p className="text-lg text-muted-foreground">Waiting for voter...</p>
            <p className="text-sm text-muted-foreground">
              Supervisor will assign a voter to this station
            </p>
          </div>
        ) : voter && candidates.length > 0 ? (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <div className="p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <p className="font-semibold text-green-900 dark:text-green-100">Voter Ready</p>
              </div>
              <p className="text-sm text-green-700 dark:text-green-300">
                {voterName} • {voter.batch} • {clan?.name}
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Select a Candidate:</h3>
              <RadioGroup value={selectedCandidate} onValueChange={setSelectedCandidate}>
                <div className="space-y-3">
                  {candidates.map((candidate) => (
                    <Card key={candidate.id} className="p-4 hover:bg-accent/5 cursor-pointer transition-colors">
                      <div className="flex items-start gap-3">
                        <RadioGroupItem value={candidate.id} id={candidate.id} className="mt-1" />
                        <Label htmlFor={candidate.id} className="flex-1 cursor-pointer">
                          <div className="flex gap-3">
                            {candidate.photo_url && (
                              <img 
                                src={candidate.photo_url} 
                                alt={candidate.name}
                                className="w-16 h-16 rounded-lg object-cover"
                              />
                            )}
                            <div className="flex-1">
                              <h4 className="font-semibold">{candidate.name}</h4>
                              <p className="text-sm text-muted-foreground">
                                {candidate.batch} • Year {candidate.year} • {candidate.gender}
                              </p>
                              {candidate.manifesto && (
                                <p className="text-sm mt-1 line-clamp-2">{candidate.manifesto}</p>
                              )}
                            </div>
                          </div>
                        </Label>
                      </div>
                    </Card>
                  ))}
                </div>
              </RadioGroup>
            </div>

            <Button 
              onClick={handleSubmit}
              disabled={!selectedCandidate || isSubmitting}
              className="w-full text-white text-lg py-6"
              style={{ background: getClanStyle().background }}
              size="lg"
            >
              {isSubmitting ? "Recording Vote..." : "Cast Vote"}
            </Button>
          </div>
        ) : (
          <div className="space-y-4 py-8">
            <Loader2 className="h-12 w-12 mx-auto animate-spin text-primary" />
            <p className="text-lg font-semibold">Loading candidates for {voterName}...</p>
          </div>
        )}

        <div className="pt-4 border-t text-sm text-muted-foreground">
          Station ID: <span className="font-mono font-semibold">{stationId}</span>
        </div>
      </Card>

      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Vote</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cast this vote? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmSubmit}>Confirm Vote</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default VotingStation;
