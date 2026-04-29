'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ComponentType, ReactNode, useEffect, useState } from 'react';
import { BarChart3, Home, LogOut, PlusCircle, Users } from 'lucide-react';
import { createClientComponentClient } from '@/lib/supabase';

type NavItem = {
  label: string;
  href: string;
  icon: ComponentType<{ size?: number; className?: string }>;
};

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard/admin', icon: Home },
  { label: 'Manage Elections', href: '/dashboard/admin/elections', icon: PlusCircle },
  { label: 'Results', href: '/dashboard/admin/results', icon: BarChart3 },
  { label: 'Users', href: '/dashboard/admin/users', icon: Users },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClientComponentClient();

  const [isCheckingAccess, setIsCheckingAccess] = useState(true);
  const [adminEmail, setAdminEmail] = useState('');

  useEffect(() => {
    const validateAdminAccess = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace('/login');
        return;
      }

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .maybeSingle();

      if (error || !profile || profile.role !== 'admin') {
        router.replace('/login');
        return;
      }

      setAdminEmail(user.email ?? 'admin@votesecure.local');
      setIsCheckingAccess(false);
    };

    validateAdminAccess();
  }, [router, supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace('/login');
  };

  if (isCheckingAccess) {
    return (
      <div className="min-h-screen bg-neutral-950 text-neutral-200 grid place-items-center">
        <p className="text-sm text-neutral-400">Verifying admin access...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <div className="flex min-h-screen">
        <aside className="w-72 border-r border-red-900/30 bg-neutral-900/90 p-6">
          <div className="mb-10">
            <h1 className="text-2xl font-bold tracking-tight">
              Vote<span className="text-red-500">Secure</span>
            </h1>
            <p className="mt-2 text-xs uppercase tracking-widest text-red-300">Admin Portal</p>
          </div>

          <nav className="space-y-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition ${
                    isActive
                      ? 'bg-red-600/20 text-red-200 border border-red-500/40'
                      : 'text-neutral-300 hover:bg-neutral-800'
                  }`}
                >
                  <Icon size={18} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <button
            onClick={handleLogout}
            className="mt-10 flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm text-red-300 hover:bg-red-950/40 transition"
          >
            <LogOut size={18} />
            Log Out
          </button>
        </aside>

        <div className="flex-1 flex flex-col">
          <header className="h-16 border-b border-red-900/30 bg-neutral-900/60 px-8 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-red-100">Admin Portal</h2>
            <div className="text-sm text-neutral-300">{adminEmail}</div>
          </header>

          <main className="flex-1 p-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
