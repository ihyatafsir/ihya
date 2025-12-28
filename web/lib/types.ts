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
    word_start: number;
    word_end: number;
}

export interface BookMetadata {
    id: string;
    title: string;
    arabic_title?: string;
    vol: number;
}

export interface Book {
    id: string;
    title: string;
    arabic_title?: string;
    vol: number;
    raw_text: string;
    verses: Verse[];
}
