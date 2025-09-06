import {createClient, SupabaseClient} from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL as string | undefined;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_API as string | undefined; // non-standard name used by the project

let _client: SupabaseClient | null = null;

function getClient(): SupabaseClient {
    if (_client) return _client;
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
        throw new Error(
            "Missing Supabase env vars. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_API in .env.local"
        );
    }
    _client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: {
            persistSession: true,
            autoRefreshToken: true,
        },
    });
    return _client;
}

export type UUID = string;

export enum RsvpOptions {
    YES = "yes",
    NO = "no",
    MAYBE = "maybe",
}

export interface DateOption {
    id?: number | UUID;
    label?: string; // e.g., "Fri 20:00", "Sat Afternoon"
    start_date?: string | null;
    end_date?: string | null;
    start_at?: string | null;
    end_at?: string | null;
    created_at?: string;

    [key: string]: unknown;
}

export interface Guest {
    id?: number | UUID;
    display_name?: string;
    is_host?: boolean;
    avatar_key?: string | null;
    admin_password?: string | null;
    created_at?: string;

    [key: string]: unknown;
}

export interface PartySetting {
    id?: number | UUID;
    title?: string;
    address_text?: string | null;
    latitude?: number | null;
    longitude?: number | null;
    google_place_url?: string | null;
    created_at?: string;
    updated_at?: string;

    [key: string]: unknown;
}


export interface Rsvp {
    id?: number | UUID;
    guest_id?: number | UUID | null;
    status?: RsvpOptions | null;
    note?: string | null;
    date_option_id?: number | UUID | null;
    updated_at?: string;

    [key: string]: unknown;
}

export interface Message {
    id?: number | UUID;
    sender?: UUID | null; // foreign key to guests.id (uuid)
    message_body?: string | null;
    time_sent?: string | null; // timestamp without time zone
    created_at?: string; // timestamptz default now()

    [key: string]: unknown;
}

// Helpers
function unwrap<T>(
    result: { data: T | null; error: unknown }
): T {
    if (result.error) throw result.error;
    return (result.data as T) ?? ([] as unknown as T);
}

// Public API: reads
export async function getDateOptions(): Promise<DateOption[]> {
    const supabase = getClient();
    const res = await supabase.from("date_options").select("*");
    return unwrap<DateOption[]>(res);
}

export async function getGuests(): Promise<Guest[]> {
    const supabase = getClient();
    const res = await supabase.from("guests").select("*");
    return unwrap<Guest[]>(res);
}

export async function getPartySettings(): Promise<PartySetting[]> {
    const supabase = getClient();
    const res = await supabase.from("party_settings").select("*");
    return unwrap<PartySetting[]>(res);
}

export async function getRsvps(): Promise<Rsvp[]> {
    const supabase = getClient();
    const res = await supabase.from("rsvps").select("*");
    return unwrap<Rsvp[]>(res);
}

export async function getMessages(): Promise<Message[]> {
    const supabase = getClient();
    const res = await supabase.from("messages").select("*");
    return unwrap<Message[]>(res);
}

// Public API: writes (rsvps, messages)
export async function addRsvp(payload: Partial<Rsvp>): Promise<Rsvp> {
    const supabase = getClient();
    const res = await supabase.from("rsvps").insert(payload).select("*").single();
    return unwrap<Rsvp>(res);
}

export async function updateRsvp(id: number | UUID, updates: Partial<Rsvp>): Promise<Rsvp> {
    const supabase = getClient();
    const res = await supabase.from("rsvps").update(updates).eq("id", id).select("*").single();
    return unwrap<Rsvp>(res);
}

export async function addMessage(payload: Partial<Message>): Promise<Message> {
    const supabase = getClient();
    const res = await supabase.from("messages").insert(payload).select("*").single();
    return unwrap<Message>(res);
}

export async function updateMessage(id: number | UUID, updates: Partial<Message>): Promise<Message> {
    const supabase = getClient();
    const res = await supabase.from("messages").update(updates).eq("id", id).select("*").single();
    return unwrap<Message>(res);
}

export async function deleteMessage(id: number | UUID): Promise<void> {
    const supabase = getClient();
    const res = await supabase.from("messages").delete().eq("id", id);
    if (res.error) throw res.error;
}

// Optionally expose the client for advanced use cases
export function getSupabaseClient(): SupabaseClient {
    return getClient();
}

// Storage helpers: avatars
export function getAvatarPublicUrl(key?: string | null): string | null {
    if (!key) return null;
    try {
        const supabase = getClient();
        const { data } = supabase.storage.from("avatars").getPublicUrl(key);
        return data?.publicUrl || null;
    } catch (e) {
        console.warn("Failed to build avatar public URL", e);
        return null;
    }
}

export function getGuestAvatarUrl(g?: Guest | null): string | null {
    if (!g?.avatar_key) return null;
    return getAvatarPublicUrl(g.avatar_key);
}

// Example usage (uncomment to test inside a React component):
// import { useEffect } from "react";
// useEffect(() => {
//   getGuests().then(console.log).catch(console.error);
// }, []);
