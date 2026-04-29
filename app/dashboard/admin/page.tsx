'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ArrowRight, BarChart3, PlusCircle } from 'lucide-react';
import { createClientComponentClient } from '@/lib/supabase';

type ElectionRow = {
  id: string;
  title: string;
  status: 'ongoing' | 'upcoming' | 'ended' | string | null;
  start_date: string | null;
  end_date: string | null;
};

type DashboardStats = {
  totalElections: number;
  activeElections: number;
  totalVotesCast: number;
  registeredVoters: number;
};

const initialStats: DashboardStats = {
  totalElections: 0,
  activeElections: 0,
  totalVotesCast: 0,
  registeredVoters: 0,
};

export default function AdminDashboardPage() {
  const supabase = createClientComponentClient();
  const [stats, setStats] = useState<DashboardStats>(initialStats);
  const [recentElections, setRecentElections] = useState<ElectionRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDashboardData = async () => {
      setIsLoading(true);
      setError(null);

      const [
        totalElectionsRes,
        activeElectionsRes,
        totalVotesRes,
        registeredVotersRes,
        recentElectionsRes,
      ] = await Promise.all([
        supabase.from('elections').select('id', { count: 'exact', head: true }),
        supabase.from('elections').select('id', { count: 'exact', head: true }).eq('status', 'ongoing'),
        supabase.from('votes').select('id', { count: 'exact', head: true }),
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase
          .from('elections')
          .select('id, title, status, start_date, end_date')
          .order('start_date', { ascending: false })
          .limit(6),
      ]);

      const firstError =
        totalElectionsRes.error ||
        activeElectionsRes.error ||
        totalVotesRes.error ||
        registeredVotersRes.error ||
        recentElectionsRes.error;

      if (firstError) {
        setError(firstError.message);
        setIsLoading(false);
        return;
      }

      setStats({
        totalElections: totalElectionsRes.count ?? 0,
        activeElections: activeElectionsRes.count ?? 0,
        totalVotesCast: totalVotesRes.count ?? 0,
        registeredVoters: registeredVotersRes.count ?? 0,
      });

      setRecentElections((recentElectionsRes.data ?? []) as ElectionRow[]);
      setIsLoading(false);
    };

    loadDashboardData();
  }, [supabase]);

  return (
    <div className="max-w-7xl space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-red-100">Admin Dashboard</h1>
          <p className="mt-3 text-neutral-400">
            Command center for election operations, turnout intelligence, and platform oversight.
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/dashboard/admin/elections"
            className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-500 transition"
          >
            <PlusCircle size={16} />
            Create New Election
          </Link>
          <Link
            href="/dashboard/admin/results"
            className="inline-flex items-center gap-2 rounded-xl border border-red-500/40 px-4 py-2.5 text-sm font-medium text-red-200 hover:bg-red-950/40 transition"
          >
            <BarChart3 size={16} />
            View All Results
          </Link>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-500 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</div>
      )}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-red-900/40 bg-neutral-900 p-5">
          <p className="text-xs uppercase tracking-wider text-neutral-500">Total Elections</p>
          <p className="mt-3 text-3xl font-bold text-white">{isLoading ? '-' : stats.totalElections}</p>
        </div>
        <div className="rounded-2xl border border-green-900/40 bg-neutral-900 p-5">
          <p className="text-xs uppercase tracking-wider text-neutral-500">Active Elections</p>
          <p className="mt-3 text-3xl font-bold text-green-400">{isLoading ? '-' : stats.activeElections}</p>
        </div>
        <div className="rounded-2xl border border-red-900/40 bg-neutral-900 p-5">
          <p className="text-xs uppercase tracking-wider text-neutral-500">Total Votes Cast</p>
          <p className="mt-3 text-3xl font-bold text-white">{isLoading ? '-' : stats.totalVotesCast}</p>
        </div>
        <div className="rounded-2xl border border-green-900/40 bg-neutral-900 p-5">
          <p className="text-xs uppercase tracking-wider text-neutral-500">Registered Voters</p>
          <p className="mt-3 text-3xl font-bold text-green-400">{isLoading ? '-' : stats.registeredVoters}</p>
        </div>
      </section>

      <section className="rounded-2xl border border-neutral-800 bg-neutral-900 overflow-hidden">
        <div className="flex items-center justify-between border-b border-neutral-800 px-5 py-4">
          <h2 className="text-lg font-semibold text-red-100">Recent Elections</h2>
          <Link
            href="/dashboard/admin/elections"
            className="inline-flex items-center gap-1 text-sm text-neutral-300 hover:text-white transition"
          >
            Manage elections
            <ArrowRight size={14} />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-neutral-950/50 text-neutral-400">
              <tr>
                <th className="px-5 py-3 text-left font-medium">Title</th>
                <th className="px-5 py-3 text-left font-medium">Status</th>
                <th className="px-5 py-3 text-left font-medium">Start Date</th>
                <th className="px-5 py-3 text-left font-medium">End Date</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td className="px-5 py-4 text-neutral-500" colSpan={4}>
                    Loading elections...
                  </td>
                </tr>
              ) : recentElections.length === 0 ? (
                <tr>
                  <td className="px-5 py-4 text-neutral-500" colSpan={4}>
                    No elections found.
                  </td>
                </tr>
              ) : (
                recentElections.map((election) => (
                  <tr key={election.id} className="border-t border-neutral-800">
                    <td className="px-5 py-4 text-neutral-100">{election.title}</td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                          election.status === 'ongoing'
                            ? 'bg-green-500/20 text-green-300'
                            : election.status === 'ended'
                            ? 'bg-red-500/20 text-red-300'
                            : 'bg-neutral-700 text-neutral-200'
                        }`}
                      >
                        {election.status ?? 'unknown'}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-neutral-300">{election.start_date ?? '-'}</td>
                    <td className="px-5 py-4 text-neutral-300">{election.end_date ?? '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
