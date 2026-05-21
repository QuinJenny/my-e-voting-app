'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@/lib/supabase';

type ProfileRow = {
  full_name?: string | null;
  voter_id?: string | null;
  phone?: string | null;
  created_at?: string | null;
  is_verified?: boolean | null;
  verified?: boolean | null;
};

export default function ProfilePage() {
  const supabase = createClientComponentClient();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [fullName, setFullName] = useState<string>('User');
  const [email, setEmail] = useState<string>('');
  const [profile, setProfile] = useState<ProfileRow | null>(null);

  const initials = useMemo(() => {
    const parts = fullName.trim().split(/\s+/).filter(Boolean);
    const first = parts[0]?.[0] ?? 'U';
    const second = parts.length > 1 ? parts[1]?.[0] : '';
    return (first + (second ?? '')).toUpperCase();
  }, [fullName]);

  useEffect(() => {
    const loadProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user ?? null;
      if (!user) {
        router.replace('/login');
        return;
      }

      setEmail(user.email ?? '');

      const { data: profileRow } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      const typedProfile = (profileRow ?? null) as ProfileRow | null;
      setProfile(typedProfile);
      setFullName(typedProfile?.full_name || user.user_metadata?.full_name || 'User');
      setLoading(false);
    };

    loadProfile();

    const { data: authListener } = supabase.auth.onAuthStateChange((event: any, session: any) => {
      if (event === 'SIGNED_OUT' || !session) {
        router.replace('/login');
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [supabase, router]);

  if (loading) {
    return <div className="min-h-screen bg-neutral-950 flex items-center justify-center">Loading...</div>;
  }

  const voterId = profile?.voter_id ?? '-';
  const phone = profile?.phone ?? '-';
  const registeredSince = profile?.created_at ? new Date(profile.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long' }) : '-';
  const isVerified = profile?.is_verified ?? profile?.verified ?? false;

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-4xl font-bold mb-8">Profile</h1>

      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-10">
        <div className="flex items-center gap-6 mb-10">
          <div className="w-24 h-24 bg-[#008751] rounded-full flex items-center justify-center text-4xl font-bold">
            {initials}
          </div>
          <div>
            <h2 className="text-3xl font-semibold">{fullName}</h2>
            <p className="text-neutral-400">Voter ID: {voterId}</p>
            {isVerified && <p className="text-green-400 text-sm mt-1">✓ Verified Voter</p>}
          </div>
        </div>

        <div className="space-y-8">
          <div>
            <p className="text-neutral-400 text-sm mb-2">Email</p>
            <p className="text-white">{email || '-'}</p>
          </div>
          <div>
            <p className="text-neutral-400 text-sm mb-2">Phone</p>
            <p className="text-white">{phone}</p>
          </div>
          <div>
            <p className="text-neutral-400 text-sm mb-2">Registered Since</p>
            <p className="text-white">{registeredSince}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
