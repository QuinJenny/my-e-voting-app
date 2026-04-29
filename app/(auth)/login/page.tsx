'use client';

import Link from "next/link";
import { useState } from "react";
import { createClientComponentClient } from '@/lib/supabase';

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClientComponentClient();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError(signInError.message);
    } else {
      window.location.href = "/dashboard";
    }
    setIsLoading(false);
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-neutral-950 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-10 shadow-2xl">
          <div className="flex justify-center mb-8">
            <div className="flex items-center gap-2 text-4xl font-bold tracking-tighter">
              <span>Vote</span>
              <span style={{ color: "#008751" }}>Secure</span>
            </div>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-3xl font-semibold text-white mb-2">Sign In</h1>
            <p className="text-neutral-400">Welcome back! Sign in to your VoteSecure account</p>
          </div>

          {error && <div className="bg-red-500/10 border border-red-500 text-red-400 p-4 rounded-2xl mb-6">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">Email</label>
              <input
                name="email"
                type="email"
                required
                className="w-full px-5 py-3.5 bg-neutral-950 border border-neutral-700 rounded-2xl text-white placeholder:text-neutral-500 focus:border-[#008751] outline-none"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">Password</label>
              <input
                name="password"
                type="password"
                required
                className="w-full px-5 py-3.5 bg-neutral-950 border border-neutral-700 rounded-2xl text-white placeholder:text-neutral-500 focus:border-[#008751] outline-none"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-[#008751] hover:bg-[#00693f] text-white font-semibold rounded-2xl transition disabled:opacity-70"
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="text-center mt-8 text-neutral-400 text-sm">
            Don't have an account?{" "}
            <Link href="/register" className="text-[#008751] font-medium hover:underline">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}