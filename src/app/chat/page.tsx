"use client";
import {useEffect, useMemo, useRef, useState} from "react";
import Nav from "@/components/Nav";
import {getCookie} from "@/lib/cookies";
import {USER_COOKIE} from "@/constants/users";
import {
    addMessage,
    getGuests,
    getMessages,
    Guest,
    Message,
    deleteMessage as deleteMessageApi
} from "@/lib/supabaseRepo";

export default function ChatPage() {
    const [userId, setUserId] = useState<string>("");
    const [guests, setGuests] = useState<Guest[]>([]);
    const [messages, setMessages] = useState<Message[]>([]);
    const [text, setText] = useState("");
    const [busy, setBusy] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<string | number | null>(null);
    const endRef = useRef<HTMLDivElement | null>(null);

    const nameById = useMemo(() => {
        const map = new Map<string, string>();
        for (const g of guests) map.set(String(g.id ?? ""), g.display_name || "Okänd");
        return map;
    }, [guests]);

    useEffect(() => {
        let ignore = false;
        (async () => {
            try {
                const id = getCookie(USER_COOKIE) || "";
                setUserId(id);
                const [g, ms] = await Promise.all([
                    getGuests().catch(() => []),
                    getMessages().catch(() => []),
                ]);
                if (ignore) return;
                // sort by created_at ascending (fallback to id string if needed)
                const sorted = [...ms].sort((a, b) => {
                    const ta = a.time_sent ? new Date(a.time_sent).getTime() : (a.created_at ? new Date(a.created_at).getTime() : 0);
                    const tb = b.time_sent ? new Date(b.time_sent).getTime() : (b.created_at ? new Date(b.created_at).getTime() : 0);
                    return ta - tb;
                });
                setGuests(g);
                setMessages(sorted);
            } catch (e) {
                console.error(e);
                if (!ignore) setError("Kunde inte ladda chatten");
            } finally {
                if (!ignore) setLoading(false);
            }
        })();
        return () => {
            ignore = true;
        };
    }, []);

    useEffect(() => {
        endRef.current?.scrollIntoView({behavior: "smooth"});
    }, [messages]);

    const currentName = userId ? (nameById.get(String(userId)) || "Jag") : "";

    async function send() {
        const content = text.trim();
        if (!content) return;
        if (!userId) {
            alert("Välj användare först");
            return;
        }
        try {
            setBusy(true);
            const saved = await addMessage({
                sender: userId,
                message_body: content,
                time_sent: new Date().toISOString()
            });
            setMessages(prev => [...prev, saved]);
            setText("");
        } catch (e) {
            console.error("Failed to send message", e);
            setError("Kunde inte skicka meddelande");
        } finally {
            setBusy(false);
        }
    }

    async function onDeleteMessage(m: Message) {
        const mine = String(m.sender || "") === String(userId);
        if (!mine || !m.id) return;
        const confirmDelete = window.confirm("Radera detta meddelande?");
        if (!confirmDelete) return;
        try {
            setDeletingId(m.id);
            await deleteMessageApi(m.id);
            setMessages(prev => prev.filter(x => String(x.id) !== String(m.id)));
        } catch (e) {
            console.error("Failed to delete message", e);
            setError("Kunde inte radera meddelande");
        } finally {
            setDeletingId(null);
        }
    }

    return (
        <div className="min-h-screen p-6">
            <Nav/>
            <main className="max-w-3xl mx-auto mt-8 space-y-4">
                <h1 className="text-2xl font-bold">Gruppchatt</h1>
                {error && <p className="text-sm text-red-600">{error}</p>}

                <div className="rounded-xl border p-4 h-[50vh] overflow-y-auto bg-black/5">
                    {loading && <p className="text-sm opacity-70">Laddar…</p>}
                    {!loading && messages.length === 0 && (
                        <p className="text-sm opacity-70">Inga meddelanden än. Skriv något!</p>
                    )}
                    <ul className="space-y-3">
                        {messages.map((m) => {
                            const mine = String(m.sender || "") === String(userId);
                            const who = nameById.get(String(m.sender || "")) || "Okänd";
                            const t = m.time_sent ? new Date(m.time_sent) : (m.created_at ? new Date(m.created_at) : null);
                            const timeStr = t ? t.toLocaleString() : "";
                            return (
                                <li key={String(m.id)} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                                    <div className={`max-w-[80%] ${mine ? "text-right" : "text-left"}`}>
                                        <div className="text-xs opacity-60 mb-1 flex items-center gap-2">
                                            <span className="font-medium">{who}</span> • {timeStr}
                                            {mine && (
                                                <button
                                                    className="ml-2 text-[11px] px-2 py-0.5 rounded border opacity-70 hover:opacity-100 disabled:opacity-40"
                                                    onClick={() => onDeleteMessage(m)}
                                                    disabled={String(deletingId || "") === String(m.id)}
                                                    title="Radera meddelande"
                                                    aria-label="Radera meddelande"
                                                >
                                                    🗑️
                                                </button>
                                            )}
                                        </div>
                                        <div
                                            className={`px-3 py-2 rounded-2xl whitespace-pre-wrap ${mine ? "bg-blue-200" : "bg-gray-200"}`}>
                                            {m.message_body}
                                        </div>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                    <div ref={endRef}/>
                </div>

                <div className="flex gap-2">
                    <input
                        type="text"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder={userId ? `Meddelande som ${currentName}…` : "Välj användare först…"}
                        className="flex-1 rounded-lg border px-3 py-2 bg-white/70"
                        onKeyDown={(e) => {
                            if (e.key === "Enter") send();
                        }}
                        disabled={!userId || busy}
                    />
                    <button onClick={send} disabled={!userId || busy}
                            className="rounded-full border px-4 py-2 text-sm disabled:opacity-50">Skicka
                    </button>
                </div>
            </main>
        </div>
    );
}
