"use client";
import { useEffect, useRef, useState } from "react";
import Nav from "@/components/Nav";
import { getCookie } from "@/lib/cookies";
import { USER_COOKIE } from "@/constants/users";

const MESSAGES_KEY = "invite.chatMessages";

type Message = {
  id: string;
  user: string;
  text: string;
  time: number;
};

export default function ChatPage() {
  const [user, setUser] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    try {
      const u = getCookie(USER_COOKIE) || "";
      setUser(u);
      const raw = localStorage.getItem(MESSAGES_KEY);
      if (raw) setMessages(JSON.parse(raw));
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(MESSAGES_KEY, JSON.stringify(messages));
    } catch {}
  }, [messages]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = () => {
    if (!text.trim()) return;
    const msg: Message = {
      id: Math.random().toString(36).slice(2),
      user: user || "Anon",
      text: text.trim(),
      time: Date.now(),
    };
    setMessages((prev) => [...prev, msg]);
    setText("");
  };

  const clear = () => setMessages([]);

  return (
    <div className="min-h-screen p-6">
      <Nav />
      <main className="max-w-3xl mx-auto mt-8 space-y-4">
        <h1 className="text-2xl font-bold">Group Chat</h1>
        {!user && <p className="text-sm text-red-600">No user selected. Messages will appear as &quot;Anon&quot;. Go to Select User to set your name.</p>}

        <div className="rounded-xl border p-4 h-[50vh] overflow-y-auto bg-black/5 dark:bg-white/5">
          {messages.length === 0 && (
            <p className="text-sm opacity-70">No messages yet. Be the first to ask something!</p>
          )}
          <ul className="space-y-2">
            {messages.map((m) => (
              <li key={m.id} className="">
                <div className="text-xs opacity-60">
                  <span className="font-medium">{m.user}</span> • {new Date(m.time).toLocaleString()}
                </div>
                <div className="text-sm whitespace-pre-wrap">{m.text}</div>
              </li>
            ))}
          </ul>
          <div ref={endRef} />
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 rounded-lg border px-3 py-2 bg-transparent"
            onKeyDown={(e) => {
              if (e.key === "Enter") send();
            }}
          />
          <button onClick={send} className="rounded-full border px-4 py-2 text-sm">Send</button>
          <button onClick={clear} className="rounded-full border px-4 py-2 text-sm">Clear</button>
        </div>
        <p className="text-xs opacity-70">Local only for now. This page is ready for Supabase integration.</p>
      </main>
    </div>
  );
}
