"use client";
import {useEffect, useMemo, useState} from "react";
import {DateOption, getDateOptions, getRsvps, Rsvp, RsvpOptions, addRsvp, updateRsvp} from "@/lib/supabaseRepo";
import {getCookie} from "@/lib/cookies";
import {USER_COOKIE} from "@/constants/users";

export type MonthCalendarProps = {
    initialDate?: Date; // if not provided, set to month of the first date_option
    dayCellHeight?: number; // px height for each day cell; default ~112
    onMonthChange?: (year: number, monthIndex0: number) => void; // notify parent of month change
};

// Helpers
function formatYmd(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
}

function startOfMonth(d: Date): Date {
    return new Date(d.getFullYear(), d.getMonth(), 1);
}

function endOfMonth(d: Date): Date {
    return new Date(d.getFullYear(), d.getMonth() + 1, 0);
}

// Extract YYYY-MM-DD safely from a Supabase timestamptz/string/Date without timezone shifts
function ymdFromVal(val: unknown): string | null {
    if (!val) return null;
    if (val instanceof Date) return formatYmd(val);
    const s = String(val);
    const m = s.match(/^(\d{4}-\d{2}-\d{2})/);
    if (m) return m[1];
    const d = new Date(s);
    if (!isNaN(d.getTime())) return formatYmd(d);
    return null;
}

// Support both schemas: start_at/end_at and start_date/end_date
function getStartRaw(o: DateOption): unknown {
    return (o as DateOption).start_at ?? o.start_date ?? null;
}

function getEndRaw(o: DateOption): unknown {
    return (o as DateOption).end_at ?? o.end_date ?? null;
}

function addDaysYmd(ymd: string, delta: number): string {
    const d = new Date(ymd);
    d.setDate(d.getDate() + delta);
    return formatYmd(d);
}

function enumerateRangeInclusive(startYmd: string, endYmd: string): string[] {
    const res: string[] = [];
    let cur = startYmd;
    // guard if end < start
    if (endYmd < startYmd) return [startYmd];
    while (cur <= endYmd) {
        res.push(cur);
        cur = addDaysYmd(cur, 1);
    }
    return res;
}

