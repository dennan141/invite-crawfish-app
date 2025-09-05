import Nav from "@/components/Nav";

export default function RepoPage() {
  return (
    <div className="min-h-screen p-6">
      <Nav />
      <main className="max-w-3xl mx-auto mt-8 space-y-4">
        <h1 className="text-2xl font-bold">Repo / Supabase Functions</h1>
        <p className="opacity-80">This is a placeholder page for wiring up Supabase later.</p>
        <section className="rounded-xl border p-4 space-y-2">
          <h2 className="font-semibold">Intended endpoints/hooks (you can implement):</h2>
          <ul className="list-disc list-inside text-sm space-y-1">
            <li>auth.getUser() – read current user from local state or Supabase session</li>
            <li>profiles.listGuests() – list pre-defined guests (could be a table)</li>
            <li>availability.save(userId, choices) – upsert availability</li>
            <li>availability.getForUser(userId)</li>
            <li>chat.postMessage({`{ userId, text }`})</li>
            <li>chat.subscribe() – realtime subscription to messages</li>
            <li>chat.listRecent(limit) – fetch recent messages</li>
          </ul>
          <p className="text-xs opacity-70">Note: The rest of the app currently stores data in localStorage only.</p>
        </section>
      </main>
    </div>
  );
}
