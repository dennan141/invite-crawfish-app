"use client";
import Nav from "@/components/Nav";
import Confetti from "@/components/Confetti";
import Link from "next/link";

export default function Home() {
    return (
        <div className="min-h-screen p-6">
            <Confetti/>
            <Nav/>
            <main className="max-w-3xl mx-auto mt-8 space-y-6">
                <section className="text-center space-y-3">
                    <h1 className="text-3xl sm:text-4xl font-extrabold">Officiel inbjudan 🎺🎉</h1>
                    <p className="text-base opacity-80">
                        Välkommen till den officiella kräftskiva inbjudan! </p>
                    <audio controls className="mx-auto mt-2">
                        <source src="/fanfare.mp3" type="audio/mpeg"/>
                        Your browser does not support the audio element.
                    </audio>
                    <p className="text-xs opacity-60">Tips: Spela mig för en fanfar!</p>
                </section>

                <div className="grid sm:grid-cols-2 gap-3">
                    <Link href="/select-user" className="rounded-xl border p-4 hover:bg-black/5 dark:hover:bg-white/10">
                        <h3 className="font-semibold">Select User →</h3>
                        <p className="text-sm opacity-80">Choose your name from the list and save it in your
                            browser.</p>
                    </Link>
                    <Link href="/availability"
                          className="rounded-xl border p-4 hover:bg-black/5 dark:hover:bg-white/10">
                        <h3 className="font-semibold">Availability →</h3>
                        <p className="text-sm opacity-80">Mark which dates work for you from the two weekends.</p>
                    </Link>
                    <Link href="/chat" className="rounded-xl border p-4 hover:bg-black/5 dark:hover:bg-white/10">
                        <h3 className="font-semibold">Group Chat →</h3>
                        <p className="text-sm opacity-80">Ask questions or leave notes for the group. (Local only for
                            now)</p>
                    </Link>
                    <Link href="/repo" className="rounded-xl border p-4 hover:bg-black/5 dark:hover:bg-white/10">
                        <h3 className="font-semibold">Repo / Supabase →</h3>
                        <p className="text-sm opacity-80">Placeholder page to wire up Supabase functions later.</p>
                    </Link>
                </div>
            </main>
        </div>
    );
}
