export default function MyVotesPage() {
    return (
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">My Votes</h1>
        
        <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-12 text-center">
          <div className="text-6xl mb-6">🗳️</div>
          <h2 className="text-2xl font-semibold mb-4">You have cast 3 votes so far</h2>
          <p className="text-neutral-400 max-w-md mx-auto">
            All your votes are encrypted and securely recorded. 
            You can view your voting history here.
          </p>
          
          <div className="mt-12 space-y-6">
            <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-6 text-left">
              <p className="text-[#008751] font-medium">2026 Presidential Election</p>
              <p className="text-neutral-400 text-sm mt-1">Voted for Emeka Okoro (PDP) • Vote ID: VOTE-8K9P2M</p>
            </div>
            <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-6 text-left opacity-75">
              <p className="text-[#008751] font-medium">Lagos State Governor Election</p>
              <p className="text-neutral-400 text-sm mt-1">Voted for Tunde Adewale (APC)</p>
            </div>
          </div>
        </div>
      </div>
    );
  }