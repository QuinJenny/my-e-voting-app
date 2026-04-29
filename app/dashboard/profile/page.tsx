export default function ProfilePage() {
    return (
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Profile</h1>
        
        <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-10">
          <div className="flex items-center gap-6 mb-10">
            <div className="w-24 h-24 bg-[#008751] rounded-full flex items-center justify-center text-4xl font-bold">
              QJ
            </div>
            <div>
              <h2 className="text-3xl font-semibold">Quin Jayne</h2>
              <p className="text-neutral-400">Voter ID: NGV-987654321</p>
              <p className="text-green-400 text-sm mt-1">✓ Verified Voter</p>
            </div>
          </div>
  
          <div className="space-y-8">
            <div>
              <p className="text-neutral-400 text-sm mb-2">Email</p>
              <p className="text-white">quin.jayne@example.com</p>
            </div>
            <div>
              <p className="text-neutral-400 text-sm mb-2">Phone</p>
              <p className="text-white">+234 801 234 5678</p>
            </div>
            <div>
              <p className="text-neutral-400 text-sm mb-2">Registered Since</p>
              <p className="text-white">March 2025</p>
            </div>
          </div>
        </div>
      </div>
    );
  }