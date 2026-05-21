'use client';

import { useEffect, useState } from 'react';
import { useSupabase } from '@/hooks/useSupabase';
import { mockElections } from '@/lib/mockData';
import Link from 'next/link';

type ElectionListItem = {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  status: 'ongoing' | 'upcoming' | 'ended';
};

export default function ElectionsPage() {
  const supabase = useSupabase();
  const [elections, setElections] = useState<ElectionListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    const loadElections = async () => {
      setIsLoading(true);
      setLoadError(null);

      const { data, error } = await supabase
        .from('elections')
        .select('id, title, description, start_date, end_date, status')
        .order('start_date', { ascending: true });

      if (!error && data && data.length > 0) {
        const mapped = data.map((election: any) => ({
          id: election.id,
          title: election.title,
          description: election.description ?? 'No description provided',
          startDate: election.start_date ?? '',
          endDate: election.end_date ?? '',
          status: (election.status as 'ongoing' | 'upcoming' | 'ended') ?? 'upcoming',
        }));
        setElections(mapped);
      } else {
        setElections(mockElections.map(e => ({
          id: e.id,
          title: e.title,
          description: e.description,
          startDate: e.startDate,
          endDate: e.endDate,
          status: e.status,
        })));
      }
      
      setIsLoading(false);
    };

    loadElections();
  }, [supabase]);

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-4xl font-bold mb-8">All Elections</h1>

      {isLoading && <p className="text-neutral-400 mb-6">Loading elections...</p>}
      {!isLoading && loadError && (
        <div className="mb-6 rounded-2xl border border-red-500 bg-red-500/10 p-4 text-red-300">
          {loadError}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {elections.map((election) => (
          <div key={election.id} className="bg-neutral-900 border border-neutral-800 rounded-3xl p-8 hover:border-[#008751] transition">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-semibold text-white">{election.title}</h2>
                <p className="text-neutral-400 mt-2">{election.description}</p>
              </div>
              <span className={`px-4 py-1.5 text-xs font-medium rounded-full ${
                election.status === 'ongoing' ? 'bg-green-500/20 text-green-400' : 
                election.status === 'upcoming' ? 'bg-yellow-500/20 text-yellow-400' : 
                'bg-neutral-700 text-neutral-400'
              }`}>
                {election.status.toUpperCase()}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs text-neutral-500">
                  {election.status === 'ongoing' ? 'Ends' : 'Starts'}: {election.status === 'ongoing' ? election.endDate : election.startDate}
                </p>
              </div>
              <Link 
                href={`/dashboard/elections/${election.id}`}
                className="bg-[#008751] hover:bg-[#00693f] px-8 py-3 rounded-2xl text-white font-medium transition"
              >
                {election.status === 'ongoing' ? 'Vote Now' : 'View Details'}
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
