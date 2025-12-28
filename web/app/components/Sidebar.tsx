'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar() {
    const pathname = usePathname();

    const links = [
        { href: '/', label: 'Surah Index', icon: '📖' },
        { href: '/books', label: 'Ihya Books', icon: '📚' },
        // { href: '/search', label: 'Search', icon: '🔍' },
    ];

    return (
        <aside className="fixed left-0 top-0 bottom-0 w-64 bg-emerald-deep text-white/90 z-20 hidden lg:flex flex-col border-r border-gold-premium/30">
            <div className="p-8 pb-12">
                <div className="text-gold-premium font-serif font-black text-2xl tracking-tighter mb-1">
                    Ihya <span className="italic font-normal">Tafsir</span>
                </div>
                <div className="text-[10px] uppercase tracking-[0.3em] text-white/40 font-bold">
                    Majlis al-Ghazali
                </div>
            </div>

            <nav className="flex-grow px-4 space-y-2">
                {links.map((link) => {
                    const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`flex items-center gap-4 px-6 py-4 rounded-xl transition-all duration-300 group ${isActive
                                ? "bg-white/10 text-gold-premium border-l-2 border-gold-premium shadow-lg"
                                : "hover:bg-white/5 text-white/60 hover:text-white"
                                }`}
                        >
                            <span className="text-xl group-hover:scale-110 transition-transform">{link.icon}</span>
                            <span className="font-serif font-semibold tracking-wide">{link.label}</span>
                        </Link>
                    );
                })}
            </nav>

            <div className="p-8 border-t border-white/10">
                <div className="bg-gold-premium/10 rounded-xl p-4 border border-gold-premium/20">
                    <p className="text-[10px] uppercase tracking-widest text-gold-premium font-black mb-2">Scholar's Note</p>
                    <p className="text-xs text-white/60 font-serif italic leading-relaxed">
                        "Knowledge without action is insanity, and action without knowledge is vanity."
                    </p>
                </div>
            </div>
        </aside>
    );
}
