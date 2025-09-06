"use client";
import {useEffect, useMemo, useState} from "react";

export type Weekend = { startYmd: string; endYmd: string };

export type MonthCalendarProps = {
    initialDate?: Date; // initial month to show
    dayCellHeight?: number; // px height for each day cell; default ~112
    availableWeekends?: Weekend[]; // two weekends to highlight (YYYY-MM-DD ranges, inclusive)
    onWeekendDecision?: (weekend: Weekend, decision: "can" | "cannot") => void; // selection callback
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

function addDays(ymd: string, days: number): string {
    const d = new Date(ymd);
    d.setDate(d.getDate() + days);
    return formatYmd(d);
}

function enumerateDates(startYmd: string, endYmd: string): string[] {
    const res: string[] = [];
    let cur = startYmd;
    while (cur <= endYmd) {
        res.push(cur);
        cur = addDays(cur, 1);
    }
    return res;
}

export default function MonthCalendar({
                                          initialDate,
                                          dayCellHeight,
                                          availableWeekends,
                                          onWeekendDecision,
                                          onMonthChange
                                      }: MonthCalendarProps) {
    const [cursor, setCursor] = useState<Date>(initialDate ?? new Date());
    const [selectedWeekend, setSelectedWeekend] = useState<Weekend | null>(null);

    const monthMeta = useMemo(() => {
        const first = startOfMonth(cursor);
        const last = endOfMonth(cursor);
        // compute grid (starting Monday)
        const startDay = (first.getDay() + 6) % 7; // 0=Mon ... 6=Sun
        const daysInMonth = last.getDate();
        const cells: { date: string; inMonth: boolean }[] = [];

        // Leading blanks: previous month
        for (let i = 0; i < startDay; i++) {
            const d = new Date(first);
            d.setDate(d.getDate() - (startDay - i));
            cells.push({date: formatYmd(d), inMonth: false});
        }
        // Current month days
        for (let day = 1; day <= daysInMonth; day++) {
            const d = new Date(cursor.getFullYear(), cursor.getMonth(), day);
            cells.push({date: formatYmd(d), inMonth: true});
        }
        // Trailing blanks to complete weeks
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

    const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

    // Prepare highlighting sets for available weekends
    const weekendDates = useMemo(() => {
        const wk = (availableWeekends && availableWeekends.length > 0)
            ? availableWeekends
            : defaultTwoWeekends(cursor);
        const highlight = new Set<string>();
        for (const w of wk) enumerateDates(w.startYmd, w.endYmd).forEach((d) => highlight.add(d));
        return {weekends: wk, highlight};
    }, [availableWeekends, cursor]);

    function weekendForDate(dateYmd: string): Weekend | null {
        for (const w of weekendDates.weekends) {
            if (dateYmd >= w.startYmd && dateYmd <= w.endYmd) return w;
        }
        return null;
    }

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <button className="border rounded px-2 py-1"
                            onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}>{"<"}</button>
                    <div className="font-semibold">
                        {cursor.toLocaleString(undefined, {month: "long", year: "numeric"})}
                    </div>
                    <button className="border rounded px-2 py-1"
                            onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}>{">"}</button>
                </div>
            </div>

            <div className="grid grid-cols-7 gap-1 select-none">
                {daysOfWeek.map((d) => (
                    <div key={d} className="text-center text-xs font-semibold opacity-70 py-1">{d}</div>
                ))}
                {monthMeta.weeks.flat().map(({date, inMonth}) => {
                    const inHighlightedWeekend = weekendDates.highlight.has(date);
                    const isSelected = selectedWeekend && date >= selectedWeekend.startYmd && date <= selectedWeekend.endYmd;
                    return (
                        <div
                            key={date}
                            role="button"
                            tabIndex={0}
                            className={`border rounded p-1 text-left overflow-hidden ${
                                isSelected ? "bg-blue-500 text-white" : inHighlightedWeekend ? "bg-blue-100 hover:bg-blue-200" : inMonth ? "bg-base-300 hover:bg-base-100" : "bg-gray-50 opacity-70"
                            }`}
                            onClick={() => {
                                const w = weekendForDate(date);
                                if (w) setSelectedWeekend(w);
                            }}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    const w = weekendForDate(date);
                                    if (w) setSelectedWeekend(w);
                                }
                            }}
                            title={date}
                            style={{height: (dayCellHeight ?? 112)}}
                        >
                            <div className="flex items-center justify-between">
                                <div className="text-xs font-semibold">{new Date(date).getDate()}</div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <DecisionPanel
                selectedWeekend={selectedWeekend}
                onDecision={(decision) => {
                    if (selectedWeekend) onWeekendDecision?.(selectedWeekend, decision);
                }}
            />
        </div>
    );
}

function defaultTwoWeekends(cursor: Date): Weekend[] {
    // Find the first two Saturday-Sunday pairs within the cursor month
    const first = startOfMonth(cursor);
    const last = endOfMonth(cursor);
    const weekends: Weekend[] = [];

    // iterate days to find Saturdays
    const d = new Date(first);
    while (d <= last && weekends.length < 2) {
        if (d.getDay() === 6) { // Saturday
            const sat = new Date(d);
            const sun = new Date(d);
            sun.setDate(sun.getDate() + 1);
            weekends.push({startYmd: formatYmd(sat), endYmd: formatYmd(sun)});
        }
        d.setDate(d.getDate() + 1);
    }
    return weekends;
}

function DecisionPanel({selectedWeekend, onDecision}: {
    selectedWeekend: Weekend | null;
    onDecision: (decision: "can" | "cannot") => void;
}) {
    return (
        <div className="border rounded p-3">
            <div className="font-semibold mb-2">Weekend selection</div>
            {selectedWeekend ? (
                <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div>
                        Selected: {new Date(selectedWeekend.startYmd).toLocaleDateString()} – {new Date(selectedWeekend.endYmd).toLocaleDateString()}
                    </div>
                    <div className="flex gap-2">
                        <button className="btn btn-primary" onClick={() => onDecision("can")}>I can come</button>
                        <button className="btn" onClick={() => onDecision("cannot")}>I can&apos;t come</button>
                    </div>
                </div>
            ) : (
                <div className="text-sm opacity-70">Select one of the highlighted weekends above.</div>
            )}
        </div>
    );
}
