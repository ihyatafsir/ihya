import Link from 'next/link';
import { getBooks } from '../lib/api';

export default function Home() {
  const books = getBooks();

  return (
    <main className="min-h-screen bg-stone-50 text-stone-900 font-sans p-8">
      <header className="max-w-4xl mx-auto mb-12 text-center">
        <h1 className="text-4xl font-bold mb-4 tracking-tight text-emerald-900">Ihya Ulum-id-Din</h1>
        <p className="text-lg text-stone-600">The Revival of the Religious Sciences — Tafsir Reader</p>
      </header>

      <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {books.map((book) => (
          <Link
            key={book.id}
            href={`/book/${book.id}`}
            className="block group"
          >
            <div className="h-full bg-white border border-stone-200 rounded-lg p-6 hover:shadow-lg hover:border-emerald-300 transition-all duration-200">
              <div className="text-xs uppercase tracking-wider text-stone-500 mb-2">Volume {book.vol}</div>
              <h2 className="text-xl font-semibold group-hover:text-emerald-700">{book.title}</h2>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
