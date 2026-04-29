'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import { createClientComponentClient } from '@/lib/supabase';
import { Loader2, Pencil, Plus, Trash2, CheckCircle2 } from 'lucide-react';

type Election = {
  id: string;
  title: string;
  description: string | null;
  start_date: string | null;
  end_date: string | null;
  status: 'ongoing' | 'upcoming' | 'ended' | string;
};

type ElectionFormState = {
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  status: 'ongoing' | 'upcoming' | 'ended';
};

const emptyForm: ElectionFormState = {
  title: '',
  description: '',
  startDate: '',
  endDate: '',
  status: 'upcoming',
};

const getFriendlyDbError = (message: string, code?: string) => {
  if (code === '42501' || message.toLowerCase().includes('row-level security')) {
    return 'Permission denied by Supabase RLS policy. Run sql/enable-admin-elections-rls.sql in your Supabase SQL Editor, then try again.';
  }
  return message;
};

export default function AdminElectionsPage() {
  const supabase = createClientComponentClient();
  const [elections, setElections] = useState<Election[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingElectionId, setEditingElectionId] = useState<string | null>(null);
  const [form, setForm] = useState<ElectionFormState>(emptyForm);

  const editingElection = useMemo(
    () => elections.find((election) => election.id === editingElectionId) ?? null,
    [elections, editingElectionId]
  );

  const loadElections = async () => {
    setIsLoading(true);
    setError(null);

    const { data, error: loadError } = await supabase
      .from('elections')
      .select('id, title, description, start_date, end_date, status')
      .order('start_date', { ascending: true });

    if (loadError) {
      setError(getFriendlyDbError(loadError.message, loadError.code));
      setIsLoading(false);
      return;
    }

    setElections((data ?? []) as Election[]);
    setIsLoading(false);
  };

  useEffect(() => {
    loadElections();
  }, []);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingElectionId(null);
    setError(null);
  };

  const startEditing = (election: Election) => {
    setEditingElectionId(election.id);
    setForm({
      title: election.title,
      description: election.description ?? '',
      startDate: election.start_date ?? '',
      endDate: election.end_date ?? '',
      status: election.status === 'ongoing' || election.status === 'ended' ? election.status : 'upcoming',
    });
    setError(null);
  };

  const saveElection = async (event: FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const payload = {
      title: form.title.trim(),
      description: form.description.trim() || null,
      start_date: form.startDate || null,
      end_date: form.endDate || null,
      status: form.status,
    };

    if (!payload.title) {
      setIsSubmitting(false);
      setError('Election title is required.');
      return;
    }

    if (editingElection) {
      const { error: updateError } = await supabase
        .from('elections')
        .update(payload)
        .eq('id', editingElection.id);

      if (updateError) {
        setError(getFriendlyDbError(updateError.message, updateError.code));
        setIsSubmitting(false);
        return;
      }
    } else {
      const { error: insertError } = await supabase.from('elections').insert(payload);

      if (insertError) {
        setError(getFriendlyDbError(insertError.message, insertError.code));
        setIsSubmitting(false);
        return;
      }
    }

    resetForm();
    await loadElections();
    setIsSubmitting(false);
  };

  const resolveElection = async (electionId: string) => {
    const { error: resolveError } = await supabase
      .from('elections')
      .update({ status: 'ended', end_date: new Date().toISOString().slice(0, 10) })
      .eq('id', electionId);

    if (resolveError) {
      setError(getFriendlyDbError(resolveError.message, resolveError.code));
      return;
    }

    await loadElections();
  };

  const deleteElection = async (electionId: string) => {
    const shouldDelete = window.confirm('Delete this election? This action cannot be undone.');
    if (!shouldDelete) return;

    const { error: deleteError } = await supabase.from('elections').delete().eq('id', electionId);

    if (deleteError) {
      setError(
        deleteError.code === '23503'
          ? 'Cannot delete this election because votes or candidates still reference it.'
          : getFriendlyDbError(deleteError.message, deleteError.code)
      );
      return;
    }

    if (editingElectionId === electionId) {
      resetForm();
    }
    await loadElections();
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-4xl font-bold">Admin Elections</h1>
        <p className="text-neutral-400 mt-2">Create, resolve, and delete elections from one place.</p>
      </div>

      {error && <div className="rounded-2xl border border-red-500 bg-red-500/10 p-4 text-red-300">{error}</div>}

      <form onSubmit={saveElection} className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">{editingElection ? 'Edit election' : 'Create election'}</h2>
          {editingElection && (
            <button
              type="button"
              onClick={resetForm}
              className="text-sm px-3 py-2 rounded-xl border border-neutral-700 hover:bg-neutral-800 transition"
            >
              Cancel editing
            </button>
          )}
        </div>

        <input
          value={form.title}
          onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
          placeholder="Election title"
          className="w-full rounded-2xl border border-neutral-700 bg-neutral-950 px-4 py-3"
        />
        <textarea
          value={form.description}
          onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
          placeholder="Election description"
          rows={3}
          className="w-full rounded-2xl border border-neutral-700 bg-neutral-950 px-4 py-3"
        />

        <div className="grid md:grid-cols-3 gap-4">
          <input
            type="date"
            value={form.startDate}
            onChange={(event) => setForm((current) => ({ ...current, startDate: event.target.value }))}
            className="rounded-2xl border border-neutral-700 bg-neutral-950 px-4 py-3"
          />
          <input
            type="date"
            value={form.endDate}
            onChange={(event) => setForm((current) => ({ ...current, endDate: event.target.value }))}
            className="rounded-2xl border border-neutral-700 bg-neutral-950 px-4 py-3"
          />
          <select
            value={form.status}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                status: event.target.value as ElectionFormState['status'],
              }))
            }
            className="rounded-2xl border border-neutral-700 bg-neutral-950 px-4 py-3"
          >
            <option value="upcoming">Upcoming</option>
            <option value="ongoing">Ongoing</option>
            <option value="ended">Ended</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center gap-2 rounded-2xl bg-[#008751] px-5 py-3 font-medium hover:bg-[#00693f] disabled:opacity-60"
        >
          {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
          {editingElection ? 'Save changes' : 'Create election'}
        </button>
      </form>

      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6">
        <h2 className="text-2xl font-semibold mb-4">Existing elections</h2>
        {isLoading ? (
          <p className="text-neutral-400">Loading elections...</p>
        ) : elections.length === 0 ? (
          <p className="text-neutral-400">No elections found yet.</p>
        ) : (
          <div className="space-y-3">
            {elections.map((election) => (
              <div key={election.id} className="rounded-2xl border border-neutral-800 bg-neutral-950 p-4">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold">{election.title}</h3>
                    <p className="text-neutral-400 text-sm mt-1">{election.description ?? 'No description provided'}</p>
                    <p className="text-neutral-500 text-xs mt-2">
                      {election.start_date ?? 'No start date'} - {election.end_date ?? 'No end date'} | {election.status}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/dashboard/admin/elections/${election.id}/candidates`}
                      className="inline-flex items-center gap-1 rounded-xl border border-red-500/60 px-3 py-2 text-sm text-red-200 hover:bg-red-500/10"
                    >
                      Manage Candidates
                    </Link>
                    <button
                      type="button"
                      onClick={() => startEditing(election)}
                      className="inline-flex items-center gap-1 rounded-xl border border-neutral-700 px-3 py-2 text-sm hover:bg-neutral-800"
                    >
                      <Pencil size={14} />
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => resolveElection(election.id)}
                      disabled={election.status === 'ended'}
                      className="inline-flex items-center gap-1 rounded-xl border border-[#008751] px-3 py-2 text-sm text-[#7ff0b4] hover:bg-[#008751]/10 disabled:opacity-50"
                    >
                      <CheckCircle2 size={14} />
                      Resolve
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteElection(election.id)}
                      className="inline-flex items-center gap-1 rounded-xl border border-red-500/60 px-3 py-2 text-sm text-red-300 hover:bg-red-500/10"
                    >
                      <Trash2 size={14} />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
