"use client";

export default function Dashboard() {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-ink mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-paper border border-hair rounded-xl p-6">
          <p className="text-sm text-sub mb-2">Total Participants</p>
          <p className="text-3xl font-semibold text-ink">0</p>
        </div>
        <div className="bg-paper border border-hair rounded-xl p-6">
          <p className="text-sm text-sub mb-2">Pending Invites</p>
          <p className="text-3xl font-semibold text-ink">0</p>
        </div>
        <div className="bg-paper border border-hair rounded-xl p-6">
          <p className="text-sm text-sub mb-2">RWAs Issued</p>
          <p className="text-3xl font-semibold text-ink">0</p>
        </div>
      </div>
    </div>
  );
}
