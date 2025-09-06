"use client";
import Nav from "@/components/Nav";
import Confetti from "@/components/Confetti";
import MonthCalendar from "@/components/MonthCalendar";
import {useEffect, useState} from "react";
import {getCookie} from "@/lib/cookies";
import {getGuests, Guest} from "@/lib/supabaseRepo";
import {USER_COOKIE} from "@/constants/users";

export default function Home() {
    const [currentGuest, setCurrentGuest] = useState<Guest | null>(null);
    const [loadingGuest, setLoadingGuest] = useState<boolean>(true);

    useEffect(() => {
        let ignore = false;

        async function load() {
            try {
                const userId = getCookie(USER_COOKIE);
                if (!userId) return; // no cookie yet; UserGate will prompt
                const list = await getGuests();
                if (ignore) return;
                const user = list.find((g) => String(g.id ?? "") === String(userId));
                if (user) setCurrentGuest(user);
            } catch (e) {
                console.error("Failed to resolve current guest", e);
            } finally {
                if (!ignore) setLoadingGuest(false);
            }
        }

        load();
        return () => {
            ignore = true;
        };
    }, []);

    return (
        <div className="min-h-screen p-6">
            <Confetti/>
            <Nav/>
            <main className="max-w-3xl mx-auto mt-8 space-y-6">
                <section className="text-center space-y-3">
                    <h1 className="text-5xl sm:text-4xl font-extrabold">Officiel inbjudan 🎺🎉</h1>
                    <p className="text-base opacity-80 font-bold text-2xl sm:text-xl">
                        Välkommen till den officiella kräftskiva
                        inbjudan{loadingGuest ? " …" : currentGuest ? `, ${currentGuest.display_name}!` : "!"}
                    </p>

                    <p className="text-m opacity-60">Tips: Välj datum nedan för att RSVPa</p>
                </section>
                <MonthCalendar/>
            </main>
        </div>
    );
}
