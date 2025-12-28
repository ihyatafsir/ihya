import Link from 'next/link';
import { getLibraryStructure } from '../../lib/api';

export default function BooksPage() {
    const quarters = getLibraryStructure();

    return (
        <main className="min-h-screen p-8 sm:p-12 lg:p-16">
            <header className="max-w-4xl mx-auto mb-20">
                <div className="inline-block px-4 py-1 mb-6 border-y border-gold-premium/40 text-gold-premium uppercase tracking-[0.3em] text-xs font-semibold">
                    The Library
                </div>
                <h1 className="text-5xl md:text-7xl font-serif font-black mb-6 text-emerald-deep tracking-tight">
                    Ihya <span className="italic font-normal">Ulum-id-Din</span>
                </h1>
                <p className="text-xl text-stone-600 font-serif leading-relaxed max-w-2xl">
                    The complete 40 books of Imam al-Ghazali's magnum opus, organized into the four traditional quarters.
                </p>
            </header>

            <div className="max-w-7xl mx-auto space-y-24">
                {quarters.map((quarter) => (
                    <section key={quarter.id} className="relative">
                        <div className="flex flex-col md:flex-row md:items-end gap-4 mb-12 border-b border-stone-200 pb-8">
                            <div className="flex-1">
                                <span className="text-gold-premium font-serif italic text-lg block mb-1">
                                    Quarter {quarter.id}
                                </span>
                                <h2 className="text-3xl md:text-4xl font-serif font-black text-emerald-deep">
                                    {quarter.title}
                                </h2>
                            </div>
                            <div className="arabic-text text-3xl md:text-4xl text-stone-400" dir="rtl">
                                {quarter.arabic_title}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {quarter.books.map((book) => (
                                <Link
                                    key={book.id}
                                    href={`/book/${book.id}`}
                                    className="group"
                                >
                                    <div className="bg-white border border-stone-200/60 rounded-xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-gold-premium/50 transition-all duration-500 ease-out h-full flex flex-col">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="px-2 py-0.5 bg-emerald-deep/5 rounded-full text-[9px] uppercase tracking-widest font-black text-emerald-deep">
                                                Book {book.global_id}
                                            </div>
                                            <div className="text-gold-premium opacity-0 group-hover:opacity-100 transition-opacity">
                                                <span className="text-lg">→</span>
                                            </div>
                                        </div>
                                        <h3 className="text-xl font-serif font-bold text-stone-800 mb-1 group-hover:text-emerald-deep transition-colors leading-tight">
                                            {book.title}
                                        </h3>
                                        {book.arabic_title && (
                                            <div className="arabic-text text-lg text-stone-400" dir="rtl">
                                                {book.arabic_title}
                                            </div>
                                        )}
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </section>
                ))}
            </div>

            <footer className="mt-32 text-center text-stone-400 font-serif italic text-sm border-t border-stone-200 pt-12 max-w-4xl mx-auto">
                "The Revivification of the Sciences of Religion"
            </footer>
        </main>
    );
}
