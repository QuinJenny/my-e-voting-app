'use client';

import { useState, useEffect } from 'react';
import { useSupabase } from '@/hooks/useSupabase';

type Vote = {
  id: string;
  election_title: string;
  candidate_name: string;
  candidate_party: string | null;
  voted_at: string;
};

type VoteRow = {
  id: string;
  voted_at: string | null;
  created_at: string | null;
  elections: { title: string } | null;
  candidates: { name: string; party: string | null } | null;
};

export default function MyVotesPage() {
  const [votes, setVotes] = useState<Vote[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = useSupabase();

  useEffect(() => {
    const loadVotes = async () => {
      const sessionResult = await supabase.auth.getSession();
      const sessionUser = sessionResult.data.session?.user ?? null;
      const { data: { user } } = sessionUser ? { data: { user: sessionUser } } : await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('votes')
          .select(`
            id,
            voted_at,
            created_at,
            elections (title),
            candidates (name, party)
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (data) {
          const rows = data as unknown as VoteRow[];
          const formattedVotes: Vote[] = rows.map((vote) => ({
            id: vote.id,
            election_title: vote.elections?.title ?? 'Unknown Election',
            candidate_name: vote.candidates?.name ?? 'Unknown Candidate',
            candidate_party: vote.candidates?.party ?? null,
            voted_at: vote.voted_at ?? vote.created_at ?? '',
          }));
          setVotes(formattedVotes);
        }
      }
      setLoading(false);
    };

    loadVotes();
  }, [supabase]);

  if (loading) {
    return <div className="min-h-screen bg-neutral-950 flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold mb-8">My Votes</h1>
      
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-12 text-center">
        <div className="text-6xl mb-6">🗳️</div>
        <h2 className="text-2xl font-semibold mb-4">You have cast {votes.length} votes so far</h2>
        <p className="text-neutral-400 max-w-md mx-auto">
          All your votes are encrypted and securely recorded. 
          You can view your voting history here.
        </p>
        
        {votes.length > 0 && (
          <div className="mt-12 space-y-6">
            {votes.map((vote) => (
              <div key={vote.id} className="bg-neutral-950 border border-neutral-800 rounded-2xl p-6 text-left">
                <p className="text-[#008751] font-medium">{vote.election_title}</p>
                <p className="text-neutral-400 text-sm mt-1">
                  Voted for {vote.candidate_name}{vote.candidate_party ? ` (${vote.candidate_party})` : ''} • Vote ID: {vote.id}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
