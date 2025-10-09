import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Trophy, Users, Medal } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface CandidateResult {
  id: string;
  name: string;
  photo_url: string;
  clan_id: string;
  clan_name: string;
  votes: number;
}

const Results = () => {
  const [results, setResults] = useState<CandidateResult[]>([]);
  const [isPublished, setIsPublished] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadResults();
  }, []);

  const loadResults = async () => {
    try {
      // Check if results are published
      const { data: settings } = await supabase
        .from('election_settings')
        .select('publish_results')
        .eq('id', 1)
        .single();

      if (!settings?.publish_results) {
        setIsPublished(false);
        setLoading(false);
        return;
      }

      setIsPublished(true);

      // Load vote counts per candidate
      const { data: votes } = await supabase
        .from('votes')
        .select('candidate_id');

      const { data: candidates } = await supabase
        .from('candidates')
        .select('id, name, photo_url, clan_id')
        .eq('is_active', true);

      const { data: clans } = await supabase
        .from('clans')
        .select('id, name');

      if (votes && candidates && clans) {
        const voteCounts = votes.reduce((acc: Record<string, number>, vote) => {
          acc[vote.candidate_id] = (acc[vote.candidate_id] || 0) + 1;
          return acc;
        }, {});

        const resultsData: CandidateResult[] = candidates
          .map(candidate => {
            const clan = clans.find(c => c.id === candidate.clan_id);
            return {
              id: candidate.id,
              name: candidate.name,
              photo_url: candidate.photo_url || '',
              clan_id: candidate.clan_id,
              clan_name: clan?.name || '',
              votes: voteCounts[candidate.id] || 0,
            };
          })
          .sort((a, b) => b.votes - a.votes);

        setResults(resultsData);
      }
    } catch (error) {
      console.error('Error loading results:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8">
          <p className="text-muted-foreground">Loading results...</p>
        </Card>
      </div>
    );
  }

  if (!isPublished) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-background flex items-center justify-center p-4">
        <Card className="p-12 max-w-md text-center">
          <Trophy className="h-16 w-16 mx-auto mb-6 text-primary" />
          <h1 className="text-3xl font-bold mb-4">Results Not Yet Published</h1>
          <p className="text-muted-foreground mb-8">
            The election results will be published once the admin approves. Please check back later.
          </p>
          <Link to="/">
            <Button>Return to Home</Button>
          </Link>
        </Card>
      </div>
    );
  }

  const topThree = results.slice(0, 3);
  const others = results.slice(3);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-background">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <Trophy className="h-20 w-20 mx-auto mb-6 text-primary animate-bounce" />
          <h1 className="text-5xl font-black mb-4">Election Results</h1>
          <p className="text-xl text-muted-foreground">
            Congratulations to all candidates!
          </p>
        </div>

        {/* Top 3 Podium */}
        {topThree.length > 0 && (
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-12">
            {/* Second Place */}
            {topThree[1] && (
              <Card className="p-8 text-center transform md:translate-y-8">
                <div className="relative mb-4">
                  <Medal className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                  <span className="text-4xl font-black text-gray-400">2</span>
                </div>
                {topThree[1].photo_url && (
                  <img
                    src={topThree[1].photo_url}
                    alt={topThree[1].name}
                    className="h-24 w-24 rounded-full mx-auto mb-4 object-cover border-4 border-gray-400"
                  />
                )}
                <h3 className="font-bold text-lg mb-1">{topThree[1].name}</h3>
                <p className="text-sm text-muted-foreground mb-2">{topThree[1].clan_name}</p>
                <div className="flex items-center justify-center gap-2 text-2xl font-black text-gray-400">
                  <Users className="h-6 w-6" />
                  {topThree[1].votes}
                </div>
              </Card>
            )}

            {/* First Place */}
            {topThree[0] && (
              <Card className="p-8 text-center bg-gradient-to-br from-primary/10 to-primary/5 border-primary">
                <div className="relative mb-4">
                  <Medal className="h-16 w-16 mx-auto text-yellow-500 mb-2 animate-pulse" />
                  <span className="text-5xl font-black text-yellow-500">1</span>
                </div>
                {topThree[0].photo_url && (
                  <img
                    src={topThree[0].photo_url}
                    alt={topThree[0].name}
                    className="h-32 w-32 rounded-full mx-auto mb-4 object-cover border-4 border-yellow-500 shadow-lg"
                  />
                )}
                <h3 className="font-bold text-2xl mb-1">{topThree[0].name}</h3>
                <p className="text-sm text-muted-foreground mb-2">{topThree[0].clan_name}</p>
                <div className="flex items-center justify-center gap-2 text-3xl font-black text-yellow-500">
                  <Users className="h-8 w-8" />
                  {topThree[0].votes}
                </div>
              </Card>
            )}

            {/* Third Place */}
            {topThree[2] && (
              <Card className="p-8 text-center transform md:translate-y-8">
                <div className="relative mb-4">
                  <Medal className="h-12 w-12 mx-auto text-amber-700 mb-2" />
                  <span className="text-4xl font-black text-amber-700">3</span>
                </div>
                {topThree[2].photo_url && (
                  <img
                    src={topThree[2].photo_url}
                    alt={topThree[2].name}
                    className="h-24 w-24 rounded-full mx-auto mb-4 object-cover border-4 border-amber-700"
                  />
                )}
                <h3 className="font-bold text-lg mb-1">{topThree[2].name}</h3>
                <p className="text-sm text-muted-foreground mb-2">{topThree[2].clan_name}</p>
                <div className="flex items-center justify-center gap-2 text-2xl font-black text-amber-700">
                  <Users className="h-6 w-6" />
                  {topThree[2].votes}
                </div>
              </Card>
            )}
          </div>
        )}

        {/* Other Candidates */}
        {others.length > 0 && (
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-6 text-center">Other Candidates</h2>
            <div className="grid gap-4">
              {others.map((candidate, index) => (
                <Card key={candidate.id} className="p-6">
                  <div className="flex items-center gap-6">
                    <div className="text-3xl font-black text-muted-foreground w-12 text-center">
                      {index + 4}
                    </div>
                    {candidate.photo_url && (
                      <img
                        src={candidate.photo_url}
                        alt={candidate.name}
                        className="h-16 w-16 rounded-full object-cover"
                      />
                    )}
                    <div className="flex-1">
                      <h3 className="font-bold text-lg">{candidate.name}</h3>
                      <p className="text-sm text-muted-foreground">{candidate.clan_name}</p>
                    </div>
                    <div className="flex items-center gap-2 text-xl font-bold">
                      <Users className="h-5 w-5 text-muted-foreground" />
                      {candidate.votes}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        <div className="text-center mt-12">
          <Link to="/">
            <Button size="lg">Return to Home</Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Results;
