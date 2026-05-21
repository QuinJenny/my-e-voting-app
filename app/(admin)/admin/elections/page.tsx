'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useSupabase } from '@/hooks/useSupabase';
import { PlusCircle, ChevronRight } from 'lucide-react';

type ElectionStatus = 'ongoing' | 'upcoming' | 'ended';

type ElectionRow = {
  id: string;
  title: string;
  description: string | null;
  start_date: string | null;
  end_date: string | null;
  status: ElectionStatus | null;
};

export default function AdminElectionsPage() {
  const supabase = useSupabase();
  const [elections, setElections] = useState<ElectionRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    start_date: '',
    end_date: '',
    status: 'upcoming' as ElectionStatus,
  });

  const canSubmit = useMemo(() => {
    return form.title.trim().length > 0 && form.start_date.trim().length > 0 && form.end_date.trim().length > 0;
  }, [form]);

  const loadElections = async () => {
    setIsLoading(true);
    setError(null);

    const { data, error } = await supabase
      .from('elections')
      .select('id, title, description, start_date, end_date, status')
      .order('start_date', { ascending: false });

    if (error) {
      setError(error.message);
      setElections([]);
      setIsLoading(false);
      return;
    }

    setElections(((data ?? []) as unknown as ElectionRow[]));
    setIsLoading(false);
  };

  useEffect(() => {
    loadElections();
  }, [supabase]);

  const createElection = async () => {
    if (!canSubmit) return;

    const { error } = await supabase.from('elections').insert({
      title: form.title.trim(),
      description: form.description.trim() || null,
      start_date: form.start_date,
      end_date: form.end_date,
      status: form.status,
    });

    if (error) {
      setError(error.message);
      return;
    }

    setShowCreate(false);
    setForm({ title: '', description: '', start_date: '', end_date: '', status: 'upcoming' });
    await loadElections();
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex items-start justify-between gap-6">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">Manage Elections</h1>
          <p className="text-neutral-400">Create elections and manage candidates</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 bg-[#008751] hover:bg-[#00693f] px-6 py-3 rounded-2xl font-medium text-white"
        >
          <PlusCircle size={20} /> New Election
        </button>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-500 bg-red-500/10 p-4 text-red-300">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="p-12 text-center text-neutral-400">Loading elections...</div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {elections.map((election) => (
            <div
              key={election.id}
              className="bg-neutral-900 border border-neutral-800 rounded-3xl p-8 hover:border-[#008751] transition"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-semibold text-white">{election.title}</h2>
                  <p className="text-neutral-400 mt-2 line-clamp-2">{election.description ?? 'No description provided'}</p>
                </div>
                <span
                  className={`px-4 py-1.5 text-xs font-medium rounded-full ${
                    election.status === 'ongoing'
                      ? 'bg-green-500/20 text-green-400'
                      : election.status === 'upcoming'
                        ? 'bg-yellow-500/20 text-yellow-400'
                        : 'bg-neutral-700 text-neutral-400'
                  }`}
                >
                  {(election.status ?? 'upcoming').toUpperCase()}
                </span>
              </div>

              <div className="mt-8 flex items-center justify-between">
                <div className="text-sm text-neutral-500">
                  <div>Start: {election.start_date ?? '-'}</div>
                  <div>End: {election.end_date ?? '-'}</div>
                </div>
                <Link
                  href={`/admin/elections/${election.id}/candidates`}
                  className="flex items-center gap-2 text-[#008751] hover:text-[#35b57a] font-medium"
                >
                  Manage Candidates <ChevronRight size={18} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {showCreate && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-6 z-50">
          <div className="w-full max-w-lg bg-neutral-950 border border-neutral-800 rounded-3xl p-8">
            <h2 className="text-2xl font-bold text-white mb-6">Create Election</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-neutral-300 mb-2">Title</label>
                <input
                  value={form.title}
                  onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-4 py-3 focus:border-[#008751] outline-none"
                />
              </div>
              <div>
                <label className="block text-sm text-neutral-300 mb-2">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-4 py-3 h-28 focus:border-[#008751] outline-none"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-neutral-300 mb-2">Start Date</label>
                  <input
                    type="date"
                    value={form.start_date}
                    onChange={(e) => setForm((prev) => ({ ...prev, start_date: e.target.value }))}
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-4 py-3 focus:border-[#008751] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm text-neutral-300 mb-2">End Date</label>
                  <input
                    type="date"
                    value={form.end_date}
                    onChange={(e) => setForm((prev) => ({ ...prev, end_date: e.target.value }))}
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-4 py-3 focus:border-[#008751] outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-neutral-300 mb-2">Status</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value as ElectionStatus }))}
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-4 py-3 focus:border-[#008751] outline-none"
                >
                  <option value="upcoming">Upcoming</option>
                  <option value="ongoing">Ongoing</option>
                  <option value="ended">Ended</option>
                </select>
              </div>
            </div>

            <div className="mt-8 flex gap-4">
              <button
                onClick={() => setShowCreate(false)}
                className="flex-1 px-6 py-3 border border-neutral-700 rounded-xl hover:bg-neutral-900 transition"
              >
                Cancel
              </button>
              <button
                onClick={createElection}
                disabled={!canSubmit}
                className="flex-1 px-6 py-3 bg-[#008751] hover:bg-[#00693f] rounded-xl font-medium text-white disabled:opacity-60"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
