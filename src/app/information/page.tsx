"use client";
import Nav from "@/components/Nav";

export default function InformationPage() {
  return (
    <div className="min-h-screen p-6">
      <Nav/>
      <main className="max-w-5xl mx-auto mt-8 space-y-6">
        <header className="text-center space-y-2">
          <h1 className="text-2xl font-bold">Information</h1>
          <p className="opacity-80">Här kan vi lägga in bilder och information om kräftskivan.</p>
        </header>

        <section className="grid md:grid-cols-3 gap-4">
          <figure className="rounded-xl overflow-hidden border bg-white/60">
            <img src="/CrayfishOnTable.webp" alt="Kräftor på bordet" className="w-full h-48 object-cover"/>
            <figcaption className="p-3 text-sm opacity-80">Stämningsbild</figcaption>
          </figure>
          <figure className="rounded-xl overflow-hidden border bg-white/60">
            <img src="/PeopleCheering.webp" alt="Glada människor" className="w-full h-48 object-cover"/>
            <figcaption className="p-3 text-sm opacity-80">Glädje och fest</figcaption>
          </figure>
          <figure className="rounded-xl overflow-hidden border bg-white/60">
            <img src="/InsctructionsOnPeeling.png" alt="Instruktioner för skalning" className="w-full h-48 object-contain bg-white"/>
            <figcaption className="p-3 text-sm opacity-80">Instruktioner på skalning</figcaption>
          </figure>
        </section>

        <section className="rounded-xl border p-4 bg-white/60 space-y-2">
          <h2 className="font-semibold">Detaljer</h2>
          <ul className="list-disc pl-6 text-sm">
            <li>Ta med gott humör och sångbok.</li>
            <li>Allergier? Meddela värden i förväg.</li>
            <li>Dresscode: Somrigt och festligt.</li>
          </ul>
        </section>
      </main>
    </div>
  );
}