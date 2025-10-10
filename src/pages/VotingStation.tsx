import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, MonitorCheck } from "lucide-react";

const VotingStation = () => {
  const { stationId } = useParams();
  const [waiting, setWaiting] = useState(true);
  const [voterName, setVoterName] = useState("");
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
          setWaiting(false);

          // Update status to 'voting'
          await supabase
            .from('voting_sessions')
            .update({ status: 'voting' })
            .eq('id', session.id);

          // Store voter info and navigate to voting page
          sessionStorage.setItem('voter', JSON.stringify({
            email: session.voter_email,
            reg_num: session.voter_regnum,
            clan: session.voter_clan,
            name: session.voter_name,
            sessionId: session.id,
            stationId: stationId
          }));

          // Navigate to clan voting page
          setTimeout(() => {
            navigate(`/vote/${session.voter_clan}`);
          }, 1500);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [stationId, navigate, toast]);

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
              This station will automatically load the voting page when a voter is assigned
            </p>
          </div>
        ) : (
          <div className="space-y-4 py-8 animate-in fade-in slide-in-from-bottom-4">
            <div className="h-12 w-12 mx-auto rounded-full bg-green-500/20 flex items-center justify-center">
              <div className="h-6 w-6 rounded-full bg-green-500 animate-pulse"></div>
            </div>
            <p className="text-xl font-semibold text-green-600 dark:text-green-400">
              Loading voting page for
            </p>
            <p className="text-2xl font-bold">{voterName}</p>
          </div>
        )}

        <div className="pt-4 border-t text-sm text-muted-foreground">
          Station ID: <span className="font-mono font-semibold">{stationId}</span>
        </div>
      </Card>
    </div>
  );
};

export default VotingStation;
