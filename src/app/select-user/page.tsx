"use client";
import { useEffect, useState } from "react";
import Nav from "@/components/Nav";
import { USERS, USER_COOKIE } from "@/constants/users";
import { getCookie, setCookie } from "@/lib/cookies";

export default function SelectUserPage() {
  const [selected, setSelected] = useState<string>("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const c = getCookie(USER_COOKIE);
    if (c) setSelected(c);
  }, []);

  const save = () => {
    if (!selected) return;
    setCookie(USER_COOKIE, selected, 180);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  return (
    <div className="min-h-screen p-6">
      <Nav />
      <main className="max-w-3xl mx-auto mt-8 space-y-6">
        <h1 className="text-2xl font-bold">Select who you are</h1>
        <p className="opacity-80 text-sm">Stored in a cookie on this device.</p>
        <div className="grid sm:grid-cols-2 gap-3">
          {USERS.map((u) => (
            <button
              key={u}
              onClick={() => setSelected(u)}
              className={`text-left rounded-xl border p-4 transition-colors ${
                selected === u
                  ? "bg-foreground text-background border-transparent"
                  : "hover:bg-black/5 dark:hover:bg-white/10"
              }`}
            >
              {u}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={save}
            disabled={!selected}
            className="rounded-full border px-4 py-2 text-sm disabled:opacity-50"
          >
            Save selection
          </button>
          {selected && <span className="text-sm opacity-80">Selected: {selected}</span>}
          {saved && <span className="text-sm text-green-600">Saved!</span>}
        </div>
      </main>
    </div>
  );
}
