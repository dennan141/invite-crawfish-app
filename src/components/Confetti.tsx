"use client";
import {useEffect, useRef, useState} from "react";

type Piece = {
    id: number;
    left: number;     // percentage 0-100
    delay: number;    // seconds
    duration: number; // seconds
    size: number;     // px
    color: string;
    rotation: number; // deg
};

const COLORS = ["#ff3b3b", "#ffb800", "#30d158", "#64d2ff", "#5856d6", "#ff2d55"];

interface ConfettiProps {
    count?: number;
    startOnMount?: boolean;
}

export default function Confetti({count = 120, startOnMount = true}: ConfettiProps) {
    const [active, setActive] = useState(false);                 // start inactive for SSR match
    const piecesRef = useRef<Piece[]>([]);

    // Build pieces only on the client after mount (and when count changes)
    useEffect(() => {
        const arr: Piece[] = [];
        for (let i = 0; i < count; i++) {
            arr.push({
                id: i,
                left: Math.random() * 100,
                delay: Math.random() * 1.5,
                duration: 3 + Math.random() * 2,
                size: 6 + Math.random() * 10,
                color: COLORS[i % COLORS.length],
                rotation: Math.random() * 360,
            });
        }
        piecesRef.current = arr;
    }, [count]);

    // Start animation after mount if requested
    useEffect(() => {
        if (startOnMount) setActive(true);
    }, [startOnMount]);

    // Auto-stop after 5s
    useEffect(() => {
        if (!active) return;
        const t = setTimeout(() => setActive(false), 5000);
        return () => clearTimeout(t);
    }, [active]);

    return (
        <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden>
            {active && (
                <div className="absolute inset-0">
                    {piecesRef.current.map((p) => (
                        <span
                            key={p.id}
                            style={{
                                position: "absolute",
                                top: -20, // px
                                left: `${p.left}%`,
                                width: p.size,
                                height: p.size,
                                backgroundColor: p.color,
                                transform: `rotate(${p.rotation}deg)`,
                                animation: `fall ${p.duration}s linear ${p.delay}s forwards, spin ${p.duration}s linear ${p.delay}s`,
                                opacity: 0.9,
                            }}
                        />
                    ))}
                </div>
            )}

            <style jsx global>{`
                @keyframes fall {
                    0% {
                        transform: translateY(-10vh) rotate(0deg);
                        opacity: 1;
                    }
                    100% {
                        transform: translateY(110vh) rotate(360deg);
                        opacity: 1;
                    }
                }

                @keyframes spin {
                    0% {
                        filter: hue-rotate(0deg);
                    }
                    100% {
                        filter: hue-rotate(180deg);
                    }
                }
            `}</style>
        </div>
    );
}
