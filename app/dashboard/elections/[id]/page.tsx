'use client';

import { useEffect, useState, use } from 'react';
import { createClientComponentClient } from '@/lib/supabase';
import { ArrowLeft, CheckCircle, Lock } from 'lucide-react';

type ElectionRecord = {
  id: string;
  title: string;
  description: string | null;
  start_date?: string | null;
  end_date?: string | null;
  status?: 'ongoing' | 'upcoming' | 'ended' | string | null;
};

type CandidateRecord = {
  id: string;
  name: string;
  party: string | null;
  manifesto: string | null;
};

export default function VotingBooth({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const supabase = createClientComponentClient();
  const [election, setElection] = useState<ElectionRecord | null>(null);
  const [candidates, setCandidates] = useState<CandidateRecord[]>([]);
  const [isLoadingElection, setIsLoadingElection] = useState(true);
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isVoting, setIsVoting] = useState(false);
  const [voted, setVoted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadElection = async () => {
      setIsLoadingElection(true);
      setError(null);

      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
      let selectedElection: ElectionRecord | null = null;

      if (isUuid) {
        const { data } = await supabase
          .from('elections')
          .select('id, title, description, start_date, end_date, status')
          .eq('id', id)
          .maybeSingle();
        selectedElection = data;
      }

      if (!selectedElection) {
        const { data: elections, error: electionsError } = await supabase
          .from('elections')
          .select('id, title, description, start_date, end_date, status')
          .order('start_date', { ascending: true });

        if (electionsError) {
          setError(electionsError.message);
          setIsLoadingElection(false);
          return;
        }

        const electionList = (elections ?? []) as ElectionRecord[];

        if (electionList.length === 0) {
          setError('No elections found.');
          setIsLoadingElection(false);
          return;
        }

        const asNumber = Number.parseInt(id, 10);
        if (!Number.isNaN(asNumber) && asNumber > 0 && asNumber <= electionList.length) {
          selectedElection = electionList[asNumber - 1];
        } else {
          selectedElection = electionList.find((e: ElectionRecord) => e.status === 'ongoing') ?? electionList[0];
        }
      }

      if (!selectedElection) {
        setError('Election not found.');
        setIsLoadingElection(false);
        return;
      }

      const { data: candidateRows, error: candidatesError } = await supabase
        .from('candidates')
        .select('id, name, party, manifesto')
        .eq('election_id', selectedElection.id);

      if (candidatesError) {
        setError(candidatesError.message);
        setIsLoadingElection(false);
        return;
      }

      setElection(selectedElection);
      setCandidates(candidateRows ?? []);
      setIsLoadingElection(false);
    };

    loadElection();
  }, [id, supabase]);

  if (isLoadingElection) {
    return <div className="p-10 text-neutral-400">Loading election...</div>;
  }

  if (!election) {
    return (
      <div className="min-h-screen bg-neutral-950 p-6">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => window.location.href = '/dashboard/elections'}
            className="flex items-center gap-2 text-neutral-400 hover:text-white mb-8 transition"
          >
            <ArrowLeft size={18} />
            Back to Elections
          </button>
          <div className="bg-red-500/10 border border-red-500 text-red-300 p-4 rounded-2xl">
            {error ?? 'Election not found in Supabase. Open Elections and choose a listed election.'}
          </div>
        </div>
      </div>
    );
  }

  const handleCastVote = () => {
    if (selectedCandidate === null) return;
    setShowConfirm(true);
  };

  const confirmVote = async () => {
    setShowConfirm(false);
    setIsVoting(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("You must be logged in to vote");

      // Check if user already voted in this election
      const { data: existingVote } = await supabase
        .from('votes')
        .select('id')
        .eq('user_id', user.id)
        .eq('election_id', election.id)
        .single();

      if (existingVote) {
        throw new Error("You have already voted in this election");
      }

      // Insert the vote
      const { error: insertError } = await supabase
        .from('votes')
        .insert({
          user_id: user.id,
          election_id: election.id,
          candidate_id: selectedCandidate,
        });

      if (insertError) throw insertError;

      setVoted(true);
    } catch (err: any) {
      setError(err.message || "Failed to cast vote. Please try again.");
      console.error("Vote error:", err);
    } finally {
      setIsVoting(false);
    }
  };

  // Success Screen
  if (voted) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-6">
        <div className="max-w-md text-center">
          <CheckCircle className="mx-auto text-[#008751] mb-6" size={80} />
          <h1 className="text-4xl font-bold text-white mb-4">Vote Cast Successfully!</h1>
          <p className="text-neutral-400 mb-8">Your vote has been securely recorded and cannot be changed.</p>

          <div className="space-y-4">
            <button 
              onClick={() => window.location.href = `/dashboard/elections/${election.id}/results`}
              className="w-full py-4 bg-[#008751] hover:bg-[#00693f] rounded-2xl font-semibold text-lg transition"
            >
              View Live Results
            </button>
            <button 
              onClick={() => window.location.href = '/dashboard'}
              className="w-full py-4 border border-neutral-700 hover:bg-neutral-900 rounded-2xl font-semibold transition"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 p-6">
      <div className="max-w-4xl mx-auto">
        <button 
          onClick={() => window.location.href = '/dashboard'}
          className="flex items-center gap-2 text-neutral-400 hover:text-white mb-8 transition"
        >
          <ArrowLeft size={18} />
          Back to Dashboard
        </button>

        <h1 className="text-4xl font-bold mb-2">{election.title}</h1>
        <p className="text-neutral-400 mb-10">{election.description}</p>

        <h2 className="text-2xl font-semibold mb-6">Select your candidate</h2>

        <div className="space-y-4 mb-10">
          {candidates.map((candidate) => (
            <div
              key={candidate.id}
              onClick={() => setSelectedCandidate(candidate.id)}
              className={`p-6 rounded-3xl border cursor-pointer transition-all ${
                selectedCandidate === candidate.id 
                  ? 'border-[#008751] bg-neutral-900 shadow-lg' 
                  : 'border-neutral-800 hover:border-neutral-700'
              }`}
            >
              <div className="flex items-center gap-4">
                <input
                  type="radio"
                  checked={selectedCandidate === candidate.id}
                  onChange={() => setSelectedCandidate(candidate.id)}
                  className="accent-[#008751] mt-1"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-xl font-semibold text-white">{candidate.name}</h3>
                    <span className="px-4 py-1 text-xs bg-neutral-800 text-[#008751] rounded-full">
                      {candidate.party ?? 'Independent'}
                    </span>
                  </div>
                  <p className="text-neutral-400 mt-2">{candidate.manifesto ?? 'No manifesto provided.'}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-400 p-4 rounded-2xl mb-6">
            {error}
          </div>
        )}

        <button
          onClick={handleCastVote}
          disabled={selectedCandidate === null || isVoting}
          className="w-full py-4 bg-[#008751] hover:bg-[#00693f] disabled:bg-neutral-700 disabled:cursor-not-allowed rounded-2xl font-semibold text-lg transition"
        >
          {isVoting ? 'Casting vote...' : 'Cast Vote'}
        </button>

        {showConfirm && (
          <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-6">
            <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-3xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <Lock className="text-[#008751]" size={22} />
                <h3 className="text-xl font-semibold text-white">Confirm Your Vote</h3>
              </div>
              <p className="text-neutral-400 mb-6">
                This action cannot be undone. Are you sure you want to submit your vote?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirm(false)}
                  className="flex-1 py-3 border border-neutral-700 hover:bg-neutral-800 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmVote}
                  className="flex-1 py-3 bg-[#008751] hover:bg-[#00693f] rounded-xl font-semibold transition"
                >
                  Confirm Vote
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}