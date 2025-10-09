import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Shield, LogIn } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Session, User } from "@supabase/supabase-js";

const Auth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state change:', event, session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session) {
          // Check if user is admin and redirect
          setTimeout(() => {
            checkUserRole(session.user.id);
          }, 0);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session check:', session?.user?.email);
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session) {
        checkUserRole(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Surface OAuth errors returned in the URL hash
  useEffect(() => {
    const hash = window.location.hash;
    if (hash && hash.includes('error=')) {
      const params = new URLSearchParams(hash.replace(/^#/, ''));
      const error = params.get('error');
      const code = params.get('error_code');
      const desc = params.get('error_description');
      console.error('OAuth error:', { error, code, desc });
      toast({
        title: 'Sign in failed',
        description: desc ? decodeURIComponent(desc) : 'Authentication failed. Please try again.',
        variant: 'destructive',
      });
      // Clean the URL hash to avoid repeated toasts
      history.replaceState(null, '', window.location.pathname + window.location.search);
    }
  }, [toast]);

  // Handle token handoff for local development: set session from tokens in URL
  useEffect(() => {
    const hash = window.location.hash;
    if (hash && (hash.includes('access_token=') || hash.includes('refresh_token='))) {
      const params = new URLSearchParams(hash.replace(/^#/, ''));
      const access_token = params.get('access_token');
      const refresh_token = params.get('refresh_token');
      if (access_token && refresh_token) {
        supabase.auth
          .setSession({ access_token, refresh_token })
          .catch(() => console.error('Failed to set session from tokens'))
          .finally(() => {
            history.replaceState(null, '', window.location.pathname + window.location.search);
          });
        return;
      }
      // Clean even if incomplete
      history.replaceState(null, '', window.location.pathname + window.location.search);
    }
  }, []);

  const checkUserRole = async (userId: string) => {
    console.log('Checking user role for:', userId);
    const { data: roles, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId);
    
    console.log('User roles:', roles, 'Error:', error);
    
    if (roles && roles.some(r => r.role === 'admin')) {
      console.log('User is admin, redirecting to /admin');

      // Check if we need to redirect to a different origin
      const storedOrigin = localStorage.getItem('oauth_origin');
      if (storedOrigin && storedOrigin !== window.location.origin) {
        try {
          if (storedOrigin.startsWith('http://localhost')) {
            const { data } = await supabase.auth.getSession();
            const at = data.session?.access_token ?? session?.access_token ?? undefined;
            const rt = data.session?.refresh_token ?? session?.refresh_token ?? undefined;
            localStorage.removeItem('oauth_origin');
            if (at && rt) {
              const target = `${storedOrigin}/auth#access_token=${encodeURIComponent(at)}&refresh_token=${encodeURIComponent(rt)}`;
              window.location.href = target;
              return;
            }
            // Fallback: bounce to local /auth without tokens
            window.location.href = `${storedOrigin}/auth`;
            return;
          } else {
            localStorage.removeItem('oauth_origin');
            window.location.href = `${storedOrigin}/admin`;
            return;
          }
        } catch {
          localStorage.removeItem('oauth_origin');
          window.location.href = `${storedOrigin}/admin`;
          return;
        }
      }

      localStorage.removeItem('oauth_origin');
      navigate('/admin');
    } else {
      console.log('User is not admin');
      localStorage.removeItem('oauth_origin');
      toast({
        title: "Access Denied",
        description: "You are not authorized to access the admin portal.",
        variant: "destructive",
      });
      await supabase.auth.signOut();
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      // Store the current origin to redirect back after OAuth
      localStorage.setItem('oauth_origin', window.location.origin);
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      });

      if (error) throw error;
    } catch (error: any) {
      console.error('Sign in error:', error);
      toast({
        title: "Sign in failed",
        description: error.message || "Failed to sign in with Google",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="p-8 max-w-md w-full text-center">
          <Shield className="h-12 w-12 mx-auto mb-4 text-primary" />
          <h2 className="text-2xl font-bold mb-2">Verifying Access</h2>
          <p className="text-muted-foreground">
            Checking your permissions...
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-background flex items-center justify-center p-4">
      <Card className="p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <Shield className="h-16 w-16 mx-auto mb-4 text-primary" />
          <h1 className="text-3xl font-bold mb-2">Admin Portal</h1>
          <p className="text-muted-foreground">
            Sign in with your authorized email to access the admin dashboard
          </p>
        </div>

        <Button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full"
          size="lg"
        >
          <LogIn className="mr-2 h-5 w-5" />
          {loading ? "Signing in..." : "Sign in with Google"}
        </Button>

        <p className="text-xs text-center text-muted-foreground mt-6">
          Only authorized admin emails can access this portal
        </p>
      </Card>
    </div>
  );
};

export default Auth;
