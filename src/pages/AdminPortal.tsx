import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  LayoutDashboard, 
  Users, 
  UserCheck, 
  Layers, 
  Settings, 
  BarChart3, 
  Download,
  FileText,
  Lock
} from "lucide-react";
import AdminDashboard from "@/components/admin/AdminDashboard";
import VoterManagement from "@/components/admin/VoterManagement";
import CandidateManagement from "@/components/admin/CandidateManagement";
import ClanManagement from "@/components/admin/ClanManagement";
import ElectionSettings from "@/components/admin/ElectionSettings";
import StatsView from "@/components/admin/StatsView";

const AdminPortal = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check if already authenticated in session
    const adminAuth = sessionStorage.getItem('admin_authenticated');
    if (adminAuth === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // For offline mode, we'll use a simple hardcoded check
      // In production, this should verify against admin_credentials table with bcrypt
      // Default password is "admin123"
      if (password === "admin123") {
        sessionStorage.setItem('admin_authenticated', 'true');
        setIsAuthenticated(true);
        
        // Log access
        await supabase.from('audit_log').insert({
          actor_label: 'admin',
          action: 'ADMIN_LOGIN',
          payload_json: { timestamp: new Date().toISOString() },
        });

        toast({
          title: "Access granted",
          description: "Welcome to the admin portal",
        });
      } else {
        toast({
          title: "Access denied",
          description: "Incorrect password",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Error",
        description: "Failed to authenticate",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('admin_authenticated');
    setIsAuthenticated(false);
    setPassword("");
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary via-accent to-primary flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8 bg-white/95 backdrop-blur-sm">
          <div className="text-center mb-8">
            <div className="inline-block p-3 bg-primary rounded-full mb-4">
              <Lock className="h-10 w-10 text-primary-foreground" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Admin Portal</h1>
            <p className="text-muted-foreground">Enter password to access</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter admin password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <p className="text-xs text-muted-foreground">
                Default password: admin123
              </p>
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
            >
              {isLoading ? "Authenticating..." : "Access Admin Portal"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Link to="/" className="text-sm text-primary hover:underline">
              ← Back to Home
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Admin Portal</h1>
            <p className="text-sm text-primary-foreground/80">IIMBG Elections Management</p>
          </div>
          <div className="flex gap-3">
            <Link to="/">
              <Button variant="ghost" className="text-primary-foreground hover:bg-white/10">
                View Public Site
              </Button>
            </Link>
            <Button 
              variant="outline" 
              onClick={handleLogout}
              className="border-primary-foreground/20 text-primary-foreground hover:bg-white/10"
            >
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-7 lg:w-auto lg:inline-grid">
            <TabsTrigger value="dashboard" className="gap-2">
              <LayoutDashboard className="h-4 w-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="voters" className="gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Voters</span>
            </TabsTrigger>
            <TabsTrigger value="candidates" className="gap-2">
              <UserCheck className="h-4 w-4" />
              <span className="hidden sm:inline">Candidates</span>
            </TabsTrigger>
            <TabsTrigger value="clans" className="gap-2">
              <Layers className="h-4 w-4" />
              <span className="hidden sm:inline">Clans</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Settings</span>
            </TabsTrigger>
            <TabsTrigger value="stats" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Stats</span>
            </TabsTrigger>
            <TabsTrigger value="audit" className="gap-2">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Audit</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <AdminDashboard />
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

          <TabsContent value="settings">
            <ElectionSettings />
          </TabsContent>

          <TabsContent value="stats">
            <StatsView />
          </TabsContent>

          <TabsContent value="audit">
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4">Audit Log</h2>
              <p className="text-muted-foreground">Coming soon: View all system activity</p>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminPortal;
