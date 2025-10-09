import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Shield } from "lucide-react";
import { Session, User } from "@supabase/supabase-js";

const VoteHub = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session) {
          setTimeout(() => {
            checkUserAndRedirect(session.user);
          }, 0);
        } else {
          setLoading(false);
          navigate('/auth');
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session) {
        checkUserAndRedirect(session.user);
      } else {
        setLoading(false);
        navigate('/auth');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const checkUserAndRedirect = async (user: User) => {
    try {
      // Get user's clan from voter registry
      const { data: voterData } = await supabase
        .from('voter_registry')
        .select('*')
        .eq('email', user.email)
        .single();

      if (voterData?.clan) {
        // Redirect to their clan voting page
        navigate(`/vote/${voterData.clan}`);
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.error('Error checking user:', error);
      setLoading(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8 text-center">
          <Shield className="h-12 w-12 mx-auto mb-4 text-primary animate-pulse" />
          <p className="text-muted-foreground">Loading...</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Card className="p-8 text-center max-w-md">
        <h2 className="text-2xl font-bold mb-4">Redirecting...</h2>
        <p className="text-muted-foreground">
          Taking you to your clan voting page.
        </p>
      </Card>
    </div>
  );
};

export default VoteHub;
