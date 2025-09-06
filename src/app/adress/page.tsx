"use client";
import {useEffect, useRef, useState} from "react";
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
    return () => { ignore = true; };
  }, []);

  useEffect(() => {
    let map: any;
    let Lmod: any;
    let cssEl: HTMLLinkElement | null = null;
    (async () => {
      if (!mapRef.current) return;
      // Inject Leaflet CSS via CDN to avoid build-time CSS config
      cssEl = document.createElement('link');
      cssEl.rel = 'stylesheet';
      cssEl.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      cssEl.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
      cssEl.crossOrigin = '';
      document.head.appendChild(cssEl);

      // Dynamically import leaflet from the npm package (no SSR)
      const L = await import('leaflet');
      Lmod = L;

      // Fix default marker icons when bundling
      L.Icon.Default.mergeOptions({
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      const lat = typeof party?.latitude === 'number' ? party!.latitude! : 59.3293; // Stockholm default
      const lng = typeof party?.longitude === 'number' ? party!.longitude! : 18.0686;
      const label = party?.address_text || 'Plats för kräftskivan';

      map = L.map(mapRef.current).setView([lat, lng], 13);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      const marker = L.marker([lat, lng]).addTo(map);
      marker.bindPopup(label).openPopup();
    })();
    return () => {
      try {
        if (map && map.remove) map.remove();
      } catch {}
      if (cssEl) document.head.removeChild(cssEl);
    };
  }, [party]);

  return (
    <div className="min-h-screen p-6">
      <Nav/>
      <main className="max-w-5xl mx-auto mt-8 space-y-4">
        <h1 className="text-2xl font-bold">Adress</h1>
        {party?.address_text && (
          <p className="opacity-80">{party.address_text}</p>
        )}
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="rounded-xl border overflow-hidden bg-white/60">
          <div ref={mapRef} style={{height: 420, width: '100%'}}/>
        </div>
        <p className="text-xs opacity-70">Kartan använder OpenStreetMap-tiles och Leaflet.</p>
      </main>
    </div>
  );
}