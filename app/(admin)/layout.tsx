'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSupabase } from '@/hooks/useSupabase';
import { LogOut, Home, PlusCircle, BarChart3 } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const supabase = useSupabase();
  const router = useRouter();

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.replace('/login');
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profile?.role !== 'admin') {
        alert("Access Denied: Admin privileges required.");
        router.replace('/dashboard');
        return;
      }

      setIsAdmin(true);
    };

    checkAdmin();

    const { data: authListener } = supabase.auth.onAuthStateChange((event: any, session: any) => {
      if (event === 'SIGNED_OUT' || !session) {
        router.replace('/login');
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [supabase, router]);

  const handleLogout = async () => {
    if (confirm("Are you sure you want to logout?")) {
      await supabase.auth.signOut();
    }
  };

  if (isAdmin === null) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center text-neutral-400">
        Checking admin permissions...
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-neutral-950 text-neutral-100 overflow-hidden">
      {/* Sidebar */}
      <div className="w-72 bg-neutral-900 border-r border-neutral-800 flex-shrink-0">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-10">
            <span className="text-2xl font-bold text-red-500">ADMIN</span>
            <span className="text-2xl font-bold">VoteSecure</span>
          </div>

          <nav className="space-y-2">
            <Link href="/admin" className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-neutral-800 font-medium">
              <Home size={20} /> Dashboard
            </Link>
            <Link href="/admin/elections" className="flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-neutral-800 transition">
              <PlusCircle size={20} /> Manage Elections
            </Link>
            <Link href="/admin/results" className="flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-neutral-800 transition">
              <BarChart3 size={20} /> View Results
            </Link>
          </nav>
        </div>

        <div className="absolute bottom-8 w-72 px-6">
          <button 
            onClick={handleLogout}
            className="flex w-full items-center gap-3 px-4 py-3 text-red-400 hover:bg-neutral-800 rounded-2xl transition"
          >
            <LogOut size={20} /> Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <nav className="h-16 border-b border-neutral-800 bg-neutral-900 px-8 flex items-center justify-between">
          <div className="font-semibold text-lg">Admin Portal</div>
        </nav>

        <main className="flex-1 overflow-auto p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
