'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@/lib/supabase';
import { Home, List, CheckSquare, User, LogOut, Bell, Search, Shield } from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClientComponentClient();
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user ?? null;
      if (!user) {
        router.replace('/login');
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single();

      setUser({
        ...user,
        full_name: profile?.full_name || user.user_metadata?.full_name || 'User'
      });
      setLoading(false);
    };

    checkAuth();

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
      router.replace('/login');
      router.refresh();
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-neutral-950 flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="flex h-screen bg-neutral-950 text-neutral-100 overflow-hidden">
      {/* Sidebar */}
      <div className={`bg-neutral-900 border-r border-neutral-800 w-72 flex-shrink-0 transition-all duration-300 ${sidebarOpen ? '' : '-translate-x-full md:translate-x-0'}`}>
        <div className="p-6">
          <div className="flex items-center gap-2 mb-10">
            <span className="text-2xl font-bold">Vote<span style={{color: '#008751'}}>Secure</span></span>
          </div>

          <nav className="space-y-2">
            <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-neutral-800 font-medium">
              <Home size={20} /> Dashboard
            </Link>
            <Link href="/dashboard/elections" className="flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-neutral-800 transition">
              <List size={20} /> Elections
            </Link>
            <Link href="/dashboard/my-votes" className="flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-neutral-800 transition">
              <CheckSquare size={20} /> My Votes
            </Link>
            <Link href="/admin/elections" className="flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-neutral-800 transition">
              <Shield size={20} /> Admin
            </Link>
            <Link href="/dashboard/profile" className="flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-neutral-800 transition">
              <User size={20} /> Profile
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

      {/* Main Area */}
      <div className="flex-1 flex flex-col">
        <nav className="h-16 border-b border-neutral-800 bg-neutral-900 px-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="md:hidden">
              <List size={24} />
            </button>
            <div className="relative max-w-md flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500" size={20} />
              <input 
                type="text" 
                placeholder="Search elections..." 
                className="w-full bg-neutral-800 border border-neutral-700 pl-11 py-2.5 rounded-2xl text-sm focus:border-[#008751]" 
              />
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="relative cursor-pointer">
              <Bell size={22} />
              <div className="absolute -top-1 -right-1 bg-red-500 text-[10px] w-4 h-4 rounded-full flex items-center justify-center">3</div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#008751] flex items-center justify-center font-medium text-sm">
                {user?.full_name?.[0] || 'U'}
              </div>
              <div>
                <div className="font-medium text-sm">{user?.full_name || 'User'}</div>
                <div className="text-xs text-neutral-500">{user?.email || ''}</div>
              </div>
            </div>
          </div>
        </nav>

        <main className="flex-1 overflow-auto p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
