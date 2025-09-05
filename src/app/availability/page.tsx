"use client";
import { useEffect, useMemo, useState } from "react";
import Nav from "@/components/Nav";
import { getCookie } from "@/lib/cookies";
import { USER_COOKIE } from "@/constants/users";

const STORAGE_KEY = "invite.availability";

// Define two weekends (example): next two weekends from now or hard-coded.
// To keep it simple and stable, we'll hard-code two weekends.
const WEEKENDS: { label: string; dates: string[] }[] = [
  { label: "Weekend 1", dates: ["Fri 20:00", "Sat Afternoon", "Sun Brunch"] },
  { label: "Weekend 2", dates: ["Fri 20:00", "Sat Afternoon", "Sun Brunch"] },
];

export default function AvailabilityPage() {
  const [user, setUser] = useState<string>("");
  const [data, setData] = useState<Record<string, boolean>>({});
  const flatKeys = useMemo(() => {
    const keys: string[] = [];
    WEEKENDS.forEach((w, wi) => w.dates.forEach((d, di) => keys.push(`${wi}-${di}`)));
    return keys;
  }, []);

  useEffect(() => {
    try {
      const u = getCookie(USER_COOKIE) || "";
      if (u) setUser(u);
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setData(JSON.parse(raw));
    } catch {}
  }, []);

  const toggle = (key: string) => {
    setData((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const save = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {}
  };

  return (
    <div className="min-h-screen p-6">
      <Nav />
      <main className="max-w-3xl mx-auto mt-8 space-y-6">
        <h1 className="text-2xl font-bold">Your availability</h1>
        {!user && (
          <p className="text-sm text-red-600">No user selected. Please pick your name first on the Select User page.</p>
        )}

        <div className="space-y-4">
          {WEEKENDS.map((w, wi) => (
            <div key={wi} className="rounded-xl border p-4">
              <h2 className="font-semibold mb-2">{w.label}</h2>
              <div className="grid sm:grid-cols-3 gap-2">
                {w.dates.map((d, di) => {
                  const key = `${wi}-${di}`;
                  const checked = !!data[key];
                  return (
                    <label key={key} className={`flex items-center gap-2 rounded-lg border p-2 ${checked ? "bg-black/5 dark:bg-white/10" : ""}`}>
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggle(key)}
                      />
                      <span>{d}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-2 items-center">
          <button onClick={save} className="rounded-full border px-4 py-2 text-sm">Save choices</button>
          <span className="text-xs opacity-70">Stored locally in your browser.</span>
        </div>
      </main>
    </div>
  );
}
