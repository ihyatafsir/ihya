import Link from 'next/link';
import { getBooks } from '../../lib/api';

export default function BooksPage() {
    const books = getBooks();

    return (
        <main className="min-h-screen p-8 sm:p-12 lg:p-16">
            <header className="max-w-4xl mx-auto mb-20">
                <div className="inline-block px-4 py-1 mb-6 border-y border-gold-premium/40 text-gold-premium uppercase tracking-[0.3em] text-xs font-semibold">
                    The Library
                </div>
                <h1 className="text-5xl md:text-7xl font-serif font-black mb-6 text-emerald-deep tracking-tight">
                    Ihya <span className="italic font-normal">Ulum-id-Din</span>
                </h1 >
                <p className="text-xl text-stone-600 font-serif leading-relaxed max-w-2xl">
                    The complete 40 books of Imam al-Ghazali's magnum opus, organized by volume and subject matter.
                </p>
            </header>

            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {books.map((book) => (
                    <Link
                        key={book.id}
                        href={`/book/${book.id}`}
                        className="group"
                    >
                        <div className="bg-white border border-stone-200/60 rounded-2xl p-8 shadow-sm hover:shadow-2xl hover:-translate-y-1 hover:border-gold-premium/50 transition-all duration-500 ease-out h-full flex flex-col">
                            <div className="flex justify-between items-start mb-6">
                                <div className="px-3 py-1 bg-emerald-deep/5 rounded-full text-[10px] uppercase tracking-widest font-black text-emerald-deep">
                                    Volume {book.vol}
                                </div>
                                <div className="text-gold-premium opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span className="text-xl">→</span>
                                </div>
                            </div>
                            <h2 className="text-2xl font-serif font-bold text-stone-800 mb-2 group-hover:text-emerald-deep transition-colors leading-tight">
                                {book.title}
                            </h2>
                            {book.arabic_title && (
                                <div className="arabic-text text-xl text-stone-500 mb-4" dir="rtl">
                                    {book.arabic_title}
                                </div>
                            )}
                            <div className="mt-auto pt-6 border-t border-stone-100 flex items-center gap-2">
                                <span className="text-[10px] uppercase tracking-widest text-stone-400 font-bold">
                                    View Commentary
                                </span>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            <footer className="mt-32 text-center text-stone-400 font-serif italic text-sm border-t border-stone-200 pt-12 max-w-4xl mx-auto">
                "The Revivification of the Sciences of Religion"
            </footer>
        </main>
    );
}
