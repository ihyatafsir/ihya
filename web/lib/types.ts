export interface Verse {
    original_file: string;
    vol: number;
    surah: string;
    surah_idx: number | null;
    ayah_start: number;
    ayah_end: number;
    text_matched: string; // The Arabic text segment in the book
    translation: string;
    key: string; // "Surah:Ayah"
}

export interface Book {
    id: string;
    title: string;
    vol: number;
    path: string;
}

export interface ProcessedBook {
    id: string;
    raw_text: string;
    verses: Verse[];
}
