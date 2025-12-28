import Link from 'next/link';
import { getSurahs } from '../lib/api';

export default function Home() {
  const surahs = getSurahs();

  return (
    <main className="min-h-screen p-8 sm:p-12 lg:p-16">
      <header className="max-w-4xl mx-auto mb-20 text-center">
        <div className="inline-block px-4 py-1 mb-6 border-y border-gold-premium/40 text-gold-premium uppercase tracking-[0.3em] text-xs font-semibold">
          Majlis Ihya Ulum-id-Din
        </div>
        <h1 className="text-5xl md:text-7xl font-serif font-black mb-6 text-emerald-deep tracking-tight">
          Tafsir <span className="italic font-normal">al-Ihya</span>
        </h1>
        <p className="text-xl text-stone-600 font-serif leading-relaxed max-w-2xl mx-auto">
          Explore the Quran through the spiritual insights and ethical commentaries of Imam al-Ghazali.
        </p>
      </header>

      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {surahs.map((surah) => (
          <Link
            key={surah.id}
            href={`/surah/${surah.id}`}
            className="group outline-hidden focus:ring-2 focus:ring-gold-premium/50 rounded-xl"
          >
            <div className="h-full bg-white border border-stone-200/60 rounded-xl p-6 shadow-sm group-hover:shadow-2xl group-hover:-translate-y-1 group-hover:border-gold-premium/50 transition-all duration-500 ease-out flex items-center gap-6">
              <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-full bg-emerald-deep/5 text-emerald-deep font-serif font-bold group-hover:bg-gold-premium group-hover:text-white transition-colors duration-300">
                {surah.id}
              </div>
              <div className="flex-grow">
                <div className="flex justify-between items-start mb-1">
                  <h2 className="text-xl font-serif font-bold text-stone-800 group-hover:text-emerald-deep transition-colors">
                    {surah.ename}
                  </h2>
                  <span className="arabic-text text-xl text-emerald-deep/60 group-hover:text-gold-premium transition-colors">
                    {surah.name}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase tracking-widest text-stone-400 font-bold">
                    {surah.ayahs} Verses
                  </span>
                  {surah.matchesCount > 0 && (
                    <span className="text-[10px] uppercase tracking-widest text-gold-premium font-bold">
                      • {surah.matchesCount} Commentaries
                    </span>
                  )}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <footer className="mt-32 text-center text-stone-400 font-serif italic text-sm border-t border-stone-200 pt-12 max-w-4xl mx-auto">
        Organized chronologically as in the Noble Quran.
      </footer>
    </main>
  );
}
