"use client";
import Nav from "@/components/Nav";
import {useState} from "react";

export default function InformationPage() {
    const [lightbox, setLightbox] = useState<{ src: string; alt: string } | null>(null);

    function open(src: string, alt: string) {
        setLightbox({src, alt});
        playSound();
    }

    const close = () => setLightbox(null);


    function playSound() {
        const audio = new Audio('/500_cigs.m4a');
        audio.play();
    }

    return (
        <div className="min-h-screen p-6">
            <Nav/>
            <main className="max-w-5xl mx-auto mt-8 space-y-6">
                <header className="text-center space-y-2">
                    <h1 className="text-2xl font-bold">Information</h1>
                    <p className="opacity-80">Här kan vi lägga in bilder och information om kräftskivan.</p>
                </header>

                <section className="grid md:grid-cols-3 gap-4">
                    <figure className="rounded-xl overflow-hidden border border-white/20 bg-white/10 cursor-zoom-in"
                            onClick={() => open('/CrayfishOnTable.webp', 'Kräftor på bordet')}>
                        <img src="/CrayfishOnTable.webp" alt="Kräftor på bordet" className="w-full h-48 object-cover"/>
                        <figcaption className="p-3 text-sm opacity-80">Stämningsbild (klicka för att förstora)
                        </figcaption>
                    </figure>
                    <figure className="rounded-xl overflow-hidden border border-white/20 bg-white/10 cursor-zoom-in"
                            onClick={() => open('/PeopleCheering.webp', 'Glada människor')}>
                        <img src="/PeopleCheering.webp" alt="Glada människor" className="w-full h-48 object-cover"/>
                        <figcaption className="p-3 text-sm opacity-80">Glädje och fest (klicka)</figcaption>
                    </figure>
                    <figure className="rounded-xl overflow-hidden border border-white/20 bg-white/10 cursor-zoom-in"
                            onClick={() => open('/InsctructionsOnPeeling.png', 'Instruktioner för skalning')}>
                        <img src="/InsctructionsOnPeeling.png" alt="Instruktioner för skalning"
                             className="w-full h-48 object-contain bg-white"/>
                        <figcaption className="p-3 text-sm opacity-80">Instruktioner på skalning (klicka)</figcaption>
                    </figure>
                </section>

                <section className="rounded-xl border border-white/20 p-4 bg-white/10 space-y-2">
                    <h2 className="font-semibold">Detaljer</h2>
                    <ul className="list-disc pl-6 text-sm">
                        <li>Ta med gott humör och sådär lixom bruh</li>
                        <li>Om ni mot förmodan vill ha snaps eller önskar sprit, skriv det</li>
                        <li>Sovplatser finns de e launa</li>
                        <li>Säg något om det är något mer, så skriver jag ner det här</li>
                    </ul>
                </section>
            </main>

            {lightbox && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={close}>
                    <img
                        src={lightbox.src}
                        alt={lightbox.alt}
                        className="max-h-[90vh] max-w-[90vw] object-contain shadow-2xl rounded-lg"
                        onClick={(e) => e.stopPropagation()}
                    />
                    <button
                        className="absolute top-4 right-4 rounded-full border border-white/40 text-white px-3 py-1"
                        onClick={close}
                        aria-label="Stäng"
                    >
                        ✕
                    </button>
                </div>
            )}
        </div>
    );
}