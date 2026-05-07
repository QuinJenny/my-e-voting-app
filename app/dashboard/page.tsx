'use client';

import { useState, useEffect } from 'react';
import { mockElections } from '@/lib/mockData';
import { createClientComponentClient } from '@/lib/supabase';

export default function Dashboard() {
  const [userName, setUserName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClientComponentClient();
  const ongoing = mockElections.filter(e => e.status === 'ongoing');
  const upcoming = mockElections.filter(e => e.status === 'upcoming');

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', user.id)
          .single();
        
        setUserName(profile?.full_name || user.email?.split('@')[0] || 'Voter');
      }
      setLoading(false);
    };

    getUser();
  }, [supabase]);

  if (loading) {
    return <div className="min-h-screen bg-neutral-950 flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-10">
      <div>
        <h1 className="text-4xl font-bold">Good morning, {userName} 👋</h1>
        <p className="text-neutral-400 mt-2">Here's an overview of the current elections</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-8">
          <p className="text-neutral-400">Elections Participated</p>
          <p className="text-5xl font-bold mt-3">12</p>
        </div>
        <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-8">
          <p className="text-neutral-400">Votes Cast</p>
          <p className="text-5xl font-bold mt-3">8</p>
        </div>
        <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-8">
          <p className="text-neutral-400">Active Now</p>
          <p className="text-5xl font-bold mt-3 text-[#008751]">{ongoing.length}</p>
        </div>
      </div>

      {/* Ongoing */}
      <div>
        <h2 className="text-2xl font-semibold mb-6">Ongoing Elections</h2>      
        <div className="grid md:grid-cols-2 gap-6">
          {ongoing.map((election) => (
            <div key={election.id} className="bg-neutral-900 border border-neutral-800 rounded-3xl p-8">
              <h3 className="text-xl font-semibold">{election.title}</h3>       
              <p className="text-neutral-400 mt-3 line-clamp-2">{election.description}</p>
              <div className="mt-8 flex justify-between items-end">
                <div>
                  <p className="text-xs text-neutral-500">Ends</p>
                  <p className="font-medium">{election.endDate}</p>
                </div>
                <a href={`/dashboard/elections/${election.id}`} className="bg-[#008751] hover:bg-[#00693f] px-8 py-3 rounded-2xl text-white font-medium">       
                  Vote Now
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {upcoming.length > 0 && (
        <div>
          <h2 className="text-2xl font-semibold mb-6">Upcoming Elections</h2>   
          <div className="grid md:grid-cols-2 gap-6">
            {upcoming.map((election) => (
              <div key={election.id} className="bg-neutral-900 border border-neutral-800 rounded-3xl p-8 opacity-75">
                <h3 className="text-xl font-semibold">{election.title}</h3>     
                <p className="text-neutral-400 mt-3">{election.description}</p> 
                <p className="mt-6 text-sm text-neutral-500">Starts: {election.startDate}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
