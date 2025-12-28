import Link from 'next/link';
import { getAyah, getSurah, getSnippet, getTafsirIndex, getQuranTranslation, getMetadata } from '../../../../lib/api';

export async function generateStaticParams() {
    const index = getTafsirIndex();
    const params = [];
    for (const [surahId, surah] of Object.entries(index)) {
        for (const ayahId of Object.keys(surah.verses)) {
            params.push({ surah: surahId, ayah: ayahId });
        }
    }
    return params;
}

export default async function AyahPage({ params }: { params: Promise<{ surah: string, ayah: string }> }) {
    const { surah: surahId, ayah: ayahId } = await params;
    const surah = getSurah(surahId);
    const ayah = getAyah(surahId, ayahId);
    const translation = getQuranTranslation(surahId, ayahId);
    const metadata = getMetadata();

    if (!surah || !ayah) {
        return <div className="p-20 text-center font-serif text-stone-400">Verse not found</div>;
    }

    return (
        <div className="min-h-screen pb-32">
            <nav className="bg-white/80 backdrop-blur-md border-b border-stone-200 p-6 sticky top-0 z-50 shadow-sm">
                <div className="max-w-5xl mx-auto flex justify-between items-center">
                    <Link href={`/surah/${surahId}`} className="text-emerald-deep hover:text-gold-premium transition-colors font-serif font-semibold flex items-center gap-2">
                        <span className="text-lg">←</span> {surah.ename}
                    </Link>
                    <div className="text-center">
                        <div className="text-[10px] uppercase tracking-widest text-gold-premium font-bold mb-0.5">Surah {surahId}, Ayah {ayahId}</div>
                    </div>
                    <div className="w-24"></div>
                </div>
            </nav>

            <main className="max-w-4xl mx-auto mt-12 px-6">
                {/* Main Verse Display */}
                <section className="bg-white rounded-2xl border border-stone-200 p-10 shadow-sm mb-12">
                    <div className="text-right mb-8">
                        <p className="arabic-text text-5xl text-emerald-deep leading-[1.8]">
                            {ayah.text}
                        </p>
                    </div>
                    {translation && (
                        <div className="border-t border-stone-100 pt-8">
                            <p className="text-xl text-stone-600 font-serif italic leading-relaxed">
                                {translation}
                            </p>
                            <div className="mt-4 text-[10px] uppercase tracking-widest text-stone-400 font-bold">— M.A.S. Abdel Haleem</div>
                        </div>
                    )}
                </section>

                {/* Commentary Section */}
                <div className="space-y-12">
                    <div className="flex items-center gap-4">
                        <div className="h-px flex-grow bg-stone-200"></div>
                        <h2 className="text-xs uppercase tracking-[0.4em] font-black text-stone-400">Commentary from Ihya</h2>
                        <div className="h-px flex-grow bg-stone-200"></div>
                    </div>

                    {ayah.matches.map((match, idx) => {
                        const snippet = getSnippet(match.book_id, match.word_start, match.word_end);
                        const bookMeta = metadata[match.book_id];
                        const englishTitle = bookMeta?.english_title || match.book_id.split('_').slice(1).join(' ').replace('.doc', '');
                        const arabicTitle = bookMeta?.arabic_title;

                        return (
                            <div key={idx} className="group relative">
                                <div className="absolute -left-4 top-0 bottom-0 w-1 bg-gold-premium/20 group-hover:bg-gold-premium transition-colors rounded-full"></div>
                                <div className="pl-6">
                                    <div className="flex justify-between items-end mb-4">
                                        <div className="flex flex-col gap-1">
                                            <h3 className="text-sm font-serif font-bold text-emerald-deep">
                                                Vol {match.vol} • {englishTitle}
                                            </h3>
                                            {arabicTitle && (
                                                <div className="arabic-text text-lg text-stone-500 leading-none" dir="rtl">
                                                    {arabicTitle}
                                                </div>
                                            )}
                                        </div>
                                        <Link
                                            href={`/book/${match.book_id}?word=${match.word_start}`}
                                            className="text-[10px] uppercase tracking-widest font-bold text-gold-premium hover:text-emerald-deep transition-colors"
                                        >
                                            Read in context →
                                        </Link>
                                    </div>
                                    <div className="bg-stone-50/50 rounded-xl p-8 border border-stone-100 group-hover:bg-white group-hover:border-stone-200 transition-all duration-300">
                                        <p className="arabic-text text-2xl text-stone-700 leading-relaxed text-right dir-rtl">
                                            {snippet ? `...${snippet}...` : "Commentary unavailable at this location. Click 'Read in context' to explore the book."}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </main>
        </div>
    );
}
