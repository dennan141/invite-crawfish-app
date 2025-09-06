"use client";
import {useEffect, useMemo, useState} from "react";
import {DateOption, Guest, Rsvp, RsvpOptions, getGuestAvatarUrl, getPartySettings, PartySetting} from "@/lib/supabaseRepo";

export type SelectedDateAndInfoProps = {
  option: DateOption;
  guests: Guest[];
  rsvps: Rsvp[]; // RSVPs for this option only (pre-filtered by parent)
  onClose: () => void;
  onYes: () => void;
  onNo: () => void;
};

function toYmd(val: unknown): string | null {
  if (!val) return null;
  if (val instanceof Date) return `${val.getFullYear()}-${String(val.getMonth() + 1).padStart(2, "0")}-${String(val.getDate()).padStart(2, "0")}`;
  const s = String(val);
  const m = s.match(/^(\d{4}-\d{2}-\d{2})/);
  if (m) return m[1];
  const d = new Date(s);
  if (!isNaN(d.getTime())) {
    const y = d.getFullYear();
    const mo = String(d.getMonth() + 1).padStart(2, "0");
    const da = String(d.getDate()).padStart(2, "0");
    return `${y}-${mo}-${da}`;
  }
  return null;
}

function getStart(o: DateOption): string | null {
  return (toYmd((o as DateOption).start_at ?? o.start_date));
}

function getEnd(o: DateOption): string | null {
  return (toYmd((o as DateOption).end_at ?? o.end_date));
}

export default function SelectedDateAndInfo({ option, guests, rsvps, onClose, onYes, onNo }: SelectedDateAndInfoProps) {
  const [settings, setSettings] = useState<PartySetting | null>(null);
  const [loadingSettings, setLoadingSettings] = useState<boolean>(true);

  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        setLoadingSettings(true);
        const list = await getPartySettings();
        if (!ignore) setSettings(list?.[0] || null);
      } catch (e) {
        console.warn("Failed to load party settings", e);
        if (!ignore) setSettings(null);
      } finally {
        if (!ignore) setLoadingSettings(false);
      }
    })();
    return () => { ignore = true; };
  }, []);

  const start = getStart(option) || "";
  const end = getEnd(option) || start;

  const perGuest = useMemo(() => {
    // Map guest id => final status (YES beats NO)
    const map = new Map<string, RsvpOptions.YES | RsvpOptions.NO>();
    for (const r of rsvps) {
      const gid = String(r.guest_id || "");
      if (!gid || !r.status) continue;
      if (r.status === RsvpOptions.YES) {
        map.set(gid, RsvpOptions.YES);
      } else if (!map.has(gid) && r.status === RsvpOptions.NO) {
        map.set(gid, RsvpOptions.NO);
      }
    }
    return map;
  }, [rsvps]);

  const items = useMemo(() => {
    const res: { guest: Guest; status: RsvpOptions.YES | RsvpOptions.NO }[] = [];
    for (const [gid, status] of perGuest.entries()) {
      const g = guests.find(x => String(x.id || "") === gid);
      if (g) res.push({ guest: g, status });
    }
    // Sort YES first then by name
    res.sort((a, b) => {
      if (a.status !== b.status) return a.status === RsvpOptions.YES ? -1 : 1;
      return (a.guest.display_name || "").localeCompare(b.guest.display_name || "");
    });
    return res;
  }, [perGuest, guests]);

  return (
    <>
      <div className="fixed inset-0 bg-black/60 z-50" onClick={onClose} aria-hidden="true" />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <section className="w-full max-w-3xl bg-[#0f1724]/90 text-white rounded-2xl shadow-2xl border border-yellow-300 p-6 sm:p-10 relative">
          <button
            className="absolute top-3 right-3 rounded-full border border-red-400 text-red-300 hover:bg-white/5 px-3 py-1 text-sm"
            onClick={onClose}
            aria-label="Stäng"
          >
            ✕
          </button>

          <header className="mb-6 text-center space-y-2">
            <h2 className="text-3xl sm:text-4xl font-extrabold">Inbjudan</h2>
            <div className="text-xl sm:text-2xl font-bold">
              {option.label || "Valt datum"}
            </div>
            {start && (
              <div className="text-base sm:text-lg opacity-80">
                {start === end ? `Datum: ${start}` : `Datum: ${start} – ${end}`}
              </div>
            )}
          </header>

          <div className="space-y-6">
            {(() => {
              const t = settings?.title?.trim();
              const addr = settings?.address_text?.trim();
              const mapUrl = settings?.google_place_url?.trim();
              const hasInfo = !!(t || addr || mapUrl);
              if (!hasInfo) return null;
              return (
                <div className="rounded-xl bg-yellow-50 border p-4">
                  <div className="text-lg font-semibold mb-1">Plats & info</div>
                  <div className="space-y-2">
                    {t && <div className="font-bold">{t}</div>}
                    {addr && <div className="whitespace-pre-wrap">{addr}</div>}
                    {mapUrl && (
                      <a className="text-blue-700 underline" href={mapUrl} target="_blank" rel="noreferrer">Öppna i Google Maps</a>
                    )}
                  </div>
                </div>
              );
            })()}

            <div>
              <div className="text-lg font-semibold mb-2">Gästers svar</div>
              {items.length === 0 && (
                <div className="text-sm opacity-70">Inga svar ännu.</div>
              )}
              {items.length > 0 && (
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {items.map(({guest, status}) => {
                    const url = getGuestAvatarUrl(guest);
                    const borderClass = status === RsvpOptions.YES ? "border-green-600" : "border-red-600";
                    const textClass = status === RsvpOptions.YES ? "text-green-700" : "text-red-700";
                    return (
                      <li key={String(guest.id)} className={`flex items-center gap-3 rounded-xl border p-2 ${borderClass}`}>
                        {url ? (
                          <img src={url} alt="avatar" className="w-8 h-8 rounded-full object-cover" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm">
                            {(guest.display_name || "?").charAt(0)}
                          </div>
                        )}
                        <div className="flex-1">
                          <div className="font-medium">{guest.display_name || "Gäst"}</div>
                          <div className={`text-xs ${textClass}`}>{status === RsvpOptions.YES ? "Kan komma" : "Kan inte komma"}</div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button className="w-full py-3 rounded-xl bg-yellow-500 hover:bg-yellow-600 text-black font-bold shadow" onClick={onYes}>Jag kan</button>
              <button className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold shadow" onClick={onNo}>Jag kan inte</button>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
