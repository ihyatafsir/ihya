import fs from 'fs';
import path from 'path';
import { Book, Verse, BookMetadata, Quarter, PlusEntry } from './types';

const DATA_DIR = path.join(process.cwd(), '..', 'data');
const PROCESSED_DIR = path.join(DATA_DIR, 'processed');
const TRANSLATIONS_DIR = path.join(DATA_DIR, 'translations');

export interface TafsirMatch {
    book_id: string;
    vol: number;
    word_start: number;
    word_end: number;
    verse_in_text: string;
    translation: string;
}

export interface Ayah {
    text: string;
    matches: TafsirMatch[];
}

export interface Surah {
    name: string;
    tname: string;
    ename: string;
    ayahs: number;
    verses: Record<string, Ayah>;
}

export type TafsirIndex = Record<string, Surah>;

let cachedIndex: TafsirIndex | null = null;

export function getTafsirIndex(): TafsirIndex {
    if (cachedIndex) return cachedIndex;
    const indexPath = path.join(DATA_DIR, 'quran_tafsir_index.json');
    if (!fs.existsSync(indexPath)) return {};
    const data = fs.readFileSync(indexPath, 'utf-8');
    cachedIndex = JSON.parse(data);
    return cachedIndex!;
}

let cachedMetadata: Record<string, any> | null = null;
export function getMetadata(): Record<string, any> {
    if (cachedMetadata) return cachedMetadata;
    const metadataPath = path.join(DATA_DIR, 'book_metadata.json');
    if (!fs.existsSync(metadataPath)) return {};
    cachedMetadata = JSON.parse(fs.readFileSync(metadataPath, 'utf-8'));
    return cachedMetadata!;
}

let cachedTranslations: Record<string, string> | null = null;
export function getQuranTranslation(surah: number | string, ayah: number | string): string {
    if (!cachedTranslations) {
        const transPath = path.join(TRANSLATIONS_DIR, 'abdel_haleem.txt');
        if (fs.existsSync(transPath)) {
            const lines = fs.readFileSync(transPath, 'utf-8').split('\n');
            cachedTranslations = {};
            lines.forEach(line => {
                const parts = line.split('|');
                if (parts.length >= 3) {
                    cachedTranslations![`${parts[0]}:${parts[1]}`] = parts[2];
                }
            });
        } else {
            return '';
        }
    }
    return cachedTranslations[`${surah}:${ayah}`] || '';
}

export function getSurahs() {
    const index = getTafsirIndex();
    return Object.entries(index).map(([id, surah]) => {
        let matchesCount = 0;
        Object.values(surah.verses).forEach(v => {
            matchesCount += v.matches.length;
        });
        return {
            id,
            name: surah.name,
            ename: surah.ename,
            tname: surah.tname,
            ayahs: surah.ayahs,
            matchesCount
        };
    });
}

export function getSurah(id: string): Surah | null {
    const index = getTafsirIndex();
    return index[id] || null;
}

export function getAyah(surahId: string, ayahId: string): Ayah | null {
    const surah = getSurah(surahId);
    if (!surah) return null;
    return surah.verses[ayahId] || null;
}

export function getSnippet(bookId: string, wordStart: number, wordEnd: number, contextWords: number = 50): string {
    // Some IDs might come in without .doc, append if missing
    const fullId = bookId.endsWith('.doc') ? bookId : `${bookId}.doc`;
    const textPath = path.join(PROCESSED_DIR, `${fullId}.txt`);

    if (!fs.existsSync(textPath)) {
        console.error(`Snippet file not found: ${textPath}`);
        return '';
    }

    try {
        const rawText = fs.readFileSync(textPath, 'utf-8');
        // Use a more robust split that matches the Python indexing logic (whitespace)
        const words = rawText.split(/\s+/);

        const start = Math.max(0, wordStart - contextWords);
        const end = Math.min(words.length, wordEnd + contextWords);

        const snippet = words.slice(start, end).join(' ');
        return snippet;
    } catch (e) {
        console.error(`Error reading snippet for ${bookId}:`, e);
        return '';
    }
}

