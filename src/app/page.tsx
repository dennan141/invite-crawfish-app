"use client";
import Nav from "@/components/Nav";
import Confetti from "@/components/Confetti";
import Link from "next/link";
import MonthCalendar from "@/components/MonthCalendar";

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
                <MonthCalendar/>
            </main>
        </div>
    );
}