export default function MonthCalendar({initialDate, dayCellHeight, onMonthChange}: MonthCalendarProps) {
    const [cursor, setCursor] = useState<Date>(initialDate ?? new Date());
    const [dateOptions, setDateOptions] = useState<DateOption[]>([]);
    const [optionsByYmd, setOptionsByYmd] = useState<Record<string, DateOption[]>>({});
    const [selectedOption, setSelectedOption] = useState<DateOption | null>(null);
    const [selectedYmd, setSelectedYmd] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [myRsvps, setMyRsvps] = useState<Record<string, Rsvp>>({}); // key: date_option_id -> RSVP

    // Build month grid
    const monthMeta = useMemo(() => {
        const first = startOfMonth(cursor);
        const last = endOfMonth(cursor);
        const startDay = (first.getDay() + 6) % 7; // 0=Mon ... 6=Sun (Mon as first)
        const daysInMonth = last.getDate();
        const cells: { date: string; inMonth: boolean }[] = [];

        for (let i = 0; i < startDay; i++) {
            const d = new Date(first);
            d.setDate(d.getDate() - (startDay - i));
            cells.push({date: formatYmd(d), inMonth: false});
        }
        for (let day = 1; day <= daysInMonth; day++) {
            const d = new Date(cursor.getFullYear(), cursor.getMonth(), day);
            cells.push({date: formatYmd(d), inMonth: true});
        }
        while (cells.length % 7 !== 0) {
            const lastCell = cells[cells.length - 1];
            const d = new Date(lastCell.date);
            d.setDate(d.getDate() + 1);
            cells.push({date: formatYmd(d), inMonth: false});
        }
        const weeks: { date: string; inMonth: boolean }[][] = [];
        for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
        return {first, last, weeks};
    }, [cursor]);

    // Notify parent when visible month changes
    useEffect(() => {
        onMonthChange?.(cursor.getFullYear(), cursor.getMonth());
    }, [cursor, onMonthChange]);

    // Fetch date options and compute day highlights for start..end inclusive; also load my RSVPs if cookie is present
    useEffect(() => {
        let ignore = false;

        async function load() {
            setLoading(true);
            try {
                const options = await getDateOptions();
                if (ignore) return;
                console.log("Loaded date options", options);

                // Build day -> options map, covering start..end inclusively
                const byYmd: Record<string, DateOption[]> = {};
                for (const o of options) {
                    const start = ymdFromVal(getStartRaw(o));
                    const end = ymdFromVal(getEndRaw(o)) || start;
                    if (!start) continue;
                    const endYmd = end || start;
                    const days = enumerateRangeInclusive(start, endYmd);
                    for (const d of days) (byYmd[d] ||= []).push(o);
                }

                setDateOptions(options);
                setOptionsByYmd(byYmd);

                // Try to load my RSVPs if cookie contains guest id
                try {
                    const guestId = getCookie(USER_COOKIE);
                    if (guestId) {
                        const all = await getRsvps();
                        if (!ignore) {
                            const mine: Record<string, Rsvp> = {};
                            all.filter(r => String(r.guest_id || "") === guestId)
                                .forEach(r => {
                                    const key = String(r.date_option_id || "");
                                    if (key) mine[key] = r as Rsvp;
                                });
                            setMyRsvps(mine);
                        }
                    } else {
                        setMyRsvps({});
                    }
                } catch (err) {
                    console.warn("Could not load RSVPs; defaulting to blue highlights", err);
                    setMyRsvps({});
                }

                // Initial month = month of first option start
                if (options.length > 0 && !initialDate) {
                    const firstStart = ymdFromVal(getStartRaw(options[0]));
                    if (firstStart) {
                        const [y, m] = firstStart.split("-");
                        if (y && m) setCursor(new Date(Number(y), Number(m) - 1, 1));
                    }
                }
            } catch (e) {
                console.error("Failed to load date options", e);
            } finally {
                if (!ignore) setLoading(false);
            }
        }

        load();
        return () => {
            ignore = true;
        };
    }, [initialDate]);

    const daysOfWeek = ["Mon", "Tis", "Ons", "Tors", "Fre", "Lör", "Sön"];

    // Bare-bones color decision function (extracted for future DB-driven logic)
    // TODO: Expand with database-aware color rules (e.g., RSVP summaries per date)
    function decideHighlightClass(optsForDay: DateOption[], inMonth: boolean, isSelected: boolean): string {
        // Selected day override
        if (isSelected) return "bg-blue-500 text-white";
        const hasOption = optsForDay.length > 0;
        if (!hasOption) return inMonth ? "bg-white/70 hover:bg-white" : "bg-gray-50 opacity-70";
        // RSVP-driven colors: any YES -> green, else if any NO -> red, else default blue
        const anyYes = optsForDay.some(o => myRsvps[String(o.id || "")]?.status === RsvpOptions.YES);
        const anyNo = optsForDay.some(o => myRsvps[String(o.id || "")]?.status === RsvpOptions.NO);
        if (anyYes) return "bg-green-200 hover:bg-green-300";
        if (anyNo) return "bg-red-200 hover:bg-red-300";
        return "bg-blue-100 hover:bg-blue-200";
    }

    // Wrapper used by the grid; delegates to decideHighlightClass
    function getDayClasses(date: string, inMonth: boolean, isSelected: boolean): string {
        const optsForDay = optionsByYmd[date] || [];
        return decideHighlightClass(optsForDay, inMonth, isSelected);
    }

    // RSVP actions: write or update RSVP in Supabase based on cookie guest id
    const [rsvpBusy, setRsvpBusy] = useState<boolean>(false);

    async function upsertRsvp(option: DateOption, status: RsvpOptions.YES | RsvpOptions.NO) {
        if (!option?.id) return;
        const guestId = getCookie(USER_COOKIE);
        if (!guestId) {
            console.warn("No user cookie found; cannot send RSVP");
            return;
        }
        try {
            setRsvpBusy(true);
            const key = String(option.id);
            const existing = myRsvps[key];
            let saved: Rsvp;
            if (existing?.id) {
                saved = await updateRsvp(existing.id, { status });
            } else {
                saved = await addRsvp({ guest_id: guestId, date_option_id: option.id, status });
            }
            setMyRsvps((prev) => ({ ...prev, [key]: saved }));
        } catch (e) {
            console.error("Failed to upsert RSVP", e);
        } finally {
            setRsvpBusy(false);
        }
    }

    function sendRsvpYes(option: DateOption) {
        void upsertRsvp(option, RsvpOptions.YES);
    }

    function sendRsvpNo(option: DateOption) {
        void upsertRsvp(option, RsvpOptions.NO);
    }

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <button
                        className="border rounded px-2 py-1"
                        onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}
                    >
                        {"<"}
                    </button>
                    <div className="font-semibold">
                        {cursor.toLocaleString(undefined, {month: "long", year: "numeric"})}
                    </div>
                    <button
                        className="border rounded px-2 py-1"
                        onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}
                    >
                        {">"}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-7 gap-1 select-none">
                {daysOfWeek.map((d) => (
                    <div key={d} className="text-center text-xs font-semibold opacity-70 py-1">
                        {d}
                    </div>
                ))}
                {monthMeta.weeks.flat().map(({date, inMonth}) => {
                    const opts = optionsByYmd[date] || [];
                    const isSelected = !!(selectedOption && opts.some((o) => o.id === selectedOption.id));
                    return (
                        <div
                            key={date}
                            role="button"
                            tabIndex={0}
                            className={`border rounded text-left ${getDayClasses(date, inMonth, isSelected)} flex items-center justify-center p-0.5 sm:p-1 aspect-square md:aspect-auto md:overflow-hidden md:block md:h-[112px]`}
                            onClick={() => {
                                if (opts.length > 0) {
                                    setSelectedOption(opts[0]);
                                    setSelectedYmd(date);
                                }
                            }}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") {
                                    e.preventDefault();
                                    if (opts.length > 0) {
                                        setSelectedOption(opts[0]);
                                        setSelectedYmd(date);
                                    }
                                }
                            }}
                            title={date}
                        >
                            <div className="text-xs font-semibold md:flex md:items-center md:justify-between md:w-full md:h-full">
                                <span>{new Date(date).getDate()}</span>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Sidebar overlay and panel when a date option is selected */}
            {selectedOption && (
                <>
                    <div
                        className="fixed inset-0 bg-black/40 z-40"
                        onClick={() => setSelectedOption(null)}
                        aria-hidden="true"
                    />
                    <div className="fixed inset-y-0 right-0 z-50 p-4 pointer-events-none">
                        <aside
                            className="pointer-events-auto sticky top-2 max-h-[calc(100dvh-1rem)] w-80 sm:w-96 bg-white text-black shadow-2xl p-4 flex flex-col overflow-y-auto rounded-lg border">
                            <div className="flex items-center justify-between mb-4">
                                <div className="text-lg font-bold truncate">{selectedOption.label || "Vald helg"}</div>
                                <button
                                    className="rounded-full border px-2 py-1 text-sm"
                                    onClick={() => setSelectedOption(null)}
                                    aria-label="Stäng"
                                >
                                    ✕
                                </button>
                            </div>

                            {/* Optional: show the date range for context */}
                            {(() => {
                                const start = ymdFromVal(getStartRaw(selectedOption)) || "";
                                const end = ymdFromVal(getEndRaw(selectedOption)) || start;
                                if (!start) return null;
                                return (
                                    <div className="text-sm opacity-80 mb-2">
                                        {start === end ? `Datum: ${start}` : `Datum: ${start} – ${end}`}
                                    </div>
                                );
                            })()}

                            <div className="mt-2 grid grid-cols-1 gap-3">
                                <button
                                    className="w-full py-3 rounded-xl bg-green-600 text-white font-bold disabled:opacity-60"
                                    onClick={() => sendRsvpYes(selectedOption)}
                                    disabled={rsvpBusy}
                                >
                                    Jag kan
                                </button>
                                <button
                                    className="w-full py-3 rounded-xl bg-red-600 text-white font-bold disabled:opacity-60"
                                    onClick={() => sendRsvpNo(selectedOption)}
                                    disabled={rsvpBusy}
                                >
                                    Jag kan inte
                                </button>
                            </div>
                        </aside>
                    </div>
                </>
            )}
        </div>
    );
}
