'use client';

import { useState, useEffect, use } from 'react';
import { createClientComponentClient } from '@/lib/supabase';
import { Plus, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;
  const supabase = createClientComponentClient();
  const router = useRouter();

  const [election, setElection] = useState<any>(null);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCandidate, setNewCandidate] = useState({ name: '', party: '', manifesto: '' });

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      const { data: electionData } = await supabase.from('elections').select('*').eq('id', id).single();
      setElection(electionData);
      const { data: candidatesData } = await supabase.from('candidates').select('*').eq('election_id', id).order('created_at', { ascending: true });
      setCandidates(candidatesData || []);
      setLoading(false);
    };
    fetchData();
  }, [id, supabase]);

  const addCandidate = async () => {
    if (!newCandidate.name || !newCandidate.party) {
      alert("Name and Party are required");
      return;
    }
    const { error } = await supabase.from('candidates').insert({
      election_id: id,
      name: newCandidate.name,
      party: newCandidate.party,
      manifesto: newCandidate.manifesto,
    });
    if (error) alert("Failed to add candidate");
    else {
      setShowAddModal(false);
      setNewCandidate({ name: '', party: '', manifesto: '' });
      router.refresh();
      const { data } = await supabase.from('candidates').select('*').eq('election_id', id).order('created_at', { ascending: true });
      setCandidates(data || []);
    }
  };

  const deleteCandidate = async (candidateId: string) => {
    if (confirm("Delete this candidate?")) {
      await supabase.from('candidates').delete().eq('id', candidateId);
      setCandidates(prev => prev.filter(c => c.id !== candidateId));
      router.refresh();
    }
  };

  if (loading) return <div className="p-12 text-center text-neutral-400">Loading...</div>;
  if (!election) return <div className="p-12 text-center text-neutral-400">Not found</div>;

  return (
    <div className="max-w-5xl mx-auto p-6">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-neutral-400 hover:text-white mb-6">
        <ArrowLeft size={16} /> Back
      </button>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">{election.title}</h1>
          <p className="text-neutral-400">Manage Candidates</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 bg-[#008751] hover:bg-[#00693f] px-6 py-3 rounded-2xl font-medium">
          <Plus size={20} /> Add
        </button>
      </div>
      <div className="bg-neutral-900 rounded-3xl p-8">
        {candidates.length === 0 ? <p className="text-center py-16 text-neutral-400">No candidates.</p> : (
          <div className="space-y-4">
            {candidates.map((c: any) => (
              <div key={c.id} className="bg-neutral-800 p-4 rounded-2xl flex justify-between items-center">
                <div>
                  <h3 className="font-semibold">{c.name}</h3>
                  <p className="text-sm text-neutral-400">{c.party}</p>
                </div>
                <button onClick={() => deleteCandidate(c.id)} className="text-red-400 hover:text-red-300">Delete</button>
              </div>
            ))}
          </div>
        )}
      </div>
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-6 z-50">
          <div className="bg-neutral-900 w-full max-w-md rounded-3xl p-8 border border-neutral-800">
            <h2 className="text-2xl font-bold mb-6">New Candidate</h2>
            <div className="space-y-4">
              <input type="text" value={newCandidate.name} onChange={(e) => setNewCandidate({ ...newCandidate, name: e.target.value })} className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-4 py-3" placeholder="Name" />
              <input type="text" value={newCandidate.party} onChange={(e) => setNewCandidate({ ...newCandidate, party: e.target.value })} className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-4 py-3" placeholder="Party" />
              <textarea value={newCandidate.manifesto} onChange={(e) => setNewCandidate({ ...newCandidate, manifesto: e.target.value })} className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-4 py-3 h-32" placeholder="Manifesto" />
            </div>
            <div className="flex gap-4 mt-8">
              <button onClick={() => setShowAddModal(false)} className="flex-1 px-6 py-3 border border-neutral-700 rounded-xl">Cancel</button>
              <button onClick={addCandidate} className="flex-1 px-6 py-3 bg-[#008751] rounded-xl font-medium">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
