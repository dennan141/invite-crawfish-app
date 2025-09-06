"use client";
import {Fragment, useEffect, useRef, useState} from "react";
import Nav from "@/components/Nav";
import {getPartySettings, PartySetting} from "@/lib/supabaseRepo";

export default function AdressPage() {
    const mapRef = useRef<HTMLDivElement | null>(null);
    const [party, setParty] = useState<PartySetting | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let ignore = false;
        (async () => {
            try {
                const settings = await getPartySettings().catch(() => []);
                if (ignore) return;
                setParty(settings?.[0] ?? null);
            } catch (e) {
                console.warn("Failed to load party settings", e);
                if (!ignore) setError("Kunde inte ladda adressen");
            }
        })();
        return () => {
            ignore = true;
        };
    }, []);


    return (
        <div className="min-h-screen p-6">
            <Nav/>

            <main className="max-w-5xl mx-auto mt-8 space-y-6">
                <h1 className="text-2xl font-bold">Adress</h1>

                {/* Two-column layout: map left, info right (stacks on small screens) */}
                <section className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                    {/* Left: Map */}
                    <div className="w-full">
                        <div className="overflow-hidden rounded-lg shadow">
                            <iframe
                                title="Google Map to Bigarråvägen 10, Falkenberg"
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3717.6355072252554!2d12.536764083726522!3d56.94933122367001!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4651cc73799467c7%3A0x29394ed576414c7!2sBigarr%C3%A5v%C3%A4gen%2010%2C%20311%2095%20Falkenberg!5e0!3m2!1sen!2sse!4v1757169068755!5m2!1sen!2sse"
                                width="600"
                                height="450"
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                                className="block w-full h-[350px] md:h-[450px]"
                            />
                        </div>
                    </div>

                    {/* Right: Short explanation with a simple paragraph */}
                    <div className="w-full">
                        <div className="rounded-lg border p-4 shadow-sm bg-white/60">
                            <h2 className="text-lg font-semibold mb-2">Hitta hit</h2>
                            <p className="leading-relaxed">
                                Huset ligger på Bigarråvägen 10 i Falkenberg.<br/>
                                Det är lättare att köra till &#39;Hällerupsvägen 17&#39; och svänga in på grusvägen
                                där. <br/>
                                Huset är grönt med svart tak längst in på grusvägen.
                            </p>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );

}