'use client';

import Link from 'next/link';
import { Users, Award, TrendingUp, PlusCircle } from 'lucide-react';

export default function AdminDashboard() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-white mb-2">Admin Dashboard</h1>
        <p className="text-neutral-400">Welcome back, Administrator</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-neutral-900 p-6 rounded-3xl">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#008751]/20 rounded-2xl flex items-center justify-center">
              <Users className="text-[#008751]" size={28} />
            </div>
            <div>
              <p className="text-3xl font-bold">12</p>
              <p className="text-neutral-400">Total Elections</p>
            </div>
          </div>
        </div>

        <div className="bg-neutral-900 p-6 rounded-3xl">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-yellow-500/20 rounded-2xl flex items-center justify-center">
              <Award className="text-yellow-400" size={28} />
            </div>
            <div>
              <p className="text-3xl font-bold">8</p>
              <p className="text-neutral-400">Active Elections</p>
            </div>
          </div>
        </div>

        <div className="bg-neutral-900 p-6 rounded-3xl">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-500/20 rounded-2xl flex items-center justify-center">
              <TrendingUp className="text-blue-400" size={28} />
            </div>
            <div>
              <p className="text-3xl font-bold">2,847</p>
              <p className="text-neutral-400">Total Votes</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-neutral-900 rounded-3xl p-8">
        <h2 className="text-2xl font-semibold mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link 
            href="/admin/elections" 
            className="block p-6 bg-neutral-800 hover:bg-neutral-700 rounded-2xl transition"
          >
            <h3 className="font-medium text-lg flex items-center gap-2">
              <PlusCircle size={20} /> Manage Elections
            </h3>
            <p className="text-neutral-400 text-sm mt-1">Create, edit or delete elections</p>
          </Link>
          
          <Link 
            href="/admin/results" 
            className="block p-6 bg-neutral-800 hover:bg-neutral-700 rounded-2xl transition"
          >
            <h3 className="font-medium text-lg">View All Results</h3>
            <p className="text-neutral-400 text-sm mt-1">Monitor live election results</p>
          </Link>
        </div>
      </div>
    </div>
  );
}