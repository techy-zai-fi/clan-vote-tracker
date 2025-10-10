import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Users, UserCheck, Vote, TrendingUp } from "lucide-react";

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalVoters: 0,
    totalCandidates: 0,
    totalVotes: 0,
    turnoutPercent: 0,
    votesByGender: {} as Record<string, number>,
    votesByClan: {} as Record<string, number>,
  });
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    loadStats();

    // Subscribe to real-time vote updates
    const channel = supabase
      .channel('dashboard-votes-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'votes'
        },
        (payload) => {
          console.log('Vote change detected:', payload);
          loadStats();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadStats = async () => {
    try {
      // Get settings
      const { data: settingsData } = await supabase
        .from('election_settings')
        .select('*')
        .eq('id', 1)
        .single();
      setSettings(settingsData);

      // Count voters
      const { count: voterCount } = await supabase
        .from('voter_registry')
        .select('*', { count: 'exact', head: true });

      // Count candidates
      const { count: candidateCount } = await supabase
        .from('candidates')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);

      // Count votes and get all voters
      const [
        { data: votes, count: voteCount },
        { data: voters }
      ] = await Promise.all([
        supabase.from('votes').select('*', { count: 'exact' }),
        supabase.from('voter_registry').select('*')
      ]);

      // Calculate turnout
      const uniqueVoters = new Set(votes?.map((v: any) => v.voter_email) || []).size;
      const turnout = voterCount ? (uniqueVoters / voterCount) * 100 : 0;

      // Create lookup maps for voter info
      const votersByEmail = new Map((voters || []).map((v: any) => [v.email, v]));
      const votersByReg = new Map((voters || []).map((v: any) => [v.reg_num, v]));

      // Group by gender
      const genderGroups: Record<string, number> = {};
      votes?.forEach((vote: any) => {
        const vinfo = votersByEmail.get(vote.voter_email) || votersByReg.get(vote.voter_regnum);
        const gender = vinfo?.gender || 'Unknown';
        genderGroups[gender] = (genderGroups[gender] || 0) + 1;
      });

      // Group by clan
      const clanGroups: Record<string, number> = {};
      votes?.forEach((vote: any) => {
        clanGroups[vote.clan_id] = (clanGroups[vote.clan_id] || 0) + 1;
      });

      setStats({
        totalVoters: voterCount || 0,
        totalCandidates: candidateCount || 0,
        totalVotes: voteCount || 0,
        turnoutPercent: Math.round(turnout),
        votesByGender: genderGroups,
        votesByClan: clanGroups,
      });
    } catch (error) {
      console.error('Stats error:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2">Dashboard</h2>
        <p className="text-muted-foreground">Election overview and quick stats</p>
      </div>

      {/* Status Banner */}
      <Card className={`p-6 ${settings?.is_live ? 'bg-green-50 border-green-200' : 'bg-muted'}`}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Election Status</h3>
            <p className={settings?.is_live ? 'text-green-700' : 'text-muted-foreground'}>
              {settings?.is_live ? '🟢 Live - Voting is active' : '⚫ Offline - Voting not started'}
            </p>
            {settings?.frozen && (
              <p className="text-destructive font-medium mt-1">🔒 Results Frozen</p>
            )}
          </div>
          <div className="text-right">
            {settings?.start_at && (
              <p className="text-sm text-muted-foreground">
                Start: {new Date(settings.start_at).toLocaleDateString()}
              </p>
            )}
            {settings?.end_at && (
              <p className="text-sm text-muted-foreground">
                End: {new Date(settings.end_at).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>
      </Card>

      {/* Key Metrics */}
      <div className="grid md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-full">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Voters</p>
              <p className="text-3xl font-bold">{stats.totalVoters}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 rounded-full">
              <UserCheck className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Candidates</p>
              <p className="text-3xl font-bold">{stats.totalCandidates}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-full">
              <Vote className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Votes Cast</p>
              <p className="text-3xl font-bold">{stats.totalVotes}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-orange-100 rounded-full">
              <TrendingUp className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Turnout</p>
              <p className="text-3xl font-bold">{stats.turnoutPercent}%</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Breakdown */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Votes by Clan</h3>
          <div className="space-y-3">
            {Object.entries(stats.votesByClan).map(([clan, count]) => (
              <div key={clan} className="flex justify-between items-center">
                <span className="font-medium">{clan}</span>
                <span className="text-muted-foreground">{count} votes</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Votes by Gender</h3>
          <div className="space-y-3">
            {Object.entries(stats.votesByGender).map(([gender, count]) => (
              <div key={gender} className="flex justify-between items-center">
                <span className="font-medium">{gender}</span>
                <span className="text-muted-foreground">{count} votes</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
