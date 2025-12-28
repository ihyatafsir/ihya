import Link from 'next/link';
import { getSurah, getTafsirIndex } from '../../../lib/api';

export async function generateStaticParams() {
    const index = getTafsirIndex();
    return Object.keys(index).map((id) => ({
        id: id,
    }));
}

export default async function SurahPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const surah = getSurah(id);

    if (!surah) {
        return <div className="p-20 text-center font-serif text-stone-400">Surah not found</div>;
    }

    return (
        <div className="min-h-screen pb-32">
            <nav className="bg-white/80 backdrop-blur-md border-b border-stone-200 p-6 sticky top-0 z-50 shadow-sm">
                <div className="max-w-5xl mx-auto flex justify-between items-center">
                    <Link href="/" className="text-emerald-deep hover:text-gold-premium transition-colors font-serif font-semibold flex items-center gap-2">
                        <span className="text-lg">←</span> Surah Index
                    </Link>
                    <div className="text-center">
                        <div className="text-[10px] uppercase tracking-widest text-gold-premium font-bold mb-0.5">Surah {id}</div>
                        <h1 className="text-2xl font-serif font-black text-stone-800">{surah.ename} <span className="arabic-text ml-4 text-emerald-deep/40 font-normal">{surah.name}</span></h1>
                    </div>
                    <div className="w-24"></div> {/* Spacer */}
                </div>
            </nav>

            <main className="max-w-4xl mx-auto mt-12 px-6">
                <div className="space-y-4">
                    {Object.entries(surah.verses).sort(([a], [b]) => parseInt(a) - parseInt(b)).map(([aIdx, ayah]) => {
                        const matchCount = ayah.matches.length;
                        const hasMatches = matchCount > 0;

                        return (
                            <Link
                                key={aIdx}
                                href={hasMatches ? `/ayah/${id}/${aIdx}` : '#'}
                                className={`block p-6 rounded-xl border transition-all duration-300 ${hasMatches
                                        ? "bg-white border-stone-200 shadow-sm hover:shadow-md hover:border-gold-premium/50 group"
                                        : "bg-stone-50/50 border-stone-100 opacity-60 pointer-events-none opacity-40"
                                    }`}
                            >
                                <div className="flex justify-between items-start gap-8">
                                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-xs font-serif font-bold text-stone-400 group-hover:bg-gold-premium group-hover:text-white transition-colors">
                                        {aIdx}
                                    </div>
                                    <div className="flex-grow text-right">
                                        <p className="arabic-text text-3xl text-stone-800 leading-[1.8] mb-4">
                                            {ayah.text}
                                        </p>
                                        {hasMatches && (
                                            <div className="flex items-center justify-end gap-2">
                                                <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-gold-premium">
                                                    {matchCount} Commentary {matchCount === 1 ? 'Link' : 'Links'} in Ihya
                                                </span>
                                                <span className="text-gold-premium transition-transform group-hover:translate-x-1">→</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </main>
        </div>
    );
}
