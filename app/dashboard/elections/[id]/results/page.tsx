'use client';

import { useState, useEffect, use } from 'react';
import { mockElections } from '@/lib/mockData';
import { createClientComponentClient } from '@/lib/supabase';
import { ArrowLeft, Trophy, Users } from 'lucide-react';

export default function ResultsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const supabase = createClientComponentClient();
  const election = mockElections.find(e => e.id === id);

  const [votes, setVotes] = useState<any[]>([]);
  const [totalVotes, setTotalVotes] = useState(0);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  useEffect(() => {
    if (!election) return;

    const fetchVotes = async () => {
      const { data } = await supabase
        .from('votes')
        .select('candidate_id')
        .eq('election_id', id);

      setVotes(data || []);
      setTotalVotes(data?.length || 0);
      setLastUpdated(new Date());
    };

    fetchVotes();

    // Real-time subscription
    const channel = supabase
      .channel(`votes:${id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'votes',
          filter: `election_id=eq.${id}`,
        },
        () => {
          fetchVotes();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id, supabase, election]);

  if (!election) return <div className="p-12 text-center">Election not found</div>;

  const candidateVotes = election.candidates.map((candidate: any) => {
    const count = votes.filter((v: any) => v.candidate_id === candidate.id).length;
    const percentage = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
    return { ...candidate, votes: count, percentage };
  }).sort((a: any, b: any) => b.votes - a.votes);

  const winner = candidateVotes[0];

  return (
    <div className="min-h-screen bg-neutral-950 p-6">
      <div className="max-w-4xl mx-auto">
        <button 
          onClick={() => window.location.href = `/dashboard/elections/${id}`}
          className="flex items-center gap-2 text-neutral-400 hover:text-white mb-8"
        >
          ← Back to Voting Booth
        </button>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white">{election.title}</h1>
            <p className="text-neutral-400">{election.description}</p>
          </div>
          <div className="flex items-center gap-2 text-green-400">
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            <span className="font-medium">LIVE RESULTS</span>
          </div>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-10">
          <div className="flex justify-between items-center mb-10">
            <h2 className="text-2xl font-semibold flex items-center gap-3">
              <Trophy className="text-yellow-400" /> Election Results
            </h2>
            <div>
              <p className="text-sm text-neutral-400">Total Votes Cast</p>
              <p className="text-3xl font-bold text-white">{totalVotes.toLocaleString()}</p>
            </div>
          </div>

          <div className="space-y-8">
            {candidateVotes.map((candidate: any, index: number) => (
              <div key={candidate.id} className="space-y-3">
                <div className="flex justify-between items-end">
                  <div className="flex items-center gap-4">
                    <span className="text-2xl font-semibold text-white">{candidate.name}</span>
                    <span className="px-4 py-1 text-xs font-medium bg-neutral-800 rounded-full text-[#008751]">
                      {candidate.party}
                    </span>
                    {index === 0 && (
                      <span className="px-4 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded-full font-medium flex items-center gap-1">
                        🏆 LEADING
                      </span>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-2xl font-bold text-white">{candidate.votes}</div>
                    <div className="text-sm text-neutral-400">{candidate.percentage}%</div>
                  </div>
                </div>

                <div className="h-5 bg-neutral-800 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-700 rounded-full ${index === 0 ? 'bg-[#008751]' : 'bg-neutral-600'}`}
                    style={{ width: `${candidate.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <p className="text-center text-neutral-500 text-sm mt-10">
            Last updated: {lastUpdated.toLocaleTimeString()} • Results are live
          </p>
        </div>
      </div>
    </div>
  );
}