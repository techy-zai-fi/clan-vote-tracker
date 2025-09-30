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

      // Count votes
      const { data: votes, count: voteCount } = await supabase
        .from('votes')
        .select('*, voter_registry!inner(gender)', { count: 'exact' });

      // Calculate turnout
      const uniqueVoters = new Set(votes?.map(v => v.voter_email) || []).size;
      const turnout = voterCount ? (uniqueVoters / voterCount) * 100 : 0;

      // Group by gender
      const genderGroups: Record<string, number> = {};
      votes?.forEach((vote: any) => {
        const gender = vote.voter_registry?.gender || 'Unknown';
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
