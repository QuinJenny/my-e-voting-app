'use client';

import { useState, useEffect } from 'react';
import { useSupabase } from '@/hooks/useSupabase';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const [emailOrId, setEmailOrId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [userName, setUserName] = useState<string | null>(null);

  const supabase = useSupabase();
  const router = useRouter();

  // Check if user is already logged in
  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', user.id)
          .single();

        setUserName(profile?.full_name || 'User');
        router.push('/dashboard'); // Redirect if already logged in
      }
    };
    checkUser();
  }, [supabase, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: emailOrId,
        password,
      });

      if (error) throw error;

      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-neutral-900 text-neutral-100 px-4">
      <div className="w-full max-w-md bg-neutral-950 border border-neutral-800 rounded-3xl p-8">
        <div className="flex flex-col items-center mb-8">
          <div className="text-3xl font-bold mb-2">
            Vote<span className="text-[#008751]">Secure</span>
          </div>
          {userName ? (
            <h1 className="text-2xl font-semibold text-center">Welcome back, {userName} 👋</h1>
          ) : (
            <h1 className="text-2xl font-semibold text-center">Sign in to your account</h1>
          )}
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm mb-2">Email or Voter ID</label>
            <input
              type="text"
              value={emailOrId}
              onChange={(e) => setEmailOrId(e.target.value)}
              className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-4 py-3 focus:border-[#008751] outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm mb-2">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-4 py-3 pr-12 focus:border-[#008751] outline-none"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-200"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-[#008751] hover:bg-[#00693f] rounded-2xl font-semibold text-lg disabled:opacity-70"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm">
          Don't have an account?{' '}
          <Link href="/register" className="text-[#008751] hover:underline">
            Create one
          </Link>
        </div>
      </div>
    </main>
  );
}
