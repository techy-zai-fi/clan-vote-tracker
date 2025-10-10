import { useEffect } from "react";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const VoteHub = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkSessionAndRedirect = async () => {
      // Check if admin is logged in
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: "Session Required",
          description: "Please log in to supervise voting",
          variant: "destructive",
        });
        navigate('/auth');
        return;
      }

      // Check for voter data in sessionStorage
      const storedVoter = sessionStorage.getItem('voter');
      
      if (storedVoter) {
        const voterData = JSON.parse(storedVoter);
        if (voterData.clan) {
          navigate(`/vote/${voterData.clan}`);
        } else {
          navigate('/voters');
        }
      } else {
        // No voter selected, go to lookup page
        navigate('/voters');
      }
    };

    checkSessionAndRedirect();
  }, [navigate, toast]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Card className="p-8 text-center">
        <Shield className="h-12 w-12 mx-auto mb-4 text-primary animate-pulse" />
        <p className="text-muted-foreground">Loading...</p>
      </Card>
    </div>
  );
};

export default VoteHub;
