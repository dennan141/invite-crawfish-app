"use client";
import {useEffect, useState} from "react";
import {USER_COOKIE} from "@/constants/users";
import {getCookie, setCookie} from "@/lib/cookies";
import {getGuests, Guest} from "@/lib/supabaseRepo";

export default function UserGate({children}: { children: React.ReactNode }) {
    const [selectedId, setSelectedId] = useState<string>("");
    const [ready, setReady] = useState(false);
    const [cookiePresent, setCookiePresent] = useState<boolean>(false);
    const [guests, setGuests] = useState<Guest[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let ignore = false;

        async function load() {
            try {
                const existing = getCookie(USER_COOKIE);
                if (existing) {
                    setSelectedId(existing);
                    setCookiePresent(true);
                }
                setLoading(true);
                const list = await getGuests();
                if (ignore) return;
                setGuests(list);
            } catch (e) {
                console.error(e);
                setError("Failed to load guests");
            } finally {
                if (!ignore) {
                    setLoading(false);
                    setReady(true);
                }
            }
        }

        load();
        return () => {
            ignore = true;
        };
    }, []);

    const save = () => {
        if (!selectedId) return;
        playMusicFanfare();
        setCookie(USER_COOKIE, selectedId, 180);
        setCookiePresent(true);
    };

    function userHasSelected(selected: string) {
        if (!selected) return;
        playMusicMeme();
        setSelectedId(selected);
    }

    function playMusicFanfare() {
        const audio = new Audio('/fanfare.mp3');
        audio.play();
    }

    function playMusicMeme() {
        const audio = new Audio('/meme.m4a');
        audio.play();
    }

    const hasCookie = cookiePresent || !!getCookie(USER_COOKIE);

    // Render children when cookie exists
    if (ready && hasCookie) {
        return <>{children}</>;
    }

    // Block with modal until user is chosen and saved
    return (
        <div className="min-h-screen">
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
                <div
                    className="w-full max-w-md rounded-2xl bg-white text-black border p-6 space-y-4 shadow-xl">
                    <h2 className="text-xl font-bold">Who are you?</h2>
                    <p className="text-sm opacity-80">Please select your name to enter the invite.</p>
                    <div className="flex flex-col gap-2 max-h-64 overflow-y-auto">
                        {loading && <div className="text-sm opacity-70">Loading guests...</div>}
                        {error && <div className="text-sm text-red-600">{error}</div>}
                        {!loading && !error && guests.map((g) => (
                            <button
                                key={String(g.id)}
                                onClick={() => userHasSelected(String(g.id))}
                                className={`text-left rounded-lg border p-3 transition-colors ${
                                    selectedId === String(g.id)
                                        ? "bg-black text-white dark:bg-white dark:text-black border-transparent"
                                        : "hover:bg-black/5 dark:hover:bg-white/10"
                                }`}
                            >
                                {g.display_name || "Unnamed"}
                            </button>
                        ))}
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={save}
                            disabled={!selectedId}
                            className="rounded-full border px-4 py-2 text-sm disabled:opacity-50"
                        >
                            Save
                        </button>
                        {selectedId && (
                            <span className="text-sm opacity-80">
                                Selected: {guests.find((g) => String(g.id) === selectedId)?.display_name || selectedId}
                            </span>
                        )}
                    </div>
                    <p className="text-xs opacity-70">Your selection (guest id) is stored in a cookie on this
                        device.</p>
                </div>
            </div>
        </div>
    );
}
