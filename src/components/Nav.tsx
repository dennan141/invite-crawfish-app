"use client";
import Link from "next/link";
import {usePathname} from "next/navigation";

const links = [
    {href: "/", label: "Hem"},
    {href: "/adress", label: "Adress"},
    {href: "/information", label: "Information"},
    {href: "/chat", label: "Gruppchatt"}
];

export default function Nav() {
    const pathname = usePathname();
    return (
        <div className="w-full bg-red-50/80 backdrop-blur sticky top-0 z-40 shadow-sm">
            <nav
                className="w-full max-w-5xl mx-auto flex gap-3 flex-wrap items-center justify-center sm:justify-between py-6 px-4">
                <Link href={"/"}>
                    <div className="font-bold text-xl">🎉 Kräftskiva</div>
                </Link>

                <ul className="flex gap-2">
                    {links.map((l) => {
                        const active = pathname === l.href;
                        return (
                            <li key={l.href}>
                                <Link
                                    href={l.href}
                                    className={`px-4 py-2 rounded-full border text-sm transition-colors ${
                                        active
                                            ? "bg-red-600 text-white border-transparent"
                                            : "border-red-300 hover:bg-yellow-200/70 bg-yellow-100/50"
                                    }`}
                                >
                                    {l.label}
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </nav>
        </div>
    );
}
