export default function Home() {
  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100">
      {/* Navbar */}
      <nav className="fixed top-0 w-full border-b border-neutral-800 bg-neutral-950/80 backdrop-blur z-50">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-2 text-2xl font-bold tracking-tight">
            Vote<span style={{ color: "#008751" }}>Secure</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium">
            <a href="#how-it-works" className="hover:text-[#008751] transition">How it Works</a>
            <a href="#about" className="hover:text-[#008751] transition">About</a>
          </div>
          <div className="flex items-center gap-4">
            <a href="/login" className="px-6 py-2.5 border border-[#008751] text-[#008751] rounded-2xl hover:bg-[#008751]/10 transition">
              Sign In
            </a>
            <a href="/register" className="px-6 py-2.5 bg-[#008751] hover:bg-[#00693f] rounded-2xl transition">
              Register
            </a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-6xl md:text-7xl font-bold tracking-tighter mb-6">
            Secure. Transparent.<br />
            <span style={{ color: "#008751" }}>Democratic.</span>
          </h1>
          <p className="text-2xl text-neutral-400 max-w-2xl mx-auto">
            Vote from anywhere in Nigeria with full confidence.<br />
            Your vote is encrypted and verifiable.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/login" className="px-10 py-4 bg-[#008751] hover:bg-[#00693f] rounded-2xl text-lg font-semibold transition">
              Start Voting Now
            </a>
            <a href="#how-it-works" className="px-10 py-4 border border-neutral-700 hover:bg-neutral-900 rounded-2xl text-lg font-semibold transition">
              How It Works
            </a>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-neutral-900">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-neutral-400 text-lg">Simple, secure, and transparent voting in 4 steps</p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-6 bg-neutral-800 rounded-2xl flex items-center justify-center text-3xl">1️⃣</div>
              <h3 className="text-xl font-semibold mb-3">Register / Sign In</h3>
              <p className="text-neutral-400">Create an account or log in using your email or Voter ID.</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-6 bg-neutral-800 rounded-2xl flex items-center justify-center text-3xl">2️⃣</div>
              <h3 className="text-xl font-semibold mb-3">Verify Identity</h3>
              <p className="text-neutral-400">Your identity is verified securely while keeping your vote anonymous.</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-6 bg-neutral-800 rounded-2xl flex items-center justify-center text-3xl">3️⃣</div>
              <h3 className="text-xl font-semibold mb-3">Cast Your Vote</h3>
              <p className="text-neutral-400">Choose your candidate in a simple and secure digital ballot.</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-6 bg-neutral-800 rounded-2xl flex items-center justify-center text-3xl">4️⃣</div>
              <h3 className="text-xl font-semibold mb-3">View Results</h3>
              <p className="text-neutral-400">See live, transparent results as votes are counted in real-time.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-neutral-800 py-12 bg-neutral-950">
        <div className="max-w-5xl mx-auto px-6 text-center text-neutral-500 text-sm">
          © 2026 VoteSecure. All rights reserved. | Built for transparent democracy in Nigeria.
        </div>
      </footer>
    </main>
  );
}