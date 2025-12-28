import { getBook, getBooks } from '../../lib/api';
import Link from 'next/link';
import ReaderText from '../../components/ReaderText';

// Generate static params for all books
export async function generateStaticParams() {
    const books = getBooks();
    return books.map((book) => ({
        id: book.id,
    }));
}

export default async function BookPage({ params }: { params: Promise<{ id: string }> }) {
    // Await params in Next 15+
    const { id } = await params;
    const book = getBook(id);

    if (!book) {
        return <div>Book not found</div>;
    }

    // Process text to inject verse markers
    // We need to split text into words and reconstruct
    // But doing this naively might break formatting (newlines etc).
    // The extract_text from docx returns paragraphs joined by \n.
    // We can split by whitespace to match the "Word Index" from Matcher.
    // Matcher logic: terms = inStr.split() - splits by whitespace.

    // Strategy:
    // 1. Split text by whitespace to get token list.
    // 2. Iterate tokens. If token index is in a verse range, wrap it or append verse info.
    // 3. Rejoin. 
    // Caveat: split() loses original whitespace (tabs, newlines). 
    // If we only render tokens joined by space, we lose paragraph structure.

    // Better Strategy for Reader:
    // Render verses interleaved? Or just render the raw text paragraphs and try to highlight?
    // Since we don't have character indices, exact highlighting is hard if we preserve formatting.
    // However, `extract_text` just dumped text. It didn't preserve much formatting anyway.
    // Let's try to preserve paragraphs if possible.

    // For now, let's just render the text tokenized, because the Matcher operated on the flat text.
    const tokens = book.raw_text.split(/\s+/);

    // Create a map of word_index -> Verse[]
    const verseMap: Record<number, any[]> = {};
    book.verses.forEach(v => {
        // Mark the start word of the verse
        if (!verseMap[v.word_start]) {
            verseMap[v.word_start] = [];
        }
        verseMap[v.word_start].push(v);
    });

    return (
        <div className="min-h-screen bg-amber-50 font-serif">
            <nav className="bg-emerald-900 text-amber-50 p-4 sticky top-0 z-50 shadow-md">
                <div className="max-w-5xl mx-auto flex justify-between items-center">
                    <Link href="/" className="hover:text-emerald-200">← Back to Library</Link>
                    <h1 className="text-lg font-bold truncate ml-4">{id}</h1> {/* Better title needed */}
                </div>
            </nav>

            <div className="max-w-3xl mx-auto p-8 leading-loose text-xl text-right" dir="rtl">
                {tokens.map((token, index) => {
                    const versesStartingHere = verseMap[index];
                    const isVerseStart = !!versesStartingHere;

                    return (
                        <span key={index} className="relative inline-block ml-1">
                            {isVerseStart && (
                                <span className="absolute -top-8 right-0 bg-emerald-100 text-emerald-800 text-xs px-2 py-1 rounded shadow-sm whitespace-nowrap z-10 border border-emerald-300">
                                    {versesStartingHere.map(v => v.key).join(', ')}
                                </span>
                            )}

                            <span className={isVerseStart ? "bg-emerald-100/50 rounded px-0.5" : ""}>
                                {token}
                            </span>

                            {/* 
                    If we want to show translation inline, we could do it here.
                    But popovers might be better.
                  */}
                        </span>
                    );
                })}
            </div>
        </div>
    );
}
