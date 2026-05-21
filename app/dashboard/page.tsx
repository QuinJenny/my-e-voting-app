'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@/lib/supabase';

type ElectionStatus = 'ongoing' | 'upcoming' | 'ended';

type ElectionRow = {
  id: string;
  title: string;
  description: string | null;
  start_date: string | null;
  end_date: string | null;
  status: ElectionStatus | null;
};

type DashboardStats = {
  electionsParticipated: number;
  votesCast: number;
  activeNow: number;
};

type VoteRow = {
  id: string;
  election_id: string;
};

export default function Dashboard() {
  const [userName, setUserName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    electionsParticipated: 0,
    votesCast: 0,
    activeNow: 0,
  });
  const [ongoingElections, setOngoingElections] = useState<ElectionRow[]>([]);
  const [upcomingElections, setUpcomingElections] = useState<ElectionRow[]>([]);
  const supabase = createClientComponentClient();

  useEffect(() => {
    const loadData = async () => {
      const sessionResult = await supabase.auth.getSession();
      const sessionUser = sessionResult.data.session?.user ?? null;
      const { data: { user } } = sessionUser ? { data: { user: sessionUser } } : await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', user.id)
          .single();
        
        setUserName(profile?.full_name || user.user_metadata?.full_name || 'User');

        const [{ data: voteRows }, { data: elections }] = await Promise.all([
          supabase
            .from('votes')
            .select('id, election_id')
            .eq('user_id', user.id),
          supabase
            .from('elections')
            .select('id, title, description, start_date, end_date, status')
            .order('start_date', { ascending: true }),
        ]);

        const typedVoteRows = (voteRows ?? []) as unknown as VoteRow[];
        const votesCast = typedVoteRows.length;
        const electionsParticipated = new Set(typedVoteRows.map((vote) => vote.election_id)).size;

        const electionRows: ElectionRow[] = (elections ?? []) as unknown as ElectionRow[];

        const ongoing = electionRows.filter((election) => election.status === 'ongoing');
        const upcoming = electionRows.filter((election) => election.status === 'upcoming');

        setStats({
          electionsParticipated,
          votesCast,
          activeNow: ongoing.length,
        });
        setOngoingElections(ongoing);
        setUpcomingElections(upcoming);
      }
      setLoading(false);
    };

    loadData();
  }, [supabase]);

  if (loading) {
    return <div className="min-h-screen bg-neutral-950 flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-10">
      <div>
        <h1 className="text-4xl font-bold">Welcome back, {userName} 👋</h1>
        <p className="text-neutral-400 mt-2">Here's an overview of the current elections</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-8">
          <p className="text-neutral-400">Elections Participated</p>
          <p className="text-5xl font-bold mt-3">{stats.electionsParticipated}</p>
        </div>
        <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-8">
          <p className="text-neutral-400">Votes Cast</p>
          <p className="text-5xl font-bold mt-3">{stats.votesCast}</p>
        </div>
        <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-8">
          <p className="text-neutral-400">Active Now</p>
          <p className="text-5xl font-bold mt-3 text-[#008751]">{stats.activeNow}</p>
        </div>
      </div>

      {/* Ongoing */}
      <div>
        <h2 className="text-2xl font-semibold mb-6">Ongoing Elections</h2>      
        <div className="grid md:grid-cols-2 gap-6">
          {ongoingElections.map((election) => (
            <div key={election.id} className="bg-neutral-900 border border-neutral-800 rounded-3xl p-8">
              <h3 className="text-xl font-semibold">{election.title}</h3>       
              <p className="text-neutral-400 mt-3 line-clamp-2">{election.description}</p>
              <div className="mt-8 flex justify-between items-end">
                <div>
                  <p className="text-xs text-neutral-500">Ends</p>
                  <p className="font-medium">{election.end_date}</p>
                </div>
                <a href={`/dashboard/elections/${election.id}`} className="bg-[#008751] hover:bg-[#00693f] px-8 py-3 rounded-2xl text-white font-medium">       
                  Vote Now
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {upcomingElections.length > 0 && (
        <div>
          <h2 className="text-2xl font-semibold mb-6">Upcoming Elections</h2>   
          <div className="grid md:grid-cols-2 gap-6">
            {upcomingElections.map((election) => (
              <div key={election.id} className="bg-neutral-900 border border-neutral-800 rounded-3xl p-8 opacity-75">
                <h3 className="text-xl font-semibold">{election.title}</h3>     
                <p className="text-neutral-400 mt-3">{election.description}</p> 
                <p className="mt-6 text-sm text-neutral-500">Starts: {election.start_date}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
