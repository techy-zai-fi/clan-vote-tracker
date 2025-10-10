import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle, Loader2, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";

const VotingSupervisor = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [stationId, setStationId] = useState("station-1");
  const [loading, setLoading] = useState(false);
  const [completedVoter, setCompletedVoter] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Authentication Required",
          description: "Please log in to access the voting supervisor",
          variant: "destructive",
        });
        navigate('/auth');
      }
    };
    checkAuth();
  }, [navigate, toast]);

  useEffect(() => {
    // Subscribe to voting session updates
    const channel = supabase
      .channel('voting-supervisor-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'voting_sessions'
        },
        (payload) => {
          console.log('Voting session updated:', payload);
          if (payload.new.status === 'completed') {
            setCompletedVoter(payload.new.voter_name || payload.new.voter_email);
            toast({
              title: "✓ Vote Complete",
              description: `${payload.new.voter_name || payload.new.voter_email} has completed voting`,
            });
            
            // Auto-clear after 3 seconds
            setTimeout(() => {
              setCompletedVoter(null);
              setSearchTerm("");
            }, 3000);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!searchTerm.trim()) {
      toast({
        title: "Error",
        description: "Please enter email or registration number",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Search for voter
      const { data: voter, error: voterError } = await supabase
        .from('voter_registry')
        .select('*')
        .or(`email.eq.${searchTerm},reg_num.eq.${searchTerm}`)
        .single();

      if (voterError || !voter) {
        toast({
          title: "Voter Not Found",
          description: "No voter found with that email or registration number",
          variant: "destructive",
        });
        return;
      }

      // Create voting session
      const { error: sessionError } = await supabase
        .from('voting_sessions')
        .insert({
          station_id: stationId,
          voter_email: voter.email,
          voter_regnum: voter.reg_num,
          voter_clan: voter.clan,
          voter_name: voter.name,
          status: 'pending'
        });

      if (sessionError) {
        console.error('Session error:', sessionError);
        toast({
          title: "Error",
          description: "Failed to create voting session",
          variant: "destructive",
        });
        return;
      }

      // Log to audit
      await supabase.from('audit_log').insert({
        action: 'voting_session_created',
        actor_label: `Admin for ${voter.name}`,
        payload_json: { station_id: stationId, voter: voter.email }
      });

      toast({
        title: "Voter Sent",
        description: `${voter.name} sent to ${stationId}`,
      });

      setSearchTerm("");
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <Card className="p-8">
          <div className="flex items-center gap-3 mb-6">
            <Users className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">Voting Supervisor</h1>
              <p className="text-muted-foreground">Admin Station - Send voters to voting stations</p>
            </div>
          </div>

          {completedVoter && (
            <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
              <CheckCircle className="h-6 w-6 text-green-500" />
              <div>
                <p className="font-semibold text-green-700 dark:text-green-400">Vote Complete!</p>
                <p className="text-sm text-green-600 dark:text-green-500">{completedVoter} has finished voting</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="station">Select Voting Station</Label>
              <Select value={stationId} onValueChange={setStationId}>
                <SelectTrigger id="station">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="station-1">Station 1</SelectItem>
                  <SelectItem value="station-2">Station 2</SelectItem>
                  <SelectItem value="station-3">Station 3</SelectItem>
                  <SelectItem value="station-4">Station 4</SelectItem>
                  <SelectItem value="station-5">Station 5</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="search">Voter Email or Registration Number</Label>
              <Input
                id="search"
                type="text"
                placeholder="Enter email or registration number"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                disabled={loading}
                className="text-lg"
              />
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 text-lg"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Sending to Station...
                </>
              ) : (
                'Send Voter to Station'
              )}
            </Button>
          </form>
        </Card>

        <div className="text-center text-sm text-muted-foreground">
          <p>Voters will appear automatically on the selected voting station</p>
          <p>You'll receive a notification when they complete their vote</p>
        </div>
      </div>
    </div>
  );
};

export default VotingSupervisor;
