"use client";
import Link from "next/link";
import {usePathname} from "next/navigation";

const links = [
    {href: "/", label: "Hem"},
    {href: "/availability", label: "Kalender"},
    {href: "/chat", label: "Gruppchatt"}
];

export default function Nav() {
    const pathname = usePathname();
    return (
        <nav
            className="w-full max-w-3xl mx-auto flex gap-2 flex-wrap items-center justify-center sm:justify-between py-4">
            <Link href={"/"}>
                <div className="font-bold text-lg">🎉 Kräftskiva</div>
            </Link>

            <ul className="flex gap-2">
                {links.map((l) => {
                    const active = pathname === l.href;
                    return (
                        <li key={l.href}>
                            <Link
                                href={l.href}
                                className={`px-3 py-1 rounded-full border text-sm transition-colors ${
                                    active
                                        ? "bg-foreground text-background border-transparent"
                                        : "border-black/10 dark:border-white/20 hover:bg-black/5 dark:hover:bg-white/10"
                                }`}
                            >
                                {l.label}
                            </Link>
                        </li>
                    );
                })}
            </ul>
        </nav>
    );
}
