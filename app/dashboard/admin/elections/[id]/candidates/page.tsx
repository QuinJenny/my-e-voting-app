'use client';

import Link from 'next/link';
import { FormEvent, use, useEffect, useMemo, useState } from 'react';
import { createClientComponentClient } from '@/lib/supabase';
import { ArrowLeft, Pencil, PlusCircle, Trash2, X } from 'lucide-react';

type Candidate = {
  id: string;
  name: string;
  party: string | null;
  manifesto: string | null;
  photo_url: string | null;
};

type Election = {
  id: string;
  title: string;
};

type CandidateFormState = {
  name: string;
  party: string;
  manifesto: string;
  photoUrl: string;
};

const emptyForm: CandidateFormState = {
  name: '',
  party: '',
  manifesto: '',
  photoUrl: '',
};

const friendlyError = (message: string, code?: string) => {
  if (code === '42501' || message.toLowerCase().includes('row-level security')) {
    return 'Permission denied by Supabase RLS policy for candidates. Please add candidate policies for admins.';
  }
  return message;
};

export default function ManageCandidatesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const supabase = createClientComponentClient();

  const [election, setElection] = useState<Election | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingCandidateId, setEditingCandidateId] = useState<string | null>(null);
  const [form, setForm] = useState<CandidateFormState>(emptyForm);

  const editingCandidate = useMemo(
    () => candidates.find((candidate) => candidate.id === editingCandidateId) ?? null,
    [candidates, editingCandidateId]
  );

  const loadData = async () => {
    setIsLoading(true);
    setError(null);

    const { data: electionData, error: electionError } = await supabase
      .from('elections')
      .select('id, title')
      .eq('id', id)
      .maybeSingle();

    if (electionError) {
      setError(friendlyError(electionError.message, electionError.code));
      setIsLoading(false);
      return;
    }

    if (!electionData) {
      setError('Election not found.');
      setIsLoading(false);
      return;
    }

    const { data: candidatesData, error: candidatesError } = await supabase
      .from('candidates')
      .select('id, name, party, manifesto, photo_url')
      .eq('election_id', id)
      .order('name', { ascending: true });

    if (candidatesError) {
      setError(friendlyError(candidatesError.message, candidatesError.code));
      setIsLoading(false);
      return;
    }

    setElection(electionData as Election);
    setCandidates((candidatesData ?? []) as Candidate[]);
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const openCreateModal = () => {
    setEditingCandidateId(null);
    setForm(emptyForm);
    setIsModalOpen(true);
  };

  const openEditModal = (candidate: Candidate) => {
    setEditingCandidateId(candidate.id);
    setForm({
      name: candidate.name,
      party: candidate.party ?? '',
      manifesto: candidate.manifesto ?? '',
      photoUrl: candidate.photo_url ?? '',
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCandidateId(null);
    setForm(emptyForm);
  };

  const saveCandidate = async (event: FormEvent) => {
    event.preventDefault();
    setIsSaving(true);
    setError(null);

    const payload = {
      election_id: id,
      name: form.name.trim(),
      party: form.party.trim() || null,
      manifesto: form.manifesto.trim() || null,
      photo_url: form.photoUrl.trim() || null,
    };

    if (!payload.name) {
      setError('Candidate name is required.');
      setIsSaving(false);
      return;
    }

    if (editingCandidate) {
      const { error: updateError } = await supabase.from('candidates').update(payload).eq('id', editingCandidate.id);
      if (updateError) {
        setError(friendlyError(updateError.message, updateError.code));
        setIsSaving(false);
        return;
      }
    } else {
      const { error: insertError } = await supabase.from('candidates').insert(payload);
      if (insertError) {
        setError(friendlyError(insertError.message, insertError.code));
        setIsSaving(false);
        return;
      }
    }

    closeModal();
    await loadData();
    setIsSaving(false);
  };

  const deleteCandidate = async (candidateId: string) => {
    const confirmed = window.confirm('Delete this candidate? This action cannot be undone.');
    if (!confirmed) return;

    const { error: deleteError } = await supabase.from('candidates').delete().eq('id', candidateId);
    if (deleteError) {
      setError(friendlyError(deleteError.message, deleteError.code));
      return;
    }

    await loadData();
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link href="/dashboard/admin/elections" className="inline-flex items-center gap-2 text-neutral-400 hover:text-white">
            <ArrowLeft size={16} />
            Back to Elections
          </Link>
          <h1 className="mt-3 text-4xl font-bold text-red-100">Manage Candidates</h1>
          <p className="mt-2 text-neutral-400">
            {isLoading ? 'Loading election...' : election?.title ?? 'Election not found'}
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-500 transition"
        >
          <PlusCircle size={16} />
          Add New Candidate
        </button>
      </div>

      {error && <div className="rounded-2xl border border-red-500 bg-red-500/10 p-4 text-red-300">{error}</div>}

      <div className="overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900">
        <table className="min-w-full text-sm">
          <thead className="bg-neutral-950/60 text-neutral-400">
            <tr>
              <th className="px-5 py-3 text-left font-medium">Name</th>
              <th className="px-5 py-3 text-left font-medium">Party</th>
              <th className="px-5 py-3 text-left font-medium">Manifesto</th>
              <th className="px-5 py-3 text-left font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td className="px-5 py-4 text-neutral-500" colSpan={4}>
                  Loading candidates...
                </td>
              </tr>
            ) : candidates.length === 0 ? (
              <tr>
                <td className="px-5 py-4 text-neutral-500" colSpan={4}>
                  No candidates found for this election.
                </td>
              </tr>
            ) : (
              candidates.map((candidate) => (
                <tr key={candidate.id} className="border-t border-neutral-800">
                  <td className="px-5 py-4 text-neutral-100">{candidate.name}</td>
                  <td className="px-5 py-4 text-neutral-300">{candidate.party ?? 'Independent'}</td>
                  <td className="px-5 py-4 text-neutral-300">
                    {(candidate.manifesto ?? 'No manifesto provided').slice(0, 90)}
                    {(candidate.manifesto?.length ?? 0) > 90 ? '...' : ''}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEditModal(candidate)}
                        className="inline-flex items-center gap-1 rounded-lg border border-neutral-700 px-3 py-1.5 text-neutral-200 hover:bg-neutral-800"
                      >
                        <Pencil size={14} />
                        Edit
                      </button>
                      <button
                        onClick={() => deleteCandidate(candidate.id)}
                        className="inline-flex items-center gap-1 rounded-lg border border-red-500/60 px-3 py-1.5 text-red-300 hover:bg-red-500/10"
                      >
                        <Trash2 size={14} />
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl rounded-2xl border border-neutral-700 bg-neutral-900 p-6">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-red-100">
                {editingCandidate ? 'Edit Candidate' : 'Add New Candidate'}
              </h2>
              <button onClick={closeModal} className="rounded-lg p-2 hover:bg-neutral-800">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={saveCandidate} className="space-y-4">
              <input
                value={form.name}
                onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                placeholder="Candidate Name"
                className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3"
              />
              <input
                value={form.party}
                onChange={(event) => setForm((current) => ({ ...current, party: event.target.value }))}
                placeholder="Party"
                className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3"
              />
              <textarea
                rows={4}
                value={form.manifesto}
                onChange={(event) => setForm((current) => ({ ...current, manifesto: event.target.value }))}
                placeholder="Manifesto"
                className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3"
              />
              <input
                value={form.photoUrl}
                onChange={(event) => setForm((current) => ({ ...current, photoUrl: event.target.value }))}
                placeholder="Photo URL (optional)"
                className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3"
              />

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-xl border border-neutral-700 px-4 py-2.5 hover:bg-neutral-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="rounded-xl bg-red-600 px-4 py-2.5 font-medium text-white hover:bg-red-500 disabled:opacity-60"
                >
                  {isSaving ? 'Saving...' : editingCandidate ? 'Save Changes' : 'Create Candidate'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
