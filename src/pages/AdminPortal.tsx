import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Session, User } from "@supabase/supabase-js";
import { 
  Settings, 
  Users, 
  Trophy, 
  Shield, 
  BarChart3, 
  LogOut,
  Palette,
  FileText,
  LayoutDashboard,
  Mail,
  UserCheck,
  Layers
} from "lucide-react";
import AdminDashboard from "@/components/admin/AdminDashboard";
import BrandingSettings from "@/components/admin/BrandingSettings";
import VoterManagement from "@/components/admin/VoterManagement";
import CandidateManagement from "@/components/admin/CandidateManagement";
import ClanManagement from "@/components/admin/ClanManagement";
import VotingRules from "@/components/admin/VotingRules";
import ElectionSettings from "@/components/admin/ElectionSettings";
import StatsView from "@/components/admin/StatsView";
import AdminEmailManagement from "@/components/admin/AdminEmailManagement";

const AdminPortal = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session) {
          setTimeout(() => {
            checkUserRole(session.user.id);
          }, 0);
        } else {
          setIsAdmin(false);
          setLoading(false);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session) {
        checkUserRole(session.user.id);
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkUserRole = async (userId: string) => {
    try {
      const { data: roles } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);
      
      if (roles && roles.some(r => r.role === 'admin')) {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
        toast({
          title: "Access Denied",
          description: "You are not authorized to access the admin portal.",
          variant: "destructive",
        });
        navigate('/auth');
      }
    } catch (error) {
      console.error('Error checking user role:', error);
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
    toast({
      title: "Logged out",
      description: "You have been logged out of the admin portal",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8">
          <p className="text-muted-foreground">Loading...</p>
        </Card>
      </div>
    );
  }

  if (!user || !isAdmin) {
    navigate('/auth');
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Admin Portal</h1>
            <p className="text-sm text-primary-foreground/80">IIMBG Elections Management</p>
          </div>
          <Button 
            variant="outline" 
            onClick={handleLogout}
            className="border-primary-foreground/20 text-primary-foreground hover:bg-white/10"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Card className="mb-6 p-6 bg-gradient-to-r from-primary/10 via-primary/5 to-background">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Voting Station Management
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
            <Button 
              onClick={() => window.open('/voting-supervisor', '_blank')}
              variant="default"
              className="w-full"
              size="lg"
            >
              <Users className="mr-2 h-5 w-5" />
              Voting Supervisor
            </Button>
            <Button 
              onClick={() => window.open('/voting-station/station-1', '_blank')}
              variant="outline"
              className="w-full"
              size="lg"
            >
              Station 1
            </Button>
            <Button 
              onClick={() => window.open('/voting-station/station-2', '_blank')}
              variant="outline"
              className="w-full"
              size="lg"
            >
              Station 2
            </Button>
            <Button 
              onClick={() => window.open('/voting-station/station-3', '_blank')}
              variant="outline"
              className="w-full"
              size="lg"
            >
              Station 3
            </Button>
            <Button 
              onClick={() => window.open('/voting-station/station-4', '_blank')}
              variant="outline"
              className="w-full"
              size="lg"
            >
              Station 4
            </Button>
          </div>
        </Card>

        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-9 lg:w-auto lg:inline-grid">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="branding" className="flex items-center gap-2">
              <Palette className="h-4 w-4" />
              Branding
            </TabsTrigger>
            <TabsTrigger value="voters" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Voters
            </TabsTrigger>
            <TabsTrigger value="candidates" className="flex items-center gap-2">
              <UserCheck className="h-4 w-4" />
              Candidates
            </TabsTrigger>
            <TabsTrigger value="clans" className="flex items-center gap-2">
              <Layers className="h-4 w-4" />
              Clans
            </TabsTrigger>
            <TabsTrigger value="rules" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Rules
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </TabsTrigger>
            <TabsTrigger value="stats" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Stats
            </TabsTrigger>
            <TabsTrigger value="admins" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Admins
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <AdminDashboard />
          </TabsContent>

          <TabsContent value="branding">
            <BrandingSettings />
          </TabsContent>

          <TabsContent value="voters">
            <VoterManagement />
          </TabsContent>

          <TabsContent value="candidates">
            <CandidateManagement />
          </TabsContent>

          <TabsContent value="clans">
            <ClanManagement />
          </TabsContent>

          <TabsContent value="rules">
            <VotingRules />
          </TabsContent>

          <TabsContent value="settings">
            <ElectionSettings />
          </TabsContent>

          <TabsContent value="stats">
            <StatsView />
          </TabsContent>

          <TabsContent value="admins">
            <AdminEmailManagement />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminPortal;
