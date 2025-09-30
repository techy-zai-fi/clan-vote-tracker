import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Download, TrendingUp, Users, Award } from "lucide-react";
import Papa from "papaparse";

const StatsView = () => {
  const [stats, setStats] = useState<any>({
    totalVoters: 0,
    totalVotes: 0,
    uniqueVoters: 0,
    turnout: 0,
    byBatch: {},
    byGender: {},
    byClan: {},
    candidateStats: [],
  });

  useEffect(() => {
    loadDetailedStats();
  }, []);

  const loadDetailedStats = async () => {
    try {
      // Get all data
      const [
        { count: voterCount },
        { data: votes },
        { data: candidates },
      ] = await Promise.all([
        supabase.from('voter_registry').select('*', { count: 'exact', head: true }),
        supabase.from('votes').select('*, voter_registry!inner(gender, batch)'),
        supabase.from('candidates').select('*, votes(count)'),
      ]);

      // Calculate stats
      const uniqueVoters = new Set(votes?.map(v => v.voter_email) || []).size;
      const turnout = voterCount ? (uniqueVoters / voterCount) * 100 : 0;

      // Group by batch
      const batchGroups: Record<string, number> = {};
      votes?.forEach((vote: any) => {
        const batch = vote.voter_registry?.batch || 'Unknown';
        batchGroups[batch] = (batchGroups[batch] || 0) + 1;
      });

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

      // Candidate stats
      const candidateStats = candidates?.map((c: any) => ({
        ...c,
        voteCount: c.votes?.[0]?.count || 0,
      })).sort((a, b) => b.voteCount - a.voteCount) || [];

      setStats({
        totalVoters: voterCount || 0,
        totalVotes: votes?.length || 0,
        uniqueVoters,
        turnout: Math.round(turnout),
        byBatch: batchGroups,
        byGender: genderGroups,
        byClan: clanGroups,
        candidateStats,
      });
    } catch (error) {
      console.error('Stats error:', error);
    }
  };

  const exportStats = () => {
    const data = [
      { Category: 'Overview', Metric: 'Total Voters', Value: stats.totalVoters },
      { Category: 'Overview', Metric: 'Total Votes Cast', Value: stats.totalVotes },
      { Category: 'Overview', Metric: 'Unique Voters', Value: stats.uniqueVoters },
      { Category: 'Overview', Metric: 'Turnout %', Value: stats.turnout },
      ...Object.entries(stats.byBatch).map(([batch, count]) => ({
        Category: 'By Batch',
        Metric: batch,
        Value: count,
      })),
      ...Object.entries(stats.byGender).map(([gender, count]) => ({
        Category: 'By Gender',
        Metric: gender,
        Value: count,
      })),
      ...Object.entries(stats.byClan).map(([clan, count]) => ({
        Category: 'By Clan',
        Metric: clan,
        Value: count,
      })),
    ];

    const csv = Papa.unparse(data);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'election-stats.csv';
    a.click();
  };

  const exportCandidateResults = () => {
    const data = stats.candidateStats.map((c: any) => ({
      Name: c.name,
      Clan: c.clan_id,
      Batch: c.batch,
      Gender: c.gender,
      'Vote Count': c.voteCount,
      Year: c.year,
    }));

    const csv = Papa.unparse(data);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'candidate-results.csv';
    a.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Detailed Statistics</h2>
          <p className="text-muted-foreground">Comprehensive election analytics</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={exportStats} variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Stats
          </Button>
          <Button onClick={exportCandidateResults} variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Results
          </Button>
        </div>
      </div>

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
            <div className="p-3 bg-green-100 rounded-full">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Votes Cast</p>
              <p className="text-3xl font-bold">{stats.totalVotes}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 rounded-full">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Unique Voters</p>
              <p className="text-3xl font-bold">{stats.uniqueVoters}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-orange-100 rounded-full">
              <Award className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Turnout</p>
              <p className="text-3xl font-bold">{stats.turnout}%</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Breakdowns */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Users className="h-5 w-5" />
            Votes by Batch
          </h3>
          <div className="space-y-3">
            {Object.entries(stats.byBatch).map(([batch, count]: [string, any]) => (
              <div key={batch} className="flex justify-between items-center">
                <span className="font-medium">{batch}</span>
                <div className="text-right">
                  <span className="text-muted-foreground mr-2">{count}</span>
                  <span className="text-xs text-muted-foreground">
                    ({Math.round((count / stats.totalVotes) * 100)}%)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Users className="h-5 w-5" />
            Votes by Gender
          </h3>
          <div className="space-y-3">
            {Object.entries(stats.byGender).map(([gender, count]: [string, any]) => (
              <div key={gender} className="flex justify-between items-center">
                <span className="font-medium">{gender}</span>
                <div className="text-right">
                  <span className="text-muted-foreground mr-2">{count}</span>
                  <span className="text-xs text-muted-foreground">
                    ({Math.round((count / stats.totalVotes) * 100)}%)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Award className="h-5 w-5" />
            Votes by Clan
          </h3>
          <div className="space-y-3">
            {Object.entries(stats.byClan).map(([clan, count]: [string, any]) => (
              <div key={clan} className="flex justify-between items-center">
                <span className="font-medium">{clan}</span>
                <div className="text-right">
                  <span className="text-muted-foreground mr-2">{count}</span>
                  <span className="text-xs text-muted-foreground">
                    ({Math.round((count / stats.totalVotes) * 100)}%)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Top Candidates */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Candidate Rankings</h3>
        <div className="space-y-2">
          {stats.candidateStats.slice(0, 20).map((candidate: any, index: number) => (
            <div 
              key={candidate.id}
              className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50"
            >
              <div className="flex items-center gap-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                  index === 0 ? 'bg-yellow-100 text-yellow-700' :
                  index === 1 ? 'bg-gray-100 text-gray-700' :
                  index === 2 ? 'bg-orange-100 text-orange-700' :
                  'bg-muted text-muted-foreground'
                }`}>
                  {index + 1}
                </div>
                <div>
                  <p className="font-semibold">{candidate.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {candidate.clan_id} • {candidate.batch} • Year {candidate.year}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">{candidate.voteCount}</p>
                <p className="text-xs text-muted-foreground">votes</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default StatsView;
