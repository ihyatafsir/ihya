import fs from 'fs';
import path from 'path';
import { Book, ProcessedBook, Verse } from './types';

// Data is in ../../../data/processed relative to this file (web/lib/api.ts) -> web/lib/../.. -> web/.. -> ihyatafsir/data
// But actually path resolution in Next.js server components can be tricky.
// Better to use absolute path or process.cwd()
// process.cwd() in Next.js is usually the project root (web).
// So data is at ../data/processed

const DATA_DIR = path.join(process.cwd(), '../data/processed');

export function getBooks(): Book[] {
    if (!fs.existsSync(DATA_DIR)) return [];

    const files = fs.readdirSync(DATA_DIR);
    // We look for .txt files as the main entry, assuming corresponding .json exists
    // Format: vol{vol}_Vol{V}-book-{N}.doc.txt

    const books: Book[] = [];

    files.forEach(file => {
        if (file.endsWith('.txt')) {
            const id = file.replace('.doc.txt', '').replace('.txt', ''); // Normalize id
            // Extract vol number
            const volMatch = file.match(/vol(\d+)_/);
            const vol = volMatch ? parseInt(volMatch[1]) : 0;

            // Extract nice title
            // vol1_Vol1-book-1 -> Book 1 (Vol 1)
            const bookNumMatch = file.match(/book-(\d+)/);
            const bookNum = bookNumMatch ? bookNumMatch[1] : '?';

            books.push({
                id,
                title: `Book ${bookNum} (Vol ${vol})`,
                vol,
                path: file
            });
        }
    });

    // Sort by Vol then Book
    return books.sort((a, b) => {
        if (a.vol !== b.vol) return a.vol - b.vol;
        // Extract book num again for sorting or strict string compare
        return a.id.localeCompare(b.id, undefined, { numeric: true });
    });
}

export function getBook(id: string): ProcessedBook | null {
    const txtPath = path.join(DATA_DIR, `${id}.doc.txt`);
    const jsonPath = path.join(DATA_DIR, `${id}.doc_verses.json`);

    if (!fs.existsSync(txtPath)) {
        // Try without .doc if normalization changed
        const txtPathAlt = path.join(DATA_DIR, `${id}.txt`);
        if (!fs.existsSync(txtPathAlt)) return null;
        // ... would need to handle alt path
    }

    const raw_text = fs.readFileSync(txtPath, 'utf-8');
    let verses: Verse[] = [];

    if (fs.existsSync(jsonPath)) {
        const jsonContent = fs.readFileSync(jsonPath, 'utf-8');
        verses = JSON.parse(jsonContent);
    }

    return {
        id,
        raw_text,
        verses
    };
}
