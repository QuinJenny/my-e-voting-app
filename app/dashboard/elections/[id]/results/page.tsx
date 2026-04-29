'use client';

import { use, useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Trophy } from 'lucide-react';
import { createClientComponentClient } from '@/lib/supabase';

type Election = {
  id: string;
  title: string;
  description: string | null;
};

type Candidate = {
  id: string;
  name: string;
  party: string | null;
};

type VoteRow = {
  candidate_id: string;
};

export default function ResultsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const supabase = createClientComponentClient();

  const [election, setElection] = useState<Election | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [voteCounts, setVoteCounts] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    let isMounted = true;
    let activeElectionId = '';

    const resolveElection = async (): Promise<Election | null> => {
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);

      if (isUuid) {
        const { data, error: electionError } = await supabase
          .from('elections')
          .select('id, title, description')
          .eq('id', id)
          .maybeSingle();

        if (electionError) throw new Error(electionError.message);
        if (data) return data as Election;
      }

      const { data: elections, error: fallbackError } = await supabase
        .from('elections')
        .select('id, title, description')
        .order('start_date', { ascending: true });

      if (fallbackError) throw new Error(fallbackError.message);
      if (!elections || elections.length === 0) return null;

      const asNumber = Number.parseInt(id, 10);
      if (!Number.isNaN(asNumber) && asNumber > 0 && asNumber <= elections.length) {
        return elections[asNumber - 1] as Election;
      }

      return elections[0] as Election;
    };

    const fetchVoteCounts = async (electionId: string, candidateList?: Candidate[]) => {
      const { data: votes, error: votesError } = await supabase
        .from('votes')
        .select('candidate_id')
        .eq('election_id', electionId);

      if (votesError) {
        throw new Error(votesError.message);
      }

      const counts: Record<string, number> = {};
      for (const vote of (votes ?? []) as VoteRow[]) {
        counts[vote.candidate_id] = (counts[vote.candidate_id] ?? 0) + 1;
      }

      if (candidateList) {
        for (const candidate of candidateList) {
          counts[candidate.id] = counts[candidate.id] ?? 0;
        }
      }

      if (isMounted) {
        setVoteCounts(counts);
        setLastUpdated(new Date());
      }
    };

    const loadResults = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const resolvedElection = await resolveElection();
        if (!resolvedElection) {
          if (isMounted) {
            setElection(null);
            setCandidates([]);
            setVoteCounts({});
            setError('Election not found.');
            setIsLoading(false);
          }
          return;
        }

        activeElectionId = resolvedElection.id;
        const { data: candidateRows, error: candidatesError } = await supabase
          .from('candidates')
          .select('id, name, party')
          .eq('election_id', resolvedElection.id)
          .order('name', { ascending: true });

        if (candidatesError) throw new Error(candidatesError.message);

        const candidateList = (candidateRows ?? []) as Candidate[];
        if (isMounted) {
          setElection(resolvedElection);
          setCandidates(candidateList);
        }

        await fetchVoteCounts(resolvedElection.id, candidateList);
        if (isMounted) setIsLoading(false);
      } catch (loadError: any) {
        if (isMounted) {
          setError(loadError.message ?? 'Failed to load election results.');
          setIsLoading(false);
        }
      }
    };

    loadResults();

    const channel = supabase
      .channel(`election-results-${id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'votes' },
        async (payload) => {
          const payloadElectionId =
            (payload.new as { election_id?: string } | null)?.election_id ??
            (payload.old as { election_id?: string } | null)?.election_id;

          if (!activeElectionId || payloadElectionId !== activeElectionId) return;
          await fetchVoteCounts(activeElectionId);
        }
      )
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, [id, supabase]);

  const rankedCandidates = useMemo(() => {
    return [...candidates]
      .map((candidate) => ({
        ...candidate,
        votes: voteCounts[candidate.id] ?? 0,
      }))
      .sort((a, b) => b.votes - a.votes);
  }, [candidates, voteCounts]);

  const totalVotes = useMemo(
    () => rankedCandidates.reduce((sum, candidate) => sum + candidate.votes, 0),
    [rankedCandidates]
  );

  const leader = rankedCandidates[0];

  if (isLoading) {
    return <div className="min-h-screen bg-neutral-950 p-6 text-neutral-400">Loading live results...</div>;
  }

  if (!election) {
    return <div className="min-h-screen bg-neutral-950 p-6 text-red-400">{error ?? 'Election not found'}</div>;
  }

  return (
    <div className="min-h-screen bg-neutral-950 p-6">
      <div className="max-w-5xl mx-auto">
        <button
          onClick={() => window.location.href = `/dashboard/elections/${election.id}`}
          className="flex items-center gap-2 text-neutral-400 hover:text-white mb-8 transition"
        >
          <ArrowLeft size={18} />
          Back to Voting Booth
        </button>

        <div className="flex flex-wrap items-start justify-between gap-4 mb-10">
          <div>
            <h1 className="text-4xl font-bold text-white">{election.title}</h1>
            <p className="text-neutral-400 mt-2">{election.description ?? 'Official election results dashboard'}</p>
          </div>
          <div className="text-right">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#008751]/50 bg-[#008751]/10 px-3 py-1 text-xs font-semibold tracking-wide text-[#9ef2c8]">
              <span className="h-2 w-2 rounded-full bg-[#008751] animate-pulse" />
              LIVE RESULTS
            </div>
            <div className="mt-3 text-2xl font-semibold text-[#008751] flex items-center justify-end gap-2">
              <Trophy size={24} />
              {leader ? `${leader.name} is leading` : 'Waiting for votes'}
            </div>
          </div>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-10 shadow-2xl shadow-[#008751]/10">
          <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
            <h2 className="text-2xl font-semibold">Election Results</h2>
            <div className="text-right">
              <div className="text-sm text-neutral-400">Total Votes Cast</div>
              <div className="font-mono text-3xl font-bold text-white">{totalVotes.toLocaleString()}</div>
            </div>
          </div>

          <div className="mb-8 text-xs uppercase tracking-wider text-neutral-500">
            Last updated:{' '}
            <span className="text-neutral-300 normal-case">
              {lastUpdated ? lastUpdated.toLocaleString() : 'Waiting for updates...'}
            </span>
          </div>

          <div className="space-y-8">
            {rankedCandidates.map((candidate, index) => {
              const percentage = totalVotes > 0 ? Math.round((candidate.votes / totalVotes) * 100) : 0;
              const isWinner = index === 0;

              return (
                <div key={candidate.id} className="space-y-3">
                  <div className="flex justify-between items-end">
                    <div className="flex items-center gap-4">
                      <span className="text-2xl font-bold text-white">{candidate.name}</span>
                      <span className="px-4 py-1 text-xs font-medium bg-neutral-800 rounded-full text-[#008751]">
                        {candidate.party ?? 'Independent'}
                      </span>
                      {isWinner && (
                        <span className="px-3 py-1 bg-[#008751]/20 text-[#8ff0c0] text-xs rounded-full font-medium flex items-center gap-1">
                          <Trophy size={12} />
                          LEADING
                        </span>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="font-mono text-xl font-semibold text-white">{candidate.votes.toLocaleString()}</div>
                      <div className="text-sm text-neutral-400">{percentage}%</div>
                    </div>
                  </div>

                  <div className="h-4 bg-neutral-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#008751] transition-all duration-700 ease-out rounded-full"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}

            {rankedCandidates.length === 0 && (
              <div className="text-neutral-500">No candidates found for this election.</div>
            )}
          </div>
        </div>

        <div className="mt-10 text-center text-neutral-500 text-sm">
          Results are updated in real-time from secure vote records • Built for transparency and trust
        </div>
      </div>
    </div>
  );
}