import { getBook, getBooks } from '../../../lib/api';
import Link from 'next/link';
import { Suspense } from 'react';
import ReaderText from '../../components/ReaderText';

// Generate static params for all books
export async function generateStaticParams() {
    const books = getBooks();
    return books.map((book) => ({
        id: book.id,
    }));
}

export default async function BookPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const book = getBook(id);

    if (!book) {
        return (
            <div className="min-h-screen flex items-center justify-center font-serif text-stone-500">
                Book not found
            </div>
        );
    }

    const tokens = book.raw_text.split(/\s+/);
    const verseMap: Record<number, any[]> = {};
    book.verses.forEach(v => {
        if (!verseMap[v.word_start]) {
            verseMap[v.word_start] = [];
        }
        verseMap[v.word_start].push(v);
    });

    return (
        <div className="min-h-screen pb-32">
            <nav className="bg-white/80 backdrop-blur-md border-b border-stone-200 p-6 sticky top-0 z-50 shadow-sm">
                <div className="max-w-5xl mx-auto flex justify-between items-center">
                    <Link href="/books" className="text-emerald-deep hover:text-gold-premium transition-colors font-serif font-semibold flex items-center gap-2">
                        <span className="text-lg">←</span> Library
                    </Link>
                    <div className="text-center">
                        <div className="text-[10px] uppercase tracking-widest text-gold-premium font-bold mb-0.5">Volume {book.vol}</div>
                        <h1 className="text-xl font-serif font-black text-stone-800">{book.title}</h1>
                        {book.arabic_title && (
                            <div className="arabic-text text-2xl text-stone-500 mt-1" dir="rtl">
                                {book.arabic_title}
                            </div>
                        )}
                    </div>
                    <div className="w-20"></div> {/* Spacer for symmetry */}
                </div>
            </nav>

            <main className="max-w-4xl mx-auto mt-16 px-6 sm:px-12">
                <article className="prose prose-stone lg:prose-xl mx-auto">
                    <Suspense fallback={<div className="text-center font-serif text-stone-400">Loading text...</div>}>
                        <ReaderText tokens={tokens} verseMap={verseMap} />
                    </Suspense>
                </article>
            </main>
        </div>
    );
}