export function getBooks(): BookMetadata[] {
    const metadata = getMetadata();
    const books = Object.values(metadata).map((m: any) => ({
        id: m.id,
        title: m.english_title || m.id,
        arabic_title: m.arabic_title,
        vol: m.vol
    }));

    if (books.length > 0) return books.sort((a, b) => {
        const ga = metadata[a.id]?.global_id;
        const gb = metadata[b.id]?.global_id;
        if (ga !== undefined && gb !== undefined) return ga - gb;
        if (a.vol !== b.vol) return a.vol - b.vol;
        return a.id.localeCompare(b.id, undefined, { numeric: true });
    }).map(b => ({
        ...b,
        global_id: metadata[b.id]?.global_id
    }));

    // Fallback if metadata.json is missing
    if (!fs.existsSync(PROCESSED_DIR)) return [];
    const files = fs.readdirSync(PROCESSED_DIR);
    const bookFiles = files.filter(f => f.endsWith('_verses.json'));

    return bookFiles.map(f => {
        const id = f.replace('_verses.json', '');
        const parts = id.split('_');
        const vol = parts[0].replace('vol', '');
        return {
            id,
            title: parts.slice(1).join(' ').replace('.doc', ''),
            vol: parseInt(vol)
        };
    }).sort((a, b) => {
        if (a.vol !== b.vol) return a.vol - b.vol;
        return a.id.localeCompare(b.id, undefined, { numeric: true });
    });
}

export function getBook(id: string): Book | null {
    const metadataAll = getMetadata();
    const bookMetadata = metadataAll[id];

    const metadataPath = path.join(PROCESSED_DIR, `${id}_verses.json`);
    const textPath = path.join(PROCESSED_DIR, `${id}.txt`);

    if (!fs.existsSync(metadataPath) || !fs.existsSync(textPath)) {
        return null;
    }

    const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf-8'));
    const rawText = fs.readFileSync(textPath, 'utf-8');

    return {
        id,
        title: bookMetadata?.english_title || id,
        arabic_title: bookMetadata?.arabic_title,
        vol: bookMetadata?.vol || metadata[0]?.vol || 0,
        raw_text: rawText,
        verses: metadata
    };
}

let cachedStructure: Record<string, any> | null = null;
export function getBookStructure(id: string): any | null {
    if (!cachedStructure) {
        const structurePath = path.join(DATA_DIR, 'book_structure.json');
        if (!fs.existsSync(structurePath)) return null;
        cachedStructure = JSON.parse(fs.readFileSync(structurePath, 'utf-8'));
    }
    return cachedStructure![id] || null;
}

export function getLibraryStructure(): Quarter[] {
    const books = getBooks();

    const quarters: Quarter[] = [
        { id: 1, title: "Rub' al-'Ibadat (Acts of Worship)", arabic_title: "ربع العبادات", books: [] },
        { id: 2, title: "Rub' al-'Adat (Norms of Daily Life)", arabic_title: "ربع العادات", books: [] },
        { id: 3, title: "Rub' al-Muhlikat (Ways to Perdition)", arabic_title: "ربع المهلكات", books: [] },
        { id: 4, title: "Rub' al-Munjiyat (Ways to Salvation)", arabic_title: "ربع المنجيات", books: [] }
    ];

    books.forEach(book => {
        const gid = book.global_id || 0;
        if (gid >= 1 && gid <= 10) quarters[0].books.push(book);
        else if (gid >= 11 && gid <= 20) quarters[1].books.push(book);
        else if (gid >= 21 && gid <= 30) quarters[2].books.push(book);
        else if (gid >= 31 && gid <= 40) quarters[3].books.push(book);
    });

    return quarters;
}

export function getTafsirPlus(): PlusEntry[] {
    const index = getTafsirIndex();
    const result: PlusEntry[] = [];

    Object.entries(index).forEach(([sId, surah]) => {
        Object.entries(surah.verses).forEach(([aId, ayah]) => {
            if (ayah.matches.length > 0) {
                result.push({
                    surahId: sId,
                    surahName: surah.name,
                    surahEname: surah.ename,
                    ayahId: aId,
                    ayahText: ayah.text,
                    translation: getQuranTranslation(sId, aId),
                    matchesCount: ayah.matches.length
                });
            }
        });
    });

    // Sort by Surah ID then Ayah ID (numerical)
    return result.sort((a, b) => {
        const sidA = parseInt(a.surahId);
        const sidB = parseInt(b.surahId);
        if (sidA !== sidB) return sidA - sidB;
        return parseInt(a.ayahId) - parseInt(b.ayahId);
    });
}
