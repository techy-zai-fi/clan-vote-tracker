import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Download, TrendingUp, Users, Award, ChevronDown, ChevronUp } from "lucide-react";
import Papa from "papaparse";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

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
    clanDetails: [],
  });
  const [openClans, setOpenClans] = useState<Record<string, boolean>>({});

  useEffect(() => {
    loadDetailedStats();

    // Subscribe to real-time vote updates
    const channel = supabase
      .channel('votes-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'votes'
        },
        (payload) => {
          console.log('Vote change detected:', payload);
          loadDetailedStats();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadDetailedStats = async () => {
    try {
      // Get all data
      const [
        { count: voterCount },
        { data: votes },
        { data: candidates },
        { data: clans },
        { data: voters },
      ] = await Promise.all([
        supabase.from('voter_registry').select('*', { count: 'exact', head: true }),
        supabase.from('votes').select('*'),
        supabase.from('candidates').select('*, votes(count)'),
        supabase.from('clans').select('*'),
        supabase.from('voter_registry').select('*'),
      ]);

      // Calculate stats
      const votersByEmail = new Map((voters || []).map((v: any) => [v.email, v]));
      const votersByReg = new Map((voters || []).map((v: any) => [v.reg_num, v]));
      const uniqueVoters = new Set(votes?.map((v: any) => v.voter_email) || []).size;
      const turnout = voterCount ? (uniqueVoters / voterCount) * 100 : 0;

      // Group by batch
      const batchGroups: Record<string, number> = {};
      votes?.forEach((vote: any) => {
        const vinfo = votersByEmail.get(vote.voter_email) || votersByReg.get(vote.voter_regnum);
        const batch = vinfo?.batch || 'Unknown';
        batchGroups[batch] = (batchGroups[batch] || 0) + 1;
      });

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

      // Candidate stats
      const candidateStats = candidates?.map((c: any) => ({
        ...c,
        voteCount: c.votes?.[0]?.count || 0,
      })).sort((a, b) => b.voteCount - a.voteCount) || [];

      // Clan-wise detailed stats
      const clanDetails = clans?.map((clan: any) => {
        const clanVotes = votes?.filter(v => v.clan_id === clan.id) || [];
        const clanVoters = voters?.filter(v => v.clan === clan.id) || [];
        const clanCandidates = candidates?.filter(c => c.clan_id === clan.id) || [];
        const uniqueClanVoters = new Set(clanVotes.map(v => v.voter_email)).size;
        const clanTurnout = clanVoters.length ? (uniqueClanVoters / clanVoters.length) * 100 : 0;

        // Breakdown by batch for this clan
        const clanBatchBreakdown: Record<string, number> = {};
        clanVotes.forEach((vote: any) => {
          const vinfo = votersByEmail.get(vote.voter_email) || votersByReg.get(vote.voter_regnum);
          const batch = vinfo?.batch || 'Unknown';
          clanBatchBreakdown[batch] = (clanBatchBreakdown[batch] || 0) + 1;
        });

        // Breakdown by gender for this clan
        const clanGenderBreakdown: Record<string, number> = {};
        clanVotes.forEach((vote: any) => {
          const vinfo = votersByEmail.get(vote.voter_email) || votersByReg.get(vote.voter_regnum);
          const gender = vinfo?.gender || 'Unknown';
          clanGenderBreakdown[gender] = (clanGenderBreakdown[gender] || 0) + 1;
        });

        // Top candidates for this clan
        const topClanCandidates = clanCandidates.map((c: any) => ({
          ...c,
          voteCount: c.votes?.[0]?.count || 0,
        })).sort((a, b) => b.voteCount - a.voteCount).slice(0, 10);

        return {
          ...clan,
          totalVoters: clanVoters.length,
          totalVotes: clanVotes.length,
          uniqueVoters: uniqueClanVoters,
          turnout: Math.round(clanTurnout),
          batchBreakdown: clanBatchBreakdown,
          genderBreakdown: clanGenderBreakdown,
          topCandidates: topClanCandidates,
          totalCandidates: clanCandidates.length,
        };
      }) || [];

      setStats({
        totalVoters: voterCount || 0,
        totalVotes: votes?.length || 0,
        uniqueVoters,
        turnout: Math.round(turnout),
        byBatch: batchGroups,
        byGender: genderGroups,
        byClan: clanGroups,
        candidateStats,
        clanDetails,
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

      {/* Clan-wise Statistics */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold">Clan-wise Statistics</h3>
        {stats.clanDetails.map((clan: any) => (
          <Collapsible
            key={clan.id}
            open={openClans[clan.id]}
            onOpenChange={(open) => setOpenClans({ ...openClans, [clan.id]: open })}
          >
            <Card>
              <CollapsibleTrigger className="w-full p-6 hover:bg-muted/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Award className="h-6 w-6 text-primary" />
                    <div className="text-left">
                      <h4 className="text-lg font-semibold">{clan.name}</h4>
                      <p className="text-sm text-muted-foreground">{clan.quote}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Total Votes</p>
                      <p className="text-2xl font-bold">{clan.totalVotes}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Turnout</p>
                      <p className="text-2xl font-bold">{clan.turnout}%</p>
                    </div>
                    {openClans[clan.id] ? (
                      <ChevronUp className="h-5 w-5" />
                    ) : (
                      <ChevronDown className="h-5 w-5" />
                    )}
                  </div>
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="p-6 pt-0 space-y-6">
                  {/* Clan Key Metrics */}
                  <div className="grid md:grid-cols-4 gap-4">
                    <Card className="p-4 bg-muted/30">
                      <p className="text-sm text-muted-foreground">Total Voters</p>
                      <p className="text-2xl font-bold">{clan.totalVoters}</p>
                    </Card>
                    <Card className="p-4 bg-muted/30">
                      <p className="text-sm text-muted-foreground">Votes Cast</p>
                      <p className="text-2xl font-bold">{clan.totalVotes}</p>
                    </Card>
                    <Card className="p-4 bg-muted/30">
                      <p className="text-sm text-muted-foreground">Unique Voters</p>
                      <p className="text-2xl font-bold">{clan.uniqueVoters}</p>
                    </Card>
                    <Card className="p-4 bg-muted/30">
                      <p className="text-sm text-muted-foreground">Candidates</p>
                      <p className="text-2xl font-bold">{clan.totalCandidates}</p>
                    </Card>
                  </div>

                  {/* Clan Breakdowns */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <Card className="p-4">
                      <h5 className="font-semibold mb-3">Votes by Batch</h5>
                      <div className="space-y-2">
                        {Object.entries(clan.batchBreakdown).map(([batch, count]: [string, any]) => (
                          <div key={batch} className="flex justify-between items-center">
                            <span className="text-sm">{batch}</span>
                            <div className="text-right">
                              <span className="font-medium mr-2">{count}</span>
                              <span className="text-xs text-muted-foreground">
                                ({Math.round((count / clan.totalVotes) * 100)}%)
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </Card>

                    <Card className="p-4">
                      <h5 className="font-semibold mb-3">Votes by Gender</h5>
                      <div className="space-y-2">
                        {Object.entries(clan.genderBreakdown).map(([gender, count]: [string, any]) => (
                          <div key={gender} className="flex justify-between items-center">
                            <span className="text-sm">{gender}</span>
                            <div className="text-right">
                              <span className="font-medium mr-2">{count}</span>
                              <span className="text-xs text-muted-foreground">
                                ({Math.round((count / clan.totalVotes) * 100)}%)
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </Card>
                  </div>

                  {/* Top Candidates in Clan */}
                  <Card className="p-4">
                    <h5 className="font-semibold mb-3">Top Candidates</h5>
                    <div className="space-y-2">
                      {clan.topCandidates.map((candidate: any, index: number) => (
                        <div 
                          key={candidate.id}
                          className="flex items-center justify-between p-2 rounded hover:bg-muted/50"
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                              index === 0 ? 'bg-yellow-100 text-yellow-700' :
                              index === 1 ? 'bg-gray-100 text-gray-700' :
                              index === 2 ? 'bg-orange-100 text-orange-700' :
                              'bg-muted text-muted-foreground'
                            }`}>
                              {index + 1}
                            </div>
                            <div>
                              <p className="font-medium text-sm">{candidate.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {candidate.batch} • Year {candidate.year}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold">{candidate.voteCount}</p>
                            <p className="text-xs text-muted-foreground">votes</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        ))}
      </div>

      {/* Overall Top Candidates */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Overall Candidate Rankings</h3>
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
